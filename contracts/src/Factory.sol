//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interface/IFactory.sol";
import "./Exchange.sol";

contract Factory is IFactory {
    mapping(address => address) exchange_to_token;
    mapping(address => address) token_to_exhange;
    uint256 exchangeCount;
    mapping(uint256 => address) id_to_exchange;

    event NewExchnageCreated(
        address _token,
        address _exchange,
        uint256 _exchangeID
    );

    function createExchange(
        address _token
    ) external returns (address _exchange) {
        require(_token != address(0), "Invalid Address");

        require(
            token_to_exhange[_token] == address(0),
            "Exchange already exists"
        );
        Exchange exc = new Exchange(_token);
        exchange_to_token[address(exc)] = _token;
        token_to_exhange[_token] = address(exc);
        exchangeCount += 1;
        id_to_exchange[exchangeCount] = address(exc);
        _exchange = address(exc);
        emit NewExchnageCreated(_token, address(exc), exchangeCount);
    }

    function getTokenFromExchange(
        address _exchange
    ) external view returns (address _token) {
        _token = exchange_to_token[_exchange];
    }

    function getExchangeFromToken(
        address _token
    ) external view returns (address _exchange) {
        _exchange = token_to_exhange[_token];
    }

    function getExchangeFromID(
        uint256 _id
    ) public view returns (address _exchange) {
        _exchange = id_to_exchange[_id];
    }

    function getTokenFromID(
        uint256 _id
    ) external view returns (address _token) {
        _token = exchange_to_token[getExchangeFromID(_id)];
    }
}
