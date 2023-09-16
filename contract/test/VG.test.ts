import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers" 
import { expect } from "chai";
import { deployContract, deploySwapperContract } from "../artifacts/contracts/src/tools";
import { Swapper, VirtualGambling } from "../typechain-types";
import { ethers } from "hardhat";

import ERC20ABI from './erc20.abi.json'
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractRunner, ContractTransactionReceipt, ContractTransactionResponse, TransactionReceipt } from "ethers";
import { config } from "../scripts/config";
import { getUniswapSetup } from "../scripts/uniswap-setup";

const { network } = require('hardhat');

let swapperContract: Swapper
let contract: VirtualGambling

let daiToken = ''
let wethToken = ''

const getTokenContract = (tokenAddress: string, runner: ContractRunner = ethers.provider) =>
  new ethers.Contract(tokenAddress, ERC20ABI, runner);

const approveToken = async (tokenAddress: string, receiver: string, value: any) => {
  const [gambler] = await ethers.getSigners()
  const token = getTokenContract(tokenAddress, gambler)
  return token.approve(receiver, value)
}

const getBalanceForToken = async (tokenAddress: string, address: string) =>
  ethers.formatUnits(
    await getTokenContract(tokenAddress).balanceOf(address)
  )

const getAmount = (amount: string) => ethers.parseUnits(amount, 18)
const displayEther = (val: number | bigint) => ethers.formatUnits(val, 18)

const getBalance = async (address: string) =>
  await ethers.provider.getBalance(address)

const getFormattedBalance = async (address: string) =>
  displayEther(await getBalance(address))

const log = async () => {
  const [gambler, liquidityProvider] = await ethers.getSigners()
  const contractAddr = await contract.getAddress()
  console.table({
    Gambler: [
      await getFormattedBalance(gambler.address),
      await getBalanceForToken(daiToken, gambler.address),
      await contract.liquidityProviders(gambler.address)
    ],
    LiquidityProvider: [
      await getFormattedBalance(liquidityProvider.address),
      await getBalanceForToken(daiToken, liquidityProvider.address),
      await contract.liquidityProviders(liquidityProvider.address)
    ],
    Contract: [
      await getFormattedBalance(contractAddr),
      await getBalanceForToken(daiToken, contractAddr),
      await contract.liquidityProviders(contractAddr)
    ]
  })
}

const expectBalanceChange = async (
  addr: string,
  action: Promise<any>,
  expectedChange: bigint
) =>
  expect(await action).to.changeEtherBalance(addr, expectedChange)

const expectFinish = async (
  receipt: Promise<ContractTransactionResponse>,
  check: (res: Chai.Assertion) => void
) => 
  check(await expect(await (await receipt).wait(1)))

const expectError = async (
  receipt: Promise<ContractTransactionResponse>,
  error: string
) =>
  await expect(receipt).to.revertedWithCustomError(contract, error)

describe("VirtualGambling", function () {
  
  /**
   * Positive tests
   */

  it("deploy contract", async function () {
    let cfg = config[network.name] ?? config.localhost

    if (!cfg.router) {
      // We need to Uniswap ourselves
      cfg = await getUniswapSetup(cfg.WETH)
    }
    daiToken = cfg.DAI
    wethToken = cfg.WETH

    swapperContract = await deploySwapperContract(cfg)
    contract = await deployContract(await swapperContract.getAddress())
  })

  it("fund DAI", async function () {
    const [gambler] = await ethers.getSigners()

    const value = getAmount("1")
    await swapperContract.wrapEther({ value: value })
    await approveToken(wethToken, await swapperContract.getAddress(), value)
    await swapperContract.swapEtherToDAI(value)
    const gamblerBalance = await getBalanceForToken(daiToken, await gambler.address)
    console.log('> Gambler has ', gamblerBalance, 'DAI')
  })

  const lossPositionId = 0
  const allowedDAI = getAmount("1")
  
  it("create fight (deposit DAI)", async function () {
    const [gambler] = await ethers.getSigners()
    
    await approveToken(daiToken, await contract.getAddress(), allowedDAI)
    await expectFinish(
      contract.connect(gambler).startFighting(),
      (res) => res.to.emit(contract, "FightPending").withArgs(gambler.address)
    )
  })
  
  it("join existing fight (deposit DAI)", async function () {
    const [gambler] = await ethers.getSigners()
    
    await approveToken(daiToken, await contract.getAddress(), allowedDAI)
    await expectFinish(
      contract.connect(gambler).startFighting(),
      (res) => res.to.emit(contract, "FightCreated").withArgs(lossPositionId, gambler.address, (x: number) => {
        console.log('> Starting a fight with: ', x)
        return true
      })
    )
  })
  
  /*
  it("claim earned ETH", async function () {
    const [_, liquidityProvider] = await ethers.getSigners()

    const chunksToWithdraw = 1
    const action = contract.connect(liquidityProvider).withdrawLiquidity(chunksToWithdraw)
    if (network.name === "localhost") {
      await expectBalanceChange(liquidityProvider.address, action, getAmount("0.01"))
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "WithdrawnLiquidity").withArgs(liquidityProvider.address, chunksToWithdraw)
      )
    }
  })
  */

})
