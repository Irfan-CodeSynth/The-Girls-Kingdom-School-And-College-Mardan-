import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import expenseApi from '../api/expenseApi';

const CATEGORIES = [
  { value: 'utilities', label: 'Utilities (Electricity/Gas/Water)', icon: '⚡' },
  { value: 'maintenance', label: 'Maintenance & Repairs', icon: '🔧' },
  { value: 'supplies', label: 'Supplies & Stationery', icon: '📦' },
  { value: 'transport', label: 'Transport & Fuel', icon: '🚌' },
  { value: 'campus_rent', label: 'Campus Rent', icon: '🏫' },
  { value: 'events_sports', label: 'Events & Sports', icon: '🏆' },
  { value: 'lab_library', label: 'Lab & Library', icon: '📚' },
  { value: 'petty_cash', label: 'Petty Cash', icon: '💵' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending_approval', label: 'Pending Approval' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? 'Edit Expense' : 'Record New Expense'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? 'Update expense details' : 'Log an institutional expense with payment voucher'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="relative flex items-center gap-2 p-2.5 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-400 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    value={cat.value}
                    {...register('category', { required: true })}
                    className="sr-only"
                  />
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{cat.label}</span>
                </label>
              ))}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">Category is required</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Expense Title / Description *
            </label>
            <input
              type="text"
              placeholder="e.g. PESCO Electricity Bill March 2025"
              {...register('title', { required: 'Title is required', minLength: 2 })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Paid To & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Paid To (Vendor / Payee) *
              </label>
              <input
                type="text"
                placeholder="e.g. PESCO / Ali Traders"
                {...register('paidTo', { required: 'Payee name is required' })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.paidTo && <p className="text-red-500 text-xs mt-1">{errors.paidTo.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="0"
                {...register('amount', { required: 'Amount is required', min: 1 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Payment Method & Bill Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Payment Method *
              </label>
              <select
                {...register('paymentMethod', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Bill / Invoice / Cheque Reference
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2025-001 / Chq#123456"
                {...register('billReference')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Expense Date *
              </label>
              <input
                type="date"
                {...register('expenseDate', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Billing Month *
              </label>
              <input
                type="month"
                {...register('billingMonth', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks</label>
            <textarea
              rows={2}
              placeholder="Optional notes..."
              {...register('remarks')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm">
                {mutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60"
            >
              {mutation.isPending
                ? isEdit
                  ? 'Saving…'
                  : 'Recording…'
                : isEdit
                ? 'Save Changes'
                : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
