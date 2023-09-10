// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol';

import "hardhat/console.sol";

interface WETHERC20 is IERC20 {
  function deposit() external payable;
}

contract Swapper {
  
  IERC20 daiToken;
  WETHERC20 wethToken;

  ISwapRouter immutable swapRouter;
  IQuoterV2 immutable quoter;
  uint24 constant feeTier = 3000;
  address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  constructor(
    ISwapRouter _swapRouter,
    IQuoterV2 _quoter,
    address _daiToken,
    address _wethToken
  ) {
    swapRouter = _swapRouter;
    quoter = _quoter;
    daiToken = IERC20(_daiToken);
    wethToken = WETHERC20(_wethToken);
  }
  
  // DAI Token
  function getDAIToken() public view returns (IERC20) {
    return daiToken;
  }
  
  // WETH Token
  function getWETHToken() public view returns (WETHERC20) {
    return wethToken;
  }

  // Wrap ETH to WETH for swapping
  function wrapEther() external payable {
    require(msg.value > 0, "No Ether sent");
    wethToken.deposit{value : msg.value}();
    wethToken.transfer(msg.sender, msg.value);
  }

  // Swap some ether to DAI
  function swapEtherToDAI(
    uint256 _amountIn
  ) external returns (uint256 amountOut) {
    wethToken.transferFrom(msg.sender, address(this), _amountIn);

    TransferHelper.safeApprove(address(wethToken), address(swapRouter), _amountIn);
    uint amountOutMinimum = _getQuote(_amountIn);

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
      .ExactInputSingleParams({
        tokenIn: address(wethToken),
        tokenOut: address(daiToken),
        fee: feeTier,
        recipient: msg.sender,
        deadline: block.timestamp,
        amountIn: _amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0
      });

    amountOut = swapRouter.exactInputSingle(params);
    return amountOut;
  }

  // Get current price of ETH in DAI
  function getEtherPrice() public returns (uint256 price) {
    return _getQuote(1 ether);
  }

  /**
   * Helpers
   */

  // Get quote for ETH in DAI & given amount
  function _getQuote(uint _amountIn) private returns (uint256 price) {
    IQuoterV2.QuoteExactInputSingleParams memory quoteParams = IQuoterV2
      .QuoteExactInputSingleParams({
        tokenIn: address(wethToken),
        tokenOut: address(daiToken),
        fee: feeTier,
        amountIn: _amountIn,
        sqrtPriceLimitX96: 0
      });

    uint256 amountOutMinimum;
    uint160 _a;
    uint32 _b;
    uint256 _c;
    (amountOutMinimum, _a, _b, _c) = quoter.quoteExactInputSingle(quoteParams);
    return amountOutMinimum;
  }
}