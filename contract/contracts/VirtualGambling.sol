// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface DaiToken {
  function transfer(address dst, uint wad) external returns (bool);
  function transferFrom(address src, address dst, uint wad) external returns (bool);
  function balanceOf(address guy) external view returns (uint);
}

contract VirtualGambling {
  /**
   * Constants 
   */
  uint constant MINIMUM_LIQUIDITY_ENTRY = 0.001 ether;
  uint constant MINIMUM_GAMBLING_ENTRY = 0.001 ether;
  uint constant MAX_POSITION_DURATION = 7 days;
  uint constant LOSER_FEE_PERCENTAGE = 1;
  uint constant WINNER_FEE_PERCENTAGE = 50;

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
  event PositionOpen(address, uint positionId, uint startValue);
  event PositionClosed(address, uint positionId, uint endValue);

  /**
   * Structs 
   */
  struct Position {
    uint id;
    uint amount;
    uint lockedEther;
    uint endValue;
    address owner;
    address provider;
    uint date;
    bool open;
  }

  /**
   * Storage 
   */
  uint id = 0;
  uint availableBalance = 0;
  mapping (uint => Position) public positions;
  mapping (address => uint) public liquidityProviders;
  DaiToken public daiToken;

  /**
   * Liquidity provider methods
   */

  // Provide liquidity for the gamblers
  function depositLiquidity() payable public _minimumLiquidityDeposit(msg.value) {
    availableBalance += msg.value;
    liquidityProviders[msg.sender] += msg.value;
    emit DepositedLiquidity(msg.sender, msg.value);
  }

  // Retrieve liquidity from the contract
  function withdrawLiquidity(uint amount) public {
    uint liquidity = liquidityProviders[msg.sender];
    if (liquidity < amount) {
      revert NotEnoughWithdrawableLiquidity(liquidity, amount);
    }
    emit WithdrawnLiquidity(msg.sender, amount);
  }

  /**
   * Virtual Gambler methods
   */

  // Open a position
  function openPosition(uint amount) public _minimumGamblingDeposit(amount) {
    uint lockEther = (amount / (_getEtherPrice(true, false) * 1 ether) * 1 ether);
    if (lockEther < availableBalance) {
      revert InsufficientLiquidity(availableBalance, lockEther);
    }
    address provider = _findAvailableProvider();
    _lockProviderEther(provider, lockEther);
    daiToken.transferFrom(msg.sender, address(this), amount);
    positions[id] = Position({
      id: id,
      amount: amount,
      date: block.timestamp,
      owner: msg.sender,
      provider: provider,
      lockedEther: lockEther,
      endValue: 0,
      open: true
    });
    emit PositionOpen(msg.sender, id, amount);
    ++id;
  }

  /**
   * Shared methods
   */

  // Close position
  function closePosition(uint positionId) public {
    uint currentValue = positions[positionId].lockedEther * _getEtherPrice(false, positionId > 0);
    positions[positionId].open = false;
    positions[positionId].endValue = currentValue;
    // Calculate virtual USDC profits
    uint profits = currentValue - positions[positionId].amount;
    if (profits > 0) {
      // Gambler successfully sold it for higher value
      // ... we share profits to both participants
      uint sellValue = _sellLockedETH(positionId);
      _shareProfits(positionId, sellValue);
    } else {
      // Gambler failed to sell it for higher value
      // ... has to pay a USDC fee to the provider
      _sendFeeToProvider(positionId);
      // Unlock provider's ETH
      _unlockProviderEther(positions[positionId].provider, positions[positionId].lockedEther);
    }
    emit PositionClosed(msg.sender, positionId, positions[positionId].endValue);
  }

  /**
   * Helpers
   */

  // Find available provider
  function _findAvailableProvider() view private returns (address) {
    return msg.sender;
  }

  // Lock provider's ethers when opening the position
  function _lockProviderEther(address provider, uint amount) private {
    availableBalance -= amount;
    //liquidityProviders[provider] -= amount;
  }

  // Unlock provider's ethers when closing the position
  function _unlockProviderEther(address provider, uint amount) private {
    availableBalance += amount;
    liquidityProviders[provider] += amount;
  }

  // Calculate off-chain price
  function _getEtherPrice(bool start, bool win) pure private returns (uint) {
    // TODO: Calculate price using Chainlink
    return start ? 100 : win ? 200 : 50;
  }

  // Sell locked ETH
  function _sellLockedETH(uint positionId) private returns (uint) {
    // TODO: Sell locked ether using Uniswap to USDC
    uint value = 100 ether;
    return value;
   }

  // Share USDC profits
  function _shareProfits(uint positionId, uint sellValue) private {
    uint providerFee = sellValue * (WINNER_FEE_PERCENTAGE / 100);
    daiToken.transfer(positions[positionId].owner, positions[positionId].amount + sellValue - providerFee);
    daiToken.transfer(positions[positionId].provider, providerFee);
 }

  // Send USDC fee to provider
  function _sendFeeToProvider(uint positionId) private {
    uint fee = positions[positionId].amount * (LOSER_FEE_PERCENTAGE / 100);
    daiToken.transfer(positions[positionId].provider, fee);
    daiToken.transfer(positions[positionId].owner, positions[positionId].amount - fee);
  }

  /**
   * Modifiers
   */

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