import React from 'react';
import { Icon } from './Icon';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large' | '2x' | '3x';
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light' | 'white' | 'black';
  message?: string;
  centered?: boolean;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  message,
  centered = false,
  className = '',
}) => {
  const getContainerClasses = () => {
    const classes: string[] = [];
    
    if (centered) classes.push('has-text-centered');
    
    return [...classes, className].join(' ');
  };

  return (
    <div className={getContainerClasses()}>
      <Icon
        name="spinner"
        size={size}
        color={color}
        spin
      />
      {message && (
        <p className="mt-2 has-text-grey">{message}</p>
      )}
    </div>
  );
};