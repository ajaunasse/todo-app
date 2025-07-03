import { CreateTaskUseCase } from '../CreateTaskUseCase';
import { TaskRepository } from '../../repositories';
import { Task, Priority } from '../../entities';

describe('CreateTaskUseCase', () => {
  let mockRepository: jest.Mocked<TaskRepository>;
  let createTaskUseCase: CreateTaskUseCase;

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
    createTaskUseCase = new CreateTaskUseCase(mockRepository);
  });

  const validParams = {
    title: 'Test Task',
    description: 'Test Description',
    priority: Priority.MEDIUM,
  };

  describe('execute', () => {
    it('should create task with valid parameters', async () => {
      const expectedTask = Task.create('123', validParams.title, validParams.description, validParams.priority);
      mockRepository.createTask.mockResolvedValue(expectedTask);

      const result = await createTaskUseCase.execute(validParams);

      expect(mockRepository.countTasksByPriority).not.toHaveBeenCalled(); // Only called for HIGH priority
      expect(mockRepository.createTask).toHaveBeenCalledWith(validParams);
      expect(result).toBe(expectedTask);
    });

    it('should create high priority task when limit not exceeded', async () => {
      const highPriorityParams = { ...validParams, priority: Priority.HIGH };
      const expectedTask = Task.create('123', highPriorityParams.title, highPriorityParams.description, highPriorityParams.priority);
      
      mockRepository.countTasksByPriority.mockResolvedValue(4); // Less than 5
      mockRepository.createTask.mockResolvedValue(expectedTask);

      const result = await createTaskUseCase.execute(highPriorityParams);

      expect(mockRepository.countTasksByPriority).toHaveBeenCalledWith(Priority.HIGH);
      expect(mockRepository.createTask).toHaveBeenCalledWith(highPriorityParams);
      expect(result).toBe(expectedTask);
    });

    it('should throw error when high priority limit exceeded', async () => {
      const highPriorityParams = { ...validParams, priority: Priority.HIGH };
      
      mockRepository.countTasksByPriority.mockResolvedValue(5); // At limit

      await expect(createTaskUseCase.execute(highPriorityParams))
        .rejects.toThrow('Cannot create more than 5 tasks with high priority');

      expect(mockRepository.countTasksByPriority).toHaveBeenCalledWith(Priority.HIGH);
      expect(mockRepository.createTask).not.toHaveBeenCalled();
    });

    it('should not check limit for non-high priority tasks', async () => {
      const lowPriorityParams = { ...validParams, priority: Priority.LOW };
      const expectedTask = Task.create('123', lowPriorityParams.title, lowPriorityParams.description, lowPriorityParams.priority);
      
      mockRepository.createTask.mockResolvedValue(expectedTask);

      await createTaskUseCase.execute(lowPriorityParams);

      expect(mockRepository.countTasksByPriority).not.toHaveBeenCalled();
      expect(mockRepository.createTask).toHaveBeenCalledWith(lowPriorityParams);
    });
  });

  describe('validation', () => {
    it('should throw error for empty title', async () => {
      const invalidParams = { ...validParams, title: '' };

      await expect(createTaskUseCase.execute(invalidParams))
        .rejects.toThrow('Task title is required');

      expect(mockRepository.createTask).not.toHaveBeenCalled();
    });

    it('should throw error for title with only whitespace', async () => {
      const invalidParams = { ...validParams, title: '   ' };

      await expect(createTaskUseCase.execute(invalidParams))
        .rejects.toThrow('Task title is required');
    });

    it('should throw error for title too long', async () => {
      const invalidParams = { ...validParams, title: 'a'.repeat(256) };

      await expect(createTaskUseCase.execute(invalidParams))
        .rejects.toThrow('Task title cannot exceed 255 characters');
    });

    it('should throw error for empty description', async () => {
      const invalidParams = { ...validParams, description: '' };

      await expect(createTaskUseCase.execute(invalidParams))
        .rejects.toThrow('Task description is required');
    });

    it('should throw error for description with only whitespace', async () => {
      const invalidParams = { ...validParams, description: '   ' };

      await expect(createTaskUseCase.execute(invalidParams))
        .rejects.toThrow('Task description is required');
    });

    it('should throw error for description too long', async () => {
      const invalidParams = { ...validParams, description: 'a'.repeat(1001) };

      await expect(createTaskUseCase.execute(invalidParams))
        .rejects.toThrow('Task description cannot exceed 1000 characters');
    });

    it('should accept maximum valid title length', async () => {
      const validParams_maxTitle = { ...validParams, title: 'a'.repeat(255) };
      const expectedTask = Task.create('123', validParams_maxTitle.title, validParams_maxTitle.description, validParams_maxTitle.priority);
      
      mockRepository.createTask.mockResolvedValue(expectedTask);

      await expect(createTaskUseCase.execute(validParams_maxTitle))
        .resolves.toBe(expectedTask);
    });

    it('should accept maximum valid description length', async () => {
      const validParams_maxDesc = { ...validParams, description: 'a'.repeat(1000) };
      const expectedTask = Task.create('123', validParams_maxDesc.title, validParams_maxDesc.description, validParams_maxDesc.priority);
      
      mockRepository.createTask.mockResolvedValue(expectedTask);

      await expect(createTaskUseCase.execute(validParams_maxDesc))
        .resolves.toBe(expectedTask);
    });
  });
});