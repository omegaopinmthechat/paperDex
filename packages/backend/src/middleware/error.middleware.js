import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  console.error('[Unhandled Error]', err);

  // If a JSON SyntaxError slipped through
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400 || 'body' in err)) {
    return sendError(
      res,
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      `Malformed JSON in request body: ${err.message}. Hint: In Windows PowerShell, escape inner double quotes, e.g. -d '{\\"token\\":\\"ETHP\\",\\"side\\":\\"BUY\\",\\"amount\\":\\"0.01\\"}'`
    );
  }

  const statusCode = err?.statusCode || err?.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const code = err?.code || ERROR_CODES.INTERNAL_ERROR;
  const message = err?.reason || err?.shortMessage || err?.message || 'An unexpected error occurred';

  sendError(res, statusCode, code, message);
};

export default errorMiddleware;
