import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tag } from '../Tag';

// Mock FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="icon" data-icon={icon} />
  ),
}));

describe('Tag Component', () => {
  describe('Basic Rendering', () => {
    it('renders tag with children text', () => {
      render(<Tag>Test Tag</Tag>);
      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('renders tag with JSX children', () => {
      render(<Tag><strong>Bold Tag</strong></Tag>);
      expect(screen.getByText('Bold Tag')).toBeInTheDocument();
      expect(screen.getByRole('strong')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Tag className="custom-class">Tag</Tag>);
      expect(screen.getByText('Tag').parentElement).toHaveClass('custom-class');
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'info', 'success', 'warning', 'danger', 'dark', 'light'];
    
    colors.forEach(color => {
      it(`renders ${color} color`, () => {
        render(<Tag color={color as any}>Tag</Tag>);
        expect(screen.getByText('Tag').parentElement).toHaveClass(`is-${color}`);
      });
    });

    it('renders without color class when no color specified', () => {
      render(<Tag>Tag</Tag>);
      const tag = screen.getByText('Tag').parentElement;
      expect(tag).toHaveClass('tag');
      expect(tag).not.toHaveClass('is-primary', 'is-info', 'is-success');
    });
  });

  describe('Sizes', () => {
    const sizes = ['medium', 'large'];
    
    sizes.forEach(size => {
      it(`renders ${size} size`, () => {
        render(<Tag size={size as any}>Tag</Tag>);
        expect(screen.getByText('Tag').parentElement).toHaveClass(`is-${size}`);
      });
    });

    it('does not add size class for normal size', () => {
      render(<Tag size="normal">Tag</Tag>);
      const tag = screen.getByText('Tag').parentElement;
      expect(tag).not.toHaveClass('is-normal');
      expect(tag).toHaveClass('tag');
    });
  });

  describe('Modifiers', () => {
    it('renders light variant', () => {
      render(<Tag light>Tag</Tag>);
      expect(screen.getByText('Tag').parentElement).toHaveClass('is-light');
    });

    it('renders rounded tag', () => {
      render(<Tag rounded>Tag</Tag>);
      expect(screen.getByText('Tag').parentElement).toHaveClass('is-rounded');
    });

    it('combines modifiers correctly', () => {
      render(<Tag color="success" size="large" light rounded>Tag</Tag>);
      const tag = screen.getByText('Tag').parentElement;
      expect(tag).toHaveClass('tag', 'is-success', 'is-large', 'is-light', 'is-rounded');
    });
  });

  describe('Icons', () => {
    it('renders tag with icon', () => {
      render(<Tag icon="star">Star Tag</Tag>);
      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'star');
      expect(screen.getByText('Star Tag')).toBeInTheDocument();
    });

    it('renders tag with icon and no text', () => {
      render(<Tag icon="check"></Tag>);
      expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'check');
    });

    it('positions icon before text', () => {
      const { container } = render(<Tag icon="user">User</Tag>);
      const tag = container.querySelector('.tag');
      const icon = tag?.querySelector('.icon');
      
      expect(icon).toBeInTheDocument();
      expect(tag).toHaveTextContent('User');
      // Icon should be the first child element
      expect(tag?.firstElementChild).toBe(icon);
      // Tag should have both icon and text content
      expect(tag?.children.length).toBeGreaterThan(1);
    });
  });

  describe('Deletable Tags', () => {
    it('renders delete button when deletable', () => {
      const handleDelete = jest.fn();
      render(<Tag deletable onDelete={handleDelete}>Deletable</Tag>);
      
      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('delete', 'is-small');
    });

    it('calls onDelete when delete button is clicked', () => {
      const handleDelete = jest.fn();
      render(<Tag deletable onDelete={handleDelete}>Delete Me</Tag>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('does not render delete button when deletable but no onDelete', () => {
      render(<Tag deletable>No Delete</Tag>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render delete button when onDelete but not deletable', () => {
      const handleDelete = jest.fn();
      render(<Tag onDelete={handleDelete}>No Delete</Tag>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('delete button has proper type attribute', () => {
      const handleDelete = jest.fn();
      render(<Tag deletable onDelete={handleDelete}>Tag</Tag>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Complex Tags', () => {
    it('renders tag with icon and delete button', () => {
      const handleDelete = jest.fn();
      render(
        <Tag icon="user" deletable onDelete={handleDelete} color="primary">
          User Tag
        </Tag>
      );
      
      expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'user');
      expect(screen.getByText('User Tag')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveClass('delete');
      expect(screen.getByText('User Tag').parentElement).toHaveClass('is-primary');
    });

    it('maintains proper structure with all features', () => {
      const handleDelete = jest.fn();
      const { container } = render(
        <Tag 
          icon="star" 
          deletable 
          onDelete={handleDelete}
          color="success"
          size="large"
          light
          rounded
          className="custom-tag"
        >
          Complex Tag
        </Tag>
      );
      
      const tag = container.querySelector('.tag');
      expect(tag).toHaveClass(
        'tag', 
        'is-success', 
        'is-large', 
        'is-light', 
        'is-rounded', 
        'custom-tag'
      );
      
      expect(tag?.querySelector('.icon')).toBeInTheDocument();
      expect(tag?.querySelector('.delete')).toBeInTheDocument();
      expect(screen.getByText('Complex Tag')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper text content accessibility', () => {
      render(<Tag>Accessible Tag</Tag>);
      expect(screen.getByText('Accessible Tag')).toBeInTheDocument();
    });

    it('delete button is accessible', () => {
      const handleDelete = jest.fn();
      render(<Tag deletable onDelete={handleDelete}>Tag</Tag>);
      
      const deleteButton = screen.getByRole('button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute('type', 'button');
    });

    it('maintains accessibility with icons', () => {
      render(<Tag icon="info">Info Tag</Tag>);
      expect(screen.getByText('Info Tag')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });
});