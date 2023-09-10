### Usage

- Liquidity providers:
  - Deposit ETH by chunks
  - Wait that the gamblers sell your ETH for a guarenteed higher price than currently

- Gamblers
  - Deposit current ETH value in USDC
  - Close position before the maximum duration
    - If you're losing, you're giving 1% to the providers and you keep your money
    - If you're winning, you're sharing 50% of the profits with the providers

*POSITION MAX DURATION*: 1 day
*POSITION CHUNK SIZE*: 1 ETH

## Contract

```solidity
contract VirtualGambling {

  // Providers: Deposit liquidity
  function depositLiquidity() payable public;

  // Providers: Withdraw liquidity
  function withdrawLiquidity(uint amount) public;

  // Gamblers: Open a position
  function openPosition() public;

  // Both: Close position
  // ... providers can only close when period is over
  function closePosition(uint positionId) public _requireOpenPosition(positionId);

}

```