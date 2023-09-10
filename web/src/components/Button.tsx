import { forwardRef } from 'react';
import './Button.scss';

interface ButtonProps {
  onClick?: () => void;
  className?: any;
  disabled?: boolean;
  children?: any;
  style?: any;
  variant?: 'primary' | 'secondary';
}
const Button = forwardRef<any, ButtonProps>((props: ButtonProps, ref: any) => {
  const onTap = () => {
    if (props.disabled) return;
    if (props.onClick) props.onClick();
  };
  return (
    <div
      ref={ref}
      {...props}
      className={[
        'main-btn',
        props.variant === 'secondary' ? 'secondary' : '',
        props.disabled ? 'disabled' : '',
        props.className
      ].join(' ')}
      onClick={onTap}
    >
      {props.children}
    </div>
  );
});

export default Button;
