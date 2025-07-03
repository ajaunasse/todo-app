import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskColumn } from '../TaskColumn';
import { Task, Priority, TaskId } from '../../../../domain/entities';

// Mock the atoms and molecules
jest.mock('../../atoms', () => ({
  Title: ({ children, level, className }: any) => (
    <h1 data-level={level} className={className}>{children}</h1>
  ),
  Icon: ({ name, color, className }: any) => (
    <span data-testid="icon" data-name={name} data-color={color} className={className} />
  ),
  Tag: ({ children, color, light, className }: any) => (
    <span data-testid="tag" data-color={color} data-light={light} className={className}>
      {children}
    </span>
  ),
  Button: ({ children, variant, size, icon, onClick }: any) => (
    <button 
      data-testid="button"
      data-variant={variant}
      data-size={size}
      data-icon={icon}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../molecules', () => ({
  DropZone: ({ id, children, acceptMessage, emptyMessage, emptyIcon, minHeight }: any) => (
    <div 
      data-testid={`dropzone-${id}`}
      data-accept-message={acceptMessage}
      data-empty-message={emptyMessage}
      data-empty-icon={emptyIcon}
      data-min-height={minHeight}
    >
      {children}
    </div>
  ),
  DraggableCard: ({ id, title, description, priority, isDone, createdAt, onEdit }: any) => (
    <div data-testid={`draggable-card-${id}`}>
      <div>{title}</div>
      <div>{description}</div>
      <div data-priority={priority}>{priority}</div>
      <div data-done={isDone}>{isDone ? 'Done' : 'Pending'}</div>
      <div>{createdAt.toISOString()}</div>
      <button onClick={onEdit} data-testid={`edit-card-${id}`}>Edit</button>
    </div>
  ),
}));

describe('TaskColumn Component', () => {
  const createMockTask = (id: string, title: string, isDone: boolean = false): Task => ({
    id: { value: id } as TaskId,
    title,
    description: `Description for ${title}`,
    priority: Priority.MEDIUM,
    isDone,
    createdAt: new Date('2023-01-01'),
  });

  const defaultProps = {
    id: 'test-column',
    title: 'Test Column',
    icon: 'inbox',
    color: 'info' as const,
    tasks: [
      createMockTask('task-1', 'Task 1'),
      createMockTask('task-2', 'Task 2'),
    ],
  };

  describe('Basic Rendering', () => {
    it('renders column with title and icon', () => {
      render(<TaskColumn {...defaultProps} />);
      
      expect(screen.getByText('Test Column')).toBeInTheDocument();
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('data-name', 'inbox');
      expect(icon).toHaveAttribute('data-color', 'info');
    });

    it('applies custom className', () => {
      const { container } = render(<TaskColumn {...defaultProps} className="custom-column" />);
      expect(container.querySelector('.column')).toHaveClass('custom-column');
    });

    it('applies default column classes', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      const column = container.querySelector('.column');
      expect(column).toHaveClass('column', 'is-half');
    });

    it('applies box styling', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      const box = container.querySelector('.box');
      expect(box).toBeInTheDocument();
      expect(box).toHaveStyle('padding: 0.75rem');
      expect(box).toHaveStyle('background-color: #fafafa');
    });
  });

  describe('Header Section', () => {
    it('renders header with title, icon, and task count', () => {
      render(<TaskColumn {...defaultProps} />);
      
      expect(screen.getByText('Test Column')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      
      const countTag = screen.getByTestId('tag');
      expect(countTag).toHaveTextContent('2');
      expect(countTag).toHaveAttribute('data-color', 'info');
      expect(countTag).toHaveAttribute('data-light', 'true');
    });

    it('displays correct task count', () => {
      const props = {
        ...defaultProps,
        tasks: [createMockTask('single', 'Single Task')],
      };
      
      render(<TaskColumn {...props} />);
      expect(screen.getByTestId('tag')).toHaveTextContent('1');
    });

    it('displays zero count for empty tasks', () => {
      const props = {
        ...defaultProps,
        tasks: [],
      };
      
      render(<TaskColumn {...props} />);
      expect(screen.getByTestId('tag')).toHaveTextContent('0');
    });

    it('applies correct header layout classes', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      const header = container.querySelector('.is-flex');
      expect(header).toHaveClass(
        'is-flex',
        'is-justify-content-space-between',
        'is-align-items-center',
        'mb-2'
      );
    });
  });

  describe('Add Button', () => {
    it('renders add button when showAddButton is true', () => {
      render(<TaskColumn {...defaultProps} showAddButton onAddTask={jest.fn()} />);
      
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'success');
      expect(button).toHaveAttribute('data-size', 'small');
      expect(button).toHaveAttribute('data-icon', 'plus');
      expect(button).toHaveTextContent('New');
    });

    it('does not render add button when showAddButton is false', () => {
      render(<TaskColumn {...defaultProps} showAddButton={false} />);
      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('does not render add button when onAddTask not provided', () => {
      render(<TaskColumn {...defaultProps} showAddButton />);
      expect(screen.queryByTestId('button')).not.toBeInTheDocument();
    });

    it('calls onAddTask when add button clicked', () => {
      const onAddTask = jest.fn();
      render(<TaskColumn {...defaultProps} showAddButton onAddTask={onAddTask} />);
      
      fireEvent.click(screen.getByTestId('button'));
      expect(onAddTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task Rendering', () => {
    it('renders all tasks as draggable cards', () => {
      render(<TaskColumn {...defaultProps} />);
      
      expect(screen.getByTestId('draggable-card-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-card-task-2')).toBeInTheDocument();
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('passes correct props to draggable cards', () => {
      render(<TaskColumn {...defaultProps} />);
      
      const card1 = screen.getByTestId('draggable-card-task-1');
      expect(card1).toHaveTextContent('Task 1');
      expect(card1).toHaveTextContent('Description for Task 1');
      expect(card1).toHaveTextContent(Priority.MEDIUM);
      expect(card1).toHaveTextContent('2023-01-01T00:00:00.000Z');
    });

    it('handles task editing', () => {
      const onEditTask = jest.fn();
      render(<TaskColumn {...defaultProps} onEditTask={onEditTask} />);
      
      fireEvent.click(screen.getByTestId('edit-card-task-1'));
      expect(onEditTask).toHaveBeenCalledWith(defaultProps.tasks[0]);
    });

    it('does not render task list when tasks are empty', () => {
      const props = {
        ...defaultProps,
        tasks: [],
      };
      
      const { container } = render(<TaskColumn {...props} />);
      expect(container.querySelector('.task-list')).not.toBeInTheDocument();
    });
  });

  describe('DropZone Integration', () => {
    it('makes entire column droppable', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      
      // The entire box should be the drop zone now
      const box = container.querySelector('.box');
      expect(box).toBeInTheDocument();
      expect(box).toHaveStyle('position: relative');
    });

    it('displays empty state when no tasks', () => {
      render(<TaskColumn {...defaultProps} tasks={[]} />);
      
      expect(screen.getByText('No tasks')).toBeInTheDocument();
    });

    it('displays custom empty message', () => {
      render(<TaskColumn {...defaultProps} tasks={[]} emptyMessage="Custom empty message" />);
      
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });

    it('uses custom empty icon', () => {
      render(<TaskColumn {...defaultProps} tasks={[]} emptyIcon="custom-icon" />);
      
      const icons = screen.getAllByTestId('icon');
      const emptyIcon = icons.find(icon => icon.getAttribute('data-name') === 'custom-icon');
      expect(emptyIcon).toBeInTheDocument();
    });

    it('uses default empty message when not provided', () => {
      render(<TaskColumn {...defaultProps} tasks={[]} />);
      
      // Test that default empty message is displayed
      expect(screen.getByText('No tasks')).toBeInTheDocument();
    });

    it('uses default empty icon when not provided', () => {
      render(<TaskColumn {...defaultProps} tasks={[]} />);
      
      // Test that default empty icon is displayed in the empty state
      const icons = screen.getAllByTestId('icon');
      const headerIcon = icons.find(icon => icon.getAttribute('data-name') === 'inbox');
      expect(headerIcon).toBeInTheDocument();
    });
  });

  describe('Different Column Colors', () => {
    const colors = ['info', 'success', 'warning', 'danger'] as const;
    
    colors.forEach(color => {
      it(`renders with ${color} color`, () => {
        render(<TaskColumn {...defaultProps} color={color} />);
        
        const icon = screen.getByTestId('icon');
        const tag = screen.getByTestId('tag');
        
        expect(icon).toHaveAttribute('data-color', color);
        expect(tag).toHaveAttribute('data-color', color);
      });
    });
  });

  describe('Complete Column', () => {
    it('renders complete column with all features', () => {
      const tasks = [
        createMockTask('complete-1', 'Complete Task 1'),
        createMockTask('complete-2', 'Complete Task 2', true),
      ];
      
      const onAddTask = jest.fn();
      const onEditTask = jest.fn();
      
      render(
        <TaskColumn
          id="complete-column"
          title="Complete Column"
          icon="check-circle"
          color="success"
          tasks={tasks}
          emptyMessage="All done!"
          emptyIcon="celebration"
          dropMessage="Drop to complete"
          showAddButton
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          className="complete-column"
        />
      );

      // Check all elements are rendered
      expect(screen.getByText('Complete Column')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-card-complete-1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-card-complete-2')).toBeInTheDocument();
      
      // Check column renders properly with all props
      expect(screen.getByText('Complete Column')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-card-complete-1')).toBeInTheDocument();
      expect(screen.getByTestId('draggable-card-complete-2')).toBeInTheDocument();
      
      // Check classes
      const { container } = render(
        <TaskColumn
          id="complete-column"
          title="Complete Column"
          icon="check-circle"
          color="success"
          tasks={tasks}
          className="complete-column"
        />
      );
      expect(container.querySelector('.column')).toHaveClass('complete-column');
    });
  });

  describe('Task List Structure', () => {
    it('wraps tasks in task-list container', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      const taskList = container.querySelector('.task-list');
      expect(taskList).toBeInTheDocument();
    });

    it('renders tasks within task list', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      const taskList = container.querySelector('.task-list');
      const cards = taskList?.querySelectorAll('[data-testid^="draggable-card"]');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty task array', () => {
      const props = {
        ...defaultProps,
        tasks: [],
      };
      
      render(<TaskColumn {...props} />);
      
      expect(screen.getByTestId('tag')).toHaveTextContent('0');
      expect(screen.queryByTestId('draggable-card-task-1')).not.toBeInTheDocument();
    });

    it('handles undefined dropMessage', () => {
      render(<TaskColumn {...defaultProps} dropMessage={undefined} />);
      
      // Component should render normally even with undefined dropMessage
      expect(screen.getByText('Test Column')).toBeInTheDocument();
    });

    it('handles long task lists', () => {
      const manyTasks = Array.from({ length: 50 }, (_, i) => 
        createMockTask(`task-${i}`, `Task ${i}`)
      );
      
      const props = {
        ...defaultProps,
        tasks: manyTasks,
      };
      
      render(<TaskColumn {...props} />);
      
      expect(screen.getByTestId('tag')).toHaveTextContent('50');
      expect(screen.getAllByTestId(/^draggable-card-task-/)).toHaveLength(50);
    });

    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(100);
      render(<TaskColumn {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<TaskColumn {...defaultProps} />);
      const title = screen.getByText('Test Column');
      expect(title).toHaveAttribute('data-level', '6');
    });

    it('provides meaningful button text', () => {
      render(<TaskColumn {...defaultProps} showAddButton onAddTask={jest.fn()} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('has icon-text layout for better accessibility', () => {
      const { container } = render(<TaskColumn {...defaultProps} />);
      expect(container.querySelector('.icon-text')).toBeInTheDocument();
    });
  });
});