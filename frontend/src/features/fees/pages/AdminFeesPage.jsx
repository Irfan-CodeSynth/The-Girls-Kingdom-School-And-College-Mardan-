import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, AlertCircle, Users2, Plus, Zap,
  Settings, Printer, CreditCard, XCircle, RefreshCw, Search,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
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
  partial: { label: 'Partial', variant: 'default' },
  overdue: { label: 'Overdue', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

// ─── Summary card ──────────────────────────────────────────────
const SummaryCard = ({ label, value, icon: Icon, color, loading, sub }) => (
  <div className="bg-white p-4.5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${color}`}>
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
          <p className="font-serif text-lg sm:text-xl font-extrabold text-[#111827] leading-tight truncate">
            {value ?? '—'}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] truncate mt-0.5">{label}</p>
          {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  </div>
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
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Treasury & Tuition
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Fee & Challan Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4B5563]">
            Configure academic fee structures, generate monthly challans, and reconcile student payments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditStructure(null); setShowStructureModal(true); }}
            leftIcon={<Settings className="w-3.5 h-3.5 text-[#5A0D1A]" />}
          >
            Fee Structure
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowGenerate(true)}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Generate Challans
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Receivable"
          value={summary.totalReceivable != null ? `PKR ${(summary.totalReceivable).toLocaleString()}` : '—'}
          icon={DollarSign}
          color="bg-gradient-to-br from-[#701422] to-[#4A0914] text-[#EEDAA2]"
          loading={loadingSummary}
          sub={`${summary.totalChallans || 0} challans`}
        />
        <SummaryCard
          label="Total Collected"
          value={summary.totalCollected != null ? `PKR ${(summary.totalCollected).toLocaleString()}` : '—'}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-700 border border-emerald-100"
          loading={loadingSummary}
          sub={`${summary.paid || 0} paid`}
        />
        <SummaryCard
          label="Outstanding"
          value={summary.totalOutstanding != null ? `PKR ${(summary.totalOutstanding).toLocaleString()}` : '—'}
          icon={AlertCircle}
          color="bg-amber-50 text-amber-700 border border-amber-100"
          loading={loadingSummary}
          sub={`${summary.unpaid || 0} unpaid`}
        />
        <SummaryCard
          label="Defaulters"
          value={summary.defaulters ?? '—'}
          icon={Users2}
          color="bg-rose-50 text-rose-700 border border-rose-100"
          loading={loadingSummary}
          sub={`${summary.overdue || 0} overdue`}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE5E0] bg-white rounded-t-2xl px-2">
        {[
          { id: 'challans', label: 'Billing Challans' },
          { id: 'structures', label: 'Class Fee Structures' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? 'text-[#5A0D1A]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A0D1A]" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#EFE5E0] shadow-xs">
        {/* Class filter */}
        <select
          value={filters.classId}
          onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
          className="px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
        >
          <option value="">All Academic Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Month filter (challans only) */}
        {activeTab === 'challans' && (
          <select
            value={filters.billingMonth}
            onChange={(e) => setFilters({ ...filters, billingMonth: e.target.value })}
            className="px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
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
            className="px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
          >
            <option value="">All Payment Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        )}

        {/* Search (challans only) */}
        {activeTab === 'challans' && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or challan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] placeholder:text-[#9CA3AF] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            />
          </div>
        )}
      </div>

      {/* ── CHALLANS TAB ── */}
      {activeTab === 'challans' && (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
          {loadingChallans ? (
            <div className="divide-y divide-[#EFE5E0]">
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
            <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
              <DollarSign className="w-10 h-10 mb-3 text-[#5A0D1A]/30" />
              <p className="font-bold text-[#111827]">No Challans Found</p>
              <p className="text-xs mt-1">Generate fee challans or adjust your active filters above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0]">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">Challan #</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">Student</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280] hidden md:table-cell">Class</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280] hidden lg:table-cell">Month</th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#6B7280]">Amount</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">Status</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE5E0]">
                  {filteredChallans.map((challan) => {
                    const cfg = STATUS_CONFIG[challan.status] || STATUS_CONFIG.unpaid;
                    return (
                      <tr key={challan._id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#5A0D1A] whitespace-nowrap">
                          {challan.challanNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-[#111827] text-sm">{challan.student?.fullName || '—'}</p>
                          <p className="text-xs text-[#6B7280]">{challan.student?.email}</p>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell text-[#111827] text-xs font-semibold">{challan.class?.name || '—'}</td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-[#6B7280] text-xs">{challan.billingMonth}</td>
                        <td className="px-4 py-3.5 text-right">
                          <p className="font-bold text-[#111827] text-sm">PKR {(challan.totalAmount || 0).toLocaleString()}</p>
                          {challan.paidAmount > 0 && (
                            <p className="text-xs text-emerald-600 font-semibold">+{challan.paidAmount.toLocaleString()} paid</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setPrintChallan(challan)}
                              title="Print Challan"
                              className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A0D1A] transition-colors cursor-pointer border border-[#EFE5E0]"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {(challan.status === 'unpaid' || challan.status === 'partial' || challan.status === 'overdue') && (
                              <button
                                onClick={() => setPayChallan(challan)}
                                title="Record Payment"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
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
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer border border-rose-200"
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
        </div>
      )}

      {/* ── FEE STRUCTURES TAB ── */}
      {activeTab === 'structures' && (
        <div className="space-y-3">
          {loadingStructures ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : structures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center shadow-xs">
              <Settings className="w-10 h-10 mb-3 mx-auto text-[#5A0D1A]/30" />
              <p className="font-bold text-[#111827]">No Fee Structures Configured</p>
              <p className="text-xs text-[#6B7280] mt-1">Create a fee structure to start generating class challans.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => { setEditStructure(null); setShowStructureModal(true); }}
              >
                Create Fee Structure
              </Button>
            </div>
          ) : (
            structures.map((s) => {
              const total = s.totalMonthlyFee || (
                (s.tuitionFee || 0) + (s.examFee || 0) + (s.labFee || 0) + (s.libraryFee || 0) + (s.miscellaneousFee || 0)
              );
              return (
                <div key={s._id} className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-base font-bold text-[#111827]">{s.class?.name || 'Class Structure'}</span>
                      <span className="text-xs text-[#6B7280] font-mono">({s.academicYear})</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-[#6B7280] mt-2">
                      <span>Tuition: <strong className="text-[#111827]">PKR {s.tuitionFee?.toLocaleString()}</strong></span>
                      {s.examFee > 0 && <span>Exam: <strong className="text-[#111827]">PKR {s.examFee?.toLocaleString()}</strong></span>}
                      {s.labFee > 0 && <span>Lab: <strong className="text-[#111827]">PKR {s.labFee?.toLocaleString()}</strong></span>}
                      {s.libraryFee > 0 && <span>Library: <strong className="text-[#111827]">PKR {s.libraryFee?.toLocaleString()}</strong></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider font-bold text-[#6B7280]">Total Monthly</p>
                      <p className="font-serif text-lg font-extrabold text-[#5A0D1A]">PKR {total.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => { setEditStructure(s); setShowStructureModal(true); }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          if (window.confirm('Delete this fee structure?')) deleteStructureMutation.mutate(s._id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      {printChallan && (
        <ChallanPrintModal
          isOpen={Boolean(printChallan)}
          onClose={() => setPrintChallan(null)}
          challan={printChallan}
        />
      )}
      {payChallan && (
        <RecordPaymentModal
          isOpen={Boolean(payChallan)}
          onClose={() => setPayChallan(null)}
          challan={payChallan}
          onSuccess={() => {
            setPayChallan(null);
            refetchChallans();
            refetchSummary();
          }}
        />
      )}
      {showGenerate && (
        <GenerateChallanModal
          isOpen={showGenerate}
          onClose={() => setShowGenerate(false)}
          classes={classes}
          onSuccess={() => {
            setShowGenerate(false);
            refetchChallans();
            refetchSummary();
          }}
        />
      )}
      {showStructureModal && (
        <FeeStructureModal
          isOpen={showStructureModal}
          onClose={() => { setShowStructureModal(false); setEditStructure(null); }}
          classes={classes}
          initialData={editStructure}
          onSuccess={() => {
            setShowStructureModal(false);
            setEditStructure(null);
            refetchStructures();
          }}
        />
      )}
    </div>
  );
};

export default AdminFeesPage;
