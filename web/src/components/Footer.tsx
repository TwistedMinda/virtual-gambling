import { useAddress } from 'hooks/useAddress';
import { useWalletConnect } from 'hooks/useWalletConnect';
import Button from './Button';
import './Footer.scss';

const Footer = () => {
  const { address } = useAddress();
  const { connect, disconnect } = useWalletConnect();
  return (
    <div className="flex flex-col items-center mt-10">
      <Button onClick={address ? disconnect : connect}>
        {address ? 'Logout 👋' : 'Connect 🚀'}
      </Button>
      <a
        href="https://github.com/TwistedMinda/virtual-gambling"
        className="link"
				target='_blank'
      >
        Github 
      </a>
    </div>
  );
};

export default Footer;
