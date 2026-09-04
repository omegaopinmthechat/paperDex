# Trading Module Recon Report

---

## 1. EIP-712 Domain & Trade Struct

### Domain (from `PaperDEX.sol` constructor line 125)
```solidity
EIP712("PaperDEX", "1")
```
| Field | Value |
|---|---|
| `name` | `"PaperDEX"` |
| `version` | `"1"` |
| `chainId` | From chain (Sepolia: `11155111`) |
| `verifyingContract` | `0x35284eDd7f08Ab530e41F467cDb89A04B375799d` |

### Trade Struct — TYPEHASH (line 42–45)
```
"Trade(address token,uint256 price,uint256 amount,uint8 side,address user,uint256 nonce,uint256 deadline)"
```

| Order | Field | Solidity Type |
|---|---|---|
| 1 | `token` | `address` |
| 2 | `price` | `uint256` |
| 3 | `amount` | `uint256` |
| 4 | `side` | `uint8` — `BUY=0`, `SELL=1` |
| 5 | `user` | `address` |
| 6 | `nonce` | `uint256` |
| 7 | `deadline` | `uint256` |

**Critical detail on `price`:** `price` has 8 decimal places (`PRICE_SCALE = 1e8`).
- BTC at $100,000 → `price = 10_000_000_000_000` (i.e. `100000 * 1e8`)

**Both signatures cover the same struct.** `_verifySignature()` is called twice with the same 7 trade params — once expecting `quoteSigner`, once expecting `user`. There is no separate "quote-only" struct.

**Replay guard:** On-chain `usedNonces[user][nonce]` mapping — `bool`, keyed `(address user, uint256 nonce)`. The nonce is marked used *after* both signatures pass but *before* any token transfers.

---

## 2. Error Code Gap Analysis

### Codes NEEDED for trading (mapped to contract errors):

| Trading scenario | Contract error | Ideal ERROR_CODE key |
|---|---|---|
| Quote/deadline expired | `QuoteExpired` | ❌ **MISSING** — closest is `TRADE_EXPIRED` |
| Nonce already used (replay) | `NonceAlreadyUsed` | ❌ **MISSING** — nothing fits cleanly |
| Invalid quote signature | `InvalidQuoteSignature` | ❌ **MISSING** — `INVALID_SIGNATURE` is auth-layer only |
| Invalid user signature | `InvalidUserSignature` | ❌ **MISSING** — same problem |
| Trade execution failed (blockchain revert) | tx revert | ✅ `TRADE_FAILED` exists (line 36) |
| Insufficient vault liquidity | `InsufficientVaultLiquidity` | ✅ `LIQUIDITY_UNAVAILABLE` exists (line 73) |

### Full verdict:

| Required code | Status | Notes |
|---|---|---|
| `QUOTE_EXPIRED` | ❌ MISSING | `TRADE_EXPIRED` is semantically close but ambiguous |
| `NONCE_ALREADY_USED` | ❌ MISSING | `INVALID_NONCE` exists but lives in "Authentication" and means auth nonce, not trade nonce |
| `INVALID_QUOTE_SIGNATURE` | ❌ MISSING | `INVALID_SIGNATURE` is auth-layer |
| `INVALID_USER_SIGNATURE` | ❌ MISSING | same |
| `TRADE_FAILED` | ✅ EXISTS | line 36 |
| `LIQUIDITY_UNAVAILABLE` | ✅ EXISTS | line 73 |
| `UNSUPPORTED_TOKEN` | ❌ MISSING | contract has `UnsupportedToken` error |
| `QUOTE_FAILED` | ✅ EXISTS | line 35 — for oracle/signing failures during quote generation |

**4 new codes needed** before implementing the trading module (per §5 ask-first rule). Suggested additions to `errorCodes.js`:
```js
// Trading — quote/execution specific
QUOTE_EXPIRED: "QUOTE_EXPIRED",
NONCE_ALREADY_USED: "NONCE_ALREADY_USED",
INVALID_QUOTE_SIGNATURE: "INVALID_QUOTE_SIGNATURE",
INVALID_USER_SIGNATURE: "INVALID_USER_SIGNATURE",
UNSUPPORTED_TOKEN: "UNSUPPORTED_TOKEN",
```

---

