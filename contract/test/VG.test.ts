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

const { network } = require('hardhat');

const toWei = (val: number) => ethers.parseUnits(val.toString(), 18)
const displayEther = (val: number | bigint) => ethers.formatUnits(val, 18)

let swapperContract: Swapper
let contract: VirtualGambling

const daiToken = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const wethToken = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

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

const getBalance = async (address: string) =>
  await ethers.provider.getBalance(address)

const getFormattedBalance = async (address: string) =>
  displayEther(await getBalance(address))

const log = async () => {
  const [gambler, liquidityProvider] = await ethers.getSigners()
  console.table({
    Gambler: [await getFormattedBalance(gambler.address), await getBalanceForToken(daiToken, gambler.address)],
    LiquidityProvider: [await getFormattedBalance(liquidityProvider.address), await getBalanceForToken(daiToken, liquidityProvider.address)],
    Contract: [await getFormattedBalance(await contract.getAddress()), await getBalanceForToken(daiToken, await contract.getAddress())]
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
    contract = await deployContract()
    swapperContract = await deploySwapperContract()
  })

  it("fund DAI", async function () {
    const [gambler] = await ethers.getSigners()
    const value = ethers.parseUnits("5", 18)
    await swapperContract.wrapEther({ value: value })
    await approveToken(wethToken, await swapperContract.getAddress(), value)
    await swapperContract.swapEtherToDAI(daiToken, value)
    const gamblerBalance = await getBalanceForToken(daiToken, await gambler.address)
    console.log('> Funded', gamblerBalance, 'DAI')
  })

  it("deposit ETH", async function () {
    const [_, liquidityProvider] = await ethers.getSigners()
    const contractAddr = await contract.getAddress()   

    const amount = getAmount("5")
    const action = contract.connect(liquidityProvider).depositLiquidity({ value: amount })
    if (network.name === "localhost") {
      await expectBalanceChange(contractAddr, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "DepositedLiquidity").withArgs(liquidityProvider.address, amount)
      )
    }
  })

  const lossPositionId = 0
  const allowed = getAmount("2000") // More than current Chunk price
  
  it("(loss case) take position", async function () {
    const [gambler] = await ethers.getSigners()
    
    await approveToken(daiToken, await contract.getAddress(), allowed)
    await expectFinish(
      contract.connect(gambler).openPosition(),
      (res) => res.to.emit(contract, "PositionOpen").withArgs(gambler.address, lossPositionId, (x: number) => {
        console.log('position opened at: ', displayEther(x))
        return true
      })
    )
  })

  it("(loss case) quit position", async function () {
    const [gambler] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(gambler).closePosition(lossPositionId),
      (res) => res.to.emit(contract, "PositionClosed").withArgs(gambler.address, lossPositionId, (x: number) => {
        console.log('position closed at: ', displayEther(x))
        return true
      })
    )

    await log()
  })

  return;

  const winPositionId = 1
  it("(win case) take position", async function () {
    const [gambler] = await ethers.getSigners()
    
    await approveToken(daiToken, await contract.getAddress(), allowed)
    await expectFinish(
      contract.connect(gambler).openPosition(),
      (res) => res.to.emit(contract, "PositionOpen").withArgs(gambler.address, winPositionId, allowed)
    )
  })

  it("(win case) quit position", async function () {
    const [gambler] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(gambler).closePosition(winPositionId),
      (res) => res.to.emit(contract, "PositionClosed").withArgs(gambler.address, winPositionId, getAmount("200"))
    )
  })
  
  
  it("withdraw ETH", async function () {
    const [_, liquidityProvider] = await ethers.getSigners()

    const amount = getAmount("1")
    const action = contract.connect(liquidityProvider).withdrawLiquidity(amount)
    if (network.name === "localhost") {
      await expectBalanceChange(liquidityProvider.address, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "WithdrawnLiquidity").withArgs(liquidityProvider.address, amount)
      )
    }
  })

  /**
   * Negative tests
   */

  it("can't close twice", async function () {
    const [gambler] = await ethers.getSigners()
    
    await expectError(
      contract.connect(gambler).closePosition(0),
      "PositionAlreadyClosed"
    )
  })
})
