import { useContractRead } from "wagmi";
import { fromBigNumber, useEthereumConfig } from "utils/eth.utils";

export const useInfo = () => {
  const cfg = useEthereumConfig();
  const { data, isLoading, error, refetch } = useContractRead({
    ...cfg,
    functionName: 'getChunksCount',
    select: fromBigNumber,
    watch: true
  });

  return {
    availableChunks: data ?? 0,
    isLoading,
    refetch,
    error
  }
}