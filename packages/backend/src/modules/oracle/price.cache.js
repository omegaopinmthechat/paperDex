import { fetchAllPrices } from './price.provider.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const TTL_MS = 20_000; // 20 seconds

// { bitcoin, ethereum, solana } each { price, change24h, fetchedAt }
let cached = null;
let inflight = null;

const isStale = () => !cached || Date.now() - cached.bitcoin.fetchedAt > TTL_MS;

const refresh = () => {
  if (!inflight) {
    inflight = fetchAllPrices()
      .then((fresh) => { cached = fresh; return fresh; })
      .finally(() => { inflight = null; });
  }
  return inflight;
};

// Returns { bitcoin, ethereum, solana, stale: bool }
export const getCachedPrices = async () => {
  if (!isStale()) return { ...cached, stale: false };

  try {
    const fresh = await refresh();
    return { ...fresh, stale: false };
  } catch (err) {
    if (cached) return { ...cached, stale: true };
    if (err instanceof AppError) throw err;
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.PRICE_UNAVAILABLE,
      'Price data unavailable and no cached value exists'
    );
  }
};
