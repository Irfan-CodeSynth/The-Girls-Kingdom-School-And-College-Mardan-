const quizService = require('./quiz.service');
const ApiResponse = require('../../utils/ApiResponse');

// ─── Quiz CRUD ────────────────────────────────────────────────

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.body, req.user.id, req.user.role);
    return ApiResponse.created(res, { quiz }, 'Quiz created successfully');
  } catch (err) { next(err); }
};

const getQuizzes = async (req, res, next) => {
  try {
    const result = await quizService.getQuizzes(req.query, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quizzes retrieved successfully');
  } catch (err) { next(err); }
};

const getQuizById = async (req, res, next) => {
  try {
    const result = await quizService.getQuizById(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz retrieved successfully');
  } catch (err) { next(err); }
};

const updateQuiz = async (req, res, next) => {
  try {
    const result = await quizService.updateQuiz(req.params.id, req.body, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz updated successfully');
  } catch (err) { next(err); }
};

const setQuestions = async (req, res, next) => {
  try {
    const result = await quizService.setQuestions(req.params.id, req.body.questions, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Questions saved successfully');
  } catch (err) { next(err); }
};

const publishQuiz = async (req, res, next) => {
  try {
    const result = await quizService.publishQuiz(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz published successfully');
  } catch (err) { next(err); }
};

const unpublishQuiz = async (req, res, next) => {
  try {
    const result = await quizService.unpublishQuiz(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz reverted to draft');
  } catch (err) { next(err); }
};

const closeQuiz = async (req, res, next) => {
  try {
    const result = await quizService.closeQuiz(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz closed successfully');
  } catch (err) { next(err); }
};

const archiveQuiz = async (req, res, next) => {
  try {
    const result = await quizService.archiveQuiz(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz archived successfully');
  } catch (err) { next(err); }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const result = await quizService.deleteQuiz(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Quiz deleted successfully');
  } catch (err) { next(err); }
};

// ─── Attempt Flow ─────────────────────────────────────────────

const startAttempt = async (req, res, next) => {
  try {
    const result = await quizService.startAttempt(req.params.id, req.user.id);
    return ApiResponse.created(res, result, result.resumed ? 'Attempt resumed' : 'Attempt started');
  } catch (err) { next(err); }
};

const saveProgress = async (req, res, next) => {
  try {
    const result = await quizService.saveProgress(req.params.attemptId, req.user.id, req.body.answers);
    return ApiResponse.success(res, result, 'Progress saved');
  } catch (err) { next(err); }
};

const submitAttempt = async (req, res, next) => {
  try {
    const result = await quizService.submitAttempt(req.params.attemptId, req.user.id, req.body.answers);
    return ApiResponse.success(res, result, 'Quiz submitted successfully');
  } catch (err) { next(err); }
};

// ─── Grading ─────────────────────────────────────────────────

const gradeAnswer = async (req, res, next) => {
  try {
    const { attemptId, questionId } = req.params;
    const { teacherMarks, teacherFeedback } = req.body;
    const result = await quizService.gradeAnswer(attemptId, questionId, teacherMarks, teacherFeedback, req.user.id);
    return ApiResponse.success(res, result, 'Answer graded successfully');
  } catch (err) { next(err); }
};

// ─── Attempt Queries ──────────────────────────────────────────

const getQuizAttempts = async (req, res, next) => {
  try {
    const result = await quizService.getQuizAttempts(req.params.id, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Attempts retrieved successfully');
  } catch (err) { next(err); }
};

const getMyAttempts = async (req, res, next) => {
  try {
    const result = await quizService.getMyAttempts(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Your attempts retrieved successfully');
  } catch (err) { next(err); }
};

const getAttemptById = async (req, res, next) => {
  try {
    const result = await quizService.getAttemptById(req.params.attemptId, req.user.id, req.user.role);
    return ApiResponse.success(res, result, 'Attempt retrieved successfully');
  } catch (err) { next(err); }
};

// ─── Grades & Transcripts ─────────────────────────────────────

const getMyGrades = async (req, res, next) => {
  try {
    const result = await quizService.getMyGrades(req.user.id);
    return ApiResponse.success(res, result, 'Grades retrieved successfully');
  } catch (err) { next(err); }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  setQuestions,
  publishQuiz,
  unpublishQuiz,
  closeQuiz,
  archiveQuiz,
  deleteQuiz,
  startAttempt,
  saveProgress,
  submitAttempt,
  gradeAnswer,
  getQuizAttempts,
  getMyAttempts,
  getAttemptById,
  getMyGrades
};
