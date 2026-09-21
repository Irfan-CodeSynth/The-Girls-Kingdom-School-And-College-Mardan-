import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import classApi from '../../classes/api/classApi';
import { Card, Button, Input, Spinner, Badge } from '../../../components/ui';
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
    <Card className="border border-surface-200 dark:border-surface-700">
      {/* Question Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-surface-300 dark:text-surface-600" />
          <span className="text-sm font-semibold text-surface-500 dark:text-surface-400">
            Q{index + 1}
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
            className="text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="w-16 text-xs border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            title="Marks"
          />
          <span className="text-xs text-surface-400">marks</span>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <textarea
        className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
        rows={2}
        placeholder="Enter your question…"
        value={question.questionText}
        onChange={(e) => updateField('questionText', e.target.value)}
      />

      {/* MCQ Options */}
      {question.type === 'mcq' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
            Options — click ◯ to mark the correct answer
          </p>
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setCorrectOption(i)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  opt.isCorrect
                    ? 'border-green-500 bg-green-500'
                    : 'border-surface-300 dark:border-surface-600 hover:border-green-400'
                }`}
              >
                {opt.isCorrect && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
              <input
                className="flex-1 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={`Option ${i + 1}`}
                value={opt.text}
                onChange={(e) => updateOption(i, 'text', e.target.value)}
              />
              {question.options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="text-surface-400 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {question.options.length < 6 && (
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
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
              onClick={() => updateField('correctAnswer', val)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-colors ${
                question.correctAnswer === val
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-green-300'
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
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
            Model Answer (optional — for teacher reference only)
          </p>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm text-surface-900 dark:text-surface-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Enter model answer…"
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
    if (!classId) return toast.error('Please select a class.');
    if (duration < 1) return toast.error('Duration must be at least 1 minute.');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      classId,
      duration: Number(duration),
      passingMarks: Number(passingMarks),
      maxAttempts: Number(maxAttempts),
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
      if (questions.length > 0) {
        const cleanQuestions = questions.map(({ _localId, ...rest }) => rest);
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
      toast.error(err?.response?.data?.message || 'Save failed.');
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
        <Spinner className="w-8 h-8" />
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
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">
              {isEdit ? 'Edit Quiz' : 'New Quiz'}
            </h1>
            <p className="text-sm text-surface-400">
              {totalMarks} total mark{totalMarks !== 1 ? 's' : ''} · {questions.length} question{questions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Save}
            onClick={() => handleSave(false)}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          {!isEdit && (
            <Button
              icon={Globe}
              onClick={() => handleSave(true)}
              isLoading={isSaving}
              disabled={isSaving}
            >
              Save & Publish
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Metadata */}
      <Card>
        <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
          Quiz Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 block">
              Quiz Title *
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Midterm Examination — CS Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 block">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="What does this quiz cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 block">
                Class *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select class…</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 block">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 block">
                Passing Marks
              </label>
              <input
                type="number"
                min="0"
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 block">
                Max Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-surface-700 dark:text-surface-300">
              Shuffle questions for each student
            </span>
          </label>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
            Questions ({questions.length})
          </h2>
          <span className="text-xs text-surface-400">Total: {totalMarks} marks</span>
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
              onClick={() => addQuestion(t.value)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 text-xs font-medium text-surface-500 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex justify-end gap-3 pt-2 pb-8">
        <Button variant="outline" icon={Save} onClick={() => handleSave(false)} isLoading={isSaving} disabled={isSaving}>
          Save Draft
        </Button>
        {!isEdit && (
          <Button icon={Globe} onClick={() => handleSave(true)} isLoading={isSaving} disabled={isSaving}>
            Save & Publish
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeacherQuizBuilderPage;
