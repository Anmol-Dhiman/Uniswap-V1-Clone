//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IFactory {
    function createExchange(
        address _token
    ) external returns (address _exchange);

    function getTokenFromExchange(
        address _exchange
    ) external view returns (address _token);

    function getExchangeFromToken(
        address _token
    ) external view returns (address _exchange);

    function getExchangeFromID(
        uint256 _id
    ) external view returns (address _exchange);

    function getTokenFromID(uint256 _id) external view returns (address _token);
}
