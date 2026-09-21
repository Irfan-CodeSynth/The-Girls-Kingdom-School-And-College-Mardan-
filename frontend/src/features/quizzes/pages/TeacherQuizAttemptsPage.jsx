import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  ChevronLeft,
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Pencil,
} from 'lucide-react';

const STATUS_CONFIG = {
  graded: { label: 'Graded', variant: 'success', icon: CheckCircle2 },
  pending_review: { label: 'Pending Review', variant: 'warning', icon: Hourglass },
  in_progress: { label: 'In Progress', variant: 'secondary', icon: Clock },
  submitted: { label: 'Submitted', variant: 'info', icon: CheckCircle2 },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const AttemptRow = ({ attempt }) => {
  const cfg = STATUS_CONFIG[attempt.status] || STATUS_CONFIG.in_progress;
  const Icon = cfg.icon;
  const needsGrading = attempt.status === 'pending_review';

  return (
    <tr className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">
        {attempt.student?.fullName || '—'}
        <div className="text-xs text-surface-400 font-normal">{attempt.student?.email}</div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={cfg.variant}>
          <Icon className="w-3 h-3 mr-1" />
          {cfg.label}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-surface-700 dark:text-surface-300">
        {attempt.status === 'graded' || attempt.status === 'pending_review' ? (
          <span className="font-semibold">
            {attempt.obtainedMarks ?? '—'} / {attempt.totalMarks}
            {attempt.percentage != null && (
              <span className="text-xs text-surface-400 ml-1">({attempt.percentage}%)</span>
            )}
          </span>
        ) : (
          <span className="text-surface-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-surface-500">
        {formatDate(attempt.submittedAt || attempt.startedAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          to={`/teacher/quizzes/${attempt.quiz?._id || attempt.quiz}/grade/${attempt._id}`}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            needsGrading
              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
        >
          <Pencil className="w-3 h-3" />
          {needsGrading ? 'Grade' : 'Review'}
        </Link>
      </td>
    </tr>
  );
};

export const TeacherQuizAttemptsPage = () => {
  const { id: quizId } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ['quizAttempts', quizId],
    queryFn: () => quizApi.getQuizAttempts(quizId),
  });

  const quiz = data?.quiz;
  const attempts = data?.attempts || [];

  const graded = attempts.filter((a) => a.status === 'graded').length;
  const pending = attempts.filter((a) => a.status === 'pending_review').length;
  const avgScore =
    attempts.filter((a) => a.status === 'graded').length > 0
      ? Math.round(
          attempts
            .filter((a) => a.status === 'graded')
            .reduce((s, a) => s + (a.percentage || 0), 0) /
            attempts.filter((a) => a.status === 'graded').length
        )
      : null;

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/teacher/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Student Attempts
        </h1>
        {quiz && (
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {quiz.title} · {quiz.class?.name}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: attempts.length, icon: Users },
          { label: 'Graded', value: graded, icon: CheckCircle2 },
          { label: 'Pending Review', value: pending, icon: AlertCircle },
          { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', icon: Trophy },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="text-center py-4">
            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-surface-900 dark:text-white">{value}</p>
            <p className="text-xs text-surface-400 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {attempts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No Attempts Yet"
              message="No students have attempted this quiz yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {attempts.map((a) => (
                  <AttemptRow key={a._id} attempt={a} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherQuizAttemptsPage;
