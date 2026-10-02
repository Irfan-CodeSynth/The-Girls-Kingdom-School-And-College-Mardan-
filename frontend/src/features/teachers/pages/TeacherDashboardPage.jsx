import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { classApi } from '../../classes/api/classApi';
import quizApi from '../../quizzes/api/quizApi';
import salaryApi from '../../salary/api/salaryApi';
import { useAuth } from '../../../hooks/useAuth';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  BookOpen,
  ClipboardList,
  ChevronRight,
  Users,
  Clock,
  Trophy,
  Pencil,
  Eye,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Banknote,
  Plus,
  CalendarCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// ─── Compact Responsive Stat Card ─────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, loading, to, subtext }) => {
  const content = (
    <Card
      hover={Boolean(to)}
      className="p-3.5 sm:p-4 flex items-center gap-3 transition-all duration-200 h-full border border-surface-200 dark:border-surface-700/80 hover:border-primary-400 dark:hover:border-primary-500 shadow-xs hover:shadow-md"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <>
            <Skeleton className="h-5 w-14 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg sm:text-xl font-extrabold text-surface-900 dark:text-white leading-tight truncate">
                {value}
              </p>
              {subtext && (
                <span className="text-[10px] text-surface-400 font-medium truncate">
                  {subtext}
                </span>
              )}
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 truncate mt-0.5 font-medium">
              {label}
            </p>
          </>
        )}
      </div>
      {to && (
        <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-primary-500 transition-colors shrink-0" />
      )}
    </Card>
  );

  return to ? <Link to={to} className="block group h-full">{content}</Link> : content;
};

