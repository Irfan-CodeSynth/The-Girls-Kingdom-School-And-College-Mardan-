import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import {
  Card,
  Badge,
  Button,
  Skeleton,
  EmptyState,
  ConfirmDialog,
} from '../../../components/ui';
import {
  Plus,
  ClipboardList,
  Clock,
  Users,
  Trophy,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Archive,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'success' },
  closed: { label: 'Closed', variant: 'warning' },
  archived: { label: 'Archived', variant: 'secondary' },
};

const QuizCard = ({ quiz, onPublish, onClose, onArchive, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;

  return (
    <Card className="flex flex-col gap-3 hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cfg.variant} dot>
            {cfg.label}
          </Badge>
          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg z-20 py-1 text-sm">
                  <Link
                    to={`/teacher/quizzes/${quiz._id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Quiz
                  </Link>
                  <Link
                    to={`/teacher/quizzes/${quiz._id}/attempts`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="w-3.5 h-3.5" /> View Attempts
                  </Link>
                  {quiz.status === 'draft' && (
                    <button
                      onClick={() => { setMenuOpen(false); onPublish(quiz._id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-green-600 dark:text-green-400"
                    >
                      <Globe className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  {quiz.status === 'published' && (
                    <button
                      onClick={() => { setMenuOpen(false); onClose(quiz._id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-amber-600 dark:text-amber-400"
                    >
                      <Lock className="w-3.5 h-3.5" /> Close Quiz
                    </button>
                  )}
                  {(quiz.status === 'draft' || quiz.status === 'closed') && (
                    <button
                      onClick={() => { setMenuOpen(false); onArchive(quiz._id); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-500"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>
                  )}
                  {(quiz.status === 'draft' || quiz.status === 'archived') && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(quiz); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-red-500 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-bold text-surface-900 dark:text-white text-sm leading-snug line-clamp-2">
          {quiz.title}
        </h3>
        {quiz.description && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-1">
            {quiz.description}
          </p>
        )}
        <p className="text-xs text-surface-400 mt-1">
          {quiz.class?.name || 'No class'} · {quiz.class?.code}
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-surface-100 dark:border-surface-700 text-xs text-surface-500 dark:text-surface-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {quiz.duration} min
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          {quiz.totalMarks} marks
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {quiz.attemptCount ?? 0} attempts
        </span>
      </div>
    </Card>
  );
};

export const TeacherQuizListPage = () => {
  const queryClient = useQueryClient();
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['teacherQuizzes', statusFilter],
    queryFn: () => quizApi.getQuizzes(statusFilter ? { status: statusFilter } : {}),
  });

  const publishMut = useMutation({
    mutationFn: quizApi.publishQuiz,
    onSuccess: () => {
      toast.success('Quiz published!');
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Publish failed'),
  });

  const closeMut = useMutation({
    mutationFn: quizApi.closeQuiz,
    onSuccess: () => {
      toast.success('Quiz closed.');
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Close failed'),
  });

  const archiveMut = useMutation({
    mutationFn: quizApi.archiveQuiz,
    onSuccess: () => {
      toast.success('Quiz archived.');
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Archive failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => quizApi.deleteQuiz(id),
    onSuccess: () => {
      toast.success('Quiz deleted.');
      setQuizToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Delete failed'),
  });

  const quizzes = data?.quizzes || [];

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Closed', value: 'closed' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <>
      <ConfirmDialog
        isOpen={!!quizToDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quizToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate(quizToDelete._id)}
        onCancel={() => setQuizToDelete(null)}
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
              My Quizzes
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              Create, manage, and publish quizzes for your classes
            </p>
          </div>
          <Link to="/teacher/quizzes/new">
            <Button icon={Plus}>New Quiz</Button>
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quiz Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No Quizzes Found"
            message={
              statusFilter
                ? `No ${statusFilter} quizzes. Change the filter or create a new quiz.`
                : 'Get started by creating your first quiz.'
            }
            action={
              !statusFilter && (
                <Link to="/teacher/quizzes/new">
                  <Button icon={Plus} size="sm">Create First Quiz</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onPublish={(id) => publishMut.mutate(id)}
                onClose={(id) => closeMut.mutate(id)}
                onArchive={(id) => archiveMut.mutate(id)}
                onDelete={setQuizToDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherQuizListPage;
