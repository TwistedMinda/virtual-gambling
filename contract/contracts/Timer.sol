// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Timer {
  AggregatorV3Interface public priceFeed;

  constructor(address _priceFeedAddress) {
    priceFeed = AggregatorV3Interface(_priceFeedAddress);
  }

  function getLatestTime() public view returns (uint256) {
    (, , , uint256 updateTime, ) = priceFeed.latestRoundData();
    return updateTime;
  }
}

contract MockTimer {
  function getLatestTime() public view returns (uint256) {
    return block.timestamp;
  }
}