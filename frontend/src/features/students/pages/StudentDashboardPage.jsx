import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { classApi } from '../../classes/api/classApi';
import quizApi from '../../quizzes/api/quizApi';
import feeApi from '../../fees/api/feeApi';
import { useAuth } from '../../../hooks/useAuth';
import { Skeleton, EmptyState } from '../../../components/ui';
import {
  DashboardHero,
  DashboardStatCard,
  DashboardActionCard,
} from '../../../components/dashboard';
import {
  BookOpen,
  ClipboardList,
  ChevronRight,
  Clock,
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Wallet,
  Award,
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user } = useAuth();

  const { data: classData, isPending: loadingClass } = useQuery({
    queryKey: ['studentDash-class'],
    queryFn: () => classApi.getMyStudentClass(),
  });

  const { data: quizzesData, isPending: loadingQuizzes } = useQuery({
    queryKey: ['studentDash-quizzes'],
    queryFn: () => quizApi.getQuizzes(),
  });

  const { data: feeData, isPending: loadingFees } = useQuery({
    queryKey: ['studentDash-fees'],
    queryFn: () => feeApi.getMyChallans(),
    retry: false,
  });

  const myClass = classData?.class || null;
  const quizzes = quizzesData?.quizzes || [];
  const feeSummary = feeData?.summary;
  const outstandingAmount = feeSummary?.totalOutstandingAmount ?? 0;

  const available = quizzes.filter((q) => q.status === 'published');
  const attempted = quizzes.filter((q) =>
    q.myAttempts?.some((a) => a.status === 'submitted' || a.status === 'graded')
  );
  const completed = attempted.length;

  const gradedAttempts = quizzes.flatMap((q) =>
    (q.myAttempts || []).filter((a) => a.status === 'graded')
  );
  const avgScore =
    gradedAttempts.length > 0
      ? Math.round(
          gradedAttempts.reduce((sum, a) => sum + (a.obtainedMarks / a.totalMarks) * 100, 0) /
            gradedAttempts.length
        )
      : null;

  const primaryQuiz = available[0] || quizzes[0];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto font-sans">
      {/* ── 1. Global Hero Welcome Banner ── */}
      <DashboardHero
        name={user?.fullName || 'Ayesha Khan'}
        roleTitle="Student Academic Portal"
        subtitle="Track your daily class routine, assessments, transcripts, and fee status."
        quote="“Educating Girls Today for a Brighter Tomorrow”"
      />

      {/* ── 2. Four Circular-Badge Quick Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={BookOpen}
          iconBg="bg-[#701422] text-white"
          value={myClass?.code || 'CS-101'}
          label="Enrolled Class"
          to="/student/classes"
          loading={loadingClass}
        />
        <DashboardStatCard
          icon={ClipboardList}
          iconBg="bg-gray-100 text-gray-700"
          value={completed}
          label="Quizzes Completed"
          to="/student/quizzes"
          loading={loadingQuizzes}
        />
        <DashboardStatCard
          icon={Trophy}
          iconBg="bg-[#FEF3C7] text-[#D97706]"
          value={avgScore !== null ? `${avgScore}%` : 'Grade A'}
          label="Academic Average"
          to="/student/results"
          loading={loadingQuizzes}
        />
        <DashboardStatCard
          icon={Wallet}
          iconBg="bg-[#ECFDF5] text-[#059669]"
          value={outstandingAmount === 0 ? 'Cleared' : `PKR ${outstandingAmount}`}
          label="Fee Voucher Status"
          to="/student/fees"
          loading={loadingFees}
        />
      </div>

      {/* ── 3. Middle Section: Enrolled Class & Quizzes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: My Class Details */}
        <div className="bg-white rounded-2xl p-5 border border-[#EFE5E0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-[#111827] font-bold text-base">
                <BookOpen className="w-4.5 h-4.5 text-[#5A0D1A]" />
                <span>My Enrolled Class Cohort</span>
              </div>
              <Link
                to="/student/classes"
                className="text-xs font-semibold text-[#5A0D1A] hover:underline flex items-center gap-1 font-sans"
              >
                <span>Class Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingClass ? (
              <Skeleton className="h-28 rounded-xl" />
            ) : !myClass ? (
              <EmptyState
                icon={BookOpen}
                title="Enrollment Pending"
                message="Your admission enrollment is currently being finalized."
              />
            ) : (
              <Link
                to="/student/classes"
                className="block p-3.5 rounded-xl border border-gray-200 hover:border-[#5A0D1A]/40 bg-[#FAFAFA] hover:bg-white transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#701422] to-[#4A0914] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen className="w-6 h-6 text-[#EEDAA2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#111827] truncate group-hover:text-[#5A0D1A] transition-colors">
                        {myClass.name}
                      </h3>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 font-sans">
                        {myClass.code} • Academic Year {myClass.academicYear || '2025-2026'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#4B5563] mt-2 font-sans">
                        <span className="flex items-center gap-1 font-medium text-rose-700">
                          <Users className="w-3.5 h-3.5" />
                          <span>Active Cohort</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Mon - Sat Routine</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5A0D1A] transition-colors shrink-0" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Right: Available Quizzes Container */}
        <div className="bg-white rounded-2xl p-5 border border-[#EFE5E0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-[#111827] font-bold text-base">
                <ClipboardList className="w-4.5 h-4.5 text-[#5A0D1A]" />
                <span>Active Quizzes & Assessments</span>
              </div>
              <Link
                to="/student/quizzes"
                className="text-xs font-semibold text-[#5A0D1A] hover:underline flex items-center gap-1 font-sans"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingQuizzes ? (
              <Skeleton className="h-28 rounded-xl" />
            ) : !primaryQuiz ? (
              <EmptyState
                icon={ClipboardList}
                title="No Active Quizzes"
                message="You are all caught up! No quizzes are currently due."
              />
            ) : (
              <div className="p-3.5 rounded-xl border border-gray-200 bg-[#FAFAFA]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#701422] text-white flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-[#EEDAA2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#111827] truncate">
                        {primaryQuiz.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#4B5563] mt-1 font-sans">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{primaryQuiz.duration || 60} min</span>
                        </span>
                        <span>•</span>
                        <span>{primaryQuiz.totalMarks || 1} marks</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/student/quizzes/${primaryQuiz._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A0D1A] hover:bg-[#701422] text-[#EEDAA2] text-xs font-bold transition-colors shadow-xs font-sans"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Status Counter Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-gray-100 font-sans">
            <div className="text-center py-2 px-1 rounded-xl bg-[#ECFDF5] border border-emerald-200">
              <p className="font-bold text-sm text-[#059669] leading-none">{available.length}</p>
              <p className="text-[11px] text-[#059669]/80 mt-0.5 font-medium">Available</p>
            </div>
            <div className="text-center py-2 px-1 rounded-xl bg-[#FFF1F2] border border-rose-200">
              <p className="font-bold text-sm text-[#BE123C] leading-none">{completed}</p>
              <p className="text-[11px] text-[#BE123C]/80 mt-0.5 font-medium">Completed</p>
            </div>
            <div className="text-center py-2 px-1 rounded-xl bg-gray-100 border border-gray-200">
              <p className="font-bold text-sm text-gray-600 leading-none">{gradedAttempts.length}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Graded</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Three Action Navigation Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardActionCard
          title="Daily Routine & Timetable"
          description="View your period-by-period class schedule and exam datesheets."
          to="/student/schedule"
          theme="crimson"
          watermarkIcon={Calendar}
        />
        <DashboardActionCard
          title="Transcripts & Results"
          description="Check official quiz scores, answer keys, and performance reports."
          to="/student/results"
          theme="slate"
          watermarkIcon={Award}
        />
        <DashboardActionCard
          title="Fee Challans & Vouchers"
          description="Download monthly fee challans and view payment receipts."
          to="/student/fees"
          theme="gold"
          watermarkIcon={Wallet}
        />
      </div>
    </div>
  );
};

export default StudentDashboardPage;
