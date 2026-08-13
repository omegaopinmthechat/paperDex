---
paths:
  - "packages/backend/src/modules/blockchain/**"
  - "packages/backend/src/infrastructure/blockchain/**"
  - "packages/backend/src/config/blockchain.js"
  - "packages/backend/src/config/contracts.js"
---

# Blockchain module — the only layer allowed to touch ethers.js

## Purpose (dev plan Phase 4 & 8)
Wraps all on-chain reads/writes to the PaperDEX contracts. Every other module (trading, portfolio, markets) goes through this module instead of calling ethers.js itself. Deployed addresses load from `packages/contracts/addresses/sepolia.json` — never hardcode an address here or anywhere else.

## Files
- `blockchain.service.js` — **PLANNED**. Shared low-level helpers (get contract instance, wait for tx, etc.).
- `dex.service.js` — **PLANNED**. PaperDEX contract calls: `executeTrade()`, `getTradeEvents()`, `getTransaction()`.
- `vault.service.js` — **PLANNED**. Vault-specific reads/writes: `getVaultBalance()`.
- `token.service.js` — **PLANNED**. ERC20-style token reads: `getTokenBalance()`, used by portfolio.
- `relayer.service.js` — **PLANNED**. Signs and submits transactions using `RELAYER_PRIVATE_KEY` so users don't need Sepolia ETH. This key exists only in the backend env.
- `blockchain.repository.js` — **PLANNED**. Any Supabase writes tied to on-chain events (e.g. logging a `TradeExecuted` event) live here.
- `infrastructure/blockchain/provider.js` — **PLANNED**. Sepolia RPC provider setup.
- `infrastructure/blockchain/wallet.js` — **PLANNED**. Relayer + quote-signer wallet instances from env-loaded private keys.
- `infrastructure/blockchain/contracts.js` — **PLANNED**. Loads ABI + address from `packages/contracts/addresses/sepolia.json`, returns typed contract instances.

## Rules
1. No module outside `blockchain/` and `infrastructure/blockchain/` calls ethers.js directly. If trading, portfolio, or anything else needs a chain read, it calls into this module's exported functions — no exceptions.
2. Any change to `relayer.service.js`, `wallet.js`, or anything handling `RELAYER_PRIVATE_KEY` / `QUOTE_SIGNER_PRIVATE_KEY` is a root-§5 ask-first case, always.
3. Contract addresses come only from `packages/contracts/addresses/sepolia.json` via `contracts.js` — never inline an address string in a service file.

## Lessons learned (this module only)
_(empty)_
