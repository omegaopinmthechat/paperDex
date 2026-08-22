import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { sendError } from '../utils/response.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return sendError(res, STATUS_CODES.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, 'Missing token');
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? ERROR_CODES.TOKEN_EXPIRED : ERROR_CODES.INVALID_TOKEN;
    sendError(res, STATUS_CODES.UNAUTHORIZED, code, err.message);
  }
};

export default authMiddleware;
