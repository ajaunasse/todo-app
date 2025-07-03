import React from 'react';
import { Text, Icon } from '../atoms';

export interface NotificationProps {
  children: React.ReactNode;
  type?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  light?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  children,
  type = 'info',
  light = false,
  dismissible = false,
  onDismiss,
  icon = false,
  autoHide = false,
  duration = 5000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]); // handleDismiss is stable within component lifecycle

  const getNotificationClasses = () => {
    const classes = ['notification'];
    
    if (type) classes.push(`is-${type}`);
    if (light) classes.push('is-light');
    
    return [...classes, className].join(' ');
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle' as const;
      case 'warning':
        return 'exclamation-triangle' as const;
      case 'danger':
        return 'times-circle' as const;
      case 'info':
        return 'info-circle' as const;
      default:
        return 'bell' as const;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={getNotificationClasses()}>
      {dismissible && (
        <button 
          className="delete" 
          onClick={handleDismiss}
          type="button"
        />
      )}
      <div className="is-flex is-align-items-center">
        {icon && (
          <Icon 
            name={getIconName()} 
            className="mr-2" 
          />
        )}
        <div className="is-flex-grow-1">
          {typeof children === 'string' ? (
            <Text as="span">{children}</Text>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};