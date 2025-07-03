import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Title, Icon, Tag, Button } from '../atoms';
import { DraggableCard } from '../molecules';
import { Task } from '../../../domain/entities';

export interface TaskColumnProps {
  id: string;
  title: string;
  icon: string;
  color: 'info' | 'success' | 'warning' | 'danger';
  tasks: Task[];
  emptyMessage?: string;
  emptyIcon?: string;
  dropMessage?: string;
  showAddButton?: boolean;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
  className?: string;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  icon,
  color,
  tasks,
  emptyMessage = 'No tasks',
  emptyIcon = 'inbox',
  dropMessage,
  showAddButton = false,
  onAddTask,
  onEditTask,
  onArchiveTask,
  className = '',
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getColumnClasses = () => {
    const classes = ['column', 'is-half'];
    
    return [...classes, className].join(' ');
  };

  const getBoxClasses = () => {
    return 'box';
  };

  const getBoxStyles = (): React.CSSProperties => {
    return {
      padding: '0.75rem',
      backgroundColor: isOver 
        ? (id === 'done' ? 'rgba(72, 199, 116, 0.1)' : 'rgba(50, 115, 220, 0.1)')
        : '#fafafa',
      minHeight: 'calc(100vh - 200px)',
      transition: 'all 0.2s ease',
      border: isOver 
        ? `2px solid ${id === 'done' ? '#48c774' : '#3273dc'}` 
        : '1px solid transparent',
      position: 'relative',
    };
  };

  const renderHeader = () => (
    <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
      <div className="icon-text">
        <Icon name={icon as any} color={color} />
        <Title level={6} className="ml-2 mb-0" style={{ fontSize: '1.1rem' }}>
          {title}
        </Title>
        <Tag color={color} light className="ml-2">
          {tasks.length}
        </Tag>
      </div>
      
      {showAddButton && onAddTask && (
        <Button
          variant="success"
          size="small"
          icon="plus"
          onClick={onAddTask}
        >
          New
        </Button>
      )}
    </div>
  );

  const renderTaskCard = (task: Task) => (
    <DraggableCard
      key={task.id.value}
      id={task.id.value}
      title={task.title}
      description={task.description}
      priority={task.priority}
      isDone={task.isDone}
      createdAt={task.createdAt}
      onEdit={() => onEditTask?.(task)}
      onArchive={() => onArchiveTask?.(task)}
    />
  );

  const renderTasks = () => {
    if (tasks.length === 0) {
      return (
        <div className="has-text-centered py-6">
          <Icon 
            name={emptyIcon as any} 
            size="2x" 
            color="light" 
            className="mb-3" 
          />
          {emptyMessage && (
            <p className="has-text-grey">{emptyMessage}</p>
          )}
        </div>
      );
    }

    return (
      <div className="task-list" style={{ position: 'relative' }}>
        {/* Invisible drop zones around and between cards */}
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        {tasks.map(renderTaskCard)}
        {/* Extra drop zone at the bottom */}
        <div style={{ height: '50px', width: '100%' }} />
      </div>
    );
  };

  const renderDropOverlay = () => {
    if (!isOver || !dropMessage) return null;

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
          border: `2px dashed ${id === 'done' ? '#48c774' : '#3273dc'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
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
          {dropMessage}
        </div>
      </div>
    );
  };

  return (
    <div className={getColumnClasses()}>
      <div className={getBoxClasses()} style={getBoxStyles()}>
        {/* Full-coverage drop zone */}
        <div
          ref={setNodeRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        />
        {renderDropOverlay()}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {renderHeader()}
          {renderTasks()}
        </div>
      </div>
    </div>
  );
};