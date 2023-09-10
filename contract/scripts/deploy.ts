import { deployContract, deploySwapperContract, verifyContract } from "../artifacts/contracts/src/tools";

async function main() {
  const swapper = await deploySwapperContract()
  const swapperAddress = await swapper.getAddress()
  await deployContract(swapperAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
