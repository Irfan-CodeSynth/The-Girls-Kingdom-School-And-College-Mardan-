import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt, Plus, Search, Filter, TrendingDown, TrendingUp,
  Wallet, FileText, AlertCircle, Edit2, Printer, XCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import expenseApi from '../api/expenseApi';
import RecordExpenseModal from '../components/RecordExpenseModal';
import PaymentVoucherPrintModal from '../components/PaymentVoucherPrintModal';

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  utilities: 'Utilities',
  maintenance: 'Maintenance',
  supplies: 'Supplies',
  transport: 'Transport',
  campus_rent: 'Campus Rent',
  events_sports: 'Events & Sports',
  lab_library: 'Lab & Library',
  petty_cash: 'Petty Cash',
  other: 'Other',
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

const PM_LABELS = { cash: 'Cash', bank_transfer: 'Bank Transfer', cheque: 'Cheque' };

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;
const fmtK = (n) => {
  n = Number(n || 0);
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'blue', negative }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600 text-white', val: 'text-blue-700' },
    red: { bg: 'bg-red-50', icon: 'bg-red-600 text-white', val: 'text-red-700' },
    green: { bg: 'bg-green-50', icon: 'bg-green-600 text-white', val: 'text-green-700' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500 text-white', val: 'text-orange-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600 text-white', val: 'text-purple-700' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`${c.bg} rounded-2xl p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-600 leading-tight">{label}</p>
        <span className={`${c.icon} p-2 rounded-xl`}>
          <Icon size={18} />
        </span>
      </div>
      <div>
        <p className={`text-2xl font-bold ${negative ? 'text-red-600' : c.val}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminExpensesPage() {
  const qc = useQueryClient();

  // Filters state
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [billingMonth, setBillingMonth] = useState(thisMonth);
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [showRecord, setShowRecord] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);

  // Data queries
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
      expenseApi.getExpenses({ billingMonth, category, paymentMethod, status, search, page, limit: 15 }),
    keepPreviousData: true,
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

  const summary = summaryQuery.data || {};
  const overview = overviewQuery.data || {};
  const listData = expensesQuery.data || { expenses: [], pagination: { total: 0, pages: 1 } };

  // Category bar widths
  const maxCatTotal = useMemo(
    () => Math.max(...(summary.categories || []).map((c) => c.total), 1),
    [summary.categories]
  );

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
    if (window.confirm('Cancel this expense? This action cannot be undone.')) {
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <Receipt size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expenses & OpEx</h1>
                <p className="text-sm text-gray-500">Institutional Expense Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={billingMonth}
              onChange={(e) => { setBillingMonth(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => { setShowRecord(true); setEditTarget(null); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={16} />
              Record Expense
            </button>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingDown}
            label="Total Monthly OpEx"
            value={`PKR ${fmtK(summary.grandTotal)}`}
            sub={`${summary.voucherCount || 0} vouchers`}
            color="red"
          />
          <StatCard
            icon={Receipt}
            label="Leading Category"
            value={CATEGORY_ICONS[summary.leadingCategory] + ' ' + (CATEGORY_LABELS[summary.leadingCategory] || 'N/A')}
            sub={summary.leadingCategory ? fmt(summary.categories?.find(c => c.category === summary.leadingCategory)?.total) : ''}
            color="orange"
          />
          <StatCard
            icon={overview.netCashFlow >= 0 ? TrendingUp : TrendingDown}
            label="Net Cash Flow"
            value={`PKR ${fmtK(Math.abs(overview.netCashFlow || 0))}`}
            sub={overview.netCashFlow < 0 ? '⬇ Deficit' : '⬆ Surplus'}
            color={overview.netCashFlow >= 0 ? 'green' : 'red'}
            negative={overview.netCashFlow < 0}
          />
          <StatCard
            icon={Wallet}
            label="Fee Income vs Outflow"
            value={`PKR ${fmtK(overview.totalFeeIncome)}`}
            sub={`Outflow: PKR ${fmtK(overview.totalOutflow)}`}
            color="purple"
          />
        </div>

        {/* ── Category Distribution ── */}
        {summary.categories?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Category Distribution — {billingMonth}</h2>
            <div className="space-y-3">
              {summary.categories
                .filter((c) => c.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((cat) => {
                  const width = Math.round((cat.total / maxCatTotal) * 100);
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700 font-medium">
                          {CATEGORY_ICONS[cat.category]} {CATEGORY_LABELS[cat.category] || cat.category}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{fmt(cat.total)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${width}%`,
                            backgroundColor: CATEGORY_COLORS[cat.category] || '#6b7280',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Filters & Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, payee, voucher…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            {/* Payment Mode filter */}
            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modes</option>
              {Object.entries(PM_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending_approval">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {expensesQuery.isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : listData.expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Receipt size={40} className="mb-2 opacity-30" />
                <p className="text-sm">No expenses found</p>
                <p className="text-xs mt-1">Adjust filters or record a new expense</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Voucher
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Title / Payee
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Method
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Amount
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listData.expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                          {exp.voucherNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">
                          {exp.title}
                        </p>
                        <p className="text-xs text-gray-500">{exp.paidTo}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {CATEGORY_ICONS[exp.category]}{' '}
                          <span className="text-xs text-gray-600">
                            {CATEGORY_LABELS[exp.category] || exp.category}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {exp.expenseDate
                          ? new Date(exp.expenseDate).toLocaleDateString('en-PK', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          {PM_LABELS[exp.paymentMethod] || exp.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {fmt(exp.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            STATUS_STYLES[exp.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {exp.status === 'pending_approval'
                            ? 'Pending'
                            : exp.status?.charAt(0).toUpperCase() + exp.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit */}
                          {exp.status !== 'cancelled' && (
                            <button
                              onClick={() => handleEdit(exp)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {/* Print */}
                          <button
                            onClick={() => handlePrint(exp)}
                            title="Print Voucher"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                          {/* Cancel */}
                          {exp.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancel(exp._id)}
                              title="Cancel"
                              disabled={cancelMutation.isPending}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                            >
                              <XCircle size={14} />
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

          {/* Pagination */}
          {listData.pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {listData.pagination.total} total records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-gray-700">
                  Page {page} of {listData.pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(listData.pagination.pages, p + 1))}
                  disabled={page === listData.pagination.pages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRecord && (
        <RecordExpenseModal
          expense={editTarget}
          onClose={() => { setShowRecord(false); setEditTarget(null); }}
          onSuccess={() => {}}
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
