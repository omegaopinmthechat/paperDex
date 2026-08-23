'use server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Fetches all markets and oracle prices from the backend.
 * Returns array of market objects: [{ symbol, price, change24h, fetchedAt, stale }]
 */
export async function fetchMarkets() {
  try {
    const res = await fetch(`${API}/api/v1/markets`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch markets: HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || 'Failed to fetch market data');
    }

    return { success: true, data: json.data };
  } catch (err) {
    console.error('fetchMarkets error:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Fetches a single market price by token symbol (e.g. 'BTCP', 'ETHP').
 */
export async function fetchMarketBySymbol(symbol) {
  try {
    const res = await fetch(`${API}/api/v1/markets/${encodeURIComponent(symbol.toUpperCase())}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch market ${symbol}: HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || `Failed to fetch market for ${symbol}`);
    }

    return { success: true, data: json.data };
  } catch (err) {
    console.error(`fetchMarketBySymbol(${symbol}) error:`, err.message);
    return { success: false, error: err.message, data: null };
  }
}
