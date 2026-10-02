import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserCog } from 'lucide-react';
import salaryApi from '../api/salaryApi';
import { teacherApi } from '../../teachers/api/teacherApi';

const FIELDS = [
  { key: 'basicSalary', label: 'Basic Salary', required: true },
  { key: 'houseRentAllowance', label: 'House Rent Allowance (HRA)' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },
  { key: 'transportAllowance', label: 'Transport Allowance' },
  { key: 'specialAllowance', label: 'Special / Performance Allowance' },
  { key: 'taxDeduction', label: 'Income Tax / WHT Deduction' },
  { key: 'providentFund', label: 'Provident Fund' },
  { key: 'eobiDeduction', label: 'EOBI Deduction' },
];

const DEFAULTS = {
  teacherId: '',
  designation: '',
  department: '',
  basicSalary: 0,
  houseRentAllowance: 0,
  medicalAllowance: 0,
  transportAllowance: 0,
  specialAllowance: 0,
  taxDeduction: 0,
  providentFund: 0,
  eobiDeduction: 0,
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
};

const SalaryStructureModal = ({ initial, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        teacherId: initial.teacher?._id || initial.teacher || '',
        designation: initial.designation || '',
        department: initial.department || '',
        basicSalary: initial.basicSalary || 0,
        houseRentAllowance: initial.houseRentAllowance || 0,
        medicalAllowance: initial.medicalAllowance || 0,
        transportAllowance: initial.transportAllowance || 0,
        specialAllowance: initial.specialAllowance || 0,
        taxDeduction: initial.taxDeduction || 0,
        providentFund: initial.providentFund || 0,
        eobiDeduction: initial.eobiDeduction || 0,
        bankName: initial.bankName || '',
        accountTitle: initial.accountTitle || '',
        accountNumber: initial.accountNumber || '',
        iban: initial.iban || '',
      };
    }
    return DEFAULTS;
  });
  const [apiError, setApiError] = useState('');

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', 'all'],
    queryFn: () => teacherApi.getTeachers({ limit: 200 }),
  });
  const teachers = teachersData?.teachers || [];

  const mutation = useMutation({
    mutationFn: (data) => salaryApi.upsertSalaryStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => setApiError(err?.response?.data?.message || 'Failed to save.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    if (!form.teacherId) { setApiError('Please select a teacher.'); return; }
    if (!form.designation) { setApiError('Designation is required.'); return; }
    if (!form.department) { setApiError('Department is required.'); return; }
    if (!form.basicSalary || Number(form.basicSalary) <= 0) { setApiError('Basic salary is required.'); return; }

    const payload = { ...form };
    FIELDS.forEach(({ key }) => { payload[key] = Number(payload[key]) || 0; });
    mutation.mutate(payload);
  };

  // Live calculation
  const gross =
    Number(form.basicSalary || 0) +
    Number(form.houseRentAllowance || 0) +
    Number(form.medicalAllowance || 0) +
    Number(form.transportAllowance || 0) +
    Number(form.specialAllowance || 0);
  const deductions =
    Number(form.taxDeduction || 0) +
    Number(form.providentFund || 0) +
    Number(form.eobiDeduction || 0);
  const net = gross - deductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                {initial ? 'Edit Salary Structure' : 'Assign Salary Structure'}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Configure faculty compensation package</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-sm">
              {apiError}
            </div>
          )}

          {/* Teacher & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Faculty Member <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                disabled={Boolean(initial)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
              >
                <option value="">— Select Teacher —</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Lecturer"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Science"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Earnings */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">
              Earnings (PKR)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FIELDS.slice(0, 5).map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">
                    {label} {required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">
              Standard Deductions (PKR)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FIELDS.slice(5).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">
              Bank Account for Disbursement
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. HBL, MCB, UBL' },
                { key: 'accountTitle', label: 'Account Title', placeholder: 'e.g. Ayesha Khan' },
                { key: 'accountNumber', label: 'Account Number', placeholder: 'e.g. 0123456789' },
                { key: 'iban', label: 'IBAN', placeholder: 'e.g. PK36HABB000...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Summary */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 text-center">
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Gross Salary</p>
              <p className="text-base font-extrabold text-surface-900 dark:text-white">
                PKR {gross.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Total Deductions</p>
              <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                PKR {deductions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-500 dark:text-surface-400">Net Payable</p>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                PKR {net.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-60">
              {mutation.isPending ? 'Saving…' : initial ? 'Update Structure' : 'Assign Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryStructureModal;
