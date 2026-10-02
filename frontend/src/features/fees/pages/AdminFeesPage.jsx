import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, AlertCircle, Users2, Plus, Zap,
  Settings, Printer, CreditCard, XCircle, RefreshCw, Search,
  ChevronDown, Filter,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import feeApi from '../api/feeApi';
import { classApi } from '../../classes/api/classApi';
import ChallanPrintModal from '../components/ChallanPrintModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import GenerateChallanModal from '../components/GenerateChallanModal';
import FeeStructureModal from '../components/FeeStructureModal';

// ─── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial', variant: 'info' },
  overdue: { label: 'Overdue', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

// ─── Summary card ──────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, color, loading, sub }) => (
  <Card bodyClassName="flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      {loading ? (
        <>
          <Skeleton className="h-6 w-24 mb-1" />
          <Skeleton className="h-3.5 w-20" />
        </>
      ) : (
        <>
          <p className="text-lg sm:text-xl font-extrabold text-surface-900 dark:text-white leading-tight truncate">
            {value ?? '—'}
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{label}</p>
          {sub && <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  </Card>
);

// ─── Main Page ─────────────────────────────────────────────────
const AdminFeesPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ classId: '', billingMonth: '', status: '' });
  const [search, setSearch] = useState('');
  const [printChallan, setPrintChallan] = useState(null);
  const [payChallan, setPayChallan] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editStructure, setEditStructure] = useState(null);
  const [activeTab, setActiveTab] = useState('challans'); // 'challans' | 'structures'

  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classApi.getClasses({ limit: 100 }),
  });

  const { data: summaryData, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['feeSummary', filters.classId, filters.billingMonth],
    queryFn: () => feeApi.getFeeSummary({ classId: filters.classId || undefined, billingMonth: filters.billingMonth || undefined }),
  });

  const { data: challansData, isLoading: loadingChallans, refetch: refetchChallans } = useQuery({
    queryKey: ['challans', filters],
    queryFn: () => feeApi.getChallans({
      classId: filters.classId || undefined,
      billingMonth: filters.billingMonth || undefined,
      status: filters.status || undefined,
    }),
    enabled: activeTab === 'challans',
  });

  const { data: structuresData, isLoading: loadingStructures, refetch: refetchStructures } = useQuery({
    queryKey: ['feeStructures', filters.classId],
    queryFn: () => feeApi.getFeeStructures({ classId: filters.classId || undefined }),
    enabled: activeTab === 'structures',
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => feeApi.cancelChallan(id),
    onSuccess: () => {
      refetchChallans();
      refetchSummary();
    },
  });

  const deleteStructureMutation = useMutation({
    mutationFn: (id) => feeApi.deleteFeeStructure(id),
    onSuccess: () => refetchStructures(),
  });

  const summary = summaryData?.summary || {};
  const classes = classesData?.classes || [];
  const challans = challansData?.challans || [];
  const structures = structuresData?.feeStructures || [];

  // Client-side search filter
  const filteredChallans = challans.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.challanNumber?.toLowerCase().includes(q) ||
      c.student?.fullName?.toLowerCase().includes(q) ||
      c.student?.email?.toLowerCase().includes(q)
    );
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchChallans();
    refetchStructures();
  };

  const MONTHS = [
    '','01','02','03','04','05','06','07','08','09','10','11','12'
  ];
  const MONTH_NAMES = ['All Months','January','February','March','April','May','June','July','August','September','October','November','December'];
  const CY = new Date().getFullYear();
  const monthOptions = MONTHS.map((m, i) => ({
    value: m ? `${CY}-${m}` : '',
    label: MONTH_NAMES[i],
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Fee Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Manage fee structures, generate challans and record payments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => { setEditStructure(null); setShowStructureModal(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:brightness-95 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" /> Fee Structure
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" /> Generate Challans
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          label="Total Receivable"
          value={summary.totalReceivable != null ? `PKR ${(summary.totalReceivable).toLocaleString()}` : '—'}
          icon={DollarSign}
          color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
          loading={loadingSummary}
          sub={`${summary.totalChallans || 0} challans`}
        />
        <SummaryCard
          label="Collected"
          value={summary.totalCollected != null ? `PKR ${(summary.totalCollected).toLocaleString()}` : '—'}
          icon={TrendingUp}
          color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          loading={loadingSummary}
          sub={`${summary.paid || 0} paid`}
        />
        <SummaryCard
          label="Outstanding"
          value={summary.totalOutstanding != null ? `PKR ${(summary.totalOutstanding).toLocaleString()}` : '—'}
          icon={AlertCircle}
          color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
          loading={loadingSummary}
          sub={`${summary.unpaid || 0} unpaid`}
        />
        <SummaryCard
          label="Defaulters"
          value={summary.defaulters ?? '—'}
          icon={Users2}
          color="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
          loading={loadingSummary}
          sub={`${summary.overdue || 0} overdue`}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 gap-1">
        {[
          { id: 'challans', label: 'Challans' },
          { id: 'structures', label: 'Fee Structures' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Class filter */}
        <select
          value={filters.classId}
          onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
          className="px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Month filter (challans only) */}
        {activeTab === 'challans' && (
          <select
            value={filters.billingMonth}
            onChange={(e) => setFilters({ ...filters, billingMonth: e.target.value })}
            className="px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        )}

        {/* Status filter (challans only) */}
        {activeTab === 'challans' && (
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        )}

        {/* Search (challans only) */}
        {activeTab === 'challans' && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search student or challan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>

      {/* ── CHALLANS TAB ── */}
      {activeTab === 'challans' && (
        <Card className="!p-0 overflow-hidden">
          {loadingChallans ? (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredChallans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-surface-400">
              <DollarSign className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No challans found</p>
              <p className="text-sm mt-1">Generate challans or adjust your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Challan</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 hidden md:table-cell">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 hidden lg:table-cell">Month</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                  {filteredChallans.map((challan) => {
                    const cfg = STATUS_CONFIG[challan.status] || STATUS_CONFIG.unpaid;
                    const remaining = (challan.totalAmount || 0) - (challan.paidAmount || 0);
                    return (
                      <tr key={challan._id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-surface-700 dark:text-surface-300 whitespace-nowrap">
                          {challan.challanNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-surface-900 dark:text-white text-sm">{challan.student?.fullName || '—'}</p>
                          <p className="text-xs text-surface-400">{challan.student?.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-surface-700 dark:text-surface-300 text-xs">{challan.class?.name || '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-surface-700 dark:text-surface-300 text-xs">{challan.billingMonth}</td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-bold text-surface-900 dark:text-white text-sm">PKR {(challan.totalAmount || 0).toLocaleString()}</p>
                          {challan.paidAmount > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">+{challan.paidAmount.toLocaleString()} paid</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setPrintChallan(challan)}
                              title="Print Challan"
                              className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/60 text-primary-600 dark:text-primary-400 transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {(challan.status === 'unpaid' || challan.status === 'partial' || challan.status === 'overdue') && (
                              <button
                                onClick={() => setPayChallan(challan)}
                                title="Record Payment"
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            {challan.status !== 'paid' && challan.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Cancel this challan?')) cancelMutation.mutate(challan._id);
                                }}
                                title="Cancel Challan"
                                className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── FEE STRUCTURES TAB ── */}
      {activeTab === 'structures' && (
        <div className="space-y-3">
          {loadingStructures ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : structures.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <Settings className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No fee structures yet</p>
                <p className="text-sm mt-1">Create a fee structure to start generating challans</p>
                <button
                  onClick={() => { setEditStructure(null); setShowStructureModal(true); }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Fee Structure
                </button>
              </div>
            </Card>
          ) : (
            structures.map((s) => {
              const total = s.totalMonthlyFee || (
                (s.tuitionFee || 0) + (s.examFee || 0) + (s.libraryFee || 0) +
                (s.transportFee || 0) + (s.sportsFund || 0) + (s.computerFee || 0)
              );
              return (
                <Card key={s._id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                        <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-surface-900 dark:text-white">{s.class?.name || '—'}</h3>
                          <Badge variant={s.isActive ? 'success' : 'default'} size="sm">{s.isActive ? 'Active' : 'Inactive'}</Badge>
                          <span className="text-xs text-surface-500 dark:text-surface-400 font-mono">{s.academicYear}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-surface-600 dark:text-surface-400">
                          {s.tuitionFee > 0 && <span>Tuition: PKR {s.tuitionFee.toLocaleString()}</span>}
                          {s.transportFee > 0 && <span>Transport: PKR {s.transportFee.toLocaleString()}</span>}
                          {s.sportsFund > 0 && <span>Sports: PKR {s.sportsFund.toLocaleString()}</span>}
                          {s.computerFee > 0 && <span>Computer: PKR {s.computerFee.toLocaleString()}</span>}
                          {s.examFee > 0 && <span>Exam: PKR {s.examFee.toLocaleString()}</span>}
                          {s.libraryFee > 0 && <span>Library: PKR {s.libraryFee.toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-surface-500 dark:text-surface-400">Monthly Total</p>
                        <p className="text-base font-extrabold text-primary-600 dark:text-primary-400">PKR {total.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => { setEditStructure(s); setShowStructureModal(true); }}
                        className="px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Deactivate this fee structure?'))
                            deleteStructureMutation.mutate(s._id);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      {showGenerate && (
        <GenerateChallanModal
          onClose={() => setShowGenerate(false)}
          onSuccess={(result) => {
            alert(`✅ ${result?.message || 'Challans generated!'}`);
          }}
        />
      )}

      {showStructureModal && (
        <FeeStructureModal
          initialStructure={editStructure}
          onClose={() => { setShowStructureModal(false); setEditStructure(null); }}
          onSuccess={() => refetchStructures()}
        />
      )}

      {printChallan && (
        <ChallanPrintModal challan={printChallan} onClose={() => setPrintChallan(null)} />
      )}

      {payChallan && (
        <RecordPaymentModal
          challan={payChallan}
          onClose={() => setPayChallan(null)}
          onSuccess={() => refetchChallans()}
        />
      )}
    </div>
  );
};

export default AdminFeesPage;
