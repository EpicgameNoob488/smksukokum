import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { supabase, isOfflineMode } from '../lib/supabase';

// Mock SettingsContext
vi.mock('../contexts/SettingsContext', () => ({
  useSettings: () => ({
    settings: { schoolName: 'SM KONVEN ST. URSULA', logoUrl: null },
    updateSettings: vi.fn(),
  }),
}));

let mockIsOfflineMode = false;

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
  get isOfflineMode() {
    return mockIsOfflineMode;
  },
}));

describe('LoginPage', () => {
  const mockOnOfflineBypass = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOfflineMode = false;
  });

  it('renders correctly for teacher role', () => {
    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('SM KONVEN ST. URSULA')).toBeInTheDocument();
    expect(screen.getByText('Teacher Portal Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('teacher@smkstursula.edu.my')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders correctly for admin role', () => {
    render(
      <LoginPage
        role="admin"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Secure Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@smkstursula.edu.my')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('teacher@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('triggers cancel on Escape key press', () => {
    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('handles successful login with Supabase', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: {} } as any,
      error: null,
    });

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'teacher@test.com',
        password: 'password123',
      });
    });
  });

  it('displays error message on failed login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as any,
    });

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
  });

  it('allows clicking forgot password to switch to reset password form', async () => {
    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const forgotPasswordBtn = screen.getByRole('button', { name: /Forgot Password\?/i });
    fireEvent.click(forgotPasswordBtn);

    expect(screen.getByText('Enter your email address and we\'ll send you a link to reset your password.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Back to Login/i });
    fireEvent.click(backBtn);

    expect(screen.getByPlaceholderText('teacher@smkstursula.edu.my')).toBeInTheDocument();
  });

  it('renders offline warning and handles offline bypass login', async () => {
    mockIsOfflineMode = true;
    vi.useFakeTimers();

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('OFFLINE / DEV MODE')).toBeInTheDocument();
    expect(screen.getByText('Supabase keys missing. Any email/password bypass login. Data will not save.')).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Fast-forward timers by 800ms
    vi.advanceTimersByTime(800);

    expect(mockOnOfflineBypass).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('bypasses Supabase reset password in offline mode', async () => {
    mockIsOfflineMode = true;

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const forgotPasswordBtn = screen.getByRole('button', { name: /Forgot Password\?/i });
    fireEvent.click(forgotPasswordBtn);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('displays rate limiting error on 429 reset password response', async () => {
    mockIsOfflineMode = false;
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: null as any,
      error: { message: 'over rate limit', status: 429 } as any,
    });

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const forgotPasswordBtn = screen.getByRole('button', { name: /Forgot Password\?/i });
    fireEvent.click(forgotPasswordBtn);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Too many requests\. Please wait 2 hours/i)).toBeInTheDocument();
    });
  });

  it('catches and handles unexpected exceptions in login submit', async () => {
    mockIsOfflineMode = false;
    vi.mocked(supabase.auth.signInWithPassword).mockRejectedValueOnce(
      new Error('Network failure exception')
    );

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network failure exception')).toBeInTheDocument();
    });
  });

  it('displays loading state and disables submit button during login', async () => {
    mockIsOfflineMode = false;
    let resolveLoginPromise: any;
    const loginPromise = new Promise<any>((resolve) => {
      resolveLoginPromise = resolve;
    });

    vi.mocked(supabase.auth.signInWithPassword).mockReturnValueOnce(loginPromise);

    render(
      <LoginPage
        role="teacher"
        onOfflineBypass={mockOnOfflineBypass}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verify submit button is disabled during active submit
    expect(submitButton).toBeDisabled();

    // Resolve the login promise to cleanup
    resolveLoginPromise({ data: { user: {} }, error: null });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
