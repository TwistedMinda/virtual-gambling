// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VirtualGambling {
  uint256 constant MINIMUM_ENTRY = 0.001 ether;

  event Deposited(address, uint amount);
  event PositionTaken(address, uint amount);

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

  function takePosition(uint amount) public {
    emit PositionTaken(msg.sender, amount);
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