// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Swapper.sol";

contract VirtualGambling {
  /**
   * Constants 
   */
  uint constant FIGHT_DURATION = 1 hours;
  uint constant STARTER_PACK = 1000 ether;

  /**
   * Errors 
   */
  error NotEnoughToBuy(uint, uint);
  error NotEnoughToSell(uint, uint);
  
  /**
   * Events 
   */
  event FightCreated(uint id, address creator, address challenger);
  event FightEnded(uint id, address creator, address challenger);
  event FightPending(address fighter);
  event BoughtAt(
    uint fightId, 
    address buyer, 
    uint ethReward,
    uint daiCost
  );
  event SoldAt(
    uint fightId, 
    address seller, 
    uint daiReward, 
    uint ethCost
  );

  /**
   * Structs
   */
  struct Fight {
    uint id;
    address creator;
    address challenger;
    mapping (address => uint) daiBalance;
    mapping (address => uint) ethBalance;
    uint startedAt;
    bool fulfilled;
  }

  /**
   * Storage 
   */
  uint id;
  Swapper swapper;
  address pendingFighter = address(0);
  mapping(uint => Fight) fights;
  
  constructor(address swapperAddress) {
    swapper = Swapper(swapperAddress);
  }

  // Start to fight
  // ... you become the next pending fighter if no one is in the queue
  // ... or you create a fight with the pending fighter
  function startFighting() public {
    uint amount = 1 ether;
    swapper.getDAIToken().transferFrom(msg.sender, address(this), amount);
    if (pendingFighter == address(0)) {
      pendingFighter = msg.sender;
      emit FightPending(msg.sender);
    } else {
      _createFightWith(pendingFighter);
      pendingFighter = address(0);
    }
  }

  // (virtually) Buy ETH during a fight
  function buy(uint fightId, uint daiAmount) public {
    if (_checkFinish(fightId)) {
      return;
    }

    uint buyable = fights[fightId].daiBalance[msg.sender];
    if (daiAmount > buyable) {
      revert NotEnoughToBuy(buyable, daiAmount);
    }
    uint price = swapper.getEtherPrice();
    // Decrement DAI balance
    fights[fightId].daiBalance[msg.sender] -= daiAmount;
    // Calculate new ETH balance
    uint reward = daiAmount / price;
    fights[fightId].ethBalance[msg.sender] += reward;
    emit BoughtAt(
      fightId, 
      msg.sender,
      reward,
      daiAmount
    );
  }

  // (virtually) Sell ETH during a fight
  function sell(uint fightId, uint ethAmount) public {
    if (_checkFinish(fightId)) {
      return;
    }

    uint sellable = fights[fightId].ethBalance[msg.sender];
    if (ethAmount > sellable) {
      revert NotEnoughToSell(sellable, ethAmount);
    }
    uint price = swapper.getEtherPrice();
    // Calculate DAI profits
    uint reward = ethAmount * price;
    fights[fightId].daiBalance[msg.sender] += reward;
    // Decrement ETH balance
    fights[fightId].ethBalance[msg.sender] -= ethAmount;
    emit SoldAt(
      fightId, 
      msg.sender,
      reward,
      ethAmount
    );
  }

  // Get current winner in given fight
  function getCurrentWinner(uint fightId, uint ethPrice) view public returns (address) {
    address creator = fights[fightId].creator;
    address challenger = fights[fightId].challenger;
    return _getPlayerBalance(fightId, creator, ethPrice) > _getPlayerBalance(fightId, challenger, ethPrice)
      ? creator
      : challenger;
  }

  // Claim the rewards
  function claimRewards(uint fightId) public {
    require(_isFightFinished(fightId), "Fight isn't finished yet");
    require(!fights[fightId].fulfilled, "Rewards already claimed");
    _payWinner(fightId);
  }

  /**
   * Helpers
   */

  // Check fight status before trading
  function _checkFinish(uint fightId) private returns (bool) {
    Fight storage fight = fights[fightId];
    require(fight.startedAt > 0, "Fight hasn't started");
    if (_isFightFinished(fightId)) {
      // Fight is over
      // ...both can trigger the final calculation
      _payWinner(fightId);
      return true;
    }
    return false;
  }
  
  // Get player balance in given fight
  function _getPlayerBalance(uint fightId, address player, uint ethPrice) view private returns (uint) {
    return (fights[fightId].ethBalance[player] * ethPrice) + fights[fightId].daiBalance[player];
  }

  // Pay winner
  function _payWinner(uint fightId) private {
    uint price = swapper.getEtherPrice();
    swapper.getDAIToken().transfer(getCurrentWinner(fightId, price), 2 ether);
    fights[fightId].fulfilled = true;
  }

  function _enemyAddress(uint fightId) view private returns (address) {
    Fight storage fight = fights[fightId];
    return msg.sender == fight.creator ? fight.challenger : fight.creator;
  }

  function _isFightFinished(uint fightId) view private returns (bool) {
    return (fights[fightId].startedAt + FIGHT_DURATION) < block.timestamp;
  }

  function _createFightWith(address challenger) private {
    fights[id].id = id;
    fights[id].creator = msg.sender;
    fights[id].challenger = challenger;
    fights[id].daiBalance[msg.sender] = STARTER_PACK;
    fights[id].daiBalance[challenger] = STARTER_PACK;
    fights[id].startedAt = block.timestamp;
    emit FightCreated(id, msg.sender, challenger);
    ++id;
  }
}