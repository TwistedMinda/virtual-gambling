// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Swapper.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// interface WETHERC20 is IERC20 {
//   function deposit() external payable;
//   function withdraw(uint256 amount) external;
// }

contract VirtualGambling {
  /**
   * Constants 
   */
  uint constant MAX_POSITION_DURATION = 1 days;
  uint constant LOSER_FEE_PERCENTAGE = 1;
  uint constant WINNER_FEE_PERCENTAGE = 50;
  uint constant CHUNK_SIZE = 0.1 ether;

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
  
  /**
   * Storage 
   */
  address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
  address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  WETHERC20 public daiToken = WETHERC20(DAI);
  
  uint id = 0;
  mapping (uint => Position) public positions;
  mapping (address => uint[]) public userPositions;
  mapping (address => uint) public liquidityProviders;

  address[] chunks;
  Swapper swapper;

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
    for (uint i = 0; i < count; i++) {
      chunks.push(msg.sender);
    }
    liquidityProviders[msg.sender] += msg.value;
    emit DepositedLiquidity(msg.sender, msg.value);
  }

  // Retrieve liquidity from the contract
  function withdrawLiquidity(uint amount) public {
    uint liquidity = liquidityProviders[msg.sender];
    if (liquidity < amount) {
      revert NotEnoughWithdrawableLiquidity(liquidity, amount);
    }
    liquidityProviders[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
    emit WithdrawnLiquidity(msg.sender, amount);
  }

  /**
   * Virtual Gambler methods
   */

  // Open a position
  function openPosition() public { // _minimumGamblingDeposit(chunks)
    uint NB_CHUNKS = 1;
    address provider = _findAvailableProvider();
    _lockProviderEther(provider, CHUNK_SIZE);
    uint amount = NB_CHUNKS * _getEtherPrice(true, false);
    daiToken.transferFrom(msg.sender, address(this), amount);
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
      _unlockProviderEther(positions[positionId].provider, positions[positionId].lockedEther);
    }
    emit PositionClosed(msg.sender, positionId, positions[positionId].endValue);
  }

  /**
   * Getters
   */
  function getChunksCount() public view returns(uint count) {
    return chunks.length;
  }

  /**
   * Helpers
   */

  // Find available provider
  function _findAvailableProvider() private returns (address) {
    if (chunks.length == 0) {
      revert NotEnoughProviders(chunks.length, 1);
    }
    address provider = chunks[chunks.length - 1];
    chunks.pop();
    return provider;
  }

  // Lock provider's ethers when opening the position
  function _lockProviderEther(address provider, uint amount) private {
    liquidityProviders[provider] -= amount;
  }

  // Unlock provider's ethers when closing the position
  function _unlockProviderEther(address provider, uint amount) private {
    liquidityProviders[provider] += amount;
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
    TransferHelper.safeApprove(WETH, address(swapper), amount);
    return swapper.swapEtherToDAI(DAI, positions[positionId].lockedEther);
   }

  // Share USDC profits
  function _shareProfits(uint positionId, uint sellValue) private {
    // Provider gets its profits
    uint providerFee = sellValue * (WINNER_FEE_PERCENTAGE / 100);
    daiToken.transfer(positions[positionId].provider, providerFee);
    // Gambler gets the initially deposited amount + profits (- provider fee)
    daiToken.transfer(positions[positionId].owner, positions[positionId].amount + sellValue - providerFee);
 }

  // Send USDC fee to provider
  function _sendFeeToProvider(uint positionId) private {
    // Provider get its profits
    uint fee = positions[positionId].amount * LOSER_FEE_PERCENTAGE / 100;
    daiToken.transfer(positions[positionId].provider, fee);
    // Gambler gets the initially deposited amount (- fee)
    daiToken.transfer(positions[positionId].owner, positions[positionId].amount - fee);
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