import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskManagementLayout } from '../TaskManagementLayout';
import { Task, Priority, TaskId } from '../../../../domain/entities';

// Mock the dependencies
jest.mock('../AppLayout', () => ({
  AppLayout: ({ children, headerProps, fullHeight, className }: any) => (
    <div 
      data-testid="app-layout"
      data-full-height={fullHeight}
      className={className}
    >
      <header data-testid="app-header">
        <h1>{headerProps.title}</h1>
        {headerProps.subtitle && <p>{headerProps.subtitle}</p>}
        <div data-testid="task-stats">
          <span>Total: {headerProps.totalTasks || 0}</span>
          <span>Pending: {headerProps.pendingTasks || 0}</span>
          <span>Completed: {headerProps.completedTasks || 0}</span>
        </div>
        {headerProps.actions && <div data-testid="header-actions">{headerProps.actions}</div>}
      </header>
      <main data-testid="app-content">{children}</main>
    </div>
  ),
}));

jest.mock('../../organisms', () => ({
  TaskBoard: ({ pendingTasks, completedTasks, loading, onDragEnd, onAddTask, onEditTask, className }: any) => (
    <div 
      data-testid="task-board"
      data-loading={loading}
      className={className}
    >
      <div data-testid="pending-tasks">
        Pending: {pendingTasks.length}
        {pendingTasks.map((task: any) => (
          <div key={task.id.value} data-testid={`pending-task-${task.id.value}`}>
            {task.title}
            <button onClick={() => onEditTask?.(task)}>Edit</button>
          </div>
        ))}
        {onAddTask && <button onClick={onAddTask} data-testid="add-task-btn">Add Task</button>}
      </div>
      <div data-testid="completed-tasks">
        Completed: {completedTasks.length}
        {completedTasks.map((task: any) => (
          <div key={task.id.value} data-testid={`completed-task-${task.id.value}`}>
            {task.title}
          </div>
        ))}
      </div>
      <button 
        onClick={() => onDragEnd({ active: { id: 'test' }, over: { id: 'done' } })} 
        data-testid="simulate-drag"
      >
        Simulate Drag
      </button>
    </div>
  ),
  TaskForm: ({ isOpen, title, loading, error, onSubmit, onClose, onClearError, isEditing, initialData }: any) => (
    isOpen ? (
      <div data-testid="task-form" data-editing={isEditing} data-loading={loading}>
        <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
        {error && (
          <div data-testid="form-error">
            {error}
            <button onClick={onClearError} data-testid="clear-error">Clear</button>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit?.({ title: 'Test Task', description: 'Test', priority: 'medium' }); }}>
          <input 
            defaultValue={initialData?.title || ''} 
            data-testid="form-title-input"
            placeholder="Task title"
          />
          <textarea 
            defaultValue={initialData?.description || ''} 
            data-testid="form-description-input"
            placeholder="Task description"
          />
          <select defaultValue={initialData?.priority || 'medium'} data-testid="form-priority-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" data-testid="form-submit">
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={onClose} data-testid="form-cancel">Cancel</button>
        </form>
      </div>
    ) : null
  ),
}));

