import env from "react-dotenv";

export const SEPOLIA_CONFIG = {
	dev: {
		node: env.DEV_SEPOLIA_NODE,
		contractAddress: env.DEV_SEPOLIA_CONTRACT_ADDRESS,
	},
	prod: {
		node: env.PROD_SEPOLIA_NODE,
		contractAddress: env.PROD_SEPOLIA_CONTRACT_ADDRESS,
	},
}

console.log('config', SEPOLIA_CONFIG)