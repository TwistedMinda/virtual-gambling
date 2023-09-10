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
  const [owner] = await ethers.getSigners()
  const token = getTokenContract(tokenAddress, owner)
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
  const [owner, user2] = await ethers.getSigners()
  console.table({
    User1: await getFormattedBalance(owner.address),
    User2: await getFormattedBalance(user2.address),
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
    const [owner] = await ethers.getSigners()
    const value = ethers.parseUnits("5", 18)
    await swapperContract.wrapEther({ value: value })
    await approveToken(wethToken, await swapperContract.getAddress(), value)
    await swapperContract.swapEtherToDAI(daiToken, value)
    const userBalance = await getBalanceForToken(daiToken, await owner.address)
    console.log('> Funded', userBalance, 'DAI')
  })

  it("deposit ETH", async function () {
    const [_, user2] = await ethers.getSigners()
    const contractAddr = await contract.getAddress()   

    const amount = getAmount("1")
    const action = contract.connect(user2).depositLiquidity({ value: amount })
    if (network.name === "localhost") {
      await expectBalanceChange(contractAddr, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "DepositedLiquidity").withArgs(user2.address, amount)
      )
    }
  })

  const lossPositionId = 0
  const investment = getAmount("100")
  
  it("(loss case) take position", async function () {
    const [owner] = await ethers.getSigners()
    
    await approveToken(daiToken, await contract.getAddress(), investment)
    await expectFinish(
      contract.connect(owner).openPosition(investment),
      (res) => res.to.emit(contract, "PositionOpen").withArgs(owner.address, lossPositionId, investment)
    )
  })

  return;

  it("(loss case) quit position", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(owner).closePosition(lossPositionId),
      (res) => res.to.emit(contract, "PositionClosed").withArgs(owner.address, lossPositionId, getAmount("50"))
    )
  })


  const winPositionId = 1
  it("(win case) take position", async function () {
    const [owner] = await ethers.getSigners()
    
    await approveToken(daiToken, await contract.getAddress(), investment)
    await expectFinish(
      contract.connect(owner).openPosition(investment),
      (res) => res.to.emit(contract, "PositionOpen").withArgs(owner.address, winPositionId, investment)
    )
  })

  it("(win case) quit position", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(owner).closePosition(winPositionId),
      (res) => res.to.emit(contract, "PositionClosed").withArgs(owner.address, winPositionId, getAmount("200"))
    )
  })
  
  
  it("withdraw ETH", async function () {
    const [_, user2] = await ethers.getSigners()

    const amount = getAmount("1")
    const action = contract.connect(user2).withdrawLiquidity(amount)
    if (network.name === "localhost") {
      await expectBalanceChange(user2.address, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "WithdrawnLiquidity").withArgs(user2.address, amount)
      )
    }
  })

  /**
   * Errors tests
   */

  it("can't close twice", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectError(
      contract.connect(owner).closePosition(0),
      "PositionAlreadyClosed"
    )
  })
})
