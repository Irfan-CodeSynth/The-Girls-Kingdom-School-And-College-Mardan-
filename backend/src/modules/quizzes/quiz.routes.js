const express = require('express');
const router = express.Router();
const quizController = require('./quiz.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const {
  createQuizSchema,
  updateQuizSchema,
  setQuestionsSchema,
  publishQuizSchema,
  saveProgressSchema,
  submitAttemptSchema,
  gradeAnswerSchema
} = require('./quiz.validator');

// All quiz routes require authentication
router.use(protect);

// ─── Quiz CRUD (Teacher + Admin) ──────────────────────────────

// List quizzes — each role sees appropriate subset
router.get('/', quizController.getQuizzes);

// Student: get all their grades & transcripts across all quizzes
router.get(
  '/my-grades',
  authorize(ROLES.STUDENT),
  quizController.getMyGrades
);

// Get single quiz
router.get('/:id', quizController.getQuizById);

// Create quiz (teacher/admin only)
router.post(
  '/',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(createQuizSchema),
  quizController.createQuiz
);

// Update quiz metadata
router.patch(
  '/:id',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(updateQuizSchema),
  quizController.updateQuiz
);

// Set / replace all questions
router.put(
  '/:id/questions',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(setQuestionsSchema),
  quizController.setQuestions
);

// Lifecycle transitions
router.post(
  '/:id/publish',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(publishQuizSchema),
  quizController.publishQuiz
);

router.post(
  '/:id/close',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(publishQuizSchema), // same id-only param shape
  quizController.closeQuiz
);

router.post(
  '/:id/archive',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(publishQuizSchema),
  quizController.archiveQuiz
);

// Delete quiz (draft/archived only)
router.delete(
  '/:id',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  quizController.deleteQuiz
);

// ─── View all attempts for a quiz (teacher/admin) ──────────────
router.get(
  '/:id/attempts',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  quizController.getQuizAttempts
);

// ─── Student attempt flow ──────────────────────────────────────

// Start or resume an attempt
router.post(
  '/:id/start',
  authorize(ROLES.STUDENT),
  quizController.startAttempt
);

// View student's own attempts for a quiz
router.get(
  '/:id/my-attempts',
  authorize(ROLES.STUDENT),
  quizController.getMyAttempts
);

// Save progress (auto-save)
router.patch(
  '/attempts/:attemptId/save',
  authorize(ROLES.STUDENT),
  validate(saveProgressSchema),
  quizController.saveProgress
);

// Final submission
router.post(
  '/attempts/:attemptId/submit',
  authorize(ROLES.STUDENT),
  validate(submitAttemptSchema),
  quizController.submitAttempt
);

// ─── Get single attempt (teacher or owning student) ────────────
router.get(
  '/attempts/:attemptId',
  quizController.getAttemptById
);

// ─── Teacher grades a comprehensive answer ─────────────────────
router.patch(
  '/attempts/:attemptId/grade/:questionId',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(gradeAnswerSchema),
  quizController.gradeAnswer
);

module.exports = router;
