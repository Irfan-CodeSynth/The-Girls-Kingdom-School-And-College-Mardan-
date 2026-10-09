import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, Clock, CheckCircle2, Users2, Plus,
  Zap, UserCog, Printer, CreditCard, XCircle, RefreshCw,
  Search, Download, ThumbsUp,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
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
  approved:  { label: 'Approved', variant: 'default' },
  paid:      { label: 'Paid',     variant: 'success' },
  cancelled: { label: 'Cancelled',variant: 'default' },
};

const SummaryCard = ({ label, value, icon: Icon, color, sub, loading }) => (
  <div className="bg-white p-4.5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      {loading ? (
        <><Skeleton className="h-6 w-24 mb-1" /><Skeleton className="h-3.5 w-16" /></>
      ) : (
        <>
          <p className="font-serif text-lg sm:text-xl font-extrabold text-[#111827] leading-tight truncate">{value ?? '—'}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] truncate mt-0.5">{label}</p>
          {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  </div>
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

  const monthOptions = MONTHS.map((m, i) => ({ value: `${CURRENT_YEAR}-${m}`, label: `${MONTH_NAMES[i]} ${CURRENT_YEAR}` }));
  const handleRefresh = () => { refetchSummary(); refetchSlips(); refetchStructures(); };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Human Resources & Payroll
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Faculty Payroll & Compensation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4B5563]">
            Manage faculty salary structures, generate monthly payslips, and disburse compensation.
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
            leftIcon={<UserCog className="w-3.5 h-3.5 text-[#5A0D1A]" />}
          >
            Assign Salary
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowGenerate(true)}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Generate Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Monthly Payroll"
          value={summary.totalPayroll != null ? `PKR ${(summary.totalPayroll).toLocaleString()}` : '—'}
          icon={DollarSign}
          color="bg-gradient-to-br from-[#701422] to-[#4A0914] text-[#EEDAA2]"
          loading={loadingSummary}
          sub={`${summary.totalSlips || 0} slips`}
        />
        <SummaryCard
          label="Total Disbursed"
          value={summary.totalPaid != null ? `PKR ${(summary.totalPaid).toLocaleString()}` : '—'}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-700 border border-emerald-100"
          loading={loadingSummary}
          sub={`${summary.paid || 0} paid`}
        />
        <SummaryCard
          label="Pending Processing"
          value={summary.totalPending != null ? `PKR ${(summary.totalPending).toLocaleString()}` : '—'}
          icon={Clock}
          color="bg-amber-50 text-amber-700 border border-amber-100"
          loading={loadingSummary}
          sub={`${summary.draft || 0} draft, ${summary.approved || 0} approved`}
        />
        <SummaryCard
          label="Salaried Faculty"
          value={structures.length || summary.totalSlips || '—'}
          icon={Users2}
          color="bg-[#FAF8F5] text-[#5A0D1A] border border-[#EFE5E0]"
          loading={loadingStructures || loadingSummary}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE5E0] bg-white rounded-t-2xl px-2">
        {[{ id: 'slips', label: 'Monthly Payroll Register' }, { id: 'structures', label: 'Faculty Salary Structures' }].map((tab) => (
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
        {activeTab === 'slips' && (
          <>
            <select
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            >
              {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
            >
              <option value="">All Payroll Statuses</option>
              {Object.entries(STATUS_CFG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teacher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] placeholder:text-[#9CA3AF] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]"
              />
            </div>
            {summary.approved > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => { if (window.confirm(`Bulk mark all ${summary.approved} approved slips as PAID?`)) bulkDisburseMutation.mutate(); }}
                disabled={bulkDisburseMutation.isPending}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Bulk Disburse ({summary.approved})
              </Button>
            )}
          </>
        )}
      </div>

      {/* ── PAYROLL SLIPS TAB ── */}
      {activeTab === 'slips' && (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
          {loadingSlips ? (
            <div className="divide-y divide-[#EFE5E0]">
              {[1,2,3,4,5].map((i) => <div key={i} className="flex items-center gap-4 px-5 py-4"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-8 w-28 rounded-xl" /></div>)}
            </div>
          ) : filteredSlips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
              <DollarSign className="w-10 h-10 mb-3 text-[#5A0D1A]/30" />
              <p className="font-bold text-[#111827]">No Salary Slips Found</p>
              <p className="text-xs mt-1">Generate payroll slips for this month or adjust filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0]">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">Slip No.</th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">Faculty</th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#6B7280] hidden sm:table-cell">Gross</th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#6B7280] hidden md:table-cell">Deductions</th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-[#6B7280]">Net Pay</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">Status</th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE5E0]">
                  {filteredSlips.map((slip) => {
                    const cfg = STATUS_CFG[slip.status] || STATUS_CFG.draft;
                    return (
                      <tr key={slip._id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#5A0D1A] whitespace-nowrap">{slip.slipNumber}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-[#111827] text-sm">{slip.teacher?.fullName || '—'}</p>
                          <p className="text-xs text-[#6B7280]">{slip.teacher?.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right text-[#111827] hidden sm:table-cell text-xs font-semibold">PKR {(slip.grossSalary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right text-rose-600 hidden md:table-cell text-xs font-semibold">-PKR {(slip.totalDeductions || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#111827] text-sm">PKR {(slip.netSalary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-center"><Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setPrintSlip(slip)} title="Print Slip" className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#5A0D1A] transition-colors cursor-pointer border border-[#EFE5E0]">
                              <Printer className="w-4 h-4" />
                            </button>
                            {slip.status === 'draft' && (
                              <button onClick={() => { if (window.confirm('Approve this slip?')) approveMutation.mutate(slip._id); }} title="Approve" className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer border border-sky-200">
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                            )}
                            {(slip.status === 'draft' || slip.status === 'approved') && (
                              <button onClick={() => setDisburseSlip(slip)} title="Disburse" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200">
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            {slip.status !== 'paid' && slip.status !== 'cancelled' && (
                              <button onClick={() => { if (window.confirm('Cancel this slip?')) cancelMutation.mutate(slip._id); }} title="Cancel" className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer border border-rose-200">
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

      {/* ── SALARY STRUCTURES TAB ── */}
      {activeTab === 'structures' && (
        <div className="space-y-3">
          {loadingStructures ? (
            <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
          ) : structures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center shadow-xs">
              <UserCog className="w-10 h-10 mb-3 mx-auto text-[#5A0D1A]/30" />
              <p className="font-bold text-[#111827]">No Salary Structures Assigned</p>
              <p className="text-xs text-[#6B7280] mt-1">Assign salary packages to faculty members to enable payroll generation.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => { setEditStructure(null); setShowStructureModal(true); }}
              >
                Assign Faculty Salary
              </Button>
            </div>
          ) : (
            structures.map((s) => (
              <div key={s._id} className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif text-base font-bold text-[#111827]">{s.teacher?.fullName || 'Faculty Member'}</span>
                    <span className="text-xs text-[#6B7280]">({s.teacher?.department || 'Department'})</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[#6B7280] mt-1">
                    <span>Base: <strong className="text-[#111827]">PKR {s.baseSalary?.toLocaleString()}</strong></span>
                    {s.medicalAllowance > 0 && <span>Medical: <strong className="text-[#111827]">PKR {s.medicalAllowance?.toLocaleString()}</strong></span>}
                    {s.houseRentAllowance > 0 && <span>House Rent: <strong className="text-[#111827]">PKR {s.houseRentAllowance?.toLocaleString()}</strong></span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider font-bold text-[#6B7280]">Gross Monthly</p>
                    <p className="font-serif text-lg font-extrabold text-[#5A0D1A]">PKR {(s.grossSalary || s.baseSalary || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="xs" onClick={() => { setEditStructure(s); setShowStructureModal(true); }}>Edit</Button>
                    <Button variant="ghost" size="xs" className="text-rose-600 hover:bg-rose-50" onClick={() => { if (window.confirm('Delete this structure?')) deleteStructureMutation.mutate(s._id); }}>Delete</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showStructureModal && (
        <SalaryStructureModal isOpen={showStructureModal} onClose={() => { setShowStructureModal(false); setEditStructure(null); }} initialData={editStructure} onSuccess={() => { setShowStructureModal(false); setEditStructure(null); refetchStructures(); }} />
      )}
      {showGenerate && (
        <GeneratePayrollModal isOpen={showGenerate} onClose={() => setShowGenerate(false)} defaultMonth={billingMonth} onSuccess={() => { setShowGenerate(false); refetchSlips(); refetchSummary(); }} />
      )}
      {disburseSlip && (
        <DisburseModal isOpen={Boolean(disburseSlip)} onClose={() => setDisburseSlip(null)} slip={disburseSlip} onSuccess={() => { setDisburseSlip(null); refetchSlips(); refetchSummary(); }} />
      )}
      {printSlip && (
        <SalarySlipPrintModal isOpen={Boolean(printSlip)} onClose={() => setPrintSlip(null)} slip={slipDetailData?.slip || printSlip} />
      )}
    </div>
  );
};

export default AdminSalaryPage;
