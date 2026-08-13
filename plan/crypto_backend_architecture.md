# Crypto Project Backend Architecture

## 1. Overall Architecture

The backend follows a modular architecture.

``` text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository / Infrastructure
   ↓
Database / Blockchain / External API
```

The main rule is:

> **Controller handles HTTP, Service handles business logic, Repository
> handles data access, Infrastructure handles external systems.**

------------------------------------------------------------------------

# 2. Backend File Structure

``` text
packages/backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── blockchain.js
│   │   └── contracts.js
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.validator.js
│   │   │   └── nonce.service.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validator.js
│   │   │
│   │   ├── markets/
│   │   │   ├── market.controller.js
│   │   │   ├── market.service.js
│   │   │   ├── market.repository.js
│   │   │   ├── market.routes.js
│   │   │   └── market.validator.js
│   │   │
│   │   ├── oracle/
│   │   │   ├── price.provider.js
│   │   │   ├── price.service.js
│   │   │   └── price.cache.js
│   │   │
│   │   ├── trading/
│   │   │   ├── trading.controller.js
│   │   │   ├── trading.service.js
│   │   │   ├── trading.repository.js
│   │   │   ├── quote.service.js
│   │   │   ├── trading.routes.js
│   │   │   └── validators/
│   │   │       ├── trade.validator.js
│   │   │       └── order.validator.js
│   │   │
│   │   ├── portfolio/
│   │   │   ├── portfolio.controller.js
│   │   │   ├── portfolio.service.js
│   │   │   ├── portfolio.repository.js
│   │   │   └── portfolio.routes.js
│   │   │
│   │   └── blockchain/
│   │       ├── blockchain.service.js
│   │       ├── dex.service.js
│   │       ├── vault.service.js
│   │       ├── token.service.js
│   │       ├── relayer.service.js
│   │       └── blockchain.repository.js
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── supabase.js
│   │   │   └── client.js
│   │   │
│   │   ├── blockchain/
│   │   │   ├── provider.js
│   │   │   ├── wallet.js
│   │   │   └── contracts.js
│   │   │
│   │   └── external/
│   │       └── http.client.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── response.js
│   │   ├── errors.js
│   │   └── helpers.js
│   │
│   ├── constants/
│   │   ├── errorCodes.js
│   │   └── statusCodes.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── eslint.config.js
└── package.json
```

------------------------------------------------------------------------

# 3. Architecture Rules

Every part of the backend has a specific responsibility.

``` text
Route
  → Defines API endpoints

Middleware
  → Authentication, validation, rate limiting, error handling

Controller
  → Handles HTTP request and HTTP response

Service
  → Contains business logic

Repository
  → Handles database/application data access

Infrastructure
  → Communicates with external systems

Config
  → Provides application configuration

Utils
  → Generic reusable helpers

Constants
  → Application-wide constant values
```

The most important rule:

> **Never put business logic in routes/controllers, never put database
> queries directly in controllers, and never put blockchain connection
> code directly inside controllers.**

------------------------------------------------------------------------

# 4. `config/`

``` text
src/config/
├── env.js
├── database.js
├── blockchain.js
└── contracts.js
```

The `config` folder contains application configuration.

## `env.js`

Reads and validates environment variables.

Examples:

``` text
PORT
SUPABASE_URL
SUPABASE_KEY
RPC_URL
PRIVATE_KEY
JWT_SECRET
```

Flow:

``` text
.env
 ↓
env.js
 ↓
Application
```

It should not contain business logic.

## `database.js`

Contains database-related configuration.

It defines database settings and configuration used by the database
infrastructure.

The actual Supabase client belongs in:

``` text
infrastructure/database/
```

## `blockchain.js`

Contains blockchain configuration such as:

``` text
RPC URL
Network
Chain ID
Wallet configuration
```

It defines which blockchain/network the backend connects to.

## `contracts.js`

Contains configuration for deployed smart contracts.

Examples:

``` text
DEX_CONTRACT_ADDRESS
VAULT_CONTRACT_ADDRESS
TOKEN_CONTRACT_ADDRESS
```

Contract addresses can be loaded from:

``` text
packages/contracts/addresses/sepolia.json
```

------------------------------------------------------------------------

# 5. `modules/`

The `modules` folder contains the actual business features of the
backend.

