import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { AttendanceTab } from '../../classes/components/AttendanceTab';
import { Card, Skeleton, EmptyState } from '../../../components/ui';
import { ClipboardCheck, BookOpen } from 'lucide-react';

export const AdminAttendancePage = () => {
  const [selectedClassId, setSelectedClassId] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['classesList'],
    queryFn: () => classApi.getClasses({ limit: 100 }),
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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            Institutional Attendance Governance
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Audit school-wide attendance records, inspect roll-calls, and monitor institutional turnout
          </p>
        </div>

        {/* Class Switcher */}
        {classes.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 block mb-1">
              Select Class Cohort:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-primary-500 shadow-xs"
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
        <Card className="p-8">
          <EmptyState
            icon={BookOpen}
            title="No Classes Found"
            message="No class cohorts exist in the institution yet. Create a class first to manage its attendance."
          />
        </Card>
      ) : selectedClassId ? (
        <AttendanceTab key={selectedClassId} classId={selectedClassId} canManage={true} />
      ) : (
        <Card className="p-8 text-center text-surface-500">
          Please select a class from the dropdown above to view attendance records.
        </Card>
      )}
    </div>
  );
};

export default AdminAttendancePage;
