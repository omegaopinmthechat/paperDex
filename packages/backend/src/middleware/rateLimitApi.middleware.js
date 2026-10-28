import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import { sendError } from '../utils/response.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

/**
 * Per-API-key rate limiter factory.
 *
 * When env.RATE_LIMIT_ENABLED === false, both exported limiters are
 * no-op middleware (call next() immediately) — flip RATE_LIMIT_ENABLED=false
 * in .env and restart the server to disable all limits instantly.
 *
 * Rate-limit window key: req.apiKey.keyId (not IP address) so each
 * API key has its own independent bucket.
 */
const makeNoopLimiter = () => (_req, _res, next) => next();

const makeKeyLimiter = ({ windowMs, max, label }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => req.apiKey?.keyId ?? req.ip,
    standardHeaders: true,  // Return RateLimit-* headers
    legacyHeaders: false,
    handler: (_req, res) =>
      sendError(
        res,
        STATUS_CODES.TOO_MANY_REQUESTS,
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded for ${label} endpoint. Retry after the window resets (see Retry-After header).`,
      ),
    skip: (req) => !req.apiKey,  // Safety: if middleware runs without apiKey, skip
  });

// ── Exported limiters ─────────────────────────────────────────────────────────

/**
 * For read endpoints: GET /api/v2/markets, GET /api/v2/portfolio
 * Limit: 300 requests per 15 minutes per API key.
 */
export const readLimiter = env.RATE_LIMIT_ENABLED
  ? makeKeyLimiter({ windowMs: 15 * 60 * 1000, max: 300, label: 'read' })
  : makeNoopLimiter();

/**
 * For trade endpoints: POST /api/v2/trade
 * Limit: 100 requests per 15 minutes per API key.
 */
export const tradeLimiter = env.RATE_LIMIT_ENABLED
  ? makeKeyLimiter({ windowMs: 15 * 60 * 1000, max: 100, label: 'trade' })
  : makeNoopLimiter();
