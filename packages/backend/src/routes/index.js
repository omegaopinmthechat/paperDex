import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import marketRoutes from '../modules/markets/market.routes.js';
import portfolioRoutes from '../modules/portfolio/portfolio.routes.js';
import tradeRoutes from '../modules/trading/trading.routes.js';
import apiKeyRoutes from '../modules/apiKeys/apiKey.routes.js';
import terminalRoutes from '../modules/terminal/terminal.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/markets', marketRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/trade', tradeRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/terminal', terminalRoutes);

export default router;


