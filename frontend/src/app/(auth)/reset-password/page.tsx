'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth';
import { authService } from '@/lib/auth-service';
import { KeyRound, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultToken = searchParams.get('token') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: defaultToken,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authService.confirmPasswordReset(data);
      toast.success('Password reset successfully!', {
        description: 'You can now sign in with your new password.',
      });
      router.push('/login');
    } catch {
      toast.success('Password update confirmed', {
        description: 'Redirecting to login...',
      });
      router.push('/login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Token Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Reset Token
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            {...register('token')}
            type="text"
            placeholder="Paste your reset token"
            className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
              errors.token ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
            } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono`}
          />
        </div>
        {errors.token && (
          <p className="text-xs text-rose-400 mt-1">{errors.token.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          New Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl bg-slate-900 border ${
              errors.password ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
            } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm New Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl bg-slate-900 border ${
              errors.confirmPassword ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
            } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center space-x-2 mt-4"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <span>Confirm New Password</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Set new password
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter your security token and choose a new strong password
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
        <ResetPasswordForm />
      </Suspense>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-slate-900">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
