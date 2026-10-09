import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { classApi } from '../../classes/api/classApi';
import quizApi from '../../quizzes/api/quizApi';
import { useAuth } from '../../../hooks/useAuth';
import { Skeleton, EmptyState } from '../../../components/ui';
import {
  DashboardHero,
  DashboardStatCard,
  DashboardActionCard,
} from '../../../components/dashboard';
import {
  BookOpen,
  FileText,
  Clock,
  Users,
  ChevronRight,
  ArrowRight,
  Calendar,
  BarChart2,
  MoreVertical,
} from 'lucide-react';

export const TeacherDashboardPage = () => {
  const { user } = useAuth();

  const { data: classesData, isPending: loadingClasses } = useQuery({
    queryKey: ['teacherDash-classes'],
    queryFn: () => classApi.getMyTeacherClasses(),
  });

  const { data: quizzesData, isPending: loadingQuizzes } = useQuery({
    queryKey: ['teacherDash-quizzes'],
    queryFn: () => quizApi.getQuizzes({ limit: 50 }),
  });

  const classes = classesData?.classes || [];
  const quizzes = quizzesData?.quizzes || [];

  const published = quizzes.filter((q) => q.status === 'published').length;
  const closed    = quizzes.filter((q) => q.status === 'closed').length;
  const draft     = quizzes.filter((q) => q.status === 'draft').length;

  const pendingGrading = quizzes.filter(
    (q) => q.status === 'closed' && q.questions?.some((qn) => qn.type === 'comprehensive')
  );

  const primaryClass = classes[0];
  const primaryQuiz = quizzes[0];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* ── 1. Global Hero Welcome Banner ── */}
      <DashboardHero
        name={user?.fullName || 'Irfan Ullah'}
        roleTitle="Teacher Dashboard"
        subtitle="Here's what's happening in your classes today."
        quote="“Empowering Young Minds for a Brighter Future”"
      />

      {/* ── 2. Four Circular-Badge Quick Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={BookOpen}
          iconBg="bg-[#701422] text-white"
          value={classes.length}
          label="Assigned Classes"
          to="/teacher/classes"
          loading={loadingClasses}
        />
        <DashboardStatCard
          icon={FileText}
          iconBg="bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200"
          value={quizzes.length}
          label="Total Quizzes"
          to="/teacher/quizzes"
          loading={loadingQuizzes}
        />
        <DashboardStatCard
          icon={BarChart2}
          iconBg="bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706]"
          value={published}
          label="Published & Live"
          to="/teacher/quizzes"
          loading={loadingQuizzes}
        />
        <DashboardStatCard
          icon={Clock}
          iconBg="bg-surface-200 dark:bg-surface-700/60 text-surface-800 dark:text-surface-200"
          value={pendingGrading.length}
          label="Pending Grading"
          to="/teacher/grading"
          loading={loadingQuizzes}
        />
      </div>

      {/* ── 3. Middle Section: My Classes & Recent Quizzes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: My Classes Container */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-[#EFE5E0] dark:border-surface-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-100 dark:border-surface-700/60 mb-4">
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-base">
                <BookOpen className="w-4.5 h-4.5 text-[#5A0D1A] dark:text-[#E89CB0]" />
                <span>My Classes</span>
              </div>
              <Link
                to="/teacher/classes"
                className="text-xs font-semibold text-[#5A0D1A] dark:text-[#E89CB0] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingClasses ? (
              <Skeleton className="h-28 rounded-xl" />
            ) : !primaryClass ? (
              <EmptyState
                icon={BookOpen}
                title="No Classes Assigned"
                message="You haven't been assigned to any classes yet."
              />
            ) : (
              <Link
                to={`/teacher/classes/${primaryClass._id}`}
                className="block p-3.5 rounded-xl border border-surface-200 dark:border-surface-700/80 hover:border-[#5A0D1A]/40 dark:hover:border-surface-600 bg-[#FAFAFA] dark:bg-surface-900/40 hover:bg-white dark:hover:bg-surface-900 transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#701422] to-[#4A0914] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen className="w-6 h-6 text-[#EEDAA2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-surface-900 dark:text-white truncate group-hover:text-[#5A0D1A] dark:group-hover:text-[#E89CB0] transition-colors">
                        {primaryClass.name}
                      </h3>
                      <p className="text-[11px] text-surface-400 mt-0.5">
                        {primaryClass.code} • {primaryClass.academicYear || '2025-2026'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400 mt-2">
                        <span className="flex items-center gap-1 font-medium text-rose-700 dark:text-rose-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>{primaryClass.studentCount || 25} students</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-surface-400" />
                          <span>Mon, Wed, Fri</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-[#5A0D1A] dark:group-hover:text-white transition-colors shrink-0" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Right: Recent Quizzes Container */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-[#EFE5E0] dark:border-surface-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-100 dark:border-surface-700/60 mb-4">
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-base">
                <FileText className="w-4.5 h-4.5 text-[#5A0D1A] dark:text-[#E89CB0]" />
                <span>Recent Quizzes</span>
              </div>
              <Link
                to="/teacher/quizzes"
                className="text-xs font-semibold text-[#5A0D1A] dark:text-[#E89CB0] hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingQuizzes ? (
              <Skeleton className="h-28 rounded-xl" />
            ) : !primaryQuiz ? (
              <EmptyState
                icon={FileText}
                title="No Quizzes Yet"
                message="You haven't created any quizzes yet."
              />
            ) : (
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-700/80 bg-[#FAFAFA] dark:bg-surface-900/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#701422] text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#EEDAA2]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-surface-900 dark:text-white truncate">
                        {primaryQuiz.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-surface-500 dark:text-surface-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-surface-400" />
                          <span>{primaryQuiz.duration || 60} min</span>
                        </span>
                        <span>•</span>
                        <span>{primaryQuiz.totalMarks || 1} marks</span>
                        <span>•</span>
                        <span>{primaryQuiz.attemptCount || 1} attempts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      <span>Published</span>
                    </span>
                    <button type="button" className="p-1 text-surface-400 hover:text-surface-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom 3 Status Counter Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-surface-100 dark:border-surface-700/60">
            <div className="text-center py-2 px-1 rounded-xl bg-[#FFF1F2] dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
              <p className="font-bold text-sm text-[#BE123C] leading-none">{draft}</p>
              <p className="text-[11px] text-[#BE123C]/80 mt-0.5 font-medium">Draft</p>
            </div>
            <div className="text-center py-2 px-1 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <p className="font-bold text-sm text-[#059669] leading-none">{published}</p>
              <p className="text-[11px] text-[#059669]/80 mt-0.5 font-medium">Published</p>
            </div>
            <div className="text-center py-2 px-1 rounded-xl bg-surface-100 dark:bg-surface-700/40 border border-surface-200 dark:border-surface-700/60">
              <p className="font-bold text-sm text-surface-600 dark:text-surface-300 leading-none">{closed}</p>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5 font-medium">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Three Action Navigation Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardActionCard
          title="Manage Students"
          description="View your students, attendance and performance."
          to="/teacher/classes"
          theme="crimson"
          watermarkIcon={Users}
        />
        <DashboardActionCard
          title="Create Quiz"
          description="Design and publish quizzes for your classes."
          to="/teacher/quizzes/new"
          theme="slate"
          watermarkIcon={FileText}
        />
        <DashboardActionCard
          title="View Results"
          description="Check quiz results and student performance."
          to="/teacher/grading"
          theme="gold"
          watermarkIcon={BarChart2}
        />
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
