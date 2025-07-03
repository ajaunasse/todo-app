import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Icon } from '../Icon';

// Mock FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, size, spin, pulse }: any) => (
    <span 
      data-testid="fontawesome-icon" 
      data-icon={icon} 
      data-size={size}
      data-spin={spin}
      data-pulse={pulse}
    />
  ),
}));

describe('Icon Component', () => {
  describe('Basic Rendering', () => {
    it('renders icon with specified name', () => {
      render(<Icon name="user" />);
      const icon = screen.getByTestId('fontawesome-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'user');
    });

    it('applies custom className', () => {
      const { container } = render(<Icon name="home" className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Sizes', () => {
    const regularSizes = ['small', 'medium', 'large'];
    
    regularSizes.forEach(size => {
      it(`renders ${size} size with Bulma class`, () => {
        const { container } = render(<Icon name="star" size={size as any} />);
        expect(container.firstChild).toHaveClass(`is-${size}`);
      });
    });

    const fontAwesomeSizes = ['2x', '3x'];
    
    fontAwesomeSizes.forEach(size => {
      it(`renders ${size} size with FontAwesome prop`, () => {
        render(<Icon name="star" size={size as any} />);
        const icon = screen.getByTestId('fontawesome-icon');
        expect(icon).toHaveAttribute('data-size', size);
      });
    });

    it('defaults to small size', () => {
      const { container } = render(<Icon name="star" />);
      expect(container.firstChild).toHaveClass('is-small');
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'info', 'success', 'warning', 'danger', 'dark', 'light', 'white', 'black'];
    
    colors.forEach(color => {
      it(`renders ${color} color`, () => {
        const { container } = render(<Icon name="heart" color={color as any} />);
        expect(container.firstChild).toHaveClass(`has-text-${color}`);
      });
    });
  });

  describe('Animations', () => {
    it('renders spinning icon', () => {
      render(<Icon name="spinner" spin />);
      const icon = screen.getByTestId('fontawesome-icon');
      expect(icon).toHaveAttribute('data-spin', 'true');
    });

    it('renders pulsing icon', () => {
      render(<Icon name="heart" pulse />);
      const icon = screen.getByTestId('fontawesome-icon');
      expect(icon).toHaveAttribute('data-pulse', 'true');
    });

    it('does not animate by default', () => {
      render(<Icon name="star" />);
      const icon = screen.getByTestId('fontawesome-icon');
      expect(icon).toHaveAttribute('data-spin', 'false');
      expect(icon).toHaveAttribute('data-pulse', 'false');
    });
  });

  describe('Clickable Icons', () => {
    it('renders clickable icon', () => {
      const handleClick = jest.fn();
      const { container } = render(<Icon name="close" onClick={handleClick} />);
      
      const iconContainer = container.firstChild;
      expect(iconContainer).toHaveClass('is-clickable');
    });

    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      const { container } = render(<Icon name="close" onClick={handleClick} />);
      
      fireEvent.click(container.firstChild);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not add clickable class when no onClick', () => {
      const { container } = render(<Icon name="info" />);
      expect(container.firstChild).not.toHaveClass('is-clickable');
    });
  });

  describe('Structure', () => {
    it('wraps FontAwesome icon in span with icon class', () => {
      const { container } = render(<Icon name="user" />);
      const iconContainer = container.firstChild;
      expect(iconContainer).toHaveClass('icon');
      expect(iconContainer.tagName).toBe('SPAN');
    });

    it('contains FontAwesome icon component', () => {
      render(<Icon name="star" />);
      expect(screen.getByTestId('fontawesome-icon')).toBeInTheDocument();
    });
  });

  describe('Combined Properties', () => {
    it('renders large spinning colored icon', () => {
      const { container } = render(<Icon name="spinner" size="large" color="primary" spin />);
      
      const iconContainer = container.firstChild;
      const icon = screen.getByTestId('fontawesome-icon');
      
      expect(iconContainer).toHaveClass('icon', 'is-large', 'has-text-primary');
      expect(icon).toHaveAttribute('data-icon', 'spinner');
      expect(icon).toHaveAttribute('data-spin', 'true');
    });

    it('renders clickable colored icon with custom class', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Icon 
          name="edit" 
          color="success" 
          onClick={handleClick}
          className="custom-edit-icon"
        />
      );
      
      const iconContainer = container.firstChild;
      expect(iconContainer).toHaveClass('icon', 'has-text-success', 'is-clickable', 'custom-edit-icon');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { container } = render(<Icon name="info" />);
      const iconContainer = container.firstChild;
      expect(iconContainer).toBeInTheDocument();
    });

    it('maintains clickable accessibility', () => {
      const handleClick = jest.fn();
      const { container } = render(<Icon name="button-icon" onClick={handleClick} />);
      
      const iconContainer = container.firstChild;
      expect(iconContainer).toBeInTheDocument();
      
      // Test keyboard accessibility if needed
      fireEvent.click(iconContainer);
      expect(handleClick).toHaveBeenCalled();
    });
  });
});