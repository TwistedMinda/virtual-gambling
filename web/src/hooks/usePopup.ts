import { PopupType, usePopupStore } from 'stores/popup-store';

const usePopup = (type: PopupType) => {
  const popup = usePopupStore((state) => state.popups[type]);
  const setPopup = usePopupStore((state) => state.setPopup);
  const show = (data?: any) => {
    setPopup(type, {
      shown: true,
      data
    });
  };
  const hide = () => {
    setPopup(type, {
      shown: false
    });
  };
  return {
    show,
    hide,
    shown: popup.shown,
    data: popup.data || {}
  };
};

export default usePopup;
