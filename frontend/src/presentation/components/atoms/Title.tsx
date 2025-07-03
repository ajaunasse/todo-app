import React from 'react';

export interface TitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
  spaced?: boolean;
  color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light' | 'white' | 'black';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  style?: React.CSSProperties; // <--- ADDED THIS LINE
}

export const Title: React.FC<TitleProps> = ({
                                              children,
                                              level = 1,
                                              size,
                                              spaced = false,
                                              color,
                                              weight,
                                              className = '',
                                              as,
                                              style, // <--- DESTRUCTURED THE STYLE PROP HERE
                                            }) => {
  const getTitleClasses = () => {
    const classes = ['title'];

    const titleSize = size || level;
    classes.push(`is-${titleSize}`);

    if (spaced) classes.push('is-spaced');
    if (color) classes.push(`has-text-${color}`);
    if (weight) classes.push(`has-text-weight-${weight}`);

    return [...classes, className].join(' ');
  };

  const Component = as || (`h${level}` as keyof React.JSX.IntrinsicElements);

  return React.createElement(
      Component,
      {
        className: getTitleClasses(),
        style: style, // <--- PASSED THE STYLE PROP HERE
      },
      children
  );
};