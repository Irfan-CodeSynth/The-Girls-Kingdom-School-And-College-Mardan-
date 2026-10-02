import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';
import { classApi } from '../../classes/api/classApi';
import { Input, Button } from '../../../components/ui';
import { User, Mail, IdCard, Lock, Phone, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';

export const AddStudentModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classApi.getClasses({ status: 'active' }),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      studentId: '',
      password: '',
      phone: '',
      classId: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => studentApi.createStudent(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Student "${res.student?.fullName || 'Student'}" created successfully!`);
      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create student account.');
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    const payload = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      studentId: data.studentId.trim(),
      phone: data.phone?.trim() || undefined,
      password: data.password?.trim() || 'Student@123456',
      classId: data.classId || undefined,
    };
    createMutation.mutate(payload);
  };

  const classes = classesData?.classes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-surface-200 dark:border-surface-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Enroll New Student
            </h2>
            <p className="text-xs text-surface-500">
              Create an official student account with active portal credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Fatima Zahra"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Student full name is required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              placeholder="fatima@girlskingdom.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Student ID / Reg # *"
              placeholder="GKC-2026-045"
              leftIcon={<IdCard className="w-4 h-4" />}
              error={errors.studentId?.message}
              {...register('studentId', { required: 'Student ID is required' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1">
                Assign Class (Optional)
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('classId')}
                >
                  <option value="">No class assigned yet</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Phone Number"
              placeholder="+92 300 1234567"
              leftIcon={<Phone className="w-4 h-4" />}
              {...register('phone')}
            />
          </div>

          <div>
            <Input
              label="Password (Default: Student@123456)"
              type="text"
              placeholder="Leave blank for default: Student@123456"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password', {
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters if specified',
                },
              })}
            />
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              Default password <code className="font-mono bg-surface-100 dark:bg-surface-700 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400 font-semibold">Student@123456</code> will be assigned if left blank.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending}>
              Create Student Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
