// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {IPaperToken} from "../interfaces/IPaperToken.sol";
import {IPaperDEXVault} from "../interfaces/IPaperDEXVault.sol";

contract PaperDEX is AccessControl, Pausable, EIP712 {
    // ============================================================
    // ROLES
    // ============================================================

    bytes32 public constant RELAYER_ROLE =
        keccak256("RELAYER_ROLE");

    bytes32 public constant PAUSER_ROLE =
        keccak256("PAUSER_ROLE");

    // ============================================================
    // CONSTANTS
    // ============================================================

    uint8 public constant BUY = 0;
    uint8 public constant SELL = 1;

    /*
     * Price has 8 decimal places.
     *
     * Example:
     *
     * BTC = $100,000
     *
     * price = 100000 * 1e8
     *       = 10000000000000
     */
    uint256 public constant PRICE_SCALE = 1e8;

    bytes32 public constant TRADE_TYPEHASH =
        keccak256(
            "Trade(address token,uint256 price,uint256 amount,uint8 side,address user,uint256 nonce,uint256 deadline)"
        );

    // ============================================================
    // CONTRACT REFERENCES
    // ============================================================

    IPaperToken public immutable usdtp;

    IPaperDEXVault public immutable vault;

    address public quoteSigner;

    // ============================================================
    // STATE
    // ============================================================

    /*
     * token => supported?
     */
    mapping(address => bool) public supportedTokens;

    /*
     * user => nonce => used
     */
    mapping(address => mapping(uint256 => bool))
        public usedNonces;

    // ============================================================
    // ERRORS
    // ============================================================

    error ZeroAddress();
    error UnsupportedToken();
    error InvalidAmount();
    error InvalidPrice();
    error InvalidSide();
    error QuoteExpired();
    error NonceAlreadyUsed();
    error InvalidQuoteSignature();
    error InvalidUserSignature();
    error InsufficientVaultLiquidity();

    // ============================================================
    // EVENTS
    // ============================================================

    event TokenAdded(
        address indexed token
    );

    event TokenRemoved(
        address indexed token
    );

    event QuoteSignerUpdated(
        address indexed oldSigner,
        address indexed newSigner
    );

    event TradeExecuted(
        address indexed user,
        address indexed token,
        uint8 indexed side,
        uint256 tokenAmount,
        uint256 price,
        uint256 usdAmount,
        uint256 nonce
    );

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor(
        address usdtpAddress,
        address vaultAddress,
        address admin,
        address relayer,
        address initialQuoteSigner
    )
        EIP712("PaperDEX", "1")
    {
        if (
            usdtpAddress == address(0) ||
            vaultAddress == address(0) ||
            admin == address(0) ||
            relayer == address(0) ||
            initialQuoteSigner == address(0)
        ) {
            revert ZeroAddress();
        }

        usdtp = IPaperToken(usdtpAddress);

        vault = IPaperDEXVault(vaultAddress);

        quoteSigner = initialQuoteSigner;

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            admin
        );

        _grantRole(
            RELAYER_ROLE,
            relayer
        );

        _grantRole(
            PAUSER_ROLE,
            admin
        );
    }

    // ============================================================
    // TOKEN MANAGEMENT
    // ============================================================

    function addSupportedToken(
        address token
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (token == address(0)) {
            revert ZeroAddress();
        }

        supportedTokens[token] = true;

        emit TokenAdded(token);
    }

    function removeSupportedToken(
        address token
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        supportedTokens[token] = false;

        emit TokenRemoved(token);
    }

    // ============================================================
    // QUOTE SIGNER
    // ============================================================

    function setQuoteSigner(
        address newSigner
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (newSigner == address(0)) {
            revert ZeroAddress();
        }

        address oldSigner = quoteSigner;

        quoteSigner = newSigner;

        emit QuoteSignerUpdated(
            oldSigner,
            newSigner
        );
    }

    // ============================================================
    // EXECUTE TRADE
    // ============================================================

    function executeTrade(
        address token,
        uint256 price,
        uint256 amount,
        uint8 side,
        address user,
        uint256 nonce,
        uint256 deadline,
        bytes calldata quoteSignature,
        bytes calldata userSignature
    )
        external
        onlyRole(RELAYER_ROLE)
        whenNotPaused
    {
        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!supportedTokens[token]) {
            revert UnsupportedToken();
        }

        if (user == address(0)) {
            revert ZeroAddress();
        }

        if (amount == 0) {
            revert InvalidAmount();
        }

        if (price == 0) {
            revert InvalidPrice();
        }

        if (
            side != BUY &&
            side != SELL
        ) {
            revert InvalidSide();
        }

        if (block.timestamp > deadline) {
            revert QuoteExpired();
        }

        if (usedNonces[user][nonce]) {
            revert NonceAlreadyUsed();
        }

        // --------------------------------------------------------
        // VERIFY QUOTE SIGNATURE
        // --------------------------------------------------------

        _verifySignature(
            token,
            price,
            amount,
            side,
            user,
            nonce,
            deadline,
            quoteSignature,
            quoteSigner
        );

        // --------------------------------------------------------
        // VERIFY USER SIGNATURE
        // --------------------------------------------------------

        _verifySignature(
            token,
            price,
            amount,
            side,
            user,
            nonce,
            deadline,
            userSignature,
            user
        );

        // --------------------------------------------------------
        // CALCULATE USD VALUE
        // --------------------------------------------------------

        uint256 usdAmount =
            (amount * price) /
            PRICE_SCALE;

        // --------------------------------------------------------
        // MARK NONCE
        // --------------------------------------------------------

        usedNonces[user][nonce] = true;

        // --------------------------------------------------------
        // BUY
        // --------------------------------------------------------

        if (side == BUY) {

            /*
             * User pays USDTP to Vault.
             */
            usdtp.exchangeTransferFrom(
                user,
                address(vault),
                usdAmount
            );

            /*
             * Check Vault has enough asset.
             */
            if (
                vault.getBalance(token) <
                amount
            ) {
                revert InsufficientVaultLiquidity();
            }

            /*
             * Vault sends asset to user.
             */
            vault.sendToken(
                token,
                user,
                amount
            );

        }

        // --------------------------------------------------------
        // SELL
        // --------------------------------------------------------

        else {

            /*
             * Check Vault has enough USDTP.
             */
            if (
                vault.getBalance(
                    address(usdtp)
                ) <
                usdAmount
            ) {
                revert InsufficientVaultLiquidity();
            }

            /*
             * User sends paper asset to Vault.
             */
            IPaperToken(token)
                .exchangeTransferFrom(
                    user,
                    address(vault),
                    amount
                );

            /*
             * Vault sends USDTP to user.
             */
            vault.sendToken(
                address(usdtp),
                user,
                usdAmount
            );
        }

        // --------------------------------------------------------
        // EVENT
        // --------------------------------------------------------

        emit TradeExecuted(
            user,
            token,
            side,
            amount,
            price,
            usdAmount,
            nonce
        );
    }

    // ============================================================
    // SIGNATURE VERIFICATION
    // ============================================================

    function _verifySignature(
    address token,
    uint256 price,
    uint256 amount,
    uint8 side,
    address user,
    uint256 nonce,
    uint256 deadline,
    bytes calldata signature,
    address expectedSigner
)
    internal
    view
{
    bytes32 structHash = keccak256(
        abi.encode(
            TRADE_TYPEHASH,
            token,
            price,
            amount,
            side,
            user,
            nonce,
            deadline
        )
    );

    bytes32 digest = _hashTypedDataV4(structHash);

    address recovered = ECDSA.recover(
        digest,
        signature
    );

    if (recovered != expectedSigner) {
        if (expectedSigner == quoteSigner) {
            revert InvalidQuoteSignature();
        }

        revert InvalidUserSignature();
    }
}

    // ============================================================
    // PRICE CALCULATION
    // ============================================================

    function calculateUSDValue(
        uint256 amount,
        uint256 price
    )
        external
        pure
        returns (uint256)
    {
        return
            (amount * price) /
            PRICE_SCALE;
    }

    // ============================================================
    // PAUSE
    // ============================================================

    function pause()
        external
        onlyRole(PAUSER_ROLE)
    {
        _pause();
    }

    function unpause()
        external
        onlyRole(PAUSER_ROLE)
    {
        _unpause();
    }
}
