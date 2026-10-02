import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CreditCard } from 'lucide-react';
import salaryApi from '../api/salaryApi';

const DisburseModal = ({ slip, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    paymentMethod: slip?.bankName ? 'bank_transfer' : 'cash',
    paymentReference: '',
    remarks: '',
  });
  const [apiError, setApiError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => salaryApi.disburseSlip(slip._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salarySlips'] });
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => setApiError(err?.response?.data?.message || 'Disbursement failed.'),
  });

  if (!slip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Disburse Salary</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">{slip.teacher?.fullName} · {slip.slipNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 bg-surface-50 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700 flex justify-between">
          <div>
            <p className="text-xs text-surface-500 dark:text-surface-400">Net Salary</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">PKR {(slip.netSalary || 0).toLocaleString()}</p>
          </div>
          {slip.bankName && (
            <div className="text-right">
              <p className="text-xs text-surface-500 dark:text-surface-400">Bank Account</p>
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{slip.bankName}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400 font-mono">{slip.iban || slip.accountNumber}</p>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setApiError(''); mutation.mutate(form); }}
          className="p-5 space-y-4"
        >
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-sm">{apiError}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Payment Method <span className="text-rose-500">*</span></label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Reference / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. TXN-123456789"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60">
              {mutation.isPending ? 'Disbursing…' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisburseModal;
