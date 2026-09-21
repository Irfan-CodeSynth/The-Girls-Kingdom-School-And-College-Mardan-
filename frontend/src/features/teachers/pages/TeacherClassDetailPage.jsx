import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { Card, Badge, Skeleton, Table, EmptyState } from '../../../components/ui';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Hash,
} from 'lucide-react';

export const TeacherClassDetailPage = () => {
  const { id } = useParams();

  const { data: classData, isPending } = useQuery({
    queryKey: ['class', id],
    queryFn: () => classApi.getClassById(id),
  });

  const { data: studentsData, isPending: studentsPending } = useQuery({
    queryKey: ['classStudents', id],
    queryFn: () => classApi.getClassStudents(id),
    enabled: Boolean(id),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const cls = classData?.class;
  const students = studentsData?.students || [];

  const studentColumns = [
    {
      key: 'fullName',
      label: 'Student',
      render: (val, row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-white text-sm">{val}</p>
          <p className="text-xs text-surface-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'studentId',
      label: 'Reg #',
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700">
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'enrolledAt',
      label: 'Enrolled',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/teacher/classes"
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Classes
      </Link>

      {/* Class Header */}
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {cls?.name}
              </h1>
              <p className="text-sm font-mono text-surface-500 mt-0.5">{cls?.code}</p>
              {cls?.description && (
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 max-w-xl">
                  {cls.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant={cls?.status === 'active' ? 'success' : 'secondary'} dot>
            {cls?.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-surface-100 dark:border-surface-700 text-sm text-surface-600 dark:text-surface-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" />
            <span>
              <strong className="text-surface-900 dark:text-white">{cls?.studentCount ?? 0}</strong> students enrolled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>
              Academic Year:{' '}
              <strong className="text-surface-900 dark:text-white">{cls?.academicYear}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary-500" />
            <span>
              Class Code:{' '}
              <strong className="font-mono text-surface-900 dark:text-white">{cls?.code}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Students List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          Enrolled Students
        </h3>
        <Table
          columns={studentColumns}
          data={students}
          loading={studentsPending}
          emptyTitle="No Students Enrolled"
          emptyMessage="No students are currently enrolled in this class."
        />
      </div>
    </div>
  );
};

export default TeacherClassDetailPage;
