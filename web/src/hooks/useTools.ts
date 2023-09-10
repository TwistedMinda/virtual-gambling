import { useCurrency } from 'hooks/useCurrency';

export const useTools = () => {
  const currency = useCurrency();

  const showAmount = (value: number, overrideCurrency?: string) => {
    return `${value.toFixed(6)} ${overrideCurrency || currency}`;
  };
  return {
    showAmount
  };
};
