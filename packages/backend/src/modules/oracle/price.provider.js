import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';
import env from '../../config/env.js';

const extract = (json, id) => {
  const price = json?.[id]?.usd;
  const change24h = json?.[id]?.usd_24h_change ?? null;
  if (typeof price !== 'number' || price <= 0) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.PRICE_FETCH_FAILED,
      `CoinGecko response missing expected ${id}.usd field`
    );
  }
  return { price, change24h };
};

// Returns { bitcoin, ethereum, solana } each with { price, change24h, fetchedAt }
export const fetchAllPrices = async () => {
  let res;
  try {
    res = await fetch(env.COINGECKO_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.PRICE_FETCH_FAILED,
      `CoinGecko unreachable: ${err.message}`
    );
  }

  if (!res.ok) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.PRICE_FETCH_FAILED,
      `CoinGecko returned HTTP ${res.status}`
    );
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.PRICE_FETCH_FAILED,
      'CoinGecko response was not valid JSON'
    );
  }

  const fetchedAt = Date.now();
  return {
    bitcoin: { ...extract(json, 'bitcoin'), fetchedAt },
    ethereum: { ...extract(json, 'ethereum'), fetchedAt },
    solana: { ...extract(json, 'solana'), fetchedAt },
  };
};
