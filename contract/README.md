### Usage

- Liquidity providers:
  - Deposit ETH by chunks (Chunk: 1 ETH)
  - Wait that the gamblers sell your ETH for a guarenteed higher price than currently

- Gamblers
  - Deposit current ETH value in USDC
  - Close position in 1 week duration
    - If you're losing, you're giving 1% to the providers and you keep your money
    - If you're winning, you're sharing 50% of the profits with the providers

## Contract

```solidity
function depositLiquidity() payable public; // Minimum 0.2 ETH
function openPosition(uint amountUsdc) public; // Minimum 10 USDC
```