import { sendError } from '../utils/response.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return sendError(
      res,
      STATUS_CODES.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      result.error.issues.map((i) => i.message).join(', ')
    );
  }
  req.body = result.data;
  next();
};

export default validate;
