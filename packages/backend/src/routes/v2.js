import { Router } from 'express';
import { z } from 'zod';
import apiKeyAuthMiddleware from '../middleware/apiKeyAuth.middleware.js';
import { readLimiter, tradeLimiter } from '../middleware/rateLimitApi.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { getAllMarkets, getMarketBySymbol } from '../modules/markets/market.service.js';
import { getPortfolio } from '../modules/portfolio/portfolio.service.js';
import { executeApiTrade } from '../modules/apiKeys/apiTrade.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AppError } from '../utils/errors.js';
import STATUS_CODES from '../constants/statusCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

const router = Router();

// ── All /api/v2 routes require API key auth ───────────────────────────────────
router.use(apiKeyAuthMiddleware);

// ── Scope guard helper ────────────────────────────────────────────────────────
const requireScope = (requiredScope) => (req, res, next) => {
  if (req.apiKey.scope !== requiredScope && req.apiKey.scope !== 'TRADE') {
    return sendError(
      res,
      STATUS_CODES.FORBIDDEN,
      ERROR_CODES.API_KEY_SCOPE_DENIED,
      `This endpoint requires the '${requiredScope}' scope. Your key has scope '${req.apiKey.scope}'.`,
    );
  }
  next();
};

// ── Trade order validator ─────────────────────────────────────────────────────
const SUPPORTED_TOKENS = ['BTCP', 'ETHP', 'SOLP'];
const VALID_SIDES = ['BUY', 'SELL'];

const tradeOrderSchema = z.object({
  token: z.enum(SUPPORTED_TOKENS, {
    errorMap: () => ({ message: `token must be one of: ${SUPPORTED_TOKENS.join(', ')}` }),
  }),
  side: z.enum(VALID_SIDES, {
    errorMap: () => ({ message: 'side must be BUY or SELL' }),
  }),
  amount: z
    .string()
    .min(1, 'amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'amount must be a positive number string (e.g. "0.1")',
    }),
});

// ── GET /api/v2/markets ───────────────────────────────────────────────────────
router.get('/markets', readLimiter, async (req, res) => {
  try {
    const data = await getAllMarkets();
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch markets');
  }
});

// ── GET /api/v2/markets/:symbol ───────────────────────────────────────────────
router.get('/markets/:symbol', readLimiter, async (req, res) => {
  try {
    const data = await getMarketBySymbol(req.params.symbol.toUpperCase());
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch market');
  }
});

// ── GET /api/v2/portfolio ─────────────────────────────────────────────────────
router.get('/portfolio', readLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.apiKey;
    const data = await getPortfolio(walletAddress);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch portfolio');
  }
});

// ── POST /api/v2/trade ────────────────────────────────────────────────────────
router.post('/trade', tradeLimiter, requireScope('TRADE'), validate(tradeOrderSchema), async (req, res) => {
  try {
    const { userId, walletAddress } = req.apiKey;
    const data = await executeApiTrade(userId, walletAddress, req.body);
    sendSuccess(res, data);
  } catch (err) {
    if (err instanceof AppError) return sendError(res, err.statusCode, err.code, err.message);
    console.error('[v2 POST /trade]', err);
    sendError(res, STATUS_CODES.INTERNAL_SERVER_ERROR, ERROR_CODES.TRADE_FAILED, err.message || 'Trade execution failed');
  }
});


export default router;
