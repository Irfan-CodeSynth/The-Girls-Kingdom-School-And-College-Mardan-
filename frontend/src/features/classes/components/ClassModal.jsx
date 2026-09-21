import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Select, Textarea, Button } from '../../../components/ui';

const classSchema = z.object({
  name: z.string().min(2, 'Class name is required (e.g. Class 11 - Science)'),
  code: z.string().min(2, 'Class code is required (e.g. C11-SCI)'),
  academicYear: z.string().min(4, 'Academic year is required (e.g. 2025-2026)'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
});

export const ClassModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      code: '',
      academicYear: '2025-2026',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        academicYear: initialData.academicYear || '2025-2026',
        description: initialData.description || '',
        status: initialData.status || 'active',
      });
    } else {
      reset({
        name: '',
        code: '',
        academicYear: '2025-2026',
        description: '',
        status: 'active',
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Academic Class' : 'Create New Class'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Class Name"
          placeholder="e.g. Class 11 - Pre-Medical"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Class Code"
            placeholder="e.g. C11-MED"
            error={errors.code?.message}
            {...register('code')}
          />

          <Input
            label="Academic Year"
            placeholder="e.g. 2025-2026"
            error={errors.academicYear?.message}
            {...register('academicYear')}
          />
        </div>

        <Textarea
          label="Description / Department Notes"
          placeholder="Optional notes regarding syllabus or section details..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        {isEditing && (
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'archived', label: 'Archived' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        )}

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Class'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassModal;
