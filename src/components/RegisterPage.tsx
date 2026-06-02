import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Loader2, Mail, User, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { tokens, DT } from '../lib/designTokens';

interface RegisterPageProps {
  onCancel: () => void;
  onLoginRedirect: () => void;
}

export default function RegisterPage({ onCancel, onLoginRedirect }: RegisterPageProps) {
  const { settings } = useSettings();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestType, setRequestType] = useState<'teacher' | 'admin'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAlreadySignedUp, setIsAlreadySignedUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  
  // Similar names state
  const [similarNames, setSimilarNames] = useState<Array<{ name: string; similarity: number; source: string }>>([]);
  const [isSearchingNames, setIsSearchingNames] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [notInList, setNotInList] = useState(false);
  
  // Fetch similar names when name changes
  useEffect(() => {
    const fetchSimilarNames = async () => {
      if (fullName.length < 3) {
        setSimilarNames([]);
        setSelectedMatch(null);
        setNotInList(false);
        return;
      }
      
      setIsSearchingNames(true);
      try {
        const result = await api.findSimilarNames(fullName, 80);
        setSimilarNames(result.similarNames || []);
        if (result.similarNames && result.similarNames.length > 0) {
          setSelectedMatch(result.similarNames[0].name);
        }
      } catch (err) {
        console.error('Error fetching similar names:', err);
        setSimilarNames([]);
      } finally {
        setIsSearchingNames(false);
      }
    };
    
    const debounce = setTimeout(fetchSimilarNames, 300);
    return () => clearTimeout(debounce);
  }, [fullName]);
  
  // Reset match selection when name changes significantly
  useEffect(() => {
    if (!similarNames.find(s => s.name === selectedMatch)) {
      if (similarNames.length > 0 && !notInList) {
        setSelectedMatch(similarNames[0].name);
      } else if (similarNames.length === 0) {
        setSelectedMatch(null);
      }
    }
  }, [similarNames]);

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

  const validateEmail = (email: string) => {
    // Reject consecutive dots anywhere
    if (email.includes('..')) return false;
    // Proper email regex: local@domain.tld, TLD must be >= 2 chars
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  const handleConfirmDuplicate = async () => {
    setShowDuplicateConfirm(false);
    setIsLoading(true);

    try {
      const result = await api.createRequest({
        email,
        fullName,
        requestType,
        password,
        confirmedDuplicate: true,
        matchedTeacherName: selectedMatch ?? undefined,
      });

      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('Your account has been created! An administrator will review and approve your request. Once approved, you can log in with your password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateConfirm(false);
    setDuplicateWarning('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsAlreadySignedUp(false);
    setWarningMsg('');
    setShowDuplicateConfirm(false);
    setDuplicateWarning('');

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.createRequest({
        email,
        fullName,
        requestType,
        password,
        matchedTeacherName: selectedMatch ?? undefined,
      });

      if (result.error) {
        if (result.error.includes('already signed up')) {
          setErrorMsg('This email is already signed up. Please sign in instead.');
          setIsAlreadySignedUp(true);
        } else if (result.error.includes('already has a pending request')) {
          setErrorMsg('This email already has a pending request. Please wait for admin approval.');
        } else {
          setErrorMsg(result.error);
        }
        setIsLoading(false);
        return;
      }

      if (result.requiresConfirmation) {
        setDuplicateWarning(result.warning || 'A user with this name already exists.');
        setShowDuplicateConfirm(true);
        setIsLoading(false);
        return;
      }

      setSuccessMsg('Your access request has been submitted! An administrator will review and approve your account. Once approved, you will receive an email to set your password and access the dashboard.');

    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center p-2" style={{ backgroundColor: tokens.colors.mainBg }}>
      <div className="absolute top-0 left-0 w-full h-1/3" style={{ backgroundColor: tokens.colors.primaryRed, clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0% 100%)' }}></div>
      
      <div className={`relative w-full max-w-sm ${DT.radius.md} ${DT.shadow.xl} p-4 z-10 animate-in fade-in slide-in-from-bottom-4 ${DT.transition.slower}`} style={{ backgroundColor: tokens.colors.cardInnerBg }}>
        
        {/* Header */}
        <div className="flex flex-col items-center mb-2">
          <div className={`w-8 h-8 ${DT.radius.sm} flex items-center justify-center mb-1 ${DT.shadow.md} bg-red-50`} style={{ color: tokens.colors.primaryRed }}>
              <User className="w-4 h-4" />
          </div>
          <h1 className="text-sm font-extrabold text-center tracking-tight" style={{ color: tokens.colors.textNavy }}>
            Request Access
          </h1>
          <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-widest text-center" style={{ color: tokens.colors.textMuted }}>
            {settings.schoolName}
          </p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-2 p-2 rounded-lg flex items-start gap-2 bg-green-50 border border-green-200">
            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] text-green-800 font-medium leading-relaxed">
                {successMsg}
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={onLoginRedirect}
                  className="text-[8px] font-bold text-green-700 underline hover:text-green-800"
                >
                  Go to Login
                </button>
                <button
                  onClick={onCancel}
                  className="text-[8px] font-bold text-gray-600 hover:text-gray-800"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Name Confirmation */}
        {showDuplicateConfirm && (
          <div className="mb-2 p-2 rounded-lg flex items-start gap-2 bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                {duplicateWarning}
              </p>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={handleConfirmDuplicate}
                  className="px-2 py-1 rounded-lg text-[8px] font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                >
                  Yes, Continue
                </button>
                <button
                  onClick={handleCancelDuplicate}
                  className="px-2 py-1 rounded-lg text-[8px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        {warningMsg && (
          <div className="mb-2 p-2 rounded-lg flex items-start gap-2 bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
              {warningMsg}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-2 p-1.5 rounded-lg text-[10px] font-medium text-red-700 bg-red-50 border border-red-100 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <div className="flex-1">
              {errorMsg}
              {isAlreadySignedUp && (
                <button
                  onClick={onLoginRedirect}
                  className="ml-1 font-bold underline hover:text-red-800"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}

{/* Registration Form */}
        {!successMsg && (
          <form onSubmit={handleRegister} className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold mb-1 ml-1" style={{ color: tokens.colors.textNavy }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: tokens.colors.textMuted }} />
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 ${DT.radius.sm} text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white`}
                    placeholder="e.g. Ahmad bin Abu"
                    style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed, borderColor: tokens.colors.lightBorder }}
                  />
                </div>
              </div>
              
              {/* Similar Names Section - Compact */}
              {(isSearchingNames || similarNames.length > 0) && (
                <div className="p-2 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-200" 
                  style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}>
                  {isSearchingNames ? (
                    <div className="flex items-center gap-1 text-[8px]" style={{ color: tokens.colors.textMuted }}>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      <p className="text-[8px] font-bold mb-1" style={{ color: tokens.colors.textNavy }}>
                        Similar teachers found:
                      </p>
                      <div className="space-y-1">
                        {similarNames.slice(0, 3).map((item, idx) => (
                          <label 
                            key={idx}
                            className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-colors ${
                              selectedMatch === item.name && !notInList 
                                ? 'bg-orange-100 border' 
                                : 'bg-white hover:bg-orange-50'
                            }`}
                            style={{ borderColor: selectedMatch === item.name && !notInList ? tokens.colors.primaryRed : undefined }}
                          >
                            <input
                              type="radio"
                              name="nameMatch"
                              checked={selectedMatch === item.name && !notInList}
                              onChange={() => {
                                setSelectedMatch(item.name);
                                setNotInList(false);
                              }}
                              className="w-3 h-3"
                              style={{ accentColor: tokens.colors.primaryRed }}
                            />
                            <span className="text-[10px] font-bold" style={{ color: tokens.colors.textNavy }}>
                              {item.name}
                            </span>
                          </label>
                        ))}
                        
                        <label 
                          className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-colors ${
                            notInList 
                              ? 'bg-slate-100 border' 
                              : 'bg-white'
                          }`}
                          style={{ borderColor: notInList ? tokens.colors.textMuted : undefined }}
                        >
                          <input
                            type="radio"
                            name="nameMatch"
                            checked={notInList}
                            onChange={() => {
                              setNotInList(true);
                              setSelectedMatch(null);
                            }}
                            className="w-3 h-3"
                            style={{ accentColor: tokens.colors.textMuted }}
                          />
                          <span className="text-[10px] font-medium" style={{ color: tokens.colors.textNavy }}>
                            Not in list
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div>
              <label className="block text-[10px] font-bold mb-1 ml-1" style={{ color: tokens.colors.textNavy }}>
                School Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: tokens.colors.textMuted }} />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 ${DT.radius.sm} text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white`}
                  placeholder="teacher@smk.edu.my"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed, borderColor: tokens.colors.lightBorder }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1 ml-1" style={{ color: tokens.colors.textNavy }}>
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-8 pr-8 py-1.5 ${DT.radius.sm} text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white`}
                  placeholder="Min 6 characters"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed, borderColor: tokens.colors.lightBorder }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" style={{ color: tokens.colors.textMuted }} /> : <Eye className="w-3 h-3" style={{ color: tokens.colors.textMuted }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1 ml-1" style={{ color: tokens.colors.textNavy }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 ${DT.radius.sm} text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white`}
                  placeholder="Re-enter password"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed, borderColor: tokens.colors.lightBorder }}
                />
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold" style={{ color: tokens.colors.textNavy }}>
                Requesting Role:
              </p>
              <p className="text-[10px] font-medium" style={{ color: tokens.colors.primaryRed }}>
                Teacher
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-1 py-2 ${DT.radius.sm} text-white text-xs font-bold ${DT.shadow.md} hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 disabled:opacity-70 disabled:hover:transform-none`}
              style={{ backgroundColor: tokens.colors.primaryRed }}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  Submit Request <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className={`w-full mt-1 py-2 ${DT.radius.sm} text-[10px] font-bold border hover:bg-slate-50 transition-all flex items-center justify-center gap-1 cursor-pointer`}
              style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
            >
              <ArrowLeft className="w-3 h-3" />
              Cancel & Return Home
            </button>
          </form>
        )}
        
        <div className="mt-2 text-center border-t border-slate-100 pt-2">
           <p className="text-[8px] font-medium" style={{ color: tokens.colors.textMuted }}>
               Already have an account?{' '}
               <button onClick={onLoginRedirect} className="underline hover:text-red-500 cursor-pointer" style={{ color: tokens.colors.primaryRed }}>
                 Sign In
               </button>
           </p>
        </div>
      </div>
    </div>
  );
}
