import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../api/teacherApi';
import { Input, Button } from '../../../components/ui';
import { User, Mail, IdCard, Lock, Phone, Building2, X } from 'lucide-react';
import { toast } from 'sonner';

export const AddTeacherModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      teacherId: '',
      department: '',
      password: '',
      phone: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => teacherApi.createTeacher(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success(`Faculty member "${res.teacher?.fullName || 'Teacher'}" added successfully!`);
      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create faculty account.');
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    const payload = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      teacherId: data.teacherId.trim(),
      department: data.department.trim(),
      phone: data.phone?.trim() || undefined,
      password: data.password?.trim() || 'Teacher@123456',
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-surface-200 dark:border-surface-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Add Faculty Member
            </h2>
            <p className="text-xs text-surface-500">
              Create a faculty / staff account with active portal credentials
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
            placeholder="e.g. Dr. Sadia Rehman"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              placeholder="sadia@girlskingdom.edu"
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
              label="Faculty ID *"
              placeholder="TCH-2026-015"
              leftIcon={<IdCard className="w-4 h-4" />}
              error={errors.teacherId?.message}
              {...register('teacherId', { required: 'Teacher ID is required' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department *"
              placeholder="e.g. Physics / Mathematics"
              leftIcon={<Building2 className="w-4 h-4" />}
              error={errors.department?.message}
              {...register('department', { required: 'Department is required' })}
            />

            <Input
              label="Phone Number"
              placeholder="+92 321 9876543"
              leftIcon={<Phone className="w-4 h-4" />}
              {...register('phone')}
            />
          </div>

          <div>
            <Input
              label="Password (Default: Teacher@123456)"
              type="text"
              placeholder="Leave blank for default: Teacher@123456"
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
              Default password <code className="font-mono bg-surface-100 dark:bg-surface-700 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400 font-semibold">Teacher@123456</code> will be assigned if left blank.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending}>
              Create Faculty Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;
