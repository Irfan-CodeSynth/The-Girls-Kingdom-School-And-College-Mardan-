import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import { Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  ClipboardList,
  Users,
  Clock,
  Trophy,
  Eye,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'default' },
  published: { label: 'Published', variant: 'success' },
  closed: { label: 'Closed', variant: 'warning' },
  archived: { label: 'Archived', variant: 'default' },
};

export const AdminQuizzesPage = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['adminQuizzes', statusFilter],
    queryFn: () => quizApi.getQuizzes(statusFilter ? { status: statusFilter } : {}),
  });

  const quizzes = data?.quizzes || [];

  const statusTabs = [
    { label: 'All Quizzes', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Closed', value: 'closed' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Academic Assessments
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Quiz & Exam Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            Institutional oversight of tests, examination schedules, submissions, and marks across all classes.
          </p>
        </div>
      </div>

      {/* ── Status filter pills ── */}
      <div className="flex gap-2 flex-wrap bg-white p-2.5 rounded-2xl border border-[#EFE5E0] shadow-xs">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#5A0D1A] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#6B7280] hover:text-[#111827] border border-[#EFE5E0]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quizzes List Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#EFE5E0] p-6 space-y-3 shadow-xs">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center shadow-xs">
          <EmptyState
            icon={ClipboardList}
            title="No Quizzes Found"
            message="No assessment quizzes match the current status filter."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {quizzes.map((quiz) => {
            const cfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl border border-[#EFE5E0] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#5A0D1A] border border-[#EFE5E0] flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-[#5A0D1A]" />
                    </div>
                    <Badge variant={cfg.variant} dot size="sm">
                      {cfg.label}
                    </Badge>
                  </div>

                  <h3 className="font-serif font-bold text-[#111827] text-base line-clamp-2">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-[#6B7280] mt-1">
                    Class: <strong className="text-[#111827]">{quiz.class?.name}</strong> · Teacher: {quiz.teacher?.fullName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFE5E0] flex items-center justify-between text-xs text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5A0D1A]" />
                    <span>{quiz.durationMinutes ? `${quiz.durationMinutes} mins` : 'Untimed'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>{quiz.totalMarks ?? 0} Marks</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzesPage;
