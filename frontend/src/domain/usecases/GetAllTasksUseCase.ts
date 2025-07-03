import { Task } from '../entities';
import { TaskRepository } from '../repositories';

export class GetAllTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return await this.taskRepository.getAllTasks();
  }
}