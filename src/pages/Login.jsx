import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn, ArrowRight, Activity } from 'lucide-react';
import { loginSchema } from '../schemas';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

const Login = () => {
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSubmitting(true);
      const res = await authService.login(data.email, data.password);
      setAuth(res.user, res.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 
                  (err.message === 'Network Error' || !err.response 
                    ? 'Could not connect to the server. Please check if the backend is running.' 
                    : 'Failed to authenticate. Please check your credentials.');
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-[black]">
      {/* Decorative ambient background blobs */}
      <div className="absolute -top-40 -left-40 h-100 w-100 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-100 w-100 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="z-10 w-full max-w-md">
        {/* Top Branding Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 font-outfit text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back to TaskFlow
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-400">
            Seamlessly manage your tasks in style
          </p>
        </div>

        {/* Form login card container */}
        <div className="glass-card rounded-3xl border border-white/60 bg-white/40 p-8 shadow-2xl dark:border-slate-800/40 dark:bg-slate-900/30">
          {serverError && (
            <div className="mb-6 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email input field */}
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
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600 dark:focus:ring-indigo-950/20"
                />
              </div>
              {errors.email && (
                <p className="text-2xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password input field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600 dark:focus:ring-indigo-950/20"
                />
              </div>
              {errors.password && (
                <p className="text-2xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-98 disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Registration link redirect */}
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <span>Sign up for free</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
