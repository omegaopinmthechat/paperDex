import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const unauthorized = (code = ERROR_CODES.UNAUTHORIZED, message = 'Unauthorized') =>
  new AppError(STATUS_CODES.UNAUTHORIZED, code, message);

export const badRequest = (code = ERROR_CODES.BAD_REQUEST, message = 'Bad request') =>
  new AppError(STATUS_CODES.BAD_REQUEST, code, message);
