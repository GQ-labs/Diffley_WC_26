import type { ReactNode } from 'react';
import styles from './Button.module.css';
import { IconRefresh } from '../icons/IconRefresh';

interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  icon?: boolean;
  spinning?: boolean;
  'aria-label'?: string;
}

export function Button({
  children,
  disabled,
  onClick,
  variant = 'primary',
  icon,
  spinning,
  'aria-label': ariaLabel,
}: ButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      aria-busy={spinning || undefined}
      aria-label={ariaLabel}
    >
      {icon && (
        <IconRefresh
          className={`${styles.icon}${spinning ? ` ${styles.iconSpin}` : ''}`}
        />
      )}
      {children}
    </button>
  );
}
