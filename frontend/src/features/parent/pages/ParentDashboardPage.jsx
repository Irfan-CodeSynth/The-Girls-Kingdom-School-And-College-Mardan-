import React from 'react';
import { NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Wallet,
  Calendar,
  Award,
  Video,
  Bell,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';
import parentApi from '../api/parentApi';
import ChildSelectorBar from '../components/ChildSelectorBar';

export const ParentDashboardPage = () => {
  const { selectedChildId, selectedChild } = useParentChild();

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildSummary', selectedChildId],
    queryFn: () => parentApi.getChildSummary(selectedChildId),
    enabled: Boolean(selectedChildId),
  });

  const kpis = data?.kpis || {};
  const attendance = kpis.attendance || {};
  const fees = kpis.fees || {};
  const quizzes = kpis.quizzes || {};
  const exams = kpis.exams || {};
  const tuitions = kpis.tuitions || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ward Selector Bar */}
      <ChildSelectorBar />

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5A0D1A] to-[#801426] p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="text-white/90 border-white/30 bg-white/10 mb-3 gap-1 px-3 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Parent Oversight Portal
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, Guardian
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2.5 leading-relaxed">
            Monitor {selectedChild?.fullName || 'your ward'}&apos;s institutional attendance, fee challans, examination routines, quizzes, and digital tuition lectures from one secure dashboard.
          </p>
        </div>
      </div>

      {/* 5 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="font-serif text-2xl font-bold text-[#111827]">
                  {attendance.percentage ?? 100}%
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {attendance.presentDays || 0} Present • {attendance.absentDays || 0} Absent
                </p>
              </>
            )}
          </div>
          <NavLink
            to="/parent/attendance"
            className="text-xs font-bold text-[#5A0D1A] hover:underline flex items-center gap-1 pt-1"
          >
            Audit Logs <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        {/* 2. Fee Account Status */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Fee Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="font-serif text-2xl font-bold text-[#111827]">
                  {fees.totalDues > 0 ? `PKR ${fees.totalDues}` : 'Clear'}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {fees.unpaidCount > 0
                    ? `${fees.unpaidCount} Pending Challan`
                    : 'All Challans Paid'}
                </p>
              </>
            )}
          </div>
          <NavLink
            to="/parent/fees"
            className="text-xs font-bold text-[#5A0D1A] hover:underline flex items-center gap-1 pt-1"
          >
            View Challans <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        {/* 3. Exam Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Exams
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="font-serif text-2xl font-bold text-[#111827]">
                  {exams.upcomingCount || 0}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                  {exams.nextExam ? `Next: ${exams.nextExam.subject}` : 'No Active Exams'}
                </p>
              </>
            )}
          </div>
          <NavLink
            to="/parent/schedule"
            className="text-xs font-bold text-[#5A0D1A] hover:underline flex items-center gap-1 pt-1"
          >
            Datesheet <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        {/* 4. Quizzes & Academic Scores */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Quiz Average
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="font-serif text-2xl font-bold text-[#111827]">
                  {quizzes.averagePercentage !== null ? `${quizzes.averagePercentage}%` : '—'}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {quizzes.totalAttempts || 0} Quizzes Attempted
                </p>
              </>
            )}
          </div>
          <NavLink
            to="/parent/results"
            className="text-xs font-bold text-[#5A0D1A] hover:underline flex items-center gap-1 pt-1"
          >
            Quiz Grades <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        {/* 5. Online Tuitions Progress */}
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Online Tuitions
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="font-serif text-2xl font-bold text-[#111827]">
                  {tuitions.averageProgress || 0}%
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {tuitions.enrolledCount || 0} Courses Enrolled
                </p>
              </>
            )}
          </div>
          <NavLink
            to="/parent/tuitions"
            className="text-xs font-bold text-[#5A0D1A] hover:underline flex items-center gap-1 pt-1"
          >
            Digital LMS <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>
      </div>

      {/* Feature Navigation Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NavLink
          to="/parent/attendance"
          className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center group-hover:bg-[#5A0D1A] group-hover:text-white transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#111827]">
            Daily Attendance Audit
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Inspect daily morning roll calls, monthly presence graphs, unexcused absence flags, and leave records.
          </p>
        </NavLink>

        <NavLink
          to="/parent/fees"
          className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center group-hover:bg-[#5A0D1A] group-hover:text-white transition-colors">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#111827]">
            Institutional Fee Challans
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Download and print monthly bank challans, verify fee payment receipts, and stay ahead of due dates.
          </p>
        </NavLink>

        <NavLink
          to="/parent/tuitions"
          className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs hover:shadow-md transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center group-hover:bg-[#5A0D1A] group-hover:text-white transition-colors">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#111827]">
            Online Tuitions & Digital LMS
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Track video lecture watch completion, study notes downloads, and gatekeeper quiz attempt results.
          </p>
        </NavLink>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
