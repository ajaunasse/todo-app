import { GetAllTasksUseCase } from '../GetAllTasksUseCase';
import { TaskRepository } from '../../repositories';
import { Task, Priority } from '../../entities';

describe('GetAllTasksUseCase', () => {
  let mockRepository: jest.Mocked<TaskRepository>;
  let getAllTasksUseCase: GetAllTasksUseCase;

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
    getAllTasksUseCase = new GetAllTasksUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return all tasks from repository', async () => {
      const tasks = [
        Task.create('1', 'Task 1', 'Description 1', Priority.HIGH),
        Task.create('2', 'Task 2', 'Description 2', Priority.MEDIUM),
        Task.create('3', 'Task 3', 'Description 3', Priority.LOW),
      ];

      mockRepository.getAllTasks.mockResolvedValue(tasks);

      const result = await getAllTasksUseCase.execute();

      expect(mockRepository.getAllTasks).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result).toContain(tasks[0]);
      expect(result).toContain(tasks[1]);
      expect(result).toContain(tasks[2]);
    });

    it('should return empty array when no tasks exist', async () => {
      mockRepository.getAllTasks.mockResolvedValue([]);

      const result = await getAllTasksUseCase.execute();

      expect(mockRepository.getAllTasks).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should return tasks in the order provided by repository', async () => {
      const tasks = [
        Task.create('1', 'Task 1', 'Description', Priority.LOW),
        Task.create('2', 'Task 2', 'Description', Priority.HIGH),
        Task.create('3', 'Task 3', 'Description', Priority.MEDIUM),
      ];

      mockRepository.getAllTasks.mockResolvedValue(tasks);

      const result = await getAllTasksUseCase.execute();

      expect(result).toHaveLength(3);
      expect(result).toEqual(tasks); // Should return in exact same order
    });

    it('should handle repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockRepository.getAllTasks.mockRejectedValue(repositoryError);

      await expect(getAllTasksUseCase.execute())
        .rejects.toThrow('Database connection failed');

      expect(mockRepository.getAllTasks).toHaveBeenCalledTimes(1);
    });

    it('should preserve order from repository response', async () => {
      const date1 = new Date('2023-01-01T10:00:00Z');
      const date2 = new Date('2023-01-01T11:00:00Z');
      const date3 = new Date('2023-01-01T12:00:00Z');

      const tasks = [
        Task.create('1', 'First Task', 'Description', Priority.MEDIUM, false, date1, date1),
        Task.create('2', 'Second Task', 'Description', Priority.MEDIUM, false, date3, date3),
        Task.create('3', 'Third Task', 'Description', Priority.MEDIUM, false, date2, date2),
      ];

      mockRepository.getAllTasks.mockResolvedValue(tasks);

      const result = await getAllTasksUseCase.execute();

      expect(result).toEqual(tasks); // Should maintain repository order
    });
  });
});