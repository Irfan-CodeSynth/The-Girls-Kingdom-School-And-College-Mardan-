import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  Calendar,
  FileText,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';
import parentApi from '../api/parentApi';
import ChildSelectorBar from '../components/ChildSelectorBar';
import ChallanPrintModal from '../../fees/components/ChallanPrintModal';

const STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', variant: 'warning', icon: Clock, bg: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Paid', variant: 'success', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-700' },
  partial: { label: 'Partial', variant: 'info', icon: CreditCard, bg: 'bg-blue-50 text-blue-700' },
  overdue: { label: 'Overdue', variant: 'danger', icon: AlertCircle, bg: 'bg-rose-50 text-rose-700' },
  cancelled: { label: 'Cancelled', variant: 'default', icon: AlertCircle, bg: 'bg-gray-100 text-gray-600' },
};

const formatMonth = (ym) => {
  if (!ym) return '—';
  const parts = ym.split('-');
  if (parts.length < 2) return ym;
  const [y, m] = parts;
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
};

export const ParentFeesPage = () => {
  const { selectedChildId, selectedChild } = useParentChild();
  const [filter, setFilter] = useState('all');
  const [printChallan, setPrintChallan] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildFees', selectedChildId],
    queryFn: () => parentApi.getChildFees(selectedChildId),
    enabled: Boolean(selectedChildId),
  });

  const challans = data?.challans || [];
  const summary = data?.summary || { totalBilled: 0, totalPaid: 0, totalDues: 0 };

  const filteredChallans = challans.filter((c) => {
    if (filter === 'pending') return c.status === 'unpaid' || c.status === 'overdue' || c.status === 'partial';
    if (filter === 'paid') return c.status === 'paid';
    return true;
  });

  const handlePrint = (challan) => {
    setPrintChallan({
      ...challan,
      student: challan.student && typeof challan.student === 'object' ? challan.student : selectedChild,
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ward Selector Bar */}
      <ChildSelectorBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#111827]">
            Fee Accounts & Bank Challans
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Institutional fee records, payment receipts, and bank voucher slips for {selectedChild?.fullName || 'student'}
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              Total Billed
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-extrabold text-[#111827] mt-3">
            PKR {(summary.totalBilled || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Cumulative billings to date</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Paid Amount
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-extrabold text-emerald-600 mt-3">
            PKR {(summary.totalPaid || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Verified bank settlements</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Outstanding Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-extrabold text-rose-600 mt-3">
            PKR {(summary.totalDues || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            {summary.totalDues > 0 ? 'Pending payment at authorized bank' : 'All accounts settled'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFE5E0] pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#5A0D1A] text-white'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          All Challans ({challans.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-[#5A0D1A] text-white'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          Pending / Overdue (
          {challans.filter((c) => c.status === 'unpaid' || c.status === 'overdue' || c.status === 'partial').length}
          )
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'paid'
              ? 'bg-[#5A0D1A] text-white'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          Paid ({challans.filter((c) => c.status === 'paid').length})
        </button>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredChallans.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B7280]">
            No fee challans found matching your selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5]/80 text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#EFE5E0]">
                <tr>
                  <th className="py-3.5 px-4">Challan #</th>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4">Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {filteredChallans.map((c) => {
                  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.unpaid;
                  const Icon = cfg.icon;
                  const dueDateFormatted = c.dueDate
                    ? new Date(c.dueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={c._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5A0D1A]">
                        {c.challanNo || c._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#111827]">
                        {formatMonth(c.billingMonth)}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280]">{dueDateFormatted}</td>
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        PKR {(c.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-semibold">
                        PKR {(c.paidAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">
                        PKR {(c.balanceAmount ?? (c.totalAmount - (c.paidAmount || 0))).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={cfg.variant} className="capitalize text-[10px] gap-1">
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handlePrint(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE5E0] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#5A0D1A] transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Challan Print Modal */}
      {printChallan && (
        <ChallanPrintModal
          challan={printChallan}
          onClose={() => setPrintChallan(null)}
        />
      )}
    </div>
  );
};

export default ParentFeesPage;
