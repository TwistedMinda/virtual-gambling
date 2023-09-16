
const hre = require("hardhat");

export const config: Record<string, any> = {
  localhost: {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: undefined, // Needs to be deployed & minted manually
    router: undefined, // Needs to be deployed manually
    quoter: undefined, // Needs to be deployed manually
    chainlinkAggregator: undefined // Needs to be deployed manually
  },
  fork_localhost: { // Local fork of the mainnet
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    chainlinkAggregator: '0x694AA1769357215DE4FAC081bf1f309aDC325306'
  },
  sepolia: {
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    DAI: undefined, // Needs to be deployed & minted manually
    router: undefined, // Needs to be deployed manually
    quoter: undefined, // Needs to be deployed manually
    chainlinkAggregator: '0x694AA1769357215DE4FAC081bf1f309aDC325306'
  },
  optimisumTestnet: {
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    DAI: undefined, // Needs to be deployed & minted manually
    router: undefined, // Needs to be deployed manually
    quoter: undefined, // Needs to be deployed manually
    chainlinkAggregator: '0x694AA1769357215DE4FAC081bf1f309aDC325306'
  }
}