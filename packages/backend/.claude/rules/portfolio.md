---
paths:
  - "packages/backend/src/modules/portfolio/**"
---

# Portfolio module

## Purpose (dev plan Phase 11)
Portfolio value = live on-chain token balance × real-world price. Balances are read live via `USDTP.balanceOf(user)`, `BTCP.balanceOf(user)`, `ETHP.balanceOf(user)`, `SOLP.balanceOf(user)` through the blockchain module — Supabase may cache/history this data for display, but it is never the source of truth.

## Files
- `portfolio.routes.js`, `portfolio.controller.js` — **PLANNED**. Standard thin pattern.
- `portfolio.service.js` — **PLANNED**. Combines blockchain-module balance reads with `oracle/price.service.js` price data to compute value. Does not call ethers.js directly.
- `portfolio.repository.js` — **PLANNED**. Reads/writes cached portfolio snapshots to Supabase, if that's implemented — never the balance itself as ground truth.

## Rules
1. Never compute or return a portfolio value from Supabase-cached balances alone — always read live balances for the response, use the cache only for history/trend display.
2. Price inputs come from `oracle/price.service.js` (see markets-oracle.md).

## Lessons learned (this module only)
_(empty)_
