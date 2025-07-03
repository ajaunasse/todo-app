import React from 'react';

export interface SubtitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light' | 'white' | 'black' | 'grey';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const Subtitle: React.FC<SubtitleProps> = ({
  children,
  level = 2,
  size,
  color,
  weight,
  className = '',
  as,
}) => {
  const getSubtitleClasses = () => {
    const classes = ['subtitle'];
    
    const subtitleSize = size || level;
    classes.push(`is-${subtitleSize}`);
    
    if (color) classes.push(`has-text-${color}`);
    if (weight) classes.push(`has-text-weight-${weight}`);
    
    return [...classes, className].join(' ');
  };

  const Component = as || (`h${level}` as keyof React.JSX.IntrinsicElements);

  return React.createElement(
    Component,
    { className: getSubtitleClasses() },
    children
  );
};