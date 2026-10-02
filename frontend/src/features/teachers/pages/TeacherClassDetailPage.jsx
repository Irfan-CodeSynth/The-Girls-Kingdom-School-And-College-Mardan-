import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { MaterialsSection } from '../../classes/components/MaterialsSection';
import { AttendanceTab } from '../../classes/components/AttendanceTab';
import { Card, Badge, Skeleton, Table, EmptyState, Tabs } from '../../../components/ui';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Hash,
  PlayCircle,
  ClipboardCheck,
} from 'lucide-react';

export const TeacherClassDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('students');

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
      key: 'student',
      label: 'Student',
      render: (val) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-white text-sm">
            {val?.fullName || <span className="text-surface-400 italic">Unknown</span>}
          </p>
          <p className="text-xs text-surface-500">{val?.email}</p>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Reg #',
      render: (val) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700">
          {val?.studentId || 'N/A'}
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
              <strong className="text-surface-900 dark:text-white">{students.length}</strong> students enrolled
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

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'students', label: 'Enrolled Students', icon: <Users className="w-4 h-4" />, count: students.length },
          { id: 'materials', label: 'Materials & Lectures', icon: <PlayCircle className="w-4 h-4" /> },
          { id: 'attendance', label: 'Daily Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'students' && (
        <Table
          columns={studentColumns}
          data={students}
          loading={studentsPending}
          emptyTitle="No Students Enrolled"
          emptyMessage="No students are currently enrolled in this class."
        />
      )}

      {activeTab === 'materials' && (
        <MaterialsSection classId={id} userRole="teacher" canManage={true} />
      )}

      {activeTab === 'attendance' && (
        <AttendanceTab classId={id} canManage={true} />
      )}
    </div>
  );
};

export default TeacherClassDetailPage;
