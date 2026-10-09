import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { studentApi } from '../api/studentApi';
import {
  Table,
  Badge,
  Button,
  Avatar,
  ConfirmDialog,
} from '../../../components/ui';
import {
  Search,
  Users,
  UserX,
  UserCheck,
  Eye,
  AlertTriangle,
  RefreshCw,
  Plus,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import AddStudentModal from '../components/AddStudentModal';

export const StudentsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['students', search],
    queryFn: () => studentApi.getStudents({ search }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => studentApi.updateStudent(id, { isActive }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setConfirmToggle(null);
      toast.success(
        vars.isActive ? 'Student account activated.' : 'Student account deactivated.'
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update student status.');
    },
  });

  const students = data?.students || [];
  const totalCount = data?.pagination?.total ?? students.length;
  const activeCount = students.filter((s) => s.isActive).length;

  const columns = [
    {
      key: 'fullName',
      label: 'Student',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.profilePhoto} name={val} size="sm" />
          <div>
            <p className="font-bold text-[#111827] text-sm hover:text-[#5A0D1A] transition-colors cursor-pointer" onClick={() => navigate(`/admin/students/${row._id}`)}>
              {val}
            </p>
            <p className="text-xs text-[#6B7280]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'studentId',
      label: 'Reg #',
      render: (val) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A] font-bold">
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'enrolledClass',
      label: 'Enrolled Class',
      render: (val) =>
        val ? (
          <span className="text-sm font-semibold text-[#111827]">
            {val.name}
          </span>
        ) : (
          <span className="text-xs text-[#9CA3AF] italic">Unassigned</span>
        ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <Badge variant={val ? 'success' : 'danger'} dot>
          {val ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (val) => (
        <span className="text-xs text-[#6B7280]">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Eye className="w-3.5 h-3.5 text-[#5A0D1A]" />}
            onClick={() => navigate(`/admin/students/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className={
              row.isActive
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-emerald-700 hover:bg-emerald-50'
            }
            title={row.isActive ? 'Deactivate account' : 'Activate account'}
            onClick={() =>
              setConfirmToggle({
                id: row._id,
                name: row.fullName,
                isActive: !row.isActive,
              })
            }
          >
            {row.isActive ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Academic Records
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            Comprehensive register of enrolled students, portal access, and academic records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Enroll New Student
          </Button>
        </div>
      </div>

      {/* ── Metric Snapshot & Search Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#701422] to-[#4A0914] text-[#EEDAA2] flex items-center justify-center shrink-0 shadow-2xs">
            <GraduationCap className="w-5 h-5 text-[#EEDAA2]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Total Enrolled
            </p>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {totalCount}
            </p>
          </div>
        </div>

        {/* Metric 2: Active Accounts */}
        <div className="bg-white p-4 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Active Portal Users
            </p>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {activeCount}
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-2.5 px-3.5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Error / Session Warning Banner ── */}
      {isError && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold text-amber-900">
              {error?.response?.status === 403
                ? 'Administrator Access Required'
                : 'Unable to Load Students'}
            </p>
            <p className="text-amber-800 text-xs mt-1">
              {error?.response?.status === 403
                ? 'Your active session is not recognized as an Administrator (received 403 Forbidden). If you recently registered or logged in as a student in another tab, please sign back in as Admin.'
                : error?.response?.data?.message || error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => refetch()}
              >
                Retry
              </Button>
              {error?.response?.status === 403 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Log In as Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Student Data Table ── */}
      <Table
        columns={columns}
        data={students}
        loading={isPending}
        emptyTitle="No Students Registered"
        emptyMessage="Students will appear here once registered through this portal."
      />

      {/* ── Confirm Deactivation Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(confirmToggle)}
        onClose={() => setConfirmToggle(null)}
        title={
          confirmToggle?.isActive
            ? 'Activate Student Account?'
            : 'Deactivate Student Account?'
        }
        message={`Are you sure you want to ${confirmToggle?.isActive ? 'activate' : 'deactivate'} the account for ${confirmToggle?.name}? Deactivating will suspend portal login.`}
        confirmText={confirmToggle?.isActive ? 'Activate' : 'Deactivate'}
        variant={confirmToggle?.isActive ? 'primary' : 'danger'}
        loading={toggleActiveMutation.isPending}
        onConfirm={() =>
          toggleActiveMutation.mutate({
            id: confirmToggle.id,
            isActive: confirmToggle.isActive,
          })
        }
      />

      {/* ── Modal: Enroll New Student ── */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default StudentsListPage;
