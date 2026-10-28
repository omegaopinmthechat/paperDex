# PaperDEX Public API — Implementation Plan

> Status: **DRAFT — Awaiting approval before any code is written**

---

## What we're building

A programmatic REST API that lets users (via their own apps, bots, or scripts) do everything the web UI can do — read markets, read their portfolio, and execute trades — authenticated by a long-lived **API key pair** instead of a JWT session + MetaMask.

---

## Decisions locked in (from Q&A)

| Decision | Answer |
|---|---|
| Trade execution flow | Skip EIP-712 user-signature; API key = identity proof; server executes directly |
| Keys per user | Max **3** active keys per wallet |
| Rate limits | 100 req/15 min (trade), 300 req/15 min (market/read) per key |
| Rate limit toggle | `RATE_LIMIT_ENABLED=true/false` env var |
| UI location | New `/api` page inside the existing Next.js frontend |
| On expiry / revoke | Reject immediately (no grace window) |
| Scopes | `READ_ONLY` (markets + portfolio) or `TRADE` (full) |
| Key format | `pdx_id_<16 hex chars>` + `pdx_secret_<32 hex chars>` shown **once** at creation |

---

## Architecture Overview

```
Third-party app / bot
       |
       | Authorization: pdx_id_<id>:<secret>
       v
Express /api/v2/*
       |
       ├── apiKeyMiddleware        → looks up key, validates hash, checks expiry/scope
       ├── rateLimitMiddleware     → RATE_LIMIT_ENABLED gate; per-key window buckets
       └── Existing services      → same quote.service, trading.service, portfolio.service, oracle
               |
               v
       PaperDEX contracts on Sepolia (for TRADE scope)
```

The public API lives at `/api/v2/` — version 2 — to never break the existing internal `/api/v1/` routes the web UI uses.

---

## Phase B1 — Database: new `api_keys` table

### New Prisma model

```prisma
model ApiKey {
  id          String    @id                          // pdx_id_<16hex>
  userId      String    @map("user_id")
  keyHash     String    @unique @map("key_hash")     // bcrypt or SHA-256 hash of the secret
  name        String                                  // user-chosen label e.g. "my trading bot"
  scope       String                                 // "READ_ONLY" | "TRADE"
  expiresAt   DateTime? @map("expires_at")           // null = never
  lastUsedAt  DateTime? @map("last_used_at")
  revokedAt   DateTime? @map("revoked_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  user        User      @relation(fields: [userId], references: [id])

  @@map("api_keys")
}
```

- The **raw secret is never stored** — only a SHA-256 hash.
- The full `pdx_id_xxx:pdx_secret_xxx` pair is shown **once** on creation, then never again.
- Max 3 active (non-revoked, non-expired) keys per user enforced at the service layer.

---

## Phase B2 — Backend: new `apiKeys` module

### File structure (inside `packages/backend/src/modules/`)

```
modules/apiKeys/
├── apiKey.controller.js      CRUD endpoints for key management
├── apiKey.service.js         generation, validation, hashing logic
├── apiKey.repository.js      Prisma queries
├── apiKey.routes.js          /api/v1/api-keys/* (authenticated by JWT — web UI only)
└── apiKey.validator.js       Zod schemas: createKey, listKeys, revokeKey
```

### New middleware

```
middleware/
└── apiKeyAuth.middleware.js  reads Authorization header for pdx_id_xxx:pdx_secret_xxx
```

### New routes file

```
routes/
└── v2.js                     mounts the public /api/v2/* router
```

---

## Phase B3 — API Endpoints

### Key management (JWT-auth, web UI only → `/api/v1/api-keys`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/api-keys` | JWT | List your keys (id, name, scope, expiry, lastUsed — **no secret**) |
| `POST` | `/api/v1/api-keys` | JWT | Create a key → returns id + **secret once** |
| `DELETE` | `/api/v1/api-keys/:id` | JWT | Revoke a key immediately |

Request body for `POST`:
```json
{
  "name": "my bot",
  "scope": "TRADE",
  "expiresIn": "7d" | "30d" | "180d" | "never"
}
```

---

### Public API (API key auth → `/api/v2`)

Header format: `Authorization: pdx_id_<id>:<secret>`  
`Content-Type: application/json`

#### Markets (both scopes)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/markets` | All tokens: price, 24h change, volume, sparkline |
| `GET` | `/api/v2/markets/:symbol` | Single token: `BTCP`, `ETHP`, `SOLP`, `USDTP` |

#### Portfolio (both scopes)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v2/portfolio` | Live on-chain balances + USD value for the key owner's wallet |

#### Trading (`TRADE` scope only)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v2/trade` | Execute a trade atomically: single call, no signature step |

`POST /api/v2/trade` request body:
```json
{
  "token": "BTCP",
  "side": "BUY",
  "amount": "0.1"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "blockNumber": 123456,
    "token": "BTCP",
    "side": "BUY",
    "amount": "0.1",
    "price": 98234.12,
    "usdValue": "9823.41"
  }
}
```

**Internal flow for `POST /api/v2/trade`:**
1. `apiKeyAuth.middleware` — verify key, scope, expiry
2. Rate limit check (100 req/15 min on trade bucket)
3. `quote.service.generateQuote(userId, walletAddress, { token, side, amount })`
4. Backend signs the EIP-712 trade message with the relayer wallet (same as web flow)
5. Backend also acts as the "user signer" internally — uses relayer to submit both signatures
6. `dex.service.executeTrade(...)` — on-chain
7. Insert trade + transaction records
8. Return response

> **Security note on the trade flow:** Because the API key proves identity (like a session token), and the relayer wallet already needs to be trusted to submit, the server can sign on behalf of the user. This matches the "server trusts API key" decision. The user does NOT need to hold Sepolia ETH.

