import { Router } from 'express';
import { getMarket, getMarkets } from './market.controller.js';

const router = Router();

router.get('/', getMarkets);
router.get('/:symbol', getMarket);

export default router;
