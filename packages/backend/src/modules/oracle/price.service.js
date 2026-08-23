import { getCachedPrices } from './price.cache.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

// Maps paper-token symbol → CoinGecko key in the cached prices object
const SYMBOL_MAP = {
  BTCP: 'bitcoin',
  ETHP: 'ethereum',
  SOLP: 'solana',
  USDTP: 'tether',
};

const buildResult = (symbol, entry = {}, stale = false) => {
  if (stale) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.STALE_PRICE,
      `${symbol} price data is stale — provider unreachable`
    );
  }

  const isUsdtp = symbol === 'USDTP';

  return {
    symbol,
    price: isUsdtp ? 1.00 : (entry.price ?? 1.00),
    change1h: isUsdtp ? 0.0 : (entry.change1h ?? 0),
    change24h: isUsdtp ? 0.0 : (entry.change24h ?? 0),
    change7d: isUsdtp ? 0.0 : (entry.change7d ?? 0),
    marketCap: isUsdtp ? (entry.marketCap || 120000000000) : (entry.marketCap ?? 0),
    totalVolume: isUsdtp ? (entry.totalVolume || 50000000000) : (entry.totalVolume ?? 0),
    high24h: isUsdtp ? 1.00 : (entry.high24h ?? entry.price),
    low24h: isUsdtp ? 1.00 : (entry.low24h ?? entry.price),
    circulatingSupply: entry.circulatingSupply ?? 0,
    totalSupply: entry.totalSupply ?? 0,
    ath: isUsdtp ? 1.00 : (entry.ath ?? entry.price),
    atl: isUsdtp ? 1.00 : (entry.atl ?? entry.price),
    image: entry.image || '',
    sparkline7d: isUsdtp
      ? Array(168).fill(1.0)
      : (Array.isArray(entry.sparkline7d) ? entry.sparkline7d : []),
    fetchedAt: entry.fetchedAt || Date.now(),
    stale: false,
  };
};

export const getPrice = async (symbol) => {
  const upper = symbol.toUpperCase();
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
    buildResult('BTCP', prices.bitcoin, stale),
    buildResult('ETHP', prices.ethereum, stale),
    buildResult('SOLP', prices.solana, stale),
    buildResult('USDTP', prices.tether, stale),
  ];
};
