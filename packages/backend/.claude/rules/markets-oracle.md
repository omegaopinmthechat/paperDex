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
- `oracle/price.provider.js` — **PLANNED**. The only file that calls the external price API.
- `oracle/price.service.js` — **PLANNED**. Business logic sitting in front of the provider + cache; every other module reads prices through this, not through `price.provider.js` directly.
- `oracle/price.cache.js` — **PLANNED**. Short-lived in-memory (or Supabase-backed) cache to avoid hammering the external provider; needs a staleness check feeding `ERROR_CODES.STALE_PRICE`.
- `markets/market.controller.js`, `market.service.js`, `market.repository.js`, `market.routes.js`, `market.validator.js` — **PLANNED**. Standard controller→service→repository layering; `market.repository.js` is the only file querying `market_data`.

## Rules
1. **Trading, portfolio, and markets must all read prices through `oracle/price.service.js`.** Nobody else calls the external provider directly — one source of truth, one place to handle provider failure / staleness.
2. If the price cache is stale past its threshold, return `ERROR_CODES.STALE_PRICE` / `PRICE_UNAVAILABLE` rather than silently serving an old number for a trade quote.

## Lessons learned (this module only)
_(empty)_
