import React from 'react';
import { Title, Icon, Tag } from '../atoms';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  totalTasks?: number;
  pendingTasks?: number;
  completedTasks?: number;
  archivedTasks?: number;
  actions?: React.ReactNode;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  totalTasks = 0,
  pendingTasks = 0,
  completedTasks = 0,
  archivedTasks = 0,
  actions,
  className = '',
}) => {
  const getHeaderClasses = () => {
    const classes = ['navbar', 'is-white'];
    
    return [...classes, className].join(' ');
  };

  const renderBrandSection = () => (
    <div className="navbar-brand">
      <div className="navbar-item">
        <div className="tags has-addons">
          <Tag color="light">Total</Tag>
          <Tag color="primary">{totalTasks}</Tag>
        </div>
      </div>
    </div>
  );

  const renderTitleSection = () => (
    <div className="navbar-item">
      <div className="has-text-centered">
        <div className="icon-text">
          <Icon name="tasks" color="black" />
          <Title level={4} color="black" className="ml-2 mb-0">
            {title}
          </Title>
        </div>
        {subtitle && (
          <p className="has-text-grey mt-1" style={{ fontSize: '0.9rem' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );

  const renderStatsSection = () => (
    <div className="navbar-end">
      <div className="navbar-item">
        <div className="tags">
          <Tag color="info" light>
            <Icon name="clock" className="mr-1" />
            {pendingTasks} Pending
          </Tag>
          <Tag color="success" light>
            <Icon name="check-circle" className="mr-1" />
            {completedTasks} Done
          </Tag>
          <Tag color="warning" light>
            <Icon name="box-archive" className="mr-1" />
            {archivedTasks} Archived
          </Tag>
        </div>
      </div>
      {actions && (
        <div className="navbar-item">
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <nav 
      className={getHeaderClasses()} 
      role="navigation" 
      style={{ borderBottom: '1px solid #e8e8e8' }}
    >
      {renderBrandSection()}
      
      <div className="navbar-menu">
        <div className="navbar-start" />
        {renderTitleSection()}
        {renderStatsSection()}
      </div>
    </nav>
  );
};