import api from '../../../config/api';

const feeApi = {
  // ─── Fee Structures ──────────────────────────────────────────
  upsertFeeStructure: async (data) => {
    const res = await api.post('/fees/structures', data);
    return res.data?.data || res.data;
  },

  getFeeStructures: async (params) => {
    const res = await api.get('/fees/structures', { params });
    return res.data?.data || res.data;
  },

  getFeeStructureByClass: async (classId, academicYear) => {
    const res = await api.get(`/fees/structures/class/${classId}`, {
      params: { academicYear },
    });
    return res.data?.data || res.data;
  },

  getFeeStructureById: async (id) => {
    const res = await api.get(`/fees/structures/${id}`);
    return res.data?.data || res.data;
  },

  deleteFeeStructure: async (id) => {
    const res = await api.delete(`/fees/structures/${id}`);
    return res.data?.data || res.data;
  },

  // ─── Challans ────────────────────────────────────────────────
  generateChallans: async (data) => {
    const res = await api.post('/fees/challans/generate', data);
    return res.data?.data || res.data;
  },

  getChallans: async (params) => {
    const res = await api.get('/fees/challans', { params });
    return res.data?.data || res.data;
  },

  getChallanById: async (id) => {
    const res = await api.get(`/fees/challans/${id}`);
    return res.data?.data || res.data;
  },

  getMyChallans: async () => {
    const res = await api.get('/fees/challans/my');
    return res.data?.data || res.data;
  },

  recordPayment: async (challanId, data) => {
    const res = await api.post(`/fees/challans/${challanId}/pay`, data);
    return res.data?.data || res.data;
  },

  cancelChallan: async (challanId) => {
    const res = await api.post(`/fees/challans/${challanId}/cancel`);
    return res.data?.data || res.data;
  },

  // ─── Summary ─────────────────────────────────────────────────
  getFeeSummary: async (params) => {
    const res = await api.get('/fees/summary', { params });
    return res.data?.data || res.data;
  },
};

export default feeApi;
