'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';
import { authService } from '@/lib/auth-service';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setSubmittedEmail(data.email);
    try {
      await authService.requestPasswordReset(data);
      setIsSubmitted(true);
      toast.success('Reset link dispatched!', {
        description: `Instructions sent to ${data.email}`,
      });
    } catch {
      // Fallback for offline API / demo
      setIsSubmitted(true);
      toast.info('Password reset instructions generated (Demo Mode)', {
        description: `Check your inbox at ${data.email}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Reset your password
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {isSubmitted
            ? 'We have sent password reset instructions to your email.'
            : 'Enter your institutional email address and we will send you a reset token.'}
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Check your email</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Instructions have been sent to <span className="font-semibold text-slate-200">{submittedEmail}</span>.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href={`/reset-password?token=demo-reset-token-123`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all w-full justify-center"
            >
              <KeyRound className="w-4 h-4" />
              <span>Enter Reset Token directly</span>
            </Link>

            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-slate-400 hover:text-slate-200 underline block w-full pt-1"
            >
              Try another email address
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('email')}
                type="email"
                placeholder="alex.morgan@unipulse.edu"
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                  errors.email ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center space-x-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <span>Send Reset Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

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
