import { useModal } from 'connectkit';
import { useDisconnect } from 'wagmi';

export const useWalletConnect = () => {
  const { disconnect } = useDisconnect();
  const { setOpen } = useModal();
  return {
    disconnect: () => {
      disconnect();
    },
    connect: () => {
      setOpen(true);
    }
  };
};
