// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VirtualGambling {
  /**
   * Constants 
   */
  uint constant MINIMUM_LIQUIDITY_ENTRY = 0.001 ether;
  uint constant MINIMUM_GAMBLING_ENTRY = 0.001 ether;
  uint constant MAX_POSITION_DURATION = 7 days;
  uint constant LOSER_FEE_PERCENTAGE = 1;

  /**
   * Errors 
   */
  error InsufficientDeposit(uint required, uint provided);
  error InsufficientLiquidity(uint current, uint required);
  error PositionAlreadyClosed(uint positionId);
  error PositionNotYetOutdated(uint positionId);
  error NotEnoughWithdrawableLiquidity(uint available, uint required);
  
  /**
   * Events 
   */
  event DepositedLiquidity(address, uint amount);
  event WithdrawnLiquidity(address, uint amount);
  event PositionOpen(address, uint positionId, uint amount, uint startPrice);
  event PositionClosed(address, uint positionId, uint endPrice);

  /**
   * Structs 
   */
  struct Position {
    uint id;
    uint amount;
    uint startPrice;
    uint endPrice;
    address owner;
    address provider;
    uint date;
    bool open;
  }

  /**
   * Storage 
   */
  uint id = 0;
  mapping (uint => Position) public positions;
  mapping (address => uint) public liquidityProviders;

  /**
   * Liquidity provider methods
   */

  // Provide liquidity for the gamblers
  function depositLiquidity() payable public _minimumLiquidityDeposit(msg.value) {
    liquidityProviders[msg.sender] += msg.value;
    emit DepositedLiquidity(msg.sender, msg.value);
  }

  // Retrieve liquidity from the contract
  function withdrawLiquidity(uint amount) public {
    uint available = liquidityProviders[msg.sender];
    if (available < amount) {
      revert NotEnoughWithdrawableLiquidity(available, amount);
    }
    liquidityProviders[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
    emit WithdrawnLiquidity(msg.sender, amount);
  }

  // Claim fee
  /// ... only if gambler refuses to close position after MAX_POSITION_DURATION
  function claimFee(uint positionId) public _requireOutdatedPosition(positionId) {
    terminatePosition(positionId);
  }

  /**
   * Virtual Gambler methods
   */

  // Open a position
  function openPosition(uint amount) public
    _hasSufficientLiquidity(amount)
    _minimumGamblingDeposit(amount)
    {
    positions[id] = Position({
      id: id,
      amount: amount,
      date: block.timestamp,
      owner: msg.sender,
      provider: address(0),
      startPrice: _calculatePrice(true, false),
      endPrice: 0,
      open: true
    });
    emit PositionOpen(msg.sender, id, amount, positions[id].startPrice);
    ++id;
  }

  // Close a position
  function closePosition(uint positionId) public _requireOpenPosition(positionId) {
    terminatePosition(positionId);
  }

  /**
   * Helpers
   */

  // Calculate off-chain price
  function _calculatePrice(bool start, bool win) pure private returns (uint) {
    return start ? 100 : win ? 200 : 50;
  }

  // Terminate position
  // ... call can originate from both participants
  function terminatePosition(uint positionId) private {
    positions[positionId].endPrice = _calculatePrice(false, positionId > 0);
    positions[positionId].open = false;
    emit PositionClosed(msg.sender, positionId, positions[positionId].endPrice);
  }

  /**
   * Modifiers
   */

  modifier _hasSufficientLiquidity(uint amount) {
    uint available = address(this).balance;
    uint dollarValue = available * _calculatePrice(true, false);
    if (dollarValue < amount) {
      revert InsufficientLiquidity(available, amount);
    }
    _;
  }

  modifier _minimumGamblingDeposit(uint amount) {
    if (amount < MINIMUM_GAMBLING_ENTRY) {
      revert InsufficientDeposit(MINIMUM_GAMBLING_ENTRY, amount);
    }
    _;
  }

  modifier _minimumLiquidityDeposit(uint amount) {
    if (amount < MINIMUM_LIQUIDITY_ENTRY) {
      revert InsufficientDeposit(MINIMUM_LIQUIDITY_ENTRY, amount);
    }
    _;
  }

  modifier _requireOpenPosition(uint positionId) {
    if (!positions[positionId].open) {
      revert PositionAlreadyClosed(positionId);
    }
    _;
  }

  modifier _requireOutdatedPosition(uint positionId) {
    if (positions[positionId].date + MAX_POSITION_DURATION > block.timestamp) {
      revert PositionNotYetOutdated(positionId);
    }
    _;
  }

}