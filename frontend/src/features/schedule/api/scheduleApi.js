import api from '../../../config/api';

const scheduleApi = {
  // ── Timetable ─────────────────────────────────────────────────
  upsertTimetable: async (data) => {
    const res = await api.post('/schedule/timetable', data);
    return res.data;
  },

  getTimetableByClass: async (classId) => {
    const res = await api.get(`/schedule/timetable/class/${classId}`);
    return res.data;
  },

  getTeacherSchedule: async () => {
    const res = await api.get('/schedule/timetable/teacher-schedule');
    return res.data;
  },

  getStudentRoutine: async () => {
    const res = await api.get('/schedule/timetable/my-routine');
    return res.data;
  },

  checkConflict: async (params) => {
    const res = await api.get('/schedule/timetable/check-conflict', { params });
    return res.data;
  },

  // ── Exam Datesheets ────────────────────────────────────────────
  createDatesheet: async (data) => {
    const res = await api.post('/schedule/datesheets', data);
    return res.data;
  },

  getDatesheets: async (params) => {
    const res = await api.get('/schedule/datesheets', { params });
    return res.data;
  },

  getDatesheetById: async (id) => {
    const res = await api.get(`/schedule/datesheets/${id}`);
    return res.data;
  },

  updateDatesheet: async (id, data) => {
    const res = await api.put(`/schedule/datesheets/${id}`, data);
    return res.data;
  },

  publishDatesheet: async (id) => {
    const res = await api.patch(`/schedule/datesheets/${id}/publish`);
    return res.data;
  },

  getStudentExams: async () => {
    const res = await api.get('/schedule/datesheets/my-exams');
    return res.data;
  },

  deleteDatesheet: async (id) => {
    const res = await api.delete(`/schedule/datesheets/${id}`);
    return res.data;
  },
};

export default scheduleApi;
