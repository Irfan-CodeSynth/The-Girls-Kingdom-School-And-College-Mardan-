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
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EFE5E0" strokeWidth="10" />
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
        <span className="text-3xl font-serif font-bold text-[#111827]">
          {percentage}%
        </span>
        {isPassed !== null && isPassed !== undefined && (
          <span className={`text-[11px] font-bold tracking-wider uppercase mt-0.5 ${isPassed ? 'text-emerald-700' : 'text-red-600'}`}>
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
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-[#6B7280]">
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/student/quizzes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#5A0D1A] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Score Card */}
      <Card className="text-center space-y-4 bg-white border border-[#EFE5E0] shadow-xs rounded-2xl p-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-serif font-bold text-[#111827]">
            Quiz Result
          </h1>
        </div>
        <p className="text-[#6B7280] text-sm font-medium">
          {quiz?.title}
        </p>

        {isPending2 ? (
          <div className="py-6 space-y-3">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <p className="font-serif font-bold text-lg text-[#111827]">
              Pending Manual Review
            </p>
            <p className="text-sm text-[#6B7280] max-w-md mx-auto">
              Your written answers are being reviewed by the teacher. Check back later for your final score.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <span className="text-[#6B7280] font-medium">Auto-graded marks:</span>
              <span className="font-bold text-[#5A0D1A]">
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
              <div className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Obtained</p>
                <p className="font-serif font-bold text-xl text-[#111827]">
                  {attempt.obtainedMarks}
                </p>
              </div>
              <div className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Total</p>
                <p className="font-serif font-bold text-xl text-[#111827]">
                  {attempt.totalMarks}
                </p>
              </div>
              <div className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">Duration</p>
                <p className="font-serif font-bold text-xl text-[#111827]">
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
          <h2 className="text-base font-serif font-bold text-[#111827] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#5A0D1A]" />
            Answer Review
          </h2>

          {quiz.questions.map((q, idx) => {
            const ans = answerMap[q._id] || {};
            const isCorrect = ans.isCorrect;
            const isComp = q.type === 'comprehensive';

            return (
              <Card
                key={q._id}
                className={`bg-white border border-[#EFE5E0] shadow-xs rounded-2xl p-5 border-l-4 ${
                  isComp
                    ? 'border-l-amber-500'
                    : isCorrect
                    ? 'border-l-emerald-600'
                    : 'border-l-red-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#6B7280]">
                      Q{idx + 1}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {QUESTION_TYPE_LABELS[q.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isComp ? (
                      <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {ans.teacherMarks !== null && ans.teacherMarks !== undefined
                          ? `${ans.teacherMarks}/${q.marks}`
                          : `—/${q.marks}`}
                      </span>
                    ) : isCorrect ? (
                      <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+{q.marks}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200 text-xs">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>0</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#111827] mb-3 leading-relaxed">
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
                          className={`text-xs px-3 py-2 rounded-xl border ${
                            opt.isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                              : wasSelected && !opt.isCorrect
                              ? 'bg-red-50 border-red-300 text-red-900 font-medium'
                              : 'bg-[#FAF8F5] border-[#EFE5E0] text-[#4B5563]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                            {wasSelected && !opt.isCorrect && <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />}
                            {!opt.isCorrect && !wasSelected && <Minus className="w-3.5 h-3.5 opacity-30 flex-shrink-0" />}
                            <span className="flex-1">{opt.text}</span>
                            {opt.isCorrect && <span className="ml-auto text-emerald-700 font-bold text-xs">(Correct)</span>}
                            {wasSelected && !opt.isCorrect && <span className="ml-auto text-red-600 font-bold text-xs">(Your answer)</span>}
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
                          className={`px-3 py-1.5 rounded-xl border capitalize font-semibold ${
                            isAnswer
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : wasSelected
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-[#FAF8F5] border-[#EFE5E0] text-[#6B7280]'
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
                    <div className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3.5 text-sm text-[#111827]">
                      <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-1 font-bold">Your Answer:</p>
                      {ans.writtenAnswer ? (
                        <p className="leading-relaxed font-normal">{ans.writtenAnswer}</p>
                      ) : (
                        <p className="text-[#6B7280] italic">No answer provided</p>
                      )}
                    </div>
                    {ans.teacherFeedback && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-sm">
                        <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" /> Teacher Feedback:
                        </p>
                        <p className="text-[#111827] leading-relaxed">
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
          className="px-6 py-2.5 rounded-xl bg-[#5A0D1A] hover:bg-[#430913] text-white text-sm font-semibold transition-colors shadow-xs"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
};

export default AttemptResultPage;
