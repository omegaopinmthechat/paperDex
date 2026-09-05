---
paths:
  - "packages/backend/src/modules/trading/**"
---

# Trading module — quote, sign, relay

## Flow
1. **Quote** (`POST /api/v1/trade/quote`): oracle price → EIP-712 Trade struct → quote signer (relayer wallet) signs → quote row persisted to `quotes` table → quote data + EIP-712 fields returned to client.
2. **User signature** (frontend): client reproduces the Trade struct from returned `eip712Domain`/`eip712Types`/`eip712Message`, has MetaMask produce an EIP-712 `userSignature`, sends it back.
3. **Execute** (`POST /api/v1/trade/execute`): backend holds `quoteSignature` + `userSignature`; validates both, checks deadline + on-chain nonce, then relayer submits `PaperDEX.executeTrade()` on the user's behalf. User needs no Sepolia ETH.

## Files — EXISTS

### `trading.routes.js`
Mounts two authenticated+validated routes:
- `POST /quote` → `authMiddleware`, `validate(orderSchema)`, `getQuote`
- `POST /execute` → `authMiddleware`, `validate(tradeSchema)`, `executeTrade`

### `trading.controller.js`
Thin controller with two handlers (`getQuote`, `executeTrade`). Extracts `{ sub: userId, wallet: walletAddress }` from `req.user` (set by `authMiddleware`), delegates to `trading.service`, calls `sendSuccess` / `sendError`.

### `trading.service.js`
Orchestration layer:
- `getQuote(userId, walletAddress, { token, side, amount })` — delegates to `quote.service.generateQuote`.
- `executeTrade(userId, walletAddress, { quoteId, userSignature })` — fetches quote from DB, checks deadline, checks on-chain nonce (`dexService.isNonceUsed`), verifies `quoteSignature` and `userSignature` via `ethers.verifyTypedData`, calls `dexService.executeTrade`, inserts `trades` and `blockchain_transactions` rows.

### `quote.service.js`
The **only** place EIP-712 quote signing happens.
- `generateQuote(...)` — fetches oracle price, validates token is supported on-chain, builds Trade struct with collision-resistant nonce and 5-minute deadline, signs with `relayerWallet.signTypedData`, persists to `quotes` table, returns `{ quoteId, quoteSignature, eip712Domain, eip712Types, eip712Message, ... }`.

### `trading.repository.js`
Supabase access for `quotes` and `trades` tables:
- `insertQuote`, `getQuoteById` — quotes table
- `insertTrade`, `getTradesByUser` — trades table
Nonces and deadlines are stored as text strings (bigint too large for JS number).

### `validators/order.validator.js`
Zod schema (`orderSchema`) for `POST /quote` body: `{ token: 'BTCP'|'ETHP'|'SOLP', side: 'BUY'|'SELL', amount: positive-number string }`.

### `validators/trade.validator.js`
Zod schema (`tradeSchema`) for `POST /execute` body: `{ quoteId: UUID, userSignature: 0x-prefixed hex ≥ 132 chars }`.

## Rules
1. `quote.service.js` is the only file that produces EIP-712 quote data and calls `relayerWallet.signTypedData`. No other file may sign quotes.
2. Before relaying to chain, `trading.service.js` verifies in order: deadline not passed, nonce not used on-chain, quoteSignature recovers to `sepolia.quoteSigner`, userSignature recovers to `walletAddress`. Skipping any check is a replay-protection hole.
3. Prices come from `oracle/price.service.js` only — never fetch price data directly in this module.
4. EIP-712 domain: `{ name: 'PaperDEX', version: '1', chainId: 11155111, verifyingContract: sepolia.contracts.PaperDEX }`.

## Lessons learned (this module only)
_(empty)_
