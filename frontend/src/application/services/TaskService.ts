import { Task, Priority, TaskId } from '../../domain/entities';
import { CreateTaskParams, UpdateTaskParams } from '../../domain/repositories';
import {
  GetAllTasksUseCase,
  GetTasksByStatusUseCase,
  CreateTaskUseCase,
  UpdateTaskUseCase,
  MarkTaskAsDoneUseCase,
  MarkTaskAsPendingUseCase,
  ArchiveTaskUseCase,
} from '../../domain/usecases';

export interface TaskFilter {
  status: 'all' | 'pending' | 'done';
}

export class TaskService {
  constructor(
    private getAllTasksUseCase: GetAllTasksUseCase,
    private getTasksByStatusUseCase: GetTasksByStatusUseCase,
    private createTaskUseCase: CreateTaskUseCase,
    private updateTaskUseCase: UpdateTaskUseCase,
    private markTaskAsDoneUseCase: MarkTaskAsDoneUseCase,
    private markTaskAsPendingUseCase: MarkTaskAsPendingUseCase,
    private archiveTaskUseCase: ArchiveTaskUseCase
  ) {}

  async getAllTasks(): Promise<Task[]> {
    return await this.getAllTasksUseCase.execute();
  }

  async getTasksByFilter(filter: TaskFilter): Promise<Task[]> {
    switch (filter.status) {
      case 'pending':
        return await this.getTasksByStatusUseCase.execute(false);
      case 'done':
        return await this.getTasksByStatusUseCase.execute(true);
      case 'all':
      default:
        return await this.getAllTasksUseCase.execute();
    }
  }

  async createTask(params: CreateTaskParams): Promise<Task> {
    return await this.createTaskUseCase.execute(params);
  }

  async updateTask(id: string, params: UpdateTaskParams): Promise<Task> {
    const taskId: TaskId = { value: id };
    return await this.updateTaskUseCase.execute(taskId, params);
  }

  async markTaskAsDone(id: string): Promise<Task> {
    const taskId: TaskId = { value: id };
    return await this.markTaskAsDoneUseCase.execute(taskId);
  }

  async markTaskAsPending(id: string): Promise<Task> {
    const taskId: TaskId = { value: id };
    return await this.markTaskAsPendingUseCase.execute(taskId);
  }

  async archiveTask(id: string): Promise<Task> {
    const taskId: TaskId = { value: id };
    return await this.archiveTaskUseCase.execute(taskId);
  }

  async getTaskCounts(tasks: Task[]): Promise<{
    all: number;
    pending: number;
    done: number;
  }> {
    return {
      all: tasks.length,
      pending: tasks.filter(task => task.isPending()).length,
      done: tasks.filter(task => task.isDone).length,
    };
  }

  getPriorityColor(priority: Priority): string {
    switch (priority) {
      case Priority.HIGH:
        return 'priority--high';
      case Priority.MEDIUM:
        return 'priority--medium';
      case Priority.LOW:
        return 'priority--low';
      default:
        return 'priority--low';
    }
  }

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case Priority.HIGH:
        return 'High';
      case Priority.MEDIUM:
        return 'Medium';
      case Priority.LOW:
        return 'Low';
      default:
        return 'Low';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}