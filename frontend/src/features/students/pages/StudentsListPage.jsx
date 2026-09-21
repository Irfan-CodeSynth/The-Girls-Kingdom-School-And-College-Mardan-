import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { studentApi } from '../api/studentApi';
import {
  Table,
  Badge,
  Button,
  Input,
  Avatar,
  ConfirmDialog,
} from '../../../components/ui';
import { Search, Users, UserX, UserCheck, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const StudentsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);
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

  const columns = [
    {
      key: 'fullName',
      label: 'Student',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.profilePhoto} name={val} size="sm" />
          <div>
            <p className="font-semibold text-surface-900 dark:text-white text-sm">{val}</p>
            <p className="text-xs text-surface-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'studentId',
      label: 'Reg #',
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'enrolledClass',
      label: 'Enrolled Class',
      render: (val) =>
        val ? (
          <span className="text-sm font-medium text-surface-900 dark:text-white">
            {val.name}
          </span>
        ) : (
          <span className="text-xs text-surface-400 italic">Not enrolled</span>
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
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => navigate(`/admin/students/${row._id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={
              row.isActive
                ? 'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                : 'text-success-600 hover:bg-success-50 dark:hover:bg-emerald-900/20'
            }
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

  const students = data?.students || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
            Student Management
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {data?.pagination?.total ?? 0} registered students
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search students by name or email..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Session/Error Alert */}
      {isError && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {error?.response?.status === 403
                ? 'Administrator Access Required'
                : 'Unable to Load Students'}
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
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

      {/* Table */}
      <Table
        columns={columns}
        data={students}
        loading={isPending}
        emptyTitle="No Students Registered"
        emptyMessage="Students will appear here once they register through the student portal."
      />

      {/* Confirm toggle dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmToggle)}
        onClose={() => setConfirmToggle(null)}
        title={
          confirmToggle?.isActive
            ? 'Activate Student Account?'
            : 'Deactivate Student Account?'
        }
        message={`Are you sure you want to ${confirmToggle?.isActive ? 'activate' : 'deactivate'} the account for ${confirmToggle?.name}?`}
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
    </div>
  );
};

export default StudentsListPage;
