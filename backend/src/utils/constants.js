module.exports = {
  ROLES: { ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' },
  QUIZ_STATUS: { DRAFT: 'draft', PUBLISHED: 'published', CLOSED: 'closed', ARCHIVED: 'archived' },
  ATTEMPT_STATUS: { IN_PROGRESS: 'in_progress', SUBMITTED: 'submitted', PENDING_REVIEW: 'pending_review', GRADED: 'graded', EXPIRED: 'expired' },
  QUESTION_TYPES: { MCQ: 'mcq', TRUE_FALSE: 'true_false', COMPREHENSIVE: 'comprehensive' },
  ENROLLMENT_STATUS: { ACTIVE: 'active', REMOVED: 'removed', TRANSFERRED: 'transferred' },
  CLASS_STATUS: { ACTIVE: 'active', ARCHIVED: 'archived' },
  NOTIFICATION_TYPES: { QUIZ_PUBLISHED: 'quiz_published', QUIZ_DEADLINE: 'quiz_deadline', QUIZ_GRADED: 'quiz_graded', RESULT_AVAILABLE: 'result_available', ENROLLMENT: 'enrollment', GENERAL: 'general' },
  RESULT_VISIBILITY: { IMMEDIATELY: 'submission', AFTER_GRADING: 'manual_grading', HIDDEN: 'hidden' }
};
