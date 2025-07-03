import React from 'react';
import { FormField, Modal, Notification } from '../molecules';
import { Priority } from '../../../domain/entities';

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
}

export interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<TaskFormData>;
  isEditing?: boolean;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

const EMPTY_INITIAL_DATA: Partial<TaskFormData> = {};

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = EMPTY_INITIAL_DATA,
  isEditing = false,
  loading = false,
  error,
  onClearError,
}) => {
  const [formData, setFormData] = React.useState<TaskFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || Priority.MEDIUM,
  });

  const [validationErrors, setValidationErrors] = React.useState<Partial<TaskFormData>>({});

  // Update form data when initial data changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || Priority.MEDIUM,
      });
      setValidationErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const errors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      errors.title = 'Title cannot exceed 255 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is managed by parent component
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: Priority.MEDIUM,
    });
    setValidationErrors({});
    if (onClearError) {
      onClearError();
    }
    onClose();
  };

  const updateFormData = (field: keyof TaskFormData) => (value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const priorityOptions = [
    { value: Priority.LOW, label: 'Low Priority' },
    { value: Priority.MEDIUM, label: 'Medium Priority' },
    { value: Priority.HIGH, label: 'High Priority' },
  ];

  const modalActions = [
    {
      children: loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task',
      variant: 'success' as const,
      icon: (loading ? 'spinner' : 'save') as any,
      loading,
      disabled: loading,
      onClick: () => {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      },
    },
    {
      children: 'Cancel',
      variant: 'light' as const,
      onClick: handleClose,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      actions={modalActions}
      size="medium"
    >
      {error && (
        <Notification
          type="danger"
          dismissible
          onDismiss={onClearError}
          className="mb-4"
        >
          <strong>Error:</strong> {error}
        </Notification>
      )}

      <form onSubmit={handleSubmit}>
        <FormField
          type="text"
          label="Title"
          required
          error={validationErrors.title}
          help="Enter a descriptive title for your task"
          inputProps={{
            value: formData.title,
            onChange: updateFormData('title'),
            placeholder: 'Enter task title',
            icon: 'heading',
            maxLength: 255,
          }}
        />

        <FormField
          type="textarea"
          label="Description"
          required
          error={validationErrors.description}
          help="Provide detailed information about the task"
          textareaProps={{
            value: formData.description,
            onChange: updateFormData('description'),
            placeholder: 'Enter task description',
            rows: 4,
            maxLength: 1000,
          }}
        />

        <FormField
          type="select"
          label="Priority"
          required
          help="Set the priority level for this task"
          selectProps={{
            value: formData.priority,
            onChange: updateFormData('priority'),
            options: priorityOptions,
            icon: 'flag',
          }}
        />
      </form>
    </Modal>
  );
};