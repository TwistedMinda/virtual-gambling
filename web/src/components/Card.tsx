import { useAddress } from 'hooks/useAddress';
import { useWalletConnect } from 'hooks/useWalletConnect';
import './Card.scss';

interface CardProps {
  children?: any;
  disabled?: boolean;
  active?: boolean;
  className?: any;
  style?: any;
  onClick?: () => void;
  walletLabelIfNeeded?: boolean;
  walletHandlerIfNeeded?: boolean;
}
const Card = ({
  children,
  active,
  disabled,
  onClick,
  walletLabelIfNeeded,
  walletHandlerIfNeeded,
  className,
  style
}: CardProps) => {
  const { address } = useAddress();
  const { connect } = useWalletConnect();
  const content =
    walletLabelIfNeeded && !address ? 'Connect your wallet' : children;

  const onTap = () => {
    if (!address && walletHandlerIfNeeded) {
      connect();
    } else if (!disabled && onClick) {
      onClick();
    }
  };
  return (
    <div
      className={[
        'card',
        active ? 'on' : '',
        disabled ? 'off' : '',
        className
      ].join(' ')}
      onClick={onTap}
      style={style}
    >
      {content}
    </div>
  );
};

export default Card;
