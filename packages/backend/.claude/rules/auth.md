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
- `auth.routes.js` — **EXISTS**. Mounts POST /nonce and POST /login with Zod validation middleware.
- `auth.controller.js` — **EXISTS**. Calls authService, sends canonical envelope via `utils/response.js`.
- `auth.service.js` — **EXISTS**. Verifies ethers.verifyMessage signature, marks nonce used before issuing JWT.
- `auth.repository.js` — **EXISTS**. upsertNonce, getNonce, markNonceUsed, upsertUser against Supabase.
- `nonce.service.js` — **EXISTS**. generateNonce (randomBytes hex), nonceExpiresAt, buildNonceMessage.
- `auth.validator.js` — **EXISTS**. Zod schemas: nonceSchema (walletAddress), loginSchema (walletAddress + signature).
- `middleware/auth.middleware.js` — **EXISTS**. Verifies Bearer JWT, attaches req.user = { sub, wallet }.

## Rules
1. No private key ever reaches this module — it only *verifies* signatures, never signs on the user's behalf. Any code here needing a private key is wrong; that's a root-§5 ask-first case.
2. A nonce is single-use. `used` must be checked/set in a way that prevents replay under concurrent requests — if the current Supabase call pattern can't guarantee that, ask before shipping it.
3. Expired nonces (`expires_at` passed) reject with `ERROR_CODES.NONCE_EXPIRED`, not a generic error.

## Lessons learned (this module only)
_(empty)_
