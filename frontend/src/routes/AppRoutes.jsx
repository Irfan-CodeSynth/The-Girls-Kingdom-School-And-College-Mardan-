import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../config/constants';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import QuizLayout from '../components/layout/QuizLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import StudentRegisterPage from '../features/auth/pages/StudentRegisterPage';
import TeacherRegisterPage from '../features/auth/pages/TeacherRegisterPage';

// System Pages
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import PlaceholderPage from '../pages/PlaceholderPage';

// Stage 4 — Dashboard Pages
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import TeacherDashboardPage from '../features/teachers/pages/TeacherDashboardPage';
import StudentDashboardPage from '../features/students/pages/StudentDashboardPage';

// Admin — Students
import StudentsListPage from '../features/students/pages/StudentsListPage';
import StudentDetailPage from '../features/students/pages/StudentDetailPage';

// Admin — Teachers
import TeachersListPage from '../features/teachers/pages/TeachersListPage';
import TeacherDetailPage from '../features/teachers/pages/TeacherDetailPage';

// Admin — Classes
import ClassesListPage from '../features/classes/pages/ClassesListPage';
import ClassDetailPage from '../features/classes/pages/ClassDetailPage';

// Admin — Quizzes
import AdminQuizzesPage from '../features/quizzes/pages/AdminQuizzesPage';

// Teacher Role Pages
import TeacherClassesPage from '../features/teachers/pages/TeacherClassesPage';
import TeacherClassDetailPage from '../features/teachers/pages/TeacherClassDetailPage';
import TeacherQuizListPage from '../features/quizzes/pages/TeacherQuizListPage';
import TeacherQuizBuilderPage from '../features/quizzes/pages/TeacherQuizBuilderPage';
import TeacherQuizAttemptsPage from '../features/quizzes/pages/TeacherQuizAttemptsPage';
import TeacherGradingPage from '../features/quizzes/pages/TeacherGradingPage';
import TeacherGradingQueuePage from '../features/quizzes/pages/TeacherGradingQueuePage';

// Student Role Pages
import StudentClassPage from '../features/students/pages/StudentClassPage';
import QuizListPage from '../features/quizzes/pages/QuizListPage';
import AttemptResultPage from '../features/quizzes/pages/AttemptResultPage';
import QuizPreviewPage from '../features/quizzes/pages/QuizPreviewPage';
import QuizTakePage from '../features/quizzes/pages/QuizTakePage';
import GradesTranscriptPage from '../features/quizzes/pages/GradesTranscriptPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';

// Dynamic dashboard redirect component
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (user.role === ROLES.TEACHER) return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<StudentRegisterPage />} />
      <Route path="/register/teacher" element={<TeacherRegisterPage />} />

      {/* Status Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Main App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Routes wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          {/* ─── Admin Routes ─── */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboardPage />}
            />

            {/* Student Management */}
            <Route path="/admin/students" element={<StudentsListPage />} />
            <Route path="/admin/students/:id" element={<StudentDetailPage />} />

            {/* Teacher Management */}
            <Route path="/admin/teachers" element={<TeachersListPage />} />
            <Route path="/admin/teachers/:id" element={<TeacherDetailPage />} />

            {/* Class Management */}
            <Route path="/admin/classes" element={<ClassesListPage />} />
            <Route path="/admin/classes/:id" element={<ClassDetailPage />} />

            {/* Quiz Governance */}
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
          </Route>

          {/* ─── Teacher Routes ─── */}
          <Route element={<RoleRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route
              path="/teacher/dashboard"
              element={<TeacherDashboardPage />}
            />

            {/* Class pages */}
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/classes/:id" element={<TeacherClassDetailPage />} />

            {/* Quiz pages */}
            <Route path="/teacher/quizzes" element={<TeacherQuizListPage />} />
            <Route path="/teacher/quizzes/new" element={<TeacherQuizBuilderPage />} />
            <Route path="/teacher/quizzes/:id/edit" element={<TeacherQuizBuilderPage />} />
            <Route path="/teacher/quizzes/:id/attempts" element={<TeacherQuizAttemptsPage />} />
            <Route path="/teacher/quizzes/:quizId/grade/:attemptId" element={<TeacherGradingPage />} />
            <Route path="/teacher/grading" element={<TeacherGradingQueuePage />} />
          </Route>

          {/* ─── Student Routes ─── */}
          <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route
              path="/student/dashboard"
              element={<StudentDashboardPage />}
            />
            <Route path="/student/classes" element={<StudentClassPage />} />

            {/* Quiz pages (list + preview + result — inside AppLayout) */}
            <Route path="/student/quizzes" element={<QuizListPage />} />
            <Route path="/student/quizzes/:id" element={<QuizPreviewPage />} />
            <Route path="/student/quizzes/:id/result/:attemptId" element={<AttemptResultPage />} />

            {/* Notifications */}
            <Route
              path="/student/notifications"
              element={<NotificationsPage />}
            />
            <Route
              path="/student/results"
              element={<GradesTranscriptPage />}
            />
          </Route>
        </Route>

        {/* ─── Distraction-Free Quiz Taking (QuizLayout) ─── */}
        <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
          <Route element={<QuizLayout />}>
            <Route path="/student/quizzes/:id/take" element={<QuizTakePage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
