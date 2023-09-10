import { SEPOLIA_CONFIG } from 'constants/index';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import { sepolia } from 'wagmi/chains';
import { useNetwork } from 'wagmi';
import { CONTRACT_INTERFACE } from 'constants/EthereumABI';

const DEFAULT_ETH_CHAIN = sepolia.id;

const web3 = new Web3(Web3.givenProvider);
export const eth = web3.eth;
export type EthereumAddress = `0x${string}`;

export const addrs: Record<number, Record<string, string>> = {
	[sepolia.id]: {
    addr: SEPOLIA_CONFIG.dev.contractAddress,
    currency: 'ETH'
  },
};
export const getEthereumCurrency = (type: number = DEFAULT_ETH_CHAIN) => {
  if (!addrs[type]) return addrs[DEFAULT_ETH_CHAIN].currency;
  return addrs[type].currency;
};
export const getEthereumAddress = (type: number = DEFAULT_ETH_CHAIN) => {
  if (!addrs[type]) return addrs[DEFAULT_ETH_CHAIN].addr;
  return addrs[type].addr;
};

export const toEther = (wei: string | BigNumber) => {
  const str = typeof wei === 'string' ? wei : wei.toString();
  return Number(ethers.utils.formatEther(str));
};

export const toAddress = (address: string) => {
  return ethers.utils.getAddress(address);
};

export const parseEther = (ether: string) => {
  return ethers.utils.parseEther(ether);
};

export const toBigNumber = (val: number) => {
  return BigNumber.from(val);
};
export const fromBigNumber = (val: BigNumber) => {
  return val.toNumber();
};

export const useEthereumConfig = () => {
  const { chain: currentChain } = useNetwork();
  return {
    address: getEthereumAddress(currentChain?.id),
    abi: CONTRACT_INTERFACE,
    enabled: !!addrs[currentChain?.id || 0]
  };
};
