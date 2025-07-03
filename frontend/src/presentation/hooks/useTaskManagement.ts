import { useState, useEffect, useCallback } from 'react';
import { Task } from '../../domain/entities';
import { CreateTaskParams, UpdateTaskParams } from '../../domain/repositories';
import { TaskFilter } from '../../application/services';
import { Container } from '../../application/di';

export interface UseTaskManagementState {
  allTasks: Task[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
}

export interface UseTaskManagementActions {
  fetchTasks: () => Promise<void>;
  createTask: (params: CreateTaskParams) => Promise<void>;
  updateTask: (id: string, params: UpdateTaskParams) => Promise<void>;
  markTaskAsDone: (id: string) => Promise<void>;
  markTaskAsPending: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  clearError: () => void;
}

export interface UseTaskManagementReturn extends UseTaskManagementState, UseTaskManagementActions {
  filteredTasks: Task[];
  taskCounts: {
    all: number;
    pending: number;
    done: number;
    archived: number;
  };
}

export const useTaskManagement = (): UseTaskManagementReturn => {
  const [state, setState] = useState<UseTaskManagementState>({
    allTasks: [],
    loading: false,
    error: null,
    filter: { status: 'all' },
  });

  const taskService = Container.getInstance().getTaskService();

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setAllTasks = (allTasks: Task[]) => {
    setState(prev => ({ ...prev, allTasks }));
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always fetch ALL tasks for consistent counts
      const allTasks = await taskService.getAllTasks();
      setAllTasks(allTasks);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [taskService]);

  const createTask = useCallback(async (params: CreateTaskParams) => {
    setLoading(true);
    setError(null);

    try {
      await taskService.createTask(params);
      await fetchTasks(); // Refresh tasks after creation
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create task');
      throw error; // Re-throw to allow component to handle it
    } finally {
      setLoading(false);
    }
  }, [taskService, fetchTasks]);

  const updateTask = useCallback(async (id: string, params: UpdateTaskParams) => {
    setLoading(true);
    setError(null);

    try {
      await taskService.updateTask(id, params);
      await fetchTasks(); // Refresh tasks after update
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [taskService, fetchTasks]);

  const markTaskAsDone = useCallback(async (id: string) => {
    // Don't set loading to true for drag operations to avoid breaking DndContext
    setError(null);

    try {
      await taskService.markTaskAsDone(id);
      await fetchTasks(); // Refresh tasks after marking as done
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark task as done');
    }
  }, [taskService, fetchTasks]);

  const markTaskAsPending = useCallback(async (id: string) => {
    // Don't set loading to true for drag operations to avoid breaking DndContext
    setError(null);

    try {
      await taskService.markTaskAsPending(id);
      await fetchTasks(); // Refresh tasks after marking as pending
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark task as pending');
    }
  }, [taskService, fetchTasks]);

  const archiveTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await taskService.archiveTask(id);
      await fetchTasks(); // Refresh tasks after archiving
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to archive task');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [taskService, fetchTasks]);

  const setFilter = useCallback((filter: TaskFilter) => {
    setState(prev => ({ ...prev, filter }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect to fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Compute derived state
  const filteredTasks = state.allTasks.filter(task => {
    switch (state.filter.status) {
      case 'pending':
        return task.isPending();
      case 'done':
        return task.isDone;
      case 'all':
      default:
        return true;
    }
  });
  
  const taskCounts = {
    all: state.allTasks.filter(task => !task.isArchived).length,
    pending: state.allTasks.filter(task => task.isPending() && !task.isArchived).length,
    done: state.allTasks.filter(task => task.isDone && !task.isArchived).length,
    archived: state.allTasks.filter(task => task.isArchived).length,
  };

  return {
    ...state,
    filteredTasks,
    taskCounts,
    fetchTasks,
    createTask,
    updateTask,
    markTaskAsDone,
    markTaskAsPending,
    archiveTask,
    setFilter,
    clearError,
  };
};