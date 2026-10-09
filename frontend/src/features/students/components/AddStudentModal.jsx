import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';
import { classApi } from '../../classes/api/classApi';
import { Modal, Input, Button } from '../../../components/ui';
import { User, Mail, IdCard, Lock, Phone, BookOpen, GraduationCap } from 'lucide-react';
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
      toast.success(`Student "${res.student?.fullName || 'Student'}" registered successfully!`);
      reset();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create student account.');
    },
  });

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Enroll New Student"
    >
      <div className="space-y-5">
        {/* Subtitle Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
          <div className="w-9 h-9 rounded-lg bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#5A0D1A]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111827]">Official Registration Record</p>
            <p className="text-xs text-[#6B7280]">
              Create an official student account with active portal credentials
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Fatima Zahra"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Student full name is required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
                Assign Class (Optional)
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#EFE5E0] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] transition-colors"
                  {...register('classId')}
                >
                  <option value="">No class assigned yet</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} {cls.code ? `(${cls.code})` : ''}
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
              label="Account Password"
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
            <p className="text-xs text-[#6B7280] mt-1.5 flex items-center gap-1">
              <span>Default password</span>
              <code className="font-mono bg-[#FAF8F5] border border-[#EFE5E0] px-1.5 py-0.5 rounded text-[#5A0D1A] font-bold text-[11px]">
                Student@123456
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
              Create Student Account
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddStudentModal;
