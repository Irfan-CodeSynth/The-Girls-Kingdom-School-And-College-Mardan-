import api from '../../../config/api';

const quizApi = {
  // ─── Quiz CRUD ────────────────────────────────────────────
  getQuizzes: async (params) => {
    const res = await api.get('/quizzes', { params });
    return res.data?.data || res.data;
  },

  getQuizById: async (id) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data?.data || res.data;
  },

  createQuiz: async (data) => {
    const res = await api.post('/quizzes', data);
    return res.data?.data || res.data;
  },

  updateQuiz: async (id, data) => {
    const res = await api.patch(`/quizzes/${id}`, data);
    return res.data?.data || res.data;
  },

  setQuestions: async (id, questions) => {
    const res = await api.put(`/quizzes/${id}/questions`, { questions });
    return res.data?.data || res.data;
  },

  publishQuiz: async (id) => {
    const res = await api.post(`/quizzes/${id}/publish`);
    return res.data?.data || res.data;
  },

  closeQuiz: async (id) => {
    const res = await api.post(`/quizzes/${id}/close`);
    return res.data?.data || res.data;
  },

  archiveQuiz: async (id) => {
    const res = await api.post(`/quizzes/${id}/archive`);
    return res.data?.data || res.data;
  },

  deleteQuiz: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data?.data || res.data;
  },

  // ─── Attempts (Teacher/Admin) ─────────────────────────────
  getQuizAttempts: async (quizId) => {
    const res = await api.get(`/quizzes/${quizId}/attempts`);
    return res.data?.data || res.data;
  },

  getAttemptById: async (attemptId) => {
    const res = await api.get(`/quizzes/attempts/${attemptId}`);
    return res.data?.data || res.data;
  },

  gradeAnswer: async (attemptId, questionId, data) => {
    const res = await api.patch(`/quizzes/attempts/${attemptId}/grade/${questionId}`, data);
    return res.data?.data || res.data;
  },

  // ─── Student Attempt Flow ─────────────────────────────────
  startAttempt: async (quizId) => {
    const res = await api.post(`/quizzes/${quizId}/start`);
    return res.data?.data || res.data;
  },

  getMyAttempts: async (quizId) => {
    const res = await api.get(`/quizzes/${quizId}/my-attempts`);
    return res.data?.data || res.data;
  },

  saveProgress: async (attemptId, answers) => {
    const res = await api.patch(`/quizzes/attempts/${attemptId}/save`, { answers });
    return res.data?.data || res.data;
  },

  submitAttempt: async (attemptId, answers) => {
    const res = await api.post(`/quizzes/attempts/${attemptId}/submit`, { answers });
    return res.data?.data || res.data;
  },

  // ─── Grades & Transcripts (Student) ──────────────────────────
  getMyGrades: async () => {
    const res = await api.get('/quizzes/my-grades');
    return res.data?.data || res.data;
  },
};

export default quizApi;
