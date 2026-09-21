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
} from 'lucide-react';

// ─── Quiz Status Config ───────────────────────────────────────
const QUIZ_CFG = {
  published: { label: 'Available', variant: 'success', icon: Play },
  closed:    { label: 'Closed',    variant: 'default', icon: Lock },
};

// ─── Attempt status helper ────────────────────────────────────
const attemptLabel = (attempt) => {
  if (!attempt) return null;
  if (attempt.status === 'graded')         return { text: 'Graded',     variant: 'success' };
  if (attempt.status === 'submitted')      return { text: 'Submitted',  variant: 'info' };
  if (attempt.status === 'in_progress')    return { text: 'In Progress', variant: 'warning' };
  return null;
};

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-10 mb-1" />
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

// ─── Main Page ────────────────────────────────────────────────
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

  const myClass     = classData?.class || null;
  const enrollment  = classData?.enrollment || null;
  const quizzes     = quizzesData?.quizzes || [];

  const available  = quizzes.filter((q) => q.status === 'published');
  const attempted  = quizzes.filter((q) =>
    q.myAttempts?.some((a) => a.status === 'submitted' || a.status === 'graded')
  );
  const completed  = attempted.length;

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
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 p-6 text-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-primary-200 font-medium">Welcome back 👋</p>
          <h1 className="text-2xl font-bold mt-0.5">{user?.fullName || 'Student'}</h1>
          {myClass && (
            <p className="text-sm text-primary-200 mt-1">
              Enrolled in <span className="font-semibold text-white">{myClass.name}</span>
            </p>
          )}
        </div>
        {avgScore !== null && (
          <div className="flex-shrink-0 text-center bg-white/15 rounded-2xl px-6 py-4">
            <p className="text-3xl font-bold">{avgScore}%</p>
            <p className="text-sm text-primary-200 mt-0.5">Avg. Score</p>
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Quizzes Available"
          value={available.length}
          icon={ClipboardList}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={loadingQuizzes}
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={loadingQuizzes}
        />
        <StatCard
          label="Avg. Score"
          value={avgScore !== null ? `${avgScore}%` : '—'}
          icon={Star}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={loadingQuizzes}
        />
      </div>

      {/* ── Enrolled Class card ── */}
      <div>
        <SectionHeader title="My Class" linkTo="/student/classes" linkLabel="View details" />
        {loadingClass ? (
          <Skeleton className="h-28 rounded-xl" />
        ) : myClass ? (
          <Link to="/student/classes">
            <Card hover className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-surface-900 dark:text-white truncate">
                  {myClass.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-surface-500 dark:text-surface-400">
                  <span className="font-mono bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded text-xs">
                    {myClass.code}
                  </span>
                  <span>{myClass.academicYear}</span>
                  {enrollment?.enrolledAt && (
                    <span>
                      Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {myClass.teachers && myClass.teachers.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {myClass.teachers.map((t) => t.fullName).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <Badge variant="success" dot>Active</Badge>
              <ChevronRight className="w-5 h-5 text-surface-300 flex-shrink-0" />
            </Card>
          </Link>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Not Enrolled Yet"
            message="You haven't been enrolled in a class. Contact your admin."
          />
        )}
      </div>

      {/* ── Bottom grid: Available Quizzes + Recent Results ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Available Quizzes */}
        <div>
          <SectionHeader title="Available Quizzes" linkTo="/student/quizzes" linkLabel="See all" />
          {loadingQuizzes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : available.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No Quizzes Available"
              message="No quizzes have been published for your class yet."
            />
          ) : (
            <div className="space-y-3">
              {available.slice(0, 4).map((quiz) => {
                const myLatest = quiz.myAttempts?.slice(-1)[0];
                const attemptInfo = attemptLabel(myLatest);
                return (
                  <Link key={quiz._id} to={`/student/quizzes/${quiz._id}`}>
                    <Card hover className="flex items-center gap-4 !py-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
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
                        </div>
                      </div>
                      {attemptInfo ? (
                        <Badge variant={attemptInfo.variant} dot size="sm">
                          {attemptInfo.text}
                        </Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 flex-shrink-0">
                          <Play className="w-3.5 h-3.5" />
                          Start
                        </span>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div>
          <SectionHeader title="Recent Results" linkTo="/student/results" linkLabel="View all" />
          {loadingQuizzes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : gradedAttempts.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No Results Yet"
              message="Complete and submit a quiz to see your results here."
            />
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
                  const scoreColor =
                    pct === null ? 'text-surface-400' :
                    pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    pct >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-danger-600 dark:text-danger-400';
                  return (
                    <Link
                      key={attempt._id}
                      to={`/student/quizzes/${quiz._id}/result/${attempt._id}`}
                    >
                      <Card hover className="flex items-center gap-4 !py-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-surface-500 dark:text-surface-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {quiz.title}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {attempt.submittedAt
                              ? new Date(attempt.submittedAt).toLocaleDateString()
                              : 'Submitted'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-base font-bold ${scoreColor}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </p>
                          <p className="text-xs text-surface-400">
                            {attempt.obtainedMarks ?? '—'}/{attempt.totalMarks}
                          </p>
                        </div>
                      </Card>
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