``` text
modules/
├── auth/
├── users/
├── markets/
├── oracle/
├── trading/
├── portfolio/
└── blockchain/
```

Each module is a self-contained business feature.

A module can contain its own:

``` text
Routes
Controllers
Services
Repositories
Validators
```

This prevents unrelated features from being mixed together.

------------------------------------------------------------------------

# 6. `modules/auth/`

``` text
auth/
├── auth.controller.js
├── auth.service.js
├── auth.repository.js
├── auth.routes.js
├── auth.validator.js
└── nonce.service.js
```

Responsible for:

``` text
Wallet authentication
Login
Signature verification
Nonce generation
Authentication sessions
JWT/session handling
```

## `auth.routes.js`

Defines authentication API endpoints.

Examples:

``` text
POST /api/auth/nonce
POST /api/auth/verify
POST /api/auth/logout
```

Routes should only connect endpoints to middleware/controllers.

They should not contain authentication logic.

## `auth.controller.js`

Handles the HTTP request and response.

Responsibilities:

``` text
Read req.body
Read req.params
Read req.user
Call auth.service
Send HTTP response
```

The controller should remain thin.

## `auth.service.js`

Contains authentication business logic.

Example flow:

``` text
Generate nonce
↓
Verify wallet signature
↓
Find/create user
↓
Create authentication session
↓
Return authenticated user
```

This is where authentication decisions are made.

## `auth.repository.js`

Handles authentication-related data access.

Examples:

``` text
findUserByWallet()
createUser()
saveNonce()
getNonce()
deleteNonce()
```

It should not decide whether a wallet signature is valid.

That belongs to the service.

## `auth.validator.js`

Validates incoming authentication data.

Examples:

``` text
walletAddress
signature
message
chainId
```

Invalid data should result in a validation error before business logic
runs.

## `nonce.service.js`

Handles wallet authentication nonces.

Responsibilities:

``` text
Generate nonce
Store nonce
Retrieve nonce
Invalidate nonce
```

Keeping nonce handling separate prevents `auth.service.js` from becoming
unnecessarily large.

------------------------------------------------------------------------

# 7. `modules/users/`

``` text
users/
├── user.controller.js
├── user.service.js
├── user.repository.js
├── user.routes.js
└── user.validator.js
```

Responsible for user-related operations.

Examples:

``` text
Get profile
Update profile
Get wallet information
Update user settings
```

Typical request flow:

``` text
GET /api/users/me
        ↓
user.routes
        ↓
user.controller
        ↓
user.service
        ↓
user.repository
        ↓
Supabase
```

## `user.controller.js`

Handles HTTP requests/responses for users.

## `user.service.js`

Contains user-related business logic.

## `user.repository.js`

Handles user data access.

Examples:

``` text
findUser()
updateUser()
findUserByWallet()
```

## `user.routes.js`

Defines user endpoints.

## `user.validator.js`

Validates incoming user data.

------------------------------------------------------------------------

# 8. `modules/markets/`

``` text
markets/
├── market.controller.js
├── market.service.js
├── market.repository.js
├── market.routes.js
└── market.validator.js
```

Responsible for market information.

Examples:

``` text
GET /api/markets
GET /api/markets/:id
GET /api/markets/:id/stats
```

## `market.controller.js`

Handles HTTP requests and responses.

## `market.service.js`

Processes market information and applies business rules.

## `market.repository.js`

Retrieves/stores market data from the database.

## `market.routes.js`

Defines market endpoints.

## `market.validator.js`

Validates market-related request parameters.

------------------------------------------------------------------------

# 9. `modules/oracle/`

``` text
oracle/
├── price.provider.js
├── price.service.js
└── price.cache.js
```

Responsible for crypto price data.

This module does not necessarily need its own controller because it can
be used internally by other modules.

Typical flow:

``` text
Trading
   ↓
price.service
   ↓
price.provider
   ↓
External price source
```

## `price.provider.js`

Communicates with the external price source.

Possible sources:

``` text
CoinGecko
CoinMarketCap
Binance
Chainlink
```

Its job is:

> Get the requested asset price from the external source.

It should not contain trading logic.

## `price.service.js`

Processes and normalizes price information.

Example:

``` text
Get ETH price
↓
Validate price
↓
Normalize price
↓
Return price
```

