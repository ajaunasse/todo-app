import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

// Mock FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="icon" data-icon={icon} />
  ),
}));

describe('Input Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders input with value', () => {
      render(<Input {...defaultProps} value="test value" />);
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('renders input with placeholder', () => {
      render(<Input {...defaultProps} placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Input {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });

  describe('Input Types', () => {
    const typeRoleMap = {
      text: 'textbox',
      email: 'textbox', 
      password: null, // password inputs don't have an accessible role
      number: 'spinbutton',
      search: 'searchbox'
    };
    
    Object.entries(typeRoleMap).forEach(([type, role]) => {
      it(`renders ${type} input type`, () => {
        const { container } = render(<Input {...defaultProps} type={type as any} />);
        const input = container.querySelector('input');
        expect(input).toHaveAttribute('type', type);
        if (role) {
          expect(screen.getByRole(role)).toHaveAttribute('type', type);
        }
      });
    });

    it('defaults to text type', () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });
  });

  describe('States', () => {
    it('renders disabled input', () => {
      render(<Input {...defaultProps} disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('renders required input', () => {
      render(<Input {...defaultProps} required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('applies maxLength attribute', () => {
      render(<Input {...defaultProps} maxLength={100} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '100');
    });
  });

  describe('Sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      it(`renders ${size} size`, () => {
        render(<Input {...defaultProps} size={size as any} />);
        expect(screen.getByRole('textbox')).toHaveClass(`is-${size}`);
      });
    });

    it('does not add size class for normal size', () => {
      render(<Input {...defaultProps} size="normal" />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('is-normal');
      expect(input).toHaveClass('input');
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'info', 'success', 'warning', 'danger'];
    
    colors.forEach(color => {
      it(`renders ${color} color`, () => {
        render(<Input {...defaultProps} color={color as any} />);
        expect(screen.getByRole('textbox')).toHaveClass(`is-${color}`);
      });
    });
  });

  describe('Modifiers', () => {
    it('renders rounded input', () => {
      render(<Input {...defaultProps} rounded />);
      expect(screen.getByRole('textbox')).toHaveClass('is-rounded');
    });

    it('renders loading input', () => {
      render(<Input {...defaultProps} loading />);
      expect(screen.getByRole('textbox')).toHaveClass('is-loading');
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(<Input {...defaultProps} icon="user" iconPosition="left" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'user');
    });

    it('renders with right icon', () => {
      render(<Input {...defaultProps} icon="search" iconPosition="right" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon', 'search');
    });

    it('defaults to left icon position', () => {
      render(<Input {...defaultProps} icon="email" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('wraps input in control div when icon is present', () => {
      const { container } = render(<Input {...defaultProps} icon="user" />);
      expect(container.querySelector('.control')).toBeInTheDocument();
      expect(container.querySelector('.has-icons-left')).toBeInTheDocument();
    });
  });

  describe('Attributes', () => {
    it('applies id attribute', () => {
      render(<Input {...defaultProps} id="test-input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test-input');
    });

    it('applies name attribute', () => {
      render(<Input {...defaultProps} name="username" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('applies autoComplete attribute', () => {
      render(<Input {...defaultProps} autoComplete="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'email');
    });
  });

  describe('Event Handling', () => {
    it('calls onChange when input value changes', async () => {
      const handleChange = jest.fn();
      
      render(<Input value="" onChange={handleChange} />);
      
      await userEvent.type(screen.getByRole('textbox'), 'test');
      
      // userEvent.type calls onChange for each character typed
      expect(handleChange).toHaveBeenCalledTimes(4);
      expect(handleChange).toHaveBeenNthCalledWith(1, 't');
      expect(handleChange).toHaveBeenNthCalledWith(2, 'e');
      expect(handleChange).toHaveBeenNthCalledWith(3, 's');
      expect(handleChange).toHaveBeenNthCalledWith(4, 't');
    });

    it('calls onChange with correct value on direct input', () => {
      const handleChange = jest.fn();
      render(<Input value="" onChange={handleChange} />);
      
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalledWith('new value');
    });

    it('does not call onChange when disabled', async () => {
        const handleChange = jest.fn();
      
      render(<Input value="" onChange={handleChange} disabled />);
      
      await userEvent.type(screen.getByRole('textbox'), 'test');
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Controlled Component', () => {
    it('updates displayed value when value prop changes', () => {
      const { rerender } = render(<Input value="initial" onChange={jest.fn()} />);
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
      
      rerender(<Input value="updated" onChange={jest.fn()} />);
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('initial')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper textbox role', () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('maintains accessibility when disabled', () => {
      render(<Input {...defaultProps} disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('disabled');
    });

    it('maintains accessibility when required', () => {
      render(<Input {...defaultProps} required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('required');
    });
  });
});