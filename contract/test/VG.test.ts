import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers" 
import { expect } from "chai";
import { deployContract } from "../artifacts/contracts/src/tools";
import { VirtualGambling } from "../typechain-types";
import { ethers } from "hardhat";

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractRunner, ContractTransactionReceipt, ContractTransactionResponse, TransactionReceipt } from "ethers";

const { network } = require('hardhat');

const toWei = (val: number) => ethers.parseUnits(val.toString(), 18)
const displayEther = (val: number | bigint) => ethers.formatUnits(val, 18)

let contract: VirtualGambling

const amount = ethers.parseUnits("0.001", 18)

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
  })

  it("deposit ETH", async function () {
    const [_, user2] = await ethers.getSigners()
    const contractAddr = await contract.getAddress()   

    const action = contract.connect(user2).depositEth({ value: amount })
    if (network.name === "localhost") {
      await expectBalanceChange(contractAddr, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "Deposited").withArgs(user2.address, amount)
      )
    }
  })

  it("take position", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(owner).takePosition(200000),
      (res) => res.to.emit(contract, "PositionOpen")
    )
  })

  it("quit position", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(owner).quitPosition(200000),
      (res) => res.to.emit(contract, "PositionClosed")
    )
  })
})
