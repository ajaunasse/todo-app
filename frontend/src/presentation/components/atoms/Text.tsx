import React from 'react';

export interface TextProps {
  children: React.ReactNode;
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light' | 'white' | 'black' | 'grey' | 'grey-light' | 'grey-dark';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  alignment?: 'left' | 'centered' | 'right' | 'justified';
  transform?: 'capitalized' | 'lowercase' | 'uppercase';
  family?: 'sans-serif' | 'monospace' | 'primary' | 'secondary' | 'code';
  style?: 'italic';
  className?: string;
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em';
  elementStyle?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  children,
  size,
  color,
  weight,
  alignment,
  transform,
  family,
  style,
  className = '',
  as = 'p',
  elementStyle = {},
}) => {
  const getTextClasses = () => {
    const classes: string[] = [];
    
    if (size) classes.push(`is-size-${size}`);
    if (color) classes.push(`has-text-${color}`);
    if (weight) classes.push(`has-text-weight-${weight}`);
    if (alignment) classes.push(`has-text-${alignment}`);
    if (transform) classes.push(`is-${transform}`);
    if (family) classes.push(`is-family-${family}`);
    if (style) classes.push(`is-${style}`);
    
    return [...classes, className].join(' ');
  };

  return React.createElement(
    as as keyof React.JSX.IntrinsicElements,
    { className: getTextClasses(), style: elementStyle },
    children
  );
};