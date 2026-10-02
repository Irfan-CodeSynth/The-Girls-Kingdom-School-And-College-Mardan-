import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, CheckCircle2, AlertCircle, Clock, Printer,
  ChevronRight, CreditCard, Calendar,
} from 'lucide-react';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import feeApi from '../api/feeApi';
import ChallanPrintModal from '../components/ChallanPrintModal';

// ─── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', variant: 'warning', icon: Clock },
  paid: { label: 'Paid', variant: 'success', icon: CheckCircle2 },
  partial: { label: 'Partial', variant: 'info', icon: CreditCard },
  overdue: { label: 'Overdue', variant: 'danger', icon: AlertCircle },
  cancelled: { label: 'Cancelled', variant: 'default', icon: AlertCircle },
};

const formatMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
};

const StudentFeesPage = () => {
  const [printChallan, setPrintChallan] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myChallans'],
    queryFn: () => feeApi.getMyChallans(),
  });

  const challans = data?.challans || [];
  const summary = data?.summary || {};

  const outstanding = challans.filter(
    (c) => c.status === 'unpaid' || c.status === 'overdue' || c.status === 'partial'
  );
  const paid = challans.filter((c) => c.status === 'paid');
  const latestActive = outstanding[0] || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">My Fee Account</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          View your fee challans, payment history and print bank vouchers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card bodyClassName="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <><Skeleton className="h-6 w-20 mb-1" /><Skeleton className="h-3.5 w-16" /></>
            ) : (
              <>
                <p className="text-xl font-extrabold text-surface-900 dark:text-white">
                  PKR {(summary.totalOutstandingAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Total Outstanding</p>
              </>
            )}
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <><Skeleton className="h-6 w-12 mb-1" /><Skeleton className="h-3.5 w-20" /></>
            ) : (
              <>
                <p className="text-xl font-extrabold text-surface-900 dark:text-white">
                  {summary.outstanding || 0}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Pending Challans</p>
              </>
            )}
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4" className="col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <><Skeleton className="h-6 w-12 mb-1" /><Skeleton className="h-3.5 w-16" /></>
            ) : (
              <>
                <p className="text-xl font-extrabold text-surface-900 dark:text-white">
                  {paid.length}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">Paid Challans</p>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Active Challan Banner */}
      {!isLoading && latestActive && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 sm:p-6 shadow-md">
          <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-100 mb-1">
                {latestActive.status === 'overdue' ? '⚠ Overdue Payment' : 'Current Month Challan'}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                PKR {((latestActive.totalAmount || 0) - (latestActive.paidAmount || 0)).toLocaleString()}
              </h2>
              <p className="text-sm text-amber-100 mt-1">
                {formatMonth(latestActive.billingMonth)} · Due: {latestActive.dueDate ? new Date(latestActive.dueDate).toLocaleDateString('en-PK') : '—'}
              </p>
              <p className="text-xs text-amber-200 mt-0.5 font-mono">{latestActive.challanNumber}</p>
            </div>
            <button
              onClick={() => setPrintChallan(latestActive)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-700 font-bold text-sm shadow-md hover:bg-amber-50 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print Bank Challan
            </button>
          </div>
        </div>
      )}

      {/* All Challans */}
      <div>
        <h2 className="text-base font-bold text-surface-900 dark:text-white mb-3.5">
          All Challans
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : isError ? (
          <Card className="p-8">
            <EmptyState icon={AlertCircle} title="Failed to load challans" message="Please refresh and try again." />
          </Card>
        ) : challans.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={DollarSign}
              title="No Fee Challans Yet"
              message="Your fee challans will appear here once generated by the admin."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {challans.map((challan) => {
              const cfg = STATUS_CONFIG[challan.status] || STATUS_CONFIG.unpaid;
              const StatusIcon = cfg.icon;
              const remaining = (challan.totalAmount || 0) - (challan.paidAmount || 0);

              return (
                <div
                  key={challan._id}
                  className="rounded-xl border border-surface-200 dark:border-surface-700/80 bg-white dark:bg-surface-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200"
                >
                  {/* Left: info */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      challan.status === 'paid'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : challan.status === 'overdue'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    }`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-bold text-surface-900 dark:text-white text-sm">
                          {formatMonth(challan.billingMonth)}
                        </span>
                        <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                      </div>
                      <p className="text-xs font-mono text-surface-500 dark:text-surface-400">{challan.challanNumber}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-surface-500 dark:text-surface-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {challan.dueDate ? new Date(challan.dueDate).toLocaleDateString('en-PK') : '—'}
                        </span>
                        {challan.class?.name && <span>Class: {challan.class.name}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: amounts + action */}
                  <div className="flex items-center gap-4 shrink-0 sm:self-auto self-end">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-surface-900 dark:text-white">
                        PKR {(challan.totalAmount || 0).toLocaleString()}
                      </p>
                      {challan.paidAmount > 0 && challan.status !== 'paid' && (
                        <p className="text-xs text-rose-600 dark:text-rose-400">
                          Remaining: PKR {remaining.toLocaleString()}
                        </p>
                      )}
                      {challan.status === 'paid' && challan.paidAt && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Paid {new Date(challan.paidAt).toLocaleDateString('en-PK')}
                        </p>
                      )}
                    </div>

                    {challan.status !== 'cancelled' && (
                      <button
                        onClick={() => setPrintChallan(challan)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-primary-500" />
                        Print
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment instructions */}
      <Card className="bg-primary-50/50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/30">
        <h3 className="font-bold text-surface-900 dark:text-white mb-2">How to Pay</h3>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-surface-700 dark:text-surface-300">
          <li>Print your bank challan using the <strong>Print</strong> button above.</li>
          <li>Visit any branch of <strong>HBL, MCB, or UBL</strong> with the printed challan.</li>
          <li>Deposit the exact amount listed on the challan.</li>
          <li>Keep the <strong>Student Copy</strong> as proof of payment.</li>
          <li>Your fee status will be updated by the admin after confirmation.</li>
        </ol>
      </Card>

      {/* Print Modal */}
      {printChallan && (
        <ChallanPrintModal challan={printChallan} onClose={() => setPrintChallan(null)} />
      )}
    </div>
  );
};

export default StudentFeesPage;
