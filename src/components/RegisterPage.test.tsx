import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage';
import { api } from '../lib/api';

vi.mock('../contexts/SettingsContext', () => ({
  useSettings: () => ({
    settings: { schoolName: 'SM KONVEN ST. URSULA', logoUrl: null },
  }),
}));

vi.mock('../lib/api', () => ({
  api: {
    createRequest: vi.fn(),
    findSimilarNames: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  const mockOnCancel = vi.fn();
  const mockOnLoginRedirect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(
      <RegisterPage
        onCancel={mockOnCancel}
        onLoginRedirect={mockOnLoginRedirect}
      />
    );

    expect(screen.getByText('Request Access')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Ahmad bin Abu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('teacher@smk.edu.my')).toBeInTheDocument();
  });

  it('has autocomplete attributes on inputs', () => {
    render(
      <RegisterPage
        onCancel={mockOnCancel}
        onLoginRedirect={mockOnLoginRedirect}
      />
    );

    const nameInput = screen.getByPlaceholderText('e.g. Ahmad bin Abu');
    const emailInput = screen.getByPlaceholderText('teacher@smk.edu.my');

    expect(nameInput).toHaveAttribute('autoComplete', 'name');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
  });

  it('shows validation error for invalid email format', async () => {
    render(
      <RegisterPage
        onCancel={mockOnCancel}
        onLoginRedirect={mockOnLoginRedirect}
      />
    );

    const nameInput = screen.getByPlaceholderText('e.g. Ahmad bin Abu');
    const emailInput = screen.getByPlaceholderText('teacher@smk.edu.my');
    const passwordInput = screen.getByPlaceholderText('Min 6 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Re-enter password');
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });

    fireEvent.change(nameInput, { target: { value: 'Ahmad bin Abu' } });
    fireEvent.change(emailInput, { target: { value: 'a@b.c' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  // Note: Double-dot emails (e.g. test@test..com) are blocked by the browser's
  // native HTML5 email validation before our custom validation runs.

  it('accepts valid email format and submits successfully', async () => {
    vi.mocked(api.createRequest).mockResolvedValueOnce({
      error: null,
      requiresConfirmation: false,
    });

    render(
      <RegisterPage
        onCancel={mockOnCancel}
        onLoginRedirect={mockOnLoginRedirect}
      />
    );

    const nameInput = screen.getByPlaceholderText('e.g. Ahmad bin Abu');
    const emailInput = screen.getByPlaceholderText('teacher@smk.edu.my');
    const passwordInput = screen.getByPlaceholderText('Min 6 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Re-enter password');
    const submitButton = screen.getByRole('button', { name: /Submit Request/i });

    fireEvent.change(nameInput, { target: { value: 'Ahmad bin Abu' } });
    fireEvent.change(emailInput, { target: { value: 'teacher@smk.edu.my' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createRequest).toHaveBeenCalled();
    });
  });
});
