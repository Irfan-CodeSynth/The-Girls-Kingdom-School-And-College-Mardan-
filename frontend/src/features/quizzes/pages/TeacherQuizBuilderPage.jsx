import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import classApi from '../../classes/api/classApi';
import { Card, Button, Spinner } from '../../../components/ui';
import {
  ChevronLeft,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  Save,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'true_false', label: 'True / False' },
  { value: 'comprehensive', label: 'Written / Comprehensive' },
];

const defaultOption = () => ({ text: '', isCorrect: false });
const defaultQuestion = (type = 'mcq') => ({
  _localId: Math.random().toString(36).slice(2),
  type,
  questionText: '',
  marks: 1,
  options: type === 'mcq' ? [defaultOption(), defaultOption(), defaultOption(), defaultOption()] : [],
  correctAnswer: 'true',
  modelAnswer: '',
  order: 0,
});

// ── Single Question Builder ────────────────────────────────────
const QuestionBuilder = ({ question, index, onChange, onRemove }) => {
  const updateField = (field, value) => onChange({ ...question, [field]: value });

  const updateOption = (i, field, value) => {
    const opts = question.options.map((o, idx) =>
      idx === i ? { ...o, [field]: value } : o
    );
    onChange({ ...question, options: opts });
  };

  const setCorrectOption = (i) => {
    const opts = question.options.map((o, idx) => ({
      ...o,
      isCorrect: idx === i,
    }));
    onChange({ ...question, options: opts });
  };

  const addOption = () => {
    if (question.options.length >= 6) return;
    onChange({ ...question, options: [...question.options, defaultOption()] });
  };

  const removeOption = (i) => {
    if (question.options.length <= 2) return;
    onChange({ ...question, options: question.options.filter((_, idx) => idx !== i) });
  };

  return (
    <Card className="border border-[#EFE5E0]">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[#9CA3AF]" />
          <span className="text-sm font-bold text-[#5A0D1A]">
            Question {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={question.type}
            onChange={(e) => {
              const t = e.target.value;
              onChange({
                ...question,
                type: t,
                options: t === 'mcq' ? [defaultOption(), defaultOption(), defaultOption(), defaultOption()] : [],
                correctAnswer: t === 'true_false' ? 'true' : undefined,
              });
            }}
            className="text-xs border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] font-medium"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={question.marks}
            onChange={(e) => updateField('marks', parseFloat(e.target.value))}
            className="w-16 text-xs border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] font-bold"
            title="Marks"
          />
          <span className="text-xs text-[#6B7280]">marks</span>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <textarea
        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] mb-4"
        rows={2}
        placeholder="Enter your question prompt…"
        value={question.questionText}
        onChange={(e) => updateField('questionText', e.target.value)}
      />

      {/* MCQ Options */}
      {question.type === 'mcq' && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
            Options — click ◯ to mark the correct answer
          </p>
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectOption(i)}
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                  opt.isCorrect
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-[#D1D5DB] hover:border-emerald-500 bg-white'
                }`}
              >
                {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
              <input
                className="flex-1 px-3 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] focus:bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
                placeholder={`Option ${i + 1}`}
                value={opt.text}
                onChange={(e) => updateOption(i, 'text', e.target.value)}
              />
              {question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {question.options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-[#5A0D1A] font-bold hover:underline mt-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          )}
        </div>
      )}

      {/* True/False */}
      {question.type === 'true_false' && (
        <div className="flex gap-3">
          {['true', 'false'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => updateField('correctAnswer', val)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold capitalize transition-colors cursor-pointer ${
                question.correctAnswer === val
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-[#EFE5E0] text-[#6B7280] hover:border-emerald-300'
              }`}
            >
              {question.correctAnswer === val ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <Circle className="w-4 h-4 inline mr-1" />}
              {val}
            </button>
          ))}
        </div>
      )}

      {/* Comprehensive */}
      {question.type === 'comprehensive' && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
            Model Answer (optional — for instructor reference only)
          </p>
          <textarea
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] focus:bg-white text-sm text-[#111827] resize-none focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            rows={3}
            placeholder="Enter model rubric or key answer points…"
            value={question.modelAnswer || ''}
            onChange={(e) => updateField('modelAnswer', e.target.value)}
          />
        </div>
      )}
    </Card>
  );
};

