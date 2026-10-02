import api from '../../../config/api';

export const studentApi = {
  getStudents: async (params) => {
    const res = await api.get('/students', { params });
    return res.data?.data || res.data;
  },

  getStudentById: async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data?.data || res.data;
  },

  updateStudent: async (id, data) => {
    const res = await api.patch(`/students/${id}`, data);
    return res.data?.data || res.data;
  },

  createStudent: async (data) => {
    const res = await api.post('/students', data);
    return res.data?.data || res.data;
  },

  resetPassword: async (id, newPassword) => {
    const res = await api.post(`/students/${id}/reset-password`, { newPassword });
    return res.data?.data || res.data;
  },
};

export default studentApi;
