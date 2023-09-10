import { ethers } from "hardhat"

import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'

import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'

import {
  abi as QUOTER_ABI,
  bytecode as QUOTER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'

const createPool = async (factory: any, token1: string, token2: string) => {
  const pool = await factory.createPool(token1, token2, 3000)
  const tx = await pool.wait(1);
  const poolAddress = tx.logs[0].args[4]
  console.log('yay', poolAddress)
}

export const getUniswapSetup = async (wethAddress: string) => {
  const Factory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE)
  const factory = await Factory.deploy()
  const factoryAddr = await factory.getAddress()
  console.log('🚀 Deployed "UniswapFactory": ', factoryAddr)

  console.log('weth', wethAddress)
  const SwapRouter = await ethers.getContractFactory(SWAP_ROUTER_ABI, SWAP_ROUTER_BYTECODE)
  const swapRouter = await SwapRouter.deploy(factoryAddr, wethAddress)
  const swapRouterAddr = await swapRouter.getAddress()
  console.log('🚀 Deployed "SwapRouter": ', swapRouterAddr)

  const Quoter = await ethers.getContractFactory(QUOTER_ABI, QUOTER_BYTECODE)
  const quoter = await Quoter.deploy(factoryAddr, wethAddress)
  const quoterAddr = await quoter.getAddress()
  console.log('🚀 Deployed "Quoter": ', quoterAddr)

  const DAI = await ethers.getContractFactory('MockDAI')
  const daiToken = await DAI.deploy()
  const daiTokenAddr = await daiToken.getAddress()
  console.log('🚀 Deployed "MockDAI": ', daiTokenAddr)

  await createPool(factory, daiTokenAddr, wethAddress)

  // 4: Add liquidity to the pool
  // add liquidity to the pool that I just created above

  return {
    DAI: daiTokenAddr,
    WETH: wethAddress,
    router: swapRouterAddr,
    quoter: quoterAddr,
  }
}