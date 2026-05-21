import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  inverted?: boolean;
}

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-[0.5rem] transition-colors duration-300 cursor-pointer select-none whitespace-nowrap';

const sizeStyles: Record<Size, string> = {
  sm: 'px-5 py-2 text-[0.875rem]',
  md: 'px-7 py-3 text-[1rem]',
  lg: 'px-9 py-4 text-[1.125rem]',
};

function getVariantStyles(variant: Variant, inverted: boolean) {
  if (inverted) {
    if (variant === 'primary')
      return 'bg-white text-[#141414] hover:bg-[#f0f0f0]';
    if (variant === 'outline')
      return 'bg-transparent border border-white text-white hover:bg-white hover:text-[#141414]';
    return 'bg-transparent text-white hover:underline';
  }
  if (variant === 'primary')
    return 'bg-[#141414] text-white hover:bg-[#2a2a2a]';
  if (variant === 'outline')
    return 'bg-transparent border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-white';
  return 'bg-transparent text-[#141414] hover:underline';
}

export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  inverted = false,
}: BtnProps) {
  const classes = `${baseStyles} ${sizeStyles[size]} ${getVariantStyles(variant, inverted)} ${className}`;

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeOut' as const },
  };

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link to={to} className={classes}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      type={type}
      onClick={onClick}
      className={classes}
    >
      {children}
    </motion.button>
  );
}
