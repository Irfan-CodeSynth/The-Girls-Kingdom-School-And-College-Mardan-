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
      toast.success(`Q answered graded: ${vars.marks} marks`);
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
      <div className="text-center py-16 text-surface-400">Attempt not found.</div>
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
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Attempts
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Grade Attempt
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          {quiz?.title}
        </p>
      </div>

      {/* Student Info + Score Summary */}
      <Card className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-surface-900 dark:text-white text-sm">
              {attempt.student?.fullName || '—'}
            </p>
            <p className="text-xs text-surface-400">{attempt.student?.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-surface-900 dark:text-white">
              {attempt.autoGradedMarks}
            </p>
            <p className="text-xs text-surface-400">Auto-graded</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-primary-600 dark:text-primary-400">
              {attempt.manualGradedMarks ?? 0}
            </p>
            <p className="text-xs text-surface-400">Manual</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-surface-900 dark:text-white">
              {attempt.obtainedMarks} / {attempt.totalMarks}
            </p>
            <p className="text-xs text-surface-400">Total</p>
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
            className={`border-l-4 ${
              isComp
                ? alreadyGraded
                  ? 'border-l-green-500'
                  : 'border-l-amber-400'
                : ans.isCorrect
                ? 'border-l-green-500'
                : 'border-l-red-400'
            }`}
          >
            {/* Question header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-surface-400">
                  Q{idx + 1}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {QUESTION_TYPE_LABELS[q.type]}
                </Badge>
              </div>
              <span className="text-xs font-medium text-surface-500">
                Max: {q.marks} mark{q.marks !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-sm font-medium text-surface-900 dark:text-white mb-4 leading-relaxed">
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
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        opt.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/30 border-green-300 text-green-800 dark:text-green-200'
                          : wasSelected
                          ? 'bg-red-50 dark:bg-red-900/30 border-red-300 text-red-700'
                          : 'bg-surface-50 dark:bg-surface-800 border-surface-200 text-surface-500'
                      }`}
                    >
                      {opt.text}
                      {opt.isCorrect && <span className="ml-2 text-green-600">(Correct)</span>}
                      {wasSelected && !opt.isCorrect && (
                        <span className="ml-2 text-red-500">(Student's answer)</span>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-surface-400 mt-2">
                  Auto-graded: {ans.marksObtained ?? 0}/{q.marks} marks
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
                        className={`px-4 py-2 rounded-lg text-sm border capitalize ${
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-900/30 border-green-300 text-green-700'
                            : wasSelected
                            ? 'bg-red-50 dark:bg-red-900/30 border-red-300 text-red-600'
                            : 'bg-surface-50 dark:bg-surface-800 border-surface-200 text-surface-400'
                        }`}
                      >
                        {val}
                        {isCorrect && ' ✓'}
                        {wasSelected && !isCorrect && ' ✗'}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-surface-400">
                  Auto-graded: {ans.marksObtained ?? 0}/{q.marks} marks
                </p>
              </div>
            )}

            {/* Comprehensive — manual grading area */}
            {isComp && (
              <div className="space-y-4">
                {/* Student's answer */}
                <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-surface-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Student's Answer:
                  </p>
                  {ans.writtenAnswer ? (
                    <p className="text-sm text-surface-800 dark:text-surface-200 leading-relaxed">
                      {ans.writtenAnswer}
                    </p>
                  ) : (
                    <p className="text-sm text-surface-400 italic">No answer provided</p>
                  )}
                </div>

                {/* Model answer hint */}
                {q.modelAnswer && (
                  <details className="text-xs text-surface-500">
                    <summary className="cursor-pointer hover:text-primary-600 transition-colors font-medium">
                      View model answer
                    </summary>
                    <p className="mt-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 text-surface-700 dark:text-surface-300 leading-relaxed">
                      {q.modelAnswer}
                    </p>
                  </details>
                )}

                {/* Grading input */}
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800 space-y-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {alreadyGraded ? 'Update Grade' : 'Enter Grade'}
                  </p>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-surface-500 w-28 flex-shrink-0">
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
                      className="w-24 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-xs text-surface-400">/ {q.marks}</span>
                  </div>

                  <div>
                    <label className="text-xs text-surface-500 block mb-1">
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
                      className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {alreadyGraded && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Currently: {ans.teacherMarks}/{q.marks} marks
                      </span>
                    )}
                    <button
                      onClick={() => handleGrade(q._id, q)}
                      disabled={gradeMut.isPending}
                      className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
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
        <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center py-6">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800 dark:text-green-200">
            All comprehensive questions graded!
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Final score: {attempt.obtainedMarks} / {attempt.totalMarks} ({attempt.percentage}%)
          </p>
        </Card>
      )}

      <div className="pb-8" />
    </div>
  );
};

export default TeacherGradingPage;
