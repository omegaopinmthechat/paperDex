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
- `token.service.js` — **EXISTS**. `hasReceivedStartingBalance(address)` (free read, no gas) and `grantStartingBalance(address)` (signs via relayer wallet, parses `StartingBalanceGranted` event from receipt, returns `{ txHash, blockNumber, amount, status }`). Uses concrete PaperUSD ABI from Hardhat artifact — NOT IPaperToken.
- `relayer.service.js` — **EXISTS**. `sendAndWait(txPromise)` — submits a signed tx and waits 1 confirmation, returns `{ txHash, blockNumber, receipt }`.
- `blockchain.repository.js` — **EXISTS**. `insertTransaction({userId, txHash, type, token, direction, amount, status, blockNumber})` — writes to `paperdex.transactions`.
- `infrastructure/blockchain/provider.js` — **EXISTS**. Sepolia `JsonRpcProvider` singleton from `env.SEPOLIA_RPC_URL`.
- `infrastructure/blockchain/wallet.js` — **EXISTS**. Exports `relayerWallet` (also holds `ONBOARDING_ROLE` on Sepolia — confirmed on-chain 2025-08-08). Address: `0xDb8B9b39d7215D82E6ceaFEB84e9F5B17F790213`.
- `infrastructure/blockchain/contracts.js` — **EXISTS**. Loads PaperUSD ABI from Hardhat artifact (`artifacts/contracts/tokens/PaperUSD.sol/PaperUSD.json`) and address from `deployments/sepolia.json`. Exports `paperUsdContract` (read-only) and `paperUsdWithSigner` (connected to relayerWallet).

## Rules
1. No module outside `blockchain/` and `infrastructure/blockchain/` calls ethers.js directly. If trading, portfolio, or anything else needs a chain read, it calls into this module's exported functions — no exceptions.
2. Any change to `relayer.service.js`, `wallet.js`, or anything handling `RELAYER_PRIVATE_KEY` / `QUOTE_SIGNER_PRIVATE_KEY` is a root-§5 ask-first case, always.
3. Contract addresses come only from `packages/contracts/addresses/sepolia.json` via `contracts.js` — never inline an address string in a service file.

## Lessons learned (this module only)
_(empty)_
