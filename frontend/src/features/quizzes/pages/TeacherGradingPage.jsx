import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton, Button, Spinner } from '../../../components/ui';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  User,
  Trophy,
  BookOpen,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

const QUESTION_TYPE_LABELS = {
  mcq: 'MCQ',
  true_false: 'True / False',
  comprehensive: 'Written',
};

export const TeacherGradingPage = () => {
  const { quizId, attemptId } = useParams();
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => quizApi.getAttemptById(attemptId),
  });

  // Local grading state: { [questionId]: { marks, feedback } }
  const [grades, setGrades] = useState({});

  const gradeMut = useMutation({
    mutationFn: ({ questionId, marks, feedback }) =>
      quizApi.gradeAnswer(attemptId, questionId, {
        teacherMarks: Number(marks),
        teacherFeedback: feedback,
      }),
    onSuccess: (_, vars) => {
      toast.success(`Question graded: ${vars.marks} marks`);
      queryClient.invalidateQueries({ queryKey: ['attempt', attemptId] });
      queryClient.invalidateQueries({ queryKey: ['quizAttempts', quizId] });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.message || 'Grading failed'),
  });

  if (isPending) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const attempt = data?.attempt;
  const quiz = attempt?.quiz;

  if (!attempt) {
    return (
      <div className="text-center py-16 text-[#6B7280]">Attempt not found.</div>
    );
  }

  const answerMap = {};
  (attempt.answers || []).forEach((a) => {
    answerMap[(a.question?._id || a.question)?.toString()] = a;
  });

  const questions = quiz?.questions || [];
  const compQuestions = questions.filter((q) => q.type === 'comprehensive');
  const allGraded = compQuestions.every((q) => {
    const ans = answerMap[q._id?.toString()];
    return ans?.teacherMarks !== null && ans?.teacherMarks !== undefined;
  });

  const handleGrade = (questionId, question) => {
    const g = grades[questionId];
    if (g?.marks === undefined || g?.marks === '') {
      return toast.error('Please enter marks before saving.');
    }
    gradeMut.mutate({
      questionId,
      marks: g.marks,
      feedback: g.feedback || '',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        to={`/teacher/quizzes/${quizId}/attempts`}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Attempts
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
          Grade Attempt
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {quiz?.title}
        </p>
      </div>

      {/* Student Info + Score Summary */}
      <Card className="flex flex-wrap gap-4 items-center justify-between border-[#EFE5E0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
            <User className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="font-bold text-[#111827] text-sm">
              {attempt.student?.fullName || '—'}
            </p>
            <p className="text-xs text-[#6B7280]">{attempt.student?.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-[#111827]">
              {attempt.autoGradedMarks}
            </p>
            <p className="text-xs text-[#6B7280]">Auto-graded</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-[#5A0D1A]">
              {attempt.manualGradedMarks ?? 0}
            </p>
            <p className="text-xs text-[#6B7280]">Manual</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-[#111827]">
              {attempt.obtainedMarks} / {attempt.totalMarks}
            </p>
            <p className="text-xs text-[#6B7280]">Total</p>
          </div>
          <Badge
            variant={attempt.status === 'graded' ? 'success' : 'warning'}
            dot
          >
            {attempt.status === 'graded' ? 'Fully Graded' : 'Pending Review'}
          </Badge>
        </div>
      </Card>

      {/* Questions */}
      {questions.map((q, idx) => {
        const ans = answerMap[q._id?.toString()] || {};
        const isComp = q.type === 'comprehensive';
        const alreadyGraded =
          ans.teacherMarks !== null && ans.teacherMarks !== undefined;
        const localGrade = grades[q._id] || {};

        return (
          <Card
            key={q._id}
            className={`border border-[#EFE5E0] border-l-4 ${
              isComp
                ? alreadyGraded
                  ? 'border-l-emerald-600'
                  : 'border-l-amber-500'
                : ans.isCorrect
                ? 'border-l-emerald-600'
                : 'border-l-rose-500'
            }`}
          >
            {/* Question header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#5A0D1A]">
                  Q{idx + 1}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {QUESTION_TYPE_LABELS[q.type]}
                </Badge>
              </div>
              <span className="text-xs font-bold text-[#6B7280]">
                Max: {q.marks} mark{q.marks !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#111827] mb-4 leading-relaxed">
              {q.questionText}
            </p>

            {/* MCQ Result */}
            {q.type === 'mcq' && (
              <div className="space-y-1.5">
                {q.options?.map((opt) => {
                  const wasSelected =
                    ans.selectedOption?.toString?.() === opt._id?.toString?.();
                  return (
                    <div
                      key={opt._id}
                      className={`text-xs px-3 py-2 rounded-xl border ${
                        opt.isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                          : wasSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-700 font-medium'
                          : 'bg-[#FAF8F5] border-[#EFE5E0] text-[#6B7280]'
                      }`}
                    >
                      {opt.text}
                      {opt.isCorrect && <span className="ml-2 text-emerald-700 font-bold">(Correct)</span>}
                      {wasSelected && !opt.isCorrect && (
                        <span className="ml-2 text-rose-700 font-bold">(Student's answer)</span>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-[#6B7280] mt-2">
                  Auto-graded: <strong className="text-[#111827]">{ans.marksObtained ?? 0}/{q.marks}</strong> marks
                </p>
              </div>
            )}

            {/* TF Result */}
            {q.type === 'true_false' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {['true', 'false'].map((val) => {
                    const isCorrect = q.correctAnswer === val;
                    const wasSelected = ans.selectedAnswer === val;
                    return (
                      <span
                        key={val}
                        className={`px-4 py-2 rounded-xl text-sm border font-medium capitalize ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : wasSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-[#FAF8F5] border-[#EFE5E0] text-[#6B7280]'
                        }`}
                      >
                        {val}
                        {isCorrect && ' ✓'}
                        {wasSelected && !isCorrect && ' ✗'}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-[#6B7280]">
                  Auto-graded: <strong className="text-[#111827]">{ans.marksObtained ?? 0}/{q.marks}</strong> marks
                </p>
              </div>
            )}

            {/* Comprehensive — manual grading area */}
            {isComp && (
              <div className="space-y-4">
                {/* Student's answer */}
                <div className="bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#5A0D1A]" /> Student's Answer:
                  </p>
                  {ans.writtenAnswer ? (
                    <p className="text-sm text-[#111827] leading-relaxed">
                      {ans.writtenAnswer}
                    </p>
                  ) : (
                    <p className="text-sm text-[#9CA3AF] italic">No answer provided</p>
                  )}
                </div>

                {/* Model answer hint */}
                {q.modelAnswer && (
                  <details className="text-xs text-[#6B7280]">
                    <summary className="cursor-pointer hover:text-[#5A0D1A] transition-colors font-bold">
                      View model answer
                    </summary>
                    <p className="mt-2 bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3 text-[#374151] leading-relaxed">
                      {q.modelAnswer}
                    </p>
                  </details>
                )}

                {/* Grading input */}
                <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/80 space-y-3">
                  <p className="text-xs font-bold text-amber-900">
                    {alreadyGraded ? 'Update Grade' : 'Enter Grade'}
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-[#374151] w-28 shrink-0">
                      Marks (max {q.marks}):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={q.marks}
                      step="0.5"
                      placeholder={alreadyGraded ? String(ans.teacherMarks) : '0'}
                      defaultValue={alreadyGraded ? ans.teacherMarks : ''}
                      onChange={(e) =>
                        setGrades((g) => ({
                          ...g,
                          [q._id]: { ...g[q._id], marks: e.target.value },
                        }))
                      }
                      className="w-24 px-3 py-2 rounded-xl border border-[#EFE5E0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
                    />
                    <span className="text-xs text-[#6B7280]">/ {q.marks}</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#374151] block mb-1">
                      Feedback (optional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter feedback for student…"
                      defaultValue={ans.teacherFeedback || ''}
                      onChange={(e) =>
                        setGrades((g) => ({
                          ...g,
                          [q._id]: { ...g[q._id], feedback: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE5E0] bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {alreadyGraded && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Currently: {ans.teacherMarks}/{q.marks} marks
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleGrade(q._id, q)}
                      disabled={gradeMut.isPending}
                      className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {gradeMut.isPending ? (
                        <Spinner className="w-3.5 h-3.5" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {alreadyGraded ? 'Update' : 'Save Grade'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {allGraded && (
        <Card className="bg-emerald-50 border border-emerald-200 text-center py-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-emerald-900 text-base">
            All comprehensive questions graded!
          </p>
          <p className="text-sm text-emerald-700 mt-1">
            Final score: <strong>{attempt.obtainedMarks} / {attempt.totalMarks}</strong> ({attempt.percentage}%)
          </p>
        </Card>
      )}

      <div className="pb-8" />
    </div>
  );
};

export default TeacherGradingPage;
