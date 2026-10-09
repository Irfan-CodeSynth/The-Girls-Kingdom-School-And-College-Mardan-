import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Receipt } from 'lucide-react';
import expenseApi from '../api/expenseApi';

const CATEGORIES = [
  { value: 'utilities', label: 'Utilities & Power', icon: '⚡' },
  { value: 'maintenance', label: 'Maintenance & Repairs', icon: '🔧' },
  { value: 'supplies', label: 'Supplies & Stationery', icon: '📦' },
  { value: 'transport', label: 'Transport & Fuel', icon: '🚌' },
  { value: 'campus_rent', label: 'Campus Lease & Rent', icon: '🏫' },
  { value: 'events_sports', label: 'Events & Sports', icon: '🏆' },
  { value: 'lab_library', label: 'Lab & Library', icon: '📚' },
  { value: 'petty_cash', label: 'Petty Cash', icon: '💵' },
  { value: 'other', label: 'Other Expense', icon: '📋' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash Payment' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid & Disbursed' },
  { value: 'pending_approval', label: 'Pending Administrative Approval' },
];

export default function RecordExpenseModal({ expense, onClose, onSuccess }) {
  const isEdit = !!expense;
  const qc = useQueryClient();

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: isEdit
      ? {
          ...expense,
          expenseDate: expense.expenseDate ? expense.expenseDate.slice(0, 10) : today,
        }
      : {
          title: '',
          category: 'utilities',
          amount: '',
          expenseDate: today,
          billingMonth: thisMonth,
          paymentMethod: 'cash',
          paidTo: '',
          billReference: '',
          status: 'paid',
          remarks: '',
        },
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? expenseApi.updateExpense(expense._id, data) : expenseApi.createExpense(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-summary'] });
      qc.invalidateQueries({ queryKey: ['financial-overview'] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ ...data, amount: Number(data.amount) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE5E0] sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-sm rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A0D1A]/10 border border-[#EFE5E0] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-[#5A0D1A]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#111827]">
                {isEdit ? 'Edit Institutional Expense' : 'Record Institutional Expense'}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5 font-sans">
                {isEdit ? 'Update expense details' : 'Log an operational expenditure and issue printable voucher'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2 font-sans">
              Expense Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="relative flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition-all border-[#EFE5E0] bg-[#FAF8F5] hover:border-[#5A0D1A]/30 has-[:checked]:border-[#5A0D1A] has-[:checked]:bg-[#5A0D1A]/5"
                >
                  <input
                    type="radio"
                    value={cat.value}
                    {...register('category', { required: true })}
                    className="sr-only"
                  />
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs font-bold text-[#111827] leading-tight truncate">
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.category && <p className="text-rose-600 text-xs mt-1 font-semibold">Category is required</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
              Expense Title / Description *
            </label>
            <input
              type="text"
              placeholder="e.g. PESCO Electricity Bill - March 2026"
              {...register('title', { required: 'Title is required', minLength: 2 })}
              className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            />
            {errors.title && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.title.message}</p>}
          </div>

          {/* Paid To & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Paid To (Vendor / Payee) *
              </label>
              <input
                type="text"
                placeholder="e.g. PESCO / Al-Madina Book Depot"
                {...register('paidTo', { required: 'Payee name is required' })}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
              {errors.paidTo && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.paidTo.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 45000"
                {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } })}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-bold text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
              {errors.amount && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Payment Method *
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Bill / Cheque Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. Inv #8821 / Chq #4401"
                {...register('billReference')}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Date of Expense *
              </label>
              <input
                type="date"
                {...register('expenseDate', { required: true })}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Billing Month *
              </label>
              <input
                type="month"
                {...register('billingMonth', { required: true })}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5 font-sans">
              Remarks & Accounting Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes or administrative approvals..."
              {...register('remarks')}
              className="w-full bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] resize-none"
            />
          </div>

          {/* Error */}
          {mutation.isError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <p className="text-rose-700 text-xs font-semibold">
                {mutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EFE5E0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#111827] bg-white border border-[#EFE5E0] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-[#5A0D1A] hover:bg-[#420812] rounded-xl transition-colors disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {mutation.isPending
                ? isEdit
                  ? 'Saving…'
                  : 'Recording…'
                : isEdit
                ? 'Save Changes'
                : 'Confirm & Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
