### Usage

## Contract

```solidity
function depositLiquidity() payable public; // Minimum 0.2 ETH
function openPosition(uint amountUsdc) public; // Minimum 10 USDC
```


TODO:
- Opening/Closing position: Get ETH price value using Uniswap
- Selling position:
  - Wrap ETH to wETH
  - Swap wETH for DAI