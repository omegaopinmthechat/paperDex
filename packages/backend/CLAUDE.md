# PaperDEX Backend — CLAUDE.md

Scope: `packages/backend/**` only. Contracts and frontend are out of scope, except reading `packages/contracts/addresses/sepolia.json` for ABIs/addresses when needed.

Place this file at `packages/backend/CLAUDE.md`. It loads automatically whenever Claude works inside this directory (nested CLAUDE.md files load on demand, not just at session start). Module-level detail lives in `.claude/rules/*.md` next to it and loads only when a matching file is touched — do not duplicate that detail here. Keep this file under ~180 lines; if it needs to grow, move content to a rules file instead of trimming §5/§6 below.

## 1. What this project is
PaperDEX is a paper-trading DEX. The Solidity contracts (V1) are already deployed to Sepolia and complete — no major contract work is expected in this phase. This backend is the orchestration layer between the Next.js frontend and those deployed contracts. [source: PaperDEX_DEVELOPMENT_PLAN.md]

## 2. Stack facts — don't re-derive, don't substitute
- Node.js + Express, plain JavaScript (`.js`), **ESM syntax** — confirmed by `constants/errorCodes.js` and `constants/statusCodes.js`, which both use `export default`. Do not introduce `require`/`module.exports` anywhere in `src/`.
- Supabase (Postgres) is the **application** database (sessions, quote/trade history, cached market data). It is never the source of truth for token balances — on-chain reads via `ethers.js` are.
- Contract addresses load from `packages/contracts/addresses/sepolia.json`. Never hardcode an address in backend code.
- EIP-712 for quote and trade signing. Quote-signer key and relayer key are separate, both server-only.

## 3. Directory map — status legend
- `EXISTS` = real code has been read/written in this repo and its rules file (or this file) reflects what it actually does.
- `PLANNED` = specified only in `PaperDEX_DEVELOPMENT_PLAN.md`, not yet implemented. Treat a PLANNED description as a target, not current behavior — check on disk before assuming it's true.

| Path | Status | Detail lives in |
|---|---|---|
| `src/constants/errorCodes.js`, `statusCodes.js` | EXISTS | `.claude/rules/error-handling.md` |
| `src/modules/auth/**`, `src/middleware/auth.middleware.js` | PLANNED | `.claude/rules/auth.md` |
| `src/modules/users/**` | PLANNED | `.claude/rules/users.md` |
| `src/modules/markets/**`, `src/modules/oracle/**` | PLANNED | `.claude/rules/markets-oracle.md` |
| `src/modules/trading/**` | PLANNED | `.claude/rules/trading.md` |
| `src/modules/portfolio/**` | PLANNED | `.claude/rules/portfolio.md` |
| `src/modules/blockchain/**`, `src/infrastructure/blockchain/**` | PLANNED | `.claude/rules/blockchain.md` |
| `src/infrastructure/database/**`, any `*.repository.js` | PLANNED | `.claude/rules/database.md` |
| `src/utils/response.js`, `utils/errors.js`, `middleware/error.middleware.js` | PLANNED | `.claude/rules/error-handling.md` |
| `src/config/**`, `app.js`, `server.js`, `routes/index.js` | PLANNED | §7 below (low churn, kept here) |

**Rule:** the first time a session creates or substantially edits a file in a PLANNED row, it must (a) flip that row to `EXISTS` here and (b) write 2-4 lines of what the file actually does in the matching rules file. Never describe unwritten code as if it already exists.

## 4. Error / status code contract
Two files already exist and are final unless told otherwise: `src/constants/errorCodes.js`, `src/constants/statusCodes.js`.

- Never write a raw HTTP number (`res.status(400)`) or a raw error string (`"UNAUTHORIZED"`) anywhere in `src/`. Always import from these two files.
- Canonical response shape:
```js
import ERROR_CODES from '../constants/errorCodes.js';
import STATUS_CODES from '../constants/statusCodes.js';

return res.status(STATUS_CODES.BAD_REQUEST).json({
  success: false,
  error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'human-readable message' },
});
```
- If a case needs a code that isn't in either file, **stop and ask (§5)** before inlining a new string — add it to the constants file first, then use it.
- Full behavior of `utils/response.js` / `utils/errors.js` / `error.middleware.js` (which implement this envelope) is documented in `.claude/rules/error-handling.md` once they're written — update that file, not this one.

## 5. Ask-first protocol
A rule that fires before every tool call gets ignored within an hour. These are the actual gates — CLAUDE.md is instructions Claude reads, not a hard block, so treat this list as what you commit to checking, not something enforced for you:

**Stop and ask before:**
- Creating any file not already listed in §3, or diverging from the dev-plan directory layout
- Adding a new npm dependency
- Changing a Supabase table's schema, or a shipped route's request/response shape
- Anything touching secrets: `.env`, `DEPLOYER_PRIVATE_KEY`, `RELAYER_PRIVATE_KEY`, `QUOTE_SIGNER_PRIVATE_KEY`, Supabase service-role key
- Any change to auth, nonce, signature, or replay-protection logic
- Inventing a new error/status code instead of using §4

**Proceed without asking:**
- Reading files, running lint/tests, checking logs
- Implementing a PLANNED file to match what §3/its rules file already specifies
- Bug fixes matching an existing pattern elsewhere in the codebase

If you need this to be unbypassable rather than best-effort, it has to become a `PreToolUse` hook — a separate script, not text in this file. Ask if you want that built.

## 6. Self-update protocol (Lessons Learned)
When a session fixes a bug, gets corrected, or finds a pattern not written down above:
1. Add one line to §8: `YYYY-MM-DD — <file> — <what was wrong> → <rule going forward>`.
2. Module-specific lessons go in that module's rules file, not here.
3. Once §8 passes ~15 lines, fold repeated/settled entries into a permanent rule above and delete the raw log lines. This file does not get to grow into a diary — long CLAUDE.md files get followed less reliably, not more.

## 7. Config / entrypoint files (kept here — low churn, cross-cutting)
- `config/env.js`: loads/validates all env vars at boot; fail fast on a missing required secret, don't fail mid-request.
- `config/database.js`: Supabase client config only, no query logic.
- `config/blockchain.js`: Sepolia RPC + relayer wallet setup config.
- `config/contracts.js`: loads ABIs/addresses from `packages/contracts/addresses/sepolia.json`.
- `app.js`: Express app + middleware wiring. `server.js`: listen only.
- `routes/index.js`: mounts each module's `*.routes.js` under `/api/v1`.

## 8. Lessons Learned log
_(empty — first entry added by whichever session first fixes something)_
