import * as service from './apiKey.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

/**
 * GET /api/v1/api-keys
 * Returns the user's API keys (no secrets).
 */
export const listKeys = async (req, res) => {
  try {
    const { sub: userId } = req.user;
    const data = await service.listApiKeys(userId);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    console.error('[apiKey.controller listKeys]', err);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Failed to list API keys');
  }
};

/**
 * POST /api/v1/api-keys
 * Body (validated): { name, scope, expiresIn }
 * Returns { id, name, scope, expiresAt, createdAt, secret } — secret shown once.
 */
export const createKey = async (req, res) => {
  try {
    const { sub: userId } = req.user;
    const data = await service.createApiKey(userId, req.body);
    sendSuccess(res, data, STATUS_CODES.CREATED);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    console.error('[apiKey.controller createKey]', err);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Failed to create API key');
  }
};

/**
 * DELETE /api/v1/api-keys/:id
 * Revokes a key immediately.
 */
export const revokeKey = async (req, res) => {
  try {
    const { sub: userId } = req.user;
    await service.revokeApiKey(req.params.id, userId);
    sendSuccess(res, { revoked: true, id: req.params.id });
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    console.error('[apiKey.controller revokeKey]', err);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Failed to revoke API key');
  }
};
