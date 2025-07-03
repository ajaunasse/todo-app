import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

// Mock FontAwesome since it requires icon configuration
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, spin }: any) => (
    <span data-testid="icon" data-icon={icon} data-spin={spin} />
  ),
}));

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('renders button without children', () => {
      render(<Button />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Button Types', () => {
    it('renders as submit button', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('renders as reset button', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });

    it('defaults to button type', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    
    variants.forEach(variant => {
      it(`renders ${variant} variant`, () => {
        render(<Button variant={variant as any}>Button</Button>);
        expect(screen.getByRole('button')).toHaveClass(`is-${variant}`);
      });
    });

    it('defaults to primary variant', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('is-primary');
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      it(`renders ${size} size`, () => {
        render(<Button size={size as any}>Button</Button>);
        expect(screen.getByRole('button')).toHaveClass(`is-${size}`);
      });
    });

    it('does not add size class for normal size', () => {
      render(<Button size="normal">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('is-normal');
      expect(button).toHaveClass('button');
    });
  });

  describe('States', () => {
    it('renders disabled button', () => {
      render(<Button disabled>Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders loading button', () => {
      render(<Button loading>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('is-loading');
      expect(button).toBeDisabled();
    });

    it('renders loading button with spinner icon', () => {
      render(<Button loading icon="save">Button</Button>);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('data-icon', 'spinner');
      expect(icon).toHaveAttribute('data-spin', 'true');
    });
  });

  describe('Modifiers', () => {
    it('renders full width button', () => {
      render(<Button fullWidth>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('is-fullwidth');
    });

    it('renders outlined button', () => {
      render(<Button outlined>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('is-outlined');
    });

    it('renders rounded button', () => {
      render(<Button rounded>Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('is-rounded');
    });
  });

  describe('Icons', () => {
    it('renders icon on the left by default', () => {
      render(<Button icon="save">Save</Button>);
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('icon');
      const span = screen.getByText('Save');
      
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'save');
      expect(button.firstChild).toContainElement(icon);
    });

    it('renders icon on the right', () => {
      render(<Button icon="arrow-right" iconPosition="right">Next</Button>);
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('icon');
      
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'arrow-right');
      expect(button.lastChild).toContainElement(icon);
    });

    it('renders icon without text', () => {
      render(<Button icon="close" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'close');
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('maintains accessibility when disabled', () => {
      render(<Button disabled>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });
  });
});