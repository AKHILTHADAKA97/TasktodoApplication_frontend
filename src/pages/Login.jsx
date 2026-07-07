import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { loginSchema } from '../schemas';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import { signInWithGoogle } from '../utils/firebase';

const Login = () => {
  const [serverError, setServerError] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
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
      setServerError(
        err.response?.data?.message || 'Failed to authenticate. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setServerError('');
      setSocialLoading(true);
      const result = await signInWithGoogle();
      // Pass Firebase photoURL alongside the token so backend can save it
      const res = await authService.googleLogin(result.token, result.user?.photoURL || '');
      // Merge Google profile photo into user data immediately as fallback
      const userWithPhoto = {
        ...res.user,
        avatar: res.user.avatar || result.user?.photoURL || ''
      };
      setAuth(userWithPhoto, res.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.message !== 'Mock Google login cancelled.') {
        setServerError(
          err.response?.data?.message || 'Google Auth verification failed. Try again.'
        );
      }
    } finally {
      setSocialLoading(false);
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

          {/* Social login partition */}
          <div className="my-6 flex items-center justify-between">
            <span className="h-px w-full bg-slate-200 dark:bg-slate-800" />
            <span className="px-3 text-2xs font-semibold text-slate-400 uppercase">Or</span>
            <span className="h-px w-full bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-98 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {socialLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.29 1.84 15.539.9 12.24.9c-6.14 0-11.11 4.97-11.11 11.1s4.97 11.1 11.11 11.1c6.41 0 10.67-4.5 10.67-10.84 0-.73-.08-1.285-.18-1.975H12.24z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

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
