import api from '../../../config/api';

const parentApi = {
  // ─── Children List ───────────────────────────────────────────
  getChildren: async () => {
    const res = await api.get('/parent/children');
    return res.data?.data?.children || res.data?.children || [];
  },

  // ─── Child Academic Summary ──────────────────────────────────
  getChildSummary: async (studentId) => {
    const res = await api.get(`/parent/children/${studentId}/summary`);
    return res.data?.data || res.data;
  },

  // ─── Child Attendance Audit ──────────────────────────────────
  getChildAttendance: async (studentId, params) => {
    const res = await api.get(`/parent/children/${studentId}/attendance`, { params });
    return res.data?.data || res.data;
  },

  // ─── Child Fee Challans & Ledger ─────────────────────────────
  getChildFees: async (studentId) => {
    const res = await api.get(`/parent/children/${studentId}/fees`);
    return res.data?.data || res.data;
  },

  // ─── Child Quizzes & Scores ──────────────────────────────────
  getChildQuizzes: async (studentId) => {
    const res = await api.get(`/parent/children/${studentId}/quizzes`);
    return res.data?.data || res.data;
  },

  // ─── Child Exam Schedules & Date Sheets ──────────────────────
  getChildExams: async (studentId) => {
    const res = await api.get(`/parent/children/${studentId}/exams`);
    return res.data?.data || res.data;
  },

  // ─── Child Online Tuitions Progress ──────────────────────────
  getChildTuitions: async (studentId) => {
    const res = await api.get(`/parent/children/${studentId}/tuitions`);
    return res.data?.data || res.data;
  },
};

export default parentApi;
