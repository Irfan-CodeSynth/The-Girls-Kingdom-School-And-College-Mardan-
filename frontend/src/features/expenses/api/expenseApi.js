import api from '../../../config/api';

const BASE = '/expenses';

const expenseApi = {
  // CRUD
  createExpense: (data) => api.post(BASE, data).then((r) => r.data.data),
  getExpenses: (params) => api.get(BASE, { params }).then((r) => r.data.data),
  getExpenseById: (id) => api.get(`${BASE}/${id}`).then((r) => r.data.data),
  updateExpense: (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data.data),
  cancelExpense: (id) => api.patch(`${BASE}/${id}/cancel`).then((r) => r.data.data),

  // Analytics
  getSummary: (params) => api.get(`${BASE}/summary`, { params }).then((r) => r.data.data),
  getFinancialOverview: (params) =>
    api.get(`${BASE}/financial-overview`, { params }).then((r) => r.data.data),
};

export default expenseApi;
