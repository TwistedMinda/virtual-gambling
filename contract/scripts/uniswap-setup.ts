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
  abi as POSITION_MANAGER_ABI,
  bytecode as POSITION_MANAGER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'

import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'

import {
  abi as QUOTER_ABI,
  bytecode as QUOTER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import { IERC20 } from "../typechain-types"
import { WETHERC20Interface } from "../typechain-types/contracts/Swapper.sol/WETHERC20"
import { WETHERC20 } from "../typechain-types/contracts/VirtualGambling.sol"

const getAmount = (amount: string) => ethers.parseUnits(amount, 18)

const setupPool = async (
  factory: any,
  daiToken: IERC20,
  wethToken: WETHERC20
) => {
  const [owner] = await ethers.getSigners()
  const daiTokenAddr = await daiToken.getAddress()
  const wethTokenAddr = await wethToken.getAddress()
  const factoryAddr = await factory.getAddress()
  const FEE = 3000
  
  // Create & retrieve the pool
  const pool = await factory.createPool(daiTokenAddr, wethTokenAddr, FEE)
  const createPoolTx = await pool.wait(1);
  const poolAddress = createPoolTx.logs[0].args[4]
  const poolContract = await ethers.getContractAt(POOL_ABI, poolAddress)
  const [
    t0,
    t1,
    f,
    tickSpacing,
    liquidity,
    slot0
  ] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.tickSpacing(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])
  console.log('tickSpacing', tickSpacing, 'liquidity', liquidity)

  // Retrieve position manager for the pair WETH/DAI
  const PositionManager = await ethers.getContractFactory(POSITION_MANAGER_ABI, POSITION_MANAGER_BYTECODE)
  const positionManager = await PositionManager.deploy(factoryAddr, wethTokenAddr, "0x0000000000000000000000000000000000000000") as any
  const positionManagerAddr = await positionManager.getAddress()
  console.log('🚀 Deployed PositionManager', positionManagerAddr)
  
  // Wrap some ETH
  await wethToken.deposit({ value: getAmount("1") })
  console.log('🚀 Wrapped some Ethers')

  // Authorize filling the pool
  const daiToApprove = getAmount("1400");
  await daiToken.approve(positionManagerAddr, daiToApprove);
  
  const ethToApprove = getAmount("1");
  await wethToken.approve(positionManagerAddr, ethToApprove);
  console.log('🚀 Approved tokens')

  // Add liquidity to the pool
  const params = {
    token0: daiTokenAddr,
    token1: wethTokenAddr,
    fee: FEE,
    tickLower: tickSpacing / 2n,
    tickUpper: tickSpacing * 2n,
    liquidity: liquidity,
    amount0Desired: daiToApprove,
    amount1Desired: ethToApprove,
    amount0Min: daiToApprove / 2n,
    amount1Min: ethToApprove / 2n,
    recipient: owner.address,
    deadline: (((await ethers.provider.getBlock('latest'))?.timestamp ?? 0) * 1000) + 600,
  }
  console.log(params)
  const addLiquidityTx = await positionManager.mint(params)
  await addLiquidityTx.wait(1);

  console.log('🚀 Filled liquidity pool')
}

export const getUniswapSetup = async (wethAddress: string) => {
  // Factory
  const Factory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE)
  const factory = await Factory.deploy()
  const factoryAddr = await factory.getAddress()

  // Router
  const SwapRouter = await ethers.getContractFactory(SWAP_ROUTER_ABI, SWAP_ROUTER_BYTECODE)
  const swapRouter = await SwapRouter.deploy(factoryAddr, wethAddress)
  const swapRouterAddr = await swapRouter.getAddress()

  // Quoter
  const Quoter = await ethers.getContractFactory(QUOTER_ABI, QUOTER_BYTECODE)
  const quoter = await Quoter.deploy(factoryAddr, wethAddress)
  const quoterAddr = await quoter.getAddress()

  // Mocked DAI
  const DAI = await ethers.getContractFactory('MockDAI')
  const daiToken = await DAI.deploy()
  const daiTokenAddr = await daiToken.getAddress()

  const wethToken = await ethers.getContractAt(WETH9_ABI, wethAddress)

  console.log('🚀 Uniswap booted\n- Deployed Factory, SwapRouter, Quoter & MockDAI\n- Retrieved WETH9')
  // Setup liquidiy pool
  await setupPool(factory, daiToken, wethToken as unknown as WETHERC20)

  return {
    DAI: daiTokenAddr,
    WETH: wethAddress,
    router: swapRouterAddr,
    quoter: quoterAddr,
  }
}