import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  ClipboardList,
  Clock,
  Trophy,
  ChevronRight,
  Lock,
  Play,
  CheckCircle2,
} from 'lucide-react';

const statusConfig = {
  published: { label: 'Available', variant: 'success', icon: Play },
  closed: { label: 'Closed', variant: 'secondary', icon: Lock },
};

const QuizCard = ({ quiz, attempts = [] }) => {
  const latestAttempt = attempts[attempts.length - 1];
  const hasInProgress = attempts.some((a) => a.status === 'in_progress');
  const isCompleted = latestAttempt?.status === 'graded' || latestAttempt?.status === 'pending_review' || latestAttempt?.status === 'submitted';
  const maxAttempts = quiz.maxAttempts || 1;
  const completedCount = attempts.filter((a) => a.status !== 'in_progress').length;
  const canTake = completedCount < maxAttempts || hasInProgress;

  let badgeCfg = { label: 'Available', variant: 'success', icon: Play };
  if (hasInProgress) {
    badgeCfg = { label: 'In Progress', variant: 'warning', icon: Clock };
  } else if (isCompleted && !canTake) {
    badgeCfg = { label: 'Completed', variant: 'primary', icon: CheckCircle2 };
  } else if (quiz.status === 'closed') {
    badgeCfg = { label: 'Closed', variant: 'secondary', icon: Lock };
  }

  const Icon = badgeCfg.icon;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-800 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={badgeCfg.variant} dot>
            <Icon className="w-3 h-3 mr-1" />
            {badgeCfg.label}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-surface-900 dark:text-white text-base leading-snug line-clamp-2">
        {quiz.title}
      </h3>
      {quiz.description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
          {quiz.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-500 dark:text-surface-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {quiz.duration} min
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          {quiz.totalMarks} marks
        </span>
        {isCompleted && latestAttempt && (
          <span className="ml-auto font-semibold text-primary-600 dark:text-primary-400">
            Score: {latestAttempt.obtainedMarks ?? '—'}/{latestAttempt.totalMarks}
          </span>
        )}
      </div>
    </Card>
  );
};

export const QuizListPage = () => {
  const { data, isPending } = useQuery({
    queryKey: ['studentQuizzes'],
    queryFn: () => quizApi.getQuizzes(),
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const quizzes = data?.quizzes || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          My Quizzes
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Online assessments available for your class
        </p>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Quizzes Yet"
          message="No quizzes have been published for your class yet. Check back later."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const attempts = quiz.myAttempts || [];
            const latest = attempts[attempts.length - 1];
            const hasInProgress = attempts.some((a) => a.status === 'in_progress');
            const maxAttempts = quiz.maxAttempts || 1;
            const completedCount = attempts.filter((a) => a.status !== 'in_progress').length;
            const canTake = completedCount < maxAttempts || hasInProgress;

            const targetUrl = hasInProgress
              ? `/student/quizzes/${quiz._id}/take`
              : (!canTake && latest?._id)
              ? `/student/quizzes/${quiz._id}/result/${latest._id}`
              : `/student/quizzes/${quiz._id}`;

            return (
              <Link key={quiz._id} to={targetUrl}>
                <QuizCard quiz={quiz} attempts={attempts} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizListPage;
