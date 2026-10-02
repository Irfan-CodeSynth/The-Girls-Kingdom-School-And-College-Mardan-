import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi } from '../api/classApi';
import { Card, Badge, Button, Avatar, Skeleton, EmptyState } from '../../../components/ui';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  Save,
  Users,
  TrendingUp,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  present: {
    label: 'Present',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    activeBadge: 'bg-emerald-600 text-white',
    icon: CheckCircle,
  },
  absent: {
    label: 'Absent',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    activeBadge: 'bg-rose-600 text-white',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    activeBadge: 'bg-amber-600 text-white',
    icon: Clock,
  },
  excused: {
    label: 'Excused',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    activeBadge: 'bg-sky-600 text-white',
    icon: ShieldAlert,
  },
};

export const AttendanceTab = ({ classId, canManage = true }) => {
  const queryClient = useQueryClient();

  // Selected date in YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Local state for attendance records: map of studentId -> { status, remarks }
  const [attendanceSheet, setAttendanceSheet] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // 1. Fetch Enrolled Students for this Class
  const {
    data: studentsData,
    isPending: studentsPending,
  } = useQuery({
    queryKey: ['classStudents', classId],
    queryFn: () => classApi.getClassStudents(classId),
    enabled: Boolean(classId),
  });

  const enrolledStudents = useMemo(() => {
    return studentsData?.students || [];
  }, [studentsData]);

  // 2. Fetch existing Attendance for the selected date
  const {
    data: dateAttendanceData,
    isPending: attendancePending,
    isFetching: attendanceFetching,
  } = useQuery({
    queryKey: ['attendance', classId, selectedDate],
    queryFn: () => classApi.getAttendanceByDate(classId, selectedDate),
    enabled: Boolean(classId && selectedDate),
  });

  // 3. Fetch Class Overall Summary
  const {
    data: summaryData,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['classAttendanceSummary', classId],
    queryFn: () => classApi.getClassAttendanceSummary(classId),
    enabled: Boolean(classId),
  });

  // Re-populate local attendance sheet whenever students or fetched date records change
  useEffect(() => {
    if (!enrolledStudents.length) return;

    const existingRecords = dateAttendanceData?.records || [];
    const recordMap = new Map();
    existingRecords.forEach((rec) => {
      const studentId = rec.student?._id || rec.student;
      if (studentId) {
        recordMap.set(String(studentId), {
          status: rec.status || 'present',
          remarks: rec.remarks || '',
        });
      }
    });

    const initialSheet = {};
    enrolledStudents.forEach((item) => {
      const student = item.student || item;
      const sId = String(student._id || student.id);
      if (recordMap.has(sId)) {
        initialSheet[sId] = recordMap.get(sId);
      } else {
        // Default to present for quick 1-click roll call
        initialSheet[sId] = { status: 'present', remarks: '' };
      }
    });

    setAttendanceSheet(initialSheet);
    setIsDirty(false);
  }, [enrolledStudents, dateAttendanceData]);

  // Save Attendance Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => classApi.saveAttendance(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', classId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['classAttendanceSummary', classId] });
      setIsDirty(false);
      toast.success(`Attendance saved successfully for ${selectedDate}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save attendance records.');
    },
  });

  const handleStatusChange = (studentId, status) => {
    if (!canManage) return;
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status,
      },
    }));
    setIsDirty(true);
  };

  const handleRemarksChange = (studentId, remarks) => {
    if (!canManage) return;
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        remarks,
      },
    }));
    setIsDirty(true);
  };

  // Bulk Quick Mark Actions
  const handleBulkMark = (status) => {
    if (!canManage || !enrolledStudents.length) return;
    const updated = {};
    enrolledStudents.forEach((item) => {
      const student = item.student || item;
      const sId = String(student._id || student.id);
      updated[sId] = {
        ...(attendanceSheet[sId] || {}),
        status,
      };
    });
    setAttendanceSheet(updated);
    setIsDirty(true);
    toast.info(`Marked all students as ${status.toUpperCase()}`);
  };

  const handleSave = () => {
    if (!enrolledStudents.length) {
      toast.error('No students enrolled in this class cohort to record attendance for.');
      return;
    }

    const records = Object.entries(attendanceSheet).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks || '',
    }));

    saveMutation.mutate({
      date: selectedDate,
      records,
    });
  };

  // Counts for the active day
  const dayStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    Object.values(attendanceSheet).forEach((rec) => {
      if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;
      else if (rec.status === 'excused') excused++;
    });
    const total = enrolledStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  }, [attendanceSheet, enrolledStudents]);

  const summary = summaryData?.summary || {};

  if (studentsPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Date Selector & Overall Attendance Rate ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Selector Card */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 block mb-1">
              Roll-Call Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                title="Jump to Today"
              >
                Today
              </Button>
            </div>
          </div>
          {attendanceFetching && (
            <p className="text-xs text-primary-500 mt-2 animate-pulse">
              Syncing date records...
            </p>
          )}
        </Card>

        {/* Day Breakdown Card */}
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
            Selected Day Turnout ({selectedDate})
          </span>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-2xl font-bold text-surface-900 dark:text-white">
                {dayStats.rate}%
              </span>
              <p className="text-xs text-surface-500">
                {dayStats.present} of {dayStats.total} students present
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              <Badge variant="success">{dayStats.present} Present</Badge>
              <Badge variant="error">{dayStats.absent} Absent</Badge>
              {dayStats.late > 0 && <Badge variant="warning">{dayStats.late} Late</Badge>}
              {dayStats.excused > 0 && <Badge variant="secondary">{dayStats.excused} Excused</Badge>}
            </div>
          </div>
        </Card>

        {/* Cumulative Class Rate Card */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
              Term Attendance Rate
            </span>
            <TrendingUp className="w-4 h-4 text-primary-500" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-surface-900 dark:text-white">
                {summary.attendanceRate ?? 0}%
              </span>
              <span className="text-xs text-surface-500">
                across {summary.daysCount ?? 0} recorded sessions
              </span>
            </div>
            {summary.attendanceRate !== undefined && summary.attendanceRate < 75 && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Class is below the 75% institutional threshold
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Main Attendance Sheet ── */}
      <Card className="overflow-hidden">
        {/* Actions header */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-surface-900 dark:text-white text-base">
              Roll-Call Sheet
            </h3>
            <span className="text-xs text-surface-500">
              ({enrolledStudents.length} students enrolled)
            </span>
            {isDirty && (
              <Badge variant="warning" dot>
                Unsaved Changes
              </Badge>
            )}
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-surface-500 mr-1 hidden sm:inline">
                Quick Mark:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMark('present')}
                className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMark('absent')}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                All Absent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMark('late')}
                className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                All Late
              </Button>

              <div className="h-5 w-px bg-surface-200 dark:bg-surface-700 mx-1" />

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                loading={saveMutation.isPending}
                disabled={saveMutation.isPending || !enrolledStudents.length}
              >
                Save Attendance
              </Button>
            </div>
          )}
        </div>

        {/* Attendance Table */}
        {!enrolledStudents.length ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No Students Enrolled"
              message="Please enroll students in this class before taking attendance."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-100/75 dark:bg-surface-800 text-surface-600 dark:text-surface-400 uppercase text-[11px] font-semibold tracking-wider border-b border-surface-200 dark:border-surface-700">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reg / Roll #</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/60">
                {enrolledStudents.map((item, idx) => {
                  const student = item.student || item;
                  const sId = String(student._id || student.id);
                  const record = attendanceSheet[sId] || { status: 'present', remarks: '' };
                  const currentStatus = record.status;

                  return (
                    <tr
                      key={sId}
                      className="hover:bg-surface-50/60 dark:hover:bg-surface-800/40 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-3 px-4 text-surface-400 font-mono text-xs">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.profilePhoto}
                            alt={student.fullName}
                            name={student.fullName || 'Student'}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-surface-900 dark:text-white leading-tight">
                              {student.fullName || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-surface-500 font-mono">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Reg # */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                          {student.studentId || item.rollNumber || 'N/A'}
                        </span>
                      </td>

                      {/* Status Selector Pills */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {Object.keys(STATUS_CONFIG).map((st) => {
                            const isSelected = currentStatus === st;
                            const cfg = STATUS_CONFIG[st];
                            const IconComponent = cfg.icon;

                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={!canManage}
                                onClick={() => handleStatusChange(sId, st)}
                                className={`
                                  flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border
                                  ${
                                    isSelected
                                      ? `${cfg.activeBadge} shadow-xs scale-102`
                                      : `${cfg.color} opacity-60 hover:opacity-100`
                                  }
                                  ${!canManage ? 'cursor-default' : 'cursor-pointer'}
                                `}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                                <span>{cfg.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={!canManage}
                          value={record.remarks}
                          onChange={(e) => handleRemarksChange(sId, e.target.value)}
                          placeholder={canManage ? 'Optional remarks / excuse...' : 'None'}
                          maxLength={250}
                          className="w-full px-2.5 py-1 text-xs rounded border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-primary-500 disabled:bg-surface-50 dark:disabled:bg-surface-900 disabled:text-surface-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with save button */}
        {canManage && enrolledStudents.length > 0 && (
          <div className="p-4 bg-surface-50/50 dark:bg-surface-800/50 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
            <span className="text-xs text-surface-500">
              * Remember to click <strong>Save Attendance</strong> to record this session to the institutional database.
            </span>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending}
            >
              Save Attendance
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceTab;