## `price.cache.js`

Caches recently fetched prices.

Example:

``` text
Request ETH price
       ↓
Is cached price available?
     /       \
   YES        NO
   ↓           ↓
Return      API call
price          ↓
             Cache
               ↓
           Return price
```

------------------------------------------------------------------------

# 10. `modules/trading/`

``` text
trading/
├── trading.controller.js
├── trading.service.js
├── trading.repository.js
├── quote.service.js
├── trading.routes.js
└── validators/
    ├── trade.validator.js
    └── order.validator.js
```

This is one of the main modules of the crypto application.

Responsible for:

``` text
Buy
Sell
Swap
Trade validation
Quotes
Trade history
Order processing
```

## `trading.routes.js`

Defines trading endpoints.

Examples:

``` text
POST /api/trading/quote
POST /api/trading/buy
POST /api/trading/sell
POST /api/trading/swap
GET  /api/trading/history
```

## `trading.controller.js`

Handles HTTP requests.

Example:

``` text
POST /api/trading/swap
        ↓
Extract request data
        ↓
trading.service
        ↓
Return HTTP response
```

It should not calculate swap amounts or directly interact with Ethereum.

## `trading.service.js`

Contains the main trading business logic.

Example:

``` text
User requests ETH → USDC swap
            ↓
Validate trade
            ↓
Get current price
            ↓
Calculate/check quote
            ↓
Check user
            ↓
Prepare blockchain transaction
            ↓
Execute/submit transaction
            ↓
Record trade
```

The trading service acts as the main orchestrator.

## `quote.service.js`

Responsible specifically for trade quotes.

Example:

``` text
ETH → USDC
1 ETH
 ↓
Quote Service
 ↓
Expected USDC amount
```

It may use:

``` text
Oracle
Blockchain
DEX service
```

## `trading.repository.js`

Handles trading data persistence/retrieval.

Examples:

``` text
createTrade()
getTrade()
getUserTradeHistory()
updateTradeStatus()
```

It communicates with the database through the database infrastructure.

It should not execute blockchain transactions.

## `validators/trade.validator.js`

Validates trade request data.

Examples:

``` text
tokenIn
tokenOut
amount
slippage
walletAddress
```

## `validators/order.validator.js`

Validates order-related data if the application supports orders.

------------------------------------------------------------------------

# 11. `modules/portfolio/`

``` text
portfolio/
├── portfolio.controller.js
├── portfolio.service.js
├── portfolio.repository.js
└── portfolio.routes.js
```

Responsible for:

``` text
User holdings
Token balances
Portfolio value
Profit/loss
Asset allocation
```

Example:

``` text
GET /api/portfolio
```

Typical flow:

``` text
Controller
    ↓
Portfolio Service
    ↓
 ┌───────────────┐
 │               │
Database     Blockchain
 │               │
 └───────┬───────┘
         ↓
Portfolio calculation
         ↓
Controller
         ↓
Frontend
```

## `portfolio.controller.js`

Handles HTTP requests and responses.

## `portfolio.service.js`

Calculates and processes portfolio information.

It may combine:

``` text
Database data
+
Blockchain balances
+
Current prices
```

## `portfolio.repository.js`

Retrieves stored portfolio/trading/user data from the database.

## `portfolio.routes.js`

Defines portfolio API endpoints.

------------------------------------------------------------------------

# 12. `modules/blockchain/`

``` text
blockchain/
├── blockchain.service.js
├── dex.service.js
├── vault.service.js
├── token.service.js
├── relayer.service.js
└── blockchain.repository.js
```

This module contains application-level blockchain operations.

Important distinction:

``` text
modules/blockchain/
```

answers:

> What blockchain operation does the application want to perform?

While:

``` text
infrastructure/blockchain/
```

answers:

> How does the backend technically connect to the blockchain?

------------------------------------------------------------------------

## `blockchain.service.js`

General blockchain application operations.

Examples:

``` text
Get transaction
Check transaction status
Get wallet balance
Wait for confirmation
```

## `dex.service.js`

Handles DEX smart-contract operations.

Examples:

``` text
Get swap quote
Execute swap
Get liquidity information
```

## `vault.service.js`

Handles vault contract operations.

Examples:

``` text
Deposit
Withdraw
Get vault balance
```

