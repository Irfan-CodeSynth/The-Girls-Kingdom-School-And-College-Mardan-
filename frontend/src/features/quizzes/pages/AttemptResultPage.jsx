import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton } from '../../../components/ui';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ChevronLeft,
  AlertCircle,
  BookOpen,
  Minus,
} from 'lucide-react';

const QUESTION_TYPE_LABELS = {
  mcq: 'MCQ',
  true_false: 'True / False',
  comprehensive: 'Written',
};

const ScoreCircle = ({ percentage, isPassed }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;
  const color = isPassed ? '#16a34a' : percentage >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-surface-900 dark:text-white">
          {percentage}%
        </span>
        {isPassed !== null && isPassed !== undefined && (
          <span className={`text-xs font-semibold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
            {isPassed ? 'PASSED' : 'FAILED'}
          </span>
        )}
      </div>
    </div>
  );
};

export const AttemptResultPage = () => {
  const { id: quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => quizApi.getAttemptById(attemptId),
  });

  const { data: quizData } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuizById(quizId),
    enabled: !!quizId,
  });

  if (isPending) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const attempt = data?.attempt;
  const quiz = quizData?.quiz;

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-surface-400">
        Attempt not found.
      </div>
    );
  }

  const isPending2 = attempt.status === 'pending_review';
  const isGraded = attempt.status === 'graded';

  // Build answer lookup
  const answerMap = {};
  (attempt.answers || []).forEach((a) => {
    answerMap[a.question?.toString?.() || a.question] = a;
  });

  // Build question lookup from quiz
  const questionMap = {};
  (quiz?.questions || []).forEach((q) => {
    questionMap[q._id] = q;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/student/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Score Card */}
      <Card className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-surface-900 dark:text-white">
            Quiz Result
          </h1>
        </div>
        <p className="text-surface-500 dark:text-surface-400 text-sm">
          {quiz?.title}
        </p>

        {isPending2 ? (
          <div className="py-6 space-y-3">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <p className="font-semibold text-surface-900 dark:text-white">
              Pending Manual Review
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Your written answers are being reviewed by the teacher. Check back later for your final score.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <span className="text-surface-500">Auto-graded marks:</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {attempt.autoGradedMarks} / {attempt.totalMarks}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <ScoreCircle
              percentage={attempt.percentage ?? 0}
              isPassed={attempt.isPassed}
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
                <p className="text-xs text-surface-400 mb-1">Obtained</p>
                <p className="font-bold text-lg text-surface-900 dark:text-white">
                  {attempt.obtainedMarks}
                </p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
                <p className="text-xs text-surface-400 mb-1">Total</p>
                <p className="font-bold text-lg text-surface-900 dark:text-white">
                  {attempt.totalMarks}
                </p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
                <p className="text-xs text-surface-400 mb-1">Duration</p>
                <p className="font-bold text-lg text-surface-900 dark:text-white">
                  {quiz?.duration} min
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Detailed Answer Review */}
      {isGraded && quiz?.questions && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            Answer Review
          </h2>

          {quiz.questions.map((q, idx) => {
            const ans = answerMap[q._id] || {};
            const isCorrect = ans.isCorrect;
            const isComp = q.type === 'comprehensive';

            return (
              <Card
                key={q._id}
                className={`border-l-4 ${
                  isComp
                    ? 'border-l-amber-400'
                    : isCorrect
                    ? 'border-l-green-500'
                    : 'border-l-red-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-surface-400">
                      Q{idx + 1}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {QUESTION_TYPE_LABELS[q.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isComp ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {ans.teacherMarks !== null && ans.teacherMarks !== undefined
                          ? `${ans.teacherMarks}/${q.marks}`
                          : `—/${q.marks}`}
                      </span>
                    ) : isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          +{q.marks}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-500 font-medium">0</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm font-medium text-surface-900 dark:text-white mb-3 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Show student's answer */}
                {q.type === 'mcq' && (
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const wasSelected = ans.selectedOption?.toString?.() === opt._id?.toString?.();
                      return (
                        <div
                          key={opt._id}
                          className={`text-xs px-3 py-2 rounded-lg border ${
                            opt.isCorrect
                              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                              : wasSelected && !opt.isCorrect
                              ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                              : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                            {wasSelected && !opt.isCorrect && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                            {!opt.isCorrect && !wasSelected && <Minus className="w-3.5 h-3.5 opacity-30" />}
                            {opt.text}
                            {opt.isCorrect && <span className="ml-auto text-green-600 text-xs">(Correct)</span>}
                            {wasSelected && !opt.isCorrect && <span className="ml-auto text-red-500 text-xs">(Your answer)</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="flex gap-2 text-xs">
                    {['true', 'false'].map((val) => {
                      const isAnswer = q.correctAnswer === val;
                      const wasSelected = ans.selectedAnswer === val;
                      return (
                        <span
                          key={val}
                          className={`px-3 py-1.5 rounded-lg border capitalize ${
                            isAnswer
                              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300'
                              : wasSelected
                              ? 'bg-red-50 dark:bg-red-900/30 border-red-300 text-red-600 dark:text-red-300'
                              : 'bg-surface-50 dark:bg-surface-800 border-surface-200 text-surface-500'
                          }`}
                        >
                          {val}{isAnswer ? ' ✓' : ''}{wasSelected && !isAnswer ? ' ✗' : ''}
                        </span>
                      );
                    })}
                  </div>
                )}

                {q.type === 'comprehensive' && (
                  <div className="space-y-2">
                    <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3 text-sm text-surface-700 dark:text-surface-300">
                      <p className="text-xs text-surface-400 mb-1 font-medium">Your Answer:</p>
                      {ans.writtenAnswer ? (
                        <p className="leading-relaxed">{ans.writtenAnswer}</p>
                      ) : (
                        <p className="text-surface-400 italic">No answer provided</p>
                      )}
                    </div>
                    {ans.teacherFeedback && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Teacher Feedback:
                        </p>
                        <p className="text-surface-700 dark:text-surface-300 leading-relaxed">
                          {ans.teacherFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={() => navigate('/student/quizzes')}
          className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
};

export default AttemptResultPage;
