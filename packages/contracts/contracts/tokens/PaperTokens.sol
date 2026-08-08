// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract PaperToken is ERC20, AccessControl, Pausable {

    bytes32 public constant MINTER_ROLE =
        keccak256("MINTER_ROLE");

    bytes32 public constant EXCHANGE_ROLE =
        keccak256("EXCHANGE_ROLE");

    bytes32 public constant PAUSER_ROLE =
        keccak256("PAUSER_ROLE");

    error ZeroAddress();
    error ZeroAmount();

    constructor(
        string memory name_,
        string memory symbol_,
        address admin
    )
        ERC20(name_, symbol_)
    {
        if (admin == address(0)) {
            revert ZeroAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * Initial supply / vault replenishment.
     *
     * NOT called during normal trades.
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
     * Allows the authorized PaperDEX contract to move tokens
     * during a user-authorized trade without ERC20 allowance.
     *
     * This is intentionally privileged because these tokens
     * represent simulated assets only.
     */
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

        _transfer(from, to, amount);
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
