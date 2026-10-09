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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#EFE5E0] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Generate Monthly Payroll</h2>
              <p className="text-xs text-[#6B7280]">Create salary slips for all active faculty</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={m}>{MONTH_NAMES[i]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">Year</label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              >
                {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] text-sm text-[#4B5563]">
            This will generate salary slips for <strong className="text-[#111827]">{monthName} {form.year}</strong> for all faculty members with an active salary structure. Already-existing slips will be skipped.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#EFE5E0] text-[#4B5563] text-sm font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {mutation.isPending ? 'Generating…' : 'Generate Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePayrollModal;
