import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { classApi } from '../../classes/api/classApi';
import quizApi from '../../quizzes/api/quizApi';
import { useAuth } from '../../../hooks/useAuth';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  BookOpen,
  ClipboardList,
  ChevronRight,
  Clock,
  Trophy,
  Play,
  CheckCircle2,
  Lock,
  Star,
  GraduationCap,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  FileText,
  CalendarCheck,
} from 'lucide-react';

// ─── Stat Card Component ──────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, loading, to }) => {
  const content = (
    <Card
      hover={Boolean(to)}
      className="p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200"
    >
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <>
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3.5 w-24" />
          </>
        ) : (
          <>
            <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white leading-tight">
              {value ?? 0}
            </p>
            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 truncate mt-0.5">
              {label}
            </p>
          </>
        )}
      </div>
      {to && (
        <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-600 shrink-0" />
      )}
    </Card>
  );

  return to ? <Link to={to} className="block group">{content}</Link> : content;
};

// ─── Section Header ───────────────────────────────────────────
const SectionHeader = ({ title, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-3.5">
    <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white tracking-tight">
      {title}
    </h2>
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
);

// ─── Attempt status helper ────────────────────────────────────
const attemptLabel = (attempt) => {
  if (!attempt) return null;
  if (attempt.status === 'graded') return { text: 'Graded', variant: 'success' };
  if (attempt.status === 'submitted') return { text: 'Submitted', variant: 'info' };
  if (attempt.status === 'in_progress') return { text: 'In Progress', variant: 'warning' };
  return null;
};

// ─── Main Student Dashboard Page ──────────────────────────────
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

  const myClass = classData?.class || null;
  const enrollment = classData?.enrollment || null;
  const quizzes = quizzesData?.quizzes || [];

  const available = quizzes.filter((q) => q.status === 'published');
  const attempted = quizzes.filter((q) =>
    q.myAttempts?.some((a) => a.status === 'submitted' || a.status === 'graded')
  );
  const completed = attempted.length;

  // Score average from graded attempts
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 text-white p-5 sm:p-6 shadow-md">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-200">
                  Student Portal
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                Welcome back, {user?.fullName || 'Student'}
              </h1>
              {myClass && (
                <p className="text-xs sm:text-sm text-primary-100/90 mt-1 flex items-center gap-1.5">
                  <span>Enrolled in</span>
                  <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded text-xs">
                    {myClass.name}
                  </span>
                </p>
              )}
            </div>
          </div>

          {avgScore !== null && (
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 border border-white/10 shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{avgScore}%</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-[11px] sm:text-xs text-primary-200 font-medium">Average Performance</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards Grid (Mobile 2-col, Desktop 4-col) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Available Quizzes"
          value={available.length}
          icon={ClipboardList}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={loadingQuizzes}
          to="/student/quizzes"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={loadingQuizzes}
          to="/student/quizzes"
        />
        <StatCard
          label="Avg. Score"
          value={avgScore !== null ? `${avgScore}%` : '—'}
          icon={Star}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={loadingQuizzes}
          to="/student/results"
        />
        <StatCard
          label="Attendance Record"
          value="View Log"
          icon={CalendarCheck}
          color="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400"
          to="/student/attendance"
        />
      </div>

      {/* ── "My Class" Card Module ── */}
      <div>
        <SectionHeader title="My Class Cohort" linkTo="/student/classes" linkLabel="Class portal" />
        {loadingClass ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : myClass ? (
          <div className="rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Top row: Identity & Action */}
            <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/40">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                      {myClass.code}
                    </span>
                    <Badge variant={myClass.status === 'active' ? 'success' : 'secondary'} dot size="sm">
                      {myClass.status?.toUpperCase() || 'ACTIVE'}
                    </Badge>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white tracking-tight">
                    {myClass.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-surface-500 dark:text-surface-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      Academic Year: {myClass.academicYear}
                    </span>
                    {enrollment?.enrolledAt && (
                      <span>
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enter Class CTA */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <Link
                  to="/student/classes"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  <span>Enter Class Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Bottom Row: Quick Access Navigation Shortcuts */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-surface-50/60 dark:bg-surface-900/50 border-t border-surface-100 dark:border-surface-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-surface-500">
                <Users className="w-3.5 h-3.5 text-primary-500" />
                <span>
                  Faculty:{' '}
                  <strong className="text-surface-800 dark:text-surface-200">
                    {myClass.teachers && myClass.teachers.length > 0
                      ? myClass.teachers.map((t) => t.fullName).join(', ')
                      : 'Assigned Faculty'}
                  </strong>
                </span>
              </div>

              {/* Quick links to materials and attendance */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to="/student/classes"
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-400 text-surface-700 dark:text-surface-300 font-medium hover:text-primary-600 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-primary-500" />
                  Study Materials
                </Link>
                <Link
                  to="/student/attendance"
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-400 text-surface-700 dark:text-surface-300 font-medium hover:text-primary-600 transition-colors flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-3 h-3 text-emerald-500" />
                  Attendance
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-8">
            <EmptyState
              icon={BookOpen}
              title="Not Enrolled Yet"
              message="You haven't been enrolled in a class cohort yet. Contact your administrator."
            />
          </Card>
        )}
      </div>

      {/* ── Two Column Responsive Grid: Available Quizzes & Recent Results ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* ── Module: Available Quizzes ── */}
        <div>
          <SectionHeader
            title="Available Quizzes"
            linkTo="/student/quizzes"
            linkLabel="See all quizzes"
          />

          {loadingQuizzes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : available.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={ClipboardList}
                title="No Quizzes Available"
                message="No quizzes have been scheduled for your class at this time."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {available.slice(0, 4).map((quiz) => {
                const myLatest = quiz.myAttempts?.slice(-1)[0];
                const attemptInfo = attemptLabel(myLatest);

                return (
                  <Link
                    key={quiz._id}
                    to={`/student/quizzes/${quiz._id}`}
                    className="block group"
                  >
                    <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 hover:border-primary-400/80 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
                      {/* Left: Icon & Title */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0 border border-primary-100 dark:border-primary-800/40">
                          <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {quiz.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {quiz.duration} min
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5" />
                              {quiz.totalMarks} marks
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action or Status */}
                      <div className="shrink-0 flex items-center gap-2">
                        {attemptInfo ? (
                          <Badge variant={attemptInfo.variant} dot size="sm">
                            {attemptInfo.text}
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start</span>
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Module: Recent Results ── */}
        <div>
          <SectionHeader
            title="Recent Results"
            linkTo="/student/results"
            linkLabel="View transcripts"
          />

          {loadingQuizzes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : gradedAttempts.length === 0 ? (
            <Card className="p-6">
              <EmptyState
                icon={Star}
                title="No Results Yet"
                message="Complete and submit a quiz to review your grades and answers here."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {quizzes
                .flatMap((quiz) =>
                  (quiz.myAttempts || [])
                    .filter((a) => a.status === 'graded' || a.status === 'submitted')
                    .map((attempt) => ({ quiz, attempt }))
                )
                .sort((a, b) => new Date(b.attempt.submittedAt) - new Date(a.attempt.submittedAt))
                .slice(0, 4)
                .map(({ quiz, attempt }) => {
                  const pct = attempt.totalMarks
                    ? Math.round((attempt.obtainedMarks / attempt.totalMarks) * 100)
                    : null;
                  const isPassed = pct !== null ? pct >= 50 : null;

                  return (
                    <Link
                      key={attempt._id}
                      to={`/student/quizzes/${quiz._id}/result/${attempt._id}`}
                      className="block group"
                    >
                      <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 hover:border-primary-400/80 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
                        {/* Left: Icon & Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isPassed
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800/40 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-surface-400" />
                              {attempt.submittedAt
                                ? new Date(attempt.submittedAt).toLocaleDateString()
                                : 'Submitted'}
                            </p>
                          </div>
                        </div>

                        {/* Right: Score Pill & Marks */}
                        <div className="shrink-0 flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`text-sm sm:text-base font-extrabold ${
                                pct === null
                                  ? 'text-surface-400'
                                  : pct >= 80
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : pct >= 50
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {pct !== null ? `${pct}%` : 'Pending'}
                            </div>
                            <p className="text-[11px] font-mono text-surface-400">
                              {attempt.obtainedMarks ?? '—'}/{attempt.totalMarks} pts
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
