import { deployContract, deploySwapperContract, verifyContract } from "../artifacts/contracts/src/tools";

async function main() {
  const swapper = await deploySwapperContract()
  const contract = await deployContract(await swapper.getAddress())
  const address = await contract.getAddress()
  await verifyContract(address, [])
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
