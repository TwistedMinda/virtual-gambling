
const hre = require("hardhat");

export const config: Record<string, any> = {
  localhost: { // Local fork of the mainnet
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e'
  },
  sepolia: { // We need to deploy them on the testnet
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e'
  },
}