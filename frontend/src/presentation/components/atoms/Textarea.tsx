import React from 'react';

export interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  size?: 'small' | 'normal' | 'medium' | 'large';
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  fixedSize?: boolean;
  className?: string;
  id?: string;
  name?: string;
  maxLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  rows = 3,
  size = 'normal',
  color,
  fixedSize = false,
  className = '',
  id,
  name,
  maxLength,
}) => {
  const getTextareaClasses = () => {
    const classes = ['textarea'];
    
    if (size !== 'normal') classes.push(`is-${size}`);
    if (color) classes.push(`is-${color}`);
    if (fixedSize) classes.push('has-fixed-size');
    
    return [...classes, className].join(' ');
  };

  return (
    <textarea
      id={id}
      name={name}
      className={getTextareaClasses()}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      rows={rows}
      maxLength={maxLength}
    />
  );
};