describe('TaskManagementLayout Integration Tests', () => {
  const createMockTask = (id: string, title: string, isDone: boolean = false): Task => ({
    id: { value: id } as TaskId,
    title,
    description: `Description for ${title}`,
    priority: Priority.MEDIUM,
    isDone,
    createdAt: new Date('2023-01-01'),
  });

  const defaultProps = {
    headerProps: {
      title: 'Task Manager',
      subtitle: 'Manage your tasks efficiently',
      totalTasks: 5,
      pendingTasks: 3,
      completedTasks: 2,
    },
    boardProps: {
      pendingTasks: [
        createMockTask('task-1', 'Task 1'),
        createMockTask('task-2', 'Task 2'),
        createMockTask('task-3', 'Task 3'),
      ],
      completedTasks: [
        createMockTask('task-4', 'Task 4', true),
        createMockTask('task-5', 'Task 5', true),
      ],
      onDragEnd: jest.fn(),
      onAddTask: jest.fn(),
      onEditTask: jest.fn(),
    },
    formProps: {
      isOpen: false,
      onSubmit: jest.fn(),
      onClose: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Layout Integration', () => {
    it('renders complete task management interface', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      // Check all major components are rendered
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument(); // Form closed by default

      // Check content
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
      expect(screen.getByText('Manage your tasks efficiently')).toBeInTheDocument();
    });

    it('integrates AppLayout with full height and correct props', () => {
      render(<TaskManagementLayout {...defaultProps} className="custom-management" />);

      const appLayout = screen.getByTestId('app-layout');
      expect(appLayout).toHaveAttribute('data-full-height', 'true');
      expect(appLayout).toHaveClass('custom-management');
    });

    it('passes header stats correctly', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      const stats = screen.getByTestId('task-stats');
      expect(stats).toHaveTextContent('Total: 5');
      expect(stats).toHaveTextContent('Pending: 3');
      expect(stats).toHaveTextContent('Completed: 2');
    });
  });

  describe('Task Board Integration', () => {
    it('displays all pending and completed tasks', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      // Check pending tasks
      expect(screen.getByTestId('pending-tasks')).toHaveTextContent('Pending: 3');
      expect(screen.getByTestId('pending-task-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('pending-task-task-2')).toBeInTheDocument();
      expect(screen.getByTestId('pending-task-task-3')).toBeInTheDocument();

      // Check completed tasks
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('Completed: 2');
      expect(screen.getByTestId('completed-task-task-4')).toBeInTheDocument();
      expect(screen.getByTestId('completed-task-task-5')).toBeInTheDocument();
    });

    it('handles board loading state', () => {
      const loadingProps = {
        ...defaultProps,
        boardProps: {
          ...defaultProps.boardProps,
          loading: true,
        },
      };

      render(<TaskManagementLayout {...loadingProps} />);

      const taskBoard = screen.getByTestId('task-board');
      expect(taskBoard).toHaveAttribute('data-loading', 'true');
    });

    it('integrates drag and drop functionality', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      fireEvent.click(screen.getByTestId('simulate-drag'));
      expect(defaultProps.boardProps.onDragEnd).toHaveBeenCalledWith({
        active: { id: 'test' },
        over: { id: 'done' }
      });
    });

    it('integrates add task functionality', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      fireEvent.click(screen.getByTestId('add-task-btn'));
      expect(defaultProps.boardProps.onAddTask).toHaveBeenCalledTimes(1);
    });

    it('integrates edit task functionality', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);
      
      expect(defaultProps.boardProps.onEditTask).toHaveBeenCalledWith(
        defaultProps.boardProps.pendingTasks[0]
      );
    });
  });

  describe('Task Form Integration', () => {
    it('shows form when open', () => {
      const openFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
        },
      };

      render(<TaskManagementLayout {...openFormProps} />);

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('shows edit form with initial data', () => {
      const editFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
          isEditing: true,
          initialData: {
            title: 'Edit Task',
            description: 'Edit Description',
            priority: Priority.HIGH,
          },
        },
      };

      render(<TaskManagementLayout {...editFormProps} />);

      const form = screen.getByTestId('task-form');
      expect(form).toHaveAttribute('data-editing', 'true');
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      
      const titleInput = screen.getByTestId('form-title-input');
      expect(titleInput).toHaveValue('Edit Task');
    });

    it('handles form submission', () => {
      const openFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
        },
      };

      render(<TaskManagementLayout {...openFormProps} />);

      fireEvent.submit(screen.getByTestId('form-submit').closest('form')!);
      
      expect(defaultProps.formProps.onSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test',
        priority: Priority.MEDIUM,
      });
    });

    it('handles form cancellation', () => {
      const openFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
        },
      };

      render(<TaskManagementLayout {...openFormProps} />);

      fireEvent.click(screen.getByTestId('form-cancel'));
      expect(defaultProps.formProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('handles form errors', () => {
      const errorFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
          error: 'Failed to save task',
          onClearError: jest.fn(),
        },
      };

      render(<TaskManagementLayout {...errorFormProps} />);

      expect(screen.getByTestId('form-error')).toHaveTextContent('Failed to save task');
      
      fireEvent.click(screen.getByTestId('clear-error'));
      expect(errorFormProps.formProps.onClearError).toHaveBeenCalledTimes(1);
    });

    it('shows loading state in form', () => {
      const loadingFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
          loading: true,
        },
      };

      render(<TaskManagementLayout {...loadingFormProps} />);

      const form = screen.getByTestId('task-form');
      expect(form).toHaveAttribute('data-loading', 'true');
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Full Workflow Integration', () => {
    it('simulates complete task creation workflow', () => {
      const { rerender } = render(<TaskManagementLayout {...defaultProps} />);

      // Step 1: Click add task
      fireEvent.click(screen.getByTestId('add-task-btn'));
      expect(defaultProps.boardProps.onAddTask).toHaveBeenCalled();

      // Step 2: Open form (simulate state change)
      const openFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
        },
      };

      rerender(<TaskManagementLayout {...openFormProps} />);
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      // Step 3: Submit form
      fireEvent.submit(screen.getByTestId('form-submit').closest('form')!);
      expect(defaultProps.formProps.onSubmit).toHaveBeenCalled();
    });

    it('simulates complete task editing workflow', () => {
      const { rerender } = render(<TaskManagementLayout {...defaultProps} />);

      // Step 1: Click edit task
      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);
      expect(defaultProps.boardProps.onEditTask).toHaveBeenCalled();

      // Step 2: Open edit form (simulate state change)
      const editFormProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
          isEditing: true,
          initialData: defaultProps.boardProps.pendingTasks[0],
        },
      };

      rerender(<TaskManagementLayout {...editFormProps} />);
      
      const form = screen.getByTestId('task-form');
      expect(form).toHaveAttribute('data-editing', 'true');

      // Step 3: Submit edit
      fireEvent.submit(screen.getByTestId('form-submit').closest('form')!);
      expect(defaultProps.formProps.onSubmit).toHaveBeenCalled();
    });

    it('simulates drag and drop workflow', () => {
      render(<TaskManagementLayout {...defaultProps} />);

      // Simulate drag and drop
      fireEvent.click(screen.getByTestId('simulate-drag'));
      expect(defaultProps.boardProps.onDragEnd).toHaveBeenCalledWith({
        active: { id: 'test' },
        over: { id: 'done' }
      });
    });
  });

  describe('Layout Responsiveness', () => {
    it('maintains layout structure with varying task counts', () => {
      const manyTasksProps = {
        ...defaultProps,
        headerProps: {
          ...defaultProps.headerProps,
          totalTasks: 100,
          pendingTasks: 60,
          completedTasks: 40,
        },
        boardProps: {
          ...defaultProps.boardProps,
          pendingTasks: Array.from({ length: 60 }, (_, i) => 
            createMockTask(`pending-${i}`, `Pending Task ${i}`)
          ),
          completedTasks: Array.from({ length: 40 }, (_, i) => 
            createMockTask(`completed-${i}`, `Completed Task ${i}`, true)
          ),
        },
      };

      render(<TaskManagementLayout {...manyTasksProps} />);

      expect(screen.getByTestId('pending-tasks')).toHaveTextContent('Pending: 60');
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('Completed: 40');
      expect(screen.getByTestId('task-stats')).toHaveTextContent('Total: 100');
    });

    it('handles empty state gracefully', () => {
      const emptyProps = {
        ...defaultProps,
        headerProps: {
          ...defaultProps.headerProps,
          totalTasks: 0,
          pendingTasks: 0,
          completedTasks: 0,
        },
        boardProps: {
          ...defaultProps.boardProps,
          pendingTasks: [],
          completedTasks: [],
        },
      };

      render(<TaskManagementLayout {...emptyProps} />);

      expect(screen.getByTestId('pending-tasks')).toHaveTextContent('Pending: 0');
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('Completed: 0');
      expect(screen.getByTestId('task-stats')).toHaveTextContent('Total: 0');
    });
  });

  describe('Error Handling Integration', () => {
    it('handles board errors gracefully', () => {
      const errorBoardProps = {
        ...defaultProps,
        boardProps: {
          ...defaultProps.boardProps,
          pendingTasks: [], // Simulate error state
          completedTasks: [],
          loading: false,
        },
      };

      render(<TaskManagementLayout {...errorBoardProps} />);

      // Should still render without crashing
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
      expect(screen.getByTestId('pending-tasks')).toHaveTextContent('Pending: 0');
    });

    it('maintains layout integrity during form errors', () => {
      const formErrorProps = {
        ...defaultProps,
        formProps: {
          ...defaultProps.formProps,
          isOpen: true,
          error: 'Network error occurred',
          onClearError: jest.fn(),
        },
      };

      render(<TaskManagementLayout {...formErrorProps} />);

      // Layout should remain intact
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('task-board')).toBeInTheDocument();
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByTestId('form-error')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('handles dynamic updates efficiently', () => {
      const { rerender } = render(<TaskManagementLayout {...defaultProps} />);

      // Update header stats
      const updatedProps = {
        ...defaultProps,
        headerProps: {
          ...defaultProps.headerProps,
          totalTasks: 10,
          pendingTasks: 7,
          completedTasks: 3,
        },
      };

      rerender(<TaskManagementLayout {...updatedProps} />);

      const stats = screen.getByTestId('task-stats');
      expect(stats).toHaveTextContent('Total: 10');
      expect(stats).toHaveTextContent('Pending: 7');
      expect(stats).toHaveTextContent('Completed: 3');
    });

    it('handles rapid form state changes', () => {
      const { rerender } = render(<TaskManagementLayout {...defaultProps} />);

      // Open form
      rerender(<TaskManagementLayout {...{
        ...defaultProps,
        formProps: { ...defaultProps.formProps, isOpen: true }
      }} />);
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      // Close form
      rerender(<TaskManagementLayout {...{
        ...defaultProps,
        formProps: { ...defaultProps.formProps, isOpen: false }
      }} />);
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
    });
  });
});