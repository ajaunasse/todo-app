import { UpdateTaskUseCase } from '../UpdateTaskUseCase';
import { TaskRepository } from '../../repositories';
import { Task, Priority, TaskId } from '../../entities';

describe('UpdateTaskUseCase', () => {
  let mockRepository: jest.Mocked<TaskRepository>;
  let updateTaskUseCase: UpdateTaskUseCase;

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
    updateTaskUseCase = new UpdateTaskUseCase(mockRepository);
  });

  const taskId: TaskId = { value: '123' };
  const existingTask = Task.create('123', 'Existing Task', 'Existing Description', Priority.LOW);

  describe('execute', () => {
    it('should update task with valid parameters', async () => {
      const updateParams = {
        title: 'Updated Task',
        description: 'Updated Description',
        priority: Priority.MEDIUM,
      };
      const updatedTask = existingTask.update(updateParams);

      mockRepository.updateTask.mockResolvedValue(updatedTask);

      const result = await updateTaskUseCase.execute(taskId, updateParams);

      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, updateParams);
      expect(result).toBe(updatedTask);
    });

    it('should update task to high priority when limit not exceeded', async () => {
      const updateParams = { priority: Priority.HIGH };
      const updatedTask = existingTask.update(updateParams);

      mockRepository.countTasksByPriority.mockResolvedValue(4); // Less than 5
      mockRepository.updateTask.mockResolvedValue(updatedTask);

      const result = await updateTaskUseCase.execute(taskId, updateParams);

      expect(mockRepository.countTasksByPriority).toHaveBeenCalledWith(Priority.HIGH);
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, updateParams);
      expect(result).toBe(updatedTask);
    });

    it('should not check limit when not updating to high priority', async () => {
      const updateParams = { title: 'Updated Title' };
      const updatedTask = existingTask.update(updateParams);

      mockRepository.updateTask.mockResolvedValue(updatedTask);

      await updateTaskUseCase.execute(taskId, updateParams);

      expect(mockRepository.countTasksByPriority).not.toHaveBeenCalled();
      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, updateParams);
    });

    it('should throw error when high priority limit exceeded', async () => {
      const updateParams = { priority: Priority.HIGH };

      mockRepository.countTasksByPriority.mockResolvedValue(5); // At limit

      await expect(updateTaskUseCase.execute(taskId, updateParams))
        .rejects.toThrow('Cannot modify task to high priority. Maximum of 5 high priority tasks allowed');

      expect(mockRepository.updateTask).not.toHaveBeenCalled();
    });

    it('should update partial fields only', async () => {
      const updateParams = { title: 'New Title' };
      const updatedTask = existingTask.update(updateParams);

      mockRepository.updateTask.mockResolvedValue(updatedTask);

      await updateTaskUseCase.execute(taskId, updateParams);

      expect(mockRepository.updateTask).toHaveBeenCalledWith(taskId, updateParams);
    });
  });

  describe('validation', () => {

    it('should throw error for empty title', async () => {
      const invalidParams = { title: '' };

      await expect(updateTaskUseCase.execute(taskId, invalidParams))
        .rejects.toThrow('Task title cannot be empty');

      expect(mockRepository.updateTask).not.toHaveBeenCalled();
    });

    it('should throw error for title with only whitespace', async () => {
      const invalidParams = { title: '   ' };

      await expect(updateTaskUseCase.execute(taskId, invalidParams))
        .rejects.toThrow('Task title cannot be empty');
    });

    it('should throw error for title too long', async () => {
      const invalidParams = { title: 'a'.repeat(256) };

      await expect(updateTaskUseCase.execute(taskId, invalidParams))
        .rejects.toThrow('Task title cannot exceed 255 characters');
    });

    it('should throw error for empty description', async () => {
      const invalidParams = { description: '' };

      await expect(updateTaskUseCase.execute(taskId, invalidParams))
        .rejects.toThrow('Task description cannot be empty');
    });

    it('should throw error for description with only whitespace', async () => {
      const invalidParams = { description: '   ' };

      await expect(updateTaskUseCase.execute(taskId, invalidParams))
        .rejects.toThrow('Task description cannot be empty');
    });

    it('should throw error for description too long', async () => {
      const invalidParams = { description: 'a'.repeat(1001) };

      await expect(updateTaskUseCase.execute(taskId, invalidParams))
        .rejects.toThrow('Task description cannot exceed 1000 characters');
    });

    it('should accept maximum valid title length', async () => {
      const validParams = { title: 'a'.repeat(255) };
      const updatedTask = existingTask.update(validParams);

      mockRepository.updateTask.mockResolvedValue(updatedTask);

      await expect(updateTaskUseCase.execute(taskId, validParams))
        .resolves.toBe(updatedTask);
    });

    it('should accept maximum valid description length', async () => {
      const validParams = { description: 'a'.repeat(1000) };
      const updatedTask = existingTask.update(validParams);

      mockRepository.updateTask.mockResolvedValue(updatedTask);

      await expect(updateTaskUseCase.execute(taskId, validParams))
        .resolves.toBe(updatedTask);
    });

    it('should accept undefined fields without validation', async () => {
      const validParams = { title: undefined, description: undefined, priority: undefined };
      const updatedTask = existingTask.update(validParams);

      mockRepository.updateTask.mockResolvedValue(updatedTask);

      await expect(updateTaskUseCase.execute(taskId, validParams))
        .resolves.toBe(updatedTask);
    });
  });
});