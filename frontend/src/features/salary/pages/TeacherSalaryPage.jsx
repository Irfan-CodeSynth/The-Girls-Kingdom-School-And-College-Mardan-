import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, CheckCircle2, Clock, CreditCard, Printer,
  Building2, Calendar, AlertCircle, Banknote,
} from 'lucide-react';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import salaryApi from '../api/salaryApi';
import SalarySlipPrintModal from '../components/SalarySlipPrintModal';

const STATUS_CFG = {
  draft:     { label: 'Draft',    variant: 'warning',  icon: Clock },
  approved:  { label: 'Approved', variant: 'info',     icon: CheckCircle2 },
  paid:      { label: 'Paid',     variant: 'success',  icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',variant: 'default',  icon: AlertCircle },
};

const formatMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-PK', { month: 'long', year: 'numeric' });
};

const TeacherSalaryPage = () => {
  const [printSlipId, setPrintSlipId] = useState(null);

  const { data: slipsData, isLoading: loadingSlips, isError } = useQuery({
    queryKey: ['mySlips'],
    queryFn: () => salaryApi.getMySlips(),
  });

  const { data: structureData, isLoading: loadingStructure } = useQuery({
    queryKey: ['myStructure'],
    queryFn: () => salaryApi.getMySalaryStructure(),
  });

  const { data: slipDetailData } = useQuery({
    queryKey: ['salarySlipDetail', printSlipId],
    queryFn: () => salaryApi.getSlipById(printSlipId),
    enabled: Boolean(printSlipId),
  });

  const slips = slipsData?.slips || [];
  const totalPaid = slipsData?.totalPaid || 0;
  const structure = structureData?.salaryStructure;

  const latestUnpaid = slips.find((s) => s.status === 'approved' || s.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">My Salary & Pay Slips</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          View your monthly pay slips, salary breakdown, and print official vouchers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card bodyClassName="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            {loadingStructure ? <><Skeleton className="h-6 w-20 mb-1" /><Skeleton className="h-3.5 w-16" /></> : (
              <>
                <p className="text-xl font-extrabold text-surface-900 dark:text-white">
                  PKR {(structure?.netSalary || 0).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Monthly Net Salary</p>
              </>
            )}
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            {loadingSlips ? <><Skeleton className="h-6 w-20 mb-1" /><Skeleton className="h-3.5 w-16" /></> : (
              <>
                <p className="text-xl font-extrabold text-surface-900 dark:text-white">
                  PKR {totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Total Salary Received</p>
              </>
            )}
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4" className="col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            {loadingSlips ? <><Skeleton className="h-6 w-10 mb-1" /><Skeleton className="h-3.5 w-20" /></> : (
              <>
                <p className="text-xl font-extrabold text-surface-900 dark:text-white">{slips.filter((s) => s.status === 'paid').length}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Paid Slips</p>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Current Compensation Structure */}
      {!loadingStructure && structure && (
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-bold text-surface-900 dark:text-white">My Salary Package</h3>
                <Badge variant="success" dot size="sm">Active</Badge>
                <span className="text-xs text-surface-500 dark:text-surface-400">{structure.designation} · {structure.department}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Basic Salary</p><p className="font-semibold text-surface-900 dark:text-white">PKR {(structure.basicSalary||0).toLocaleString()}</p></div>
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Allowances</p><p className="font-semibold text-surface-900 dark:text-white">PKR {((structure.houseRentAllowance||0)+(structure.medicalAllowance||0)+(structure.transportAllowance||0)+(structure.specialAllowance||0)).toLocaleString()}</p></div>
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Deductions</p><p className="font-semibold text-rose-600 dark:text-rose-400">PKR {(structure.totalDeductions||0).toLocaleString()}</p></div>
                <div><p className="text-xs text-surface-500 dark:text-surface-400">Net Payable</p><p className="font-bold text-emerald-600 dark:text-emerald-400">PKR {(structure.netSalary||0).toLocaleString()}</p></div>
              </div>
              {structure.bankName && (
                <div className="mt-3 p-2.5 rounded-xl bg-surface-50 dark:bg-surface-700/50 text-xs text-surface-600 dark:text-surface-400 flex flex-wrap gap-4">
                  <span>Bank: <strong>{structure.bankName}</strong></span>
                  <span>A/C Title: <strong>{structure.accountTitle || '—'}</strong></span>
                  <span className="font-mono">IBAN: <strong>{structure.iban || structure.accountNumber || '—'}</strong></span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Latest Pending Slip Banner */}
      {!loadingSlips && latestUnpaid && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-sky-700 text-white p-5 sm:p-6 shadow-md">
          <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary-100 mb-1">
                {latestUnpaid.status === 'approved' ? '✅ Ready for Disbursement' : '⏳ Slip Pending Approval'}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                PKR {(latestUnpaid.netSalary || 0).toLocaleString()}
              </h2>
              <p className="text-sm text-primary-200 mt-1">{formatMonth(latestUnpaid.billingMonth)} · {latestUnpaid.slipNumber}</p>
            </div>
            <button
              onClick={() => setPrintSlipId(latestUnpaid._id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-700 font-bold text-sm shadow-md hover:bg-primary-50 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print Salary Slip
            </button>
          </div>
        </div>
      )}

      {/* Slips History */}
      <div>
        <h2 className="text-base font-bold text-surface-900 dark:text-white mb-3.5">Pay Slip History</h2>

        {loadingSlips ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
        ) : isError ? (
          <Card className="p-8"><EmptyState icon={AlertCircle} title="Failed to load slips" message="Please refresh." /></Card>
        ) : slips.length === 0 ? (
          <Card className="p-8"><EmptyState icon={DollarSign} title="No Salary Slips Yet" message="Your monthly salary slips will appear here once generated by admin." /></Card>
        ) : (
          <div className="space-y-3">
            {slips.map((slip) => {
              const cfg = STATUS_CFG[slip.status] || STATUS_CFG.draft;
              const StatusIcon = cfg.icon;
              return (
                <div key={slip._id} className="rounded-xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${slip.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : slip.status === 'approved' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-bold text-surface-900 dark:text-white text-sm">{formatMonth(slip.billingMonth)}</span>
                        <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                      </div>
                      <p className="text-xs font-mono text-surface-500 dark:text-surface-400">{slip.slipNumber}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Paid Days: {slip.paidDays}/{slip.totalWorkingDays}</span>
                        {slip.paidAt && <span>Disbursed: {new Date(slip.paidAt).toLocaleDateString('en-PK')}</span>}
                        {slip.paymentMethod && <span>via {slip.paymentMethod.replace('_', ' ')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-surface-900 dark:text-white">PKR {(slip.netSalary || 0).toLocaleString()}</p>
                      {slip.bonus > 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400">+PKR {slip.bonus.toLocaleString()} bonus</p>}
                    </div>
                    {slip.status !== 'cancelled' && (
                      <button onClick={() => setPrintSlipId(slip._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer">
                        <Printer className="w-3.5 h-3.5 text-primary-500" /> Print
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Print Modal */}
      {printSlipId && slipDetailData && (
        <SalarySlipPrintModal slip={slipDetailData.slip} amountInWords={slipDetailData.amountInWords} onClose={() => setPrintSlipId(null)} />
      )}
    </div>
  );
};

export default TeacherSalaryPage;
