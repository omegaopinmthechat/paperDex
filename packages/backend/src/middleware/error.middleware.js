import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }
  sendError(
    res,
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected error occurred'
  );
};

export default errorMiddleware;
