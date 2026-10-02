import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt, Plus, Search, Filter, TrendingDown, TrendingUp,
  Wallet, FileText, AlertCircle, Edit2, Printer, XCircle,
  ChevronLeft, ChevronRight, RefreshCw, Calendar, PieChart
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
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
  <Card bodyClassName="flex items-center gap-4 p-4 sm:p-5">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
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
          <p className="text-lg sm:text-xl font-extrabold text-surface-900 dark:text-white leading-tight truncate">
            {value ?? '—'}
          </p>
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mt-0.5 truncate">{label}</p>
          {sub && <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 mt-1 truncate">{sub}</p>}
        </>
      )}
    </div>
  </Card>
);

// ─── Main Expenses Page ──────────────────────────────────────────────
export default function AdminExpensesPage() {
  const qc = useQueryClient();

  const thisMonth = new Date().toISOString().slice(0, 7);
  const [billingMonth, setBillingMonth] = useState(thisMonth);
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
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
    queryKey: ['expenses', { billingMonth, category, paymentMethod, status, search, page }],
    queryFn: () =>
      expenseApi.getExpenses({ billingMonth, category, paymentMethod, status, search, page, limit: 12 }),
    keepPreviousData: true,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => expenseApi.cancelExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-summary'] });
      qc.invalidateQueries({ queryKey: ['financial-overview'] });
    },
  });

  const summary = summaryQuery.data || {};
  const overview = overviewQuery.data || {};
  const listData = expensesQuery.data || { expenses: [], pagination: { total: 0, pages: 1 } };

  const handleRefresh = () => {
    summaryQuery.refetch();
    overviewQuery.refetch();
    expensesQuery.refetch();
  };

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
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/40 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Expenses & OpEx</h1>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              Institutional operational expenditure, payment vouchers & cash flow management
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-surface-400" />
            <input
              type="month"
              value={billingMonth}
              onChange={(e) => { setBillingMonth(e.target.value); setPage(1); }}
              className="bg-transparent text-xs font-semibold text-surface-700 dark:text-surface-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>

          <button
            onClick={() => { setShowRecord(true); setEditTarget(null); }}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          label="Total Monthly OpEx"
          value={summaryQuery.isLoading ? null : `PKR ${fmtK(summary.grandTotal || 0)}`}
          icon={TrendingDown}
          color="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40"
          sub={`${summary.voucherCount || 0} vouchers recorded`}
          loading={summaryQuery.isLoading}
        />
        <SummaryCard
          label="Leading Expense Category"
          value={summaryQuery.isLoading ? null : leadingCatDisplay}
          icon={PieChart}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40"
          sub={leadingCatObj ? `${fmt(leadingCatObj.total)} spent` : 'No expenses this month'}
          loading={summaryQuery.isLoading}
        />
        <SummaryCard
          label="Net Cash Flow"
          value={overviewQuery.isLoading ? null : `PKR ${fmtK(Math.abs(overview.netCashFlow || 0))}`}
          icon={overview.netCashFlow >= 0 ? TrendingUp : TrendingDown}
          color={overview.netCashFlow >= 0
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40"
            : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40"
          }
          sub={overview.netCashFlow < 0 ? '⚠️ Deficit (Outflow > Fees)' : '✅ Healthy Surplus'}
          loading={overviewQuery.isLoading}
        />
        <SummaryCard
          label="Fee Income vs Total Outflow"
          value={overviewQuery.isLoading ? null : `PKR ${fmtK(overview.totalFeeIncome || 0)}`}
          icon={Wallet}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-900/40"
          sub={`Outflow: PKR ${fmtK(overview.totalOutflow || 0)}`}
          loading={overviewQuery.isLoading}
        />
      </div>

      {/* ── Category Breakdown Progress Bars ── */}
      {summary.categories?.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
                Expenditure Distribution — {billingMonth}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                Relative percentage distribution of departmental operational expenses
              </p>
            </div>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg">
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
                  <div key={cat.category} className="bg-surface-50 dark:bg-surface-800/60 p-3 rounded-xl border border-surface-200/60 dark:border-surface-700/60">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-surface-800 dark:text-surface-200 flex items-center gap-1.5">
                        <span className="text-base">{CATEGORY_ICONS[cat.category]}</span>
                        {CATEGORY_LABELS[cat.category] || cat.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-400 font-medium">({percentOfTotal}%)</span>
                        <span className="text-xs font-extrabold text-surface-900 dark:text-white">{fmt(cat.total)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${width}%`,
                          backgroundColor: CATEGORY_COLORS[cat.category] || '#7c2d37',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* ── Vouchers Table with Integrated Filters ── */}
      <Card bodyClassName="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-800/50 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search title, payee, voucher #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-xs text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
            />
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer"
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
            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer"
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
            className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 text-xs font-medium text-surface-700 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer"
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
            <div className="flex flex-col items-center justify-center py-16 text-surface-400">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                <Receipt className="w-8 h-8 text-surface-400 opacity-60" />
              </div>
              <p className="text-sm font-bold text-surface-700 dark:text-surface-300">No Expense Vouchers Found</p>
              <p className="text-xs text-surface-400 mt-1 max-w-sm text-center">
                No expense vouchers recorded for the selected month and filters. Click "+ Record Expense" above to create one.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 dark:bg-surface-800/80 border-b border-surface-200 dark:border-surface-700 text-surface-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Voucher #</th>
                  <th className="px-4 py-3.5">Title & Payee</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {listData.expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-2 py-1 rounded-md border border-primary-200/50 dark:border-primary-800/40">
                        {exp.voucherNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-surface-900 dark:text-white max-w-[200px] truncate">
                        {exp.title}
                      </p>
                      <p className="text-surface-500 dark:text-surface-400 text-[11px] truncate mt-0.5">
                        Payee: <span className="font-medium text-surface-700 dark:text-surface-300">{exp.paidTo}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium">
                        <span>{CATEGORY_ICONS[exp.category]}</span>
                        <span className="truncate max-w-[130px]">{CATEGORY_LABELS[exp.category] || exp.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-surface-600 dark:text-surface-300 font-medium">
                      {exp.expenseDate
                        ? new Date(exp.expenseDate).toLocaleDateString('en-PK', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-medium">
                        {PM_LABELS[exp.paymentMethod] || exp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-surface-900 dark:text-white text-sm">
                      {fmt(exp.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={STATUS_CONFIG[exp.status]?.variant || 'default'}>
                        {STATUS_CONFIG[exp.status]?.label || exp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {exp.status !== 'cancelled' && (
                          <button
                            onClick={() => handleEdit(exp)}
                            title="Edit Voucher"
                            className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(exp)}
                          title="Print Payment Voucher"
                          className="p-1.5 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {exp.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(exp._id)}
                            title="Cancel Voucher"
                            disabled={cancelMutation.isPending}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors disabled:opacity-40 cursor-pointer"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
            <p className="text-xs text-surface-500">
              Showing <span className="font-bold text-surface-700 dark:text-surface-300">{listData.expenses.length}</span> of{' '}
              <span className="font-bold text-surface-700 dark:text-surface-300">{listData.pagination.total}</span> vouchers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-surface-700 dark:text-surface-200">
                Page {page} of {listData.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(listData.pagination.pages, p + 1))}
                disabled={page === listData.pagination.pages}
                className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

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
