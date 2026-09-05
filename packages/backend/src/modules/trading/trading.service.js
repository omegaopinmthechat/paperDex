import { ethers } from 'ethers';
import { createRequire } from 'module';
import { generateQuote } from './quote.service.js';
import * as repo from './trading.repository.js';
import * as dexService from '../blockchain/dex.service.js';
import { insertTransaction } from '../blockchain/blockchain.repository.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const require = createRequire(import.meta.url);
const sepolia = require('../../../../contracts/deployments/sepolia.json');

// ── EIP-712 constants (mirrors quote.service.js — kept local for verification) ──

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

// Token symbol → on-chain address map
const TOKEN_ADDRESSES = {
  BTCP: sepolia.contracts.BTCP,
  ETHP: sepolia.contracts.ETHP,
  SOLP: sepolia.contracts.SOLP,
  USDTP: sepolia.contracts.USDTP,
};

// PRICE_SCALE = 1e8 (matches contract)
const PRICE_SCALE = 100_000_000n;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Delegates to quote.service.generateQuote. Kept here so the controller
 * has a single import for all trading operations.
 */
export const getQuote = async (userId, walletAddress, { token, side, amount }) => {
  return generateQuote({ userId, walletAddress, token, side, amount });
};

/**
 * Validates a user-signed quote and relays the trade to chain.
 *
 * Pre-checks (in order):
 *  1. Quote exists in DB
 *  2. Deadline not passed
 *  3. Nonce not already used (on-chain read)
 *  4. quoteSignature valid (recover → must equal relayerWallet.address)
 *  5. userSignature valid (recover → must equal walletAddress)
 *  6. Call dex.service.executeTrade → get txHash
 *  7. Insert trade + transaction records
 */
export const executeTrade = async (userId, walletAddress, { quoteId, userSignature }) => {
  // 1. Fetch quote from DB
  let quote;
  try {
    quote = await repo.getQuoteById(quoteId);
  } catch {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      ERROR_CODES.TRADE_NOT_FOUND,
      'Quote not found',
    );
  }

  if (!quote) {
    throw new AppError(STATUS_CODES.NOT_FOUND, ERROR_CODES.TRADE_NOT_FOUND, 'Quote not found');
  }

  // Ensure this quote belongs to the authenticated user
  if (quote.user_id !== userId) {
    throw new AppError(STATUS_CODES.FORBIDDEN, ERROR_CODES.FORBIDDEN, 'Quote does not belong to this user');
  }

  const tokenAddress = TOKEN_ADDRESSES[quote.token];
  const nonce    = BigInt(quote.nonce);
  const deadline = BigInt(quote.deadline);
  const price    = BigInt(Math.round(parseFloat(quote.price) * 1e8));
  const amount   = ethers.parseUnits(quote.amount, 18);
  const sideUint8 = quote.side === 'BUY' ? 0 : 1;

  // 2. Check deadline
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  if (nowSec > deadline) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.QUOTE_EXPIRED,
      'Quote deadline has passed',
    );
  }

  // 3. Check nonce on-chain (fast-fail before spending gas)
  const nonceUsed = await dexService.isNonceUsed(walletAddress, nonce);
  if (nonceUsed) {
    throw new AppError(
      STATUS_CODES.CONFLICT,
      ERROR_CODES.NONCE_ALREADY_USED,
      'Trade nonce has already been used',
    );
  }

  // 4. Reconstruct the EIP-712 message and hash for verification
  const message = {
    token:    tokenAddress,
    price:    price.toString(),
    amount:   amount.toString(),
    side:     sideUint8,
    user:     walletAddress,
    nonce:    nonce.toString(),
    deadline: deadline.toString(),
  };

  // Verify quoteSignature → must recover to the relayer/quoteSigner address
  let recoveredQuoteSigner;
  try {
    recoveredQuoteSigner = ethers.verifyTypedData(EIP712_DOMAIN, EIP712_TYPES, message, quote.quote_signature);
  } catch {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.INVALID_QUOTE_SIGNATURE,
      'Quote signature verification failed',
    );
  }

  if (recoveredQuoteSigner.toLowerCase() !== sepolia.quoteSigner.toLowerCase()) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.INVALID_QUOTE_SIGNATURE,
      'Quote was not signed by the authorised quote signer',
    );
  }

  // 5. Verify userSignature → must recover to the authenticated walletAddress
  let recoveredUser;
  try {
    recoveredUser = ethers.verifyTypedData(EIP712_DOMAIN, EIP712_TYPES, message, userSignature);
  } catch {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.INVALID_USER_SIGNATURE,
      'User signature verification failed',
    );
  }

  if (recoveredUser.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.INVALID_USER_SIGNATURE,
      'User signature does not match authenticated wallet',
    );
  }

  // 6. Execute on-chain via relayer
  const { txHash, blockNumber } = await dexService.executeTrade({
    token:          tokenAddress,
    price,
    amount,
    side:           sideUint8,
    user:           walletAddress,
    nonce,
    deadline,
    quoteSignature: quote.quote_signature,
    userSignature,
  });

  // 7. USD value for record-keeping
  const usdAmountWei = (amount * price) / PRICE_SCALE;
  const usdAmountStr = ethers.formatUnits(usdAmountWei, 18);
  const amountStr    = ethers.formatUnits(amount, 18);

  // Insert trade record
  const trade = await repo.insertTrade({
    userId,
    token:     quote.token,
    side:      quote.side,
    amount:    amountStr,
    price:     quote.price,
    usdAmount: usdAmountStr,
    nonce,
    txHash,
    status:    'CONFIRMED',
  });

  // Insert blockchain transaction record (direction: DEBIT = user spends, CREDIT = user receives)
  const direction = quote.side === 'BUY' ? 'DEBIT' : 'CREDIT';
  await insertTransaction({
    userId,
    txHash,
    type:        'TRADE',
    token:       quote.token,
    direction,
    amount:      amountStr,
    status:      'CONFIRMED',
    blockNumber,
  });

  return { txHash, blockNumber, trade };
};
