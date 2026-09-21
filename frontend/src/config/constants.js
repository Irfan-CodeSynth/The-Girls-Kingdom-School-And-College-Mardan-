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
    { name: 'Quizzes', path: '/admin/quizzes', icon: 'FileQuestion' },
  ],
  [ROLES.TEACHER]: [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { name: 'My Classes', path: '/teacher/classes', icon: 'BookOpen' },
    { name: 'Quizzes', path: '/teacher/quizzes', icon: 'FileQuestion' },
    { name: 'Grading', path: '/teacher/grading', icon: 'CheckCircle' },
  ],
  [ROLES.STUDENT]: [
    { name: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { name: 'My Class', path: '/student/classes', icon: 'BookOpen' },
    { name: 'Quizzes', path: '/student/quizzes', icon: 'FileQuestion' },
    { name: 'Results', path: '/student/results', icon: 'Award' },
    { name: 'Notifications', path: '/student/notifications', icon: 'Bell' },
  ],
};
