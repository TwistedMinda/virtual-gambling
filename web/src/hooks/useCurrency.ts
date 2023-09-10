import { getEthereumCurrency } from 'utils/eth.utils';
import { useNetwork } from 'wagmi';

export const useCurrency = () => {
  const { chain } = useNetwork();
  return getEthereumCurrency(chain?.id);
};
