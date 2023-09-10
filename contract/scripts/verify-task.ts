import { verifyContract } from "../artifacts/contracts/src/tools";
import { task } from "hardhat/config";

task("verify", "Verify contract")
  .addPositionalParam("contract")
  .addPositionalParam("swapperContract")
  .setAction(async ([addr, swapperAddr]) => {
    await verifyContract(addr, [swapperAddr])
  });