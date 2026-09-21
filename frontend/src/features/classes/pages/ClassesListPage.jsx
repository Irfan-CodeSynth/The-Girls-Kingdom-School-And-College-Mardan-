import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import classApi from '../api/classApi';
import ClassCard from '../components/ClassCard';
import ClassModal from '../components/ClassModal';
import { Button, Input, Skeleton, EmptyState } from '../../../components/ui';
import { Plus, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const ClassesListPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const { data, isPending } = useQuery({
    queryKey: ['classes', search],
    queryFn: () => classApi.getClasses({ search }),
  });

  const createMutation = useMutation({
    mutationFn: (formData) => classApi.createClass(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      toast.success('Class created successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create class.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => classApi.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      setSelectedClass(null);
      toast.success('Class updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update class.');
    },
  });

  const handleCreateOpen = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const classes = data?.classes || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
            Academic Classes
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Create, organize, and manage academic cohorts and sections.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleCreateOpen}
        >
          Add New Class
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 max-w-md">
        <Input
          placeholder="Search by class name or code..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Classes Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Classes Found"
          description={
            search
              ? 'No classes matched your search query.'
              : 'Get started by creating your first academic class.'
          }
          actionLabel="Create Class"
          onAction={handleCreateOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              showAdminControls
              onEdit={handleEditOpen}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClass(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={selectedClass}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default ClassesListPage;
