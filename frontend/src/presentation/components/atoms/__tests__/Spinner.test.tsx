import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../Spinner';

// Mock the Icon component
jest.mock('../Icon', () => ({
  Icon: ({ name, size, color, spin }: any) => (
    <span 
      data-testid="icon" 
      data-name={name}
      data-size={size}
      data-color={color}
      data-spin={spin}
    />
  ),
}));

describe('Spinner Component', () => {
  describe('Basic Rendering', () => {
    it('renders spinner with default props', () => {
      render(<Spinner />);
      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-name', 'spinner');
      expect(icon).toHaveAttribute('data-spin', 'true');
    });

    it('applies custom className', () => {
      render(<Spinner className="custom-spinner" />);
      expect(screen.getByTestId('icon').parentElement).toHaveClass('custom-spinner');
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large', '2x', '3x'] as const;
    
    sizes.forEach(size => {
      it(`renders ${size} size`, () => {
        render(<Spinner size={size} />);
        expect(screen.getByTestId('icon')).toHaveAttribute('data-size', size);
      });
    });

    it('defaults to medium size', () => {
      render(<Spinner />);
      expect(screen.getByTestId('icon')).toHaveAttribute('data-size', 'medium');
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'info', 'success', 'warning', 'danger', 'dark', 'light', 'white', 'black'] as const;
    
    colors.forEach(color => {
      it(`renders ${color} color`, () => {
        render(<Spinner color={color} />);
        expect(screen.getByTestId('icon')).toHaveAttribute('data-color', color);
      });
    });

    it('defaults to primary color', () => {
      render(<Spinner />);
      expect(screen.getByTestId('icon')).toHaveAttribute('data-color', 'primary');
    });
  });

  describe('Message', () => {
    it('renders with message', () => {
      render(<Spinner message="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders without message', () => {
      render(<Spinner />);
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('applies correct styling to message', () => {
      render(<Spinner message="Please wait" />);
      const message = screen.getByText('Please wait');
      expect(message).toHaveClass('mt-2', 'has-text-grey');
      expect(message.tagName).toBe('P');
    });
  });

  describe('Centering', () => {
    it('centers spinner when centered prop is true', () => {
      render(<Spinner centered />);
      expect(screen.getByTestId('icon').parentElement).toHaveClass('has-text-centered');
    });

    it('does not center spinner by default', () => {
      render(<Spinner />);
      expect(screen.getByTestId('icon').parentElement).not.toHaveClass('has-text-centered');
    });

    it('centers spinner with message', () => {
      render(<Spinner centered message="Loading data..." />);
      const container = screen.getByTestId('icon').parentElement;
      expect(container).toHaveClass('has-text-centered');
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });

  describe('Combined Properties', () => {
    it('renders large colored centered spinner with message', () => {
      render(
        <Spinner 
          size="large"
          color="success"
          centered
          message="Processing your request..."
          className="custom-loader"
        />
      );
      
      const icon = screen.getByTestId('icon');
      const container = icon.parentElement;
      
      expect(icon).toHaveAttribute('data-size', 'large');
      expect(icon).toHaveAttribute('data-color', 'success');
      expect(icon).toHaveAttribute('data-spin', 'true');
      expect(container).toHaveClass('has-text-centered', 'custom-loader');
      expect(screen.getByText('Processing your request...')).toBeInTheDocument();
    });

    it('renders with all size and color combinations', () => {
      render(<Spinner size="3x" color="danger" message="Error loading" />);
      
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('data-size', '3x');
      expect(icon).toHaveAttribute('data-color', 'danger');
      expect(screen.getByText('Error loading')).toBeInTheDocument();
    });
  });

  describe('Container Structure', () => {
    it('wraps icon in div container', () => {
      render(<Spinner />);
      const icon = screen.getByTestId('icon');
      expect(icon.parentElement?.tagName).toBe('DIV');
    });

    it('maintains proper structure with message', () => {
      const { container } = render(<Spinner message="Loading" />);
      const spinnerDiv = container.firstChild as HTMLElement;
      
      expect(spinnerDiv.tagName).toBe('DIV');
      expect(spinnerDiv.children).toHaveLength(2); // Icon + message
      expect(spinnerDiv.children[1].tagName).toBe('P');
    });

    it('maintains proper structure without message', () => {
      const { container } = render(<Spinner />);
      const spinnerDiv = container.firstChild as HTMLElement;
      
      expect(spinnerDiv.tagName).toBe('DIV');
      expect(spinnerDiv.children).toHaveLength(1); // Only icon
    });
  });

  describe('Icon Integration', () => {
    it('always uses spinner icon', () => {
      render(<Spinner />);
      expect(screen.getByTestId('icon')).toHaveAttribute('data-name', 'spinner');
    });

    it('always spins the icon', () => {
      render(<Spinner />);
      expect(screen.getByTestId('icon')).toHaveAttribute('data-spin', 'true');
    });

    it('passes size and color to icon correctly', () => {
      render(<Spinner size="2x" color="warning" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('data-size', '2x');
      expect(icon).toHaveAttribute('data-color', 'warning');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message', () => {
      const { container } = render(<Spinner message="" />);
      // Should only have the icon, no text message
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      const textElements = container.querySelectorAll('p');
      expect(textElements).toHaveLength(0);
    });

    it('handles undefined message', () => {
      render(<Spinner message={undefined} />);
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('handles message with special characters', () => {
      render(<Spinner message="Loading... 50% complete!" />);
      expect(screen.getByText('Loading... 50% complete!')).toBeInTheDocument();
    });
  });
});