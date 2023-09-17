import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { FinishPopup } from 'popups/FinishPopup';
import { TradePopup } from 'popups/TradePopup';

export default function Root() {
  useEffect(() => {
    document.getElementById('above')?.classList.add('hidden');
  }, []);

  return (
    <>
      <Outlet />
      <TradePopup />
      <FinishPopup />
    </>
  );
}
