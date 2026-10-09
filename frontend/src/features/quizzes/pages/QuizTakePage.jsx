import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
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
      className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1.5 rounded-xl border ${
        isUrgent
          ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
          : 'bg-[#FAF8F5] border-[#EFE5E0] text-[#5A0D1A]'
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
          type="button"
          onClick={() => onSelect(i)}
          className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            isCurrent
              ? 'bg-[#5A0D1A] text-white shadow-xs'
              : answered
              ? 'bg-[#FAF8F5] text-[#5A0D1A] border border-[#EFE5E0]'
              : 'bg-white text-[#6B7280] border border-[#EFE5E0] hover:bg-[#FAF8F5]'
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
          type="button"
          onClick={() => onChange({ selectedOptionId: opt._id })}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 text-sm cursor-pointer ${
            selected
              ? 'border-[#5A0D1A] bg-[#FAF8F5] text-[#5A0D1A] font-bold shadow-xs'
              : 'border-[#EFE5E0] bg-white hover:border-[#5A0D1A]/30 text-[#111827]'
          }`}
        >
          <span className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                selected
                  ? 'border-[#5A0D1A] bg-[#5A0D1A]'
                  : 'border-[#D1D5DB]'
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
          type="button"
          onClick={() => onChange({ selectedAnswer: val })}
          className={`flex-1 py-4 rounded-xl border-2 font-bold text-sm transition-all duration-150 capitalize cursor-pointer ${
            selected
              ? 'border-[#5A0D1A] bg-[#FAF8F5] text-[#5A0D1A] shadow-xs'
              : 'border-[#EFE5E0] bg-white hover:border-[#5A0D1A]/30 text-[#4B5563]'
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
      className="w-full h-40 px-4 py-3 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] transition-colors"
      placeholder="Type your essay or detailed response here…"
      value={answer?.writtenAnswer || ''}
      onChange={(e) => onChange({ writtenAnswer: e.target.value })}
    />
    <p className="text-xs text-[#6B7280] mt-1 text-right">
      {(answer?.writtenAnswer || '').length} / 8000 characters
    </p>
  </div>
);

// ─── Confirm Submit Modal ─────────────────────────────────────
const ConfirmModal = ({ answered, total, onConfirm, onCancel }) => {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-md p-6">
        <h3 className="text-xl font-serif font-bold text-[#5A0D1A]">Submit Assessment?</h3>
        <p className="text-[#4B5563] mt-2 text-sm leading-relaxed">
          You have answered <strong className="text-[#111827]">{answered}</strong> of <strong className="text-[#111827]">{total}</strong> questions.
          {unanswered > 0 && (
            <span className="text-rose-700 font-bold block mt-1">
              {' '}{unanswered} question{unanswered !== 1 ? 's' : ''} remaining unanswered.
            </span>
          )}
        </p>
        <p className="text-xs text-[#6B7280] mt-2">
          Once submitted, responses cannot be edited or modified.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#EFE5E0] text-sm font-bold text-[#4B5563] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            Review Answers
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            Confirm Submit
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
  const [answers, setAnswers] = useState({});
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
          <Spinner className="w-10 h-10 mx-auto text-[#5A0D1A]" />
          <p className="text-[#6B7280] text-sm">
            {isStarting ? 'Starting your assessment session…' : 'Loading questions…'}
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#6B7280]">
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
        <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif font-bold text-[#5A0D1A] text-lg leading-tight">
              {quiz.title}
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {quiz.totalMarks} total marks · {quiz.questions?.length} questions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={doAutoSave}
              className="flex items-center gap-1.5 text-xs font-bold text-[#5A0D1A] bg-[#FAF8F5] border border-[#EFE5E0] px-3 py-1.5 rounded-xl hover:bg-[#F3EBE6] transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Progress
            </button>
            <Timer expiresAt={expiresAt} onExpire={handleTimerExpire} />
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Question navigator */}
          <aside className="lg:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-4 sticky top-6">
              <p className="text-xs font-bold text-[#6B7280] mb-3 uppercase tracking-wider">
                Question Index
              </p>
              <QuestionNav
                questions={questions}
                answers={answers}
                currentIdx={currentIdx}
                onSelect={setCurrentIdx}
              />
              <div className="mt-4 pt-4 border-t border-[#EFE5E0] text-xs text-[#6B7280]">
                <strong className="text-[#5A0D1A]">
                  {answeredCount}
                </strong>
                /{questions.length} answered
              </div>
            </div>
          </aside>

          {/* Right: Current question */}
          <main className="flex-1">
            {currentQ && (
              <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-5">
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-[#5A0D1A] uppercase tracking-wider">
                        Question {currentIdx + 1} of {questions.length}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A]">
                        {currentQ.type === 'mcq'
                          ? 'MCQ'
                          : currentQ.type === 'true_false'
                          ? 'True / False'
                          : 'Written'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-[#111827] leading-relaxed">
                      {currentQ.questionText}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#6B7280] whitespace-nowrap">
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
                <div className="flex items-center justify-between pt-4 border-t border-[#EFE5E0]">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => i - 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold text-[#4B5563] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((i) => i + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-[#5A0D1A] hover:bg-[#420812] text-white transition-colors cursor-pointer shadow-xs"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(true)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
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
        <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Answers are auto-saved in the background every 30 seconds
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#5A0D1A] hover:bg-[#420812] text-white transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {isSubmitting ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            Submit Assessment
          </button>
        </div>
      </div>
    </>
  );
};

export default QuizTakePage;
