// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IPaperDEXVault {

    function sendToken(
        address token,
        address to,
        uint256 amount
    ) external;

    function getBalance(
        address token
    ) external view returns (uint256);
}
