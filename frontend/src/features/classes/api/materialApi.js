import api from '../../../config/api';

export const materialApi = {
  getMaterials: async (classId, params) => {
    const res = await api.get(`/classes/${classId}/materials`, { params });
    return res.data?.data || res.data;
  },

  createMaterial: async (classId, data) => {
    const res = await api.post(`/classes/${classId}/materials`, data);
    return res.data?.data || res.data;
  },

  updateMaterial: async (classId, materialId, data) => {
    const res = await api.patch(`/classes/${classId}/materials/${materialId}`, data);
    return res.data?.data || res.data;
  },

  deleteMaterial: async (classId, materialId) => {
    const res = await api.delete(`/classes/${classId}/materials/${materialId}`);
    return res.data?.data || res.data;
  },
};

export default materialApi;
