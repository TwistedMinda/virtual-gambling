### Usage

- Liquidity providers:
  - Deposit ETH by chunks (Withdraw at any time)
  - Wait that the gamblers sell your ETH for a guarenteed higher price than currently

- Gamblers
  - Open a (virtual) position at chunk price (eg. 1 ETH worth of DAI)
  - Close the (virtual) position before the maximum duration
    - If the position is losing, you give 1% of your DAI to the providers
    - If the position is winning, you share 50% of the DAI profits with the providers

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