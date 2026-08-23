import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import { getPortfolioHandler } from './portfolio.controller.js';

const router = Router();

router.get('/', authMiddleware, getPortfolioHandler);

export default router;
