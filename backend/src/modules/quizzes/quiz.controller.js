const quizService = require('./quiz.service');
const ApiResponse = require('../../utils/ApiResponse');

// ─── Quiz CRUD ────────────────────────────────────────────────

const createQuiz = async (req, res) => {
  const quiz = await quizService.createQuiz(req.body, req.user.id, req.user.role);
  return ApiResponse.created(res, { quiz }, 'Quiz created successfully');
};

const getQuizzes = async (req, res) => {
  const result = await quizService.getQuizzes(req.query, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quizzes retrieved successfully');
};

const getQuizById = async (req, res) => {
  const result = await quizService.getQuizById(req.params.id, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quiz retrieved successfully');
};

const updateQuiz = async (req, res) => {
  const result = await quizService.updateQuiz(req.params.id, req.body, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quiz updated successfully');
};

const setQuestions = async (req, res) => {
  const result = await quizService.setQuestions(req.params.id, req.body.questions, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Questions saved successfully');
};

const publishQuiz = async (req, res) => {
  const result = await quizService.publishQuiz(req.params.id, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quiz published successfully');
};

const closeQuiz = async (req, res) => {
  const result = await quizService.closeQuiz(req.params.id, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quiz closed successfully');
};

const archiveQuiz = async (req, res) => {
  const result = await quizService.archiveQuiz(req.params.id, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quiz archived successfully');
};

const deleteQuiz = async (req, res) => {
  const result = await quizService.deleteQuiz(req.params.id, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Quiz deleted successfully');
};

// ─── Attempt Flow ─────────────────────────────────────────────

const startAttempt = async (req, res) => {
  const result = await quizService.startAttempt(req.params.id, req.user.id);
  return ApiResponse.created(res, result, result.resumed ? 'Attempt resumed' : 'Attempt started');
};

const saveProgress = async (req, res) => {
  const result = await quizService.saveProgress(req.params.attemptId, req.user.id, req.body.answers);
  return ApiResponse.success(res, result, 'Progress saved');
};

const submitAttempt = async (req, res) => {
  const result = await quizService.submitAttempt(req.params.attemptId, req.user.id, req.body.answers);
  return ApiResponse.success(res, result, 'Quiz submitted successfully');
};

// ─── Grading ─────────────────────────────────────────────────

const gradeAnswer = async (req, res) => {
  const { attemptId, questionId } = req.params;
  const { teacherMarks, teacherFeedback } = req.body;
  const result = await quizService.gradeAnswer(attemptId, questionId, teacherMarks, teacherFeedback, req.user.id);
  return ApiResponse.success(res, result, 'Answer graded successfully');
};

// ─── Attempt Queries ──────────────────────────────────────────

const getQuizAttempts = async (req, res) => {
  const result = await quizService.getQuizAttempts(req.params.id, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Attempts retrieved successfully');
};

const getMyAttempts = async (req, res) => {
  const result = await quizService.getMyAttempts(req.params.id, req.user.id);
  return ApiResponse.success(res, result, 'Your attempts retrieved successfully');
};

const getAttemptById = async (req, res) => {
  const result = await quizService.getAttemptById(req.params.attemptId, req.user.id, req.user.role);
  return ApiResponse.success(res, result, 'Attempt retrieved successfully');
};

// ─── Grades & Transcripts ─────────────────────────────────────

const getMyGrades = async (req, res) => {
  const result = await quizService.getMyGrades(req.user.id);
  return ApiResponse.success(res, result, 'Grades retrieved successfully');
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  setQuestions,
  publishQuiz,
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
