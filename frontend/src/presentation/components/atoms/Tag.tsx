import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export interface TagProps {
  children: React.ReactNode;
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light';
  size?: 'small' | 'normal' | 'medium' | 'large';
  light?: boolean;
  rounded?: boolean;
  deletable?: boolean;
  onDelete?: () => void;
  icon?: IconName;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  color,
  size = 'normal',
  light = false,
  rounded = false,
  deletable = false,
  onDelete,
  icon,
  className = '',
}) => {
  const getTagClasses = () => {
    const classes = ['tag'];
    
    if (color) classes.push(`is-${color}`);
    if (size !== 'normal') classes.push(`is-${size}`);
    if (light) classes.push('is-light');
    if (rounded) classes.push('is-rounded');
    
    return [...classes, className].join(' ');
  };

  return (
    <span className={getTagClasses()}>
      {icon && (
        <span className="icon">
          <FontAwesomeIcon icon={icon} />
        </span>
      )}
      <span>{children}</span>
      {deletable && onDelete && (
        <button className="delete" onClick={onDelete} type="button" />
      )}
    </span>
  );
};