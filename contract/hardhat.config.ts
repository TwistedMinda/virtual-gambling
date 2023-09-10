import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config()

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEP_RPC_URL ?? '',
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY ?? '', process.env.PRIVATE_KEY_2 ?? ''],
      gasPrice: 3000000000,
    },
    goerli: {
      url: process.env.GOE_RPC_URL ?? '',
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY ?? '', process.env.PRIVATE_KEY_2 ?? ''],
      gasPrice: 3000000000,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.SEP_SCAN_KEY || ''
    }
  },
  mocha: {
    timeout: 100000000
  }
};

export default config;
