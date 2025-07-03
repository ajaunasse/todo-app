import React from 'react';
import { Input, Textarea, Select, Text } from '../atoms';
import type { InputProps, TextareaProps, SelectProps } from '../atoms';

export interface FormFieldProps {
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
  horizontal?: boolean;
  grouped?: boolean;
  addons?: boolean;
  className?: string;
}

export interface TextFieldProps extends FormFieldProps {
  type: 'text';
  inputProps: InputProps;
}

export interface TextAreaFieldProps extends FormFieldProps {
  type: 'textarea';
  textareaProps: TextareaProps;
}

export interface SelectFieldProps extends FormFieldProps {
  type: 'select';
  selectProps: SelectProps;
}

export type FormFieldTypeProps = TextFieldProps | TextAreaFieldProps | SelectFieldProps;

export const FormField: React.FC<FormFieldTypeProps> = (props) => {
  const {
    label,
    help,
    error,
    required = false,
    horizontal = false,
    grouped = false,
    addons = false,
    className = '',
  } = props;

  const getFieldClasses = () => {
    const classes = ['field'];
    
    if (horizontal) classes.push('is-horizontal');
    if (grouped) classes.push('is-grouped');
    if (addons) classes.push('has-addons');
    
    return [...classes, className].join(' ');
  };

  const renderLabel = () => {
    if (!label) return null;
    
    const labelClass = horizontal ? 'field-label is-normal' : '';
    
    return (
      <div className={labelClass}>
        <label className="label">
          {label}
          {required && <span className="has-text-danger"> *</span>}
        </label>
      </div>
    );
  };

  const renderControl = () => {
    const controlWrapper = horizontal ? 'field-body' : '';
    const fieldWrapper = horizontal ? 'field' : '';
    
    let controlContent;
    
    switch (props.type) {
      case 'text':
        controlContent = <Input {...props.inputProps} />;
        break;
      case 'textarea':
        controlContent = <Textarea {...props.textareaProps} />;
        break;
      case 'select':
        controlContent = <Select {...props.selectProps} />;
        break;
      default:
        controlContent = null;
    }

    if (horizontal) {
      return (
        <div className={controlWrapper}>
          <div className={fieldWrapper}>
            <div className="control">
              {controlContent}
            </div>
            {renderHelpAndError()}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="control">
          {controlContent}
        </div>
        {renderHelpAndError()}
      </>
    );
  };

  const renderHelpAndError = () => {
    return (
      <>
        {help && (
          <Text size={7} color="grey" className="help">
            {help}
          </Text>
        )}
        {error && (
          <Text size={7} color="danger" className="help">
            {error}
          </Text>
        )}
      </>
    );
  };

  return (
    <div className={getFieldClasses()}>
      {renderLabel()}
      {renderControl()}
    </div>
  );
};