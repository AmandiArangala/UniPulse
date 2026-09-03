'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { useAuth, defaultProfiles } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Lock, Mail, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, setRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.morgan@unipulse.edu',
      password: 'Password123!',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await login(data);
      toast.success('Welcome back!', {
        description: 'Successfully authenticated to UniPulse platform.',
      });
      router.push('/');
    } catch (err: any) {
      const errorMsg = err?.message || 'Invalid email or password. Access denied.';
      setAuthError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSwitch = (targetRole: UserRole) => {
    setAuthError(null);
    clearErrors();
    const profile = defaultProfiles[targetRole];
    setValue('email', profile.email);
    setValue('password', 'DemoPassword123!');
    setRole(targetRole);
    toast.info(`Switched to ${targetRole} Demo Account`, {
      description: `Preset email filled: ${profile.email}`,
    });
  };

  const handleInputChange = () => {
    if (authError) setAuthError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter your institutional credentials or select a demo role below
        </p>
      </div>

      {/* Quick Demo Selector Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Login
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Select Role:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {(['STUDENT', 'LECTURER', 'ADVISOR', 'ADMIN'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleQuickDemoSwitch(r)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-all text-center border border-slate-700 hover:border-indigo-500 truncate"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Authentication Failure Alert Card Only */}
      {authError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-3 transition-all animate-pulse">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-200 text-sm">Invalid Credentials</h4>
            <p className="text-rose-300/90 leading-relaxed">{authError}</p>
            <p className="text-[11px] text-rose-400 font-semibold mt-1">
              • Please double check your email address and password formatting.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email / Username Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Institutional Email or Username</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              {...register('email')}
              onChange={(e) => {
                register('email').onChange(e);
                handleInputChange();
              }}
              type="text"
              placeholder="user@unipulse.edu or username"
              className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'
              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              {...register('password')}
              onChange={(e) => {
                register('password').onChange(e);
                handleInputChange();
              }}
              type="password"
              placeholder="••••••••••••"
              className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'
              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-400">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
            />
            <span>Keep me logged in on this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to UniPulse</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Registration Link */}
      <div className="text-center pt-4 border-t border-slate-900">
        <p className="text-xs text-slate-400">
          Don't have an institutional account yet?{' '}
          <Link
            href="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
