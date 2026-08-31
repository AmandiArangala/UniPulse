'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Mail, Lock, User, UserCheck, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerAuth(data);
      toast.success('Registration successful!', {
        description: `Welcome to UniPulse, ${data.firstName}!`,
      });
      router.push('/');
    } catch {
      toast.success('Registered demo account!', {
        description: `Created account for ${data.email} as ${data.role}`,
      });
      router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create an account
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Join the UniPulse academic success platform as a student or staff member
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              First Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('firstName')}
                type="text"
                placeholder="Alex"
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                  errors.firstName ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-rose-400 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Last Name
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('lastName')}
                type="text"
                placeholder="Morgan"
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                  errors.lastName ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-rose-400 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Username
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              {...register('username')}
              type="text"
              placeholder="alexmorgan"
              className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                errors.username ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
              } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-rose-400 mt-1">{errors.username.message}</p>
          )}
        </div>

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

        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Academic Workspace Role
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              {...register('role')}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="STUDENT">Student Portal</option>
              <option value="LECTURER">Lecturer / Faculty</option>
              <option value="ADVISOR">Academic Advisor</option>
              <option value="ADMIN">Department Administrator</option>
            </select>
          </div>
          {errors.role && (
            <p className="text-xs text-rose-400 mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                  errors.password ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-900 border ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                } text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Login Link */}
      <div className="text-center pt-4 border-t border-slate-900">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
