# Trading Module Implementation Plan

## Background

PaperDEX is a paper-trading DEX. Contracts are deployed to Sepolia. The trading module orchestrates:
1. **Quote** — oracle price → EIP-712 quote struct → quote signer signs → return to client
2. **Execute** — client provides `userSignature` on the same struct → relayer submits to `PaperDEX.executeTrade()`

All 10 trading/blockchain files are currently 0-byte stubs. This plan fills all of them.

---

## User Review Required

> [!IMPORTANT]
> The `.env` file currently has **no `QUOTE_SIGNER_PRIVATE_KEY`**. The recon confirms the quote signer address is the same as the relayer (`0xDb8B9b...`). I will use `RELAYER_PRIVATE_KEY` for quote signing as well (same key, same wallet). **No new secret is needed**, and **no `.env` change is required**. Confirm this is correct before proceeding.

> [!IMPORTANT]
> **4 new error codes** are required (per recon §2) and must be added to `errorCodes.js`:
> ```
> QUOTE_EXPIRED, NONCE_ALREADY_USED, INVALID_QUOTE_SIGNATURE, INVALID_USER_SIGNATURE, UNSUPPORTED_TOKEN
> ```
> Per CLAUDE.md §4/§5, new codes must be added before use. This plan adds them as part of execution.

> [!WARNING]
> The recon confirms there is **no `used`/`executed` column on the `quotes` table**. The contract itself is the authoritative replay guard via `usedNonces[user][nonce]`. The backend will do a **server-side pre-check** by calling `paperDexContract.usedNonces(userAddress, nonce)` before submitting to chain (fast-fail, no new DB column needed). This is a **read-only** chain call, not a schema change.

---

## Open Questions

_None — recon doc answers all questions. Proceeding with the plan above._

---

## Proposed Changes

### 1. Constants

#### [MODIFY] [errorCodes.js](file:///c:/crypto_project/packages/backend/src/constants/errorCodes.js)
Add 5 missing trading error codes to the `// Trading` section:
- `QUOTE_EXPIRED`
- `NONCE_ALREADY_USED`
- `INVALID_QUOTE_SIGNATURE`
- `INVALID_USER_SIGNATURE`
- `UNSUPPORTED_TOKEN`

---

### 2. Config

#### [MODIFY] [env.js](file:///c:/crypto_project/packages/backend/src/config/env.js)
No changes needed — `RELAYER_PRIVATE_KEY` doubles as quote signer key (same wallet, confirmed in `deployments/sepolia.json`).

---

### 3. Blockchain module (fills 3 stubs)

#### [MODIFY] [blockchain.service.js](file:///c:/crypto_project/packages/backend/src/modules/blockchain/blockchain.service.js)
Shared low-level helpers:
- `getContractInstance(address, abi, signerOrProvider)` — returns an `ethers.Contract`
- `parseContractError(err)` — maps known PaperDEX revert strings to `ERROR_CODES`

#### [MODIFY] [dex.service.js](file:///c:/crypto_project/packages/backend/src/modules/blockchain/dex.service.js)
PaperDEX contract interactions:
- `executeTrade({ token, price, amount, side, user, nonce, deadline, quoteSignature, userSignature })` — calls `paperDexContract.executeTrade(...)` via relayer, returns `{ txHash, blockNumber }`
- `isNonceUsed(userAddress, nonce)` — calls `paperDexContract.usedNonces(user, nonce)` (view, no gas)
- `isSupportedToken(tokenAddress)` — calls `paperDexContract.supportedTokens(address)` (view)

Loads PaperDEX ABI from `artifacts/contracts/exchange/PaperDEX.sol/PaperDEX.json`, address from `deployments/sepolia.json`.

#### [MODIFY] [vault.service.js](file:///c:/crypto_project/packages/backend/src/modules/blockchain/vault.service.js)
Vault reads:
- `getVaultBalance(tokenAddress)` — calls `IERC20.balanceOf(vaultAddress)` using a minimal ERC20 ABI (balanceOf), returns formatted string

---

### 4. Trading module (fills 5 stubs + 2 validators)

#### [MODIFY] [trading.repository.js](file:///c:/crypto_project/packages/backend/src/modules/trading/trading.repository.js)
Supabase access for `quotes` and `trades` tables:
- `insertQuote({ userId, token, side, amount, price, nonce, deadline, quoteSignature })` → inserts row, returns `data`
- `getQuoteById(quoteId)` → fetch single quote row
- `insertTrade({ userId, token, side, amount, price, usdAmount, nonce, txHash, status })` → inserts row, returns `data`
- `getTradesByUser(userId)` → returns array

#### [MODIFY] [validators/trade.validator.js](file:///c:/crypto_project/packages/backend/src/modules/trading/validators/trade.validator.js)
Zod schema for the execute endpoint body:
```
{ quoteId, userSignature }
```

#### [MODIFY] [validators/order.validator.js](file:///c:/crypto_project/packages/backend/src/modules/trading/validators/order.validator.js)
Zod schema for the quote endpoint body:
```
{ token: 'BTCP'|'ETHP'|'SOLP', side: 'BUY'|'SELL', amount: positive number string }
```

