import React, { useState, useEffect } from 'react';
import { supabase, isOfflineMode } from '../lib/supabase';
import { Loader2, Lock, Mail, AlertTriangle, ArrowRight, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const tokens = {
  colors: {
    primaryRed: '#F04444',
    mainBg: '#F4F7F6',
    cardInnerBg: '#FFFFFF',
    textNavy: '#2B3674',
    textMuted: '#8F9BBA',
  }
};

interface LoginPageProps {
  role: 'admin' | 'teacher';
  onOfflineBypass: () => void;
  onCancel: () => void;
}

export default function LoginPage({ role, onOfflineBypass, onCancel }: LoginPageProps) {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Handle Escape key to go back home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isOfflineMode) {
        // Just bypass local login if offline mode is true
        setTimeout(() => {
          onOfflineBypass();
        }, 800);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsResetLoading(true);

    try {
      if (isOfflineMode) {
        setResetSent(true);
        setIsResetLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('rate limit') || 
            error.message.includes('over rate limit') ||
            error.status === 429) {
          setResetError('Too many requests. Please wait 2 hours before trying again, or contact your administrator for password reset assistance.');
        } else {
          setResetError(error.message);
        }
      } else {
        setResetSent(true);
      }
    } catch (err: any) {
      setResetError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetSent(false);
    setResetEmail('');
    setResetError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: tokens.colors.primaryRed, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)' }}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md bg-red-50" style={{ color: tokens.colors.primaryRed }}>
             {isForgotPassword ? <Key className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-extrabold text-center tracking-tight" style={{ color: tokens.colors.textNavy }}>
            {isForgotPassword ? 'Reset Password' : (role === 'admin' ? 'Secure Admin Login' : 'Teacher Portal Login')}
          </h1>
          <p className="text-sm font-semibold mt-1 uppercase tracking-widest text-center" style={{ color: tokens.colors.textMuted }}>
            {settings.schoolName}
          </p>
        </div>

        {/* Offline Warning */}
        {isOfflineMode && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-100 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xs font-bold text-red-900 leading-tight">OFFLINE / DEV MODE</h3>
              <p className="text-[10px] text-red-700 mt-1 font-medium leading-relaxed">
                Supabase keys are missing. Any email/password will bypass this login screen for local testing. Data will not save.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && !isForgotPassword && (
          <div className="mb-6 p-3 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        {/* Reset Error Message */}
        {resetError && (
          <div className="mb-6 p-3 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {resetError}
          </div>
        )}

        {/* Success Message for Reset */}
        {resetSent ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: tokens.colors.textNavy }}>
                Check Your Email
              </h2>
              <p className="text-sm mt-2" style={{ color: tokens.colors.textMuted }}>
                We've sent a password reset link to <span className="font-medium">{resetEmail}</span>
              </p>
              <p className="text-xs mt-4" style={{ color: tokens.colors.textMuted }}>
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full mt-2 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: tokens.colors.primaryRed }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        ) : isForgotPassword ? (
          /* Forgot Password Form */
          <div className="space-y-5">
            <p className="text-sm text-center" style={{ color: tokens.colors.textMuted }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleResetPassword}>
              <div>
                <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                    placeholder="your@email.com"
                    style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetLoading}
                className="w-full mt-5 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:transform-none"
                style={{ backgroundColor: tokens.colors.primaryRed }}
              >
                {isResetLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={handleBackToLogin}
              className="w-full mt-2 py-3 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ color: tokens.colors.textNavy }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
                {role === 'admin' ? 'Admin Email' : 'Teacher Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                  placeholder={role === 'admin' ? 'admin@smkstursula.edu.my' : 'teacher@smkstursula.edu.my'}
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold ml-1" style={{ color: tokens.colors.textNavy }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setIsForgotPassword(true);
                  }}
                  className="text-xs font-medium hover:underline cursor-pointer"
                  style={{ color: tokens.colors.primaryRed }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:transform-none"
              style={{ backgroundColor: tokens.colors.primaryRed }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Secure Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full mt-2 py-3 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ color: tokens.colors.textNavy }}
            >
              Cancel & Return Home
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <p className="text-xs font-medium" style={{ color: tokens.colors.textMuted }}>
             Authorized personnel only. Contact IT for access.
           </p>
        </div>
      </div>
    </div>
  );
}
