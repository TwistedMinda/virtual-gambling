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
  struct Token {
    address tokenAddress;
    bool available;
  }

  ISwapRouter public immutable swapRouter;
  IQuoterV2 public immutable quoter;
  address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  uint24 public constant feeTier = 3000;

  WETHERC20 public wethToken = WETHERC20(WETH);

  constructor(ISwapRouter _swapRouter, IQuoterV2 _quoter) {
    swapRouter = _swapRouter;
    quoter = _quoter;
  }
  
  /**
   * Buying
   */
  function wrapEther() external payable {
    require(msg.value > 0, "No Ether sent");
    wethToken.deposit{value : msg.value}();
    wethToken.transfer(msg.sender, msg.value);
  }

  function swapEtherToDAI(
    address _tokenOut,
    uint256 _amountIn
  ) external returns (uint256 amountOut) {
    wethToken.transferFrom(msg.sender, address(this), _amountIn);

    TransferHelper.safeApprove(WETH, address(swapRouter), _amountIn);

    IQuoterV2.QuoteExactInputSingleParams memory quoteParams = IQuoterV2
      .QuoteExactInputSingleParams({
        tokenIn: WETH,
        tokenOut: _tokenOut,
        fee: feeTier,
        amountIn: _amountIn,
        sqrtPriceLimitX96: 0
      });

    uint256 amountOutMinimum;
    uint160 _a;
    uint32 _b;
    uint256 _c;
    (amountOutMinimum, _a, _b, _c) = quoter.quoteExactInputSingle(quoteParams);

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
      .ExactInputSingleParams({
        tokenIn: WETH,
        tokenOut: _tokenOut,
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

  function getEtherPrice() public returns (uint256 price) {
    IQuoterV2.QuoteExactInputSingleParams memory quoteParams = IQuoterV2
      .QuoteExactInputSingleParams({
        tokenIn: WETH,
        tokenOut: DAI,
        fee: feeTier,
        amountIn: 1,
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