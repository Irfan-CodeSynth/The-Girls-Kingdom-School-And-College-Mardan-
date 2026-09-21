import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import quizApi from '../api/quizApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import {
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  BarChart3,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Award,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────
const scoreColor = (pct) => {
  if (pct === null || pct === undefined) return 'text-surface-400';
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-danger-600 dark:text-danger-400';
};

const scoreBg = (pct) => {
  if (pct === null || pct === undefined) return 'bg-surface-100 dark:bg-surface-700';
  if (pct >= 80) return 'bg-emerald-50 dark:bg-emerald-950/60';
  if (pct >= 50) return 'bg-amber-50 dark:bg-amber-950/60';
  return 'bg-danger-50 dark:bg-danger-950/60';
};

const statusConfig = {
  graded:    { label: 'Graded',     variant: 'success' },
  submitted: { label: 'Pending Review', variant: 'warning' },
};

// ─── Circular score indicator ─────────────────────────────────
const ScoreRing = ({ pct }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = ((pct ?? 0) / 100) * circ;
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={circ - filled}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${scoreColor(pct)}`}>
          {pct ?? '—'}%
        </span>
      </div>
    </div>
  );
};

// ─── Summary stat tile ────────────────────────────────────────
const StatTile = ({ icon: Icon, label, value, color, loading }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-14 mb-1" />
          <Skeleton className="h-4 w-28" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value ?? '—'}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
        </>
      )}
    </div>
  </Card>
);

// ─── Filter tabs ──────────────────────────────────────────────
const FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'graded',   label: 'Graded' },
  { value: 'submitted', label: 'Pending' },
];

// ─── Main page ────────────────────────────────────────────────
export const GradesTranscriptPage = () => {
  const [filter, setFilter] = useState('all');

  const { data, isPending } = useQuery({
    queryKey: ['myGrades'],
    queryFn: () => quizApi.getMyGrades(),
  });

  const attempts = data?.attempts || [];
  const summary  = data?.summary  || {};

  const filtered = filter === 'all'
    ? attempts
    : attempts.filter((a) => a.status === filter);

  // Group by class for transcript view
  const byClass = filtered.reduce((acc, attempt) => {
    const cls = attempt.quiz?.class;
    const key = cls?._id || 'unknown';
    if (!acc[key]) acc[key] = { cls, items: [] };
    acc[key].items.push(attempt);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Grades &amp; Transcripts
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Your complete academic performance record across all quizzes
        </p>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile
          label="Total Attempts"
          value={summary.totalAttempts}
          icon={ClipboardList}
          color="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
          loading={isPending}
        />
        <StatTile
          label="Quizzes Graded"
          value={summary.totalGraded}
          icon={CheckCircle2}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={isPending}
        />
        <StatTile
          label="Avg. Score"
          value={summary.avgPercentage !== null ? `${summary.avgPercentage}%` : '—'}
          icon={BarChart3}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={isPending}
        />
        <StatTile
          label="Passed"
          value={summary.passedCount}
          icon={Award}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={isPending}
        />
      </div>

      {/* ── Performance summary bar ── */}
      {!isPending && summary.totalGraded > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Performance Overview</h2>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            {[
              {
                label: 'Highest Score',
                value: summary.highestScore !== null ? `${summary.highestScore}%` : '—',
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                label: 'Average Score',
                value: summary.avgPercentage !== null ? `${summary.avgPercentage}%` : '—',
                color: 'text-primary-600 dark:text-primary-400',
              },
              {
                label: 'Pass Rate',
                value: summary.totalGraded > 0
                  ? `${Math.round((summary.passedCount / summary.totalGraded) * 100)}%`
                  : '—',
                color: 'text-amber-600 dark:text-amber-400',
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-surface-400 text-xs mb-0.5">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Mini score distribution */}
          <div className="mt-4 flex items-center gap-2">
            {['Excellent (≥80%)', 'Satisfactory (50–79%)', 'Below Pass (<50%)'].map((lbl, i) => {
              const colors = ['bg-emerald-500', 'bg-amber-400', 'bg-danger-500'];
              return (
                <span key={lbl} className="flex items-center gap-1 text-xs text-surface-400">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                  {lbl}
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {f.label}
            {!isPending && f.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({attempts.filter((a) => a.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Results list ── */}
      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Results Yet"
          message={
            filter === 'all'
              ? "You haven't submitted any quizzes yet. Complete a quiz to see your grades here."
              : `No ${filter === 'submitted' ? 'pending' : 'graded'} results found.`
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.values(byClass).map(({ cls, items }) => (
            <div key={cls?._id || 'unknown'}>
              {/* Class group header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {cls?.name || 'Unknown Class'}
                  </p>
                  <p className="text-xs text-surface-400">
                    {cls?.code} · {cls?.academicYear}
                  </p>
                </div>
              </div>

              {/* Attempt cards for this class */}
              <div className="space-y-3 ml-11">
                {items.map((attempt) => {
                  const quiz = attempt.quiz;
                  const pct = attempt.status === 'graded' ? (attempt.percentage ?? 0) : null;
                  const cfg = statusConfig[attempt.status] || statusConfig.submitted;

                  return (
                    <Card key={attempt._id} hover className="!p-0 overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        {/* Score ring or pending indicator */}
                        {attempt.status === 'graded' ? (
                          <ScoreRing pct={pct} />
                        ) : (
                          <div className="w-16 h-16 flex-shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
                            <AlertCircle className="w-7 h-7 text-amber-500" />
                          </div>
                        )}

                        {/* Quiz info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                              {quiz?.title || 'Unknown Quiz'}
                            </p>
                            <Badge variant={cfg.variant} dot size="sm">
                              {cfg.label}
                            </Badge>
                            {attempt.status === 'graded' && attempt.isPassed !== null && (
                              <Badge
                                variant={attempt.isPassed ? 'success' : 'danger'}
                                size="sm"
                              >
                                {attempt.isPassed ? 'PASSED' : 'FAILED'}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-surface-400">
                            {quiz?.teacher?.fullName && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {quiz.teacher.fullName}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {quiz?.duration} min
                            </span>
                            {attempt.submittedAt && (
                              <span>
                                Submitted {new Date(attempt.submittedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>

                          {/* Score bar for graded attempts */}
                          {attempt.status === 'graded' && (
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden max-w-xs">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-danger-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${scoreColor(pct)}`}>
                                {attempt.obtainedMarks}/{attempt.totalMarks} marks
                              </span>
                            </div>
                          )}

                          {/* Pending review note */}
                          {attempt.status === 'submitted' && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                              Auto-graded: {attempt.autoGradedMarks}/{attempt.totalMarks} — awaiting teacher review for written answers
                            </p>
                          )}
                        </div>

                        {/* View result link (only for graded) */}
                        {attempt.status === 'graded' && quiz?._id && (
                          <Link
                            to={`/student/quizzes/${quiz._id}/result/${attempt._id}`}
                            className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            View
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradesTranscriptPage;
