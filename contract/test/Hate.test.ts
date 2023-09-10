import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers" 
import { expect } from "chai";
import { deployContract } from "../artifacts/contracts/src/tools";
import { HateMe } from "../typechain-types";
import { ethers } from "hardhat";

import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractRunner, ContractTransactionReceipt, ContractTransactionResponse, TransactionReceipt } from "ethers";

const { network } = require('hardhat');

const toWei = (val: number) => ethers.parseUnits(val.toString(), 18)
const displayEther = (val: number | bigint) => ethers.formatUnits(val, 18)

let contract: HateMe

const bucketSlug = ethers.toUtf8Bytes("julius")
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

describe("HateMe", function () {
  
  /**
   * Positive tests
   */

  it("deploy contract", async function () {
    contract = await deployContract()
  })

  it("create bucket", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectFinish(
      contract.connect(owner).createBucket(bucketSlug),
      (res) => res.to.emit(contract, "BucketCreated")
    )
  })

  it("hate someone", async function () {
    const [_, user2] = await ethers.getSigners()
    const contractAddr = await contract.getAddress()   

    const action = contract.connect(user2).hateYou(bucketSlug, { value: amount })
    if (network.name === "localhost") {
      await expectBalanceChange(contractAddr, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "Hated").withArgs(bucketSlug, amount)
      )
    }
  })

  it("love someone", async function () {
    const [_, user2] = await ethers.getSigners()
    const contractAddr = await contract.getAddress() 

    const action = contract.connect(user2).kiddingILoveYou(bucketSlug, { value: amount })
    if (network.name === "localhost") {
      await expectBalanceChange(contractAddr, action, amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "Loved").withArgs(bucketSlug, amount)
      )
    }
  })

  it("non-owner can't claim", async function () {
    const [_, user2] = await ethers.getSigners()

    await expectError(
      contract.connect(user2).claim(bucketSlug),
      "YouAreNotTheOwner"
    )
  })
  
  it("owner can claim", async function () {
    const [owner] = await ethers.getSigners()
    
    const action = contract.connect(owner).claim(bucketSlug)
    if (network.name === "localhost") {
      await expectBalanceChange(owner.address, action, amount + amount)
    } else {
      await expectFinish(action, res =>
        res.to.emit(contract, "Claimed").withArgs(owner.address, amount + amount)
      )
    }
  })

  /**
   * Negative tests
   */

  it("bucket already exists", async function () {
    const [owner] = await ethers.getSigners()

    await expectError(
      contract.connect(owner).createBucket(bucketSlug),
      "BucketAlreadyExists"
    )
  })

  it("bucket doesn't exist", async function () {
    const [_, user2] = await ethers.getSigners()

    const unknown = ethers.toUtf8Bytes("unknown")
    await expectError(
      contract.connect(user2).hateYou(unknown, { value: amount }),
      "BucketDoesNotExist"
    )
  })

  it("can only create lowercase bucket", async function () {
    const [owner] = await ethers.getSigners()

    const withCaps = ethers.toUtf8Bytes("wiThCapS")
    await expectError(
      contract.connect(owner).createBucket(withCaps),
      "StringMustBeLowerCase"
    )
  })

  it("can't create bad slugs", async function () {
    const tooShort = ethers.toUtf8Bytes("ju")
    const tooLong = ethers.toUtf8Bytes(Array(50).fill(0).toString())
    
    await expectError(
      contract.createBucket(tooShort),
      "SlugMustBeAtLeast3Characters"
    )

    await expectError(
      contract.createBucket(tooLong),
      "SlugMustBeAMaximumOf50Characters"
    )
  })

  it("not enough funds to hate", async function () {
    const [_, user2] = await ethers.getSigners()

    await expectError(
      contract.connect(user2).hateYou(bucketSlug, { value: 0 }),
      "InsufficientEntry"
    )
  })

  it("can't claim twice", async function () {
    const [owner] = await ethers.getSigners()
    
    await expectError(
      contract.connect(owner).claim(bucketSlug),
      "NothingToClaim"
    )
  })
})
