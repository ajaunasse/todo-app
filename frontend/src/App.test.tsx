import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo app', () => {
  render(<App />);
  const titleElement = screen.getByText(/todo kanban/i);
  expect(titleElement).toBeInTheDocument();
});
