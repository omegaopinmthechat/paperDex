---
paths:
  - "packages/backend/src/constants/**"
  - "packages/backend/src/middleware/error.middleware.js"
  - "packages/backend/src/utils/errors.js"
  - "packages/backend/src/utils/response.js"
---

# Error handling & response envelope

## Files
- `constants/errorCodes.js` — **EXISTS**. Exports `ERROR_CODES`, a flat object of string constants grouped by domain: General, Authentication, Users, Markets, Trading, Portfolio, Oracle/Price, Blockchain, Token, DEX, Vault, External Services. Default export, ESM (`export default ERROR_CODES`).
- `constants/statusCodes.js` — **EXISTS**. Exports `STATUS_CODES`, HTTP status numbers as named constants (`OK: 200`, `BAD_REQUEST: 400`, `UNAUTHORIZED: 401`, etc.). Default export, ESM.
- `utils/response.js` — **PLANNED**. Should implement the envelope below as reusable helpers, e.g. `sendSuccess(res, data)`, `sendError(res, statusCode, errorCode, message)`, so controllers never hand-build the JSON shape.
- `utils/errors.js` — **PLANNED**. Should define an `AppError` class carrying `{ statusCode, errorCode, message }` so services can `throw new AppError(...)` and let the error middleware format the response.
- `middleware/error.middleware.js` — **PLANNED**. Single Express 4-arg error-handling middleware that catches anything reaching `next(err)`, maps it through `utils/errors.js` + the two constants files, and is the *only* place that calls `res.status(...).json(...)` for error responses.

## Rules
1. Exact error shape, built via `utils/response.js` once it exists — don't hand-roll it elsewhere:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```
2. Exact success shape: `{ "success": true, "data": ... }`.
3. `code` values must come from `ERROR_CODES`. `res.status()` values must come from `STATUS_CODES`. No exceptions. Missing code = ask first (see root CLAUDE.md §5), not an inline string.
4. Controllers should not contain response-formatting try/catch — they call `next(err)` and let `error.middleware.js` handle it. Until that file exists, don't invent a second error-formatting pattern; ask first.

## Lessons learned (this module only)
_(empty)_
