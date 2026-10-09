import api from '../../../config/api';

const tuitionApi = {
  // ─── Admin Overview ──────────────────────────────────────────
  getAdminOverview: async () => {
    const res = await api.get('/tuitions/admin/overview');
    return res.data?.data || res.data;
  },

  // ─── Courses ─────────────────────────────────────────────────
  getCourses: async (params) => {
    const res = await api.get('/tuitions/courses', { params });
    return res.data?.data || res.data;
  },

  getCourseById: async (id) => {
    const res = await api.get(`/tuitions/courses/${id}`);
    return res.data?.data || res.data;
  },

  createCourse: async (data) => {
    const res = await api.post('/tuitions/courses', data);
    return res.data?.data || res.data;
  },

  updateCourse: async (id, data) => {
    const res = await api.put(`/tuitions/courses/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteCourse: async (id) => {
    const res = await api.delete(`/tuitions/courses/${id}`);
    return res.data?.data || res.data;
  },

  // ─── Sections ────────────────────────────────────────────────
  getSections: async (courseId) => {
    const res = await api.get(`/tuitions/courses/${courseId}/sections`);
    return res.data?.data || res.data;
  },

  createSection: async (courseId, data) => {
    const res = await api.post(`/tuitions/courses/${courseId}/sections`, data);
    return res.data?.data || res.data;
  },

  updateSection: async (sectionId, data) => {
    const res = await api.put(`/tuitions/sections/${sectionId}`, data);
    return res.data?.data || res.data;
  },

  deleteSection: async (sectionId) => {
    const res = await api.delete(`/tuitions/sections/${sectionId}`);
    return res.data?.data || res.data;
  },

  // ─── Lectures ────────────────────────────────────────────────
  getLectures: async (courseId, params) => {
    const res = await api.get(`/tuitions/courses/${courseId}/lectures`, { params });
    return res.data?.data || res.data;
  },

  getLectureById: async (lectureId) => {
    const res = await api.get(`/tuitions/lectures/${lectureId}`);
    return res.data?.data || res.data;
  },

  createLecture: async (courseId, sectionId, data) => {
    const res = await api.post(`/tuitions/courses/${courseId}/sections/${sectionId}/lectures`, data);
    return res.data?.data || res.data;
  },

  updateLecture: async (lectureId, data) => {
    const res = await api.put(`/tuitions/lectures/${lectureId}`, data);
    return res.data?.data || res.data;
  },

  deleteLecture: async (lectureId) => {
    const res = await api.delete(`/tuitions/lectures/${lectureId}`);
    return res.data?.data || res.data;
  },

  // ─── Enrollments ─────────────────────────────────────────────
  enrollStudent: async (courseId, data) => {
    const res = await api.post(`/tuitions/courses/${courseId}/enroll`, data);
    return res.data?.data || res.data;
  },

  getCourseEnrollments: async (courseId, params) => {
    const res = await api.get(`/tuitions/courses/${courseId}/enrollments`, { params });
    return res.data?.data || res.data;
  },

  updateEnrollmentStatus: async (enrollmentId, status) => {
    const res = await api.patch(`/tuitions/enrollments/${enrollmentId}/status`, { status });
    return res.data?.data || res.data;
  },

  // ─── Student Learning ────────────────────────────────────────
  getMyEnrollments: async () => {
    const res = await api.get('/tuitions/my/enrollments');
    return res.data?.data || res.data;
  },

  getCourseCurriculum: async (courseId) => {
    const res = await api.get(`/tuitions/my/courses/${courseId}/curriculum`);
    return res.data?.data || res.data;
  },

  getStudentLecture: async (lectureId) => {
    const res = await api.get(`/tuitions/my/lectures/${lectureId}`);
    return res.data?.data || res.data;
  },

  updateVideoProgress: async (lectureId, data) => {
    const res = await api.post(`/tuitions/my/lectures/${lectureId}/progress`, data);
    return res.data?.data || res.data;
  },

  submitLectureQuiz: async (lectureId, data) => {
    const res = await api.post(`/tuitions/my/lectures/${lectureId}/quiz`, data);
    return res.data?.data || res.data;
  },

  // ─── Teacher Analytics ───────────────────────────────────────
  getTeacherAnalytics: async (courseId) => {
    const res = await api.get(`/tuitions/courses/${courseId}/analytics`);
    return res.data?.data || res.data;
  },
};

export default tuitionApi;
