import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Text, Icon } from '../atoms';

export interface DropZoneProps {
  id: string;
  children: React.ReactNode;
  acceptMessage?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  minHeight?: number;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  children,
  acceptMessage,
  emptyMessage,
  emptyIcon = 'inbox',
  minHeight = 400,
  className = '',
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getDropZoneClasses = () => {
    const classes = ['drop-zone'];
    
    if (isOver) classes.push('is-over');
    
    return [...classes, className].join(' ');
  };

  const getDropZoneStyles = (): React.CSSProperties => {
    return {
      minHeight: `${minHeight}px`,
      padding: '0.75rem',
      backgroundColor: isOver 
        ? (id === 'done' ? 'rgba(72, 199, 116, 0.1)' : 'rgba(50, 115, 220, 0.1)')
        : 'rgba(248, 249, 250, 0.3)',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      border: isOver 
        ? `3px dashed ${id === 'done' ? '#48c774' : '#3273dc'}` 
        : '2px dashed rgba(219, 219, 219, 0.5)',
      position: 'relative',
    };
  };

  const renderDropOverlay = () => {
    if (!isOver || !acceptMessage) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: id === 'done' 
            ? 'rgba(72, 199, 116, 0.05)' 
            : 'rgba(50, 115, 220, 0.05)',
          border: `3px dashed ${id === 'done' ? '#48c774' : '#3273dc'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div style={{
          backgroundColor: id === 'done' 
            ? 'rgba(72, 199, 116, 0.9)' 
            : 'rgba(50, 115, 220, 0.9)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {acceptMessage}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    if (React.Children.count(children) > 0) return null;

    return (
      <div className="has-text-centered py-4">
        <Icon 
          name={emptyIcon as any} 
          size="2x" 
          color="light" 
          className="mb-3" 
        />
        {emptyMessage && (
          <Text color="grey" alignment="centered">
            {emptyMessage}
          </Text>
        )}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      className={getDropZoneClasses()}
      style={getDropZoneStyles()}
    >
      {renderDropOverlay()}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {renderEmptyState()}
        {children}
      </div>
    </div>
  );
};