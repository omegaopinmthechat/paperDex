import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validation.middleware.js';
import { orderSchema } from './validators/order.validator.js';
import { tradeSchema } from './validators/trade.validator.js';
import { getQuote, executeTrade } from './trading.controller.js';

const router = Router();

// All trading routes require authentication
router.post('/quote',   authMiddleware, validate(orderSchema), getQuote);
router.post('/execute', authMiddleware, validate(tradeSchema), executeTrade);

export default router;
