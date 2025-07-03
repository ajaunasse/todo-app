import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export interface IconProps {
  name: IconName;
  size?: 'small' | 'medium' | 'large' | '2x' | '3x';
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light' | 'white' | 'black';
  spin?: boolean;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color,
  spin = false,
  pulse = false,
  className = '',
  onClick,
}) => {
  const getIconClasses = () => {
    const classes = ['icon'];
    
    if (size && !['2x', '3x'].includes(size)) {
      classes.push(`is-${size}`);
    }
    
    if (color) classes.push(`has-text-${color}`);
    if (onClick) classes.push('is-clickable');
    
    return [...classes, className].join(' ');
  };

  const getSizeForFontAwesome = () => {
    if (['2x', '3x'].includes(size)) return size as any;
    return undefined;
  };

  return (
    <span className={getIconClasses()} onClick={onClick}>
      <FontAwesomeIcon
        icon={name}
        size={getSizeForFontAwesome()}
        spin={spin}
        pulse={pulse}
      />
    </span>
  );
};