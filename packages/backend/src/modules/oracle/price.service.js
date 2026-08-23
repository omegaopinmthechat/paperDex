import { getCachedPrices } from './price.cache.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

// Maps paper-token symbol → CoinGecko key in the cached prices object
const SYMBOL_MAP = {
  BTCP: 'bitcoin',
  ETHP: 'ethereum',
  SOLP: 'solana',
};

const USDTP_RESULT = { symbol: 'USDTP', price: 1.00, change24h: 0, stale: false };

const buildResult = (symbol, entry, stale) => {
  if (stale) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.STALE_PRICE,
      `${symbol} price data is stale — provider unreachable`
    );
  }
  return { symbol, price: entry.price, change24h: entry.change24h, fetchedAt: entry.fetchedAt, stale: false };
};

export const getPrice = async (symbol) => {
  const upper = symbol.toUpperCase();

  if (upper === 'USDTP') return USDTP_RESULT;

  const geckoKey = SYMBOL_MAP[upper];
  if (!geckoKey) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      ERROR_CODES.MARKET_NOT_FOUND,
      `Unknown symbol: ${symbol}`
    );
  }

  const { stale, ...prices } = await getCachedPrices();
  return buildResult(upper, prices[geckoKey], stale);
};

export const getAllPrices = async () => {
  const { stale, ...prices } = await getCachedPrices();
  return [
    USDTP_RESULT,
    buildResult('BTCP', prices.bitcoin, stale),
    buildResult('ETHP', prices.ethereum, stale),
    buildResult('SOLP', prices.solana, stale),
  ];
};
