# PaperDEX — Development Plan

## Smart Contracts

### Current status: COMPLETE

The V1 Solidity/Sepolia deployment phase is complete.

Completed:
- PaperToken
- PaperUSD / USDTP
- BTCP
- ETHP
- SOLP
- PaperDEXVault
- PaperDEX
- Access-control roles
- Supported-token registration
- Vault liquidity
- Sepolia deployment
- Deployment/address tracking

### Is more contract development required?

**No major Solidity development is required for the current V1 development phase.**

The deployed contracts are now the blockchain settlement layer.

Before public/mainnet launch, still perform:
- Security review
- Full unit/integration testing
- Role/access-control review
- Quote-signature and replay testing
- Relayer security review
- Gas/edge-case testing
- Deployment verification

For now, development moves to the backend and frontend.

---

# Technology Stack

## Blockchain
- Ethereum Sepolia
- Solidity `0.8.24`
- Hardhat
- OpenZeppelin
- EIP-712
- PaperDEX vault architecture

## Backend
- Node.js
- Express.js
- JavaScript (`.js`)
- ESLint
- Supabase
- Supabase PostgreSQL
- ethers.js
- REST API
- WebSockets later for realtime updates

## Frontend
- Next.js
- JavaScript (`.js`)
- ESLint
- MetaMask
- React

## Database

Use **Supabase** as the application database.

Express remains the main backend/API layer.

```text
Next.js
   |
   | REST / WebSocket
   v
Express.js
   |
   +---- Supabase PostgreSQL
   |
   +---- Sepolia RPC
   |
   +---- Price Provider
   |
   +---- Relayer Wallet
   |
   v
PaperDEX Contracts
```

---

# Monorepo Structure

```text
CRYPTO_PROJECT/
│
├── packages/
│   ├── contracts/                  # COMPLETE
│   │   ├── contracts/
│   │   ├── scripts/
│   │   ├── addresses/
│   │   │   └── sepolia.json
│   │   ├── hardhat.config.js
│   │   └── package.json
│   │
│   ├── backend/                    # Express.js
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.js
│   │   │   │   ├── supabase.js
│   │   │   │   ├── blockchain.js
│   │   │   │   └── contracts.js
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── nonce.service.js
│   │   │   ├── users/
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── user.service.js
│   │   │   │   ├── user.repository.js
│   │   │   │   └── user.routes.js
│   │   │   ├── markets/
│   │   │   │   ├── market.controller.js
│   │   │   │   ├── market.service.js
│   │   │   │   ├── market.repository.js
│   │   │   │   └── market.routes.js
│   │   │   ├── oracle/
│   │   │   │   ├── price.provider.js
│   │   │   │   ├── price.service.js
│   │   │   │   └── price.cache.js
│   │   │   ├── trading/
│   │   │   │   ├── trading.controller.js
│   │   │   │   ├── trading.service.js
│   │   │   │   ├── quote.service.js
│   │   │   │   ├── trading.routes.js
│   │   │   │   └── validators/
│   │   │   ├── portfolio/
│   │   │   │   ├── portfolio.controller.js
│   │   │   │   ├── portfolio.service.js
│   │   │   │   └── portfolio.routes.js
│   │   │   ├── blockchain/
│   │   │   │   ├── provider.js
│   │   │   │   ├── contracts.js
│   │   │   │   ├── dex.service.js
│   │   │   │   ├── vault.service.js
│   │   │   │   ├── token.service.js
│   │   │   │   └── relayer.service.js
│   │   │   ├── database/
│   │   │   │   └── supabase.js
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── error.middleware.js
│   │   │   │   └── rateLimit.middleware.js
│   │   │   ├── utils/
│   │   │   ├── app.js
│   │   │   └── server.js
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── eslint.config.js
│   │   └── package.json
│   │
│   └── frontend/                   # Next.js
│       ├── app/
│       │   ├── page.js
│       │   ├── trade/page.js
│       │   ├── markets/page.js
│       │   ├── portfolio/page.js
│       │   ├── history/page.js
│       │   └── settings/page.js
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── stores/
│       ├── public/
│       ├── eslint.config.js
│       ├── .env.local
│       └── package.json
│
├── packages/shared/
│   ├── constants.js
│   └── package.json
├── package.json
└── pnpm-workspace.yaml
```

