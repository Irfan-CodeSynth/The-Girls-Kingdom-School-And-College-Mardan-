import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { AttendanceTab } from '../../classes/components/AttendanceTab';
import { Skeleton, EmptyState } from '../../../components/ui';
import { ClipboardCheck, BookOpen } from 'lucide-react';

export const TeacherAttendancePage = () => {
  const [selectedClassId, setSelectedClassId] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['myTeacherClasses'],
    queryFn: classApi.getMyTeacherClasses,
  });

  const classes = data?.classes || [];

  // Automatically select the first class when loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0]._id);
    }
  }, [classes, selectedClassId]);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Faculty Attendance Portal
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Class Attendance Roll-Call
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            Conduct daily roll-calls, record student turnout, and track attendance percentage.
          </p>
        </div>

        {/* Class Switcher */}
        {classes.length > 0 && (
          <div className="w-full sm:w-80">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1.5">
              Assigned Class:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] shadow-xs transition-colors"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code}) — {cls.academicYear}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center shadow-xs">
          <EmptyState
            icon={BookOpen}
            title="No Classes Assigned"
            message="You are not currently assigned to teach any classes. Once an administrator assigns you to a class, you will be able to take attendance here."
          />
        </div>
      ) : selectedClassId ? (
        <AttendanceTab key={selectedClassId} classId={selectedClassId} canManage={true} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] p-8 text-center text-[#6B7280] shadow-xs">
          Please select a class from the dropdown above to view roll-call.
        </div>
      )}
    </div>
  );
};

export default TeacherAttendancePage;
