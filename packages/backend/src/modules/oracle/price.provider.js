import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';
import env from '../../config/env.js';

const parseCoinItem = (item) => {
  const price = item?.current_price ?? item?.usd;
  if (typeof price !== 'number' || price <= 0) {
    throw new AppError(
      STATUS_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.PRICE_FETCH_FAILED,
      `CoinGecko response missing valid price for ${item?.id || 'coin'}`
    );
  }

  return {
    price,
    change1h: item?.price_change_percentage_1h_in_currency ?? 0,
    change24h: item?.price_change_percentage_24h_in_currency ?? item?.price_change_percentage_24h ?? item?.usd_24h_change ?? 0,
    change7d: item?.price_change_percentage_7d_in_currency ?? 0,
    marketCap: item?.market_cap ?? 0,
    totalVolume: item?.total_volume ?? 0,
    high24h: item?.high_24h ?? price,
    low24h: item?.low_24h ?? price,
    circulatingSupply: item?.circulating_supply ?? 0,
    totalSupply: item?.total_supply ?? 0,
    ath: item?.ath ?? price,
    atl: item?.atl ?? price,
    image: item?.image ?? '',
    sparkline7d: Array.isArray(item?.sparkline_in_7d?.price) ? item.sparkline_in_7d.price : [],
  };
};

// Returns { bitcoin, ethereum, solana, tether } each with full market data + fetchedAt
export const fetchAllPrices = async () => {
  let res;
  try {
    res = await fetch(env.COINGECKO_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PaperDEX-Backend/1.0',
      },
      signal: AbortSignal.timeout(10000),
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

  // If array response (from /coins/markets)
  if (Array.isArray(json)) {
    const map = {};
    for (const item of json) {
      if (item?.id) {
        map[item.id] = { ...parseCoinItem(item), fetchedAt };
      }
    }

    if (!map.bitcoin || !map.ethereum || !map.solana) {
      throw new AppError(
        STATUS_CODES.SERVICE_UNAVAILABLE,
        ERROR_CODES.PRICE_FETCH_FAILED,
        'CoinGecko response missing essential market data'
      );
    }

    return map;
  }

  // Fallback for simple price endpoint if configured as object { bitcoin: { usd: ... } }
  return {
    bitcoin: {
      price: json?.bitcoin?.usd,
      change1h: 0,
      change24h: json?.bitcoin?.usd_24h_change ?? 0,
      change7d: 0,
      marketCap: 0,
      totalVolume: 0,
      high24h: json?.bitcoin?.usd,
      low24h: json?.bitcoin?.usd,
      circulatingSupply: 0,
      totalSupply: 0,
      ath: json?.bitcoin?.usd,
      atl: json?.bitcoin?.usd,
      image: '',
      sparkline7d: [],
      fetchedAt,
    },
    ethereum: {
      price: json?.ethereum?.usd,
      change1h: 0,
      change24h: json?.ethereum?.usd_24h_change ?? 0,
      change7d: 0,
      marketCap: 0,
      totalVolume: 0,
      high24h: json?.ethereum?.usd,
      low24h: json?.ethereum?.usd,
      circulatingSupply: 0,
      totalSupply: 0,
      ath: json?.ethereum?.usd,
      atl: json?.ethereum?.usd,
      image: '',
      sparkline7d: [],
      fetchedAt,
    },
    solana: {
      price: json?.solana?.usd,
      change1h: 0,
      change24h: json?.solana?.usd_24h_change ?? 0,
      change7d: 0,
      marketCap: 0,
      totalVolume: 0,
      high24h: json?.solana?.usd,
      low24h: json?.solana?.usd,
      circulatingSupply: 0,
      totalSupply: 0,
      ath: json?.solana?.usd,
      atl: json?.solana?.usd,
      image: '',
      sparkline7d: [],
      fetchedAt,
    },
  };
};
