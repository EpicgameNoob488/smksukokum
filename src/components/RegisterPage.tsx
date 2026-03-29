import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Loader2, Mail, User, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
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
    // Allow any email (gmail, school email, etc.)
    return email.includes('@') && email.includes('.');
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
        matchedTeacherName: selectedMatch,
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
        matchedTeacherName: selectedMatch,
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
      <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: tokens.colors.primaryRed, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)' }}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md bg-red-50" style={{ color: tokens.colors.primaryRed }}>
             <User className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-center tracking-tight" style={{ color: tokens.colors.textNavy }}>
            Request Access
          </h1>
          <p className="text-xs font-semibold mt-1 uppercase tracking-widest text-center" style={{ color: tokens.colors.textMuted }}>
            {settings.schoolName}
          </p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl flex items-start gap-3 bg-green-50 border border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium leading-relaxed">
                {successMsg}
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={onLoginRedirect}
                  className="text-xs font-bold text-green-700 underline hover:text-green-800"
                >
                  Go to Login
                </button>
                <button
                  onClick={onCancel}
                  className="text-xs font-bold text-gray-600 hover:text-gray-800"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Name Confirmation */}
        {showDuplicateConfirm && (
          <div className="mb-4 p-3 rounded-xl flex items-start gap-3 bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium leading-relaxed">
                {duplicateWarning}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleConfirmDuplicate}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                >
                  Yes, Continue
                </button>
                <button
                  onClick={handleCancelDuplicate}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        {warningMsg && (
          <div className="mb-4 p-3 rounded-xl flex items-start gap-3 bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              {warningMsg}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              {errorMsg}
              {isAlreadySignedUp && (
                <button
                  onClick={onLoginRedirect}
                  className="ml-2 font-bold underline hover:text-red-800"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}

        {/* Registration Form */}
        {!successMsg && (
          <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                    placeholder="e.g. Ahmad bin Abu"
                    style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                  />
                </div>
              </div>
              
              {/* Similar Names Section */}
              {(isSearchingNames || similarNames.length > 0) && (
                <div className="p-3 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-200" 
                  style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}>
                  {isSearchingNames ? (
                    <div className="flex items-center gap-2 text-xs" style={{ color: tokens.colors.textMuted }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching for similar names...
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold mb-2" style={{ color: tokens.colors.textNavy }}>
                        Similar teachers found in 2025 database:
                      </p>
                      <div className="space-y-2">
                        {similarNames.map((item, idx) => (
                          <label 
                            key={idx}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                              selectedMatch === item.name && !notInList 
                                ? 'bg-orange-100 border-2' 
                                : 'bg-white hover:bg-orange-50 border border-transparent'
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
                              className="w-4 h-4"
                              style={{ accentColor: tokens.colors.primaryRed }}
                            />
                            <div className="flex-1">
                              <span className="text-sm font-bold" style={{ color: tokens.colors.textNavy }}>
                                {item.name}
                              </span>
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" 
                                style={{ 
                                  backgroundColor: item.similarity >= 90 ? '#DCFCE7' : item.similarity >= 80 ? '#FEF3C7' : '#FEE2E2',
                                  color: item.similarity >= 90 ? '#166534' : item.similarity >= 80 ? '#92400E' : '#991B1B'
                                }}>
                                {item.similarity}% match
                              </span>
                              <span className="ml-2 text-xs" style={{ color: tokens.colors.textMuted }}>
                                ({item.source === 'management_team' ? 'Management Team' : item.source === 'form_classes' ? 'Form Teacher' : item.source})
                              </span>
                            </div>
                          </label>
                        ))}
                        
                        <label 
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                            notInList 
                              ? 'bg-slate-100 border-2' 
                              : 'bg-white hover:bg-slate-50 border border-transparent'
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
                            className="w-4 h-4"
                            style={{ accentColor: tokens.colors.textMuted }}
                          />
                          <span className="text-sm font-medium" style={{ color: tokens.colors.textNavy }}>
                            I'm not in this list (new teacher)
                          </span>
                        </label>
                      </div>
                      
                      {selectedMatch && !notInList && (
                        <p className="text-xs mt-2 p-2 rounded bg-orange-50" style={{ color: '#9A3412' }}>
                          Selected: <span className="font-bold">{selectedMatch}</span> — This teacher will be linked to your account if approved.
                        </p>
                      )}
                      {notInList && (
                        <p className="text-xs mt-2 p-2 rounded bg-slate-100" style={{ color: tokens.colors.textMuted }}>
                          Your request will be reviewed by an administrator for verification.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              
              <div>
              <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
                School Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.colors.textMuted }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                  placeholder="teacher@smkstursula.edu.my"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-1">Enter your email address</p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                  placeholder="At least 6 characters"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: tokens.colors.textMuted }} /> : <Eye className="w-4 h-4" style={{ color: tokens.colors.textMuted }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1" style={{ color: tokens.colors.textNavy }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all bg-slate-50 focus:bg-white"
                  placeholder="Re-enter password"
                  style={{ color: tokens.colors.textNavy, caretColor: tokens.colors.primaryRed }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold" style={{ color: tokens.colors.textNavy }}>
                Requesting Role:
              </p>
              <p className="text-sm font-medium mt-1" style={{ color: tokens.colors.primaryRed }}>
                Teacher
              </p>
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
                  Submit Request <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full mt-2 py-3 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ color: tokens.colors.textNavy }}
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel & Return Home
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center border-t border-slate-100 pt-5">
           <p className="text-xs font-medium" style={{ color: tokens.colors.textMuted }}>
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
