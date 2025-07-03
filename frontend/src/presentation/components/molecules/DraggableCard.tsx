import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tag, Text, Button, Icon } from '../atoms';
import { Card } from './Card';
import type { ButtonProps } from '../atoms';

export interface DraggableCardProps {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  isDone?: boolean;
  isDragging?: boolean;
  createdAt?: Date;
  actions?: ButtonProps[];
  onEdit?: () => void;
  onArchive?: () => void;
  className?: string;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  title,
  description,
  priority = 'medium',
  isDone = false,
  isDragging = false,
  createdAt,
  actions = [],
  onEdit,
  onArchive,
  className = '',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging || isSortableDragging ? 1000 : 1,
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  const getPriorityColorHex = () => {
    switch (priority) {
      case 'high':
        return '#ff3860';
      case 'medium':
        return '#ffdd57';
      case 'low':
        return '#48c774';
      default:
        return '#3273dc';
    }
  };

  const cardStyle: React.CSSProperties = {
    border: `2px solid ${getPriorityColorHex()}`,
    borderLeft: `4px solid ${getPriorityColorHex()}`,
    transform: isDragging || isSortableDragging ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isDragging || isSortableDragging 
      ? '0 8px 16px rgba(0,0,0,0.15)' 
      : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    marginBottom: '0.75rem',
  };

  const renderPriorityTag = () => (
    <Tag 
      color={getPriorityColor()} 
      size="normal"
      className="mr-2"
    >
      {priority.charAt(0).toUpperCase()}
    </Tag>
  );

  const renderDoneTag = () => {
    if (!isDone) return null;
    
    return (
      <Tag color="success" size="small" className="mr-2">
        <Icon name="check" />
      </Tag>
    );
  };

  const renderGripIcon = () => (
    <Icon 
      name="grip-vertical" 
      color="dark" 
      size="small"
    />
  );

  const renderEditButton = () => {
    if (!onEdit || isDone) return null; // Disable edit for done tasks
    
    return (
      <Button
        variant="light"
        size="small"
        icon="edit"
        onClick={onEdit}
        className="mr-1"
      />
    );
  };

  const renderArchiveButton = () => {
    if (!onArchive || !isDone) return null; // Only show archive for done tasks
    
    return (
      <Button
        variant="light"
        size="small"
        icon="box-archive"
        onClick={onArchive}
        className="mr-1"
      />
    );
  };

  const renderDate = () => {
    if (!createdAt) return null;
    
    return (
      <Text size={6} color="grey" elementStyle={{ fontSize: '0.8rem' }}>
        {createdAt.toLocaleDateString()}
      </Text>
    );
  };

  const cardContent = (
    <>
      {/* Header with title and priority */}
      <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
        <div className="is-flex is-align-items-center" style={{ flex: 1, minWidth: 0 }}>
          {renderPriorityTag()}
          <Text 
            weight="medium" 
            color={isDone ? 'grey-light' : undefined}
            className={isDone ? 'has-text-decoration-line-through' : ''}
            elementStyle={{ fontSize: '1rem', lineHeight: '1.3', margin: 0, flex: 1 }}
          >
            {title}
          </Text>
        </div>
        <div className="is-flex is-align-items-center" style={{ marginLeft: '0.5rem' }}>
          {renderDoneTag()}
          {renderEditButton()}
          {renderArchiveButton()}
          {renderGripIcon()}
        </div>
      </div>

      {/* Description */}
      {description && (
        <Text 
          size={6} 
          color={isDone ? 'grey-light' : 'grey-dark'}
          className={`mb-2 ${isDone ? 'has-text-decoration-line-through' : ''}`}
          elementStyle={{
            fontSize: '0.9rem',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Text>
      )}

      {/* Footer with date and actions */}
      <div className="is-flex is-justify-content-space-between is-align-items-center">
        {renderDate()}
        <div className="is-flex is-align-items-center">
          {actions.map((action, index) => (
            <Button key={index} {...action} size="small" className="ml-1" />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
    >
      <Card className="is-shadowless" style={cardStyle}>
        <div style={{ padding: '0.75rem' }}>
          {cardContent}
        </div>
      </Card>
    </div>
  );
};