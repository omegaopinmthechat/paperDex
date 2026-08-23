import { getPrice, getAllPrices } from '../oracle/price.service.js';

export const getMarketBySymbol = async (symbol) => getPrice(symbol);

export const getAllMarkets = async () => getAllPrices();
