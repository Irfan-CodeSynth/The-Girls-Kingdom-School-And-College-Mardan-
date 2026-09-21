import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { studentApi } from '../../students/api/studentApi';
import { teacherApi } from '../../teachers/api/teacherApi';
import { classApi } from '../../classes/api/classApi';
import quizApi from '../../quizzes/api/quizApi';
import { Card, Badge, Avatar, Skeleton } from '../../../components/ui';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  FileQuestion,
  CheckCircle2,
  Clock,
  ArchiveX,
  RefreshCw,
} from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, loading, to }) => {
  const content = (
    <Card hover className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <>
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{value ?? '—'}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{label}</p>
          </>
        )}
      </div>
    </Card>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

// ─── Section Header ───────────────────────────────────────────
const SectionHeader = ({ title, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-base font-semibold text-surface-900 dark:text-white">{title}</h2>
    {linkTo && (
      <Link
        to={linkTo}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
      >
        {linkLabel}
        <ChevronRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

// ─── Quiz Status Badge colours ─────────────────────────────────
const QUIZ_BADGE = {
  draft: 'warning',
  published: 'success',
  closed: 'info',
  archived: 'default',
};

// ─── Main Page ────────────────────────────────────────────────
export const AdminDashboardPage = () => {
  const { data: studentsData, isPending: loadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['students', 'adminDash'],
    queryFn: () => studentApi.getStudents({ limit: 5 }),
  });

  const { data: teachersData, isPending: loadingTeachers, refetch: refetchTeachers } = useQuery({
    queryKey: ['teachers', 'adminDash'],
    queryFn: () => teacherApi.getTeachers({ limit: 5 }),
  });

  const { data: classesData, isPending: loadingClasses, refetch: refetchClasses } = useQuery({
    queryKey: ['classes', 'adminDash'],
    queryFn: () => classApi.getClasses({ limit: 20 }),
  });

  const { data: quizzesData, isPending: loadingQuizzes, refetch: refetchQuizzes } = useQuery({
    queryKey: ['quizzes', 'adminDash'],
    queryFn: () => quizApi.getQuizzes({ limit: 100 }),
  });

  const students = studentsData?.students || [];
  const totalStudents = studentsData?.pagination?.total ?? students.length;
  const teachers = teachersData?.teachers || [];
  const totalTeachers = teachersData?.pagination?.total ?? teachers.length;
  const classes = classesData?.classes || [];
  const totalClasses = classesData?.pagination?.total ?? classes.length;

  const quizzes = quizzesData?.quizzes || [];
  const quizByStatus = quizzes.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {});

  const activeQuizzes = (quizByStatus.published || 0);

  const handleRefreshAll = () => {
    refetchStudents();
    refetchTeachers();
    refetchClasses();
    refetchQuizzes();
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Admin Executive Dashboard
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            System-wide overview of The Girls Kingdom School and College Mardan Portal
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary-500" />
          Refresh Stats
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Registered Students"
          value={totalStudents}
          icon={Users}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={loadingStudents}
          to="/admin/students"
        />
        <StatCard
          label="Faculty Members"
          value={totalTeachers}
          icon={GraduationCap}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={loadingTeachers}
          to="/admin/teachers"
        />
        <StatCard
          label="Active Classes"
          value={totalClasses}
          icon={BookOpen}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={loadingClasses}
          to="/admin/classes"
        />
        <StatCard
          label="Live Quizzes"
          value={activeQuizzes}
          icon={ClipboardList}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={loadingQuizzes}
          to="/admin/quizzes"
        />
      </div>

      {/* ── Bottom grid: Students + Faculty + Classes + Quiz Activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Recent Students */}
        <div>
          <SectionHeader title="Recent Students" linkTo="/admin/students" linkLabel="View all" />
          <Card className="!p-0 overflow-hidden">
            {loadingStudents ? (
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <Skeleton variant="circle" className="w-9 h-9 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-surface-400">
                <Users className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No students yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-100 dark:divide-surface-700">
                {students.slice(0, 5).map((s) => (
                  <li key={s._id}>
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Avatar name={s.fullName} src={s.profilePhoto} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {s.fullName}
                        </p>
                        <p className="text-xs text-surface-400 truncate">{s.email}</p>
                      </div>
                      <Badge variant={s.isActive ? 'success' : 'danger'} dot size="sm">
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Faculty Members */}
        <div>
          <SectionHeader title="Faculty Members" linkTo="/admin/teachers" linkLabel="View all" />
          <Card className="!p-0 overflow-hidden">
            {loadingTeachers ? (
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <Skeleton variant="circle" className="w-9 h-9 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-surface-400">
                <GraduationCap className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No faculty members yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-100 dark:divide-surface-700">
                {teachers.slice(0, 5).map((t) => (
                  <li key={t._id}>
                    <Link
                      to={`/admin/teachers/${t._id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Avatar name={t.fullName} src={t.profilePhoto} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {t.fullName}
                        </p>
                        <p className="text-xs text-surface-400 truncate">
                          {t.department && t.department !== 'N/A' ? t.department : t.email}
                        </p>
                      </div>
                      <Badge variant={t.isActive ? 'success' : 'danger'} dot size="sm">
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Class Overview */}
        <div>
          <SectionHeader title="Class Overview" linkTo="/admin/classes" linkLabel="Manage" />
          <Card className="!p-0 overflow-hidden">
            {loadingClasses ? (
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-5 py-3 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-surface-400">
                <BookOpen className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No classes created yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-100 dark:divide-surface-700">
                {classes.slice(0, 6).map((cls) => (
                  <li key={cls._id}>
                    <Link
                      to={`/admin/classes/${cls._id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {cls.name}
                        </p>
                        <p className="text-xs text-surface-400">{cls.code} · {cls.academicYear}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-surface-300 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Quiz Activity */}
        <div>
          <SectionHeader title="Quiz Activity" linkTo="/admin/quizzes" linkLabel="View all" />
          <Card>
            {loadingQuizzes ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { status: 'published', label: 'Live / Published', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
                  { status: 'draft', label: 'Draft', icon: FileQuestion, color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-400' },
                  { status: 'closed', label: 'Closed', icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-400' },
                  { status: 'archived', label: 'Archived', icon: ArchiveX, color: 'text-surface-400', bar: 'bg-surface-300 dark:bg-surface-600' },
                ].map(({ status, label, icon: Icon, color, bar }) => {
                  const count = quizByStatus[status] || 0;
                  const total = quizzes.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`flex items-center gap-2 text-sm font-medium ${color}`}>
                          <Icon className="w-4 h-4" />
                          {label}
                        </span>
                        <span className="text-sm font-bold text-surface-900 dark:text-white">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bar} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-surface-400 pt-2 border-t border-surface-100 dark:border-surface-700">
                  {quizzes.length} total quiz{quizzes.length !== 1 ? 'zes' : ''} across all classes
                </p>
              </div>
            )}
          </Card>

          {/* Quick links */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Students', to: '/admin/students', icon: Users, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' },
              { label: 'Teachers', to: '/admin/teachers', icon: GraduationCap, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50' },
              { label: 'Classes', to: '/admin/classes', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
              { label: 'Quizzes', to: '/admin/quizzes', icon: ClipboardList, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' },
            ].map(({ label, to, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:brightness-95 ${color}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
