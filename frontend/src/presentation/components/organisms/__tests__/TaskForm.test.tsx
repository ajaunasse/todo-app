import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../TaskForm';
import { Priority } from '../../../../domain/entities';

// Mock the molecules and atoms
jest.mock('../../molecules', () => ({
  FormField: ({ label, error, inputProps, textareaProps, selectProps, type }: any) => (
    <div data-testid={`field-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
      <label>{label}</label>
      {error && <span data-testid="error">{error}</span>}
      {type === 'text' && (
        <input 
          data-testid="input"
          value={inputProps?.value || ''} 
          onChange={(e) => inputProps?.onChange?.(e.target.value)}
          placeholder={inputProps?.placeholder}
        />
      )}
      {type === 'textarea' && (
        <textarea
          data-testid="textarea"
          value={textareaProps?.value || ''}
          onChange={(e) => textareaProps?.onChange?.(e.target.value)}
          placeholder={textareaProps?.placeholder}
        />
      )}
      {type === 'select' && (
        <select
          data-testid="select"
          value={selectProps?.value || ''}
          onChange={(e) => selectProps?.onChange?.(e.target.value)}
        >
          {selectProps?.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  ),
  Modal: ({ isOpen, title, children, actions, onClose }: any) => (
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-actions">
          {actions?.map((action: any, index: number) => (
            <button key={index} onClick={action.onClick}>
              {action.children}
            </button>
          ))}
        </div>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
  Notification: ({ type, children, dismissible, onDismiss }: any) => (
    <div data-testid="notification" data-type={type}>
      {children}
      {dismissible && (
        <button data-testid="dismiss-notification" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  ),
}));

describe('TaskForm Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders form when open', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<TaskForm {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders create form title by default', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New Task');
    });

    it('renders edit form title when editing', () => {
      render(<TaskForm {...defaultProps} isEditing />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Edit Task');
    });
  });

  describe('Form Fields', () => {
    it('renders all form fields', () => {
      render(<TaskForm {...defaultProps} />);
      
      expect(screen.getByTestId('field-title')).toBeInTheDocument();
      expect(screen.getByTestId('field-description')).toBeInTheDocument();
      expect(screen.getByTestId('field-priority')).toBeInTheDocument();
    });

    it('renders form fields with labels', () => {
      render(<TaskForm {...defaultProps} />);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('initializes with empty values for create form', () => {
      render(<TaskForm {...defaultProps} />);
      
      expect(screen.getByTestId('input')).toHaveValue('');
      expect(screen.getByTestId('textarea')).toHaveValue('');
      expect(screen.getByTestId('select')).toHaveValue(Priority.MEDIUM);
    });

    it('initializes with provided values for edit form', () => {
      const initialData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.HIGH,
      };
      
      render(<TaskForm {...defaultProps} initialData={initialData} isEditing />);
      
      expect(screen.getByTestId('input')).toHaveValue('Test Task');
      expect(screen.getByTestId('textarea')).toHaveValue('Test Description');
      expect(screen.getByTestId('select')).toHaveValue(Priority.HIGH);
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty title', async () => {
      render(<TaskForm {...defaultProps} />);
      
      // Try to submit with empty title
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for empty description', async () => {
      render(<TaskForm {...defaultProps} />);
      
      // Fill title but leave description empty
      await userEvent.type(screen.getByTestId('input'), 'Test Title');
      
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Description is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for title too long', async () => {
      render(<TaskForm {...defaultProps} />);
      
      const longTitle = 'a'.repeat(256); // Exceeds 255 character limit
      await userEvent.type(screen.getByTestId('input'), longTitle);
      
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Title cannot exceed 255 characters')).toBeInTheDocument();
      });
    });

    it('shows validation error for description too long', async () => {
      render(<TaskForm {...defaultProps} />);
      
      await userEvent.type(screen.getByTestId('input'), 'Valid Title');
      const longDescription = 'a'.repeat(1001); // Exceeds 1000 character limit
      await userEvent.type(screen.getByTestId('textarea'), longDescription);
      
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Description cannot exceed 1000 characters')).toBeInTheDocument();
      });
    });

    it('clears validation errors when field is corrected', async () => {
      render(<TaskForm {...defaultProps} />);
      
      // Trigger validation error
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
      
      // Fix the error
      await userEvent.type(screen.getByTestId('input'), 'Fixed Title');
      
      // Error should be cleared
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      
      await userEvent.type(screen.getByTestId('input'), 'Test Task');
      await userEvent.type(screen.getByTestId('textarea'), 'Test Description');
      await userEvent.selectOptions(screen.getByTestId('select'), Priority.HIGH);
      
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test Description',
          priority: Priority.HIGH,
        });
      });
    });

    it('does not call onSubmit when validation fails', async () => {
      const onSubmit = jest.fn();
      
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} />);
      
      // Submit with empty fields
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
      
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onClose after successful submission', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onClose = jest.fn();
      
      render(<TaskForm {...defaultProps} onSubmit={onSubmit} onClose={onClose} />);
      
      await userEvent.type(screen.getByTestId('input'), 'Test Task');
      await userEvent.type(screen.getByTestId('textarea'), 'Test Description');
      
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text when loading', () => {
      render(<TaskForm {...defaultProps} loading />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('shows update text when editing', () => {
      render(<TaskForm {...defaultProps} isEditing />);
      expect(screen.getByText('Update Task')).toBeInTheDocument();
    });

    it('shows create text by default', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error notification when error provided', () => {
      render(<TaskForm {...defaultProps} error="Something went wrong" />);
      
      const notification = screen.getByTestId('notification');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveAttribute('data-type', 'danger');
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });

    it('does not display error notification when no error', () => {
      render(<TaskForm {...defaultProps} />);
      expect(screen.queryByTestId('notification')).not.toBeInTheDocument();
    });

    it('calls onClearError when error is dismissed', async () => {
      const onClearError = jest.fn();
      
      render(
        <TaskForm 
          {...defaultProps} 
          error="Test error" 
          onClearError={onClearError} 
        />
      );
      
      await userEvent.click(screen.getByTestId('dismiss-notification'));
      expect(onClearError).toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    it('resets form when opening with new data', () => {
      const { rerender } = render(<TaskForm {...defaultProps} isOpen={false} />);
      
      const newInitialData = {
        title: 'New Task',
        description: 'New Description',
        priority: Priority.LOW,
      };
      
      rerender(
        <TaskForm 
          {...defaultProps} 
          isOpen={true} 
          initialData={newInitialData} 
        />
      );
      
      expect(screen.getByTestId('input')).toHaveValue('New Task');
      expect(screen.getByTestId('textarea')).toHaveValue('New Description');
      expect(screen.getByTestId('select')).toHaveValue(Priority.LOW);
    });

    it('clears form when closing', async () => {
      const onClose = jest.fn();
      
      render(<TaskForm {...defaultProps} onClose={onClose} />);
      
      // Fill form
      await userEvent.type(screen.getByTestId('input'), 'Test');
      await userEvent.type(screen.getByTestId('textarea'), 'Description');
      
      // Close form
      await userEvent.click(screen.getByText('Cancel'));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Priority Options', () => {
    it('renders all priority options', () => {
      render(<TaskForm {...defaultProps} />);
      
      const select = screen.getByTestId('select');
      expect(select.children).toHaveLength(3);
      expect(screen.getByText('Low Priority')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    it('allows changing priority', async () => {
      render(<TaskForm {...defaultProps} />);
      
      await userEvent.selectOptions(screen.getByTestId('select'), Priority.HIGH);
      expect(screen.getByTestId('select')).toHaveValue(Priority.HIGH);
    });
  });

  describe('Modal Integration', () => {
    it('passes correct props to modal', () => {
      render(<TaskForm {...defaultProps} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New Task');
      expect(screen.getByTestId('modal-actions')).toBeInTheDocument();
    });

    it('handles modal close', async () => {
      const onClose = jest.fn();
      
      render(<TaskForm {...defaultProps} onClose={onClose} />);
      
      await userEvent.click(screen.getByTestId('modal-close'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<TaskForm {...defaultProps} />);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('associates errors with fields', async () => {
      render(<TaskForm {...defaultProps} />);
      
      const submitButton = screen.getByText('Create Task');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        const titleField = screen.getByTestId('field-title');
        expect(titleField).toHaveTextContent('Title is required');
      });
    });
  });
});