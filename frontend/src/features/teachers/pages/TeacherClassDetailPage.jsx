import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { MaterialsSection } from '../../classes/components/MaterialsSection';
import { AttendanceTab } from '../../classes/components/AttendanceTab';
import { Card, Badge, Skeleton, Table, Tabs } from '../../../components/ui';
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
          <p className="font-bold text-[#111827] text-sm">
            {val?.fullName || <span className="text-[#9CA3AF] italic">Unknown</span>}
          </p>
          <p className="text-xs text-[#6B7280]">{val?.email}</p>
        </div>
      ),
    },
    {
      key: 'student',
      label: 'Roll / Reg #',
      render: (val) => (
        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A] font-bold">
          {val?.studentId || 'N/A'}
        </span>
      ),
    },
    {
      key: 'enrolledAt',
      label: 'Enrollment Date',
      render: (val) => (
        <span className="text-xs text-[#6B7280]">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/teacher/classes"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Classes</span>
      </Link>

      {/* Class Header Banner */}
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A] font-bold">
                  {cls?.code}
                </span>
                <Badge variant={cls?.status === 'active' ? 'success' : 'default'} dot>
                  {cls?.status?.toUpperCase()}
                </Badge>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
                {cls?.name}
              </h1>
              {cls?.description && (
                <p className="text-sm text-[#4B5563] mt-2 max-w-xl leading-relaxed">
                  {cls.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[#EFE5E0] text-sm text-[#6B7280]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#5A0D1A]" />
            <span>
              <strong className="text-[#111827]">{students.length}</strong> students enrolled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#5A0D1A]" />
            <span>
              Academic Year:{' '}
              <strong className="text-[#111827]">{cls?.academicYear}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#5A0D1A]" />
            <span>
              Class Code:{' '}
              <strong className="font-mono text-[#111827]">{cls?.code}</strong>
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
