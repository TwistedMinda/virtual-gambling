import { parseEther, toBigNumber, useEthereumConfig } from "utils/eth.utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export const useDepositLiquidity = () => {
  const cfg = useEthereumConfig();
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'depositLiquidity',
    overrides: {
      value: parseEther("0.01")
    },
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const depositLiquidity = async () => writeAsync?.();

  return {
    depositLiquidity,
    isLoading
  };
};

export const useWithdrawLiquidity = () => {
  const cfg = useEthereumConfig();
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'withdrawLiquidity',
    args: [toBigNumber(1)],
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const withdrawLiquidity = async () => writeAsync?.();

  return {
    withdrawLiquidity,
    isLoading
  };
};
