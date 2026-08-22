import * as authService from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

export const getNonce = async (req, res) => {
  try {
    const data = await authService.requestNonce(req.body.walletAddress);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body.walletAddress, req.body.signature);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Login failed');
  }
};
