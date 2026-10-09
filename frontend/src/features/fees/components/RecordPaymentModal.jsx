import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, DollarSign } from 'lucide-react';
import feeApi from '../api/feeApi';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online Payment' },
  { value: 'cheque', label: 'Cheque' },
];

const RecordPaymentModal = ({ challan, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const remaining = (challan?.totalAmount || 0) - (challan?.paidAmount || 0);

  const [form, setForm] = useState({
    amount: remaining,
    paymentMethod: 'cash',
    paymentReference: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => feeApi.recordPayment(challan._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['feeSummary'] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.amount || form.amount <= 0) errs.amount = 'Amount must be positive';
    if (form.amount > remaining) errs.amount = `Cannot exceed remaining balance of PKR ${remaining.toLocaleString()}`;
    if (!form.paymentMethod) errs.paymentMethod = 'Payment method is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutation.mutate({ ...form, amount: Number(form.amount) });
  };

  if (!challan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE5E0] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Record Payment</h2>
              <p className="text-xs text-[#6B7280] font-mono">{challan.challanNumber}</p>
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

        {/* Balance summary */}
        <div className="mx-5 mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Total</p>
            <p className="text-sm font-extrabold text-[#111827]">PKR {(challan.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Paid</p>
            <p className="text-sm font-extrabold text-emerald-700">PKR {(challan.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Remaining</p>
            <p className="text-sm font-extrabold text-rose-700">PKR {remaining.toLocaleString()}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mutation.isError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {mutation.error?.response?.data?.message || 'Payment failed. Please try again.'}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
              Amount (PKR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={remaining}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            />
            {errors.amount && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
              Reference / Receipt No.
            </label>
            <input
              type="text"
              placeholder="e.g. Bank transaction ID"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
              Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes..."
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Recording…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
