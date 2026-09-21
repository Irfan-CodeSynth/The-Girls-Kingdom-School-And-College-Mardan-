import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import { Spinner } from '../../../components/ui';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Timer Component ────────────────────────────────────────────
const Timer = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining(diff);
      if (diff === 0) onExpire?.();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const totalSec = Math.floor(remaining / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const isUrgent = totalSec < 300; // under 5 min

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1.5 rounded-lg ${
        isUrgent
          ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 animate-pulse'
          : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
      }`}
    >
      <Clock className="w-4 h-4" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
};

// ─── Question Navigator ────────────────────────────────────────
const QuestionNav = ({ questions, answers, currentIdx, onSelect }) => (
  <div className="flex flex-wrap gap-1.5">
    {questions.map((q, i) => {
      const answered = answers[q._id] !== undefined && answers[q._id] !== null;
      const isCurrent = i === currentIdx;
      return (
        <button
          key={q._id}
          onClick={() => onSelect(i)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
            isCurrent
              ? 'bg-primary-600 text-white'
              : answered
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
        >
          {i + 1}
        </button>
      );
    })}
  </div>
);

// ─── MCQ Question ─────────────────────────────────────────────
const MCQQuestion = ({ question, answer, onChange }) => (
  <div className="space-y-3">
    {question.options.map((opt) => {
      const selected = answer?.selectedOptionId === opt._id;
      return (
        <button
          key={opt._id}
          onClick={() => onChange({ selectedOptionId: opt._id })}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm ${
            selected
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-900 dark:text-primary-100 font-medium'
              : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-700 text-surface-700 dark:text-surface-300'
          }`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                selected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-surface-300 dark:border-surface-600'
              }`}
            >
              {selected && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            {opt.text}
          </span>
        </button>
      );
    })}
  </div>
);

// ─── True/False Question ──────────────────────────────────────
const TrueFalseQuestion = ({ question, answer, onChange }) => (
  <div className="flex gap-4">
    {['true', 'false'].map((val) => {
      const selected = answer?.selectedAnswer === val;
      return (
        <button
          key={val}
          onClick={() => onChange({ selectedAnswer: val })}
          className={`flex-1 py-4 rounded-xl border-2 font-semibold text-sm transition-all duration-150 capitalize ${
            selected
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
              : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-primary-300 dark:hover:border-primary-700 text-surface-600 dark:text-surface-400'
          }`}
        >
          {val === 'true' ? '✓ True' : '✗ False'}
        </button>
      );
    })}
  </div>
);

// ─── Comprehensive Question ───────────────────────────────────
const ComprehensiveQuestion = ({ question, answer, onChange }) => (
  <div>
    <textarea
      className="w-full h-40 px-4 py-3 rounded-xl border-2 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm resize-none focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-colors"
      placeholder="Write your answer here…"
      value={answer?.writtenAnswer || ''}
      onChange={(e) => onChange({ writtenAnswer: e.target.value })}
    />
    <p className="text-xs text-surface-400 mt-1 text-right">
      {(answer?.writtenAnswer || '').length} / 8000 characters
    </p>
  </div>
);

// ─── Confirm Submit Modal ─────────────────────────────────────
const ConfirmModal = ({ answered, total, onConfirm, onCancel }) => {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-surface-900 dark:text-white">Submit Quiz?</h3>
        <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
          You have answered {answered} of {total} questions.
          {unanswered > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {' '}{unanswered} question{unanswered !== 1 ? 's' : ''} unanswered.
            </span>
          )}
        </p>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          You cannot change your answers after submission.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            Continue Reviewing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main QuizTakePage ────────────────────────────────────────
export const QuizTakePage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedOptionId?, selectedAnswer?, writtenAnswer? } }
  const [attemptId, setAttemptId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const autoSaveRef = useRef(null);

  // Fetch quiz (student view — sanitized)
  const { data: quizData, isPending: quizPending } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuizById(quizId),
  });

  const quiz = quizData?.quiz;
  const questions = quiz?.questions || [];

  // Start attempt on mount
  useEffect(() => {
    if (!quizId) return;
    quizApi.startAttempt(quizId)
      .then((data) => {
        setAttemptId(data.attempt._id);
        setExpiresAt(data.attempt.expiresAt);

        // Restore saved answers if resuming
        if (data.resumed && data.attempt.answers?.length) {
          const restored = {};
          data.attempt.answers.forEach((a) => {
            const qId = a.question?.toString?.() || a.question;
            if (a.selectedOption) restored[qId] = { selectedOptionId: a.selectedOption };
            else if (a.selectedAnswer) restored[qId] = { selectedAnswer: a.selectedAnswer };
            else if (a.writtenAnswer) restored[qId] = { writtenAnswer: a.writtenAnswer };
          });
          setAnswers(restored);
          if (data.resumed) toast.info('Resumed your previous attempt.');
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Unable to start quiz.';
        toast.error(msg);
        navigate('/student/quizzes');
      })
      .finally(() => setIsStarting(false));
  }, [quizId, navigate]);

  // Auto-save every 30 seconds
  const doAutoSave = useCallback(async () => {
    if (!attemptId) return;
    const answerPayload = Object.entries(answers).map(([questionId, ans]) => ({
      questionId,
      ...ans,
    }));
    try {
      await quizApi.saveProgress(attemptId, answerPayload);
    } catch {
      // silent
    }
  }, [attemptId, answers]);

  useEffect(() => {
    autoSaveRef.current = doAutoSave;
  }, [doAutoSave]);

  useEffect(() => {
    const id = setInterval(() => autoSaveRef.current?.(), 30_000);
    return () => clearInterval(id);
  }, []);

  // Handle timer expiry — auto-submit
  const handleTimerExpire = useCallback(async () => {
    if (!attemptId || isSubmitting) return;
    toast.warning('Time is up! Submitting automatically…');
    await handleSubmitFinal(true);
  }, [attemptId, isSubmitting]); // eslint-disable-line

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitFinal = async (auto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirm(false);

    const answerPayload = Object.entries(answers).map(([questionId, ans]) => ({
      questionId,
      ...ans,
    }));

    try {
      await quizApi.submitAttempt(attemptId, answerPayload);
      toast.success(auto ? 'Quiz auto-submitted.' : 'Quiz submitted successfully!');
      navigate(`/student/quizzes/${quizId}/result/${attemptId}`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Submission failed.';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).filter((qId) => {
    const a = answers[qId];
    return a?.selectedOptionId || a?.selectedAnswer || a?.writtenAnswer?.trim();
  }).length;

  if (isStarting || quizPending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner className="w-10 h-10 mx-auto" />
          <p className="text-surface-500 dark:text-surface-400 text-sm">
            {isStarting ? 'Starting your quiz…' : 'Loading questions…'}
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex-1 flex items-center justify-center text-surface-400">
        Quiz not found.
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const currentAnswer = answers[currentQ?._id] || null;

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          answered={answeredCount}
          total={questions.length}
          onConfirm={() => handleSubmitFinal(false)}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 gap-6">
        {/* Quiz Header Bar */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold text-surface-900 dark:text-white text-lg leading-tight">
              {quiz.title}
            </h1>
            <p className="text-xs text-surface-400 mt-0.5">
              {quiz.totalMarks} total marks · {quiz.questions?.length} questions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={doAutoSave}
              className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <Timer expiresAt={expiresAt} onExpire={handleTimerExpire} />
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Question navigator */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-4 sticky top-6">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-3 uppercase tracking-wider">
                Questions
              </p>
              <QuestionNav
                questions={questions}
                answers={answers}
                currentIdx={currentIdx}
                onSelect={setCurrentIdx}
              />
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-400">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {answeredCount}
                </span>
                /{questions.length} answered
              </div>
            </div>
          </aside>

          {/* Right: Current question */}
          <main className="flex-1">
            {currentQ && (
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 space-y-5">
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                        Question {currentIdx + 1} of {questions.length}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          currentQ.type === 'mcq'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : currentQ.type === 'true_false'
                            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {currentQ.type === 'mcq'
                          ? 'MCQ'
                          : currentQ.type === 'true_false'
                          ? 'True / False'
                          : 'Written'}
                      </span>
                    </div>
                    <p className="text-base font-medium text-surface-900 dark:text-white leading-relaxed">
                      {currentQ.questionText}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-surface-500 dark:text-surface-400 whitespace-nowrap">
                    {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Answer Input */}
                {currentQ.type === 'mcq' && (
                  <MCQQuestion
                    question={currentQ}
                    answer={currentAnswer}
                    onChange={(val) => handleAnswerChange(currentQ._id, val)}
                  />
                )}
                {currentQ.type === 'true_false' && (
                  <TrueFalseQuestion
                    question={currentQ}
                    answer={currentAnswer}
                    onChange={(val) => handleAnswerChange(currentQ._id, val)}
                  />
                )}
                {currentQ.type === 'comprehensive' && (
                  <ComprehensiveQuestion
                    question={currentQ}
                    answer={currentAnswer}
                    onChange={(val) => handleAnswerChange(currentQ._id, val)}
                  />
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-800">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => i - 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((i) => i + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(true)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Bottom submit bar (always visible) */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Answers are auto-saved every 30 seconds
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            Submit Quiz
          </button>
        </div>
      </div>
    </>
  );
};

export default QuizTakePage;
