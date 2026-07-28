// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPaperToken is IERC20 {

    /**
     * Used by PaperDEX to move paper assets without requiring
     * a separate user-paid approve transaction.
     */
    function exchangeTransferFrom(
        address from,
        address to,
        uint256 amount
    ) external;

    function mint(
        address to,
        uint256 amount
    ) external;
}