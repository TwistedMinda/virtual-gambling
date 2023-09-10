import { useContractRead } from "wagmi";
import { fromBigNumber, useEthereumConfig } from "utils/eth.utils";
import { useAddress } from "./useAddress";

export const useInfo = () => {
  const address = useAddress()
  const cfg = useEthereumConfig();
  const { data, isLoading, error, refetch } = useContractRead({
    ...cfg,
    functionName: 'getChunksCount',
    enabled: !!address,
    watch: true
  });

  return {
    availableChunks: data ? fromBigNumber(data) : 0,
    isLoading,
    refetch,
    error
  }
}