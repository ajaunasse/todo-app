import { Task, Priority, TaskId } from '../../domain/entities';
import { TaskRepository, CreateTaskParams, UpdateTaskParams, TaskFilters } from '../../domain/repositories';
import { TaskApiClient, ApiCreateTaskRequest, ApiUpdateTaskRequest } from '../api';

export class HttpTaskRepository extends TaskRepository {
  constructor(private apiClient: TaskApiClient) {
    super();
  }

  async getAllTasks(): Promise<Task[]> {
    const apiTasks = await this.apiClient.getAllTasks();
    return apiTasks.map(Task.fromApiResponse);
  }

  async getTasksByFilter(filters: TaskFilters): Promise<Task[]> {
    if (filters.isDone !== undefined) {
      const apiTasks = await this.apiClient.getTasksByStatus(filters.isDone);
      return apiTasks.map(Task.fromApiResponse);
    }
    
    // If no specific filter, return all tasks
    return this.getAllTasks();
  }


  async createTask(params: CreateTaskParams): Promise<Task> {
    const request: ApiCreateTaskRequest = {
      title: params.title,
      description: params.description,
      priority: params.priority,
    };

    const apiTask = await this.apiClient.createTask(request);
    return Task.fromApiResponse(apiTask);
  }

  async updateTask(id: TaskId, params: UpdateTaskParams): Promise<Task> {
    const request: ApiUpdateTaskRequest = {
      title: params.title,
      description: params.description,
      priority: params.priority,
    };

    const apiTask = await this.apiClient.updateTask(id.value, request);
    return Task.fromApiResponse(apiTask);
  }

  async markTaskAsDone(id: TaskId): Promise<Task> {
    const apiTask = await this.apiClient.markTaskAsDone(id.value);
    return Task.fromApiResponse(apiTask);
  }

  async markTaskAsPending(id: TaskId): Promise<Task> {
    const apiTask = await this.apiClient.markTaskAsPending(id.value);
    return Task.fromApiResponse(apiTask);
  }

  async archiveTask(id: TaskId): Promise<Task> {
    const apiTask = await this.apiClient.archiveTask(id.value);
    return Task.fromApiResponse(apiTask);
  }

  async deleteTask(id: TaskId): Promise<void> {
    await this.apiClient.deleteTask(id.value);
  }

  async countTasksByPriority(priority: Priority): Promise<number> {
    // Since the API doesn't have a direct count endpoint, we fetch all tasks and count
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.priority === priority && task.isPending()).length;
  }
}