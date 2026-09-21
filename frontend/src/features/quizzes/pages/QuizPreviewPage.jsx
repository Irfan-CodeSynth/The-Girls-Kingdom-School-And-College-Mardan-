import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton } from '../../../components/ui';
import {
  ChevronLeft,
  Clock,
  Trophy,
  RefreshCw,
  AlertTriangle,
  Play,
  CheckCircle2,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const QuizPreviewPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuizById(quizId),
  });

  const { data: attemptsData } = useQuery({
    queryKey: ['myAttempts', quizId],
    queryFn: () => quizApi.getMyAttempts(quizId),
    enabled: !!quizId,
  });

  if (isPending) {
    return (
      <div className="space-y-4 max-w-xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const quiz = data?.quiz;
  const attempts = attemptsData?.attempts || [];
  const latestAttempt = attempts[attempts.length - 1];
  const hasInProgress = attempts.some((a) => a.status === 'in_progress');
  const completedAttempts = attempts.filter((a) => a.status !== 'in_progress');
  const maxAttempts = quiz?.maxAttempts ?? 1;
  const canAttempt = hasInProgress || completedAttempts.length < maxAttempts;

  if (!quiz) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center text-surface-400">
        Quiz not found.
      </div>
    );
  }

  const mcqCount = quiz.questions?.filter((q) => q.type === 'mcq').length || 0;
  const tfCount = quiz.questions?.filter((q) => q.type === 'true_false').length || 0;
  const compCount = quiz.questions?.filter((q) => q.type === 'comprehensive').length || 0;

  return (
    <div className="space-y-6 max-w-xl mx-auto px-4 py-8">
      <Link
        to="/student/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      <Card className="space-y-5">
        {/* Icon + title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white leading-snug">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                {quiz.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Duration', value: `${quiz.duration} min`, icon: Clock },
            { label: 'Total Marks', value: quiz.totalMarks, icon: Trophy },
            { label: 'Passing Marks', value: quiz.passingMarks || '—', icon: CheckCircle2 },
            { label: 'Max Attempts', value: maxAttempts, icon: RefreshCw },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400 mx-auto mb-1" />
              <p className="font-bold text-surface-900 dark:text-white text-sm">{value}</p>
              <p className="text-xs text-surface-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Question breakdown */}
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 space-y-2 text-sm">
          <p className="font-medium text-surface-700 dark:text-surface-300 text-xs uppercase tracking-wider mb-3">
            Question Breakdown
          </p>
          {mcqCount > 0 && (
            <div className="flex justify-between">
              <span className="text-surface-500">Multiple Choice</span>
              <Badge variant="secondary">{mcqCount} questions</Badge>
            </div>
          )}
          {tfCount > 0 && (
            <div className="flex justify-between">
              <span className="text-surface-500">True / False</span>
              <Badge variant="secondary">{tfCount} questions</Badge>
            </div>
          )}
          {compCount > 0 && (
            <div className="flex justify-between">
              <span className="text-surface-500">Written / Comprehensive</span>
              <Badge variant="secondary">{compCount} questions</Badge>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-surface-200 dark:border-surface-700 font-semibold">
            <span className="text-surface-700 dark:text-surface-300">Total Questions</span>
            <span className="text-surface-900 dark:text-white">{quiz.questions?.length || 0}</span>
          </div>
        </div>

        {/* Attempt status */}
        {attempts.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Your Attempts</p>
            <p className="text-blue-600 dark:text-blue-400">
              {completedAttempts.length} of {maxAttempts} attempt{maxAttempts !== 1 ? 's' : ''} used
              {hasInProgress && ' • (1 attempt currently in progress)'}
            </p>
            {latestAttempt && latestAttempt.status !== 'in_progress' && (
              <Link
                to={`/student/quizzes/${quizId}/result/${latestAttempt._id}`}
                className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2 font-medium"
              >
                View last attempt result →
              </Link>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 text-sm space-y-1">
          <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-300 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Before you begin:
          </div>
          <ul className="text-amber-800 dark:text-amber-200 space-y-1 text-xs list-disc list-inside">
            <li>The timer starts as soon as you click Start Quiz.</li>
            <li>Your answers are auto-saved every 30 seconds.</li>
            <li>The quiz submits automatically when time expires.</li>
            <li>Ensure a stable internet connection before starting.</li>
          </ul>
        </div>

        {/* CTA */}
        {canAttempt ? (
          <button
            onClick={() => navigate(`/student/quizzes/${quizId}/take`)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Play className="w-4 h-4" />
            {hasInProgress ? 'Resume Quiz' : 'Start Quiz'}
          </button>
        ) : latestAttempt ? (
          <button
            onClick={() => navigate(`/student/quizzes/${quizId}/result/${latestAttempt._id}`)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Trophy className="w-4 h-4" />
            View Quiz Result
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Maximum attempts reached
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizPreviewPage;
