// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VirtualGambling {
  /**
   * Constants 
   */
  uint256 constant MINIMUM_ENTRY = 0.001 ether;
  uint256 constant MAX_POSITION_DURATION = 7 days;

  /**
   * Errors 
   */
  error InsufficientEntry(uint256 required, uint256 provided);
  error InsufficientLiquidity(uint256 current, uint256 required);
  
  /**
   * Events 
   */
  event Deposited(address, uint amount);
  event PositionOpen(address, uint positionId, uint amount);
  event PositionClosed(address, uint positionId, uint amount);

  /**
   * Structs 
   */
  struct Stats {
    uint totalGains;
    uint totalLoved;
    uint totalHated;
  }

  struct Position {
    uint id;
    uint amount;
    address owner;
    address provider;
    bool open;
  }

  /**
   * Storage 
   */
  uint256 id = 0;
  mapping (bytes => Stats) public stats;
  mapping (uint => uint) public fees;
  mapping (uint => Position) public positions;
  mapping (address => uint) public liquidityProviders;

  /**
   * Liquidity provider methods
   */

  // Provide liquidity for the gamblers
  function depositEth() payable public _requireMinimumEntry(msg.value) {
    emit Deposited(msg.sender, msg.value);
    liquidityProviders[msg.sender] += msg.value;
  }

  // Claim fee
  /// ... only if gambler refuses to close position after MAX_POSITION_DURATION
  function claimFee(uint positionId) public {
    payable(msg.sender).transfer(fees[positionId]);
  }

  /**
   * Virtual Gambler methods
   */

  // Open a position
  function openPosition(uint amount) public {
    uint available = address(this).balance;
    if (available < amount) {
      revert InsufficientLiquidity(available, amount);
    }

    positions[id] = Position({
      id: id,
      amount: amount,
      owner: msg.sender,
      provider: address(0),
      open: true
    });
    emit PositionOpen(msg.sender, ++id, amount);
  }

  // Close a position
  function closePosition(uint positionId) public {
    emit PositionClosed(msg.sender, positionId, 2000);
  }

  /**
   * Modifiers
   */

  modifier _requireMinimumEntry(uint amount) {
    _;
    if (amount < MINIMUM_ENTRY) {
      revert InsufficientEntry(MINIMUM_ENTRY, amount);
    }
  }
}