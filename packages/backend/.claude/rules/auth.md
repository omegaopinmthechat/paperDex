---
paths:
  - "packages/backend/src/modules/auth/**"
  - "packages/backend/src/middleware/auth.middleware.js"
---

# Auth module — MetaMask signature login

## Flow (dev plan Phase 3 — implement to match this; don't redesign without asking)
1. `GET/POST /api/v1/auth/nonce` — client sends a wallet address, backend generates and stores a nonce (`auth_nonces`: wallet_address, nonce, expires_at, used).
2. Frontend has MetaMask sign the nonce message.
3. `POST /api/v1/auth/login` — client sends the signature.
4. Backend verifies the signature recovers to the claimed wallet address, marks the nonce used, issues a session/JWT.

## Files
- `auth.routes.js` — **PLANNED**. Mounts nonce + login routes.
- `auth.controller.js` — **PLANNED**. Thin: parse request → call service → call `utils/response.js`.
- `auth.service.js` — **PLANNED**. Signature verification (ethers `verifyMessage` or equivalent) + session/JWT issuance.
- `auth.repository.js` — **PLANNED**. All `auth_nonces` / `users` Supabase queries live only here.
- `nonce.service.js` — **PLANNED**. Nonce generation + expiry, split out because both the nonce and login steps use it.
- `auth.validator.js` — **PLANNED**. Validates wallet-address and signature format before the controller runs.
- `middleware/auth.middleware.js` — **PLANNED**. Verifies session/JWT on protected routes, attaches `req.user`.

## Rules
1. No private key ever reaches this module — it only *verifies* signatures, never signs on the user's behalf. Any code here needing a private key is wrong; that's a root-§5 ask-first case.
2. A nonce is single-use. `used` must be checked/set in a way that prevents replay under concurrent requests — if the current Supabase call pattern can't guarantee that, ask before shipping it.
3. Expired nonces (`expires_at` passed) reject with `ERROR_CODES.NONCE_EXPIRED`, not a generic error.

## Lessons learned (this module only)
_(empty)_
