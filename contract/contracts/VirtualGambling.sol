// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VirtualGambling {
  uint256 constant MINIMUM_ENTRY = 0.001 ether;
  uint256 id = 0;

  event Deposited(address, uint amount);
  event PositionOpen(address, uint positionId, uint amount);
  event PositionClosed(address, uint positionId, uint amount);

  error InsufficientEntry(uint256 required, uint256 provided);
  
  struct Stats {
    uint totalGains;
    uint totalLoved;
    uint totalHated;
  }

  mapping (bytes => Stats) public stats;

  function depositEth() payable public _requireMinimumEntry(msg.value) {
    emit Deposited(msg.sender, msg.value);
  }

  function openPosition(uint amount) public {
    emit PositionOpen(msg.sender, ++id, amount);
  }

  function closePosition(uint positionId) public {
    emit PositionClosed(msg.sender, positionId, 2000);
  }

  modifier _requireMinimumEntry(uint amount) {
    _;
    if (amount < MINIMUM_ENTRY) {
      revert InsufficientEntry({
        required: MINIMUM_ENTRY,
        provided: amount
      });
    }
  }
}