## `token.service.js`

Handles ERC-20 operations.

Examples:

``` text
Get token balance
Approve token
Check allowance
Transfer token
```

## `relayer.service.js`

Handles transactions submitted by a backend-controlled relayer wallet.

Example:

``` text
Create transaction
↓
Sign transaction
↓
Submit transaction
↓
Track transaction
```

## `blockchain.repository.js`

Handles blockchain-related data access that needs to be abstracted
behind a repository.

For example:

``` text
Get stored transaction records
Get indexed blockchain data
```

------------------------------------------------------------------------

# 13. `infrastructure/`

``` text
infrastructure/
├── database/
├── blockchain/
└── external/
```

This layer communicates with external technologies and systems.

The infrastructure layer should contain technical implementation
details.

------------------------------------------------------------------------

# 14. `infrastructure/database/`

``` text
database/
├── supabase.js
└── client.js
```

## `client.js`

Creates and configures the Supabase client.

Flow:

``` text
Supabase URL
+
Supabase Key
↓
Supabase Client
```

## `supabase.js`

Contains reusable Supabase/database-specific helpers.

The general dependency should be:

``` text
Repository
   ↓
Database Infrastructure
   ↓
Supabase
```

Repositories should not create a new Supabase client every time.

------------------------------------------------------------------------

# 15. `infrastructure/blockchain/`

``` text
blockchain/
├── provider.js
├── wallet.js
└── contracts.js
```

This is the technical blockchain connection layer.

## `provider.js`

Creates the connection to Ethereum.

``` text
Backend
   ↓
Provider
   ↓
Sepolia RPC
   ↓
Ethereum
```

## `wallet.js`

Creates/configures the wallet or signer when the backend needs one.

``` text
PRIVATE_KEY
     ↓
Wallet
     ↓
Signer
```

Private keys must never be hardcoded.

## `contracts.js`

Creates smart-contract instances using:

``` text
Contract Address
+
ABI
+
Provider/Signer
```

Examples:

``` text
DEX contract
Vault contract
Token contract
```

------------------------------------------------------------------------

# 16. `infrastructure/external/`

``` text
external/
└── http.client.js
```

Provides generic HTTP communication with external services.

Example:

``` text
Backend
 ↓
HTTP Client
 ↓
External API
```

The oracle provider can use this instead of implementing HTTP
communication separately.

------------------------------------------------------------------------

# 17. `middleware/`

``` text
middleware/
├── auth.middleware.js
├── error.middleware.js
├── rateLimit.middleware.js
└── validation.middleware.js
```

Middleware runs between the incoming request and controller.

------------------------------------------------------------------------

## `auth.middleware.js`

Checks whether the user is authenticated.

``` text
Request
 ↓
Auth Middleware
 ↓
Authenticated?
 /        \
YES        NO
 ↓         ↓
Controller 401
```

It should attach authenticated user information to the request when
appropriate.

------------------------------------------------------------------------

## `error.middleware.js`

Centralized error handling.

Instead of duplicating error response logic in every controller, errors
are passed to the centralized error middleware.

``` text
Controller
   ↓
Error
   ↓
error.middleware
   ↓
HTTP error response
```

------------------------------------------------------------------------

## `rateLimit.middleware.js`

Prevents API abuse.

Example:

``` text
100 requests/minute
```

Sensitive endpoints such as authentication and trading may use stricter
limits.

------------------------------------------------------------------------

## `validation.middleware.js`

Runs validation before the request reaches the controller.

``` text
Request
 ↓
Validation
 ↓
Controller
```

------------------------------------------------------------------------

# 18. `routes/index.js`

This is the main route aggregator.

It combines routes from all modules.

Conceptually:

``` text
/api
 │
 ├── /auth
 ├── /users
 ├── /markets
 ├── /trading
 └── /portfolio
```

Structure:

``` text
routes/index.js
      │
      ├── auth.routes.js
      ├── user.routes.js
      ├── market.routes.js
      ├── trading.routes.js
      └── portfolio.routes.js
```

`app.js` mounts the main router.

------------------------------------------------------------------------

# 19. `utils/`

``` text
utils/
├── logger.js
├── response.js
├── errors.js
└── helpers.js
```

Contains generic reusable utilities.

------------------------------------------------------------------------

## `logger.js`

