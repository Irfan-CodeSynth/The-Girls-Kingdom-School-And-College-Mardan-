import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../config/api';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

const STATUS_BADGES = {
  present: { variant: 'success', label: 'Present', icon: CheckCircle },
  absent: { variant: 'danger', label: 'Absent', icon: XCircle },
  late: { variant: 'warning', label: 'Late', icon: Clock },
  excused: { variant: 'secondary', label: 'Excused', icon: ShieldAlert },
};

export const StudentAttendance = () => {
  const { data, isPending } = useQuery({
    queryKey: ['myStudentAttendance'],
    queryFn: async () => {
      const res = await api.get('/students/my-attendance');
      return res.data?.data || res.data;
    },
  });

  const records = useMemo(() => {
    return data?.records || [];
  }, [data]);

  // Aggregate student overall statistics
  const stats = useMemo(() => {
    const total = records.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    records.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, absent, late, excused, rate };
  }, [records]);

  // Group records by class
  const groupedByClass = useMemo(() => {
    const map = new Map();
    records.forEach((rec) => {
      const classId = rec.class?._id || 'unassigned';
      const className = rec.class?.name || 'Class Attendance';
      const classCode = rec.class?.code || '';

      if (!map.has(classId)) {
        map.set(classId, {
          name: className,
          code: classCode,
          items: [],
        });
      }
      map.get(classId).items.push(rec);
    });
    return Array.from(map.values());
  }, [records]);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
          Attendance Record
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Your official institutional attendance and session turnout history
        </p>
      </div>

      {/* 75% Institutional Threshold Warning Banner */}
      {records.length > 0 && stats.rate < 75 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Attendance Alert: Below 75% Institutional Threshold
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Your overall attendance rate is currently <strong>{stats.rate}%</strong>. The College Board requires a minimum attendance rate of 75% to be eligible for end-of-term examinations. Please contact your class teacher.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Attendance Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${stats.rate >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {stats.rate}%
            </span>
            <Badge variant={stats.rate >= 75 ? 'success' : 'warning'}>
              {stats.rate >= 75 ? 'Eligible' : 'At Risk'}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Sessions Recorded
          </span>
          <p className="text-2xl font-black text-[#111827] mt-2">
            {stats.total}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Present
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {stats.present}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Absent
          </span>
          <p className="text-2xl font-black text-rose-700 mt-2">
            {stats.absent}
          </p>
        </Card>
      </div>

      {/* Records Tables */}
      {!records.length ? (
        <Card className="p-8">
          <EmptyState
            icon={Calendar}
            title="No Attendance Recorded"
            description="No attendance sessions have been logged for your account yet. Check back after your teacher marks roll-call."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByClass.map((clsGroup, gIdx) => {
            const classTotal = clsGroup.items.length;
            const classPresent = clsGroup.items.filter((i) => i.status === 'present').length;
            const classRate = classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 0;

            return (
              <Card key={gIdx} className="overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-[#EFE5E0] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#5A0D1A]" />
                    <h3 className="font-bold text-[#111827]">
                      {clsGroup.name}
                    </h3>
                    {clsGroup.code && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#EFE5E0] text-[#5A0D1A]">
                        {clsGroup.code}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#6B7280]">
                      Class Rate: <strong className="text-[#111827]">{classRate}%</strong>
                    </span>
                    <Badge variant={classRate >= 75 ? 'success' : 'warning'}>
                      {classPresent}/{classTotal} Attended
                    </Badge>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans">
                    <thead className="bg-[#FAF8F5] text-[#6B7280] uppercase text-[11px] font-bold tracking-wider border-b border-[#EFE5E0]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE5E0] bg-white">
                      {clsGroup.items.map((entry) => {
                        const dateFormatted = entry.date
                          ? new Date(entry.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A';

                        const badgeCfg = STATUS_BADGES[entry.status] || STATUS_BADGES.present;
                        const IconComponent = badgeCfg.icon;

                        return (
                          <tr
                            key={entry._id}
                            className="hover:bg-[#FAF8F5] transition-colors"
                          >
                            <td className="py-3 px-4 font-bold text-[#111827] flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#5A0D1A]" />
                              <span>{dateFormatted}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={badgeCfg.variant} className="inline-flex items-center gap-1">
                                <IconComponent className="w-3 h-3" />
                                <span>{badgeCfg.label}</span>
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-[#4B5563] text-xs">
                              {entry.remarks ? (
                                <span className="italic">"{entry.remarks}"</span>
                              ) : (
                                <span className="text-[#9CA3AF]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
