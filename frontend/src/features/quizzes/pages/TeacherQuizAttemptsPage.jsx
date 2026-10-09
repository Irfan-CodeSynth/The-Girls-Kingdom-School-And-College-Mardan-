import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  ChevronLeft,
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Pencil,
} from 'lucide-react';

const STATUS_CONFIG = {
  graded: { label: 'Graded', variant: 'success', icon: CheckCircle2 },
  pending_review: { label: 'Pending Review', variant: 'warning', icon: Hourglass },
  in_progress: { label: 'In Progress', variant: 'secondary', icon: Clock },
  submitted: { label: 'Submitted', variant: 'info', icon: CheckCircle2 },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const AttemptRow = ({ attempt }) => {
  const cfg = STATUS_CONFIG[attempt.status] || STATUS_CONFIG.in_progress;
  const Icon = cfg.icon;
  const needsGrading = attempt.status === 'pending_review';

  return (
    <tr className="hover:bg-[#FAF8F5] transition-colors">
      <td className="px-4 py-3 text-sm font-bold text-[#111827]">
        {attempt.student?.fullName || '—'}
        <div className="text-xs text-[#6B7280] font-normal">{attempt.student?.email}</div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={cfg.variant}>
          <Icon className="w-3 h-3 mr-1" />
          {cfg.label}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-[#374151]">
        {attempt.status === 'graded' || attempt.status === 'pending_review' ? (
          <span className="font-bold text-[#111827]">
            {attempt.obtainedMarks ?? '—'} / {attempt.totalMarks}
            {attempt.percentage != null && (
              <span className="text-xs text-[#6B7280] font-normal ml-1">({attempt.percentage}%)</span>
            )}
          </span>
        ) : (
          <span className="text-[#9CA3AF]">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-[#6B7280]">
        {formatDate(attempt.submittedAt || attempt.startedAt)}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          to={`/teacher/quizzes/${attempt.quiz?._id || attempt.quiz}/grade/${attempt._id}`}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
            needsGrading
              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              : 'bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A] hover:bg-[#F3EBE6]'
          }`}
        >
          <Pencil className="w-3 h-3" />
          {needsGrading ? 'Grade' : 'Review'}
        </Link>
      </td>
    </tr>
  );
};

export const TeacherQuizAttemptsPage = () => {
  const { id: quizId } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ['quizAttempts', quizId],
    queryFn: () => quizApi.getQuizAttempts(quizId),
  });

  const quiz = data?.quiz;
  const attempts = data?.attempts || [];

  const graded = attempts.filter((a) => a.status === 'graded').length;
  const pending = attempts.filter((a) => a.status === 'pending_review').length;
  const avgScore =
    attempts.filter((a) => a.status === 'graded').length > 0
      ? Math.round(
          attempts
            .filter((a) => a.status === 'graded')
            .reduce((s, a) => s + (a.percentage || 0), 0) /
            attempts.filter((a) => a.status === 'graded').length
        )
      : null;

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/teacher/quizzes"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
          Student Attempts
        </h1>
        {quiz && (
          <p className="text-sm text-[#6B7280] mt-1">
            {quiz.title} · <strong className="text-[#111827]">{quiz.class?.name}</strong>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: attempts.length, icon: Users, color: 'text-[#5A0D1A]', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Graded', value: graded, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Pending Review', value: pending, icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', icon: Trophy, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="text-center py-4 border-[#EFE5E0]">
            <div className={`w-9 h-9 rounded-xl ${bg} border mx-auto mb-2 flex items-center justify-center`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className="text-xl font-black text-[#111827]">{value}</p>
            <p className="text-xs font-bold text-[#6B7280] mt-0.5 uppercase tracking-wider">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden border-[#EFE5E0]">
        {attempts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No Attempts Yet"
              description="No students have attempted this quiz yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-[#EFE5E0] bg-[#FAF8F5]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0] bg-white">
                {attempts.map((a) => (
                  <AttemptRow key={a._id} attempt={a} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherQuizAttemptsPage;
