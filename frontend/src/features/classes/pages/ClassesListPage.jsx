import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import classApi from '../api/classApi';
import ClassCard from '../components/ClassCard';
import ClassModal from '../components/ClassModal';
import { Button, Skeleton, EmptyState } from '../../../components/ui';
import { Plus, Search, BookOpen, Layers, Users } from 'lucide-react';
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
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Academic Structure
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Academic Classes & Sections
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            Manage academic cohorts, assign instructors, enroll students, and organize curricula.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleCreateOpen}
          >
            Create New Class
          </Button>
        </div>
      </div>

      {/* ── Metric Snapshot & Search Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#701422] to-[#4A0914] text-[#EEDAA2] flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-[#EEDAA2]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Total Cohorts
            </p>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {totalClasses}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Enrolled Across Classes
            </p>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {totalStudents}
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-2.5 px-3.5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by class name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Classes Grid ── */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#EFE5E0] p-6 space-y-4 shadow-xs">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <div className="pt-4 border-t border-[#EFE5E0] flex justify-between">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 shadow-xs text-center">
          <EmptyState
            title="No Academic Classes Found"
            description={
              search
                ? `No classes matching "${search}". Try clearing your search filter.`
                : 'Get started by creating your first academic class or section.'
            }
          />
        </div>
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

      {/* ── Class Create / Edit Modal ── */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedClass}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default ClassesListPage;