---

## Phase B4 — Rate Limiting

```js
// config/env.js addition
RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false'  // default ON
```

```js
// middleware/rateLimitApi.middleware.js
// RATE_LIMIT_ENABLED === false → calls next() immediately, no limits
// Otherwise: uses express-rate-limit (already a dependency) 
// Key: req.apiKey.id  (not IP — per-key buckets)
// Two limiter instances:
//   readLimiter:  300 req / 15 min
//   tradeLimiter: 100 req / 15 min
```

`.env` additions:
```
RATE_LIMIT_ENABLED=true
```

---

## Phase F1 — Frontend: `/api` page

### UI Layout (matching PaperDEX design language: `#F8F6F1` bg, pill badges, Inter font)

```
┌─────────────────────────────────────────────────────────┐
│  Navbar                                                  │
├─────────────────────────────────────────────────────────┤
│  DEVELOPER API                                           │
│  API Access.                                            │
│                                                          │
│  ┌─ Your API Keys ─────────────────────────────────┐   │
│  │  [+ New Key]                  3/3 keys used     │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │ 🔑 my trading bot           TRADE         │   │   │
│  │  │ pdx_id_abc123...            Expires 7d    │   │   │
│  │  │ Last used: 2h ago           [Revoke]      │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ API Reference ────────────────────────────────┐   │
│  │  GET  /api/v2/markets        GET /api/v2/portfolio│  │
│  │  POST /api/v2/trade                              │   │
│  │  (collapsible code examples per endpoint)        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### New UI files

```
src/app/api/
└── page.js           Server component; reads jwt cookie, fetches key list

src/app/components/
├── ApiKeyCard.js     Single key row: name, scope pill, expiry, last-used, revoke button
├── CreateKeyModal.js Modal: name input, scope select, expiry radio (7d/30d/6m/never)
│                     Shows the secret ONCE in a monospace box with Copy button
└── ApiDocs.js        Collapsible endpoint reference with curl examples

src/app/actions/
└── apiKeys.js        Server actions: createKey, listKeys, revokeKey
```

### Create Key Modal — Secret display (one-time reveal)

```
┌────────────────────────────────────────────────────┐
│  Key Created Successfully                           │
│                                                     │
│  Save this secret — it will never be shown again.  │
│                                                     │
│  Key ID:     pdx_id_a1b2c3d4e5f6a1b2               │
│  Secret:     pdx_secret_••••••••••••••••  [Copy]   │
│                                                     │
│  [I've saved it — Done]                            │
└────────────────────────────────────────────────────┘
```

---

## Phase F2 — API Reference Section (inline in `/api` page)

Endpoint cards with `curl` example, collapsible:

```bash
# Get all markets
curl https://api.paperdex.app/api/v2/markets \
  -H "Authorization: pdx_id_abc:pdx_secret_xyz"

# Execute a trade
curl -X POST https://api.paperdex.app/api/v2/trade \
  -H "Authorization: pdx_id_abc:pdx_secret_xyz" \
  -H "Content-Type: application/json" \
  -d '{"token":"BTCP","side":"BUY","amount":"0.1"}'
```

---

## Implementation Order

| Step | What | Where |
|---|---|---|
| 1 | Add `ApiKey` model to `schema.prisma` + run migration | `packages/backend/prisma/` |
| 2 | Add `RATE_LIMIT_ENABLED` to `config/env.js` | `packages/backend/src/config/` |
| 3 | Create `modules/apiKeys/` (service, repo, controller, routes, validator) | `packages/backend/src/` |
| 4 | Create `middleware/apiKeyAuth.middleware.js` | `packages/backend/src/middleware/` |
| 5 | Create `middleware/rateLimitApi.middleware.js` | `packages/backend/src/middleware/` |
| 6 | Create `routes/v2.js` + mount in `app.js` | `packages/backend/src/` |
| 7 | Add new error codes to `constants/errorCodes.js` | `packages/backend/src/constants/` |
| 8 | Create `src/app/api/page.js` | `packages/frontend-web/v1/src/app/` |
| 9 | Create `ApiKeyCard.js`, `CreateKeyModal.js`, `ApiDocs.js` | `packages/frontend-web/v1/src/app/components/` |
| 10 | Create `src/app/actions/apiKeys.js` server actions | `packages/frontend-web/v1/src/app/actions/` |

---

## New error codes needed

```js
// additions to constants/errorCodes.js
API_KEY_NOT_FOUND:      "API_KEY_NOT_FOUND",
API_KEY_EXPIRED:        "API_KEY_EXPIRED",
API_KEY_REVOKED:        "API_KEY_REVOKED",
API_KEY_INVALID:        "API_KEY_INVALID",
API_KEY_SCOPE_DENIED:   "API_KEY_SCOPE_DENIED",
API_KEY_LIMIT_REACHED:  "API_KEY_LIMIT_REACHED",  // max 3 keys
```

---

## Open questions (resolved — kept for record)

| Q | A |
|---|---|
| Trade execution model | Server trusts key; signs EIP-712 internally; no client MetaMask |
| Max keys per user | 3 active |
| Rate limit defaults | 100/15min (trade), 300/15min (read) |
| Rate limit toggle | `RATE_LIMIT_ENABLED` bool env var |
| Key expiry options | 7d, 30d, 6 months, never |
| Key format | `pdx_id_<16hex>` + `pdx_secret_<32hex>` |
| Scopes | `READ_ONLY` or `TRADE` |
| Revoke behaviour | Immediate rejection |
| UI location | `/api` page in existing Next.js frontend |

---

> **Next step:** Review this plan and say **"proceed"** or flag anything to change.
