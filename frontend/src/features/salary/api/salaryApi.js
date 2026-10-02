import api from '../../../config/api';

const salaryApi = {
  // ─── Salary Structures ───────────────────────────────────────
  upsertSalaryStructure: async (data) => {
    const res = await api.post('/salary/structures', data);
    return res.data?.data || res.data;
  },
  getSalaryStructures: async (params) => {
    const res = await api.get('/salary/structures', { params });
    return res.data?.data || res.data;
  },
  getSalaryStructureByTeacher: async (teacherId) => {
    const res = await api.get(`/salary/structures/teacher/${teacherId}`);
    return res.data?.data || res.data;
  },
  getMySalaryStructure: async () => {
    const res = await api.get('/salary/my-structure');
    return res.data?.data || res.data;
  },
  deleteSalaryStructure: async (id) => {
    const res = await api.delete(`/salary/structures/${id}`);
    return res.data?.data || res.data;
  },

  // ─── Payroll Slips ──────────────────────────────────────────
  generatePayroll: async (data) => {
    const res = await api.post('/salary/generate', data);
    return res.data?.data || res.data;
  },
  getSlips: async (params) => {
    const res = await api.get('/salary/slips', { params });
    return res.data?.data || res.data;
  },
  getSlipById: async (id) => {
    const res = await api.get(`/salary/slips/${id}`);
    return res.data?.data || res.data;
  },
  getMySlips: async () => {
    const res = await api.get('/salary/my-slips');
    return res.data?.data || res.data;
  },
  adjustSlip: async (id, data) => {
    const res = await api.patch(`/salary/slips/${id}/adjust`, data);
    return res.data?.data || res.data;
  },
  approveSlip: async (id) => {
    const res = await api.post(`/salary/slips/${id}/approve`);
    return res.data?.data || res.data;
  },
  disburseSlip: async (id, data) => {
    const res = await api.post(`/salary/slips/${id}/disburse`, data);
    return res.data?.data || res.data;
  },
  bulkDisburse: async (data) => {
    const res = await api.post('/salary/bulk-disburse', data);
    return res.data?.data || res.data;
  },
  cancelSlip: async (id) => {
    const res = await api.post(`/salary/slips/${id}/cancel`);
    return res.data?.data || res.data;
  },

  // ─── Analytics ──────────────────────────────────────────────
  getPayrollSummary: async (params) => {
    const res = await api.get('/salary/summary', { params });
    return res.data?.data || res.data;
  },
  getBankSheet: async (billingMonth) => {
    const res = await api.get('/salary/bank-sheet', { params: { billingMonth } });
    return res.data?.data || res.data;
  },
};

export default salaryApi;
