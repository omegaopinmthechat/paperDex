---
paths:
  - "packages/backend/src/modules/trading/**"
---

# Trading module — quote, sign, relay

## Flow (dev plan Phases 6-9 — implement to match this)
1. **Quote** (`POST /api/v1/trade/quote`): get real price from oracle → validate trade → calculate USDTP value → create nonce → set deadline → build EIP-712 trade data → quote signer signs it → return quote to client.
2. **User signature** (Phase 7): frontend gets the quote, has MetaMask produce an EIP-712 `userSignature`, sends it back.
3. **Execute** (`POST /api/v1/trade/execute`, Phase 8): backend now holds `quoteSignature` + `userSignature`; hands both to the relayer, which pays gas and settles through the vault. The user never needs Sepolia ETH.

## Files
- `trading.routes.js` — **PLANNED**.
- `trading.controller.js` — **PLANNED**. Thin, standard pattern.
- `trading.service.js` — **PLANNED**. Orchestrates quote validation, signature checks, and calls into the blockchain module for execution. Does not talk to ethers.js directly — that's the blockchain module's job.
- `quote.service.js` — **PLANNED**. The only file that produces EIP-712 quote data and calls the quote signer. Owns nonce + deadline generation for quotes.
- `trading.repository.js` — **PLANNED**. `trades` / `quotes` table access only.
- `validators/trade.validator.js`, `validators/order.validator.js` — **PLANNED**. Amount, slippage, token-pair, side validation before anything reaches the service layer.

## Rules
1. `quote.service.js` is the only place EIP-712 quote signing happens.
2. Before calling the blockchain module to execute, `trading.service.js` must verify: quote signature valid, user signature valid, deadline not passed, nonce not already used. Any gap here is a replay-protection issue — root-§5 ask-first, don't guess at the check.
3. Prices used in a quote come from `oracle/price.service.js` only (see markets-oracle.md) — never fetch price data directly in this module.

## Lessons learned (this module only)
_(empty)_
