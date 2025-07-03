import { Task, Priority, TaskId } from '../entities';
import { TaskRepository, UpdateTaskParams } from '../repositories';

export class UpdateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: TaskId, params: UpdateTaskParams): Promise<Task> {
    // Validate input
    this.validateUpdateParams(params);

    // Business rule: Maximum 5 high priority tasks (simplified check)
    if (params.priority === Priority.HIGH) {
      const highPriorityCount = await this.taskRepository.countTasksByPriority(Priority.HIGH);
      if (highPriorityCount >= 5) {
        throw new Error('Cannot modify task to high priority. Maximum of 5 high priority tasks allowed');
      }
    }

    // The backend will handle validation of task existence
    return await this.taskRepository.updateTask(id, params);
  }

  private validateUpdateParams(params: UpdateTaskParams): void {
    if (params.title !== undefined) {
      if (!params.title || params.title.trim().length === 0) {
        throw new Error('Task title cannot be empty');
      }
      
      if (params.title.length > 255) {
        throw new Error('Task title cannot exceed 255 characters');
      }
    }

    if (params.description !== undefined) {
      if (!params.description || params.description.trim().length === 0) {
        throw new Error('Task description cannot be empty');
      }

      if (params.description.length > 1000) {
        throw new Error('Task description cannot exceed 1000 characters');
      }
    }

    if (params.priority !== undefined) {
      if (!Object.values(Priority).includes(params.priority)) {
        throw new Error('Invalid task priority');
      }
    }
  }
}