// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract PaperDEXVault is
    AccessControl,
    Pausable
{
    using SafeERC20 for IERC20;

    bytes32 public constant EXCHANGE_ROLE =
        keccak256("EXCHANGE_ROLE");

    bytes32 public constant PAUSER_ROLE =
        keccak256("PAUSER_ROLE");

    error ZeroAddress();
    error ZeroAmount();

    event TokenSent(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    event EmergencyWithdrawal(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    constructor(address admin) {
        if (admin == address(0)) {
            revert ZeroAddress();
        }

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            admin
        );

        _grantRole(
            PAUSER_ROLE,
            admin
        );
    }

    /**
     * Called by PaperDEX when the vault owes
     * tokens to a user.
     */
    function sendToken(
        address token,
        address to,
        uint256 amount
    )
        external
        onlyRole(EXCHANGE_ROLE)
        whenNotPaused
    {
        if (
            token == address(0) ||
            to == address(0)
        ) {
            revert ZeroAddress();
        }

        if (amount == 0) {
            revert ZeroAmount();
        }

        IERC20(token).safeTransfer(
            to,
            amount
        );

        emit TokenSent(
            token,
            to,
            amount
        );
    }

    function getBalance(
        address token
    )
        external
        view
        returns (uint256)
    {
        return IERC20(token)
            .balanceOf(address(this));
    }

    /**
     * Admin recovery function.
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenPaused
    {
        if (
            token == address(0) ||
            to == address(0)
        ) {
            revert ZeroAddress();
        }

        if (amount == 0) {
            revert ZeroAmount();
        }

        IERC20(token).safeTransfer(
            to,
            amount
        );

        emit EmergencyWithdrawal(
            token,
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
}