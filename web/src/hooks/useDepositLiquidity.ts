import { parseEther, useEthereumConfig } from "utils/eth.utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { useAddress } from "./useAddress";


export const useDepositLiquidity = (enabled: boolean) => {
  const address = useAddress()
  const cfg = useEthereumConfig();
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'depositLiquidity',
    overrides: {
      value: parseEther("0.01")
    },
    enabled: !!address,
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const depositLiquidity = async () => writeAsync?.();

  return {
    depositLiquidity,
    isLoading
  };
};