---

# Development Phases

## Phase 1 — Backend Foundation

Build Express first.

Tasks:
1. Create Express application.
2. Configure ESLint.
3. Configure environment variables.
4. Configure Supabase client.
5. Create error handling middleware.
6. Create request validation.
7. Create API versioning.
8. Add logging.
9. Add rate limiting.

Initial API:

```text
/api/v1/
```

---

## Phase 2 — Supabase Database

Supabase stores application data.

Blockchain remains authoritative for actual token balances and settlement.

Suggested tables:

```text
users
├── id
├── wallet_address
├── created_at
└── updated_at

auth_nonces
├── id
├── wallet_address
├── nonce
├── expires_at
└── used

trades
├── id
├── user_id
├── token
├── side
├── amount
├── price
├── usd_amount
├── nonce
├── tx_hash
├── status
└── created_at

quotes
├── id
├── user_id
├── token
├── side
├── amount
├── price
├── nonce
├── deadline
├── quote_signature
└── created_at

market_data
├── id
├── symbol
├── price
├── change_24h
├── volume_24h
└── updated_at

transactions
├── id
├── user_id
├── tx_hash
├── type
├── status
├── block_number
└── created_at
```

Never store private keys in Supabase.

---

## Phase 3 — MetaMask Authentication

```text
User
 |
 | Connect MetaMask
 v
Wallet Address
 |
 | GET /api/v1/auth/nonce
 v
Express
 |
 | nonce
 v
Frontend
 |
 | sign message
 v
MetaMask
 |
 | signature
 v
Express
 |
 | verify signature
 v
Authenticated User
```

The private key never reaches the backend.

---

## Phase 4 — Blockchain Service

```text
blockchain/
├── provider.js
├── contracts.js
├── dex.service.js
├── vault.service.js
├── token.service.js
└── relayer.service.js
```

Load deployed addresses from:

```text
packages/contracts/addresses/sepolia.json
```

Provide functions such as:

```text
getTokenBalance()
getVaultBalance()
getUserPortfolio()
executeTrade()
getTransaction()
getTradeEvents()
```

---

## Phase 5 — Real-World Price Oracle

Initial assets:

```text
BTC → BTCP
ETH → ETHP
SOL → SOLP
```

Architecture:

```text
Real Crypto Market
        |
        v
Price Provider
        |
        v
Express Oracle Service
        |
        +---- Cache
        |
        v
Trading Service
        |
        v
Frontend
```

The frontend should use the backend as its canonical market-price API.

---

## Phase 6 — Quote System

Example:

```text
BUY 0.1 BTCP
BTC = $100,000
Value = $10,000 USDTP
```

Backend:

```text
Get real BTC price
        ↓
Validate trade
        ↓
Calculate USDTP value
        ↓
Create nonce
        ↓
Set deadline
        ↓
Create EIP-712 trade data
        ↓
Quote signer signs
        ↓
Return quote
```

---

## Phase 7 — User Trade Signature

```text
Backend
   |
   | quote
   v
Next.js
   |
   | EIP-712 signing request
   v
MetaMask
   |
   | userSignature
   v
Next.js
   |
   v
Backend
```

Backend now has:

```text
quoteSignature
+
userSignature
```

---

## Phase 8 — Relayer

The user does not need Sepolia ETH.

```text
User
 |
 | signs
 v
Next.js
 |
 v
Express
 |
 | quote + user signature
 v
Relayer Wallet
 |
 | pays gas
 v
PaperDEX
 |
 v
Vault settlement
```

The relayer private key exists only in the backend/server environment.

---

## Phase 9 — Trading APIs

