import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import marketRoutes from '../modules/markets/market.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/markets', marketRoutes);

export default router;
