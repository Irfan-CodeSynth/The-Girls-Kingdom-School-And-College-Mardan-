import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Trophy,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Calendar,
  BookOpen,
  BarChart3,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';
import parentApi from '../api/parentApi';
import ChildSelectorBar from '../components/ChildSelectorBar';

const scoreColor = (pct) => {
  if (pct === null || pct === undefined) return 'text-[#6B7280]';
  if (pct >= 80) return 'text-emerald-700';
  if (pct >= 50) return 'text-amber-700';
  return 'text-rose-600';
};

const scoreBg = (pct) => {
  if (pct === null || pct === undefined) return 'bg-gray-50 border-gray-200';
  if (pct >= 80) return 'bg-emerald-50 border-emerald-200';
  if (pct >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-rose-50 border-rose-200';
};

export const ParentResultsPage = () => {
  const { selectedChildId, selectedChild } = useParentChild();
  const [activeTab, setActiveTab] = useState('attempts'); // 'attempts' | 'curriculum'

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildQuizzes', selectedChildId],
    queryFn: () => parentApi.getChildQuizzes(selectedChildId),
    enabled: Boolean(selectedChildId),
  });

  const attempts = data?.attempts || [];
  const quizzes = data?.quizzes || [];

  const totalAttempts = attempts.length;
  const avgPercentage =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
      : null;

  const highPerformers = attempts.filter((a) => (a.percentage || 0) >= 80).length;
  const needSupport = attempts.filter((a) => (a.percentage || 0) < 50).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ward Selector Bar */}
      <ChildSelectorBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#111827]">
            Quizzes & Academic Results
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Evaluations, continuous quiz scores, and academic transcript for {selectedChild?.fullName || 'student'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#EFE5E0] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('attempts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attempts'
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Evaluation Attempts ({attempts.length})
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Class Quizzes ({quizzes.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Average Score
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#111827] mt-1">
            {avgPercentage !== null ? `${avgPercentage}%` : 'N/A'}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Across all attempted evaluations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5A0D1A]">
            Total Attempts
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#5A0D1A] mt-1">
            {totalAttempts}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Submitted quizzes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Distinctions (80%+)
          </p>
          <p className="font-serif text-3xl font-extrabold text-emerald-600 mt-1">
            {highPerformers}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">High proficiency grades</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Below 50%
          </p>
          <p className="font-serif text-3xl font-extrabold text-rose-600 mt-1">
            {needSupport}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Requires study revision</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3 bg-white rounded-2xl border border-[#EFE5E0]">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : activeTab === 'attempts' ? (
        /* ─── Attempts Table ─── */
        <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
          <div className="p-4 bg-[#FAF8F5] border-b border-[#EFE5E0] flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#111827]">
              Submitted Quiz Evaluation Transcript
            </h3>
            <span className="text-xs text-[#6B7280] font-semibold">
              {attempts.length} Official Attempts
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6B7280]">
              No quiz evaluation attempts recorded for this student yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5]/60 text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#EFE5E0]">
                  <tr>
                    <th className="py-3.5 px-4">Quiz Title</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE5E0]">
                  {attempts.map((att) => {
                    const quizTitle = att.quiz?.title || 'Class Quiz';
                    const subject = att.quiz?.subject || 'Academics';
                    const submittedFmt = att.submittedAt
                      ? new Date(att.submittedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';
                    const pct = att.percentage ?? (att.totalMarks > 0 ? Math.round((att.score / att.totalMarks) * 100) : 0);

                    return (
                      <tr key={att._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#111827]">
                          {quizTitle}
                        </td>
                        <td className="py-3.5 px-4 text-[#6B7280] font-medium">
                          {subject}
                        </td>
                        <td className="py-3.5 px-4 text-[#6B7280]">{submittedFmt}</td>
                        <td className="py-3.5 px-4 font-bold text-[#111827]">
                          {att.score || 0} / {att.totalMarks || att.quiz?.totalMarks || 100}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${scoreBg(
                              pct
                            )} ${scoreColor(pct)}`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={att.status === 'graded' ? 'success' : 'warning'}
                            className="capitalize text-[10px]"
                          >
                            {att.status === 'graded' ? 'Graded' : 'Submitted'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ─── Class Quizzes Curriculum ─── */
        <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
          <div className="p-4 bg-[#FAF8F5] border-b border-[#EFE5E0] flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#111827]">
              Published Class Quizzes Roster
            </h3>
            <span className="text-xs text-[#6B7280] font-semibold">
              {quizzes.length} Published
            </span>
          </div>

          {quizzes.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#6B7280]">
              No quizzes currently scheduled or active for this class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5]/60 text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#EFE5E0]">
                  <tr>
                    <th className="py-3.5 px-4">Quiz Title</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Total Marks</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE5E0]">
                  {quizzes.map((q) => {
                    const deadlineFmt = q.deadline
                      ? new Date(q.deadline).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Open-ended';

                    return (
                      <tr key={q._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#111827]">{q.title}</td>
                        <td className="py-3.5 px-4 text-[#6B7280] font-medium">{q.subject}</td>
                        <td className="py-3.5 px-4 font-bold text-[#5A0D1A]">
                          {q.totalMarks} Marks
                        </td>
                        <td className="py-3.5 px-4 text-[#6B7280]">
                          {q.durationMinutes ? `${q.durationMinutes} mins` : 'Untimed'}
                        </td>
                        <td className="py-3.5 px-4 text-[#6B7280]">{deadlineFmt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentResultsPage;
