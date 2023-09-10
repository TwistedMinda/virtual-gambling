import { parseEther, useEthereumConfig } from "utils/eth.utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";


export const useDepositLiquidity = (enabled: boolean) => {
  const cfg = useEthereumConfig();
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'depositLiquidity',
    overrides: {
      value: parseEther("0.1")
    },
    enabled: false,
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const depositLiquidity = async () => writeAsync?.();

  return {
    depositLiquidity,
    isLoading
  };
};
