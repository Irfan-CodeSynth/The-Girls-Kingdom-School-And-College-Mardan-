import api from '../../../config/api';

export const teacherApi = {
  getTeachers: async (params) => {
    const res = await api.get('/teachers', { params });
    return res.data?.data || res.data;
  },

  getTeacherById: async (id) => {
    const res = await api.get(`/teachers/${id}`);
    return res.data?.data || res.data;
  },

  updateTeacher: async (id, data) => {
    const res = await api.patch(`/teachers/${id}`, data);
    return res.data?.data || res.data;
  },

  createTeacher: async (data) => {
    const res = await api.post('/teachers', data);
    return res.data?.data || res.data;
  },

  resetPassword: async (id, newPassword) => {
    const res = await api.post(`/teachers/${id}/reset-password`, { newPassword });
    return res.data?.data || res.data;
  },
};

export default teacherApi;
