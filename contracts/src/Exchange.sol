//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/token/ERC20/ERC20.sol";
import "./interface/IFactory.sol";

contract Exchange is ERC20("Sherlock Swap V1", "VARM-V1") {
    ERC20 public token;
    IFactory public factory;

    event LiquidityAdded(address _from, uint _value, uint _liquidityMinted);
    event LiquidityRemoved(uint _amount, uint _ethRefund, uint _tokenRefund);
    event TokensPurchase(
        address _buyer,
        address _recipient,
        uint _ethSold,
        uint _tokensBought
    );
    event EthBought(
        uint _tokensSold,
        uint _ethBought,
        address _buyer,
        address _recipient
    );

    event TokenToTokenPurchase(
        address _buyer,
        address _recipient,
        address _token
    );

    constructor(address _token) {
        factory = IFactory(msg.sender);
        token = ERC20(_token);
    }

    function addLiquidity(
        uint _minLiquidity,
        uint _maxTokens,
        uint _deadline
    ) external payable returns (uint) {
        require(
            _deadline > block.timestamp && _maxTokens > 0 && msg.value > 0,
            "did not met the requirements"
        );
        // when we add the liquidity after the first addition of liquidity
        if (super.totalSupply() > 0) {
            require(_minLiquidity > 0, "minimum liquidity is zero");
            // eth reserve in this contract
            uint _ethReserve = address(this).balance - msg.value;
            // token reserve in this contract
            uint _tokenReserve = token.balanceOf(address(this));
            // the amount of token which user have to provide according to his provided eth value
            uint _tokenAmount = (msg.value * _tokenReserve) / _ethReserve + 1;
            // the same amount of liquidity token can be minted by the sender
            uint _liquidityMinted = (msg.value * _tokenReserve) / _ethReserve;
            // met the desired values of msg.sender
            require(
                _maxTokens >= _tokenAmount && _liquidityMinted >= _minLiquidity,
                "didn't get the desired results"
            );
            // providing liquidity token to msg.sender
            super._mint(msg.sender, _liquidityMinted);
            // transfering reserve tokens from sender to this contract
            require(
                token.transferFrom(msg.sender, address(this), _tokenAmount),
                "Failed to transfer ether from sender to exchange contract"
            );
            emit LiquidityAdded(msg.sender, msg.value, _liquidityMinted);
            return _liquidityMinted;
        }
        // when we are adding liquidity for the first time
        else {
            require(
                address(factory) != address(0) &&
                    address(token) != address(0) &&
                    msg.value >= 1000000000
            );
            require(
                factory.getExchangeFromToken(address(token)) == address(this)
            );

            // creating the first raito of exchange
            // this raito will set the price for token/ETH
            super._mint(msg.sender, address(this).balance);
            require(
                token.transferFrom(msg.sender, address(this), _maxTokens),
                "Failed to transfer ether from sender to exchange contract"
            );
            emit LiquidityAdded(msg.sender, msg.value, address(this).balance);
            return address(this).balance;
        }
    }

    function removeLiquidity(
        // amount of VARM-V1 tokens user want to provide to get his assets back
        uint _amount,
        uint _minEth,
        uint _minTokens,
        uint _deadline
    ) external returns (uint _ethRefund, uint _tokenRefund) {
        require(
            _amount > 0 &&
                _deadline > block.timestamp &&
                _minEth > 0 &&
                _minTokens > 0
        );
        uint _tokenReserve = token.balanceOf(address(this));
        require(_tokenReserve > 0);
        _ethRefund = (_amount * address(this).balance) / super.totalSupply();
        _tokenRefund = (_amount * _tokenReserve) / super.totalSupply();
        require(_ethRefund > _minEth && _tokenRefund > _minTokens);
        super._burn(msg.sender, _amount);
        (bool status, ) = msg.sender.call{value: _ethRefund}("");
        require(status, "Failed to send ehters back");
        require(token.transfer(msg.sender, _tokenRefund));
        emit LiquidityRemoved(_amount, _ethRefund, _tokenRefund);
    }

    // get the price for input amount

    function getInputPrice(
        uint _inputAmount,
        uint _inputReserve,
        uint _outputReserve
    ) private pure returns (uint) {
        require(_inputReserve > 0 && _outputReserve > 0);
        uint _inputAmountWithFee = _inputAmount * 997;
        return ((_inputAmountWithFee * _outputReserve) /
            (_inputReserve * 1000) +
            _inputAmountWithFee);
    }

    // get the price for output amount
    function getOutputPrice(
        uint _outputAmount,
        uint _inputReserve,
        uint _outputReserve
    ) private pure returns (uint) {
        require(_inputReserve > 0 && _outputReserve > 0);
        uint num = _inputReserve * _outputAmount * 1000;
        uint deno = (_outputReserve - _outputAmount) * 997;
        return num / deno + 1;
    }

    function ethToTokenInput(
        uint _ethSold,
        uint _minTokens,
        uint _deadline,
        address _buyer,
        address _recipient
    ) private returns (uint) {
        require(_deadline >= block.timestamp && _ethSold > 0 && _minTokens > 0);

        uint _tokenReserve = token.balanceOf(address(this));
        uint _tokensBought = getInputPrice(
            _ethSold,
            address(this).balance - msg.value,
            _tokenReserve
        );
        require(
            _tokensBought >= _minTokens,
            "bought tokens are below the minimum tokens"
        );
        require(
            token.transfer(_recipient, _tokensBought),
            "falied to send tokens to recipient"
        );

        emit TokensPurchase(_buyer, _recipient, _ethSold, _tokensBought);
        return _tokensBought;
    }

    // default function for purchasing the tokens
    function __default__() external payable {
        ethToTokenInput(msg.value, 1, block.timestamp, msg.sender, msg.sender);
    }

    // swaping eth to tokens and sending to yourself
    function ethToTokenSwapInput(
        uint _minTokens,
        uint _deadline
    ) external payable returns (uint) {
        return
            ethToTokenInput(
                msg.value,
                _minTokens,
                _deadline,
                msg.sender,
                msg.sender
            );
    }

    // purchasing tokens and send back to someone

    function ethToTokenTransferInput(
        uint _minTokens,
        uint _deadline,
        address _recipient
    ) external payable returns (uint) {
        return
            ethToTokenInput(
                msg.value,
                _minTokens,
                _deadline,
                msg.sender,
                _recipient
            );
    }

    function ethToTokenOutput(
        uint _tokensBought,
        uint _maxEth,
        uint _deadline,
        address _buyer,
        address _recipient
    ) private returns (uint) {
        require(
            _deadline >= block.timestamp && _tokensBought > 0 && _maxEth > 0
        );
        uint _tokenReserve = token.balanceOf(address(this));
        uint _ethSold = getOutputPrice(
            _tokensBought,
            address(this).balance - _maxEth,
            _tokenReserve
        );
        uint _ethRefund = _maxEth - _ethSold;
        if (_ethRefund > 0) {
            (bool status, ) = _buyer.call{value: _ethRefund}("");
            require(status, "failed to send refund eth amount");
        }
        require(token.transfer(_recipient, _tokensBought));
        emit TokensPurchase(_buyer, _recipient, _ethSold, _tokensBought);
        return _ethSold;
    }

    // provide the amount of tokens you want to buy and if you paid extra eth then they will get refunded to you

    function ethToTokenSwapOutput(
        uint _tokensBought,
        uint _deadline
    ) external payable returns (uint) {
        return
            ethToTokenOutput(
                _tokensBought,
                msg.value,
                _deadline,
                msg.sender,
                msg.sender
            );
    }

    function ethToTokenTransferOutput(
        uint _tokensBought,
        uint _deadline,
        address _recipient
    ) external payable returns (uint) {
        return
            ethToTokenOutput(
                _tokensBought,
                msg.value,
                _deadline,
                msg.sender,
                _recipient
            );
    }

    function tokenToEthInput(
        uint _tokensSold,
        uint _minEth,
        uint deadline,
        address _buyer,
        address _recipient
    ) private returns (uint) {
        require(_minEth > 0 && deadline >= block.timestamp && _tokensSold > 0);
        uint _tokenReserve = token.balanceOf(address(this));
        uint _ethBought = getInputPrice(
            _tokensSold,
            _tokenReserve,
            address(this).balance
        );

        require(_ethBought >= _minEth);
        require(token.transferFrom(_buyer, address(this), _tokensSold));
        (bool status, ) = _recipient.call{value: _ethBought}("");
        require(status, "failed to send eth");
        emit EthBought(_tokensSold, _ethBought, _buyer, _recipient);
        return _ethBought;
    }

    function tokenToEthSwapInput(
        uint _tokensSold,
        uint _minEth,
        uint _deadline
    ) external returns (uint) {
        return
            tokenToEthInput(
                _tokensSold,
                _minEth,
                _deadline,
                msg.sender,
                msg.sender
            );
    }

    function tokenToEthTransferInput(
        uint _tokensSold,
        uint _minEth,
        uint _deadline,
        address _recipient
    ) external returns (uint) {
        return
            tokenToEthInput(
                _tokensSold,
                _minEth,
                _deadline,
                msg.sender,
                _recipient
            );
    }

    function tokenToEthOutput(
        uint _ethBought,
        uint _maxTokens,
        uint _deadline,
        address _buyer,
        address _recipient
    ) private returns (uint) {
        require(
            _deadline >= block.timestamp && _maxTokens > 0 && _ethBought > 0
        );
        uint _tokenReserve = token.balanceOf(address(this));
        uint _tokensSold = getOutputPrice(
            _ethBought,
            _tokenReserve,
            address(this).balance
        );
        require(
            _maxTokens >= _tokensSold,
            "sold tokens are greater than max tokens"
        );
        require(
            token.transferFrom(_buyer, address(this), _tokensSold),
            "failed to transfer tokens"
        );
        (bool status, ) = _recipient.call{value: _ethBought}("");
        require(status, "failed to send eth");
        emit EthBought(_tokensSold, _ethBought, _buyer, _recipient);
        return _tokensSold;
    }

    function tokenToEthSwapOutput(
        uint _ethBought,
        uint _maxTokens,
        uint _deadline
    ) external returns (uint) {
        return
            tokenToEthOutput(
                _ethBought,
                _maxTokens,
                _deadline,
                msg.sender,
                msg.sender
            );
    }

    function tokenToEthTransferOutput(
        uint _ethBought,
        uint _maxTokens,
        uint _deadline,
        address _recipient
    ) external returns (uint) {
        return
            tokenToEthOutput(
                _ethBought,
                _maxTokens,
                _deadline,
                msg.sender,
                _recipient
            );
    }

    function tokenToTokenInput(
        uint _tokensSold,
        uint _minTokensBought,
        uint _minEthBought,
        uint _deadline,
        address _buyer,
        address _recipient,
        address _exchangeAddress
    ) private returns (uint) {
        require(
            _deadline >= block.timestamp &&
                _tokensSold > 0 &&
                _minTokensBought > 0 &&
                _minEthBought > 0 &&
                _exchangeAddress != address(0) &&
                _exchangeAddress != address(this)
        );
        uint _tokenReserve = token.balanceOf(address(this));
        uint _ethBought = getInputPrice(
            _tokensSold,
            _tokenReserve,
            address(this).balance
        );
        require(
            _ethBought >= _minEthBought,
            "more eth require to swap token to token"
        );
        require(token.transferFrom(_buyer, address(this), _tokensSold));
        uint _tokensBought = Exchange(_exchangeAddress).ethToTokenTransferInput{
            value: _ethBought
        }(_minTokensBought, _deadline, _recipient);
        emit TokenToTokenPurchase(
            _buyer,
            _recipient,
            address(Exchange(_exchangeAddress).token())
        );
        return _tokensBought;
    }

    function tokenToTokenSwapInput(
        uint _tokensSold,
        uint _minTokensBought,
        uint _minEthBought,
        uint _deadline,
        address _tokenAddress
    ) external returns (uint) {
        return
            tokenToTokenInput(
                _tokensSold,
                _minTokensBought,
                _minEthBought,
                _deadline,
                msg.sender,
                msg.sender,
                factory.getExchangeFromToken(_tokenAddress)
            );
    }

    function tokenToTokenTransferInput(
        uint _tokensSold,
        uint _minTokensBought,
        uint _minEthBought,
        uint _deadline,
        address _tokenAddress,
        address recipient
    ) external returns (uint) {
        return
            tokenToTokenInput(
                _tokensSold,
                _minTokensBought,
                _minEthBought,
                _deadline,
                msg.sender,
                recipient,
                factory.getExchangeFromToken(_tokenAddress)
            );
    }

    function tokenToTokenOutput(
        uint _tokensBought,
        uint _maxTokensSold,
        uint _maxEthSold,
        uint _deadline,
        address _buyer,
        address _recipient,
        address _exchangeAddress
    ) private returns (uint) {
        require(
            _deadline >= block.timestamp &&
                _tokensBought > 0 &&
                _maxEthSold > 0 &&
                _exchangeAddress != address(this) &&
                _exchangeAddress != address(0)
        );

        uint _ethBought = Exchange(_exchangeAddress).getEthToTokenOutputPrice(
            _tokensBought
        );
        uint _tokensReserve = token.balanceOf(address(this));
        uint _tokensSold = getOutputPrice(
            _ethBought,
            _tokensReserve,
            address(this).balance
        );
        require(_maxTokensSold >= _tokensSold && _maxEthSold >= _ethBought);
        require(token.transferFrom(_buyer, address(this), _tokensSold));
        Exchange(_exchangeAddress).ethToTokenTransferOutput{value: _ethBought}(
            _tokensBought,
            _deadline,
            _recipient
        );
        emit TokenToTokenPurchase(
            _buyer,
            _recipient,
            address(Exchange(_exchangeAddress).token())
        );
        return _tokensSold;
    }

    function tokenToTokenSwapOutput(
        uint _tokensBought,
        uint _maxTokensSold,
        uint _maxEthSold,
        uint _deadline,
        address _tokenAddress
    ) external returns (uint) {
        return
            tokenToTokenOutput(
                _tokensBought,
                _maxTokensSold,
                _maxEthSold,
                _deadline,
                msg.sender,
                msg.sender,
                factory.getExchangeFromToken(_tokenAddress)
            );
    }

    function tokenToTokenTransferOutput(
        uint _tokensBought,
        uint _maxTokensSold,
        uint _maxEthSold,
        uint _deadline,
        address _tokenAddress,
        address _recipient
    ) external returns (uint) {
        return
            tokenToTokenOutput(
                _tokensBought,
                _maxTokensSold,
                _maxEthSold,
                _deadline,
                msg.sender,
                _recipient,
                factory.getExchangeFromToken(_tokenAddress)
            );
    }

    function getEthToTokenInputPrice(uint _ethSold) public view returns (uint) {
        require(_ethSold > 0);
        uint _tokenReserve = token.balanceOf(address(this));
        return getInputPrice(_ethSold, address(this).balance, _tokenReserve);
    }

    function getEthToTokenOutputPrice(
        uint _tokensBought
    ) public view returns (uint) {
        require(_tokensBought > 0);
        uint _tokenReserve = token.balanceOf(address(this));
        return
            getOutputPrice(_tokensBought, address(this).balance, _tokenReserve);
    }

    function getTokenToEthInputPrice(
        uint _tokensSold
    ) public view returns (uint) {
        require(_tokensSold > 0);
        uint _tokensReserve = token.balanceOf(address(this));
        uint _ethBought = getInputPrice(
            _tokensSold,
            _tokensReserve,
            address(this).balance
        );
        return _ethBought;
    }

    function getTokenToEthOutputPrice(
        uint _ethBought
    ) public view returns (uint) {
        require(_ethBought > 0);
        uint _tokenReserve = token.balanceOf(address(this));
        return getOutputPrice(_ethBought, _tokenReserve, address(this).balance);
    }
}
