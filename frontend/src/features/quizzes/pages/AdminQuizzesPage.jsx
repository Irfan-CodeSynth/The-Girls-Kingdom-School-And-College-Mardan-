import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  ClipboardList,
  Users,
  Clock,
  Trophy,
  Eye,
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'success' },
  closed: { label: 'Closed', variant: 'warning' },
  archived: { label: 'Archived', variant: 'secondary' },
};

export const AdminQuizzesPage = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['adminQuizzes', statusFilter],
    queryFn: () => quizApi.getQuizzes(statusFilter ? { status: statusFilter } : {}),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          Quiz Governance
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Monitor all quizzes across all classes and teachers
        </p>
      </div>

      {/* Status filter */}
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

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Quizzes Found"
          message="No quizzes match the current filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;
            return (
              <Card key={quiz._id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-primary-600" />
                  </div>
                  <Badge variant={cfg.variant} dot>
                    {cfg.label}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white text-sm line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-surface-400 mt-1">
                    {quiz.class?.name} · Teacher: {quiz.teacher?.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-surface-100 dark:border-surface-700 text-xs text-surface-400">
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
                    {quiz.attemptCount ?? 0}
                  </span>
                  <Link
                    to={`/teacher/quizzes/${quiz._id}/attempts`}
                    className="ml-auto flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzesPage;
