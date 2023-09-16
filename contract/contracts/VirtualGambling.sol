// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Swapper.sol";

contract VirtualGambling {
  /**
   * Constants 
   */
  uint constant CHUNK_SIZE = 0.01 ether;
  uint constant FIGHT_DURATION = 1 hours;
  uint constant STARTER_PACK = 10;

  /**
   * Errors 
   */
  error NotEnoughWithdrawableLiquidity(uint, uint);
  
  /**
   * Events 
   */
  event FightCreated(uint id, address creator, address challenger);
  event FightPending(address fighter);

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
  function buy(uint fightId, uint amount) public {
    if (_checkFightStatus(fightId)) {
      return;
    }

    uint buyable = fights[fightId].daiBalance[msg.sender];
    require(amount <= buyable, "Not enough to buy");
    uint price = swapper.getEtherPrice();
    // Decrement DAI balance
    fights[fightId].daiBalance[msg.sender] -= amount;
    // Calculate new ETH balance
    fights[fightId].ethBalance[msg.sender] += amount * price;
  }

  // (virtually) Sell ETH during a fight
  function sell(uint fightId, uint amount) public {
    if (_checkFightStatus(fightId)) {
      return;
    }

    uint sellable = fights[fightId].ethBalance[msg.sender];
    require(amount <= sellable, "Not enough to sell");
    uint price = swapper.getEtherPrice();
    // Calculate DAI profits
    fights[fightId].daiBalance[msg.sender] += amount * price;
    // Decrement ETH balance
    fights[fightId].ethBalance[msg.sender] -= amount;
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
    _payWinner(fightId);
  }

  /**
   * Helpers
   */

  // Check fight status before trading
  function _checkFightStatus(uint fightId) private returns (bool) {
    Fight storage fight = fights[fightId];
    require(fight.startedAt > 0, "Fight hasn't started");
    if (_isFightFinished(fightId)) {
      // Fight is over
      // ...both can trigger the final calculation
      _payWinner(fightId);
      return false;
    }
    return true;
  }
  
  // Get player balance in given fight
  function _getPlayerBalance(uint fightId, address player, uint ethPrice) view private returns (uint) {
    return (fights[fightId].ethBalance[player] * ethPrice) + fights[fightId].daiBalance[player];
  }

  // Pay winner
  function _payWinner(uint fightId) private {
    uint price = swapper.getEtherPrice();
    swapper.getDAIToken().transfer(getCurrentWinner(fightId, price), 2 ether);
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
    emit FightCreated(id, msg.sender, challenger);
    ++id;
  }
}