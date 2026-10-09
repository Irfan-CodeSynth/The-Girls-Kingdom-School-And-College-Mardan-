import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../api/teacherApi';
import { Modal, Input, Button } from '../../../components/ui';
import { User, Mail, IdCard, Lock, Phone, Building2, GraduationCap } from 'lucide-react';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Add Faculty Member"
    >
      <div className="space-y-5">
        {/* Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
          <div className="w-9 h-9 rounded-lg bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#5A0D1A]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827]">Faculty Appointment Record</p>
            <p className="text-xs text-[#6B7280]">
              Create a faculty or academic staff account with active portal credentials
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Dr. Sadia Rehman"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Official Email *"
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
              label="Teacher ID / Staff Code *"
              placeholder="TCH-2026-012"
              leftIcon={<IdCard className="w-4 h-4" />}
              error={errors.teacherId?.message}
              {...register('teacherId', { required: 'Teacher ID is required' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Department / Subject *"
              placeholder="e.g. Mathematics, Sciences"
              leftIcon={<Building2 className="w-4 h-4" />}
              error={errors.department?.message}
              {...register('department', { required: 'Department is required' })}
            />

            <Input
              label="Contact Phone"
              placeholder="+92 300 1234567"
              leftIcon={<Phone className="w-4 h-4" />}
              {...register('phone')}
            />
          </div>

          <div>
            <Input
              label="Initial Password"
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
            <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1">
              <span>Default password</span>
              <code className="font-mono bg-[#FAF8F5] border border-[#EFE5E0] px-1.5 py-0.5 rounded text-[#5A0D1A] font-bold text-[11px]">
                Teacher@123456
              </code>
              <span>will be assigned if left blank.</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE5E0]">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createMutation.isPending}>
              Create Faculty Account
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTeacherModal;
