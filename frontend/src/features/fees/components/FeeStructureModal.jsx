import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Settings } from 'lucide-react';
import feeApi from '../api/feeApi';
import { classApi } from '../../classes/api/classApi';

const CURRENT_YEAR = new Date().getFullYear();

const FEE_FIELDS = [
  { key: 'tuitionFee', label: 'Tuition Fee', required: true },
  { key: 'admissionFee', label: 'Admission Fee' },
  { key: 'examFee', label: 'Exam Fee' },
  { key: 'libraryFee', label: 'Library Fee' },
  { key: 'transportFee', label: 'Transport / Bus Fee' },
  { key: 'sportsFund', label: 'Sports Fund' },
  { key: 'computerFee', label: 'Computer Fee' },
  { key: 'lateSurchargePerDay', label: 'Late Surcharge (per day)' },
];

const DEFAULTS = {
  classId: '',
  academicYear: String(CURRENT_YEAR),
  tuitionFee: 0,
  admissionFee: 0,
  examFee: 0,
  libraryFee: 0,
  transportFee: 0,
  sportsFund: 0,
  computerFee: 0,
  lateSurchargePerDay: 0,
  dueDayOfMonth: 10,
};

const FeeStructureModal = ({ initialStructure, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULTS);
  const [apiError, setApiError] = useState('');

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classApi.getClasses({ limit: 100 }),
  });

  const classes = classesData?.classes || [];

  // Populate form when editing an existing structure
  useEffect(() => {
    if (initialStructure) {
      setForm({
        classId: initialStructure.class?._id || initialStructure.class || '',
        academicYear: initialStructure.academicYear || String(CURRENT_YEAR),
        tuitionFee: initialStructure.tuitionFee || 0,
        admissionFee: initialStructure.admissionFee || 0,
        examFee: initialStructure.examFee || 0,
        libraryFee: initialStructure.libraryFee || 0,
        transportFee: initialStructure.transportFee || 0,
        sportsFund: initialStructure.sportsFund || 0,
        computerFee: initialStructure.computerFee || 0,
        lateSurchargePerDay: initialStructure.lateSurchargePerDay || 0,
        dueDayOfMonth: initialStructure.dueDayOfMonth || 10,
      });
    }
  }, [initialStructure]);

  const mutation = useMutation({
    mutationFn: (data) => feeApi.upsertFeeStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => {
      setApiError(err?.response?.data?.message || 'Failed to save fee structure.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    if (!form.classId) { setApiError('Please select a class.'); return; }
    if (!form.tuitionFee || form.tuitionFee <= 0) { setApiError('Tuition fee is required.'); return; }

    // Convert all numeric fields
    const payload = { ...form };
    FEE_FIELDS.forEach(({ key }) => { payload[key] = Number(payload[key]) || 0; });
    payload.dueDayOfMonth = Number(payload.dueDayOfMonth) || 10;

    mutation.mutate(payload);
  };

  const totalPreview = FEE_FIELDS
    .filter((f) => f.key !== 'lateSurchargePerDay')
    .reduce((sum, f) => sum + (Number(form[f.key]) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">
                {initialStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Set monthly fee heads for a class</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-sm">
              {apiError}
            </div>
          )}

          {/* Class & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                disabled={Boolean(initialStructure)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
              >
                <option value="">— Select class —</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Academic Year
              </label>
              <select
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fee heads */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">Fee Heads (PKR)</p>
            <div className="grid grid-cols-2 gap-3">
              {FEE_FIELDS.map(({ key, label, required }) => (
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

          {/* Due day */}
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Fee Due Day of Month
            </label>
            <input
              type="number"
              min="1"
              max="28"
              value={form.dueDayOfMonth}
              onChange={(e) => setForm({ ...form, dueDayOfMonth: e.target.value })}
              className="w-32 px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Challans are due on this day each month (1–28)</p>
          </div>

          {/* Total preview */}
          <div className="flex justify-between items-center p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40">
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">Monthly Total per Student</span>
            <span className="text-lg font-extrabold text-primary-700 dark:text-primary-300">
              PKR {totalPreview.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Saving…' : initialStructure ? 'Update Structure' : 'Create Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeStructureModal;
