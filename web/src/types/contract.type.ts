import { fromBigNumber } from 'utils/eth.utils';

export type Stats = {
  totalTaps: number;
  deployTimestamp: number;
};

export const filterStats = <ContractInput>(item: ContractInput): Stats => {
  const stats = item as any;
  return {
    totalTaps: fromBigNumber(stats.totalTaps),
    deployTimestamp: stats.deployTimestamp * 1000
  };
};
