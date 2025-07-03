import React from 'react';
import { Title, Button } from '../atoms';
import type { ButtonProps } from '../atoms';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: ButtonProps[];
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  canCloseOnOverlay?: boolean;
  canCloseOnEscape?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  actions = [],
  size = 'medium',
  canCloseOnOverlay = true,
  canCloseOnEscape = true,
  className = '',
}) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && canCloseOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('is-clipped');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('is-clipped');
    };
  }, [isOpen, canCloseOnEscape, onClose]);

  const getModalClasses = () => {
    const classes = ['modal'];
    
    if (isOpen) classes.push('is-active');
    
    return [...classes, className].join(' ');
  };

  const getModalCardClasses = () => {
    const classes = ['modal-card'];
    
    if (size === 'small') classes.push('is-small');
    if (size === 'large') classes.push('is-large');
    if (size === 'fullscreen') classes.push('is-fullscreen');
    
    return classes.join(' ');
  };

  const handleOverlayClick = () => {
    if (canCloseOnOverlay) {
      onClose();
    }
  };

  const renderHeader = () => {
    if (!title) return null;
    
    return (
      <header className="modal-card-head">
        <Title level={4} className="modal-card-title mb-0">
          {title}
        </Title>
        <button 
          className="delete" 
          aria-label="close"
          onClick={onClose}
        />
      </header>
    );
  };

  const renderFooter = () => {
    if (!footer && actions.length === 0) return null;
    
    return (
      <footer className="modal-card-foot">
        {footer ? (
          footer
        ) : (
          actions.map((action, index) => (
            <Button key={index} {...action} />
          ))
        )}
      </footer>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={getModalClasses()}>
      <div className="modal-background" onClick={handleOverlayClick} />
      <div className={getModalCardClasses()}>
        {renderHeader()}
        <section className="modal-card-body">
          {children}
        </section>
        {renderFooter()}
      </div>
    </div>
  );
};