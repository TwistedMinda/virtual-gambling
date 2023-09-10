// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Swapper.sol";

contract VirtualGambling {
  /**
   * Constants 
   */
  uint constant MAX_POSITION_DURATION = 1 days;
  uint constant LOSER_FEE_PERCENTAGE = 1;
  uint constant WINNER_FEE_PERCENTAGE = 50;
  uint constant CHUNK_SIZE = 0.01 ether;

  /**
   * Errors 
   */
  error InsufficientDeposit(uint required, uint provided);
  error DepositNotChunkCompatible(uint chunk_size, uint provided);
  error NotEnoughProviders(uint current, uint required);
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
    uint nbChunks;
    uint endValue;
    address owner;
    address provider;
    uint date;
    bool open;
  }

  struct AvailableProvider {
    uint index;
    uint chunks;
    address addr;
  }
  
  /**
   * Storage 
   */
  uint totalAvailableChunks = 0;
  uint id = 0;
  mapping (uint => Position) public positions;
  mapping (address => uint[]) public userPositions;

  Swapper swapper;
  address[] availableProviders;
  mapping (address => AvailableProvider) userAvailableProvider;

  constructor(address swapperAddress) {
    swapper = Swapper(swapperAddress);
  }

  /**
   * Liquidity provider methods
   */

  // Provide liquidity for the gamblers
  function depositLiquidity() payable public
    _isChunkCompatible(msg.value) {
    // Add available chunks
    uint count = msg.value / CHUNK_SIZE;
    _incrementChunks(msg.sender, count);
    emit DepositedLiquidity(msg.sender, msg.value);
  }

  // Retrieve liquidity from the contract
  function withdrawLiquidity(uint nbChunks) public {
    uint availableChunks = userAvailableProvider[msg.sender].chunks;
    if (availableChunks < nbChunks) {
      revert NotEnoughWithdrawableLiquidity(availableChunks, nbChunks);
    }
    _decrementChunks(msg.sender, nbChunks);
    uint amount = nbChunks * CHUNK_SIZE;
    payable(msg.sender).transfer(amount);
    emit WithdrawnLiquidity(msg.sender, amount);
  }

  /**
   * Virtual Gambler methods
   */
  
  // Open a position
  function openPosition() public {
    uint NB_CHUNKS = 1;
    address provider = _findAvailableProvider();
    _decrementChunks(provider, NB_CHUNKS);
    uint amount = NB_CHUNKS * _getEtherPrice(true, false);
    swapper.getDAIToken().transferFrom(msg.sender, address(this), amount);
    userPositions[msg.sender].push(id);
    positions[id] = Position({
      id: id,
      amount: amount,
      date: block.timestamp,
      owner: msg.sender,
      provider: provider,
      lockedEther: CHUNK_SIZE,
      nbChunks: NB_CHUNKS,
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
  function closePosition(uint positionId) public _requireOpenPosition(positionId) {
    if (msg.sender == positions[positionId].provider) {
      if (positions[positionId].date + MAX_POSITION_DURATION > block.timestamp) {
        revert PositionNotYetOutdated(positionId);
      }
    }
    uint currentValue = positions[positionId].nbChunks * _getEtherPrice(false, positionId > 0);
    positions[positionId].open = false;
    positions[positionId].endValue = currentValue;
    // Calculate virtual USDC profits
    if (currentValue > positions[positionId].amount) {
      // Gambler successfully sold it for higher value
      uint sellValue = _sellLockedETH(positionId);
      // ... we share profits to both participants
      _shareProfits(positionId, sellValue);
    } else {
      // Gambler failed to sell it for higher value
      // ... has to pay a USDC fee to the provider
      _sendFeeToProvider(positionId);
      // Unlock provider's ETH
      _incrementChunks(positions[positionId].provider, 1);
    }
    emit PositionClosed(msg.sender, positionId, positions[positionId].endValue);
  }

  /**
   * Getters
   */
  function getChunksCount() public view returns(uint count) {
    return totalAvailableChunks;
  }

  /**
   * Helpers
   */

  // Add available chunks
  function _incrementChunks(address provider, uint chunks) private {
    uint current = userAvailableProvider[provider].chunks;
    if (current == 0) {
      availableProviders.push(provider);
      // Save index of the new provider
      userAvailableProvider[provider].index = availableProviders.length - 1;
    }
    // Increment chunks
    userAvailableProvider[provider].chunks += chunks;
    totalAvailableChunks += chunks;
  }
  

  // Remove available chunks
  function _decrementChunks(address provider, uint chunks) private {
    uint current = userAvailableProvider[provider].chunks;
    if (current == 1) {
      // No more available chunks, remove from list
      removeProviderAtIndex(userAvailableProvider[provider].index);
    }
    // Decrement available chunks
    userAvailableProvider[provider].chunks -= chunks;
    totalAvailableChunks -= chunks;
  }

  // Remove provider from available providers
  function removeProviderAtIndex(uint index) private {
    availableProviders[index] = availableProviders[availableProviders.length - 1];
    userAvailableProvider[availableProviders[index]].index = index;
    availableProviders.pop();
  }

  // Find available chunks
  function _findAvailableProvider() view private returns (address) {
    if (availableProviders.length == 0) {
      revert NotEnoughProviders(availableProviders.length, 1);
    }
    return availableProviders[availableProviders.length - 1];
  }

  // Calculate off-chain price
  function _getEtherPrice(bool start, bool win) private returns (uint) {
    uint price = swapper.getEtherPrice();
    if (start) {
      return price;
    }
    if (win) {
      return price + (price / 2);
    }
    return price - (price / 2);
  }

  // Sell locked ETH
  function _sellLockedETH(uint positionId) private returns (uint) {
    uint amount = positions[positionId].lockedEther;
    swapper.wrapEther{value: amount}();
    TransferHelper.safeApprove(swapper.getWETHAddress(), address(swapper), amount);
    return swapper.swapEtherToDAI(swapper.getDAIAddress(), positions[positionId].lockedEther);
   }

  // Share USDC profits
  function _shareProfits(uint positionId, uint sellValue) private {
    // Provider gets its profits
    uint providerFee = sellValue * (WINNER_FEE_PERCENTAGE / 100);
    swapper.getDAIToken().transfer(positions[positionId].provider, providerFee);
    // Gambler gets the initially deposited amount + profits (- provider fee)
    swapper.getDAIToken().transfer(positions[positionId].owner, positions[positionId].amount + sellValue - providerFee);
 }

  // Send USDC fee to provider
  function _sendFeeToProvider(uint positionId) private {
    // Provider get its profits
    uint fee = positions[positionId].amount * LOSER_FEE_PERCENTAGE / 100;
    swapper.getDAIToken().transfer(positions[positionId].provider, fee);
    // Gambler gets the initially deposited amount (- fee)
    swapper.getDAIToken().transfer(positions[positionId].owner, positions[positionId].amount - fee);
  }

  /**
   * Modifiers
   */

  modifier _isChunkCompatible(uint amount) {
    if (amount % CHUNK_SIZE != 0) {
      revert DepositNotChunkCompatible(CHUNK_SIZE, amount);
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