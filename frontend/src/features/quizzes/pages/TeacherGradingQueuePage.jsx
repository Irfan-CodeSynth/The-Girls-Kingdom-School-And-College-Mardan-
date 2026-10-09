import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import { Card, Badge, Button, Skeleton, EmptyState } from '../../../components/ui';
import { DashboardStatCard } from '../../../components/dashboard';
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
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#5A0D1A]" />
            Grading &amp; Assessment Queue
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Review student submissions, evaluate written answers, and finalize grades
          </p>
        </div>

        <Link to="/teacher/quizzes/new">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Summary Stat Cards (Exact Dashboard Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          icon={Pencil}
          iconBg="bg-[#FEF3C7] text-[#D97706]"
          value={isPending ? '—' : quizzesWithManualGrading.length}
          label="Written / Manual Grading"
          loading={isPending}
        />
        <DashboardStatCard
          icon={Clock}
          iconBg="bg-[#EFF6FF] text-[#2563EB]"
          value={isPending ? '—' : closedQuizzes.length}
          label="Closed Quizzes"
          loading={isPending}
        />
        <DashboardStatCard
          icon={CheckCircle2}
          iconBg="bg-[#ECFDF5] text-[#059669]"
          value={isPending ? '—' : liveQuizzes.length}
          label="Live &amp; Active"
          loading={isPending}
        />
        <DashboardStatCard
          icon={FileQuestion}
          iconBg="bg-[#FAF5F5] text-[#5A0D1A]"
          value={isPending ? '—' : quizzes.length}
          label="Total Quizzes"
          loading={isPending}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#EFE5E0] pb-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all',           label: 'All Quizzes',             count: quizzes.length },
          { id: 'needs_grading', label: 'Needs Manual Review',     count: quizzesWithManualGrading.length },
          { id: 'closed',        label: 'Closed for Submission',   count: closedQuizzes.length },
          { id: 'published',     label: 'Live / Published',        count: liveQuizzes.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === t.id
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'bg-white border border-[#EFE5E0] text-[#4B5563] hover:bg-[#FAF8F5]'
            }`}
          >
            {t.label}
            {!isPending && (
              <span className="ml-1.5 opacity-80">({t.count})</span>
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
          message="No quizzes match your selected filter criteria."
        />
      ) : (
        <div className="space-y-3.5">
          {filteredQuizzes.map((quiz) => {
            const hasComprehensive = quiz.questions?.some((q) => q.type === 'comprehensive');
            const compCount = quiz.questions?.filter((q) => q.type === 'comprehensive').length || 0;
            const mcqCount = quiz.questions?.filter((q) => q.type === 'mcq' || q.type === 'true_false').length || 0;
            const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;

            return (
              <Card key={quiz._id} hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#EFE5E0] shadow-xs">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-[#111827] truncate font-sans">
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

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4B5563]">
                    <span className="flex items-center gap-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-[#5A0D1A]" />
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
