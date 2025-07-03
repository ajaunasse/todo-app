export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TaskId {
  value: string;
}

export class Task {
  constructor(
    public readonly id: TaskId,
    public readonly title: string,
    public readonly description: string,
    public readonly priority: Priority,
    public readonly isDone: boolean,
    public readonly isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateTitle(title);
    this.validateDescription(description);
  }

  static create(
    id: string,
    title: string,
    description: string,
    priority: Priority,
    isDone: boolean = false,
    isArchived: boolean = false,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): Task {
    return new Task(
      { value: id },
      title,
      description,
      priority,
      isDone,
      isArchived,
      createdAt,
      updatedAt
    );
  }

  static fromApiResponse(data: {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    is_done: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
  }): Task {
    return Task.create(
      data.id,
      data.title,
      data.description,
      data.priority,
      data.is_done,
      data.is_archived,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  update(params: {
    title?: string;
    description?: string;
    priority?: Priority;
  }): Task {
    return new Task(
      this.id,
      params.title ?? this.title,
      params.description ?? this.description,
      params.priority ?? this.priority,
      this.isDone,
      this.isArchived,
      this.createdAt,
      new Date()
    );
  }

  markAsDone(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.priority,
      true,
      this.isArchived,
      this.createdAt,
      new Date()
    );
  }

  archive(): Task {
    if (!this.isDone) {
      throw new Error('Only completed tasks can be archived');
    }
    if (this.isArchived) {
      throw new Error('Task is already archived');
    }
    return new Task(
      this.id,
      this.title,
      this.description,
      this.priority,
      this.isDone,
      true,
      this.createdAt,
      new Date()
    );
  }

  isHighPriority(): boolean {
    return this.priority === Priority.HIGH;
  }

  isPending(): boolean {
    return !this.isDone;
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (title.length > 255) {
      throw new Error('Task title cannot exceed 255 characters');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Task description cannot be empty');
    }
    if (description.length > 1000) {
      throw new Error('Task description cannot exceed 1000 characters');
    }
  }
}