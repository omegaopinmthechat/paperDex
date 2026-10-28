import { validateApiKey } from '../modules/apiKeys/apiKey.service.js';
import { sendError } from '../utils/response.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';
import { AppError } from '../utils/errors.js';

/**
 * Middleware for /api/v2 routes.
 *
 * Expects: Authorization: pdx_id_<16hex>:<pdx_secret_32hex>
 *
 * On success, sets req.apiKey = { userId, walletAddress, scope, keyId }
 * and calls next().
 *
 * On failure, immediately responds with 401 — never calls next().
 */
const apiKeyAuthMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return sendError(res, STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_INVALID, 'Missing Authorization header. Expected: pdx_id_<id>:<secret>');
  }

  // Split on the FIRST colon only — secret contains no colons
  const colonIdx = header.indexOf(':');
  if (colonIdx === -1) {
    return sendError(res, STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_INVALID, 'Malformed Authorization header. Expected: pdx_id_<id>:<secret>');
  }

  const id        = header.slice(0, colonIdx).trim();
  const rawSecret = header.slice(colonIdx + 1).trim();

  if (!id.startsWith('pdx_id_') || !rawSecret.startsWith('pdx_secret_')) {
    return sendError(res, STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_INVALID, 'Invalid API key format. Expected: pdx_id_<id>:<pdx_secret_<secret>');
  }

  try {
    req.apiKey = await validateApiKey(id, rawSecret);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      return sendError(res, err.statusCode, err.code, err.message);
    }
    console.error('[apiKeyAuth.middleware]', err);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'API key validation failed');
  }
};

export default apiKeyAuthMiddleware;
