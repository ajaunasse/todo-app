import { TaskRepository } from '../../domain/repositories';
import {
  GetAllTasksUseCase,
  GetTasksByStatusUseCase,
  CreateTaskUseCase,
  UpdateTaskUseCase,
  MarkTaskAsDoneUseCase,
  MarkTaskAsPendingUseCase,
  ArchiveTaskUseCase,
} from '../../domain/usecases';
import { TaskApiClient } from '../../infrastructure/api';
import { HttpTaskRepository } from '../../infrastructure/repositories';
import { TaskService } from '../services';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeServices(): void {
    // API Client
    const apiClient = new TaskApiClient(process.env.REACT_APP_API_URL);
    this.services.set('TaskApiClient', apiClient);

    // Repository
    const taskRepository: TaskRepository = new HttpTaskRepository(apiClient);
    this.services.set('TaskRepository', taskRepository);

    // Use Cases
    const getAllTasksUseCase = new GetAllTasksUseCase(taskRepository);
    const getTasksByStatusUseCase = new GetTasksByStatusUseCase(taskRepository);
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
    const markTaskAsDoneUseCase = new MarkTaskAsDoneUseCase(taskRepository);
    const markTaskAsPendingUseCase = new MarkTaskAsPendingUseCase(taskRepository);
    const archiveTaskUseCase = new ArchiveTaskUseCase(taskRepository);

    this.services.set('GetAllTasksUseCase', getAllTasksUseCase);
    this.services.set('GetTasksByStatusUseCase', getTasksByStatusUseCase);
    this.services.set('CreateTaskUseCase', createTaskUseCase);
    this.services.set('UpdateTaskUseCase', updateTaskUseCase);
    this.services.set('MarkTaskAsDoneUseCase', markTaskAsDoneUseCase);
    this.services.set('MarkTaskAsPendingUseCase', markTaskAsPendingUseCase);
    this.services.set('ArchiveTaskUseCase', archiveTaskUseCase);

    // Application Services
    const taskService = new TaskService(
      getAllTasksUseCase,
      getTasksByStatusUseCase,
      createTaskUseCase,
      updateTaskUseCase,
      markTaskAsDoneUseCase,
      markTaskAsPendingUseCase,
      archiveTaskUseCase
    );
    this.services.set('TaskService', taskService);
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }

  // Convenience getters
  getTaskService(): TaskService {
    return this.get<TaskService>('TaskService');
  }

  getTaskRepository(): TaskRepository {
    return this.get<TaskRepository>('TaskRepository');
  }
}