// ── Main Builder ───────────────────────────────────────────────
export const TeacherQuizBuilderPage = () => {
  const { id: quizId } = useParams(); // undefined = create mode
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!quizId;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingMarks, setPassingMarks] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [questions, setQuestions] = useState([defaultQuestion('mcq')]);

  // Fetch existing quiz if editing
  const { data: existingData, isPending: loadingExisting } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => quizApi.getQuizById(quizId),
    enabled: isEdit,
  });

  // Fetch teacher's classes
  const { data: classesData } = useQuery({
    queryKey: ['myTeacherClasses'],
    queryFn: classApi.getMyTeacherClasses,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingData?.quiz) {
      const q = existingData.quiz;
      setTitle(q.title || '');
      setDescription(q.description || '');
      setClassId(q.class?._id || q.class || '');
      setDuration(q.duration || 60);
      setPassingMarks(q.passingMarks || 0);
      setMaxAttempts(q.maxAttempts || 1);
      setShuffleQuestions(q.shuffleQuestions || false);
      if (q.questions?.length) {
        setQuestions(
          q.questions.map((qq) => ({ ...qq, _localId: qq._id || Math.random().toString(36).slice(2) }))
        );
      }
    }
  }, [existingData]);

  const createMut = useMutation({
    mutationFn: (data) => quizApi.createQuiz(data),
  });

  const updateMut = useMutation({
    mutationFn: (data) => quizApi.updateQuiz(quizId, data),
  });

  const setQuestionsMut = useMutation({
    mutationFn: (qs) => quizApi.setQuestions(quizId || createMut.data?.quiz?._id, qs),
  });

  const handleSave = async (andPublish = false) => {
    if (!title.trim()) return toast.error('Quiz title is required.');
    if (title.trim().length < 3) return toast.error('Quiz title must be at least 3 characters.');
    if (!classId) return toast.error('Please select a class.');
    if (duration < 1) return toast.error('Duration must be at least 1 minute.');

    if (andPublish && questions.length === 0) {
      return toast.error('At least one question is required to publish a quiz.');
    }

    // Validate each question
    const cleanQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = i + 1;

      if (!q.questionText || !q.questionText.trim()) {
        return toast.error(`Question ${qNum}: Question text cannot be empty.`);
      }

      const qMarks = Number(q.marks) || 1;
      if (qMarks < 0.5) {
        return toast.error(`Question ${qNum}: Marks must be at least 0.5.`);
      }

      if (q.type === 'mcq') {
        const validOptions = (q.options || [])
          .filter((o) => o.text && o.text.trim())
          .map((o) => ({
            text: o.text.trim(),
            isCorrect: Boolean(o.isCorrect),
          }));

        if (validOptions.length < 2) {
          return toast.error(`Question ${qNum} (MCQ): Requires at least 2 non-empty options.`);
        }

        const correctCount = validOptions.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          return toast.error(`Question ${qNum} (MCQ): Please select exactly one correct answer option.`);
        }

        cleanQuestions.push({
          type: 'mcq',
          questionText: q.questionText.trim(),
          marks: qMarks,
          options: validOptions,
          order: i,
        });
      } else if (q.type === 'true_false') {
        cleanQuestions.push({
          type: 'true_false',
          questionText: q.questionText.trim(),
          marks: qMarks,
          correctAnswer: q.correctAnswer === 'false' ? 'false' : 'true',
          order: i,
        });
      } else if (q.type === 'comprehensive') {
        cleanQuestions.push({
          type: 'comprehensive',
          questionText: q.questionText.trim(),
          marks: qMarks,
          modelAnswer: q.modelAnswer?.trim() || undefined,
          order: i,
        });
      }
    }

    const totalMarks = cleanQuestions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
    const parsedPassingMarks = Number(passingMarks) || 0;
    if (parsedPassingMarks > totalMarks && totalMarks > 0) {
      return toast.error(
        `Passing marks (${parsedPassingMarks}) cannot be greater than total quiz marks (${totalMarks}). Please adjust passing marks.`
      );
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      classId,
      duration: Number(duration),
      passingMarks: parsedPassingMarks,
      maxAttempts: Number(maxAttempts) || 1,
      shuffleQuestions,
    };

    try {
      let savedQuizId = quizId;

      if (isEdit) {
        await updateMut.mutateAsync(payload);
      } else {
        const res = await createMut.mutateAsync(payload);
        savedQuizId = res.quiz?._id;
      }

      // Save questions
      if (cleanQuestions.length > 0) {
        await quizApi.setQuestions(savedQuizId, cleanQuestions);
      }

      if (andPublish) {
        await quizApi.publishQuiz(savedQuizId);
        toast.success('Quiz saved and published!');
      } else {
        toast.success(isEdit ? 'Quiz updated.' : 'Quiz created as draft.');
      }

      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
      navigate('/teacher/quizzes');
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const detail = fieldErrors.map((e) => `${e.field}: ${e.message}`).join(', ');
        toast.error(`Validation Error: ${detail}`);
      } else {
        toast.error(err?.response?.data?.message || 'Save failed.');
      }
    }
  };

  const addQuestion = (type = 'mcq') => {
    setQuestions((qs) => [...qs, defaultQuestion(type)]);
  };

  const updateQuestion = (idx, updated) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? updated : q)));
  };

  const removeQuestion = (idx) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const classes = classesData?.classes || [];
  const totalMarks = questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
  const isSaving = createMut.isPending || updateMut.isPending || setQuestionsMut.isPending;

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-8 h-8 text-[#5A0D1A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            to="/teacher/quizzes"
            className="p-2 rounded-xl bg-white border border-[#EFE5E0] hover:bg-[#FAF8F5] text-[#5A0D1A] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#5A0D1A]">
              {isEdit ? 'Edit Assessment' : 'New Assessment Quiz'}
            </h1>
            <p className="text-xs text-[#6B7280]">
              {totalMarks} total mark{totalMarks !== 1 ? 's' : ''} · {questions.length} question{questions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={() => handleSave(false)}
            loading={isSaving}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          {!isEdit && (
            <Button
              variant="primary"
              leftIcon={<Globe className="w-4 h-4" />}
              onClick={() => handleSave(true)}
              loading={isSaving}
              disabled={isSaving}
            >
              Save & Publish
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Metadata */}
      <Card className="border-[#EFE5E0]">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
          Quiz Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 block">
              Quiz Title *
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              placeholder="e.g. Midterm Examination — Biology Section A"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 block">
              Description / Instructions
            </label>
            <textarea
              className="w-full px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              rows={2}
              placeholder="Guidelines for students attempting this quiz…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 block">
                Class *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              >
                <option value="">Select class cohort…</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 block">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 block">
                Passing Marks
              </label>
              <input
                type="number"
                min="0"
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 block">
                Max Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="rounded border-[#EFE5E0] text-[#5A0D1A] focus:ring-[#5A0D1A]"
            />
            <span className="text-sm font-medium text-[#374151]">
              Shuffle questions randomly for each student
            </span>
          </label>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
            Questions ({questions.length})
          </h2>
          <span className="text-xs text-[#5A0D1A] font-bold">Total: {totalMarks} marks</span>
        </div>

        {questions.map((q, idx) => (
          <QuestionBuilder
            key={q._localId || idx}
            question={q}
            index={idx}
            onChange={(updated) => updateQuestion(idx, updated)}
            onRemove={() => removeQuestion(idx)}
          />
        ))}

        {/* Add question buttons */}
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => addQuestion(t.value)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-dashed border-[#EFE5E0] bg-[#FAF8F5] text-xs font-bold text-[#5A0D1A] hover:border-[#5A0D1A] hover:bg-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex justify-end gap-3 pt-2 pb-8">
        <Button
          variant="outline"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={() => handleSave(false)}
          loading={isSaving}
          disabled={isSaving}
        >
          Save Draft
        </Button>
        {!isEdit && (
          <Button
            variant="primary"
            leftIcon={<Globe className="w-4 h-4" />}
            onClick={() => handleSave(true)}
            loading={isSaving}
            disabled={isSaving}
          >
            Save & Publish
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeacherQuizBuilderPage;
