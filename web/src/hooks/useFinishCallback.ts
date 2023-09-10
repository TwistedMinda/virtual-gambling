import { useEthereumConfig } from 'utils/eth.utils';
import { useContractEvent } from 'wagmi';
import { useAddress } from './useAddress';

export type FinishCallback = () => void;

export const useFinishCallback = (callback: FinishCallback) => {
  const { address } = useAddress();
  const cfg = useEthereumConfig();
  useContractEvent({
    ...cfg,
    eventName: 'PositionOpen',
    listener(userAddress) {
      if (userAddress === address) {
        callback();
      }
    }
  });

  return null;
};
