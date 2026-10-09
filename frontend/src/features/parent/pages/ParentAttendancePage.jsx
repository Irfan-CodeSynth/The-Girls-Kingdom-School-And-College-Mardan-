import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';
import parentApi from '../api/parentApi';
import ChildSelectorBar from '../components/ChildSelectorBar';

const STATUS_CONFIG = {
  present: { label: 'Present', variant: 'success', bg: 'bg-emerald-50 text-emerald-700' },
  absent: { label: 'Absent', variant: 'danger', bg: 'bg-rose-50 text-rose-700' },
  late: { label: 'Late', variant: 'warning', bg: 'bg-amber-50 text-amber-700' },
  excused: { label: 'Excused', variant: 'default', bg: 'bg-blue-50 text-blue-700' },
};

export const ParentAttendancePage = () => {
  const { selectedChildId, selectedChild } = useParentChild();
  const currentMonthStr = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildAttendance', selectedChildId, selectedMonth],
    queryFn: () => parentApi.getChildAttendance(selectedChildId, { month: selectedMonth }),
    enabled: Boolean(selectedChildId),
  });

  const records = data?.records || [];
  const summary = data?.summary || { total: 0, present: 0, absent: 0, late: 0, percentage: 100 };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ward Selector Bar */}
      <ChildSelectorBar />

      {/* Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#111827]">
            Daily Attendance Audit
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Institutional presence records for {selectedChild?.fullName || 'student'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#6B7280]">Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 rounded-xl border border-[#EFE5E0] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
          />
        </div>
      </div>

      {/* Attendance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Attendance Rate
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#111827] mt-1">
            {summary.percentage}%
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Overall for {selectedMonth}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Present Days
          </p>
          <p className="font-serif text-3xl font-extrabold text-emerald-600 mt-1">
            {summary.present}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Full attendance recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Absent Days
          </p>
          <p className="font-serif text-3xl font-extrabold text-rose-600 mt-1">
            {summary.absent}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Unexcused absence</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Late Arrivals
          </p>
          <p className="font-serif text-3xl font-extrabold text-amber-600 mt-1">
            {summary.late}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Morning bell delay</p>
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
        <div className="p-4 bg-[#FAF8F5] border-b border-[#EFE5E0] flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#111827]">
            Session Log History
          </h3>
          <span className="text-xs text-[#6B7280] font-semibold">
            {records.length} Total Sessions Recorded
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B7280]">
            No attendance records found for {selectedMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5]/60 text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#EFE5E0]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {records.map((r) => {
                  const d = new Date(r.date);
                  const dateFormatted = d.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.present;

                  return (
                    <tr key={r._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#111827]">{dateFormatted}</td>
                      <td className="py-3 px-4 text-[#6B7280]">{dayName}</td>
                      <td className="py-3 px-4">
                        <Badge variant={cfg.variant} className="capitalize text-[10px]">
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#6B7280] font-medium">
                        {r.class?.name || 'Class 11'}
                      </td>
                      <td className="py-3 px-4 text-[#6B7280]">
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentAttendancePage;
