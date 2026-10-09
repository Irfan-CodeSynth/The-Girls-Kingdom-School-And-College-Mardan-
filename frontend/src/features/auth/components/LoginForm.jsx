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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

      <div className="pt-4 border-t border-[#EFE5E0] text-center space-y-2">
        <p className="text-xs text-[#6B7280]">
          Need an account?
        </p>
        <div className="flex justify-center gap-4 text-xs font-semibold">
          <Link
            to="/register/student"
            className="text-[#5A0D1A] hover:text-[#420812] hover:underline"
          >
            Register as Student
          </Link>
          <span className="text-[#D1D5DB]">|</span>
          <Link
            to="/register/teacher"
            className="text-[#5A0D1A] hover:text-[#420812] hover:underline"
          >
            Register as Teacher
          </Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
