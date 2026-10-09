import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt, Plus, Search, Filter, TrendingDown, TrendingUp,
  Wallet, FileText, AlertCircle, Edit2, Printer, XCircle,
  ChevronLeft, ChevronRight, RefreshCw, Calendar, PieChart
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import expenseApi from '../api/expenseApi';
import RecordExpenseModal from '../components/RecordExpenseModal';
import PaymentVoucherPrintModal from '../components/PaymentVoucherPrintModal';

// ─── Category Configurations ─────────────────────────────────────────
const CATEGORY_LABELS = {
  utilities: 'Utilities & Power',
  maintenance: 'Maintenance & Repairs',
  supplies: 'Supplies & Stationery',
  transport: 'Transport & Fuel',
  campus_rent: 'Campus Lease & Rent',
  events_sports: 'Events, Sports & Co-Curricular',
  lab_library: 'Lab, Science & Library',
  petty_cash: 'Petty Cash & Miscellaneous',
  other: 'Other Institutional Expense',
};

const CATEGORY_COLORS = {
  utilities: '#f59e0b',
  maintenance: '#3b82f6',
  supplies: '#8b5cf6',
  transport: '#ec4899',
  campus_rent: '#10b981',
  events_sports: '#f97316',
  lab_library: '#06b6d4',
  petty_cash: '#84cc16',
  other: '#6b7280',
};

const CATEGORY_ICONS = {
  utilities: '⚡',
  maintenance: '🔧',
  supplies: '📦',
  transport: '🚌',
  campus_rent: '🏫',
  events_sports: '🏆',
  lab_library: '📚',
  petty_cash: '💵',
  other: '📋',
};

const PM_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  cheque: 'Bank Cheque'
};

const STATUS_CONFIG = {
  paid: { label: 'Paid', variant: 'success' },
  pending_approval: { label: 'Pending', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

// ─── Format Helpers ──────────────────────────────────────────────────
const fmt = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;
const fmtK = (n) => {
  n = Number(n || 0);
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Number(n).toLocaleString('en-PK');
};

// ─── Standardized Institutional Summary Card ─────────────────────────
const SummaryCard = ({ label, value, icon: Icon, color, sub, loading }) => (
  <div className="bg-white p-4.5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      {loading ? (
        <>
          <Skeleton className="h-6 w-24 mb-1" />
          <Skeleton className="h-3.5 w-16" />
        </>
      ) : (
        <>
          <p className="font-serif text-lg sm:text-xl font-extrabold text-[#111827] leading-tight truncate">
            {value ?? '—'}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] truncate mt-0.5">{label}</p>
          {sub && <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{sub}</p>}
        </>
      )}
    </div>
  </div>
);

