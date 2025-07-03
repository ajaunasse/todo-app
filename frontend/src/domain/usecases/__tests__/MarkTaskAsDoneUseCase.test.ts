import { MarkTaskAsDoneUseCase } from '../MarkTaskAsDoneUseCase';
import { TaskRepository } from '../../repositories';
import { Task, Priority, TaskId } from '../../entities';

describe('MarkTaskAsDoneUseCase', () => {
  let mockRepository: jest.Mocked<TaskRepository>;
  let markTaskAsDoneUseCase: MarkTaskAsDoneUseCase;

  beforeEach(() => {
    mockRepository = {
      getAllTasks: jest.fn(),
      getTasksByFilter: jest.fn(),
      getTaskById: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      markTaskAsDone: jest.fn(),
      deleteTask: jest.fn(),
      countTasksByPriority: jest.fn(),
    };
    markTaskAsDoneUseCase = new MarkTaskAsDoneUseCase(mockRepository);
  });

  const taskId: TaskId = { value: '123' };

  describe('execute', () => {
    it('should mark task as done', async () => {
      const doneTask = Task.create('123', 'Test Task', 'Test Description', Priority.MEDIUM, true);

      mockRepository.markTaskAsDone.mockResolvedValue(doneTask);

      const result = await markTaskAsDoneUseCase.execute(taskId);

      expect(mockRepository.markTaskAsDone).toHaveBeenCalledWith(taskId);
      expect(result).toBe(doneTask);
    });

    it('should handle repository errors', async () => {
      const repositoryError = new Error('Database connection failed');

      mockRepository.markTaskAsDone.mockRejectedValue(repositoryError);

      await expect(markTaskAsDoneUseCase.execute(taskId))
        .rejects.toThrow('Database connection failed');

      expect(mockRepository.markTaskAsDone).toHaveBeenCalledWith(taskId);
    });
  });
});