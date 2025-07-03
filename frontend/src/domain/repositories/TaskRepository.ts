import { Task, Priority, TaskId } from '../entities';

export interface CreateTaskParams {
  title: string;
  description: string;
  priority: Priority;
}

export interface UpdateTaskParams {
  title?: string;
  description?: string;
  priority?: Priority;
}

export interface TaskFilters {
  isDone?: boolean;
}

export abstract class TaskRepository {
  abstract getAllTasks(): Promise<Task[]>;
  abstract getTasksByFilter(filters: TaskFilters): Promise<Task[]>;
  abstract createTask(params: CreateTaskParams): Promise<Task>;
  abstract updateTask(id: TaskId, params: UpdateTaskParams): Promise<Task>;
  abstract markTaskAsDone(id: TaskId): Promise<Task>;
  abstract markTaskAsPending(id: TaskId): Promise<Task>;
  abstract archiveTask(id: TaskId): Promise<Task>;
  abstract deleteTask(id: TaskId): Promise<void>;
  abstract countTasksByPriority(priority: Priority): Promise<number>;
}