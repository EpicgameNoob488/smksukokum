import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase, isOfflineMode } from '../lib/supabase';
import { api } from '../lib/api';
import { ArrowLeft, Save, Shield, Users, Building, AlertTriangle, UserPlus, Upload, Loader2, Camera, Check, X, Clock, Key, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { tokens, DT } from '../lib/designTokens';

export default function SettingsPage({ onBack, session }: { onBack: () => void, session: any }) {
  const { settings, updateSettings } = useSettings();
  const { triggerPendingRolesRefresh } = useNotification();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'users' | 'requests'>('profile');
  
  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestActionInProgress, setRequestActionInProgress] = useState<string | null>(null);
  const [requestMsg, setRequestMsg] = useState({ text: '', type: '' });

  // Users Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersMsg, setUsersMsg] = useState({ text: '', type: '' });
  const [resetPasswordModal, setResetPasswordModal] = useState<{ open: boolean; user: any }>({ open: false, user: null });
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordMsg, setResetPasswordMsg] = useState({ text: '', type: '' });

  const fetchPendingRequests = async () => {
    if (isOfflineMode) return;
    setIsLoadingRequests(true);
    setRequestMsg({ text: '', type: '' });
    try {
      const result = await api.listRequests();
      setPendingRequests(result.requests || []);
    } catch (err: any) {
      setRequestMsg({ text: err.message || 'Failed to load pending requests', type: 'error' });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchPendingRequests();
    }
  }, [activeTab]);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    if (isOfflineMode) return;
    setIsLoadingUsers(true);
    setUsersMsg({ text: '', type: '' });
    try {
      const result = await api.listUsers();
      setUsersList(result.users || []);
    } catch (err: any) {
      setUsersMsg({ text: err.message || 'Failed to load users', type: 'error' });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordMsg({ text: '', type: '' });

    if (resetNewPassword.length < 6) {
      setResetPasswordMsg({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetPasswordMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsResettingPassword(true);
    try {
      const result = await api.resetPassword(resetPasswordModal.user.id, resetNewPassword);
      if (result.error) {
        throw new Error(result.error);
      }
      setResetPasswordMsg({ text: 'Password reset successfully!', type: 'success' });
      setTimeout(() => {
        closeResetModal();
      }, 1500);
    } catch (err: any) {
      setResetPasswordMsg({ text: err.message || 'Failed to reset password', type: 'error' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openResetModal = (user: any) => {
    setResetPasswordModal({ open: true, user });
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetPasswordMsg({ text: '', type: '' });
  };

  const closeResetModal = () => {
    setResetPasswordModal({ open: false, user: null });
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetPasswordMsg({ text: '', type: '' });
  };

  const handleApproveRequest = async (requestId: string) => {
    if (isOfflineMode) {
      setRequestMsg({ text: 'Cannot approve requests in Offline Mode', type: 'error' });
      return;
    }
    setRequestActionInProgress(requestId);
    setRequestMsg({ text: '', type: '' });
    try {
      const result = await api.approveRequest(requestId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setRequestMsg({ text: result.message || 'Request approved! Teacher can now log in with their password.', type: 'success' });
      triggerPendingRolesRefresh();
    } catch (err: any) {
      setRequestMsg({ text: err.message || 'Failed to approve request', type: 'error' });
    } finally {
      setRequestActionInProgress(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (isOfflineMode) {
      setRequestMsg({ text: 'Cannot reject requests in Offline Mode', type: 'error' });
      return;
    }
    setRequestActionInProgress(requestId);
    setRequestMsg({ text: '', type: '' });
    try {
      const result = await api.rejectRequest(requestId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setRequestMsg({ text: result.message || 'Request rejected', type: 'success' });
    } catch (err: any) {
      setRequestMsg({ text: err.message || 'Failed to reject request', type: 'error' });
    } finally {
      setRequestActionInProgress(null);
    }
  };
  
  // Profile State
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image too large. Please select a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    
    updateSettings({ 
      schoolName,
      logoUrl: logoUrl.trim() === '' ? null : logoUrl 
    });
    
    setIsSavingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg({ text: '', type: '' });
    
    if (isOfflineMode) {
      setSecurityMsg({ text: 'Cannot update password in Offline Mode', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setSecurityMsg({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsSavingSecurity(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSavingSecurity(false);

    if (error) {
      setSecurityMsg({ text: error.message, type: 'error' });
    } else {
      setSecurityMsg({ text: 'Password updated successfully!', type: 'success' });
      setNewPassword('');
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: tokens.colors.mainBg }}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-30 ${DT.shadow.sm}`} style={{ backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className={`w-10 h-10 ${DT.radius.full} flex items-center justify-center hover:bg-slate-50 transition-colors border`}
              style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: tokens.colors.textNavy }}>System Settings</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>Admin Configuration Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 ${DT.radius.md} text-sm font-bold transition-all ${activeTab === 'profile' ? `${DT.shadow.sm} ring-1` : 'hover:bg-slate-200/50'}`}
            style={{ color: activeTab === 'profile' ? tokens.colors.primaryRed : tokens.colors.textNavy, backgroundColor: activeTab === 'profile' ? tokens.colors.cardInnerBg : undefined, borderColor: activeTab === 'profile' ? tokens.colors.lightBorder : undefined }}
          >
            <Building className="w-5 h-5" /> School Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 ${DT.radius.md} text-sm font-bold transition-all ${activeTab === 'security' ? `${DT.shadow.sm} ring-1` : 'hover:bg-slate-200/50'}`}
            style={{ color: activeTab === 'security' ? tokens.colors.primaryRed : tokens.colors.textNavy, backgroundColor: activeTab === 'security' ? tokens.colors.cardInnerBg : undefined, borderColor: activeTab === 'security' ? tokens.colors.lightBorder : undefined }}
          >
            <Shield className="w-5 h-5" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 ${DT.radius.md} text-sm font-bold transition-all ${activeTab === 'users' ? `${DT.shadow.sm} ring-1` : 'hover:bg-slate-200/50'}`}
            style={{ color: activeTab === 'users' ? tokens.colors.primaryRed : tokens.colors.textNavy, backgroundColor: activeTab === 'users' ? tokens.colors.cardInnerBg : undefined, borderColor: activeTab === 'users' ? tokens.colors.lightBorder : undefined }}
          >
            <Users className="w-5 h-5" /> User Management
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 ${DT.radius.md} text-sm font-bold transition-all ${activeTab === 'requests' ? `${DT.shadow.sm} ring-1` : 'hover:bg-slate-200/50'}`}
            style={{ color: activeTab === 'requests' ? tokens.colors.primaryRed : tokens.colors.textNavy, backgroundColor: activeTab === 'requests' ? tokens.colors.cardInnerBg : undefined, borderColor: activeTab === 'requests' ? tokens.colors.lightBorder : undefined }}
          >
            <Clock className="w-5 h-5" /> Pending Requests
          </button>
        </div>

        {/* Form Content Area */}
        <div className={`flex-1 ${DT.radius.lg} ${DT.shadow.sm} border overflow-hidden`} style={{ backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-8 animate-in fade-in">
              <h2 className="text-xl font-bold mb-6" style={{ color: tokens.colors.textNavy }}>School Profile</h2>
              
              <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-bold mb-2 ml-1 uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>School Name / Title</label>
                  <input 
                    type="text" 
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className={`w-full px-4 py-2.5 ${DT.radius.md} border text-sm font-bold focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all`}
                    style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 ml-1 uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>Logo Customization</label>
                   
                  <div className={`flex items-center gap-6 p-4 ${DT.radius.md} border bg-slate-50`} style={{ borderColor: tokens.colors.lighterBorder }}>
                    <div className={`w-16 h-16 ${DT.radius.md} flex items-center justify-center ${DT.shadow.sm} border overflow-hidden shrink-0`} style={{ backgroundColor: tokens.colors.cardInnerBg, borderColor: tokens.colors.lightBorder }}>
                       {logoUrl ? (
                         <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = ''; setLogoUrl(''); }} />
                       ) : (
                         <Camera className="w-8 h-8 text-slate-300" />
                       )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-3">
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex items-center justify-center gap-2 px-4 py-2 ${DT.radius.md} border text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer`}
                          style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
                        >
                          <Upload className="w-4 h-4" /> Upload School Image
                        </button>
                        
                        <div className="relative">
                          <input 
                            type="url" 
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="Or paste image URL (https://...)"
                            className={`w-full px-4 py-2 ${DT.radius.sm} border text-[10px] font-medium focus:ring-2 focus:ring-red-100 outline-none`}
                            style={{ borderColor: tokens.colors.lightBorder, backgroundColor: tokens.colors.cardInnerBg }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] mt-2 text-slate-500 font-medium leading-relaxed">
                        Recommended: Square PNG/JPG under 2MB.<br/>
                        Leave blank to use default graduation icon.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: tokens.colors.lighterBorder }}>
                  <button 
                    type="submit"
                    disabled={isSavingProfile}
                    className={`px-6 py-2.5 ${DT.radius.md} text-white font-bold text-sm ${DT.shadow.sm} hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50`}
                    style={{ backgroundColor: tokens.colors.primaryRed }}
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-8 animate-in fade-in">
              <h2 className="text-xl font-bold mb-2" style={{ color: tokens.colors.textNavy }}>Account Security</h2>
              <p className="text-xs font-medium mb-6" style={{ color: tokens.colors.textMuted }}>Logged in as: <span className="font-bold">{session?.user?.email || 'Admin/Developer Bypass'}</span></p>

              {isOfflineMode && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>You are currently in <strong>Offline/Dev Mode</strong>. Password updates are disabled because no connection to Supabase is active.</p>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-bold mb-2 ml-1 uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    disabled={isOfflineMode}
                    className={`w-full px-4 py-2.5 ${DT.radius.md} border text-sm font-bold focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
                    style={{ borderColor: tokens.colors.lightBorder }}
                  />
                  <p className="text-[10px] mt-1.5 text-slate-500 font-medium ml-1">Must be at least 6 characters long.</p>
                </div>

                {securityMsg.text && (
                  <p className={`text-xs font-bold ${securityMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {securityMsg.text}
                  </p>
                )}

                <div className="pt-4 border-t" style={{ borderColor: tokens.colors.lighterBorder }}>
                  <button 
                    type="submit"
                    disabled={isSavingSecurity || isOfflineMode}
                    className={`px-6 py-2.5 ${DT.radius.md} text-white font-bold text-sm ${DT.shadow.sm} hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50`}
                    style={{ backgroundColor: tokens.colors.textNavy }}
                  >
                    {isSavingSecurity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-8 animate-in fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: tokens.colors.textNavy }}>User Management</h2>
                <button 
                  onClick={fetchUsers}
                  disabled={isLoadingUsers || isOfflineMode}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <Loader2 className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {isOfflineMode && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>You are currently in <strong>Offline/Dev Mode</strong>. User management is disabled because no connection to Supabase is active.</p>
                </div>
              )}

              {usersMsg.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm ${usersMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                  {usersMsg.text}
                </div>
              )}

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className={`border ${DT.radius.md} overflow-hidden`} style={{ borderColor: tokens.colors.lightBorder }}>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wider" style={{ borderColor: tokens.colors.lightBorder }}>
                      <tr>
                        <th className="px-4 py-3 font-bold">Name / Email</th>
                        <th className="px-4 py-3 font-bold">Role</th>
                        <th className="px-4 py-3 font-bold">Last Login</th>
                        <th className="px-4 py-3 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        usersList.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="px-4 py-4">
                              {user.teacher_name && (
                                <div className="font-bold" style={{ color: tokens.colors.textNavy }}>
                                  {user.teacher_name}
                                </div>
                              )}
                              <div className="text-sm" style={{ color: user.teacher_name ? tokens.colors.textMuted : tokens.colors.textNavy }}>
                                {user.email}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-500 text-xs">
                              {user.last_sign_in_at 
                                ? new Date(user.last_sign_in_at).toLocaleDateString('ms-MY', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })
                                : 'Never'
                              }
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {session?.user?.id !== user.id && (
                                  <button
                                    onClick={() => openResetModal(user)}
                                    disabled={isOfflineMode}
                                    className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                    title="Reset Password"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                )}
                                {session?.user?.id === user.id && (
                                  <span className="text-xs text-slate-400 font-medium italic">Current User</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-slate-400 mt-4 text-center">
                Click the <Key className="w-3 h-3 inline" /> icon to reset a user's password. This will not send any email.
              </p>
            </div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-8 animate-in fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: tokens.colors.textNavy }}>Pending Requests</h2>
                <button 
                  onClick={fetchPendingRequests}
                  disabled={isLoadingRequests || isOfflineMode}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <Loader2 className={`w-4 h-4 ${isLoadingRequests ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {isOfflineMode && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>You are currently in <strong>Offline/Dev Mode</strong>. Request management is disabled because no connection to Supabase is active.</p>
                </div>
              )}

              {requestMsg.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm ${requestMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                  {requestMsg.text}
                </div>
              )}

              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No pending requests</p>
                  <p className="text-xs text-slate-400 mt-1">New teacher registration requests will appear here</p>
                </div>
              ) : (
                <div className={`border ${DT.radius.md} overflow-hidden`} style={{ borderColor: tokens.colors.lightBorder }}>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wider" style={{ borderColor: tokens.colors.lightBorder }}>
                      <tr>
                        <th className="px-4 py-3 font-bold text-center">Name</th>
                        <th className="px-4 py-3 font-bold text-center">Email</th>
                        <th className="px-4 py-3 font-bold text-center">Type</th>
                        <th className="px-4 py-3 font-bold text-center">Requested</th>
                        <th className="px-4 py-3 font-bold text-center w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 text-center font-bold" style={{ color: tokens.colors.textNavy }}>
                            {request.full_name}
                          </td>
                          <td className="px-4 py-4 text-center text-slate-600">{request.email}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                              request.request_type === 'admin' 
                                ? 'bg-purple-50 text-purple-600' 
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              {request.request_type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-slate-500 text-xs">
                            {request.created_at ? new Date(request.created_at).toLocaleDateString('ms-MY', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            }) : '-'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={requestActionInProgress === request.id || isOfflineMode}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {requestActionInProgress === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={requestActionInProgress === request.id || isOfflineMode}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
        </div>
      </main>

      {/* Password Reset Modal */}
      {resetPasswordModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${DT.radius.lg} ${DT.shadow.modal} w-full max-w-md overflow-hidden`} style={{ backgroundColor: tokens.colors.cardInnerBg }}>
            <div className="p-6 border-b" style={{ borderColor: tokens.colors.lighterBorder }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50">
                    <Key className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: tokens.colors.textNavy }}>Reset Password</h3>
                    <p className="text-xs text-slate-500">{resetPasswordModal.user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={closeResetModal}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className={`w-full px-4 py-2.5 ${DT.radius.md} border text-sm font-medium focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all pr-12`}
                    style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] mt-1 text-slate-500">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>
                  Confirm Password
                </label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 ${DT.radius.md} border text-sm font-medium focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all`}
                  style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
                />
              </div>

              {resetPasswordMsg.text && (
                <div className={`p-3 rounded-xl text-sm ${resetPasswordMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                  {resetPasswordMsg.text}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> The user will need to use this new password on their next login. No email will be sent.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className={`flex-1 px-4 py-2.5 ${DT.radius.md} border text-sm font-bold hover:bg-slate-50 transition-colors`}
                  style={{ color: tokens.colors.textNavy, borderColor: tokens.colors.lightBorder }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className={`flex-1 px-4 py-2.5 ${DT.radius.md} text-white text-sm font-bold ${DT.shadow.sm} hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
                  style={{ backgroundColor: tokens.colors.primaryRed }}
                >
                  {isResettingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" /> Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
