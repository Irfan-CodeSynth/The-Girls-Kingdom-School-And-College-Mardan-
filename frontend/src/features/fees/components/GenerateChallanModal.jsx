import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Zap } from 'lucide-react';
import feeApi from '../api/feeApi';
import { classApi } from '../../classes/api/classApi';

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = [
  '01','02','03','04','05','06','07','08','09','10','11','12'
];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const GenerateChallanModal = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    classId: '',
    year: String(CURRENT_YEAR),
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    feeStructureId: '',
  });
  const [apiError, setApiError] = useState('');

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classApi.getClasses({ limit: 100 }),
  });

  const { data: structureData, isFetching: fetchingStructure } = useQuery({
    queryKey: ['feeStructure', form.classId, form.year],
    queryFn: () => feeApi.getFeeStructureByClass(form.classId, form.year),
    enabled: Boolean(form.classId),
    retry: false,
  });

  const classes = classesData?.classes || [];
  const structure = structureData?.feeStructure || null;

  // Auto-fill structure ID when loaded
  React.useEffect(() => {
    if (structure?._id) {
      setForm((f) => ({ ...f, feeStructureId: structure._id }));
    }
  }, [structure]);

  const mutation = useMutation({
    mutationFn: (data) => feeApi.generateChallans(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['feeSummary'] });
      if (onSuccess) onSuccess(data);
      onClose();
    },
    onError: (err) => {
      setApiError(err?.response?.data?.message || 'Generation failed. Try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError('');
    if (!form.classId) return setApiError('Please select a class.');
    if (!form.feeStructureId) return setApiError('No fee structure found for this class. Please create one first.');
    mutation.mutate({
      classId: form.classId,
      billingMonth: `${form.year}-${form.month}`,
      feeStructureId: form.feeStructureId,
    });
  };

  const billingMonth = `${form.year}-${form.month}`;
  const monthName = MONTH_NAMES[parseInt(form.month, 10) - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Generate Monthly Challans</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Bulk-generate bank vouchers for all students in a class</p>
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

          {/* Class selector */}
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Select Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value, feeStructureId: '' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— Choose a class —</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Month & Year */}
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

          {/* Fee structure preview */}
          {form.classId && (
            <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600">
              {fetchingStructure ? (
                <p className="text-sm text-surface-500 dark:text-surface-400">Loading fee structure…</p>
              ) : structure ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">Fee Structure Preview</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-surface-700 dark:text-surface-300">
                    {[
                      { label: 'Tuition Fee', val: structure.tuitionFee },
                      { label: 'Exam Fee', val: structure.examFee },
                      { label: 'Library Fee', val: structure.libraryFee },
                      { label: 'Transport Fee', val: structure.transportFee },
                      { label: 'Sports Fund', val: structure.sportsFund },
                      { label: 'Computer Fee', val: structure.computerFee },
                    ].map(({ label, val }) => val > 0 && (
                      <div key={label} className="flex justify-between gap-2">
                        <span>{label}</span>
                        <span className="font-semibold">PKR {val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-surface-200 dark:border-surface-600 mt-2 pt-2">
                    <span className="text-xs font-bold text-surface-700 dark:text-surface-300">Total per Student</span>
                    <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">
                      PKR {(structure.totalMonthlyFee || 0).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠ No fee structure found for {form.year}. Please create one first.
                </p>
              )}
            </div>
          )}

          {/* Summary line */}
          {structure && (
            <div className="text-sm text-surface-600 dark:text-surface-400 bg-primary-50 dark:bg-primary-950/30 rounded-xl p-3">
              Ready to generate challans for <strong>{monthName} {form.year}</strong> for all active students in the selected class.
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-300 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !structure}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Generating…' : `Generate Challans`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateChallanModal;
