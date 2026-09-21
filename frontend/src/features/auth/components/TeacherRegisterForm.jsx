import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Input, Button } from '../../../components/ui';
import { useRegister } from '../hooks/useRegister';
import { User, Mail, Lock, Phone, IdCard, Building } from 'lucide-react';

const teacherRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  department: z.string().min(1, 'Department is required (e.g. Biology, Mathematics, Computer Science)'),
  phone: z.string().optional(),
});

export const TeacherRegisterForm = () => {
  const { mutate: registerTeacher, isPending } = useRegister('teacher');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      teacherId: '',
      department: '',
      phone: '',
    },
  });

  const onSubmit = (data) => {
    registerTeacher(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <Input
        label="Full Name"
        type="text"
        placeholder="Ms. Sara Ahmed"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="sara@girlskingdom.edu"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Teacher ID"
          type="text"
          placeholder="TCH-2026-042"
          leftIcon={<IdCard className="w-4 h-4" />}
          error={errors.teacherId?.message}
          {...register('teacherId')}
        />

        <Input
          label="Department"
          type="text"
          placeholder="Science / Biology"
          leftIcon={<Building className="w-4 h-4" />}
          error={errors.department?.message}
          {...register('department')}
        />
      </div>

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
        placeholder="+92 321 9876543"
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
        Register as Faculty
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
          Are you a student?{' '}
          <Link
            to="/register/student"
            className="font-medium text-surface-600 dark:text-surface-300 hover:underline"
          >
            Student portal
          </Link>
        </p>
      </div>
    </form>
  );
};

export default TeacherRegisterForm;
