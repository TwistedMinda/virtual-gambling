import { useEffect, useState } from 'react';
import { eth, toEther } from 'utils/eth.utils';
import { useAddress } from 'hooks/useAddress';
import { useNetwork } from 'wagmi';
import { useFinishCallback } from './useFinishCallback';

export const useBalance = () => {
  const { address } = useAddress();
  const { chain } = useNetwork();
  const [balance, setBalance] = useState<number | undefined>(undefined);
  useFinishCallback(() => {
    refresh();
  });

  const refresh = async () => {
    if (!address) return '0';
    const res = await eth.getBalance(address);
    setBalance(toEther(res));
  };

  useEffect(() => {
    if (address) refresh();
  }, [address, chain?.id]);

  return {
    balance,
    refresh
  };
};
