import { GetTasksByStatusUseCase } from '../GetTasksByStatusUseCase';
import { TaskRepository } from '../../repositories';
import { Task, Priority } from '../../entities';

describe('GetTasksByStatusUseCase', () => {
  let mockRepository: jest.Mocked<TaskRepository>;
  let getTasksByStatusUseCase: GetTasksByStatusUseCase;

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
    getTasksByStatusUseCase = new GetTasksByStatusUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return pending tasks when isDone is false', async () => {
      const pendingTasks = [
        Task.create('1', 'Pending Task 1', 'Description 1', Priority.HIGH, false),
        Task.create('2', 'Pending Task 2', 'Description 2', Priority.MEDIUM, false),
      ];

      mockRepository.getTasksByFilter.mockResolvedValue(pendingTasks);

      const result = await getTasksByStatusUseCase.execute(false);

      expect(mockRepository.getTasksByFilter).toHaveBeenCalledWith({ isDone: false });
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining(pendingTasks));
    });

    it('should return completed tasks when isDone is true', async () => {
      const completedTasks = [
        Task.create('1', 'Completed Task 1', 'Description 1', Priority.HIGH, true),
        Task.create('2', 'Completed Task 2', 'Description 2', Priority.MEDIUM, true),
      ];

      mockRepository.getTasksByFilter.mockResolvedValue(completedTasks);

      const result = await getTasksByStatusUseCase.execute(true);

      expect(mockRepository.getTasksByFilter).toHaveBeenCalledWith({ isDone: true });
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining(completedTasks));
    });

    it('should return empty array when no tasks match status', async () => {
      mockRepository.getTasksByFilter.mockResolvedValue([]);

      const result = await getTasksByStatusUseCase.execute(true);

      expect(mockRepository.getTasksByFilter).toHaveBeenCalledWith({ isDone: true });
      expect(result).toEqual([]);
    });

    it('should return filtered tasks in repository order', async () => {
      const filteredTasks = [
        Task.create('1', 'Task 1', 'Description', Priority.LOW, false),
        Task.create('2', 'Task 2', 'Description', Priority.HIGH, false),
        Task.create('3', 'Task 3', 'Description', Priority.MEDIUM, false),
        Task.create('4', 'Task 4', 'Description', Priority.HIGH, false),
      ];

      mockRepository.getTasksByFilter.mockResolvedValue(filteredTasks);

      const result = await getTasksByStatusUseCase.execute(false);

      expect(result).toHaveLength(4);
      expect(result).toEqual(filteredTasks); // Should maintain repository order
    });

    it('should handle repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockRepository.getTasksByFilter.mockRejectedValue(repositoryError);

      await expect(getTasksByStatusUseCase.execute(false))
        .rejects.toThrow('Database connection failed');

      expect(mockRepository.getTasksByFilter).toHaveBeenCalledWith({ isDone: false });
    });

    it('should preserve repository order for tasks with same status', async () => {
      const date1 = new Date('2023-01-01T10:00:00Z');
      const date2 = new Date('2023-01-01T11:00:00Z');
      const date3 = new Date('2023-01-01T12:00:00Z');

      const tasks = [
        Task.create('1', 'First Task', 'Description', Priority.MEDIUM, true, date1, date1),
        Task.create('2', 'Second Task', 'Description', Priority.MEDIUM, true, date3, date3),
        Task.create('3', 'Third Task', 'Description', Priority.MEDIUM, true, date2, date2),
      ];

      mockRepository.getTasksByFilter.mockResolvedValue(tasks);

      const result = await getTasksByStatusUseCase.execute(true);

      expect(result).toEqual(tasks); // Should maintain repository order
    });

    it('should call repository with correct filter parameters', async () => {
      mockRepository.getTasksByFilter.mockResolvedValue([]);

      await getTasksByStatusUseCase.execute(true);
      expect(mockRepository.getTasksByFilter).toHaveBeenCalledWith({ isDone: true });

      await getTasksByStatusUseCase.execute(false);
      expect(mockRepository.getTasksByFilter).toHaveBeenCalledWith({ isDone: false });
    });
  });
});