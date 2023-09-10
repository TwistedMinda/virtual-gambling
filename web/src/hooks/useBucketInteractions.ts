
export const useBucketInteractions = () => {
  return null
}

/*
const filterBucket = <ContractInput>(
  item: ContractInput
) => {
  const accountInfo = item as any;
  return {
    loved: fromBigNumber(accountInfo.loved),
    gains: toEther(accountInfo.gains),
    exists: accountInfo.exists,
  };
};

const decode = (name: string) => {
  const bytes = []
  for (const letter of name) {
    bytes.push(Number(letter))
  }
  return bytes
}

export const useLove = (name: string) => {
  const cfg = useEthereumConfig();
  const encoded = decode(name)
  const { config } = usePrepareContractWrite({
    ...cfg,
    functionName: 'kiddingILoveYou',
    args: [encoded as any],
    overrides: {
      value: parseEther((0.001).toString())
    }
  });
  const { writeAsync, isLoading } = useContractWrite(config);
  const love = async () => writeAsync?.();

  return {
    love,
    isLoading
  };
};

export const useBucketInteractions = (slug: string) => {
  const cfg = useEthereumConfig();
  const { love } = useLove(slug)
  const { data, isLoading, error, refetch } = useContractRead({
    ...cfg,
    functionName: 'buckets',
    args: slug ? [decode(slug) as any] : undefined,
    select: filterBucket,
    watch: true
  });


  return {
    data,
    isLoading,
    error,
    refresh: refetch,
    
    loves: data?.loved ?? 0,
    onLove: () => {
      love()
    }
  };
};
*/