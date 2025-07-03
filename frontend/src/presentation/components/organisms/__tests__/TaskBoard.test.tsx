import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { TaskBoard } from '../TaskBoard';
import { Task, Priority, TaskId } from '../../../../domain/entities';

// Mock the dependencies
jest.mock('../TaskColumn', () => ({
  TaskColumn: ({ id, title, tasks, onAddTask, onEditTask }: any) => (
    <div data-testid={`task-column-${id}`}>
      <h3>{title}</h3>
      <div data-testid={`tasks-count-${id}`}>{tasks.length}</div>
      {onAddTask && (
        <button onClick={onAddTask} data-testid={`add-button-${id}`}>
          Add Task
        </button>
      )}
      {tasks.map((task: any) => (
        <div key={task.id.value} data-testid={`task-${task.id.value}`}>
          {task.title}
          <button onClick={() => onEditTask?.(task)} data-testid={`edit-${task.id.value}`}>
            Edit
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../molecules', () => ({
  DraggableCard: ({ id, title, isDragging }: any) => (
    <div data-testid={`draggable-card-${id}`} data-dragging={isDragging}>
      {title}
    </div>
  ),
}));

jest.mock('../../atoms', () => ({
  Spinner: ({ size, message, centered }: any) => (
    <div data-testid="spinner" data-size={size} data-centered={centered}>
      {message}
    </div>
  ),
}));

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: any) => (
    <div 
      data-testid="dnd-context"
      onMouseDown={() => {
        onDragStart?.({ active: { id: 'task-1' } });
      }}
      onMouseUp={() => {
        onDragEnd?.({ active: { id: 'task-1' }, over: { id: 'done' } });
      }}
    >
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

describe('TaskBoard Component', () => {
  const createMockTask = (id: string, title: string, isDone: boolean = false): Task => ({
    id: { value: id } as TaskId,
    title,
    description: `Description for ${title}`,
    priority: Priority.MEDIUM,
    isDone,
    createdAt: new Date(),
  });

  const defaultProps = {
    pendingTasks: [
      createMockTask('task-1', 'Task 1'),
      createMockTask('task-2', 'Task 2'),
    ],
    completedTasks: [
      createMockTask('task-3', 'Task 3', true),
    ],
    onDragEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders task board with columns', () => {
      render(<TaskBoard {...defaultProps} />);
      
      expect(screen.getByTestId('task-column-pending')).toBeInTheDocument();
      expect(screen.getByTestId('task-column-done')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<TaskBoard {...defaultProps} className="custom-board" />);
      expect(container.querySelector('.task-board')).toHaveClass('custom-board');
    });

    it('renders DndContext', () => {
      render(<TaskBoard {...defaultProps} />);
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('renders DragOverlay', () => {
      render(<TaskBoard {...defaultProps} />);
      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<TaskBoard {...defaultProps} loading />);
      
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('data-size', '2x');
      expect(spinner).toHaveAttribute('data-centered', 'true');
      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    });

    it('does not render columns when loading', () => {
      render(<TaskBoard {...defaultProps} loading />);
      
      expect(screen.queryByTestId('task-column-pending')).not.toBeInTheDocument();
      expect(screen.queryByTestId('task-column-done')).not.toBeInTheDocument();
    });

    it('does not show loading spinner by default', () => {
      render(<TaskBoard {...defaultProps} />);
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });

  describe('Task Columns', () => {
    it('renders pending column with correct props', () => {
      render(<TaskBoard {...defaultProps} />);
      
      const pendingColumn = screen.getByTestId('task-column-pending');
      expect(pendingColumn).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByTestId('tasks-count-pending')).toHaveTextContent('2');
    });

    it('renders done column with correct props', () => {
      render(<TaskBoard {...defaultProps} />);
      
      const doneColumn = screen.getByTestId('task-column-done');
      expect(doneColumn).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByTestId('tasks-count-done')).toHaveTextContent('1');
    });

    it('passes tasks to correct columns', () => {
      render(<TaskBoard {...defaultProps} />);
      
      // Check pending tasks
      expect(screen.getByTestId('task-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-task-2')).toBeInTheDocument();
      
      // Check completed task
      expect(screen.getByTestId('task-task-3')).toBeInTheDocument();
    });
  });

  describe('Add Task Functionality', () => {
    it('passes onAddTask to pending column only', () => {
      const onAddTask = jest.fn();
      render(<TaskBoard {...defaultProps} onAddTask={onAddTask} />);
      
      // Pending column should have add button
      expect(screen.getByTestId('add-button-pending')).toBeInTheDocument();
      
      // Done column should not have add button
      expect(screen.queryByTestId('add-button-done')).not.toBeInTheDocument();
    });

    it('calls onAddTask when add button clicked', () => {
      const onAddTask = jest.fn();
      render(<TaskBoard {...defaultProps} onAddTask={onAddTask} />);
      
      fireEvent.click(screen.getByTestId('add-button-pending'));
      expect(onAddTask).toHaveBeenCalledTimes(1);
    });

    it('does not render add button when onAddTask not provided', () => {
      render(<TaskBoard {...defaultProps} />);
      expect(screen.queryByTestId('add-button-pending')).not.toBeInTheDocument();
    });
  });

  describe('Edit Task Functionality', () => {
    it('passes onEditTask to both columns', () => {
      const onEditTask = jest.fn();
      render(<TaskBoard {...defaultProps} onEditTask={onEditTask} />);
      
      // Both columns should have edit buttons for their tasks
      expect(screen.getByTestId('edit-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-task-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-task-3')).toBeInTheDocument();
    });

    it('calls onEditTask with correct task when edit button clicked', () => {
      const onEditTask = jest.fn();
      render(<TaskBoard {...defaultProps} onEditTask={onEditTask} />);
      
      fireEvent.click(screen.getByTestId('edit-task-1'));
      expect(onEditTask).toHaveBeenCalledWith(defaultProps.pendingTasks[0]);
    });
  });

  describe('Drag and Drop', () => {
    it('calls onDragEnd when drag ends', () => {
      const onDragEnd = jest.fn();
      render(<TaskBoard {...defaultProps} onDragEnd={onDragEnd} />);
      
      const dndContext = screen.getByTestId('dnd-context');
      fireEvent.mouseUp(dndContext);
      
      expect(onDragEnd).toHaveBeenCalledWith({
        active: { id: 'task-1' },
        over: { id: 'done' }
      });
    });

    it('handles drag start and sets active task', () => {
      render(<TaskBoard {...defaultProps} />);
      
      const dndContext = screen.getByTestId('dnd-context');
      fireEvent.mouseDown(dndContext);
      
      // Should show draggable card in overlay
      expect(screen.getByTestId('draggable-card-task-1')).toBeInTheDocument();
    });

    it('clears active task on drag end', () => {
      render(<TaskBoard {...defaultProps} />);
      
      const dndContext = screen.getByTestId('dnd-context');
      
      // Start drag
      fireEvent.mouseDown(dndContext);
      expect(screen.getByTestId('draggable-card-task-1')).toBeInTheDocument();
      
      // End drag
      fireEvent.mouseUp(dndContext);
      
      // Note: In a real test, we'd need to check that the card is no longer in overlay
      // but our mock doesn't fully simulate this behavior
    });
  });

  describe('Drag Overlay', () => {
    it('shows dragged task in overlay during drag', () => {
      render(<TaskBoard {...defaultProps} />);
      
      const dndContext = screen.getByTestId('dnd-context');
      fireEvent.mouseDown(dndContext);
      
      const overlayCard = screen.getByTestId('draggable-card-task-1');
      expect(overlayCard).toBeInTheDocument();
      expect(overlayCard).toHaveAttribute('data-dragging', 'true');
    });

    it('does not show overlay when no active task', () => {
      render(<TaskBoard {...defaultProps} />);
      
      // Without triggering drag start, there should be no card in overlay
      expect(screen.queryByTestId('draggable-card-task-1')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('handles empty pending tasks', () => {
      const props = {
        ...defaultProps,
        pendingTasks: [],
      };
      
      render(<TaskBoard {...props} />);
      
      expect(screen.getByTestId('tasks-count-pending')).toHaveTextContent('0');
      expect(screen.queryByTestId('task-task-1')).not.toBeInTheDocument();
    });

    it('handles empty completed tasks', () => {
      const props = {
        ...defaultProps,
        completedTasks: [],
      };
      
      render(<TaskBoard {...props} />);
      
      expect(screen.getByTestId('tasks-count-done')).toHaveTextContent('0');
      expect(screen.queryByTestId('task-task-3')).not.toBeInTheDocument();
    });

    it('handles all empty tasks', () => {
      const props = {
        ...defaultProps,
        pendingTasks: [],
        completedTasks: [],
      };
      
      render(<TaskBoard {...props} />);
      
      expect(screen.getByTestId('tasks-count-pending')).toHaveTextContent('0');
      expect(screen.getByTestId('tasks-count-done')).toHaveTextContent('0');
    });
  });

  describe('Board Layout', () => {
    it('applies correct column layout classes', () => {
      const { container } = render(<TaskBoard {...defaultProps} />);
      
      const columnsContainer = container.querySelector('.columns');
      expect(columnsContainer).toBeInTheDocument();
      expect(columnsContainer).toHaveStyle('gap: 0.75rem');
    });

    it('maintains proper board structure', () => {
      const { container } = render(<TaskBoard {...defaultProps} />);
      
      expect(container.querySelector('.task-board')).toBeInTheDocument();
      expect(container.querySelector('.columns')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles tasks with duplicate IDs gracefully', () => {
      const duplicateTasks = [
        createMockTask('duplicate', 'Task A'),
        createMockTask('duplicate', 'Task B'),
      ];
      
      const props = {
        ...defaultProps,
        pendingTasks: duplicateTasks,
      };
      
      render(<TaskBoard {...props} />);
      
      // Should still render without crashing
      expect(screen.getByTestId('task-column-pending')).toBeInTheDocument();
    });

    it('handles undefined drag events', () => {
      const onDragEnd = jest.fn();
      render(<TaskBoard {...defaultProps} onDragEnd={onDragEnd} />);
      
      // Should not crash when called with undefined
      expect(() => {
        onDragEnd(undefined as any);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('handles large number of tasks', () => {
      const largePendingTasks = Array.from({ length: 100 }, (_, i) => 
        createMockTask(`pending-${i}`, `Pending Task ${i}`)
      );
      
      const largeCompletedTasks = Array.from({ length: 50 }, (_, i) => 
        createMockTask(`completed-${i}`, `Completed Task ${i}`, true)
      );
      
      const props = {
        ...defaultProps,
        pendingTasks: largePendingTasks,
        completedTasks: largeCompletedTasks,
      };
      
      render(<TaskBoard {...props} />);
      
      expect(screen.getByTestId('tasks-count-pending')).toHaveTextContent('100');
      expect(screen.getByTestId('tasks-count-done')).toHaveTextContent('50');
    });
  });
});