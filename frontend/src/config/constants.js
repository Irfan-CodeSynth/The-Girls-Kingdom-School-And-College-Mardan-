export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const QUIZ_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
};

export const ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
};

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
};

export const SIDEBAR_ITEMS = {
  [ROLES.ADMIN]: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { name: 'Students', path: '/admin/students', icon: 'Users' },
    { name: 'Teachers', path: '/admin/teachers', icon: 'GraduationCap' },
    { name: 'Classes', path: '/admin/classes', icon: 'BookOpen' },
    { name: 'Attendance', path: '/admin/attendance', icon: 'CheckCircle' },
    { name: 'Quizzes', path: '/admin/quizzes', icon: 'FileQuestion' },
    { name: 'Timetable & Exams', path: '/admin/schedule', icon: 'Calendar' },
    { name: 'Fee Management', path: '/admin/fees', icon: 'Wallet' },
    { name: 'Staff Payroll', path: '/admin/salary', icon: 'Banknote' },
    { name: 'Expenses & OpEx', path: '/admin/expenses', icon: 'Receipt' },
  ],
  [ROLES.TEACHER]: [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { name: 'My Classes', path: '/teacher/classes', icon: 'BookOpen' },
    { name: 'Attendance', path: '/teacher/attendance', icon: 'CheckCircle' },
    { name: 'Quizzes', path: '/teacher/quizzes', icon: 'FileQuestion' },
    { name: 'Grading', path: '/teacher/grading', icon: 'CheckCircle' },
    { name: 'My Schedule', path: '/teacher/schedule', icon: 'Calendar' },
    { name: 'My Salary', path: '/teacher/salary', icon: 'Banknote' },
  ],
  [ROLES.STUDENT]: [
    { name: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { name: 'My Class', path: '/student/classes', icon: 'BookOpen' },
    { name: 'Attendance', path: '/student/attendance', icon: 'CheckCircle' },
    { name: 'Quizzes', path: '/student/quizzes', icon: 'FileQuestion' },
    { name: 'Results', path: '/student/results', icon: 'Award' },
    { name: 'Class Routine & Exams', path: '/student/schedule', icon: 'Calendar' },
    { name: 'My Fees', path: '/student/fees', icon: 'Wallet' },
    { name: 'Notifications', path: '/student/notifications', icon: 'Bell' },
  ],
};
