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
};

export default teacherApi;