Provides application logging.

Examples:

``` text
INFO
WARN
ERROR
DEBUG
```

------------------------------------------------------------------------

## `response.js`

Standardizes API responses.

Example:

``` json
{
  "success": true,
  "data": {}
}
```

Possible error response:

``` json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Invalid wallet signature"
  }
}
```

------------------------------------------------------------------------

## `errors.js`

Defines custom application errors.

Examples:

``` text
NotFoundError
UnauthorizedError
ValidationError
BlockchainError
ConflictError
```

------------------------------------------------------------------------

## `helpers.js`

Contains small generic helper functions that do not belong to a specific
module.

Do not put business logic here.

If a function is specifically related to trading, authentication,
blockchain, etc., it should normally live inside the appropriate module
instead.

------------------------------------------------------------------------

# 20. `constants/`

``` text
constants/
├── errorCodes.js
└── statusCodes.js
```

Contains application-wide constants.

Examples:

``` text
USER_NOT_FOUND
INVALID_SIGNATURE
TRADE_FAILED
TRANSACTION_PENDING
```

Keeping constants here prevents magic strings/numbers from being
scattered throughout the application.

------------------------------------------------------------------------

# 21. `app.js`

`app.js` creates and configures the Express application.

Responsibilities:

``` text
Initialize Express
↓
Configure JSON parsing
↓
Configure CORS
↓
Configure middleware
↓
Mount routes
↓
Configure error handling
↓
Export app
```

Example responsibility:

``` js
const express = require("express");

const app = express();

app.use(express.json());

// middleware
// routes
// error handler

module.exports = app;
```

`app.js` should NOT call:

``` js
app.listen(...)
```

------------------------------------------------------------------------

# 22. `server.js`

`server.js` is responsible for actually starting the HTTP server.

Flow:

``` text
server.js
   ↓
app.js
   ↓
Express application
   ↓
app.listen(PORT)
```

Example:

``` js
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

The separation between `app.js` and `server.js` is useful because tests
can import `app.js` without starting a real HTTP server.

------------------------------------------------------------------------

# 23. Complete Request Flow

Example request:

``` text
POST /api/trading/swap
```

The request should flow approximately like this:

``` text
Frontend
   │
   ▼
routes/index.js
   │
   ▼
trading.routes.js
   │
   ▼
validation.middleware
   │
   ▼
auth.middleware
   │
   ▼
trading.controller.js
   │
   ▼
trading.service.js
   │
   ├───────────────► quote.service.js
   │                       │
   │                       ▼
   │                  oracle/
   │
   ├───────────────► dex.service.js
   │                       │
   │                       ▼
   │              infrastructure/blockchain/
   │                       │
   │                       ▼
   │                    Sepolia
   │
   └───────────────► trading.repository.js
                           │
                           ▼
                    infrastructure/database/
                           │
                           ▼
                        Supabase
```

------------------------------------------------------------------------

# 24. Responsibilities Summary

  Layer              Responsibility
  ------------------ -------------------------------------------------
  `routes`           Defines API endpoints
  `middleware`       Auth, validation, rate limiting, error handling
  `controller`       Handles HTTP request/response
  `service`          Business logic
  `repository`       Data access
  `infrastructure`   External system communication
  `config`           Configuration
  `utils`            Generic reusable helpers
  `constants`        Shared constants
  `app.js`           Creates/configures Express
  `server.js`        Starts HTTP server

------------------------------------------------------------------------

# 25. Dependency Rules

The backend should follow these rules:

``` text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Infrastructure
```

Services can also use other services when required:

``` text
Trading Service
   ├── Quote Service
   ├── Oracle Service
   └── Blockchain Service
```

Infrastructure should not contain business decisions.

Controllers should not contain business logic.

Routes should not contain business logic.

Repositories should not contain business logic.

Utilities should not become a dumping ground for business logic.

------------------------------------------------------------------------

# 26. Example Trading Flow

A complete swap could work like this:

``` text
1. Frontend
   |
   | POST /api/trading/swap
   ↓
2. trading.routes.js
   |
   ↓
3. validation.middleware.js
   |
   ↓
4. auth.middleware.js
   |
   ↓
5. trading.controller.js
   |
   ↓
