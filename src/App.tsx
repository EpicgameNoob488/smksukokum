import { useState, useEffect } from 'react';
import { supabase, isOfflineMode } from './lib/supabase';
import { tokens, DT } from './lib/designTokens';
import { Session } from '@supabase/supabase-js';
import { SettingsProvider } from './contexts/SettingsContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import NotificationPanel from './components/NotificationPanel';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LandingPage from './components/LandingPage';
import SettingsPage from './components/SettingsPage';
import ResetPasswordPage from './components/ResetPasswordPage';

type UserRole = 'admin' | 'teacher';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [formClassId, setFormClassId] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [offlineBypass, setOfflineBypass] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!isOfflineMode);
  
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | null>(null);
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | 'settings'>('dashboard');
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for password reset callback from Supabase
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token=')) {
      setShowResetPassword(true);
    }
  }, []);

  // Fetch user role and form class from database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, form_class_id')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        setFormClassId(null);
      } else {
        setUserRole(data.role as UserRole);
        setFormClassId(data.form_class_id || null);
      }
    } catch (err) {
      console.error('Error fetching role in catch block:', err);
      setUserRole(null);
      setFormClassId(null);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    if (isOfflineMode) {
      setRoleLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRoleLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowLogin(false);
        if (session.user) {
          fetchUserRole(session.user.id);
        }
      } else {
        setUserRole(null);
        setRoleLoading(false);
        // Don't auto-show login - let LandingPage show by default
        // Only show login if user explicitly selected a role
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setUserRole(null);
    setSelectedRole(null);
    setShowLogin(false);  // Show LandingPage after logout
    if (isOfflineMode) {
      setOfflineBypass(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  const validateRoleAccess = (requestedRole: 'admin' | 'teacher'): boolean => {
    if (!userRole) return false;
    if (requestedRole === 'admin' && userRole !== 'admin') {
      return false;
    }
    return true;
  };

  if (isInitializing || roleLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center`} style={{ backgroundColor: tokens.colors.mainBg }}>
        <div className={`w-8 h-8 border-4 ${DT.radius.full} animate-spin`} style={{ borderColor: tokens.colors.primaryRed, borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  // Priority 1: Check for password reset (even if logged in - allow changing password)
  if (showResetPassword) {
    return (
      <DataProvider>
        <SettingsProvider>
        <ResetPasswordPage 
          onSuccess={() => {
            setShowResetPassword(false);
            setShowLogin(true);
          }}
          onCancel={() => {
            setShowResetPassword(false);
          }}
        />
        </SettingsProvider>
      </DataProvider>
    );
  }

  const isAuthenticated = session || (isOfflineMode && offlineBypass);

  if (isAuthenticated) {
    if (userRole === null) {
      const handleNotAuthorizedGoToTeacher = async () => {
        await handleLogout();
        setSelectedRole('teacher');
        setShowLogin(true);
      };
      const handleNotAuthorizedBack = async () => {
        await handleLogout();
        setSelectedRole(null);
        setShowLogin(false);
      };
      return (
        <DataProvider>
        <SettingsProvider>
          <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
            <div className={`${DT.radius.xl} ${DT.shadow.xl} p-8 max-w-md text-center`} style={{ backgroundColor: tokens.colors.cardInnerBg }}>
              <div className={`w-16 h-16 ${DT.radius.full} bg-red-100 flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: tokens.colors.textNavy }}>Not Authorized</h2>
              <p className="mb-6" style={{ color: tokens.colors.textMuted }}>
                Your account is not authorized to access this system. Please contact your administrator.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleNotAuthorizedGoToTeacher}
                  className={`px-6 py-3 text-white ${DT.radius.md} font-bold hover:bg-red-600 transition-colors`}
                  style={{ backgroundColor: tokens.colors.primaryRed }}
                >
                  Go to Teacher Portal
                </button>
                <button
                  onClick={handleNotAuthorizedBack}
                  className={`px-6 py-3 bg-slate-200 ${DT.radius.md} font-bold hover:bg-slate-300 transition-colors`}
                  style={{ color: tokens.colors.textNavy }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </SettingsProvider>
      </DataProvider>
      );
    }

    if (selectedRole === 'admin' && userRole !== 'admin') {
      const handleAccessDeniedGoToTeacher = async () => {
        await handleLogout();
        setSelectedRole('teacher');
        setShowLogin(true);
      };
      const handleAccessDeniedBack = async () => {
        await handleLogout();
        setSelectedRole(null);
        setShowLogin(false);
      };
      return (
        <DataProvider>
        <SettingsProvider>
          <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
            <div className={`${DT.radius.xl} ${DT.shadow.xl} p-8 max-w-md text-center`} style={{ backgroundColor: tokens.colors.cardInnerBg }}>
              <div className={`w-16 h-16 ${DT.radius.full} bg-red-100 flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: tokens.colors.textNavy }}>Access Denied</h2>
              <p className="mb-6" style={{ color: tokens.colors.textMuted }}>
                Your account is authorized for Teacher Portal only. Admin access is required for this section.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleAccessDeniedGoToTeacher}
                  className={`px-6 py-3 text-white ${DT.radius.md} font-bold hover:bg-red-600 transition-colors`}
                  style={{ backgroundColor: tokens.colors.primaryRed }}
                >
                  Go to Teacher Portal
                </button>
                <button
                  onClick={handleAccessDeniedBack}
                  className={`px-6 py-3 bg-slate-200 ${DT.radius.md} font-bold hover:bg-slate-300 transition-colors`}
                  style={{ color: tokens.colors.textNavy }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </SettingsProvider>
      </DataProvider>
      );
    }
    
    return (
      <ErrorBoundary>
        <NotificationProvider>
          <DataProvider>
            <SettingsProvider>
              {currentRoute === 'settings' ? (
                <>
                  <SettingsPage 
                    session={session} 
                    onBack={() => setCurrentRoute('dashboard')} 
                  />
                  <NotificationPanel />
                </>
              ) : (
                <>
                  <Dashboard 
                    session={session} 
                    onLogout={handleLogout} 
                    onLoginRequired={() => setShowLogin(true)}
                    isOfflineBypass={isOfflineMode && offlineBypass}
                    onNavigateSettings={() => setCurrentRoute('settings')}
                    userRole={userRole}
                    formClassId={formClassId}
                  />
                  <NotificationPanel />
                </>
              )}
            </SettingsProvider>
          </DataProvider>
        </NotificationProvider>
      </ErrorBoundary>
    );
  }

  if (showLogin) {
    return (
      <DataProvider>
        <SettingsProvider>
        <LoginPage 
          role={selectedRole || 'admin'}
          onOfflineBypass={() => {
            setOfflineBypass(true);
            setShowLogin(false);
            setUserRole('teacher');
          }} 
          onCancel={() => {
            setShowLogin(false);
            setSelectedRole(null);
            setAuthError(null);
          }}
        />
      </SettingsProvider>
      </DataProvider>
    );
  }

  if (showRegister) {
    return (
      <DataProvider>
        <SettingsProvider>
        <RegisterPage 
          onCancel={() => {
            setShowRegister(false);
          }}
          onLoginRedirect={() => {
            setShowRegister(false);
            setShowLogin(true);
            setSelectedRole('teacher');
          }}
        />
      </SettingsProvider>
      </DataProvider>
    );
  }

  if (showResetPassword) {
    return (
      <DataProvider>
        <SettingsProvider>
        <ResetPasswordPage 
          onSuccess={() => {
            setShowResetPassword(false);
            setShowLogin(true);
          }}
          onCancel={() => {
            setShowResetPassword(false);
          }}
        />
      </SettingsProvider>
      </DataProvider>
    );
  }

  return (
    <DataProvider>
      <SettingsProvider>
        <LandingPage 
          onSelectRole={(role) => {
            setSelectedRole(role);
            setShowLogin(true);
          }}
          onRegister={() => {
            setShowRegister(true);
          }}
        />
      </SettingsProvider>
    </DataProvider>
  );
}