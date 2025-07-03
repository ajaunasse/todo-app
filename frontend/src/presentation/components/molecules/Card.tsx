import React from 'react';
import { Title, Text, Button } from '../atoms';
import type { ButtonProps } from '../atoms';

export interface CardProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  headerActions?: ButtonProps[];
  footerActions?: ButtonProps[];
  borderColor?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  borderWidth?: 1 | 2 | 3 | 4;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  title,
  subtitle,
  image,
  imageAlt = '',
  headerActions = [],
  footerActions = [],
  borderColor,
  borderWidth,
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  style = {},
}) => {
  const getCardClasses = () => {
    const classes = ['card'];
    
    if (hoverable) classes.push('is-hoverable');
    if (clickable) classes.push('is-clickable');
    
    return [...classes, className].join(' ');
  };

  const getCardStyle = () => {
    const cardStyle: React.CSSProperties = { ...style };
    
    if (borderColor && borderWidth) {
      const colorMap = {
        primary: '#3273dc',
        info: '#3298dc',
        success: '#48c774',
        warning: '#ffdd57',
        danger: '#ff3860',
      };
      
      cardStyle.border = `${borderWidth}px solid ${colorMap[borderColor]}`;
      if (borderColor !== 'warning') {
        cardStyle.borderLeft = `${borderWidth * 2}px solid ${colorMap[borderColor]}`;
      }
    }
    
    return cardStyle;
  };

  const renderHeader = () => {
    if (!header && !title && headerActions.length === 0) return null;
    
    return (
      <header className="card-header">
        {header ? (
          header
        ) : (
          <>
            {title && (
              <div className="card-header-title">
                <Title level={6} className="mb-0">
                  {title}
                </Title>
              </div>
            )}
            {headerActions.length > 0 && (
              <div className="card-header-icon">
                {headerActions.map((action, index) => (
                  <Button key={index} {...action} />
                ))}
              </div>
            )}
          </>
        )}
      </header>
    );
  };

  const renderImage = () => {
    if (!image) return null;
    
    return (
      <div className="card-image">
        <figure className="image">
          <img src={image} alt={imageAlt} />
        </figure>
      </div>
    );
  };

  const renderContent = () => {
    if (!children && !subtitle) return null;
    
    return (
      <div className="card-content">
        {subtitle && (
          <Text color="grey" className="mb-3">
            {subtitle}
          </Text>
        )}
        {children}
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer && footerActions.length === 0) return null;
    
    return (
      <footer className="card-footer">
        {footer ? (
          footer
        ) : (
          footerActions.map((action, index) => (
            <div key={index} className="card-footer-item">
              <Button {...action} />
            </div>
          ))
        )}
      </footer>
    );
  };

  return (
    <div 
      className={getCardClasses()} 
      style={getCardStyle()}
      onClick={clickable ? onClick : undefined}
    >
      {renderHeader()}
      {renderImage()}
      {renderContent()}
      {renderFooter()}
    </div>
  );
};