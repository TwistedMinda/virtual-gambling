//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWETH is ERC20 {

  constructor() ERC20("MockedWETH", "WETH") {
    
  }
  
  function deposit() external payable {
    _mint(msg.sender, msg.value);
  }
}