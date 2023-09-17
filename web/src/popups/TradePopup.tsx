import { useEffect, useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useFinishCallback } from 'hooks/useFinishCallback';
import { CREATE_BUCKET, FINISH_POPUP } from 'stores/popup-store';
import Card from 'components/Card';
import usePopup from 'hooks/usePopup';
import Popup from 'reactjs-popup';

export const TradePopup = () => {
  const [loading, setLoading] = useState(false);
  const { shown, hide: hidePlay } = usePopup(CREATE_BUCKET);
  const { show: showFinish } = usePopup(FINISH_POPUP);
  const [name, setName] = useState('');
  const isLoading = false
  
  const onChange = (event: any) => 
    setName(event.target.value);

  useFinishCallback(() => {
    hidePlay();
    showFinish({});
  });

  useEffect(() => {
    if (shown) setLoading(false);
  }, [shown]);

  const pay = async () => {
    setLoading(true);
    try {
      //await Trade()
    } catch (err: any) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <Popup open={shown} onClose={hidePlay}>
      <div className='text-center font-bold mb-8'>
        Buy amount
      </div>
      <div className='text-center font-bold mb-8'>
        Available: 0.2 ETH
      </div>
      <div className="slider flex flex-col items-center">
        <input
         type='text'
         className='text-black' 
         value={name} 
         onChange={onChange}
         />

        <Card
          className="min-w-[200px] top-space uppercase flex flex-row justify-center items-center"
          disabled={loading}
          onClick={pay}
        >
          {isLoading ? 'Trading...' : 'Trade'}
          {!isLoading && <FaStar className='ml-1' color={'#fce250'} />}
        </Card>
      </div>
      <div className="popup-close" onClick={hidePlay}>
        <FaTimes />
      </div>
    </Popup>
  );
};
