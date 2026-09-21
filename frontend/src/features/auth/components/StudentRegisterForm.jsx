import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Input, Button } from '../../../components/ui';
import { useRegister } from '../hooks/useRegister';
import { User, Mail, Lock, Phone, IdCard } from 'lucide-react';

const studentRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().min(1, 'Student ID / Registration number is required'),
  phone: z.string().optional(),
});

export const StudentRegisterForm = () => {
  const { mutate: registerStudent, isPending } = useRegister('student');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      studentId: '',
      phone: '',
    },
  });

  const onSubmit = (data) => {
    registerStudent(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <Input
        label="Full Name"
        type="text"
        placeholder="Ayesha Khan"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="ayesha@girlskingdom.edu"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Student ID / Reg #"
        type="text"
        placeholder="GK-STU-2026-001"
        leftIcon={<IdCard className="w-4 h-4" />}
        error={errors.studentId?.message}
        {...register('studentId')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Phone Number (Optional)"
        type="tel"
        placeholder="+92 300 1234567"
        leftIcon={<Phone className="w-4 h-4" />}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-3"
        loading={isPending}
      >
        Complete Registration
      </Button>

      <div className="pt-4 border-t border-surface-200 dark:border-surface-700 text-center space-y-1.5">
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
          >
            Sign In here
          </Link>
        </p>
        <p className="text-xs text-surface-400">
          Are you a teacher?{' '}
          <Link
            to="/register/teacher"
            className="font-medium text-surface-600 dark:text-surface-300 hover:underline"
          >
            Faculty portal
          </Link>
        </p>
      </div>
    </form>
  );
};

export default StudentRegisterForm;
