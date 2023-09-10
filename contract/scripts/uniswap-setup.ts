import { ethers } from "hardhat"

import {
  abi as WETH9_ABI,
  bytecode as WETH9_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json'

import {
  abi as POOL_ABI,
  bytecode as POOL_BYTECODE,
} from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'

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

const getAmount = (amount: string) => ethers.parseUnits(amount, 18)

const createPool = async (factory: any, router: any, token1: string, token2: string) => {
  const [owner] = await ethers.getSigners()
  const pool = await factory.createPool(token1, token2, 3000)
  const createPoolTx = await pool.wait(1);
  const poolAddress = createPoolTx.logs[0].args[4]

  console.log('poolAddr', poolAddress)
  const Pool = await ethers.getContractAt(POOL_ABI, poolAddress)
  console.log('yay', await Pool.getAddress())
  
  const addLiquidityTx = await Pool.mint(
    poolAddress,
    [token1, token2], // Token addresses
    [getAmount("10"), getAmount("10")], // Amounts to add
    [getAmount("9"), getAmount("9")], // Minimum amounts to add
    owner.address, // recipient
    Math.floor(Date.now() / 1000) + 60 * 20 // Deadline
  );
  await addLiquidityTx.wait();
}

export const getUniswapSetup = async (wethAddress: string) => {
  const Factory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE)
  const factory = await Factory.deploy()
  const factoryAddr = await factory.getAddress()
  console.log('🚀 Deployed "UniswapFactory": ', factoryAddr)

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

  const wethToken = await ethers.getContractAt(WETH9_ABI, wethAddress)

  const daiToApprove = getAmount("1000");
  await daiToken.approve(swapRouterAddr, daiToApprove);
  
  const ethToApprove = getAmount("0.01");
  await wethToken.approve(swapRouterAddr, ethToApprove);

  await createPool(factory, swapRouter, daiTokenAddr, wethAddress)

  // 4: Add liquidity to the pool
  // add liquidity to the pool that I just created above

  return {
    DAI: daiTokenAddr,
    WETH: wethAddress,
    router: swapRouterAddr,
    quoter: quoterAddr,
  }
}