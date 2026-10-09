import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { studentApi } from '../../students/api/studentApi';
import { teacherApi } from '../../teachers/api/teacherApi';
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
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  ChevronRight,
  ArrowRight,
  Calendar,
  Wallet,
  Clock,
  MoreVertical,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const { data: studentsData, isPending: loadingStudents } = useQuery({
    queryKey: ['students', 'adminDash'],
    queryFn: () => studentApi.getStudents({ limit: 5 }),
  });

  const { data: teachersData, isPending: loadingTeachers } = useQuery({
    queryKey: ['teachers', 'adminDash'],
    queryFn: () => teacherApi.getTeachers({ limit: 5 }),
  });

  const { data: classesData, isPending: loadingClasses } = useQuery({
    queryKey: ['classes', 'adminDash'],
    queryFn: () => classApi.getClasses({ limit: 20 }),
  });

  const { data: quizzesData, isPending: loadingQuizzes } = useQuery({
    queryKey: ['quizzes', 'adminDash'],
    queryFn: () => quizApi.getQuizzes({ limit: 100 }),
  });

  const students = studentsData?.students || [];
  const totalStudents = studentsData?.pagination?.total ?? students.length;
  const teachers = teachersData?.teachers || [];
  const totalTeachers = teachersData?.pagination?.total ?? teachers.length;
  const classes = classesData?.classes || [];
  const totalClasses = classesData?.pagination?.total ?? classes.length;

  const quizzes = quizzesData?.quizzes || [];
  const quizByStatus = quizzes.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {});

  const activeQuizzes = quizByStatus.published || 0;
  const draftQuizzes  = quizByStatus.draft || 0;
  const closedQuizzes = quizByStatus.closed || 0;

  const recentClasses = classes.slice(0, 2);
  const primaryQuiz = quizzes[0];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* ── 1. Global Hero Welcome Banner ── */}
      <DashboardHero
        name={user?.fullName || 'System Administrator'}
        roleTitle="Admin Executive Dashboard"
        subtitle="System-wide institutional overview of The Girls Kingdom School & College Mardan."
        quote="“Guiding the Leaders of Tomorrow with Wisdom and Grace”"
      />

      {/* ── 2. Four Circular-Badge Quick Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={Users}
          iconBg="bg-[#701422] text-white"
          value={totalStudents}
          label="Registered Students"
          to="/admin/students"
          loading={loadingStudents}
        />
        <DashboardStatCard
          icon={GraduationCap}
          iconBg="bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706]"
          value={totalTeachers}
          label="Faculty Teachers"
          to="/admin/teachers"
          loading={loadingTeachers}
        />
        <DashboardStatCard
          icon={BookOpen}
          iconBg="bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200"
          value={totalClasses}
          label="Active Classes"
          to="/admin/classes"
          loading={loadingClasses}
        />
        <DashboardStatCard
          icon={FileQuestion}
          iconBg="bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669]"
          value={activeQuizzes}
          label="Live Assessments"
          to="/admin/quizzes"
          loading={loadingQuizzes}
        />
      </div>

      {/* ── 3. Middle Section: Class Cohorts & Assessment Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Class Cohorts Container */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-[#EFE5E0] dark:border-surface-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-100 dark:border-surface-700/60 mb-4">
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-base">
                <BookOpen className="w-4.5 h-4.5 text-[#5A0D1A] dark:text-[#E89CB0]" />
                <span>Active Class Cohorts</span>
              </div>
              <Link
                to="/admin/classes"
                className="text-xs font-semibold text-[#5A0D1A] dark:text-[#E89CB0] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingClasses ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            ) : recentClasses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Classes Configured"
                message="Start by adding class cohorts in the Class Manager."
              />
            ) : (
              <div className="space-y-3">
                {recentClasses.map((cls) => (
                  <Link
                    key={cls._id}
                    to={`/admin/classes/${cls._id}`}
                    className="block p-3.5 rounded-xl border border-surface-200 dark:border-surface-700/80 hover:border-[#5A0D1A]/40 bg-[#FAFAFA] dark:bg-surface-900/40 hover:bg-white dark:hover:bg-surface-900 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#701422] to-[#4A0914] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <BookOpen className="w-5 h-5 text-[#EEDAA2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-surface-900 dark:text-white truncate group-hover:text-[#5A0D1A] dark:group-hover:text-[#E89CB0] transition-colors">
                            {cls.name}
                          </h3>
                          <p className="text-[11px] text-surface-400 mt-0.5">
                            {cls.code} • {cls.academicYear || '2025-2026'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400 mt-1.5">
                            <span className="flex items-center gap-1 font-medium text-rose-700 dark:text-rose-400">
                              <Users className="w-3.5 h-3.5" />
                              <span>{cls.studentCount || 0} students</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-surface-400" />
                              <span>{cls.status || 'Active'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-[#5A0D1A] dark:group-hover:text-white transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quizzes & Assessment Overview */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-[#EFE5E0] dark:border-surface-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-100 dark:border-surface-700/60 mb-4">
              <div className="flex items-center gap-2 text-surface-900 dark:text-white font-bold text-base">
                <FileQuestion className="w-4.5 h-4.5 text-[#5A0D1A] dark:text-[#E89CB0]" />
                <span>Quizzes & Assessments Hub</span>
              </div>
              <Link
                to="/admin/quizzes"
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
                icon={FileQuestion}
                title="No Quizzes Recorded"
                message="Faculty has not published any quizzes yet."
              />
            ) : (
              <div className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-700/80 bg-[#FAFAFA] dark:bg-surface-900/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#701422] text-white flex items-center justify-center shrink-0">
                      <FileQuestion className="w-5 h-5 text-[#EEDAA2]" />
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
                        <span>{primaryQuiz.attemptCount || 0} attempts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      <span>{primaryQuiz.status || 'Published'}</span>
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
              <p className="font-bold text-sm text-[#BE123C] leading-none">{draftQuizzes}</p>
              <p className="text-[11px] text-[#BE123C]/80 mt-0.5 font-medium">Draft</p>
            </div>
            <div className="text-center py-2 px-1 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <p className="font-bold text-sm text-[#059669] leading-none">{activeQuizzes}</p>
              <p className="text-[11px] text-[#059669]/80 mt-0.5 font-medium">Published</p>
            </div>
            <div className="text-center py-2 px-1 rounded-xl bg-surface-100 dark:bg-surface-700/40 border border-surface-200 dark:border-surface-700/60">
              <p className="font-bold text-sm text-surface-600 dark:text-surface-300 leading-none">{closedQuizzes}</p>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-0.5 font-medium">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Three Action Navigation Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardActionCard
          title="Student Admissions"
          description="Manage student enrollments, profiles, and attendance."
          to="/admin/students"
          theme="crimson"
          watermarkIcon={Users}
        />
        <DashboardActionCard
          title="Faculty & Classes"
          description="Configure teachers, department assignments, and timetables."
          to="/admin/classes"
          theme="slate"
          watermarkIcon={BookOpen}
        />
        <DashboardActionCard
          title="Finance & Fees"
          description="Process student fee challans, salaries, and operating expenses."
          to="/admin/fees"
          theme="gold"
          watermarkIcon={Wallet}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
