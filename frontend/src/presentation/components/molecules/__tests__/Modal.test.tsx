import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

// Mock the atoms
jest.mock('../../atoms', () => ({
  Title: ({ children, level, className }: any) => (
    <h1 data-level={level} className={className}>{children}</h1>
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body classes
    document.body.className = '';
  });

  describe('Basic Rendering', () => {
    it('renders modal when open', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Modal {...defaultProps} className="custom-modal" />);
      expect(container.querySelector('.modal')).toHaveClass('custom-modal');
    });
  });

  describe('Modal States', () => {
    it('applies active class when open', () => {
      const { container } = render(<Modal {...defaultProps} />);
      expect(container.querySelector('.modal')).toHaveClass('is-active');
    });

    it('does not apply active class when closed', () => {
      const { container } = render(<Modal {...defaultProps} isOpen={false} />);
      expect(container.querySelector('.modal')).not.toBeInTheDocument();
    });
  });

  describe('Title and Header', () => {
    it('renders title in header', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders close button in header', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('delete');
    });

    it('does not render header when no title', () => {
      const { container } = render(<Modal {...defaultProps} />);
      expect(container.querySelector('.modal-card-head')).not.toBeInTheDocument();
    });

    it('calls onClose when header close button clicked', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} title="Test" />);
      
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Area', () => {
    it('renders children in modal body', () => {
      render(<Modal {...defaultProps}>Test content</Modal>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('wraps children in modal-card-body', () => {
      const { container } = render(<Modal {...defaultProps}>Content</Modal>);
      const body = container.querySelector('.modal-card-body');
      expect(body).toBeInTheDocument();
      expect(body).toHaveTextContent('Content');
    });
  });

  describe('Footer and Actions', () => {
    it('renders custom footer', () => {
      const customFooter = <div>Custom footer</div>;
      render(<Modal {...defaultProps} footer={customFooter} />);
      expect(screen.getByText('Custom footer')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      const actions = [
        { children: 'Save', onClick: jest.fn() },
        { children: 'Cancel', onClick: jest.fn() },
      ];
      render(<Modal {...defaultProps} actions={actions} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('does not render footer when no footer or actions', () => {
      const { container } = render(<Modal {...defaultProps} />);
      expect(container.querySelector('.modal-card-foot')).not.toBeInTheDocument();
    });

    it('calls action onClick handlers', () => {
      const saveHandler = jest.fn();
      const cancelHandler = jest.fn();
      const actions = [
        { children: 'Save', onClick: saveHandler },
        { children: 'Cancel', onClick: cancelHandler },
      ];
      
      render(<Modal {...defaultProps} actions={actions} />);
      
      fireEvent.click(screen.getByText('Save'));
      fireEvent.click(screen.getByText('Cancel'));
      
      expect(saveHandler).toHaveBeenCalledTimes(1);
      expect(cancelHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Size Variants', () => {
    const sizes = ['small', 'medium', 'large', 'fullscreen'];
    
    sizes.forEach(size => {
      it(`applies ${size} size class`, () => {
        const { container } = render(<Modal {...defaultProps} size={size as any} />);
        const modalCard = container.querySelector('.modal-card');
        
        if (size === 'medium') {
          // medium is default, no special class
          expect(modalCard).not.toHaveClass('is-small', 'is-large', 'is-fullscreen');
        } else {
          expect(modalCard).toHaveClass(`is-${size}`);
        }
      });
    });
  });

  describe('Overlay Interaction', () => {
    it('calls onClose when overlay clicked', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} canCloseOnOverlay />
      );
      
      const overlay = container.querySelector('.modal-background');
      fireEvent.click(overlay!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when canCloseOnOverlay is false', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} canCloseOnOverlay={false} />
      );
      
      const overlay = container.querySelector('.modal-background');
      fireEvent.click(overlay!);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('defaults to allowing overlay close', () => {
      const onClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />);
      
      const overlay = container.querySelector('.modal-background');
      fireEvent.click(overlay!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Interaction', () => {
    it('closes on Escape key when canCloseOnEscape is true', async () => {
        const onClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={onClose} canCloseOnEscape />);
      
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on Escape when canCloseOnEscape is false', async () => {
        const onClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={onClose} canCloseOnEscape={false} />);
      
      await userEvent.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('defaults to allowing Escape close', async () => {
        const onClose = jest.fn();
      
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Body Class Management', () => {
    it('adds is-clipped class to body when modal opens', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body).toHaveClass('is-clipped');
    });

    it('removes is-clipped class when modal closes', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body).toHaveClass('is-clipped');
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body).not.toHaveClass('is-clipped');
    });

    it('cleans up body class on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      expect(document.body).toHaveClass('is-clipped');
      
      unmount();
      expect(document.body).not.toHaveClass('is-clipped');
    });
  });

  describe('Event Listener Management', () => {
    it('adds keydown listener when modal opens', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      render(<Modal {...defaultProps} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      addEventListenerSpy.mockRestore();
    });

    it('removes keydown listener when modal closes', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const { rerender } = render(<Modal {...defaultProps} />);
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Complete Modal', () => {
    it('renders complete modal with all features', () => {
      const actions = [
        { children: 'Save', onClick: jest.fn() },
        { children: 'Cancel', onClick: jest.fn() },
      ];
      
      const { container } = render(
        <Modal
          {...defaultProps}
          title="Complete Modal"
          actions={actions}
          size="large"
          canCloseOnOverlay={false}
          canCloseOnEscape={false}
          className="complete-modal"
        >
          Complete modal content
        </Modal>
      );

      // Check structure
      expect(container.querySelector('.modal-card-head')).toBeInTheDocument();
      expect(container.querySelector('.modal-card-body')).toBeInTheDocument();
      expect(container.querySelector('.modal-card-foot')).toBeInTheDocument();

      // Check content
      expect(screen.getByText('Complete Modal')).toBeInTheDocument();
      expect(screen.getByText('Complete modal content')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();

      // Check classes
      expect(container.querySelector('.modal')).toHaveClass('is-active', 'complete-modal');
      expect(container.querySelector('.modal-card')).toHaveClass('is-large');
    });
  });

  describe('Accessibility', () => {
    it('has proper modal structure', () => {
      const { container } = render(<Modal {...defaultProps} title="Accessible Modal" />);
      
      expect(container.querySelector('.modal')).toBeInTheDocument();
      expect(container.querySelector('.modal-background')).toBeInTheDocument();
      expect(container.querySelector('.modal-card')).toBeInTheDocument();
    });

    it('close button has proper aria-label', () => {
      render(<Modal {...defaultProps} title="Test" />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label', 'close');
    });
  });
});