## 3. Coding Conventions (from auth + user modules)

### Pattern observed across existing code:
- **ESM throughout** — `import`/`export`, no `require` anywhere in `src/`
- **Repository layer** — imports `supabase` default from `../../infrastructure/database/client.js`, does raw Supabase SDK calls, throws error directly (`if (error) throw error`)
- **Service layer** — imports `* as repo` from the repository, throws `new AppError(STATUS_CODES.X, ERROR_CODES.X, 'message')` for business logic errors
- **Controller layer** — thin, calls service, catches via `next(err)` or directly uses `sendSuccess`/`sendError`
- **Middleware** — single-purpose functions, named exports where applicable, default export for the main middleware

### Exact import paths observed:
```js
import supabase from '../../infrastructure/database/client.js';     // Supabase
import { AppError } from '../../utils/errors.js';                   // Error class
import { sendSuccess, sendError } from '../../utils/response.js';   // Response helpers
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';
import env from '../../config/env.js';
```

### Auth service pattern for `throw` vs `next`:
- Services `throw new AppError(...)` — **they do NOT call `next()`**
- Controllers are expected to either try/catch+next or use async error propagation
- `error.middleware.js` handles `AppError` instances: calls `sendError(res, err.statusCode, err.code, err.message)`

---

## 4. The `error-handling.md` Discrepancy — CONFIRMED

**CLAUDE.md §3** marks `utils/response.js`, `utils/errors.js`, `middleware/error.middleware.js` as **`EXISTS`**.

**`error-handling.md`** (the rules file) still says:
- `utils/response.js` — **PLANNED**
- `utils/errors.js` — **PLANNED**  
- `middleware/error.middleware.js` — **PLANNED**

**What's actually on disk:**

| File | Reality | Size |
|---|---|---|
| `utils/response.js` | ✅ **Real, implemented** | 8 lines — exports `sendSuccess`, `sendError` |
| `utils/errors.js` | ✅ **Real, implemented** | 17 lines — exports `AppError`, `unauthorized`, `badRequest` |
| `middleware/error.middleware.js` | ✅ **Real, implemented** | 20 lines — 4-arg Express error handler |

**Verdict:** `error-handling.md` is **stale/wrong**. All three files are fully implemented and in active use by `auth.service.js`, `auth.middleware.js`, and `validation.middleware.js`. The rules file was never updated after the files were written. `CLAUDE.md §3` is correct; `error-handling.md` is the lying document.

---

## 5. Infrastructure Signatures

### `infrastructure/database/client.js`
```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'paperdex' },
});
export default supabase;  // DEFAULT export, named `supabase` locally
```
**To import:** `import supabase from '../../infrastructure/database/client.js';`

### `middleware/validation.middleware.js`
```js
const validate = (schema) => (req, res, next) => { ... }
export default validate;
// Usage: router.post('/route', validate(myZodSchema), controller)
```
Uses Zod — `schema.safeParse(req.body)`.

### `middleware/auth.middleware.js`
```js
const authMiddleware = (req, res, next) => { ... }
export default authMiddleware;
// Sets req.user = { sub: userId, wallet: walletAddress } on success
```
JWT verified against `env.JWT_SECRET`. On success, `req.user` is the decoded JWT payload: `{ sub: user.id, wallet: walletAddress }`.

---

## 6. Quotes Table — Replay Guard Column

### Schema as documented in `database.md`:
```
quotes: id, user_id, token, side, amount, price, nonce, deadline, quote_signature, created_at
```

**No `used` column exists** in the documented `quotes` schema. No migration files exist on disk — the schema is managed directly in Supabase (no `.sql` migration files found anywhere in the repo).

**How replay is actually handled:** The contract itself is the authoritative replay guard via `usedNonces[user][nonce]` (on-chain mapping). The contract checks the nonce before executing. The backend's DB `quotes` table has no `used`/`executed` flag in the current spec.

**Gap:** If you want a server-side pre-check before submitting to chain (to fail fast and avoid wasted gas), you'd need either:
- A `used_at`/`executed` column on `quotes`, or
- Query the `trades` table by nonce

Neither exists yet. This is a schema change → ask-first (§5).

---

## 7. Trading Module Files — Actual Status vs. CLAUDE.md

