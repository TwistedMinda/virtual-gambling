import create from 'zustand';
import { persist } from 'zustand/middleware';

export type ChainType = 'eth';
export type UserStore = {
  chainType: ChainType;
  setChainType: (_: ChainType) => void;
};
export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      chainType: 'eth',
      setChainType: (chainType: ChainType) => set((_) => ({ chainType }))
    }),
    {
      name: 'user-store',
      partialize: (state): any => ({ chainType: state.chainType })
    }
  )
);
