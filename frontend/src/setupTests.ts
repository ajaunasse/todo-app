// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock CSS imports
jest.mock('bulma/css/bulma.min.css', () => ({}));

// Mock FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: jest.fn().mockImplementation(() => null),
}));

// Mock FontAwesome icons
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faSpinner: { iconName: 'spinner' },
  faPlus: { iconName: 'plus' },
  faEdit: { iconName: 'edit' },
  faTrash: { iconName: 'trash' },
  faCheck: { iconName: 'check' },
  faTimes: { iconName: 'times' },
  faInfo: { iconName: 'info' },
  faWarning: { iconName: 'warning' },
  faError: { iconName: 'error' },
  faTasks: { iconName: 'tasks' },
  faInbox: { iconName: 'inbox' },
  faCheckCircle: { iconName: 'check-circle' },
  faClock: { iconName: 'clock' },
}));

// Mock FontAwesome core
jest.mock('@fortawesome/fontawesome-svg-core', () => ({
  library: {
    add: jest.fn(),
  },
  config: {
    autoAddCss: false,
  },
}));

