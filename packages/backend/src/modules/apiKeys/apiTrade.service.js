import { ethers } from 'ethers';
import { createRequire } from 'module';
import { generateQuote } from '../trading/quote.service.js';
import * as repo from '../trading/trading.repository.js';
import { insertTransaction } from '../blockchain/blockchain.repository.js';
import { relayerWallet } from '../../infrastructure/blockchain/wallet.js';
import { sendAndWait } from '../blockchain/relayer.service.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const require = createRequire(import.meta.url);
const sepolia = require('../../contracts/deployments/sepolia.json');

const TOKEN_ADDRESSES = {
  BTCP:  sepolia.contracts.BTCP,
  ETHP:  sepolia.contracts.ETHP,
  SOLP:  sepolia.contracts.SOLP,
  USDTP: sepolia.contracts.USDTP,
};

const VAULT_ADDRESS = sepolia.contracts.PaperDEXVault;
const PRICE_SCALE   = 100_000_000n;

const TOKEN_ABI = [
  'function exchangeTransferFrom(address from, address to, uint256 amount) external',
  'function balanceOf(address account) view returns (uint256)',
];

const VAULT_ABI = [
  'function sendToken(address token, address to, uint256 amount) external',
  'function getBalance(address token) view returns (uint256)',
];

// Contracts connected with relayer signer (which has EXCHANGE_ROLE)
const usdtpContract = new ethers.Contract(TOKEN_ADDRESSES.USDTP, TOKEN_ABI, relayerWallet);
const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, relayerWallet);

/**
 * Execute a trade atomically via API key auth.
 *
 * Designed for programmatic bots / external clients:
 * - Authentic identity verified via API Key (pdx_id / pdx_secret)
 * - Relayer uses verified EXCHANGE_ROLE to move simulated assets between user and vault
 * - 100% on-chain verifiable on Sepolia testnet
 * - Updates Postgres trade & transaction records
 *
 * @param {string} userId        - UUID of the user
 * @param {string} walletAddress - User's Ethereum wallet address
 * @param {object} params        - { token, side, amount }
 */
export const executeApiTrade = async (userId, walletAddress, { token, side, amount }) => {
  const tokenAddress = TOKEN_ADDRESSES[token];
  if (!tokenAddress) {
    throw new AppError(STATUS_CODES.BAD_REQUEST, ERROR_CODES.UNSUPPORTED_TOKEN, `Unsupported token: ${token}`);
  }

  // 1. Generate guaranteed price quote (relayer-signed quote stored in DB)
  const quoteData = await generateQuote({ userId, walletAddress, token, side, amount });

  const priceBigInt   = BigInt(Math.round(quoteData.price * 1e8));
  const amountWei     = ethers.parseUnits(amount, 18);
  const usdAmountWei  = (amountWei * priceBigInt) / PRICE_SCALE;
  const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, relayerWallet);

  let txResult;

  if (side === 'BUY') {
    // 2a. Pre-flight balance check: User must have enough USDTP
    const userUsdtBalance = await usdtpContract.balanceOf(walletAddress);
    if (userUsdtBalance < usdAmountWei) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.INSUFFICIENT_BALANCE,
        `Insufficient USDTP balance. Required: ${ethers.formatUnits(usdAmountWei, 18)} USDTP, available: ${ethers.formatUnits(userUsdtBalance, 18)} USDTP.`,
      );
    }

    // 2b. Vault liquidity check: Vault must have enough of the asset token
    const vaultTokenBalance = await tokenContract.balanceOf(VAULT_ADDRESS);
    if (vaultTokenBalance < amountWei) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.LIQUIDITY_UNAVAILABLE,
        `Vault has insufficient ${token} liquidity.`,
      );
    }

    // 3a. Move USDTP from user to Vault
    await sendAndWait(
      usdtpContract.exchangeTransferFrom(walletAddress, VAULT_ADDRESS, usdAmountWei),
    );

    // 3b. Send asset token from Vault to user
    txResult = await sendAndWait(
      vaultContract.sendToken(tokenAddress, walletAddress, amountWei),
    );
  } else if (side === 'SELL') {
    // 2a. Pre-flight balance check: User must have enough of the asset token
    const userTokenBalance = await tokenContract.balanceOf(walletAddress);
    if (userTokenBalance < amountWei) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.INSUFFICIENT_BALANCE,
        `Insufficient ${token} balance. Required: ${amount} ${token}, available: ${ethers.formatUnits(userTokenBalance, 18)} ${token}.`,
      );
    }

    // 2b. Vault liquidity check: Vault must have enough USDTP
    const vaultUsdtBalance = await usdtpContract.balanceOf(VAULT_ADDRESS);
    if (vaultUsdtBalance < usdAmountWei) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.LIQUIDITY_UNAVAILABLE,
        'Vault has insufficient USDTP liquidity.',
      );
    }

    // 3a. Move asset token from user to Vault
    await sendAndWait(
      tokenContract.exchangeTransferFrom(walletAddress, VAULT_ADDRESS, amountWei),
    );

    // 3b. Send USDTP from Vault to user
    txResult = await sendAndWait(
      vaultContract.sendToken(TOKEN_ADDRESSES.USDTP, walletAddress, usdAmountWei),
    );
  } else {
    throw new AppError(STATUS_CODES.BAD_REQUEST, ERROR_CODES.INVALID_TRADE, 'Invalid trade side. Must be BUY or SELL.');
  }

  const { txHash, blockNumber } = txResult;
  const usdAmountStr = ethers.formatUnits(usdAmountWei, 18);
  const amountStr    = ethers.formatUnits(amountWei, 18);

  // 4. Record Trade in database
  await repo.insertTrade({
    userId,
    token,
    side,
    amount:    amountStr,
    price:     quoteData.price,
    usdAmount: usdAmountStr,
    nonce:     quoteData.nonce,
    txHash,
    status:    'CONFIRMED',
  });

  // 5. Record Transaction in ledger
  const direction = side === 'BUY' ? 'DEBIT' : 'CREDIT';
  await insertTransaction({
    userId,
    txHash,
    type:        'TRADE',
    token,
    direction,
    amount:      amountStr,
    status:      'CONFIRMED',
    blockNumber,
  });

  return {
    txHash,
    blockNumber,
    token,
    side,
    amount:   amountStr,
    price:    quoteData.price,
    usdValue: parseFloat(usdAmountStr).toFixed(2),
  };
};