6. trading.service.js
   |
   ├── Validate trading rules
   |
   ├── quote.service.js
   |       |
   |       └── oracle/price.service.js
   |
   ├── blockchain/dex.service.js
   |       |
   |       └── infrastructure/blockchain/contracts.js
   |               |
   |               └── Sepolia
   |
   └── trading.repository.js
           |
           └── infrastructure/database/
                   |
                   └── Supabase
```

------------------------------------------------------------------------

# 27. Example Authentication Flow

``` text
Frontend
   |
   | POST /api/auth/verify
   ↓
auth.routes.js
   ↓
auth.validator.js
   ↓
auth.controller.js
   ↓
auth.service.js
   |
   ├── nonce.service.js
   |
   ├── Verify wallet signature
   |
   └── auth.repository.js
           |
           └── Supabase
   ↓
Authentication response
   ↓
Frontend
```

------------------------------------------------------------------------

# 28. Example Portfolio Flow

``` text
Frontend
   |
   | GET /api/portfolio
   ↓
portfolio.routes.js
   ↓
auth.middleware.js
   ↓
portfolio.controller.js
   ↓
portfolio.service.js
   |
   ├── portfolio.repository.js
   |       |
   |       └── Supabase
   |
   ├── blockchain/token.service.js
   |       |
   |       └── infrastructure/blockchain/
   |
   └── oracle/price.service.js
   |
   ↓
Calculate portfolio value
   ↓
Controller
   ↓
Frontend
```

------------------------------------------------------------------------

# 29. Important AI Coding Rules

When an AI assistant modifies or creates backend code, it should follow
these rules.

## Rule 1 --- Keep modules isolated

Authentication code belongs in:

``` text
modules/auth/
```

Trading code belongs in:

``` text
modules/trading/
```

Portfolio code belongs in:

``` text
modules/portfolio/
```

Do not mix unrelated business logic.

## Rule 2 --- Controllers must remain thin

Controllers should:

``` text
Receive request
↓
Call service
↓
Return response
```

Controllers should not contain complex calculations, database queries,
or blockchain operations.

## Rule 3 --- Services contain business logic

Complex decisions and workflows belong in services.

Example:

``` text
Should this trade be allowed?
How should the quote be calculated?
Should the transaction be submitted?
What happens after confirmation?
```

These belong in services.

## Rule 4 --- Repositories handle data access

Repositories should handle:

``` text
SELECT
INSERT
UPDATE
DELETE
```

or their Supabase equivalents.

They should not decide business rules.

## Rule 5 --- Blockchain connection belongs to infrastructure

Provider, wallet, signer, and contract initialization belong in:

``` text
infrastructure/blockchain/
```

Business-level blockchain operations belong in:

``` text
modules/blockchain/
```

## Rule 6 --- Do not duplicate clients

Do not create a new Supabase client or blockchain provider in every
service.

Use the shared infrastructure clients.

## Rule 7 --- Do not expose secrets

Never hardcode:

``` text
Private keys
Supabase service keys
RPC secrets
JWT secrets
API keys
```

Use environment variables.

## Rule 8 --- Keep `utils/` generic

If a helper is specific to trading, put it in trading.

If it is specific to authentication, put it in auth.

Only truly generic functionality belongs in `utils/`.

## Rule 9 --- Use `app.js` and `server.js` separately

``` text
app.js
→ Configure Express

server.js
→ Start Express
```

Do not put `app.listen()` inside `app.js`.

------------------------------------------------------------------------

# 30. Final Mental Model

The easiest way to understand the backend is:

``` text
                    FRONTEND
                       │
                       ▼
                    ROUTES
                       │
                       ▼
                  MIDDLEWARE
                       │
                       ▼
                  CONTROLLER
                       │
                       ▼
                    SERVICE
                 ┌─────┴─────┐
                 │           │
                 ▼           ▼
            REPOSITORY    OTHER SERVICES
                 │           │
                 ▼           ▼
             DATABASE    BLOCKCHAIN SERVICE
                 │           │
                 ▼           ▼
             SUPABASE    BLOCKCHAIN INFRA
                             │
                             ▼
                           SEPOLIA
```

In one sentence:

> **Routes receive requests, middleware protects/validates them,
> controllers handle HTTP, services contain business logic, repositories
> handle data, and infrastructure communicates with external systems
> such as Supabase and Ethereum.**
