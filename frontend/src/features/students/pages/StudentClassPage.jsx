import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { MaterialsSection } from '../../classes/components/MaterialsSection';
import { StudentAttendance } from './StudentAttendance';
import { Card, Badge, Skeleton, EmptyState, Tabs } from '../../../components/ui';
import { BookOpen, Users, Calendar, GraduationCap, PlayCircle, ClipboardCheck } from 'lucide-react';

export const StudentClassPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isPending } = useQuery({
    queryKey: ['myStudentClass'],
    queryFn: classApi.getMyStudentClass,
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  const cls = data?.class;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
          My Class
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Your current academic cohort enrollment and resources
        </p>
      </div>

      {!cls ? (
        <Card className="p-8">
          <EmptyState
            icon={GraduationCap}
            title="Not Enrolled Yet"
            description="You are not currently enrolled in any class cohort. Please contact the college administration."
          />
        </Card>
      ) : (
        <>
          {/* Tabs */}
          <Tabs
            tabs={[
              { id: 'overview', label: 'Class Overview', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'materials', label: 'Lectures & Study Materials', icon: <PlayCircle className="w-4 h-4" /> },
              { id: 'attendance', label: 'Attendance Record', icon: <ClipboardCheck className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* Overview */}
          {activeTab === 'overview' && (
            <Card className="max-w-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                </div>
                <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot>
                  {cls.status?.toUpperCase()}
                </Badge>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#5A0D1A]">
                {cls.name}
              </h2>
              <p className="text-xs font-mono text-[#6B7280] mt-1">{cls.code}</p>

              {cls.description && (
                <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
                  {cls.description}
                </p>
              )}

              <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[#EFE5E0] text-sm text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#5A0D1A]" />
                  <span>
                    <strong className="text-[#111827]">
                      {cls.studentCount ?? 0}
                    </strong>{' '}
                    enrolled classmates
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#5A0D1A]" />
                  <span>
                    Academic Year:{' '}
                    <strong className="text-[#111827]">
                      {cls.academicYear}
                    </strong>
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Materials */}
          {activeTab === 'materials' && (
            <MaterialsSection
              classId={cls._id}
              userRole="student"
              canManage={false}
            />
          )}

          {/* Attendance */}
          {activeTab === 'attendance' && (
            <StudentAttendance />
          )}
        </>
      )}
    </div>
  );
};

export default StudentClassPage;