#### [MODIFY] [quote.service.js](file:///c:/crypto_project/packages/backend/src/modules/trading/quote.service.js)
The **only** place EIP-712 quote signing happens:
- `generateQuote({ userId, walletAddress, token, side, amount })`:
  1. Call `getPrice(token)` from oracle
  2. Validate token is supported (`dex.service.isSupportedToken`)
  3. Build the Trade struct: `{ token: tokenAddress, price (scaled ×1e8), amount (18 dec), side (0/1), user: walletAddress, nonce (random bigint), deadline (now + 5 min) }`
  4. EIP-712 sign with relayer wallet (= quote signer) using `ethers.TypedDataEncoder`
  5. Persist to `quotes` table via `trading.repository.insertQuote`
  6. Return `{ quoteId, token, side, amount, price, usdAmount, nonce, deadline, quoteSignature, eip712Domain, eip712Types, eip712Message }`

The client needs `eip712Domain`, `eip712Types`, and `eip712Message` to reproduce MetaMask's `eth_signTypedData_v4` call.

#### [MODIFY] [trading.service.js](file:///c:/crypto_project/packages/backend/src/modules/trading/trading.service.js)
Orchestration — validates and executes:
- `getQuote(userId, walletAddress, { token, side, amount })` — delegates to `quote.service.generateQuote`
- `executeTrade(userId, walletAddress, { quoteId, userSignature })`:
  1. Fetch quote from DB by `quoteId`
  2. Check `deadline` not passed → `QUOTE_EXPIRED`
  3. Check on-chain nonce not used (`dex.service.isNonceUsed`) → `NONCE_ALREADY_USED`
  4. Verify `quoteSignature` matches expected signer (re-derive hash and recover) → `INVALID_QUOTE_SIGNATURE`
  5. Verify `userSignature` against `walletAddress` (re-derive hash and recover) → `INVALID_USER_SIGNATURE`
  6. Call `dex.service.executeTrade(...)` → get `{ txHash, blockNumber }`
  7. Insert into `trades` table
  8. Return `{ txHash, blockNumber, trade }`

#### [MODIFY] [trading.controller.js](file:///c:/crypto_project/packages/backend/src/modules/trading/trading.controller.js)
Thin controller, two handlers:
- `POST /quote` → `req.user` (from auth middleware) + `req.body` → `tradingService.getQuote` → `sendSuccess`
- `POST /execute` → `req.user` + `req.body` → `tradingService.executeTrade` → `sendSuccess`
- Both catch `AppError` and fall through to `next(err)` / inline error handler (matching auth controller pattern)

#### [MODIFY] [trading.routes.js](file:///c:/crypto_project/packages/backend/src/modules/trading/trading.routes.js)
```
POST /api/v1/trade/quote   → authMiddleware, validate(orderSchema), getQuote
POST /api/v1/trade/execute → authMiddleware, validate(tradeSchema), executeTrade
```

---

### 5. Routes (wire up)

#### [MODIFY] [routes/index.js](file:///c:/crypto_project/packages/backend/src/routes/index.js)
Add:
```js
import tradeRoutes from '../modules/trading/trading.routes.js';
router.use('/trade', tradeRoutes);
```

---

### 6. Rules file update

#### [MODIFY] [trading.md](file:///c:/crypto_project/packages/backend/.claude/rules/trading.md)
Flip all PLANNED → EXISTS and add 2-4 line summaries per file (per CLAUDE.md §3 rule).

#### [MODIFY] [CLAUDE.md](file:///c:/crypto_project/packages/backend/CLAUDE.md)
Flip `src/modules/trading/**` from `PLANNED` → `EXISTS`.

---

## EIP-712 Details (implementation reference)

**Domain:**
```js
{ name: 'PaperDEX', version: '1', chainId: 11155111, verifyingContract: '0x35284eDd7...' }
```

**Types:**
```js
{ Trade: [
  { name: 'token',    type: 'address' },
  { name: 'price',    type: 'uint256' },
  { name: 'amount',   type: 'uint256' },
  { name: 'side',     type: 'uint8'   },
  { name: 'user',     type: 'address' },
  { name: 'nonce',    type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]}
```

**Price scaling:** `price = Math.round(oraclePrice * 1e8)` (bigint)  
**Amount:** `ethers.parseUnits(amount.toString(), 18)` (bigint)  
**Side:** `BUY = 0`, `SELL = 1`  
**Nonce:** `BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000))` (unique per quote)  
**Deadline:** `BigInt(Math.floor(Date.now() / 1000) + 300)` (5 min from now)

---

## Verification Plan

### Automated Tests
```powershell
# Start server
cd c:\crypto_project\packages\backend
pnpm dev

# Test quote endpoint (requires valid JWT from a prior login)
curl -X POST http://localhost:5000/api/v1/trade/quote \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"token":"BTCP","side":"BUY","amount":"0.001"}'
```

### Manual Verification
1. Quote returns valid `quoteId`, `quoteSignature`, and the three EIP-712 fields
2. Execute with a valid `userSignature` returns `txHash`
3. Nonce-replay attempt returns `NONCE_ALREADY_USED`
4. Expired deadline returns `QUOTE_EXPIRED`
