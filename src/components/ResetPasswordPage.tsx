import React, { useState, useEffect } from 'react';
import { supabase, isOfflineMode } from '../lib/supabase';
import { Loader2, Lock, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
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

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResetPasswordPage({ onSuccess, onCancel }: ResetPasswordPageProps) {
  const { settings } = useSettings();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (isOfflineMode) {
      setIsSessionReady(true);
      setCheckingSession(false);
      return;
    }

    const checkSession = async () => {
      // Wait a bit for Supabase to process the hash
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsSessionReady(true);
        setCheckingSession(false);
      } else {
        // Listen for auth state change (Supabase will set session after processing hash)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
          if (event === 'token_refreshed' || event === 'SIGNED_IN') {
            setIsSessionReady(true);
            setCheckingSession(false);
          }
        });

        // Check again after a delay
        setTimeout(async () => {
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession) {
            setIsSessionReady(true);
          }
          setCheckingSession(false);
        }, 2000);

        return () => subscription.unsubscribe();
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isOfflineMode) {
        setIsSuccess(true);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes('rate limit') || 
            error.message.includes('over rate limit') ||
            error.status === 429) {
          setErrorMsg('Too many requests. Please wait 2 hours before trying again, or contact your administrator for password reset assistance.');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        // Clear the hash from URL after successful reset
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
        <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: tokens.colors.primaryRed, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)' }}></div>
        
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-center tracking-tight" style={{ color: tokens.colors.textNavy }}>
              Password Reset Complete
            </h2>
            <p className="text-sm mt-3" style={{ color: tokens.colors.textMuted }}>
              Your password has been successfully reset. You can now login with your new password.
            </p>
          </div>

          <button
            onClick={onSuccess}
            className="w-full mt-8 py-3.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            style={{ backgroundColor: tokens.colors.primaryRed }}
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (checkingSession || !isSessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
        <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: tokens.colors.primaryRed, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)' }}></div>
        
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 z-10">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: tokens.colors.primaryRed }} />
            <h2 className="text-xl font-bold" style={{ color: tokens.colors.textNavy }}>
              Preparing Password Reset...
            </h2>
            <p className="text-sm mt-2" style={{ color: tokens.colors.textMuted }}>
              Please wait while we verify your session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
      <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: tokens.colors.primaryRed, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)' }}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md bg-red-50" style={{ color: tokens.colors.primaryRed }}>
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-center tracking-tight" style={{ color: tokens.colors.textNavy }}>
            Set New Password
          </h1>
          <p className="text-sm font-semibold mt-1 uppercase tracking-widest text-center" style={{ color: tokens.colors.textMuted }}>
            {settings.schoolName}
          </p>
        </div>

        {isOfflineMode && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-100 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xs font-bold text-red-900 leading-tight">OFFLINE / DEV MODE</h3>
              <p className="text-[10px] text-red-700 mt-1 font-medium leading-relaxed">
                Supabase keys are missing. Password reset will simulate success.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                placeholder="Enter new password"
                style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
              />
            </div>
            <p className="text-xs mt-1 ml-1" style={{ color: tokens.colors.textMuted }}>
              Minimum 6 characters
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                placeholder="Confirm new password"
                style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:transform-none"
            style={{ backgroundColor: tokens.colors.primaryRed }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Reset Password <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <button
          onClick={onCancel}
          className="w-full mt-4 py-3.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{ color: tokens.colors.textNavy }}
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <p className="text-xs font-medium" style={{ color: tokens.colors.textMuted }}>
             Enter your new password above.
           </p>
        </div>
      </div>
    </div>
  );
}
