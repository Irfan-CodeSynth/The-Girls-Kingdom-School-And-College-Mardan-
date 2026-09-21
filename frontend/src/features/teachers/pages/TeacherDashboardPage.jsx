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
  Users,
  Clock,
  Trophy,
  Pencil,
  Eye,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-12 mb-1" />
          <Skeleton className="h-4 w-28" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value ?? 0}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
        </>
      )}
    </div>
  </Card>
);

// ─── Section Header ───────────────────────────────────────────
const SectionHeader = ({ title, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-base font-semibold text-surface-900 dark:text-white">{title}</h2>
    {linkTo && (
      <Link
        to={linkTo}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
      >
        {linkLabel}
        <ChevronRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

const QUIZ_STATUS_CFG = {
  draft:     { label: 'Draft',     variant: 'warning' },
  published: { label: 'Published', variant: 'success' },
  closed:    { label: 'Closed',    variant: 'info' },
  archived:  { label: 'Archived',  variant: 'default' },
};

// ─── Main Page ────────────────────────────────────────────────
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

  // Quizzes that are closed and may need manual grading (comprehensive questions)
  const pendingGrading = quizzes.filter(
    (q) => q.status === 'closed' && q.questions?.some((qn) => qn.type === 'comprehensive')
  );

  const recentQuizzes = [...quizzes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
          Faculty Teaching Dashboard
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Welcome back, <span className="font-semibold text-surface-700 dark:text-surface-200">{user?.fullName}</span>
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Classes"
          value={classes.length}
          icon={BookOpen}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={loadingClasses}
        />
        <StatCard
          label="Total Quizzes"
          value={quizzes.length}
          icon={ClipboardList}
          color="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
          loading={loadingQuizzes}
        />
        <StatCard
          label="Published & Live"
          value={published}
          icon={TrendingUp}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={loadingQuizzes}
        />
        <StatCard
          label="Pending Grading"
          value={pendingGrading.length}
          icon={AlertCircle}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={loadingQuizzes}
        />
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* My Classes */}
        <div className="xl:col-span-2">
          <SectionHeader title="My Classes" linkTo="/teacher/classes" linkLabel="View all" />
          {loadingClasses ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Classes Assigned"
              message="You haven't been assigned to any class yet."
            />
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <Link key={cls._id} to={`/teacher/classes/${cls._id}`}>
                  <Card hover className="flex items-center gap-4 !py-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                        {cls.name}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {cls.code} · {cls.academicYear}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-surface-400 flex-shrink-0">
                      <Users className="w-3.5 h-3.5" />
                      {cls.enrollmentCount ?? '—'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-surface-300 flex-shrink-0" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="xl:col-span-3">
          <SectionHeader title="Recent Quizzes" linkTo="/teacher/quizzes" linkLabel="Manage" />
          {loadingQuizzes ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No Quizzes Yet"
              message="Create your first quiz from the Quizzes section."
            />
          ) : (
            <Card className="!p-0 overflow-hidden">
              <ul className="divide-y divide-surface-100 dark:divide-surface-700">
                {recentQuizzes.map((quiz) => {
                  const cfg = QUIZ_STATUS_CFG[quiz.status] || QUIZ_STATUS_CFG.draft;
                  return (
                    <li
                      key={quiz._id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {quiz.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {quiz.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {quiz.totalMarks} marks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {quiz.attemptCount ?? 0} attempts
                          </span>
                        </div>
                      </div>
                      <Badge variant={cfg.variant} dot size="sm">
                        {cfg.label}
                      </Badge>
                      <div className="flex items-center gap-1 ml-2">
                        {quiz.status === 'draft' && (
                          <Link
                            to={`/teacher/quizzes/${quiz._id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          to={`/teacher/quizzes/${quiz._id}/attempts`}
                          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors"
                          title="View Attempts"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {/* Quiz Status Summary */}
          {!loadingQuizzes && quizzes.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Draft',     count: draft,     color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
                { label: 'Published', count: published,  color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
                { label: 'Closed',    count: closed,     color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`rounded-xl px-4 py-3 text-center ${color}`}>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Grading Alert */}
      {!loadingQuizzes && pendingGrading.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {pendingGrading.length} quiz{pendingGrading.length > 1 ? 'zes need' : ' needs'} manual grading
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              These quizzes contain comprehensive/written questions that require your review.
            </p>
          </div>
          <Link
            to="/teacher/quizzes"
            className="flex-shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
          >
            Go to Quizzes
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboardPage;
