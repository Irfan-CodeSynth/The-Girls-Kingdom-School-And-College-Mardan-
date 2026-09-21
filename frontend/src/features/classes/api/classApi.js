import api from '../../../config/api';

export const classApi = {
  getClasses: async (params) => {
    const res = await api.get('/classes', { params });
    return res.data?.data || res.data;
  },

  getClassById: async (id) => {
    const res = await api.get(`/classes/${id}`);
    return res.data?.data || res.data;
  },

  createClass: async (data) => {
    const res = await api.post('/classes', data);
    return res.data?.data || res.data;
  },

  updateClass: async (id, data) => {
    const res = await api.patch(`/classes/${id}`, data);
    return res.data?.data || res.data;
  },

  enrollStudent: async (studentId, classId) => {
    const res = await api.post('/classes/enroll', { studentId, classId });
    return res.data?.data || res.data;
  },

  removeEnrollment: async (enrollmentId) => {
    const res = await api.delete(`/classes/enroll/${enrollmentId}`);
    return res.data?.data || res.data;
  },

  assignTeacher: async (teacherId, classId) => {
    const res = await api.post('/classes/assign-teacher', { teacherId, classId });
    return res.data?.data || res.data;
  },

  removeTeacherAssignment: async (assignmentId) => {
    const res = await api.delete(`/classes/assign-teacher/${assignmentId}`);
    return res.data?.data || res.data;
  },

  getMyTeacherClasses: async () => {
    const res = await api.get('/classes/my-teacher-classes');
    return res.data?.data || res.data;
  },

  getMyStudentClass: async () => {
    const res = await api.get('/classes/my-student-class');
    return res.data?.data || res.data;
  },

  getClassStudents: async (classId) => {
    const res = await api.get(`/classes/${classId}/students`);
    return res.data?.data || res.data;
  },

  getClassTeachers: async (classId) => {
    const res = await api.get(`/classes/${classId}/teachers`);
    return res.data?.data || res.data;
  },
};

export default classApi;
