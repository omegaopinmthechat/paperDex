---
paths:
  - "packages/backend/src/modules/markets/**"
  - "packages/backend/src/modules/oracle/**"
---

# Markets & Oracle modules

## Purpose
- **oracle/** (Phase 5): pulls real-world prices for BTC→BTCP, ETH→ETHP, SOL→SOLP from an external price provider, caches them, and is the backend's single source for "current price." The frontend treats this backend as its canonical market-price API — it never calls a price provider directly.
- **markets/**: serves `GET /api/v1/markets` and `GET /api/v1/markets/:symbol`, backed by the `market_data` table and the oracle cache.

## Files
- `oracle/price.provider.js` — **EXISTS**. Single CoinGecko call fetches `bitcoin,ethereum,solana` → usd + 24h change in one request. Returns `{ bitcoin, ethereum, solana }` map each with `{ price, change24h, fetchedAt }`. Throws `AppError(PRICE_FETCH_FAILED)` on network error, non-200, or malformed response.
- `oracle/price.cache.js` — **EXISTS**. Single shared in-memory TTL cache (20 s) for all three assets — one inflight promise deduplicates concurrent refreshes. Returns `{ ...prices, stale: true }` if refresh fails but prior values exist; throws `PRICE_UNAVAILABLE` if no cache exists at all.
- `oracle/price.service.js` — **EXISTS**. Public interface. `getPrice(symbol)`: BTCP/ETHP/SOLP → real prices via cache; USDTP → hardcoded 1.00; unknown → `MARKET_NOT_FOUND`. Stale → throws `STALE_PRICE`. `getAllPrices()` → returns all four symbols in one call.
- `markets/market.controller.js` — **EXISTS**. `getMarket` handles `GET /:symbol`; `getMarkets` handles `GET /`. Both call service, send `sendSuccess`, pass errors to `next(err)`.
- `markets/market.service.js` — **EXISTS**. `getMarketBySymbol(symbol)` and `getAllMarkets()` — both delegate to `oracle/price.service.js` only.
- `markets/market.routes.js` — **EXISTS**. Mounts `GET /` (all markets) and `GET /:symbol`.
- `markets/market.validator.js` — **EXISTS**. Zod schema whitelisting BTCP, ETHP, SOLP, USDTP for the `:symbol` param.
- `markets/market.repository.js` — **PLANNED**. Not yet needed for price-read path.

## Rules
1. **Trading, portfolio, and markets must all read prices through `oracle/price.service.js`.** Nobody else calls the external provider directly — one source of truth, one place to handle provider failure / staleness.
2. If the price cache is stale past its threshold, return `ERROR_CODES.STALE_PRICE` / `PRICE_UNAVAILABLE` rather than silently serving an old number for a trade quote.

## Lessons learned (this module only)
_(empty)_
