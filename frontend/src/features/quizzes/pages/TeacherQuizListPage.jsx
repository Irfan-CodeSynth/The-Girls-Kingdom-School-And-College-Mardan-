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
  RotateCcw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'success' },
  closed: { label: 'Closed', variant: 'warning' },
  archived: { label: 'Archived', variant: 'secondary' },
};

const QuizCard = ({ quiz, onPublish, onUnpublish, onClose, onArchive, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;

  return (
    <Card className="flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-visible z-10 border border-[#EFE5E0]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4.5 h-4.5 text-amber-700" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cfg.variant} dot>
            {cfg.label}
          </Badge>
          {/* Actions menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#6B7280] transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#EFE5E0] rounded-xl shadow-xl z-50 py-1.5 text-sm">
                  <Link
                    to={`/teacher/quizzes/${quiz._id}/edit`}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-[#111827]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#5A0D1A]" />
                    <span>Edit Quiz</span>
                  </Link>
                  <Link
                    to={`/teacher/quizzes/${quiz._id}/attempts`}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-[#111827]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Attempts</span>
                  </Link>

                  <div className="my-1 border-t border-[#EFE5E0]" />

                  {/* Status Change Options */}
                  {quiz.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onPublish(quiz._id); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-emerald-700 font-medium cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publish Quiz</span>
                    </button>
                  )}
                  {quiz.status === 'published' && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onClose(quiz._id); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-amber-700 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Close Quiz</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onUnpublish(quiz._id); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-[#4B5563] cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revert to Draft</span>
                      </button>
                    </>
                  )}
                  {quiz.status === 'closed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onPublish(quiz._id); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-emerald-700 font-medium cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Re-Publish Quiz</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onUnpublish(quiz._id); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-[#4B5563] cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revert to Draft</span>
                      </button>
                    </>
                  )}
                  {quiz.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onArchive(quiz._id); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-[#6B7280] cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}
                  {quiz.status === 'archived' && (
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onUnpublish(quiz._id); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F5] text-[#4B5563] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Draft</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-[#EFE5E0]" />

                  {/* Delete option */}
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(quiz); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Quiz</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-bold text-[#111827] text-sm leading-snug line-clamp-2">
          {quiz.title}
        </h3>
        {quiz.description && (
          <p className="text-xs text-[#6B7280] mt-1 line-clamp-1 leading-relaxed">
            {quiz.description}
          </p>
        )}
        <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
          {quiz.class?.name || 'No class'} · {quiz.class?.code}
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EFE5E0] text-xs text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#5A0D1A]" />
          {quiz.duration} min
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          {quiz.totalMarks} marks
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-[#5A0D1A]" />
          {quiz.attemptCount ?? 0} attempts
        </span>
      </div>
    </Card>
  );
};

export const TeacherQuizListPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [quizToDelete, setQuizToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['teacherQuizzes', statusFilter],
    queryFn: () => quizApi.getQuizzes({ status: statusFilter || undefined }),
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

  const publishMut = useMutation({
    mutationFn: quizApi.publishQuiz,
    onSuccess: () => {
      toast.success('Quiz published! Students can now see it.');
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

  const unpublishMut = useMutation({
    mutationFn: quizApi.unpublishQuiz,
    onSuccess: () => {
      toast.success('Quiz reverted to draft.');
      queryClient.invalidateQueries({ queryKey: ['teacherQuizzes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Revert failed'),
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
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
              My Quizzes
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Create, manage, and publish quizzes for your academic classes
            </p>
          </div>
          <Link to="/teacher/quizzes/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>New Quiz</Button>
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-[#5A0D1A] text-white shadow-xs'
                  : 'bg-white border border-[#EFE5E0] text-[#6B7280] hover:bg-[#FAF8F5] hover:text-[#111827]'
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
          <Card className="p-8">
            <EmptyState
              icon={ClipboardList}
              title="No Quizzes Found"
              description={
                statusFilter
                  ? `No ${statusFilter} quizzes. Change the filter or create a new quiz.`
                  : 'Get started by creating your first quiz.'
              }
              actionLabel={!statusFilter ? 'Create First Quiz' : undefined}
              onAction={!statusFilter ? () => window.location.assign('/teacher/quizzes/new') : undefined}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onPublish={(id) => publishMut.mutate(id)}
                onUnpublish={(id) => unpublishMut.mutate(id)}
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
