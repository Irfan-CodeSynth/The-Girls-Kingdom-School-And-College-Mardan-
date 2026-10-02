import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Zap } from 'lucide-react';
import salaryApi from '../api/salaryApi';

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const GeneratePayrollModal = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    year: String(CURRENT_YEAR),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
  });
  const [apiError, setApiError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => salaryApi.generatePayroll(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['salarySlips'] });
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] });
      if (onSuccess) onSuccess(result);
      onClose();
    },
    onError: (err) => setApiError(err?.response?.data?.message || 'Generation failed.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    mutation.mutate({ billingMonth: `${form.year}-${form.month}` });
  };

  const monthName = MONTH_NAMES[parseInt(form.month, 10) - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Generate Monthly Payroll</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Create salary slips for all active faculty</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={m}>{MONTH_NAMES[i]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Year</label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-sm text-primary-800 dark:text-primary-300">
            This will generate salary slips for <strong>{monthName} {form.year}</strong> for all faculty members with an active salary structure. Already-existing slips will be skipped.
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60">
              {mutation.isPending ? 'Generating…' : 'Generate Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePayrollModal;