```text
POST /api/v1/auth/nonce
POST /api/v1/auth/login

GET  /api/v1/markets
GET  /api/v1/markets/:symbol

GET  /api/v1/portfolio
GET  /api/v1/trades

POST /api/v1/trade/quote
POST /api/v1/trade/execute

GET  /api/v1/transactions/:hash
```

---

## Phase 10 — Next.js Frontend

Pages:

```text
/
├── Landing
├── /trade
├── /markets
├── /portfolio
├── /history
└── /settings
```

Use JavaScript `.js` throughout and ESLint from the beginning.

---

## Phase 11 — Portfolio

Actual balances:

```text
Sepolia RPC
   ↓
USDTP.balanceOf(user)
BTCP.balanceOf(user)
ETHP.balanceOf(user)
SOLP.balanceOf(user)
```

Portfolio value:

```text
Token Balance × Real-World Price
```

Supabase can store cached/history data, but blockchain balances remain authoritative.

---

## Phase 12 — Trade History

Listen for:

```solidity
TradeExecuted(...)
```

Flow:

```text
PaperDEX
   ↓
TradeExecuted
   ↓
Blockchain listener
   ↓
Express
   ↓
Supabase
   ↓
Next.js
```

---

## Phase 13 — Realtime Updates

Later:

```text
Price Provider
      ↓
Express
      ↓
WebSocket
      ↓
Next.js
```

Realtime data:
- Prices
- 24h changes
- Trade confirmations
- Transaction status
- Portfolio updates

Supabase Realtime can also be used for selected database-driven updates.

---

## Phase 14 — Security

Before public launch:

### Backend
- Rate limiting
- Input validation
- Authentication middleware
- Nonce expiration
- Replay protection
- Quote expiration
- Secure sessions/JWT
- RPC failure handling
- Price-provider failure handling

### Blockchain
- Role review
- Relayer nonce management
- Quote signer security
- EIP-712 domain verification
- Pause/unpause procedure
- Vault liquidity checks
- Event monitoring

### Secrets

Never commit:

```text
.env
DEPLOYER_PRIVATE_KEY
RELAYER_PRIVATE_KEY
QUOTE_SIGNER_PRIVATE_KEY
Alchemy secret credentials
Supabase service-role key
```

Public contract addresses and ABIs are safe to publish.

---

# Development Order

```text
1.  Smart contracts                    DONE
2.  Sepolia deployment                 DONE
3.  Express backend setup
4.  ESLint
5.  Supabase setup
6.  Database schema
7.  MetaMask authentication
8.  Blockchain service
9.  Contract integration
10. Price oracle
11. Quote generation
12. EIP-712 quote signing
13. User EIP-712 signing
14. Relayer
15. Trade execution API
16. Next.js setup
17. MetaMask connection
18. Login UI
19. Markets UI
20. Trading UI
21. Portfolio
22. Trade history
23. Realtime updates
24. Security testing
25. Sepolia end-to-end testing
26. Production deployment
```

# Final Architecture

```text
                         PAPERDEX
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    Next.js              Express             Sepolia
    Frontend              Backend             Contracts
        │                   │                   │
        │                   ├── Auth            │
        │                   ├── Oracle          │
        │                   ├── Trading         │
        │                   ├── Portfolio       │
        │                   ├── Relayer ────────┤
        │                   └── Supabase        │
        │                                       │
        │                    ┌──────────────────┤
        │                    │                  │
        │                    ▼                  ▼
        │               PaperDEX             Vault
        │                    │                  │
        │                    ├── BTCP           │
        │                    ├── ETHP           │
        │                    ├── SOLP           │
        │                    └── USDTP ─────────┘
        │
        ▼
     MetaMask
        │
        └── EIP-712 signatures
```

# Immediate Next Task

Start with the backend:

```text
packages/backend
```

Build in this order:

```text
Express
  ↓
ESLint
  ↓
Environment config
  ↓
Supabase connection
  ↓
Database schema
  ↓
MetaMask authentication
  ↓
Blockchain service
```
