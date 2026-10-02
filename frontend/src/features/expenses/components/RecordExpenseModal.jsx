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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800 sticky top-0 bg-white/95 dark:bg-surface-900/95 backdrop-blur-sm rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/40 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                {isEdit ? 'Edit Institutional Expense' : 'Record Institutional Expense'}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                {isEdit ? 'Update expense details' : 'Log an operational expenditure and issue printable voucher'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-2">
              Expense Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="relative flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition-all border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-primary-300 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-950/40 dark:has-[:checked]:border-primary-500"
                >
                  <input
                    type="radio"
                    value={cat.value}
                    {...register('category', { required: true })}
                    className="sr-only"
                  />
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 leading-tight truncate">
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.category && <p className="text-rose-500 text-xs mt-1">Category is required</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
              Expense Title / Description *
            </label>
            <input
              type="text"
              placeholder="e.g. PESCO Electricity Bill - March 2026"
              {...register('title', { required: 'Title is required', minLength: 2 })}
              className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Paid To & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Paid To (Vendor / Payee) *
              </label>
              <input
                type="text"
                placeholder="e.g. PESCO / Al-Madina Book Depot"
                {...register('paidTo', { required: 'Payee name is required' })}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.paidTo && <p className="text-rose-500 text-xs mt-1">{errors.paidTo.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 45000"
                {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } })}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-extrabold text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Payment Method *
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Bill / Cheque Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. Inv #8821 / Chq #4401"
                {...register('billReference')}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Date of Expense *
              </label>
              <input
                type="date"
                {...register('expenseDate', { required: true })}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Billing Month *
              </label>
              <input
                type="month"
                {...register('billingMonth', { required: true })}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs font-medium text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
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
            <label className="block text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
              Remarks & Accounting Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes or administrative approvals..."
              {...register('remarks')}
              className="w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-2.5 text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Error */}
          {mutation.isError && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3">
              <p className="text-rose-700 dark:text-rose-300 text-xs font-medium">
                {mutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-200 dark:border-surface-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
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
