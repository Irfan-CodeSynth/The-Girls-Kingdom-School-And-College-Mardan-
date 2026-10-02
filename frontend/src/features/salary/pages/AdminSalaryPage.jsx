import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, Clock, CheckCircle2, Users2, Plus,
  Zap, UserCog, Printer, CreditCard, XCircle, RefreshCw,
  Search, Download, ThumbsUp,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import salaryApi from '../api/salaryApi';
import SalaryStructureModal from '../components/SalaryStructureModal';
import GeneratePayrollModal from '../components/GeneratePayrollModal';
import DisburseModal from '../components/DisburseModal';
import SalarySlipPrintModal from '../components/SalarySlipPrintModal';

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_CFG = {
  draft:     { label: 'Draft',    variant: 'warning' },
  approved:  { label: 'Approved', variant: 'info' },
  paid:      { label: 'Paid',     variant: 'success' },
  cancelled: { label: 'Cancelled',variant: 'default' },
};

const SummaryCard = ({ label, value, icon: Icon, color, sub, loading }) => (
  <Card bodyClassName="flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      {loading ? (
        <><Skeleton className="h-6 w-24 mb-1" /><Skeleton className="h-3.5 w-16" /></>
      ) : (
        <>
          <p className="text-lg sm:text-xl font-extrabold text-surface-900 dark:text-white leading-tight truncate">{value ?? '—'}</p>
          <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
          {sub && <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  </Card>
);

const AdminSalaryPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('slips');
  const [billingMonth, setBillingMonth] = useState(`${CURRENT_YEAR}-${String(new Date().getMonth() + 1).padStart(2,'0')}`);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showGenerate, setShowGenerate] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editStructure, setEditStructure] = useState(null);
  const [printSlip, setPrintSlip] = useState(null);
  const [disburseSlip, setDisburseSlip] = useState(null);

  const { data: summaryData, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['payrollSummary', billingMonth],
    queryFn: () => salaryApi.getPayrollSummary({ billingMonth }),
  });

  const { data: slipsData, isLoading: loadingSlips, refetch: refetchSlips } = useQuery({
    queryKey: ['salarySlips', billingMonth, statusFilter],
    queryFn: () => salaryApi.getSlips({ billingMonth: billingMonth || undefined, status: statusFilter || undefined }),
    enabled: activeTab === 'slips',
  });

  const { data: structuresData, isLoading: loadingStructures, refetch: refetchStructures } = useQuery({
    queryKey: ['salaryStructures'],
    queryFn: () => salaryApi.getSalaryStructures(),
    enabled: activeTab === 'structures',
  });

  const { data: slipDetailData } = useQuery({
    queryKey: ['salarySlipDetail', printSlip?._id],
    queryFn: () => salaryApi.getSlipById(printSlip._id),
    enabled: Boolean(printSlip?._id),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => salaryApi.approveSlip(id),
    onSuccess: () => { refetchSlips(); refetchSummary(); },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => salaryApi.cancelSlip(id),
    onSuccess: () => { refetchSlips(); refetchSummary(); },
  });

  const bulkDisburseMutation = useMutation({
    mutationFn: () => salaryApi.bulkDisburse({ billingMonth, paymentMethod: 'bank_transfer' }),
    onSuccess: (result) => { refetchSlips(); refetchSummary(); alert(`✅ ${result?.message}`); },
  });

  const deleteStructureMutation = useMutation({
    mutationFn: (id) => salaryApi.deleteSalaryStructure(id),
    onSuccess: () => refetchStructures(),
  });

  const summary = summaryData?.summary || {};
  const slips = slipsData?.slips || [];
  const structures = structuresData?.salaryStructures || [];

  const filteredSlips = slips.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.slipNumber?.toLowerCase().includes(q) ||
      s.teacher?.fullName?.toLowerCase().includes(q)
    );
  });

  // Build month select options
  const monthOptions = MONTHS.map((m, i) => ({ value: `${CURRENT_YEAR}-${m}`, label: `${MONTH_NAMES[i]} ${CURRENT_YEAR}` }));

  const handleRefresh = () => { refetchSummary(); refetchSlips(); refetchStructures(); };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">Payroll Management</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Manage faculty compensation, generate slips, and disburse salaries</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleRefresh} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => { setEditStructure(null); setShowStructureModal(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:brightness-95 cursor-pointer">
            <UserCog className="w-3.5 h-3.5" /> Assign Salary
          </button>
          <button onClick={() => setShowGenerate(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm cursor-pointer">
            <Zap className="w-3.5 h-3.5" /> Generate Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard label="Monthly Payroll" value={summary.totalPayroll != null ? `PKR ${(summary.totalPayroll).toLocaleString()}` : '—'} icon={DollarSign} color="bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400" loading={loadingSummary} sub={`${summary.totalSlips || 0} slips`} />
        <SummaryCard label="Disbursed" value={summary.totalPaid != null ? `PKR ${(summary.totalPaid).toLocaleString()}` : '—'} icon={TrendingUp} color="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" loading={loadingSummary} sub={`${summary.paid || 0} paid`} />
        <SummaryCard label="Pending" value={summary.totalPending != null ? `PKR ${(summary.totalPending).toLocaleString()}` : '—'} icon={Clock} color="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400" loading={loadingSummary} sub={`${summary.draft || 0} draft, ${summary.approved || 0} approved`} />
        <SummaryCard label="Total Faculty" value={structures.length || summary.totalSlips || '—'} icon={Users2} color="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400" loading={loadingStructures || loadingSummary} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 gap-1">
        {[{ id: 'slips', label: 'Monthly Payroll' }, { id: 'structures', label: 'Salary Structures' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === tab.id ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {activeTab === 'slips' && (
          <>
            <select value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} className="px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CFG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input type="text" placeholder="Search teacher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {summary.approved > 0 && (
              <button
                onClick={() => { if (window.confirm(`Bulk mark all ${summary.approved} approved slips as PAID?`)) bulkDisburseMutation.mutate(); }}
                disabled={bulkDisburseMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" /> Bulk Disburse ({summary.approved})
              </button>
            )}
          </>
        )}
      </div>

      {/* ── PAYROLL SLIPS TAB ── */}
      {activeTab === 'slips' && (
        <Card className="!p-0 overflow-hidden">
          {loadingSlips ? (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {[1,2,3,4,5].map((i) => <div key={i} className="flex items-center gap-4 px-5 py-4"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-8 w-28 rounded-xl" /></div>)}
            </div>
          ) : filteredSlips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-surface-400">
              <DollarSign className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No salary slips found</p>
              <p className="text-sm mt-1">Generate payroll or adjust your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Slip No.</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Faculty</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 hidden sm:table-cell">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 hidden md:table-cell">Deductions</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Net Pay</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                  {filteredSlips.map((slip) => {
                    const cfg = STATUS_CFG[slip.status] || STATUS_CFG.draft;
                    return (
                      <tr key={slip._id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-surface-600 dark:text-surface-400 whitespace-nowrap">{slip.slipNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-surface-900 dark:text-white">{slip.teacher?.fullName || '—'}</p>
                          <p className="text-xs text-surface-400">{slip.teacher?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-surface-700 dark:text-surface-300 hidden sm:table-cell">PKR {(slip.grossSalary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 hidden md:table-cell">-PKR {(slip.totalDeductions || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-surface-900 dark:text-white">PKR {(slip.netSalary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setPrintSlip(slip)} title="Print Slip" className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/60 text-primary-600 dark:text-primary-400 cursor-pointer">
                              <Printer className="w-4 h-4" />
                            </button>
                            {slip.status === 'draft' && (
                              <button onClick={() => { if (window.confirm('Approve this slip?')) approveMutation.mutate(slip._id); }} title="Approve" className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sky-600 dark:text-sky-400 cursor-pointer">
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                            )}
                            {(slip.status === 'draft' || slip.status === 'approved') && (
                              <button onClick={() => setDisburseSlip(slip)} title="Disburse" className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 cursor-pointer">
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            {slip.status !== 'paid' && slip.status !== 'cancelled' && (
                              <button onClick={() => { if (window.confirm('Cancel this slip?')) cancelMutation.mutate(slip._id); }} title="Cancel" className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 cursor-pointer">
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

      {/* ── SALARY STRUCTURES TAB ── */}
      {activeTab === 'structures' && (
        <div className="space-y-3">
          {loadingStructures ? (
            <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
          ) : structures.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <UserCog className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No salary structures configured</p>
                <p className="text-sm mt-1">Assign salary packages to faculty to start generating payroll</p>
                <button onClick={() => { setEditStructure(null); setShowStructureModal(true); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer">
                  <Plus className="w-4 h-4" /> Assign Salary
                </button>
              </div>
            </Card>
          ) : (
            structures.map((s) => (
              <Card key={s._id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                      <UserCog className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-surface-900 dark:text-white">{s.teacher?.fullName || '—'}</h3>
                        <Badge variant={s.isActive ? 'success' : 'default'} size="sm">{s.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{s.designation} · {s.department}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-surface-600 dark:text-surface-400">
                        <span>Basic: PKR {(s.basicSalary || 0).toLocaleString()}</span>
                        <span>Gross: PKR {(s.grossSalary || 0).toLocaleString()}</span>
                        <span className="text-rose-600 dark:text-rose-400">Deductions: PKR {(s.totalDeductions || 0).toLocaleString()}</span>
                        {s.bankName && <span className="text-sky-600 dark:text-sky-400">Bank: {s.bankName}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-surface-500 dark:text-surface-400">Net Payable</p>
                      <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">PKR {(s.netSalary || 0).toLocaleString()}</p>
                    </div>
                    <button onClick={() => { setEditStructure(s); setShowStructureModal(true); }} className="px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer">Edit</button>
                    <button onClick={() => { if (window.confirm('Deactivate this salary structure?')) deleteStructureMutation.mutate(s._id); }} className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer">Deactivate</button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showGenerate && <GeneratePayrollModal onClose={() => setShowGenerate(false)} onSuccess={(r) => alert(`✅ ${r?.message}`)} />}
      {showStructureModal && <SalaryStructureModal initial={editStructure} onClose={() => { setShowStructureModal(false); setEditStructure(null); }} onSuccess={() => refetchStructures()} />}
      {disburseSlip && <DisburseModal slip={disburseSlip} onClose={() => setDisburseSlip(null)} onSuccess={() => refetchSlips()} />}
      {printSlip && slipDetailData && (
        <SalarySlipPrintModal slip={slipDetailData.slip} amountInWords={slipDetailData.amountInWords} onClose={() => setPrintSlip(null)} />
      )}
    </div>
  );
};

export default AdminSalaryPage;
