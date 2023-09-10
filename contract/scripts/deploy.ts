import { deployContract, verifyContract } from "../artifacts/contracts/src/tools";

async function main() {
  const contract = await deployContract()
  const address = await contract.getAddress()
  await verifyContract(address, [])
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
