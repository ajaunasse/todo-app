import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskColumn } from './TaskColumn';
import { DraggableCard } from '../molecules';
import { Spinner } from '../atoms';
import { Task } from '../../../domain/entities';

export interface TaskBoardProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  loading?: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
  className?: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  pendingTasks,
  completedTasks,
  loading = false,
  onDragEnd,
  onAddTask,
  onEditTask,
  onArchiveTask,
  className = '',
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const allTasks = [...pendingTasks, ...completedTasks];
    const task = allTasks.find(t => t.id.value === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    onDragEnd(event);
  };

  const getBoardClasses = () => {
    const classes = ['task-board'];
    
    return [...classes, className].join(' ');
  };

  if (loading) {
    return (
      <div className="has-text-centered py-4">
        <Spinner size="2x" message="Loading tasks..." centered />
      </div>
    );
  }

  return (
    <div className={getBoardClasses()}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="columns" style={{ gap: '0.75rem' }}>
          <TaskColumn
            id="pending"
            title="Pending"
            icon="inbox"
            color="info"
            tasks={pendingTasks}
            emptyMessage="No pending tasks. All tasks completed!"
            emptyIcon="inbox"
            dropMessage="Drop here"
            showAddButton
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onArchiveTask={onArchiveTask}
          />

          <TaskColumn
            id="done"
            title="Done"
            icon="check-circle"
            color="success"
            tasks={completedTasks}
            emptyMessage="No completed tasks. Drag tasks here to complete!"
            emptyIcon="check-circle"
            dropMessage="Drop here to complete task"
            onEditTask={onEditTask}
            onArchiveTask={onArchiveTask}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <DraggableCard
              id={activeTask.id.value}
              title={activeTask.title}
              description={activeTask.description}
              priority={activeTask.priority}
              isDone={activeTask.isDone}
              createdAt={activeTask.createdAt}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};