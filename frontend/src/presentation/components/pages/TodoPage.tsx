import React, { useState, useMemo } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { TaskManagementLayout } from '../templates';
import { useTaskManagement } from '../../hooks';
import { Task } from '../../../domain/entities';
import { CreateTaskParams, UpdateTaskParams } from '../../../domain/repositories';
import type { TaskFormData } from '../organisms';

export interface TodoPageProps {
  className?: string;
}

export const TodoPage: React.FC<TodoPageProps> = ({
  className = '',
}) => {
  const {
    filteredTasks,
    loading,
    error,
    taskCounts,
    createTask,
    updateTask,
    markTaskAsDone,
    markTaskAsPending,
    archiveTask,
    clearError,
  } = useTaskManagement();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Separate tasks into pending and done with automatic sorting
  const { pendingTasks, doneTasks } = useMemo(() => {
    const pending = filteredTasks.filter(task => !task.isDone && !task.isArchived);
    const done = filteredTasks.filter(task => task.isDone && !task.isArchived)
      .sort((a, b) => {
        // Sort by priority first (high = 3, medium = 2, low = 1)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        // If priority is the same, sort by creation date (newest first)
        if (priorityDiff === 0) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        return priorityDiff;
      });
    return { pendingTasks: pending, doneTasks: done };
  }, [filteredTasks]);

  // Form handling
  const handleCreateTask = () => {
    setEditingTask(null);
    clearError();
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    clearError();
    setShowForm(true);
  };

  const handleArchiveTask = async (task: Task) => {
    try {
      await archiveTask(task.id.value);
      setSuccessMessage(`Task "${task.title}" has been archived successfully`);
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
    } catch (error) {
      // Error handling is managed by the hook
    }
  };

  const handleFormSubmit = async (formData: TaskFormData) => {
    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
    };

    if (editingTask) {
      await updateTask(editingTask.id.value, taskData as UpdateTaskParams);
    } else {
      await createTask(taskData as CreateTaskParams);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
    clearError();
    setSuccessMessage(null);
  };

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Drag and drop handling
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Find the task being moved
    const task = filteredTasks.find(t => t.id.value === taskId);
    if (!task) return;

    // Handle moving from pending to done
    if (newStatus === 'done' && !task.isDone) {
      try {
        await markTaskAsDone(taskId);
      } catch (error) {
        // Error handling is managed by the hook
      }
    }
    // Handle moving from done to pending
    else if (newStatus === 'pending' && task.isDone) {
      try {
        await markTaskAsPending(taskId);
      } catch (error) {
        // Error handling is managed by the hook
      }
    }
  };

  // Prepare props for child components
  const headerProps = {
    title: 'Todo Kanban',
    subtitle: 'Organize your tasks efficiently',
    totalTasks: taskCounts.all,
    pendingTasks: taskCounts.pending,
    completedTasks: taskCounts.done,
    archivedTasks: taskCounts.archived,
  };

  const boardProps = {
    pendingTasks,
    completedTasks: doneTasks,
    loading,
    onDragEnd: handleDragEnd,
    onAddTask: handleCreateTask,
    onEditTask: handleEditTask,
    onArchiveTask: handleArchiveTask,
  };

  const taskFormInitialData = useMemo(() => {
    return editingTask ? {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority,
    } : undefined;
  }, [editingTask]);

  const formProps = {
    isOpen: showForm,
    onClose: handleFormClose,
    onSubmit: handleFormSubmit,
    initialData: taskFormInitialData,
    isEditing: !!editingTask,
    loading,
    error,
    onClearError: clearError,
  };

  return (
    <TaskManagementLayout
      headerProps={headerProps}
      boardProps={boardProps}
      formProps={formProps}
      successMessage={successMessage}
      onClearSuccessMessage={clearSuccessMessage}
      className={className}
    />
  );
};