---
paths:
  - "packages/backend/src/modules/users/**"
---

# Users module

## Purpose
App-level user records keyed to `wallet_address` (Supabase `users` table). A row is normally created the first time a wallet completes login in the auth module, not created directly by an unauthenticated client request.

## Files
- `user.routes.js` — **PLANNED**.
- `user.controller.js` — **PLANNED**. Thin, same pattern as auth: parse → service → response helper.
- `user.service.js` — **EXISTS**. `ensureStarterBalance(walletAddress)`: checks `hasReceivedStartingBalance` on-chain; if false, calls `token.service.grantStartingBalance`, then writes a `STARTER_GRANT` row to `paperdex.transactions` via `blockchain.repository`. Race-condition revert (`AlreadyReceivedStartingBalance`) treated as success.
- `user.repository.js` — **EXISTS**. `findByWalletAddress(walletAddress)` — queries `paperdex.users` table.
- `user.validator.js` — **PLANNED**.

## Rules
1. `wallet_address` is the identity key — don't add a separate mutable username/email as a primary identifier unless asked; the whole auth model is wallet-based.
2. `user.repository.js` is the only place touching the `users` table — services and controllers never call the Supabase client directly.

## Lessons learned (this module only)
_(empty)_
