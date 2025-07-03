import React from 'react';
import { AppLayout } from './AppLayout';
import { TaskBoard, TaskForm } from '../organisms';
import { Notification } from '../molecules';
import type { AppHeaderProps, TaskBoardProps, TaskFormProps } from '../organisms';

export interface TaskManagementLayoutProps {
  headerProps: AppHeaderProps;
  boardProps: TaskBoardProps;
  formProps: TaskFormProps;
  successMessage?: string | null;
  onClearSuccessMessage?: () => void;
  className?: string;
}

export const TaskManagementLayout: React.FC<TaskManagementLayoutProps> = ({
  headerProps,
  boardProps,
  formProps,
  successMessage,
  onClearSuccessMessage,
  className = '',
}) => {
  return (
    <AppLayout
      headerProps={headerProps}
      fullHeight
      className={className}
    >
      {/* Success Notification */}
      {successMessage && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000, maxWidth: '400px' }}>
          <Notification
            type="success"
            icon
            dismissible
            autoHide
            duration={3000}
            onDismiss={onClearSuccessMessage}
          >
            {successMessage}
          </Notification>
        </div>
      )}

      {/* Task Board */}
      <TaskBoard {...boardProps} />
      
      {/* Task Form Modal */}
      <TaskForm {...formProps} />
    </AppLayout>
  );
};