import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Input, Button } from '../../../components/ui';
import { useLogin } from '../hooks/useLogin';
import { Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const fillCredentials = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ── Demo Credentials Quick-Fill ── */}
      <div className="bg-surface-50 dark:bg-surface-800/80 rounded-xl p-3 border border-surface-200 dark:border-surface-700 space-y-2">
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wider text-center">
          1-Click Demo Access
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => fillCredentials('admin@girlskingdom.edu', 'Admin@123456')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition text-center shadow-xs"
          >
            <span className="text-sm">👑</span>
            <span className="text-xs font-bold text-surface-900 dark:text-white mt-0.5">Admin</span>
            <span className="text-[10px] text-surface-400 font-mono">Principal</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('teacher@girlskingdom.edu', 'Teacher@123456')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition text-center shadow-xs"
          >
            <span className="text-sm">👩‍🏫</span>
            <span className="text-xs font-bold text-surface-900 dark:text-white mt-0.5">Teacher</span>
            <span className="text-[10px] text-surface-400 font-mono">Faculty</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('ayesha@girlskingdom.edu', 'Student@123456')}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition text-center shadow-xs"
          >
            <span className="text-sm">🎓</span>
            <span className="text-xs font-bold text-surface-900 dark:text-white mt-0.5">Student</span>
            <span className="text-[10px] text-surface-400 font-mono">Learner</span>
          </button>
        </div>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="student@girlskingdom.edu"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        loading={isPending}
      >
        Sign In
      </Button>

      <div className="pt-4 border-t border-surface-200 dark:border-surface-700 text-center space-y-2">
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Need an account?
        </p>
        <div className="flex justify-center gap-4 text-xs font-semibold">
          <Link
            to="/register/student"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
          >
            Register as Student
          </Link>
          <span className="text-surface-300 dark:text-surface-600">|</span>
          <Link
            to="/register/teacher"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
          >
            Register as Teacher
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
