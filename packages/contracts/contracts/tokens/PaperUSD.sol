// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract PaperUSD is ERC20, AccessControl, Pausable {

    bytes32 public constant MINTER_ROLE =
        keccak256("MINTER_ROLE");

    bytes32 public constant ONBOARDING_ROLE =
        keccak256("ONBOARDING_ROLE");

    bytes32 public constant EXCHANGE_ROLE =
        keccak256("EXCHANGE_ROLE");

    bytes32 public constant PAUSER_ROLE =
        keccak256("PAUSER_ROLE");

    uint256 public constant STARTING_BALANCE =
        100_000 ether;

    mapping(address => bool)
        public hasReceivedStartingBalance;

    error ZeroAddress();
    error ZeroAmount();
    error AlreadyReceivedStartingBalance();

    event StartingBalanceGranted(
        address indexed user,
        uint256 amount
    );

    constructor(address admin)
        ERC20("Paper USD", "USDTP")
    {
        if (admin == address(0)) {
            revert ZeroAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * Creates initial USDTP supply.
     *
     * Used to fund the vault initially.
     */
    function mint(
        address to,
        uint256 amount
    )
        external
        onlyRole(MINTER_ROLE)
        whenNotPaused
    {
        if (to == address(0)) {
            revert ZeroAddress();
        }

        if (amount == 0) {
            revert ZeroAmount();
        }

        _mint(to, amount);
    }

    /**
     * Gives a wallet its initial 100,000 USDTP.
     */
    function grantStartingBalance(
        address user
    )
        external
        onlyRole(ONBOARDING_ROLE)
        whenNotPaused
    {
        if (user == address(0)) {
            revert ZeroAddress();
        }

        if (
            hasReceivedStartingBalance[user]
        ) {
            revert AlreadyReceivedStartingBalance();
        }

        hasReceivedStartingBalance[user] = true;

        _mint(
            user,
            STARTING_BALANCE
        );

        emit StartingBalanceGranted(
            user,
            STARTING_BALANCE
        );
    }

    function exchangeTransferFrom(
        address from,
        address to,
        uint256 amount
    )
        external
        onlyRole(EXCHANGE_ROLE)
        whenNotPaused
    {
        if (
            from == address(0) ||
            to == address(0)
        ) {
            revert ZeroAddress();
        }

        if (amount == 0) {
            revert ZeroAmount();
        }

        _transfer(
            from,
            to,
            amount
        );
    }

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

    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override
    {
        _requireNotPaused();

        super._update(
            from,
            to,
            value
        );
    }
}