import { parseEther, toBigNumber, useEthereumConfig } from "utils/eth.utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export const usePlay = () => {
  const cfg = useEthereumConfig();
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'depositLiquidity',
    overrides: {
      value: parseEther("0.01")
    },
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const play = async () => writeAsync?.();

  return {
    play,
    isLoading
  };
};

export const useClaim = () => {
  const cfg = useEthereumConfig();
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'withdrawLiquidity',
    args: [toBigNumber(1)],
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const claim = async () => writeAsync?.();

  return {
    claim,
    isLoading
  };
};
