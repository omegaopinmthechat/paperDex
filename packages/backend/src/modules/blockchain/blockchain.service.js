import { ethers } from 'ethers';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

/**
 * Returns an ethers.Contract connected to the given signer or provider.
 */
export const getContractInstance = (address, abi, signerOrProvider) =>
  new ethers.Contract(address, abi, signerOrProvider);

/**
 * Maps known PaperDEX custom revert error names to AppError instances.
 * Catches the raw ethers error, inspects errorName, and throws a typed AppError.
 * Falls through to a generic TRADE_FAILED if the error is unrecognised.
 */
export const parseContractError = (err) => {
  const name = err?.errorName ?? err?.reason ?? '';

  const map = {
    QuoteExpired: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.QUOTE_EXPIRED, 'Quote has expired'],
    NonceAlreadyUsed: [STATUS_CODES.CONFLICT, ERROR_CODES.NONCE_ALREADY_USED, 'Nonce already used'],
    InvalidQuoteSignature: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.INVALID_QUOTE_SIGNATURE, 'Invalid quote signature'],
    InvalidUserSignature: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.INVALID_USER_SIGNATURE, 'Invalid user signature'],
    UnsupportedToken: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.UNSUPPORTED_TOKEN, 'Token is not supported'],
    InsufficientVaultLiquidity: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.LIQUIDITY_UNAVAILABLE, 'Insufficient vault liquidity'],
    InvalidAmount: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.INVALID_TRADE_AMOUNT, 'Invalid trade amount'],
    InvalidPrice: [STATUS_CODES.BAD_REQUEST, ERROR_CODES.INVALID_TRADE, 'Invalid price'],
    EnforcedPause: [STATUS_CODES.SERVICE_UNAVAILABLE, ERROR_CODES.DEX_UNAVAILABLE, 'DEX is paused'],
  };

  const entry = map[name];
  if (entry) return new AppError(...entry);

  return new AppError(
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.TRADE_FAILED,
    err?.message ?? 'Trade execution failed',
  );
};
