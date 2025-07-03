import React from 'react';
import { AppHeader } from '../organisms';
import type { AppHeaderProps } from '../organisms';

export interface AppLayoutProps {
  children: React.ReactNode;
  headerProps: AppHeaderProps;
  fullHeight?: boolean;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  headerProps,
  fullHeight = true,
  className = '',
}) => {
  const getLayoutClasses = () => {
    const classes = ['app-layout'];
    
    if (fullHeight) classes.push('is-fullheight');
    
    return [...classes, className].join(' ');
  };

  const getContainerClasses = () => {
    const classes = ['hero'];
    
    if (fullHeight) classes.push('is-fullheight');
    classes.push('is-light');
    
    return classes.join(' ');
  };

  return (
    <div className={getLayoutClasses()}>
      <div className={getContainerClasses()}>
        {/* Header */}
        <div className="hero-head">
          <AppHeader {...headerProps} />
        </div>

        {/* Main Content */}
        <div 
          className="hero-body" 
          style={{ 
            paddingTop: '1rem', 
            paddingBottom: '1rem' 
          }}
        >
          <div 
            className="container is-fluid" 
            style={{ padding: '0 0.75rem' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};