| File | CLAUDE.md says | Actual on disk |
|---|---|---|
| `trading/trading.routes.js` | PLANNED | ✅ exists but **0 bytes** (empty stub) |
| `trading/trading.controller.js` | PLANNED | ✅ exists but **0 bytes** |
| `trading/trading.service.js` | PLANNED | ✅ exists but **0 bytes** |
| `trading/quote.service.js` | PLANNED | ✅ exists but **0 bytes** |
| `trading/trading.repository.js` | PLANNED | ✅ exists but **0 bytes** |
| `trading/validators/trade.validator.js` | PLANNED | ✅ exists but **0 bytes** |
| `trading/validators/order.validator.js` | PLANNED | ✅ exists but **0 bytes** |
| `blockchain/dex.service.js` | PLANNED | ✅ exists but **0 bytes** |
| `blockchain/vault.service.js` | PLANNED | ✅ exists but **0 bytes** |
| `blockchain/blockchain.service.js` | PLANNED | ✅ exists but **0 bytes** |

All PLANNED trading/blockchain files are zero-byte stubs — directory structure created, no content written yet.

---

## 8. Blockchain Model — Vault vs. transferFrom vs. permit()

### Vault model: **NO custodied deposits**

The vault is NOT a deposit/custody vault. Users do NOT deposit once and trade from a balance inside the vault.

### What actually happens on each trade:

**BUY (user buys token, pays USDTP):**
```
usdtp.exchangeTransferFrom(user, vault, usdAmount)   // pulls USDTP from user's wallet
vault.sendToken(token, user, amount)                  // sends asset from vault to user
```

**SELL (user sells token, receives USDTP):**
```
IPaperToken(token).exchangeTransferFrom(user, vault, amount)  // pulls token from user's wallet
vault.sendToken(usdtp, user, usdAmount)                       // sends USDTP from vault to user
```

So on every single trade, funds are pulled **directly from the user's wallet** via `exchangeTransferFrom()`.

### Does it use standard ERC20 `transferFrom`? No.

`exchangeTransferFrom()` is a **privileged internal function** on PaperToken / PaperUSD — it calls `_transfer()` (the internal ERC20 `_transfer`, bypassing the allowance system entirely). It is gated by `EXCHANGE_ROLE` (held by the PaperDEX contract).

```solidity
function exchangeTransferFrom(address from, address to, uint256 amount)
    external
    onlyRole(EXCHANGE_ROLE)
    whenNotPaused
{
    _transfer(from, to, amount); // No allowance check!
}
```

### Does EIP-2612 permit() apply?

**No.** The PaperToken and PaperUSD contracts:
- Extend `ERC20` (OpenZeppelin base) — NOT `ERC20Permit`
- No `permit()` function
- No `DOMAIN_SEPARATOR`/`nonces` for EIP-2612

### Summary for `executeTrade()` implementation:

| Question | Answer |
|---|---|
| Custody model | **None** — per-trade pull from user wallet |
| Mechanism | `exchangeTransferFrom()` — EXCHANGE_ROLE privileged, no allowance needed |
| approve() required? | **No** — user never needs to approve anything |
| permit() available? | **No** — tokens don't implement ERC20Permit |
| User needs Sepolia ETH? | **No** — relayer pays gas; user only signs EIP-712 |

The entire system is permissioned: PaperDEX has EXCHANGE_ROLE on all PaperToken/PaperUSD contracts, so it can move tokens from any wallet without approval. Users consent via their EIP-712 `userSignature` on the Trade struct.

---

## 9. blockchain.md Discrepancy

`blockchain.md` line 12 and line 28 say:
> "Deployed addresses load from `packages/contracts/addresses/sepolia.json`"

**Actual path on disk:** `packages/contracts/deployments/sepolia.json`

This was already caught in CLAUDE.md §8 (Lessons Learned entry 2025-08-08) but `blockchain.md` itself was **never updated** to reflect the correct path. When you implement `dex.service.js` and `vault.service.js` you need to use `deployments/sepolia.json`, not `addresses/sepolia.json` (which doesn't exist).

Also: `infrastructure/database/supabase.js` is listed as PLANNED in `database.md` but `client.js` is the implemented file. The `supabase.js` stub exists as a 0-byte file — it appears the naming was changed to `client.js` during implementation.
