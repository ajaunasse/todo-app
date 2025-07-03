import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../Card';

// Mock the atoms
jest.mock('../../atoms', () => ({
  Title: ({ children, level }: any) => <h1 data-level={level}>{children}</h1>,
  Text: ({ children, color }: any) => <p data-color={color}>{children}</p>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('renders card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders empty card', () => {
      const { container } = render(<Card />);
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      expect(container.querySelector('.card')).toHaveClass('custom-card');
    });

    it('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '20px' };
      const { container } = render(<Card style={customStyle}>Content</Card>);
      const card = container.querySelector('.card');
      expect(card).toHaveStyle('background-color: red');
      expect(card).toHaveStyle('padding: 20px');
    });
  });

  describe('Header', () => {
    it('renders custom header', () => {
      const customHeader = <div>Custom Header</div>;
      render(<Card header={customHeader}>Content</Card>);
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('renders title in header', () => {
      render(<Card title="Card Title">Content</Card>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders header actions', () => {
      const actions = [
        { children: 'Action 1', onClick: jest.fn() },
        { children: 'Action 2', onClick: jest.fn() },
      ];
      render(<Card title="Title" headerActions={actions}>Content</Card>);
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    it('does not render header when no header props provided', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.querySelector('.card-header')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('renders content with subtitle', () => {
      render(<Card subtitle="Card subtitle">Main content</Card>);
      expect(screen.getByText('Card subtitle')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('renders content without subtitle', () => {
      render(<Card>Just content</Card>);
      expect(screen.getByText('Just content')).toBeInTheDocument();
    });

    it('does not render content section when no children or subtitle', () => {
      const { container } = render(<Card title="Only title" />);
      expect(container.querySelector('.card-content')).not.toBeInTheDocument();
    });
  });

  describe('Image', () => {
    it('renders image when provided', () => {
      render(<Card image="/test-image.jpg" imageAlt="Test image">Content</Card>);
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('uses empty alt text when not provided', () => {
      const { container } = render(<Card image="/test.jpg">Content</Card>);
      const image = container.querySelector('img');
      expect(image).toHaveAttribute('alt', '');
    });

    it('does not render image section when no image', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.querySelector('.card-image')).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders custom footer', () => {
      const customFooter = <div>Custom Footer</div>;
      render(<Card footer={customFooter}>Content</Card>);
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('renders footer actions', () => {
      const actions = [
        { children: 'Save', onClick: jest.fn() },
        { children: 'Cancel', onClick: jest.fn() },
      ];
      render(<Card footerActions={actions}>Content</Card>);
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('does not render footer when no footer props provided', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.querySelector('.card-footer')).not.toBeInTheDocument();
    });
  });

  describe('Border Styling', () => {
    it('applies border color and width', () => {
      const { container } = render(
        <Card borderColor="primary" borderWidth={2}>Content</Card>
      );
      const card = container.querySelector('.card');
      expect(card).toHaveStyle('border: 2px solid #3273dc');
      expect(card).toHaveStyle('border-left: 4px solid #3273dc');
    });

    it('applies different border colors', () => {
      const colors = {
        success: '#48c774',
        danger: '#ff3860',
        warning: '#ffdd57',
        info: '#3298dc',
      };

      Object.entries(colors).forEach(([color, hex]) => {
        const { container } = render(
          <Card borderColor={color as any} borderWidth={1}>Content</Card>
        );
        const card = container.querySelector('.card');
        expect(card).toHaveStyle(`border: 1px solid ${hex}`);
      });
    });

    it('does not apply warning left border double width', () => {
      const { container } = render(
        <Card borderColor="warning" borderWidth={2}>Content</Card>
      );
      const card = container.querySelector('.card');
      expect(card).toHaveStyle('border: 2px solid #ffdd57');
      expect(card).not.toHaveStyle('border-left: 4px solid #ffdd57');
    });
  });

  describe('Interactive Features', () => {
    it('applies hoverable class', () => {
      const { container } = render(<Card hoverable>Content</Card>);
      expect(container.querySelector('.card')).toHaveClass('is-hoverable');
    });

    it('applies clickable class and handles click', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card clickable onClick={handleClick}>Content</Card>
      );
      
      const card = container.querySelector('.card');
      expect(card).toHaveClass('is-clickable');
      
      fireEvent.click(card!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not handle click when not clickable', () => {
      const handleClick = jest.fn();
      const { container } = render(<Card onClick={handleClick}>Content</Card>);
      
      const card = container.querySelector('.card');
      expect(card).not.toHaveClass('is-clickable');
      
      fireEvent.click(card!);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Complex Card', () => {
    it('renders complete card with all features', () => {
      const headerActions = [{ children: 'Edit', onClick: jest.fn() }];
      const footerActions = [
        { children: 'Save', onClick: jest.fn() },
        { children: 'Delete', onClick: jest.fn() },
      ];
      
      const { container } = render(
        <Card
          title="Complete Card"
          subtitle="With all features"
          image="/test.jpg"
          imageAlt="Test"
          headerActions={headerActions}
          footerActions={footerActions}
          borderColor="success"
          borderWidth={3}
          hoverable
          clickable
          onClick={jest.fn()}
          className="feature-card"
        >
          Card body content
        </Card>
      );

      // Check structure
      expect(container.querySelector('.card-header')).toBeInTheDocument();
      expect(container.querySelector('.card-image')).toBeInTheDocument();
      expect(container.querySelector('.card-content')).toBeInTheDocument();
      expect(container.querySelector('.card-footer')).toBeInTheDocument();

      // Check content
      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('With all features')).toBeInTheDocument();
      expect(screen.getByText('Card body content')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();

      // Check classes and styles
      const card = container.querySelector('.card');
      expect(card).toHaveClass('is-hoverable', 'is-clickable', 'feature-card');
      expect(card).toHaveStyle('border: 3px solid #48c774');
    });
  });

  describe('Header Actions Structure', () => {
    it('renders header actions in correct container', () => {
      const actions = [{ children: 'Action', onClick: jest.fn() }];
      const { container } = render(
        <Card title="Title" headerActions={actions}>Content</Card>
      );
      
      const headerIcon = container.querySelector('.card-header-icon');
      expect(headerIcon).toBeInTheDocument();
      expect(headerIcon?.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Footer Actions Structure', () => {
    it('renders footer actions in correct containers', () => {
      const actions = [
        { children: 'First', onClick: jest.fn() },
        { children: 'Second', onClick: jest.fn() },
      ];
      const { container } = render(<Card footerActions={actions}>Content</Card>);
      
      const footerItems = container.querySelectorAll('.card-footer-item');
      expect(footerItems).toHaveLength(2);
      expect(footerItems[0].querySelector('button')).toHaveTextContent('First');
      expect(footerItems[1].querySelector('button')).toHaveTextContent('Second');
    });
  });
});