import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppHeader } from '../AppHeader';

// Mock the atoms
jest.mock('../../atoms', () => ({
  Title: ({ children, level, color, className }: any) => (
    <h1 data-level={level} data-color={color} className={className}>
      {children}
    </h1>
  ),
  Icon: ({ name, color, className }: any) => (
    <span data-testid="icon" data-name={name} data-color={color} className={className} />
  ),
  Tag: ({ children, color, light, className }: any) => (
    <span 
      data-testid="tag" 
      data-color={color} 
      data-light={light} 
      className={className}
    >
      {children}
    </span>
  ),
}));

describe('AppHeader Component', () => {
  const defaultProps = {
    title: 'Task Manager',
  };

  describe('Basic Rendering', () => {
    it('renders header with title', () => {
      render(<AppHeader {...defaultProps} />);
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });

    it('renders as navigation element', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('role', 'navigation');
    });

    it('applies default classes', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('navbar', 'is-white');
    });

    it('applies custom className', () => {
      const { container } = render(<AppHeader {...defaultProps} className="custom-header" />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('navbar', 'is-white', 'custom-header');
    });
  });

  describe('Title Section', () => {
    it('renders title with icon', () => {
      render(<AppHeader {...defaultProps} />);
      
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
      const icons = screen.getAllByTestId('icon');
      const tasksIcon = icons.find(icon => icon.getAttribute('data-name') === 'tasks');
      expect(tasksIcon).toHaveAttribute('data-name', 'tasks');
      expect(tasksIcon).toHaveAttribute('data-color', 'black');
    });

    it('renders title with correct properties', () => {
      render(<AppHeader {...defaultProps} />);
      
      const title = screen.getByText('Task Manager');
      expect(title).toHaveAttribute('data-level', '4');
      expect(title).toHaveAttribute('data-color', 'black');
      expect(title).toHaveClass('ml-2', 'mb-0');
    });

    it('renders subtitle when provided', () => {
      render(<AppHeader {...defaultProps} subtitle="Manage your daily tasks" />);
      expect(screen.getByText('Manage your daily tasks')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<AppHeader {...defaultProps} />);
      expect(screen.queryByText(/Manage your/)).not.toBeInTheDocument();
    });

    it('applies correct styling to subtitle', () => {
      render(<AppHeader {...defaultProps} subtitle="Test subtitle" />);
      const subtitle = screen.getByText('Test subtitle');
      expect(subtitle).toHaveClass('has-text-grey', 'mt-1');
      expect(subtitle.tagName).toBe('P');
    });
  });

  describe('Brand Section', () => {
    it('renders total tasks counter', () => {
      render(<AppHeader {...defaultProps} totalTasks={5} />);
      
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('defaults to 0 total tasks', () => {
      render(<AppHeader {...defaultProps} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders total counter with correct tag colors', () => {
      render(<AppHeader {...defaultProps} totalTasks={10} />);
      
      const tags = screen.getAllByTestId('tag');
      const totalLabel = tags.find(tag => tag.textContent === 'Total');
      const totalCount = tags.find(tag => tag.textContent === '10');
      
      expect(totalLabel).toHaveAttribute('data-color', 'light');
      expect(totalCount).toHaveAttribute('data-color', 'primary');
    });
  });

  describe('Stats Section', () => {
    it('renders pending tasks count', () => {
      render(<AppHeader {...defaultProps} pendingTasks={3} />);
      expect(screen.getByText('3 Pending')).toBeInTheDocument();
    });

    it('renders completed tasks count', () => {
      render(<AppHeader {...defaultProps} completedTasks={7} />);
      expect(screen.getByText('7 Done')).toBeInTheDocument();
    });

    it('defaults to 0 for pending and completed tasks', () => {
      render(<AppHeader {...defaultProps} />);
      expect(screen.getByText('0 Pending')).toBeInTheDocument();
      expect(screen.getByText('0 Done')).toBeInTheDocument();
    });

    it('renders stats with correct tag colors', () => {
      render(<AppHeader {...defaultProps} pendingTasks={2} completedTasks={5} />);
      
      const tags = screen.getAllByTestId('tag');
      const pendingTag = tags.find(tag => tag.textContent?.includes('Pending'));
      const doneTag = tags.find(tag => tag.textContent?.includes('Done'));
      
      expect(pendingTag).toHaveAttribute('data-color', 'info');
      expect(pendingTag).toHaveAttribute('data-light', 'true');
      expect(doneTag).toHaveAttribute('data-color', 'success');
      expect(doneTag).toHaveAttribute('data-light', 'true');
    });

    it('renders stats with icons', () => {
      render(<AppHeader {...defaultProps} pendingTasks={1} completedTasks={2} />);
      
      const icons = screen.getAllByTestId('icon');
      const clockIcon = icons.find(icon => icon.getAttribute('data-name') === 'clock');
      const checkIcon = icons.find(icon => icon.getAttribute('data-name') === 'check-circle');
      
      expect(clockIcon).toBeInTheDocument();
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('Actions Section', () => {
    it('renders custom actions when provided', () => {
      const actions = <button>Custom Action</button>;
      render(<AppHeader {...defaultProps} actions={actions} />);
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('does not render actions section when not provided', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const actionButtons = container.querySelectorAll('.navbar-item button');
      expect(actionButtons).toHaveLength(0);
    });

    it('renders multiple actions', () => {
      const actions = (
        <>
          <button>Action 1</button>
          <button>Action 2</button>
        </>
      );
      render(<AppHeader {...defaultProps} actions={actions} />);
      
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });
  });

  describe('Complete Header', () => {
    it('renders complete header with all props', () => {
      const actions = <button>Settings</button>;
      
      render(
        <AppHeader
          title="Complete App"
          subtitle="Full featured header"
          totalTasks={15}
          pendingTasks={8}
          completedTasks={7}
          actions={actions}
          className="complete-header"
        />
      );

      // Check all content is rendered
      expect(screen.getByText('Complete App')).toBeInTheDocument();
      expect(screen.getByText('Full featured header')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('8 Pending')).toBeInTheDocument();
      expect(screen.getByText('7 Done')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();

      // Check structure
      const { container } = render(
        <AppHeader
          title="Complete App"
          subtitle="Full featured header"
          totalTasks={15}
          pendingTasks={8}
          completedTasks={7}
          actions={actions}
          className="complete-header"
        />
      );
      
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('complete-header');
    });
  });

  describe('Structure and Layout', () => {
    it('has correct navbar structure', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      
      expect(container.querySelector('.navbar-brand')).toBeInTheDocument();
      expect(container.querySelector('.navbar-menu')).toBeInTheDocument();
      expect(container.querySelector('.navbar-start')).toBeInTheDocument();
      expect(container.querySelector('.navbar-end')).toBeInTheDocument();
    });

    it('applies border styling', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveStyle('border-bottom: 1px solid #e8e8e8');
    });

    it('centers title section content', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const titleContainer = container.querySelector('.has-text-centered');
      expect(titleContainer).toBeInTheDocument();
    });

    it('uses icon-text layout for title', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const iconText = container.querySelector('.icon-text');
      expect(iconText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      const { container } = render(<AppHeader {...defaultProps} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('role', 'navigation');
    });

    it('provides meaningful text content', () => {
      render(
        <AppHeader
          title="My Tasks"
          pendingTasks={3}
          completedTasks={5}
          totalTasks={8}
        />
      );

      expect(screen.getByText('My Tasks')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('3 Pending')).toBeInTheDocument();
      expect(screen.getByText('5 Done')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero task counts', () => {
      render(
        <AppHeader
          title="Empty State"
          totalTasks={0}
          pendingTasks={0}
          completedTasks={0}
        />
      );

      expect(screen.getAllByText('0')).toHaveLength(1); // Only total shows
      expect(screen.getByText('0 Pending')).toBeInTheDocument();
      expect(screen.getByText('0 Done')).toBeInTheDocument();
    });

    it('handles large task counts', () => {
      render(
        <AppHeader
          title="Large Numbers"
          totalTasks={9999}
          pendingTasks={5000}
          completedTasks={4999}
        />
      );

      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('5000 Pending')).toBeInTheDocument();
      expect(screen.getByText('4999 Done')).toBeInTheDocument();
    });

    it('handles empty title gracefully', () => {
      render(<AppHeader title="" />);
      // Check that the header renders without breaking
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});