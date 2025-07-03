import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'small' | 'normal' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  outlined?: boolean;
  rounded?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'normal',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  outlined = false,
  rounded = false,
  className = '',
}) => {
  const getButtonClasses = () => {
    const classes = ['button'];
    
    if (variant) classes.push(`is-${variant}`);
    if (size !== 'normal') classes.push(`is-${size}`);
    if (fullWidth) classes.push('is-fullwidth');
    if (outlined) classes.push('is-outlined');
    if (rounded) classes.push('is-rounded');
    if (loading) classes.push('is-loading');
    
    return [...classes, className].join(' ');
  };

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <span className="icon">
        <FontAwesomeIcon 
          icon={loading && position === 'left' ? 'spinner' : icon} 
          spin={loading && position === 'left'} 
        />
      </span>
    );
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {renderIcon('left')}
      {children && <span>{children}</span>}
      {renderIcon('right')}
    </button>
  );
};