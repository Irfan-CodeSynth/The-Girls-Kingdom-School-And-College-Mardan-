import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import { Card, Badge, Button, Skeleton, EmptyState } from '../../../components/ui';
import {
  CheckCircle2,
  Hourglass,
  FileQuestion,
  BookOpen,
  ArrowRight,
  Clock,
  Pencil,
  AlertCircle,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  published: { label: 'Published & Live', variant: 'success' },
  closed:    { label: 'Closed',           variant: 'info' },
  draft:     { label: 'Draft',            variant: 'warning' },
  archived:  { label: 'Archived',         variant: 'default' },
};

export const TeacherGradingQueuePage = () => {
  const [filter, setFilter] = useState('all');

  const { data, isPending } = useQuery({
    queryKey: ['teacher-grading-quizzes'],
    queryFn: () => quizApi.getQuizzes({ limit: 100 }),
  });

  const quizzes = data?.quizzes || [];

  // Quizzes with comprehensive questions (require manual review/grading)
  const quizzesWithManualGrading = quizzes.filter((q) =>
    q.questions?.some((qn) => qn.type === 'comprehensive')
  );

  const closedQuizzes = quizzes.filter((q) => q.status === 'closed');
  const liveQuizzes = quizzes.filter((q) => q.status === 'published');

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === 'needs_grading') {
      return q.questions?.some((qn) => qn.type === 'comprehensive');
    }
    if (filter === 'closed') return q.status === 'closed';
    if (filter === 'published') return q.status === 'published';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            Grading &amp; Assessment Queue
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Review student submissions, evaluate written answers, and finalize grades
          </p>
        </div>

        <Link to="/teacher/quizzes/new">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Pencil className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {isPending ? '—' : quizzesWithManualGrading.length}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Written / Manual Grading</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {isPending ? '—' : closedQuizzes.length}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Closed Quizzes</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {isPending ? '—' : liveQuizzes.length}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Live &amp; Active</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 flex items-center justify-center shrink-0">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {isPending ? '—' : quizzes.length}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Total Quizzes</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-surface-200 dark:border-surface-700 pb-2">
        {[
          { id: 'all',           label: 'All Quizzes',             count: quizzes.length },
          { id: 'needs_grading', label: 'Needs Manual Review',     count: quizzesWithManualGrading.length },
          { id: 'closed',        label: 'Closed for Submission',   count: closedQuizzes.length },
          { id: 'published',     label: 'Live / Published',        count: liveQuizzes.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === t.id
                ? 'bg-primary-600 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {t.label}
            {!isPending && (
              <span className="ml-1.5 text-xs opacity-75">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Quiz List */}
      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No Quizzes Found"
          message={
            filter === 'needs_grading'
              ? 'Great news! No quizzes currently have pending comprehensive questions awaiting manual grading.'
              : 'No quizzes found in this category.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => {
            const hasComprehensive = quiz.questions?.some((q) => q.type === 'comprehensive');
            const compCount = quiz.questions?.filter((q) => q.type === 'comprehensive').length || 0;
            const mcqCount = quiz.questions?.filter((q) => q.type === 'mcq' || q.type === 'true_false').length || 0;
            const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;

            return (
              <Card key={quiz._id} hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-surface-900 dark:text-white truncate">
                      {quiz.title}
                    </h2>
                    <Badge variant={cfg.variant} size="sm" dot>
                      {cfg.label}
                    </Badge>
                    {hasComprehensive && (
                      <Badge variant="warning" size="sm">
                        Manual Grading ({compCount} written Qs)
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500 dark:text-surface-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                      {quiz.class?.name || 'Class Assigned'} ({quiz.class?.code || '—'})
                    </span>
                    <span>•</span>
                    <span>{quiz.questions?.length || 0} Questions ({mcqCount} Auto, {compCount} Written)</span>
                    <span>•</span>
                    <span>Total Marks: {quiz.totalMarks}</span>
                    <span>•</span>
                    <span>Pass Marks: {quiz.passingMarks}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/teacher/quizzes/${quiz._id}/attempts`}>
                    <Button
                      variant={hasComprehensive ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Grade Attempts
                    </Button>
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

export default TeacherGradingQueuePage;
