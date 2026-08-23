import { getMarketBySymbol, getAllMarkets } from './market.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getMarket = async (req, res, next) => {
  try {
    const data = await getMarketBySymbol(req.params.symbol.toUpperCase());
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const getMarkets = async (req, res, next) => {
  try {
    const data = await getAllMarkets();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
