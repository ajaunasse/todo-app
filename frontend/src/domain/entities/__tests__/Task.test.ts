import { Task, Priority } from '../Task';

describe('Task Entity', () => {
  const validTaskData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    priority: Priority.MEDIUM,
    isDone: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  describe('create', () => {
    it('should create a task with valid data', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority
      );

      expect(task.id.value).toBe(validTaskData.id);
      expect(task.title).toBe(validTaskData.title);
      expect(task.description).toBe(validTaskData.description);
      expect(task.priority).toBe(validTaskData.priority);
      expect(task.isDone).toBe(false);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a task with custom dates', () => {
      const customDate = new Date('2023-06-15');
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority,
        true,
        false,
        customDate,
        customDate
      );

      expect(task.isDone).toBe(true);
      expect(task.isArchived).toBe(false);
      expect(task.createdAt).toBe(customDate);
      expect(task.updatedAt).toBe(customDate);
    });

    it('should throw error for empty title', () => {
      expect(() => {
        Task.create(
          validTaskData.id,
          '',
          validTaskData.description,
          validTaskData.priority
        );
      }).toThrow('Task title cannot be empty');
    });

    it('should throw error for title too long', () => {
      const longTitle = 'a'.repeat(256);
      expect(() => {
        Task.create(
          validTaskData.id,
          longTitle,
          validTaskData.description,
          validTaskData.priority
        );
      }).toThrow('Task title cannot exceed 255 characters');
    });

    it('should throw error for empty description', () => {
      expect(() => {
        Task.create(
          validTaskData.id,
          validTaskData.title,
          '',
          validTaskData.priority
        );
      }).toThrow('Task description cannot be empty');
    });

    it('should throw error for description too long', () => {
      const longDescription = 'a'.repeat(1001);
      expect(() => {
        Task.create(
          validTaskData.id,
          validTaskData.title,
          longDescription,
          validTaskData.priority
        );
      }).toThrow('Task description cannot exceed 1000 characters');
    });
  });

  describe('fromApiResponse', () => {
    it('should create task from API response', () => {
      const apiResponse = {
        id: validTaskData.id,
        title: validTaskData.title,
        description: validTaskData.description,
        priority: validTaskData.priority,
        is_done: true,
        is_archived: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      };

      const task = Task.fromApiResponse(apiResponse);

      expect(task.id.value).toBe(apiResponse.id);
      expect(task.title).toBe(apiResponse.title);
      expect(task.description).toBe(apiResponse.description);
      expect(task.priority).toBe(apiResponse.priority);
      expect(task.isDone).toBe(apiResponse.is_done);
      expect(task.isArchived).toBe(apiResponse.is_archived);
      expect(task.createdAt).toEqual(new Date(apiResponse.created_at));
      expect(task.updatedAt).toEqual(new Date(apiResponse.updated_at));
    });
  });

  describe('update', () => {
    it('should update task properties', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority
      );

      const originalUpdatedAt = task.updatedAt;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        const updatedTask = task.update({
          title: 'Updated Title',
          priority: Priority.HIGH,
        });

        expect(updatedTask.title).toBe('Updated Title');
        expect(updatedTask.description).toBe(validTaskData.description); // unchanged
        expect(updatedTask.priority).toBe(Priority.HIGH);
        expect(updatedTask.isDone).toBe(task.isDone); // unchanged
        expect(updatedTask.id).toBe(task.id);
        expect(updatedTask.createdAt).toBe(task.createdAt);
        expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });

    it('should update only specified properties', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority
      );

      const updatedTask = task.update({
        description: 'New Description',
      });

      expect(updatedTask.title).toBe(validTaskData.title); // unchanged
      expect(updatedTask.description).toBe('New Description');
      expect(updatedTask.priority).toBe(validTaskData.priority); // unchanged
    });
  });

  describe('markAsDone', () => {
    it('should mark task as done and update timestamp', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority
      );

      const originalUpdatedAt = task.updatedAt;

      setTimeout(() => {
        const doneTask = task.markAsDone();

        expect(doneTask.isDone).toBe(true);
        expect(doneTask.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        expect(doneTask.id).toBe(task.id);
        expect(doneTask.title).toBe(task.title);
        expect(doneTask.description).toBe(task.description);
        expect(doneTask.priority).toBe(task.priority);
        expect(doneTask.createdAt).toBe(task.createdAt);
      }, 1);
    });
  });

  describe('archive', () => {
    it('should archive a completed task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority,
        true, // isDone
        false // isArchived
      );

      const originalUpdatedAt = task.updatedAt;

      setTimeout(() => {
        const archivedTask = task.archive();

        expect(archivedTask.isArchived).toBe(true);
        expect(archivedTask.isDone).toBe(true);
        expect(archivedTask.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        expect(archivedTask.id).toBe(task.id);
        expect(archivedTask.title).toBe(task.title);
        expect(archivedTask.description).toBe(task.description);
        expect(archivedTask.priority).toBe(task.priority);
        expect(archivedTask.createdAt).toBe(task.createdAt);
      }, 1);
    });

    it('should throw error when trying to archive a pending task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority,
        false // isDone
      );

      expect(() => {
        task.archive();
      }).toThrow('Only completed tasks can be archived');
    });

    it('should throw error when trying to archive an already archived task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority,
        true, // isDone
        true // isArchived
      );

      expect(() => {
        task.archive();
      }).toThrow('Task is already archived');
    });
  });

  describe('isHighPriority', () => {
    it('should return true for high priority task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        Priority.HIGH
      );

      expect(task.isHighPriority()).toBe(true);
    });

    it('should return false for non-high priority task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        Priority.MEDIUM
      );

      expect(task.isHighPriority()).toBe(false);
    });
  });

  describe('isPending', () => {
    it('should return true for non-done task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority,
        false
      );

      expect(task.isPending()).toBe(true);
    });

    it('should return false for done task', () => {
      const task = Task.create(
        validTaskData.id,
        validTaskData.title,
        validTaskData.description,
        validTaskData.priority,
        true
      );

      expect(task.isPending()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should allow maximum valid title length', () => {
      const maxTitle = 'a'.repeat(255);
      
      expect(() => {
        Task.create(
          validTaskData.id,
          maxTitle,
          validTaskData.description,
          validTaskData.priority
        );
      }).not.toThrow();
    });

    it('should allow maximum valid description length', () => {
      const maxDescription = 'a'.repeat(1000);
      
      expect(() => {
        Task.create(
          validTaskData.id,
          validTaskData.title,
          maxDescription,
          validTaskData.priority
        );
      }).not.toThrow();
    });

    it('should trim whitespace from title and description', () => {
      const titleWithSpaces = '  Test Title  ';
      const descriptionWithSpaces = '  Test Description  ';
      
      expect(() => {
        Task.create(
          validTaskData.id,
          titleWithSpaces,
          descriptionWithSpaces,
          validTaskData.priority
        );
      }).not.toThrow();
    });
  });
});