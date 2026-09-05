import * as tradingService from './trading.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

/**
 * POST /api/v1/trade/quote
 * Body (validated): { token, side, amount }
 * Auth: req.user = { sub: userId, wallet: walletAddress }
 */
export const getQuote = async (req, res) => {
  try {
    const { sub: userId, wallet: walletAddress } = req.user;
    const data = await tradingService.getQuote(userId, walletAddress, req.body);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.QUOTE_FAILED, 'Quote generation failed');
  }
};

/**
 * POST /api/v1/trade/execute
 * Body (validated): { quoteId, userSignature }
 * Auth: req.user = { sub: userId, wallet: walletAddress }
 */
export const executeTrade = async (req, res) => {
  try {
    const { sub: userId, wallet: walletAddress } = req.user;
    const data = await tradingService.executeTrade(userId, walletAddress, req.body);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.TRADE_FAILED, 'Trade execution failed');
  }
};
