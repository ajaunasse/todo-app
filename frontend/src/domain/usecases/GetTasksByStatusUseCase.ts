import { Task } from '../entities';
import { TaskRepository, TaskFilters } from '../repositories';

export class GetTasksByStatusUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(isDone: boolean): Promise<Task[]> {
    const filters: TaskFilters = { isDone };
    return await this.taskRepository.getTasksByFilter(filters);
  }
}