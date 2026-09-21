import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';
import { Card, Badge, Avatar, Skeleton, Table } from '../../../components/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  IdCard,
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

export const StudentDetailPage = () => {
  const { id } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getStudentById(id),
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

  const student = data?.student;
  const history = student?.enrollmentHistory || [];

  const historyColumns = [
    {
      key: 'class',
      label: 'Class',
      render: (val) => val?.name || 'N/A',
    },
    {
      key: 'enrolledAt',
      label: 'Enrolled',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge
          variant={
            val === 'active' ? 'success' : val === 'transferred' ? 'warning' : 'danger'
          }
          dot
        >
          {val}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <Card className="flex flex-col items-center text-center gap-4 p-6">
          <Avatar
            src={student?.profilePhoto}
            name={student?.fullName}
            size="xl"
          />
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              {student?.fullName}
            </h2>
            <Badge
              variant={student?.isActive ? 'success' : 'danger'}
              dot
              className="mt-1"
            >
              {student?.isActive ? 'Active Account' : 'Inactive Account'}
            </Badge>
          </div>
          <div className="w-full text-left space-y-0 divide-y divide-surface-100 dark:divide-surface-700">
            <InfoRow icon={Mail} label="Email" value={student?.email} />
            <InfoRow icon={Phone} label="Phone" value={student?.phone} />
            <InfoRow icon={IdCard} label="Student ID" value={student?.studentId} />
            <InfoRow
              icon={BookOpen}
              label="Enrolled Class"
              value={student?.enrolledClass?.name}
            />
            <InfoRow
              icon={Calendar}
              label="Registered On"
              value={
                student?.createdAt
                  ? new Date(student.createdAt).toLocaleDateString()
                  : 'N/A'
              }
            />
          </div>
        </Card>

        {/* Right — Enrollment History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Enrollment History
          </h3>
          <Table
            columns={historyColumns}
            data={history}
            emptyTitle="No Enrollment History"
            emptyMessage="This student has not been enrolled in any class yet."
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
