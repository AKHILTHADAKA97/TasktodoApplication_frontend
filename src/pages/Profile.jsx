import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Mail, FileText, Lock, CheckCircle2, ShieldAlert, Sun, Moon, LogOut } from 'lucide-react';
import { profileSchema, changePasswordSchema } from '../schemas';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import authService from '../services/authService';
import { DEFAULT_AVATAR } from '../constants';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
];

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const getInitials = (name) => {
    if (!name) return 'TF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Returns user's avatar URL or the backend default image
  const getAvatarUrl = (userObj) => {
    if (userObj?.avatar) return userObj.avatar;
    return DEFAULT_AVATAR;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Custom local state to select avatar preset
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || ''
  );

  // Auto-sync selectedAvatar if user.avatar is updated externally (e.g., after save)
  useEffect(() => {
    setSelectedAvatar(user?.avatar || '');
  }, [user?.avatar]);

  // Form setups
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setProfileMsg({ text: '', type: '' }), 4000);
    },
    onError: (err) => {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error'
      });
    }
  });

  // Password Change Mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => 
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      resetPasswordForm();
      setTimeout(() => setPasswordMsg({ text: '', type: '' }), 4000);
    },
    onError: (err) => {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password.',
        type: 'error'
      });
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileMsg({ text: 'Please select an image smaller than 2MB.', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result);
        setProfileMsg({ text: '', type: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = (data) => {
    // Append currently chosen avatar link
    data.avatar = selectedAvatar;
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  // Google social accounts have firebase UID and usually don't support custom password switches
  const isSocialAccount = !user?.password && !!localStorage.getItem('token')?.startsWith('mock_google_token_');

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Top section: User Card and Theme/Logout Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Span 2: User Card */}
        <div className="glass-card flex items-center gap-3.5 rounded-2xl border border-white/50 bg-white/35 p-5 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25 md:col-span-2">
          <img
            src={getAvatarUrl(user)}
            alt={user?.name || 'User'}
            className="h-14 w-14 rounded-xl object-cover shadow-sm flex-shrink-0 ring-2 ring-indigo-500/20"
          />
          <div className="overflow-hidden text-left">
            <h3 className="truncate font-outfit text-base font-bold text-slate-900 dark:text-white">
              {user?.name || 'User Name'}
            </h3>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
              {user?.email || 'email@example.com'}
            </p>
          </div>
        </div>

        {/* Right Span 1: Quick Actions (Theme & Logout) */}
        <div className="glass-card flex items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/35 p-5 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 cursor-pointer"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-500" />}
          </button>
          
          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/10 hover:bg-rose-700 active:scale-97 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="glass-card rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25 md:p-8">
        <div>
          <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-white md:text-lg">
            Personal Information
          </h3>
          <p className="text-2xs text-slate-400 dark:text-slate-500">
            Update your public profile, biography description and avatar image.
          </p>
        </div>

        {profileMsg.text && (
          <div className={`mt-6 rounded-xl p-4 text-xs font-semibold ${
            profileMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-455'
          }`}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-8 space-y-6">
          {/* Avatar selector block */}
          <div className="space-y-3.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Profile Avatar
            </span>
            <div className="flex flex-wrap items-center gap-6">
              {/* Main Avatar preview container - always shows an image */}
              <img
                src={selectedAvatar || getAvatarUrl(user)}
                alt="Selected Avatar Preview"
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-md"
              />
              
              {/* Controls block */}
              <div className="space-y-3">
                {/* Presets List */}
                <div className="space-y-1.5">
                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                    Choose from presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_PRESETS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`h-9 w-9 overflow-hidden rounded-xl border-2 transition-all ${
                          selectedAvatar === avatar
                            ? 'border-indigo-600 scale-110 shadow-sm'
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={avatar} alt="Preset avatar option" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Selector */}
                <div className="space-y-1.5">
                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                    Or upload custom picture:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer shadow-3xs transition-all">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {selectedAvatar && (
                      <button
                        type="button"
                        onClick={() => setSelectedAvatar('')}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-950/40 dark:bg-rose-950/20 cursor-pointer shadow-3xs transition-all"
                      >
                        Remove (Use Initials)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form details input grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  {...registerProfile('name')}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                />
              </div>
              {profileErrors.name && (
                <p className="text-2xs text-rose-500">{profileErrors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="email"
                  {...registerProfile('email')}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                />
              </div>
              {profileErrors.email && (
                <p className="text-2xs text-rose-500">{profileErrors.email.message}</p>
              )}
            </div>
          </div>

          {/* User Bio biography */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Biography / Description
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute top-3.5 left-3.5">
                <FileText className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <textarea
                rows="3"
                placeholder="Write a short summary about yourself..."
                {...registerProfile('bio')}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
              />
            </div>
            {profileErrors.bio && (
              <p className="text-2xs text-rose-500">{profileErrors.bio.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 active:scale-97 disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'Saving details...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="glass-card rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25 md:p-8">
        <div>
          <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-white md:text-lg">
            Password & Security
          </h3>
          <p className="text-2xs text-slate-400 dark:text-slate-500">
            Modify your credentials securely to keep your account safe.
          </p>
        </div>

        {passwordMsg.text && (
          <div className={`mt-6 rounded-xl p-4 text-xs font-semibold ${
            passwordMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-655 dark:bg-rose-950/20 dark:text-rose-455'
          }`}>
            {passwordMsg.text}
          </div>
        )}

        {isSocialAccount ? (
          /* Google Account disclaimer warning */
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/20">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-550" />
            <div>
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">
                Social Account Linked
              </h4>
              <p className="mt-1 text-2xs text-amber-700/80 dark:text-amber-400/70">
                You are currently logged in via Google Authentication. Password updates and changes are handled directly via your Google Account and cannot be edited locally.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-8 space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Current Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('currentPassword')}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-2xs text-rose-500">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('newPassword')}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-2xs text-rose-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('confirmNewPassword')}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                  />
                </div>
                {passwordErrors.confirmNewPassword && (
                  <p className="text-2xs text-rose-500">{passwordErrors.confirmNewPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700 active:scale-97 disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? 'Updating password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