// ─── Main Expenses Page ──────────────────────────────────────────────
export default function AdminExpensesPage() {
  const qc = useQueryClient();

  const [billingMonth, setBillingMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [showRecord, setShowRecord] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);

  // Queries
  const summaryQuery = useQuery({
    queryKey: ['expense-summary', billingMonth],
    queryFn: () => expenseApi.getSummary({ billingMonth }),
  });

  const overviewQuery = useQuery({
    queryKey: ['financial-overview', billingMonth],
    queryFn: () => expenseApi.getFinancialOverview({ billingMonth }),
  });

  const expensesQuery = useQuery({
    queryKey: ['expenses', { billingMonth, category, paymentMethod, status, search, page, limit }],
    queryFn: () =>
      expenseApi.getExpenses({
        billingMonth,
        category: category || undefined,
        paymentMethod: paymentMethod || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        limit,
      }),
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => expenseApi.cancelExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-summary'] });
      qc.invalidateQueries({ queryKey: ['financial-overview'] });
    },
  });

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['expense-summary'] });
    qc.invalidateQueries({ queryKey: ['financial-overview'] });
    qc.invalidateQueries({ queryKey: ['expenses'] });
  };

  const summary = summaryQuery.data || { grandTotal: 0, voucherCount: 0, categories: [] };
  const overview = overviewQuery.data || { totalFeeIncome: 0, totalSalaryOutflow: 0, totalOpEx: 0, totalOutflow: 0, netCashFlow: 0 };
  const listData = expensesQuery.data || { expenses: [], pagination: { total: 0, page: 1, pages: 1 } };

  const maxCatTotal = useMemo(
    () => Math.max(...(summary.categories || []).map((c) => c.total), 1),
    [summary.categories]
  );

  const leadingCatObj = summary.leadingCategory 
    ? summary.categories?.find(c => c.category === summary.leadingCategory) 
    : null;

  const leadingCatDisplay = summary.leadingCategory
    ? `${CATEGORY_ICONS[summary.leadingCategory] || '📁'} ${CATEGORY_LABELS[summary.leadingCategory] || summary.leadingCategory}`
    : 'None Recorded';

  const handleEdit = (expense) => {
    setEditTarget(expense);
    setShowRecord(true);
  };

  const handlePrint = async (expense) => {
    try {
      const full = await expenseApi.getExpenseById(expense._id);
      setPrintTarget(full);
    } catch {
      setPrintTarget(expense);
    }
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this institutional expense? This action cannot be reversed.')) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Operational Expenditure
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Institutional Expenses & OpEx
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4B5563]">
            Track operational spending, issue payment vouchers, and review monthly cash flow balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#EFE5E0] rounded-xl px-3 py-1.5 shadow-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={billingMonth}
              onChange={(e) => { setBillingMonth(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-bold text-[#111827] focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => { setShowRecord(true); setEditTarget(null); }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Expense
          </Button>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Monthly OpEx"
          value={summaryQuery.isLoading ? null : `PKR ${fmtK(summary.grandTotal || 0)}`}
          icon={TrendingDown}
          color="bg-rose-50 text-rose-700 border border-rose-100"
          sub={`${summary.voucherCount || 0} vouchers recorded`}
          loading={summaryQuery.isLoading}
        />
        <SummaryCard
          label="Leading Expense"
          value={summaryQuery.isLoading ? null : leadingCatDisplay}
          icon={PieChart}
          color="bg-amber-50 text-amber-700 border border-amber-100"
          sub={leadingCatObj ? `${fmt(leadingCatObj.total)} spent` : 'No expenses'}
          loading={summaryQuery.isLoading}
        />
        <SummaryCard
          label="Net Cash Flow"
          value={overviewQuery.isLoading ? null : `PKR ${fmtK(Math.abs(overview.netCashFlow || 0))}`}
          icon={overview.netCashFlow >= 0 ? TrendingUp : TrendingDown}
          color={overview.netCashFlow >= 0
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-rose-50 text-rose-700 border border-rose-100"
          }
          sub={overview.netCashFlow < 0 ? '⚠️ Deficit (Outflow > Fees)' : '✅ Healthy Surplus'}
          loading={overviewQuery.isLoading}
        />
        <SummaryCard
          label="Fee Income vs Outflow"
          value={overviewQuery.isLoading ? null : `PKR ${fmtK(overview.totalFeeIncome || 0)}`}
          icon={Wallet}
          color="bg-[#FAF8F5] text-[#5A0D1A] border border-[#EFE5E0]"
          sub={`Outflow: PKR ${fmtK(overview.totalOutflow || 0)}`}
          loading={overviewQuery.isLoading}
        />
      </div>

      {/* ── Category Breakdown ── */}
      {summary.categories?.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-sans">
                Expenditure Distribution — {billingMonth}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Relative percentage distribution of departmental operational expenses
              </p>
            </div>
            <span className="text-xs font-bold text-[#5A0D1A] bg-[#FAF8F5] border border-[#EFE5E0] px-2.5 py-1 rounded-lg">
              {summary.categories.filter(c => c.total > 0).length} Active Categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.categories
              .filter((c) => c.total > 0)
              .sort((a, b) => b.total - a.total)
              .map((cat) => {
                const percentOfTotal = summary.grandTotal > 0
                  ? Math.round((cat.total / summary.grandTotal) * 100)
                  : 0;
                const width = Math.round((cat.total / maxCatTotal) * 100);
                return (
                  <div key={cat.category} className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFE5E0]">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                        <span className="text-base">{CATEGORY_ICONS[cat.category]}</span>
                        {CATEGORY_LABELS[cat.category] || cat.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6B7280] font-medium">({percentOfTotal}%)</span>
                        <span className="text-xs font-extrabold text-[#111827]">{fmt(cat.total)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${width}%`,
                          backgroundColor: CATEGORY_COLORS[cat.category] || '#5A0D1A',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Vouchers Table with Integrated Filters ── */}
      <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFE5E0] bg-[#FAF8F5] flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, payee, voucher #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#EFE5E0] rounded-xl text-xs text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] transition-all shadow-xs"
            />
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-white border border-[#EFE5E0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] shadow-xs cursor-pointer"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Payment Method filter */}
          <select
            value={paymentMethod}
            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            className="bg-white border border-[#EFE5E0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] shadow-xs cursor-pointer"
          >
            <option value="">All Payment Modes</option>
            {Object.entries(PM_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-white border border-[#EFE5E0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] shadow-xs cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending_approval">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {expensesQuery.isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : listData.expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EFE5E0] flex items-center justify-center mb-3">
                <Receipt className="w-8 h-8 text-[#5A0D1A]/40" />
              </div>
              <p className="text-sm font-bold text-[#111827]">No Expense Vouchers Found</p>
              <p className="text-xs text-[#6B7280] mt-1 max-w-sm text-center">
                No expense vouchers recorded for the selected month and filters. Click "+ Record Expense" to create one.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0] text-[#6B7280] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3.5">Voucher #</th>
                  <th className="px-4 py-3.5">Title & Payee</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {listData.expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-[#5A0D1A] bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#EFE5E0]">
                        {exp.voucherNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-[#111827] max-w-[200px] truncate text-sm">
                        {exp.title}
                      </p>
                      <p className="text-[#6B7280] text-[11px] truncate mt-0.5">
                        Payee: <span className="font-semibold text-[#111827]">{exp.paidTo}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EFE5E0] text-[#111827] font-semibold">
                        <span>{CATEGORY_ICONS[exp.category]}</span>
                        <span className="truncate max-w-[130px]">{CATEGORY_LABELS[exp.category] || exp.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280] font-medium">
                      {exp.expenseDate
                        ? new Date(exp.expenseDate).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFE5E0] text-[#6B7280] font-medium text-[11px]">
                        {PM_LABELS[exp.paymentMethod] || exp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#111827] text-sm">
                      {fmt(exp.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={STATUS_CONFIG[exp.status]?.variant || 'default'} dot size="sm">
                        {STATUS_CONFIG[exp.status]?.label || exp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {exp.status !== 'cancelled' && (
                          <button
                            onClick={() => handleEdit(exp)}
                            title="Edit Voucher"
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#5A0D1A] hover:bg-[#FAF8F5] transition-colors cursor-pointer border border-[#EFE5E0]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(exp)}
                          title="Print Payment Voucher"
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer border border-[#EFE5E0]"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {exp.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(exp._id)}
                            title="Cancel Voucher"
                            disabled={cancelMutation.isPending}
                            className="p-1.5 rounded-lg text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer border border-[#EFE5E0]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {listData.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EFE5E0] bg-[#FAF8F5]">
            <p className="text-xs text-[#6B7280]">
              Showing <span className="font-bold text-[#111827]">{listData.expenses.length}</span> of{' '}
              <span className="font-bold text-[#111827]">{listData.pagination.total}</span> vouchers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#EFE5E0] bg-white text-[#111827] hover:bg-[#FAF8F5] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-[#111827]">
                Page {page} of {listData.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(listData.pagination.pages, p + 1))}
                disabled={page === listData.pagination.pages}
                className="p-1.5 rounded-lg border border-[#EFE5E0] bg-white text-[#111827] hover:bg-[#FAF8F5] disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showRecord && (
        <RecordExpenseModal
          expense={editTarget}
          onClose={() => { setShowRecord(false); setEditTarget(null); }}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['expenses'] });
            qc.invalidateQueries({ queryKey: ['expense-summary'] });
            qc.invalidateQueries({ queryKey: ['financial-overview'] });
          }}
        />
      )}
      {printTarget && (
        <PaymentVoucherPrintModal
          expense={printTarget}
          onClose={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}
