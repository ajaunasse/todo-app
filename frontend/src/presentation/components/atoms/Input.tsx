import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'normal' | 'medium' | 'large';
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  rounded?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  size = 'normal',
  color,
  rounded = false,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  id,
  name,
  autoComplete,
  maxLength,
}) => {
  const getInputClasses = () => {
    const classes = ['input'];
    
    if (size !== 'normal') classes.push(`is-${size}`);
    if (color) classes.push(`is-${color}`);
    if (rounded) classes.push('is-rounded');
    if (loading) classes.push('is-loading');
    
    return [...classes, className].join(' ');
  };

  const getControlClasses = () => {
    const classes = ['control'];
    
    if (icon) {
      classes.push(`has-icons-${iconPosition}`);
    }
    if (loading) classes.push('is-loading');
    
    return classes.join(' ');
  };

  const inputElement = (
    <input
      id={id}
      name={name}
      type={type}
      className={getInputClasses()}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      maxLength={maxLength}
    />
  );

  if (icon || loading) {
    return (
      <div className={getControlClasses()}>
        {inputElement}
        {icon && (
          <span className={`icon is-small is-${iconPosition}`}>
            <FontAwesomeIcon icon={icon} />
          </span>
        )}
      </div>
    );
  }

  return inputElement;
};