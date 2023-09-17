
const encode = (name: string) => {
  const bytes = []
  for (const letter of name) {
    bytes.push(Number(letter))
  }
  return bytes
}

export const useTrade = (name: string) => {
  return null
  /*
  const { address } = useEthereumConfig();
  const cfg = useEthereumConfig();
  const encoded = encode(name)
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'Trade',
    args: [encoded as any],
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const Trade = async () => writeAsync?.();

  return {
    Trade,
    isLoading
  };
  */
};
