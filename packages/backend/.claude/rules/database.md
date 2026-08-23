---
paths:
  - "packages/backend/src/infrastructure/database/**"
  - "packages/backend/src/config/database.js"
  - "packages/backend/src/**/*.repository.js"
---

# Database access — Supabase

## Ground rule
Supabase stores **application** data only. Blockchain remains authoritative for actual token balances and settlement — Supabase never overrides an on-chain read. Never store a private key in Supabase, ever, for any reason.

## Suggested schema (dev plan Phase 2 — adjust here, not by guessing per-module)
- `users`: id, wallet_address, created_at, updated_at
- `auth_nonces`: id, wallet_address, nonce, expires_at, used
- `trades`: id, user_id, token, side, amount, price, usd_amount, nonce, tx_hash, status, created_at
- `quotes`: id, user_id, token, side, amount, price, nonce, deadline, quote_signature, created_at
- `market_data`: id, symbol, price, change_24h, volume_24h, updated_at
- `transactions`: id (UUID PK), user_id (UUID NOT NULL → paperdex.users), tx_hash (TEXT NOT NULL), type (TEXT NOT NULL), token (TEXT NOT NULL), direction (TEXT NOT NULL, CHECK IN ('CREDIT','DEBIT')), amount (NUMERIC NOT NULL), status (TEXT NOT NULL), block_number (BIGINT), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
  - Schema namespace: `paperdex` (Supabase client must use `db: { schema: 'paperdex' }` — confirmed in `infrastructure/database/client.js`)

## Files
- `infrastructure/database/supabase.js` — **PLANNED**. Supabase client instantiation only.
- `infrastructure/database/client.js` — **EXISTS**. Supabase client targeting `paperdex` schema (`db: { schema: 'paperdex' }`). Used by all repositories.
- `config/database.js` — **PLANNED**. Env-driven config (URL, keys) for the client above — no query logic.
- Every `*.repository.js` across modules — **PLANNED**. Each repository owns exactly one table (or a small tightly-related set); it is the *only* file allowed to run Supabase queries against that table.

## Rules
1. Only `*.repository.js` files call the Supabase client. Controllers and services never import the Supabase client directly — if you're about to do that, stop and use/create the repository instead.
2. Schema changes (new column, new table, changed constraint) are a root-§5 ask-first case — don't add a column to satisfy one feature without checking it doesn't break another module's repository.
3. `Supabase service-role key` never appears outside `config/database.js` / env loading — never logged, never passed to the frontend.

## Lessons learned (this module only)
_(empty)_
