### Usage

Come for a Virtual Gambling party at [https://web3-virtual-gambling.vercel.app](https://web3-virtual-gambling.vercel.app)

- Deposit 1 DAI & wait for a matching fighter
- Both fighters start with 1000 vDAI (virtual DAI)
- At anytime, user can virtually buy or sell the vDAI at real ETH price
- At the end of the hour, the one ending with most value wins the 2 DAI at stake

*FIGHT DURATION*: 1 hour

## Contract

```solidity
contract VirtualGambling {

  // Start to fight
  // ... you become the next pending fighter if no one is in the queue
  // ... or you create a fight with the pending fighter
  function startFighting() public;

  // (virtually) Buy ETH during a fight
  function buy(uint fightId, uint daiAmount) public;

  // (virtually) Sell ETH during a fight
  function sell(uint fightId, uint ethAmount) public;

  // Get current winner in given fight
  function getCurrentWinner(uint fightId, uint ethPrice) view public returns (address);

  // Claim the rewards
  function claimRewards(uint fightId) public;

}

```