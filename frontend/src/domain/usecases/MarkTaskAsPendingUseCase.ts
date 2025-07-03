import { Task, TaskId } from '../entities';
import { TaskRepository } from '../repositories';

export class MarkTaskAsPendingUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: TaskId): Promise<Task> {
    // The backend will handle validation of task existence and status
    return await this.taskRepository.markTaskAsPending(id);
  }
}