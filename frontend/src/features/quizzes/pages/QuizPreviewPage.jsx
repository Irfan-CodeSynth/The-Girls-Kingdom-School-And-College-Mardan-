import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';

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
      <div className="max-w-xl mx-auto px-4 py-8 text-center text-[#6B7280]">
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
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      <Card className="space-y-5 border-[#EFE5E0]">
        {/* Icon + title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#5A0D1A] leading-snug">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">
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
            <div key={label} className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-[#5A0D1A] mx-auto mb-1" />
              <p className="font-bold text-[#111827] text-sm">{value}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Question breakdown */}
        <div className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-4 space-y-2 text-sm">
          <p className="font-bold text-[#5A0D1A] text-xs uppercase tracking-wider mb-3">
            Question Breakdown
          </p>
          {mcqCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[#4B5563]">Multiple Choice</span>
              <Badge variant="secondary">{mcqCount} questions</Badge>
            </div>
          )}
          {tfCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[#4B5563]">True / False</span>
              <Badge variant="secondary">{tfCount} questions</Badge>
            </div>
          )}
          {compCount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[#4B5563]">Written / Comprehensive</span>
              <Badge variant="secondary">{compCount} questions</Badge>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#EFE5E0] font-bold">
            <span className="text-[#111827]">Total Questions</span>
            <span className="text-[#5A0D1A]">{quiz.questions?.length || 0}</span>
          </div>
        </div>

        {/* Attempt status */}
        {attempts.length > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm">
            <p className="font-bold text-sky-900 mb-1">Your Attempts</p>
            <p className="text-sky-800">
              {completedAttempts.length} of {maxAttempts} attempt{maxAttempts !== 1 ? 's' : ''} used
              {hasInProgress && ' • (1 attempt currently in progress)'}
            </p>
            {latestAttempt && latestAttempt.status !== 'in_progress' && (
              <Link
                to={`/student/quizzes/${quizId}/result/${latestAttempt._id}`}
                className="inline-flex items-center gap-1 text-xs text-[#5A0D1A] hover:underline mt-2 font-bold"
              >
                View last attempt result →
              </Link>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Before you begin:
          </div>
          <ul className="text-amber-800 space-y-1 text-xs list-disc list-inside">
            <li>The timer starts as soon as you click Start Quiz.</li>
            <li>Your answers are auto-saved every 30 seconds.</li>
            <li>The quiz submits automatically when time expires.</li>
            <li>Ensure a stable internet connection before starting.</li>
          </ul>
        </div>

        {/* CTA */}
        {canAttempt ? (
          <button
            type="button"
            onClick={() => navigate(`/student/quizzes/${quizId}/take`)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white font-bold text-sm transition-colors shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4" />
            {hasInProgress ? 'Resume Quiz' : 'Start Quiz'}
          </button>
        ) : latestAttempt ? (
          <button
            type="button"
            onClick={() => navigate(`/student/quizzes/${quizId}/result/${latestAttempt._id}`)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white font-bold text-sm transition-colors shadow-xs cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            View Quiz Result
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] text-[#6B7280] font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#5A0D1A]" />
            Maximum attempts reached
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizPreviewPage;
