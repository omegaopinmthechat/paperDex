import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import marketRoutes from '../modules/markets/market.routes.js';
import portfolioRoutes from '../modules/portfolio/portfolio.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/markets', marketRoutes);
router.use('/portfolio', portfolioRoutes);

export default router;
