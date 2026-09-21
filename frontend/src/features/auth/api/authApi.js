import api from '../../../config/api';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  registerStudent: async (data) => {
    const res = await api.post('/auth/register/student', data);
    return res.data;
  },

  registerTeacher: async (data) => {
    const res = await api.post('/auth/register/teacher', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.patch('/auth/change-password', data);
    return res.data;
  },
};

export default authApi;
