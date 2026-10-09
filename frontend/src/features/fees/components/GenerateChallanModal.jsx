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

  const monthName = MONTH_NAMES[parseInt(form.month, 10) - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE5E0] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Generate Monthly Challans</h2>
              <p className="text-xs text-[#6B7280]">Bulk-generate bank vouchers for all students in a class</p>
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

          {/* Class selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
              Select Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value, feeStructureId: '' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
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

          {/* Fee structure preview */}
          {form.classId && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
              {fetchingStructure ? (
                <p className="text-sm text-[#6B7280]">Loading fee structure…</p>
              ) : structure ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5A0D1A] mb-2">Fee Structure Preview</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#4B5563]">
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
                        <span className="font-semibold text-[#111827]">PKR {val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center border-t border-[#EFE5E0] mt-3 pt-2">
                    <span className="text-xs font-bold text-[#111827]">Total per Student</span>
                    <span className="text-sm font-extrabold text-[#5A0D1A]">
                      PKR {(structure.totalMonthlyFee || 0).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-amber-700">
                  ⚠ No fee structure found for {form.year}. Please create one first.
                </p>
              )}
            </div>
          )}

          {/* Summary line */}
          {structure && (
            <div className="text-sm text-[#4B5563] bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl p-3">
              Ready to generate challans for <strong className="text-[#111827]">{monthName} {form.year}</strong> for all active students in the selected class.
            </div>
          )}

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
              disabled={mutation.isPending || !structure}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
