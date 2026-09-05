import { ethers } from 'ethers';
import { createRequire } from 'module';
import { relayerWallet } from '../../infrastructure/blockchain/wallet.js';
import { getPrice } from '../oracle/price.service.js';
import { isSupportedToken } from '../blockchain/dex.service.js';
import * as repo from './trading.repository.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const require = createRequire(import.meta.url);
const sepolia = require('../../../../contracts/deployments/sepolia.json');

// ── EIP-712 constants ─────────────────────────────────────────────────────────

const EIP712_DOMAIN = {
  name: 'PaperDEX',
  version: '1',
  chainId: 11155111,
  verifyingContract: sepolia.contracts.PaperDEX,
};

const EIP712_TYPES = {
  Trade: [
    { name: 'token',    type: 'address' },
    { name: 'price',    type: 'uint256' },
    { name: 'amount',   type: 'uint256' },
    { name: 'side',     type: 'uint8'   },
    { name: 'user',     type: 'address' },
    { name: 'nonce',    type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

// Token symbol → on-chain address map (from deployments)
const TOKEN_ADDRESSES = {
  BTCP: sepolia.contracts.BTCP,
  ETHP: sepolia.contracts.ETHP,
  SOLP: sepolia.contracts.SOLP,
  USDTP: sepolia.contracts.USDTP,
};

// PRICE_SCALE = 1e8 (matches contract constant)
const PRICE_SCALE = 100_000_000n;

// Deadline: 5 minutes from quote generation
const DEADLINE_SECONDS = 300n;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generates a collision-resistant nonce (bigint).
 * Combines unix-ms timestamp + random 6-digit suffix.
 */
const generateNonce = () =>
  BigInt(Date.now()) * 1_000_000n + BigInt(Math.floor(Math.random() * 1_000_000));

/**
 * Returns unix timestamp (seconds) as bigint, DEADLINE_SECONDS from now.
 */
const generateDeadline = () =>
  BigInt(Math.floor(Date.now() / 1000)) + DEADLINE_SECONDS;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generates a signed EIP-712 quote for a requested trade.
 *
 * @param {object} params
 * @param {string} params.userId       - UUID of the authenticated user
 * @param {string} params.walletAddress - Checksummed wallet address of the user
 * @param {string} params.token         - Token symbol: 'BTCP' | 'ETHP' | 'SOLP'
 * @param {string} params.side          - 'BUY' | 'SELL'
 * @param {string} params.amount        - Token amount as decimal string (e.g. "0.001")
 *
 * @returns {object} Quote data including quoteId, quoteSignature, and EIP-712 fields
 *                   the frontend needs to construct the MetaMask userSignature request.
 */
export const generateQuote = async ({ userId, walletAddress, token, side, amount }) => {
  const tokenAddress = TOKEN_ADDRESSES[token];

  // 1. Verify token is supported on-chain (wrap raw ethers errors → AppError)
  let supported;
  try {
    supported = await isSupportedToken(tokenAddress);
  } catch (err) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.BLOCKCHAIN_UNAVAILABLE,
      `Sepolia RPC unreachable — check SEPOLIA_RPC_URL: ${err.message}`,
    );
  }
  if (!supported) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.UNSUPPORTED_TOKEN,
      `Token ${token} is not supported by the DEX`,
    );
  }

  // 2. Fetch oracle price (throws STALE_PRICE / MARKET_NOT_FOUND on failure)
  const priceData = await getPrice(token);
  const priceFloat = priceData.price;

  // 3. Compute scaled values (all bigint for contract compatibility)
  const priceScaled = BigInt(Math.round(priceFloat * 1e8));         // uint256, 8 decimals
  const amountWei   = ethers.parseUnits(amount, 18);                // uint256, 18 decimals
  const sideUint8   = side === 'BUY' ? 0 : 1;                       // uint8
  const nonce       = generateNonce();                               // uint256
  const deadline    = generateDeadline();                            // uint256

  // 4. USD value: (amount * price) / PRICE_SCALE — all in 18-decimal units
  const usdAmountWei = (amountWei * priceScaled) / PRICE_SCALE;
  const usdAmountStr = ethers.formatUnits(usdAmountWei, 18);

  // 5. Build EIP-712 message (values must be string/number — no bigint in JSON)
  const message = {
    token: tokenAddress,
    price:    priceScaled.toString(),
    amount:   amountWei.toString(),
    side:     sideUint8,
    user:     walletAddress,
    nonce:    nonce.toString(),
    deadline: deadline.toString(),
  };

  // 6. Quote signer signs (relayerWallet === quoteSigner per deployments/sepolia.json)
  let quoteSignature;
  try {
    quoteSignature = await relayerWallet.signTypedData(EIP712_DOMAIN, EIP712_TYPES, message);
  } catch (err) {
    throw new AppError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_CODES.QUOTE_FAILED,
      `Quote signing failed: ${err.message}`,
    );
  }

  // 7. Persist to quotes table
  const quoteRow = await repo.insertQuote({
    userId,
    token,
    side,
    amount,
    price: priceFloat,
    nonce,
    deadline,
    quoteSignature,
  });

  // 8. Return everything the frontend needs
  return {
    quoteId: quoteRow.id,
    token,
    side,
    amount,
    price: priceFloat,
    usdAmount: usdAmountStr,
    nonce:    nonce.toString(),
    deadline: deadline.toString(),
    quoteSignature,
    // These three fields let the frontend reconstruct eth_signTypedData_v4
    eip712Domain:  EIP712_DOMAIN,
    eip712Types:   EIP712_TYPES,
    eip712Message: message,
  };
};
