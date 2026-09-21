import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '../api/teacherApi';
import { Card, Badge, Avatar, Skeleton, Table } from '../../../components/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  IdCard,
  Building2,
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-surface-100 dark:border-surface-700/60 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
    </div>
    <div>
      <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-surface-900 dark:text-white mt-0.5">
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

export const TeacherDetailPage = () => {
  const { id } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teacherApi.getTeacherById(id),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="col-span-2 h-64 w-full" />
        </div>
      </div>
    );
  }

  const teacher = data?.teacher;
  const classes = teacher?.assignedClasses || [];

  const classColumns = [
    {
      key: 'name',
      label: 'Class Name',
      render: (val, row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-white">{val}</p>
          <p className="text-xs text-surface-500 font-mono">{row.code}</p>
        </div>
      ),
    },
    {
      key: 'academicYear',
      label: 'Academic Year',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'secondary'} dot>
          {val}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/teachers"
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Teachers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <Card className="flex flex-col items-center text-center gap-4 p-6">
          <Avatar
            src={teacher?.profilePhoto}
            name={teacher?.fullName}
            size="xl"
          />
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              {teacher?.fullName}
            </h2>
            <Badge
              variant={teacher?.isActive ? 'success' : 'danger'}
              dot
              className="mt-1"
            >
              {teacher?.isActive ? 'Active Account' : 'Inactive Account'}
            </Badge>
          </div>
          <div className="w-full text-left space-y-0 divide-y divide-surface-100 dark:divide-surface-700">
            <InfoRow icon={Mail} label="Email" value={teacher?.email} />
            <InfoRow icon={Phone} label="Phone" value={teacher?.phone} />
            <InfoRow icon={IdCard} label="Teacher ID" value={teacher?.teacherId} />
            <InfoRow icon={Building2} label="Department" value={teacher?.department} />
            <InfoRow
              icon={BookOpen}
              label="Assigned Classes"
              value={`${teacher?.assignedClassesCount ?? 0} class${teacher?.assignedClassesCount !== 1 ? 'es' : ''}`}
            />
            <InfoRow
              icon={Calendar}
              label="Registered On"
              value={
                teacher?.createdAt
                  ? new Date(teacher.createdAt).toLocaleDateString()
                  : 'N/A'
              }
            />
          </div>
        </Card>

        {/* Right — Assigned Classes */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Assigned Classes
          </h3>
          <Table
            columns={classColumns}
            data={classes}
            emptyTitle="No Classes Assigned"
            emptyMessage="This teacher has not been assigned to any classes yet."
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
