import { Task, Priority } from '../entities';
import { TaskRepository, CreateTaskParams } from '../repositories';

export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(params: CreateTaskParams): Promise<Task> {
    if (params.priority === Priority.HIGH) {
      const highPriorityCount = await this.taskRepository.countTasksByPriority(Priority.HIGH);
      if (highPriorityCount >= 5) {
        throw new Error('Cannot create more than 5 tasks with high priority');
      }
    }

    // Validate input
    this.validateCreateParams(params);

    return await this.taskRepository.createTask(params);
  }

  private validateCreateParams(params: CreateTaskParams): void {
    if (!params.title || params.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    
    if (params.title.length > 255) {
      throw new Error('Task title cannot exceed 255 characters');
    }

    if (!params.description || params.description.trim().length === 0) {
      throw new Error('Task description is required');
    }

    if (params.description.length > 1000) {
      throw new Error('Task description cannot exceed 1000 characters');
    }

    if (!Object.values(Priority).includes(params.priority)) {
      throw new Error('Invalid task priority');
    }
  }
}