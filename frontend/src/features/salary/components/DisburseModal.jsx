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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#EFE5E0] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Disburse Salary</h2>
              <p className="text-xs text-[#6B7280]">{slip.teacher?.fullName} · {slip.slipNumber}</p>
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

        <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#EFE5E0] flex justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Net Salary</p>
            <p className="text-xl font-extrabold text-emerald-700">PKR {(slip.netSalary || 0).toLocaleString()}</p>
          </div>
          {slip.bankName && (
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Bank Account</p>
              <p className="text-sm font-semibold text-[#111827]">{slip.bankName}</p>
              <p className="text-xs text-[#6B7280] font-mono">{slip.iban || slip.accountNumber}</p>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setApiError(''); mutation.mutate(form); }}
          className="p-5 space-y-4"
        >
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{apiError}</div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">Payment Method <span className="text-rose-500">*</span></label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">Reference / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. TXN-123456789"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] resize-none"
            />
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {mutation.isPending ? 'Disbursing…' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisburseModal;
