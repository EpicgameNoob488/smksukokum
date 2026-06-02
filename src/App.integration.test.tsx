import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as supabaseLib from './lib/supabase';

// Mock SettingsContext and DataContext fallback so that Dashboard doesn't throw errors
vi.mock('./contexts/SettingsContext', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSettings: () => ({
    settings: { schoolName: 'SM KONVEN ST. URSULA', logoUrl: null },
    updateSettings: vi.fn(),
  }),
}));

vi.mock('./contexts/DataContext', () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSchoolData: () => ({
    data: {
      metadata: { sekolah: 'SM KONVEN ST. URSULA', unit: '', tahun: 2025 },
      students: [],
      managementTeam: [],
      formClasses: [],
      kokurikulumUnits: [],
      unitAdvisors: [],
    },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('./contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNotification: () => ({
    notifications: [],
    loading: false,
    addNotification: vi.fn(),
    markAsRead: vi.fn(),
    pendingRolesRefreshTrigger: 0,
  }),
}));

// Mock Supabase
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    not: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn(),
  },
  get isOfflineMode() {
    return true;
  },
}));

describe('App & LoginPage Integration Flow (Functional Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(supabaseLib, 'isOfflineMode', 'get').mockReturnValue(true);
  });

  it('navigates from LandingPage to LoginPage and completes Teacher Login in Offline Mode', async () => {
    render(<App />);

    // 1. Wait for Landing Page to render after async session check
    const staffPortalTag = await screen.findByText('Staff Portal');
    expect(staffPortalTag).toBeInTheDocument();
    expect(screen.getByText(/Management/i)).toBeInTheDocument();

    // 2. Select "Teacher" box to go to Teacher Login Page
    const teacherHeading = screen.getByText('Teacher');
    const teacherBox = teacherHeading.closest('button');
    expect(teacherBox).toBeInTheDocument();
    fireEvent.click(teacherBox!);

    // 3. Verify LoginPage shows up with "Teacher Portal Login" title
    expect(await screen.findByText('Teacher Portal Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('teacher@smkstursula.edu.my')).toBeInTheDocument();

    // 4. Fill in the email and password fields
    const emailInput = screen.getByPlaceholderText('teacher@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'teacher@smkstursula.edu.my' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 5. Submit the form to trigger login
    fireEvent.click(loginButton);

    // 6. Verify transitions to the main dashboard in offline mode
    await waitFor(() => {
      expect(screen.getByText('Activities Overview')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('navigates from LandingPage to LoginPage and completes Admin Login in Online Mode', async () => {
    // Override isOfflineMode to false for online database role checking
    vi.spyOn(supabaseLib, 'isOfflineMode', 'get').mockReturnValue(false);

    // Mock successful Supabase Auth & Role fetching
    const mockSession = { user: { id: 'admin-user-id' } } as any;
    vi.mocked(supabaseLib.supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    });
    vi.mocked(supabaseLib.supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });

    // Mock the user_roles table query returning 'admin' role
    const mockQueryBuilder = {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { role: 'admin', form_class_id: null },
            error: null,
          }),
        }),
        not: () => Promise.resolve({ data: [], error: null }),
      }),
    };
    vi.mocked(supabaseLib.supabase.from).mockReturnValue(mockQueryBuilder as any);

    render(<App />);

    // 1. Wait for Landing Page to load
    const adminHeading = await screen.findByText('Administrator');
    const adminBox = adminHeading.closest('button');
    expect(adminBox).toBeInTheDocument();
    fireEvent.click(adminBox!);

    // 2. Verify LoginPage shows up with "Secure Admin Login" title
    expect(await screen.findByText('Secure Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@smkstursula.edu.my')).toBeInTheDocument();

    // 3. Fill in fields and click login
    const emailInput = screen.getByPlaceholderText('admin@smkstursula.edu.my');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /Secure Login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@smkstursula.edu.my' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Manually trigger mock session state change listener in App.tsx to simulate signing in
    const [[authStateCallback]] = vi.mocked(supabaseLib.supabase.auth.onAuthStateChange).mock.calls;
    if (authStateCallback) {
      await authStateCallback('SIGNED_IN', mockSession);
    }

    // 4. Verify transitions to dashboard as admin
    await waitFor(() => {
      expect(screen.getByText('Activities Overview')).toBeInTheDocument();
    });
  });
});
