import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'normal' | 'medium' | 'large';
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  rounded?: boolean;
  fullWidth?: boolean;
  icon?: IconName;
  loading?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  size = 'normal',
  color,
  rounded = false,
  fullWidth = false,
  icon,
  loading = false,
  className = '',
  id,
  name,
}) => {
  const getSelectClasses = () => {
    const classes = ['select'];
    
    if (size !== 'normal') classes.push(`is-${size}`);
    if (color) classes.push(`is-${color}`);
    if (rounded) classes.push('is-rounded');
    if (fullWidth) classes.push('is-fullwidth');
    if (loading) classes.push('is-loading');
    
    return [...classes, className].join(' ');
  };

  const getControlClasses = () => {
    const classes = ['control'];
    
    if (icon) classes.push('has-icons-left');
    if (loading) classes.push('is-loading');
    
    return classes.join(' ');
  };

  const selectElement = (
    <div className={getSelectClasses()}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (icon || loading) {
    return (
      <div className={getControlClasses()}>
        {selectElement}
        {icon && (
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={icon} />
          </span>
        )}
      </div>
    );
  }

  return selectElement;
};