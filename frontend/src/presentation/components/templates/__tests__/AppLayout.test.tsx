import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppLayout } from '../AppLayout';

// Mock the organisms
jest.mock('../../organisms', () => ({
  AppHeader: ({ title, subtitle, totalTasks, pendingTasks, completedTasks, actions }: any) => (
    <header data-testid="app-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <div data-testid="task-stats">
        <span>Total: {totalTasks}</span>
        <span>Pending: {pendingTasks}</span>
        <span>Completed: {completedTasks}</span>
      </div>
      {actions && <div data-testid="header-actions">{actions}</div>}
    </header>
  ),
}));

describe('AppLayout Integration Tests', () => {
  const defaultHeaderProps = {
    title: 'Test App',
    subtitle: 'Test Layout',
    totalTasks: 10,
    pendingTasks: 6,
    completedTasks: 4,
  };

  describe('Basic Layout Structure', () => {
    it('renders complete layout with header and content', () => {
      render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div data-testid="main-content">Content Area</div>
        </AppLayout>
      );

      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Test App')).toBeInTheDocument();
      expect(screen.getByText('Content Area')).toBeInTheDocument();
    });

    it('applies correct layout structure classes', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      // Check layout structure
      expect(container.querySelector('.app-layout')).toBeInTheDocument();
      expect(container.querySelector('.hero')).toBeInTheDocument();
      expect(container.querySelector('.hero-head')).toBeInTheDocument();
      expect(container.querySelector('.hero-body')).toBeInTheDocument();
      expect(container.querySelector('.container.is-fluid')).toBeInTheDocument();
    });

    it('passes header props correctly to AppHeader', () => {
      render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Test App')).toBeInTheDocument();
      expect(screen.getByText('Test Layout')).toBeInTheDocument();
      
      const stats = screen.getByTestId('task-stats');
      expect(stats).toHaveTextContent('Total: 10');
      expect(stats).toHaveTextContent('Pending: 6');
      expect(stats).toHaveTextContent('Completed: 4');
    });
  });

  describe('Full Height Layout', () => {
    it('applies fullheight classes by default', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      expect(container.querySelector('.app-layout')).toHaveClass('is-fullheight');
      expect(container.querySelector('.hero')).toHaveClass('is-fullheight');
    });

    it('applies fullheight classes when explicitly enabled', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps} fullHeight={true}>
          <div>Content</div>
        </AppLayout>
      );

      expect(container.querySelector('.app-layout')).toHaveClass('is-fullheight');
      expect(container.querySelector('.hero')).toHaveClass('is-fullheight');
    });

    it('does not apply fullheight classes when disabled', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps} fullHeight={false}>
          <div>Content</div>
        </AppLayout>
      );

      expect(container.querySelector('.app-layout')).not.toHaveClass('is-fullheight');
      expect(container.querySelector('.hero')).not.toHaveClass('is-fullheight');
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct hero styling', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      const hero = container.querySelector('.hero');
      expect(hero).toHaveClass('is-light');
    });

    it('applies correct hero-body styling', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      const heroBody = container.querySelector('.hero-body');
      expect(heroBody).toHaveStyle('padding-top: 1rem');
      expect(heroBody).toHaveStyle('padding-bottom: 1rem');
    });

    it('applies correct container styling', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      const fluidContainer = container.querySelector('.container.is-fluid');
      expect(fluidContainer).toHaveStyle('padding: 0 0.75rem');
    });

    it('applies custom className', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps} className="custom-layout">
          <div>Content</div>
        </AppLayout>
      );

      expect(container.querySelector('.app-layout')).toHaveClass('custom-layout');
    });
  });

  describe('Header Integration', () => {
    it('integrates with header actions', () => {
      const headerActions = (
        <div>
          <button>Settings</button>
          <button>Help</button>
        </div>
      );

      const headerPropsWithActions = {
        ...defaultHeaderProps,
        actions: headerActions,
      };

      render(
        <AppLayout headerProps={headerPropsWithActions}>
          <div>Content</div>
        </AppLayout>
      );

      const actions = screen.getByTestId('header-actions');
      expect(actions).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    it('handles header without subtitle', () => {
      const minimalHeaderProps = {
        title: 'Minimal App',
      };

      render(
        <AppLayout headerProps={minimalHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Minimal App')).toBeInTheDocument();
      expect(screen.queryByText('Test Layout')).not.toBeInTheDocument();
    });

    it('handles zero task counts in header', () => {
      const zeroTasksProps = {
        title: 'Empty App',
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
      };

      render(
        <AppLayout headerProps={zeroTasksProps}>
          <div>Content</div>
        </AppLayout>
      );

      const stats = screen.getByTestId('task-stats');
      expect(stats).toHaveTextContent('Total: 0');
      expect(stats).toHaveTextContent('Pending: 0');
      expect(stats).toHaveTextContent('Completed: 0');
    });
  });

  describe('Content Area Integration', () => {
    it('renders simple text content', () => {
      render(
        <AppLayout headerProps={defaultHeaderProps}>
          Simple text content
        </AppLayout>
      );

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('renders complex JSX content', () => {
      const complexContent = (
        <div>
          <h2>Dashboard</h2>
          <div className="columns">
            <div className="column">
              <p>Left column content</p>
            </div>
            <div className="column">
              <p>Right column content</p>
            </div>
          </div>
          <footer>Footer content</footer>
        </div>
      );

      render(
        <AppLayout headerProps={defaultHeaderProps}>
          {complexContent}
        </AppLayout>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Left column content')).toBeInTheDocument();
      expect(screen.getByText('Right column content')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders multiple child elements', () => {
      render(
        <AppLayout headerProps={defaultHeaderProps}>
          <section data-testid="section-1">Section 1</section>
          <section data-testid="section-2">Section 2</section>
          <aside data-testid="sidebar">Sidebar</aside>
        </AppLayout>
      );

      expect(screen.getByTestId('section-1')).toBeInTheDocument();
      expect(screen.getByTestId('section-2')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('handles empty content', () => {
      render(
        <AppLayout headerProps={defaultHeaderProps}>
          {null}
        </AppLayout>
      );

      // Should render without crashing
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('maintains structure across different viewport sizes', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div className="responsive-content">Responsive Content</div>
        </AppLayout>
      );

      // Check that fluid container allows responsiveness
      expect(container.querySelector('.container.is-fluid')).toBeInTheDocument();
      expect(screen.getByText('Responsive Content')).toBeInTheDocument();
    });

    it('preserves layout structure for mobile content', () => {
      const mobileContent = (
        <div className="mobile-layout">
          <div className="mobile-header">Mobile Header</div>
          <div className="mobile-body">Mobile Body</div>
        </div>
      );

      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          {mobileContent}
        </AppLayout>
      );

      expect(container.querySelector('.hero-body')).toBeInTheDocument();
      expect(screen.getByText('Mobile Header')).toBeInTheDocument();
      expect(screen.getByText('Mobile Body')).toBeInTheDocument();
    });
  });

  describe('Layout Performance', () => {
    it('renders efficiently with large content', () => {
      const largeContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} data-testid={`item-${i}`}>
              Item {i}
            </div>
          ))}
        </div>
      );

      render(
        <AppLayout headerProps={defaultHeaderProps}>
          {largeContent}
        </AppLayout>
      );

      // Should render without performance issues
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-99')).toBeInTheDocument();
    });

    it('handles dynamic header updates', () => {
      const { rerender } = render(
        <AppLayout headerProps={defaultHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      const updatedHeaderProps = {
        ...defaultHeaderProps,
        title: 'Updated App',
        totalTasks: 20,
      };

      rerender(
        <AppLayout headerProps={updatedHeaderProps}>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Updated App')).toBeInTheDocument();
      expect(screen.getByText('Total: 20')).toBeInTheDocument();
    });
  });

  describe('Integration Edge Cases', () => {
    it('handles header props with missing optional fields', () => {
      const minimalProps = {
        title: 'Minimal',
        // Missing subtitle, task counts, actions
      };

      render(
        <AppLayout headerProps={minimalProps}>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(
        <AppLayout headerProps={defaultHeaderProps}>
          {undefined}
        </AppLayout>
      );

      expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });

    it('preserves layout with conditional content', () => {
      const showContent = true;

      render(
        <AppLayout headerProps={defaultHeaderProps}>
          {showContent && <div data-testid="conditional">Conditional Content</div>}
          {!showContent && <div data-testid="fallback">Fallback Content</div>}
        </AppLayout>
      );

      expect(screen.getByTestId('conditional')).toBeInTheDocument();
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    });
  });

  describe('Class Generation Integration', () => {
    it('combines classes correctly', () => {
      const { container } = render(
        <AppLayout 
          headerProps={defaultHeaderProps}
          fullHeight={true}
          className="custom-app extra-class"
        >
          <div>Content</div>
        </AppLayout>
      );

      const layout = container.querySelector('.app-layout');
      expect(layout).toHaveClass('app-layout', 'is-fullheight', 'custom-app', 'extra-class');
    });

    it('handles empty className gracefully', () => {
      const { container } = render(
        <AppLayout headerProps={defaultHeaderProps} className="">
          <div>Content</div>
        </AppLayout>
      );

      const layout = container.querySelector('.app-layout');
      expect(layout).toHaveClass('app-layout', 'is-fullheight');
      expect(layout?.className).not.toContain('undefined');
    });
  });
});