// ─── Section Header ───────────────────────────────────────────
const SectionHeader = ({ title, linkTo, linkLabel, actionButton }) => (
  <div className="flex items-center justify-between mb-3.5">
    <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white tracking-tight flex items-center gap-2">
      {title}
    </h2>
    <div className="flex items-center gap-2">
      {actionButton}
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>{linkLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  </div>
);

const QUIZ_STATUS_CFG = {
  draft:     { label: 'Draft',     variant: 'warning' },
  published: { label: 'Published', variant: 'success' },
  closed:    { label: 'Closed',    variant: 'info' },
  archived:  { label: 'Archived',  variant: 'default' },
};

// ─── Main Teacher Dashboard ───────────────────────────────────
export const TeacherDashboardPage = () => {
  const { user } = useAuth();
  const [quizFilter, setQuizFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'closed'

  const { data: classesData, isPending: loadingClasses } = useQuery({
    queryKey: ['teacherDash-classes'],
    queryFn: () => classApi.getMyTeacherClasses(),
  });

  const { data: quizzesData, isPending: loadingQuizzes } = useQuery({
    queryKey: ['teacherDash-quizzes'],
    queryFn: () => quizApi.getQuizzes({ limit: 50 }),
  });

  const { data: salaryData, isPending: loadingSalary } = useQuery({
    queryKey: ['teacherDash-salary'],
    queryFn: () => salaryApi.getMySalaryStructure(),
    retry: false,
  });

  const { data: slipsData } = useQuery({
    queryKey: ['teacherDash-slips'],
    queryFn: () => salaryApi.getMySlips(),
    retry: false,
  });

  const classes = classesData?.classes || [];
  const quizzes = quizzesData?.quizzes || [];
  const structure = salaryData?.salaryStructure;
  const slips = slipsData?.slips || [];
  const latestSlip = slips[0];

  const published = quizzes.filter((q) => q.status === 'published').length;
  const closed    = quizzes.filter((q) => q.status === 'closed').length;
  const draft     = quizzes.filter((q) => q.status === 'draft').length;

  const pendingGrading = quizzes.filter(
    (q) => q.status === 'closed' && q.questions?.some((qn) => qn.type === 'comprehensive')
  );

  const filteredQuizzes = quizzes
    .filter((q) => quizFilter === 'all' || q.status === quizFilter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Welcome Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-surface-900 text-white p-5 sm:p-6 shadow-md border border-primary-700/40">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Faculty Academic Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome back, {user?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-surface-200 mt-1 max-w-xl">
              You are assigned to <strong>{classes.length} class cohort{classes.length !== 1 ? 's' : ''}</strong> with <strong>{totalStudents} student{totalStudents !== 1 ? 's' : ''}</strong> enrolled.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Link
              to="/teacher/attendance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>Take Attendance</span>
            </Link>
            <Link
              to="/teacher/quizzes/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Quiz</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Top Stat Cards Grid (Mobile 2-col, Tablet 3-col, Desktop 6-col) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="My Classes"
          value={classes.length}
          subtext={`${totalStudents} std`}
          icon={BookOpen}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={loadingClasses}
          to="/teacher/classes"
        />
        <StatCard
          label="Attendance"
          value="Daily Roll"
          icon={CheckCircle2}
          color="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400"
          to="/teacher/attendance"
        />
        <StatCard
          label="Total Quizzes"
          value={quizzes.length}
          icon={ClipboardList}
          color="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
          loading={loadingQuizzes}
          to="/teacher/quizzes"
        />
        <StatCard
          label="Live Quizzes"
          value={published}
          icon={TrendingUp}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={loadingQuizzes}
          to="/teacher/quizzes"
        />
        <StatCard
          label="Pending Review"
          value={pendingGrading.length}
          icon={AlertCircle}
          color={pendingGrading.length > 0 ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400" : "bg-surface-100 dark:bg-surface-800 text-surface-400"}
          loading={loadingQuizzes}
          to="/teacher/grading"
        />
        <StatCard
          label="Salary Package"
          value={structure?.netSalary ? `PKR ${(structure.netSalary / 1000).toFixed(0)}k` : (latestSlip?.status?.toUpperCase() || 'View')}
          subtext={structure?.netSalary ? 'Net' : ''}
          icon={Banknote}
          color="bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400"
          loading={loadingSalary}
          to="/teacher/salary"
        />
      </div>

      {/* ── Pending Grading Alert Banner (if any) ── */}
      {!loadingQuizzes && pendingGrading.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {pendingGrading.length} Quiz Submission{pendingGrading.length > 1 ? 's require' : ' requires'} Manual Grading
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/90 mt-0.5">
                Students have submitted written/comprehensive questions awaiting your review.
              </p>
            </div>
          </div>
          <Link
            to="/teacher/grading"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs self-start sm:self-auto shrink-0 transition-colors"
          >
            <span>Open Grading Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── Two-Column Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        
        {/* ── Left Column: My Assigned Classes (2 Columns on Desktop) ── */}
        <div className="lg:col-span-2 space-y-3.5">
          <SectionHeader
            title="My Assigned Classes"
            linkTo="/teacher/classes"
            linkLabel="View All"
          />

          {loadingClasses ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={BookOpen}
                title="No Classes Assigned"
                message="You haven't been assigned to any class cohort yet."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group"
                >
                  {/* Top Bar: Code Badge + Year */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      {cls.code}
                    </span>
                    <span className="text-xs text-surface-400 font-medium">
                      {cls.academicYear}
                    </span>
                  </div>

                  {/* Class Title & Student Count */}
                  <div>
                    <Link
                      to={`/teacher/classes/${cls._id}`}
                      className="text-base font-bold text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block"
                    >
                      {cls.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400 mt-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{cls.studentCount ?? 0} Enrolled Students</span>
                    </div>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="pt-2 border-t border-surface-100 dark:border-surface-700/60 flex items-center justify-between gap-2">
                    <Link
                      to="/teacher/attendance"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Mark Attendance</span>
                    </Link>
                    <Link
                      to={`/teacher/classes/${cls._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      <span>Class Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column: Quizzes & Assessments Hub (3 Columns on Desktop) ── */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
            <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white tracking-tight">
              Quizzes & Assessments
            </h2>

            {/* Compact Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl self-start sm:self-auto border border-surface-200 dark:border-surface-700">
              {[
                { id: 'all', label: `All (${quizzes.length})` },
                { id: 'published', label: `Live (${published})` },
                { id: 'draft', label: `Draft (${draft})` },
                { id: 'closed', label: `Closed (${closed})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setQuizFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    quizFilter === tab.id
                      ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-xs'
                      : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loadingQuizzes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={ClipboardList}
                title="No Quizzes in this Filter"
                message="Create a new quiz or adjust your filter selection above."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQuizzes.map((quiz) => {
                const cfg = QUIZ_STATUS_CFG[quiz.status] || QUIZ_STATUS_CFG.draft;
                return (
                  <div
                    key={quiz._id}
                    className="rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Icon & Quiz Details */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-surface-900 dark:text-white truncate">
                            {quiz.title}
                          </p>
                          <Badge variant={cfg.variant} dot size="sm">
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-surface-500 dark:text-surface-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-surface-400" />
                            {quiz.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            {quiz.totalMarks} marks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary-500" />
                            {quiz.attemptCount ?? 0} attempt{quiz.attemptCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {quiz.status === 'draft' && (
                        <Link
                          to={`/teacher/quizzes/${quiz._id}/edit`}
                          className="p-2 rounded-xl bg-surface-50 dark:bg-surface-700 hover:bg-primary-50 dark:hover:bg-primary-950/60 text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Edit Quiz"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        to={`/teacher/quizzes/${quiz._id}/attempts`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-400 text-xs font-semibold text-surface-700 dark:text-surface-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Quiz Navigation Link */}
          {quizzes.length > 5 && (
            <div className="text-center pt-1">
              <Link
                to="/teacher/quizzes"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all {quizzes.length} quizzes in quiz manager →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
