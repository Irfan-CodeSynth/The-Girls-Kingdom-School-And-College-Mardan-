import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

const SCHOOL_NAME = 'The Girls Kingdom School & College Mardan';
const BANK_NAME = 'HBL / MCB / UBL (Any Branch)';
const ACCOUNT_TITLE = 'Girls Kingdom Education Trust';
const ACCOUNT_NUMBER = 'PKR-SCHOOL-TRUST-001';

/** Format a YYYY-MM string to "October 2026" */
const formatMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (n) =>
  `PKR ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;

const FeeRow = ({ label, amount }) => {
  if (!amount || Number(amount) === 0) return null;
  return (
    <tr className="border-b border-gray-200">
      <td className="py-0.5 text-[11px] text-gray-700">{label}</td>
      <td className="py-0.5 text-[11px] text-gray-900 text-right font-medium">
        {formatCurrency(amount)}
      </td>
    </tr>
  );
};

/** Single copy (column) of the bank challan slip */
const ChallanSlip = ({ challan, copyLabel }) => {
  const student = challan.student || {};
  const cls = challan.class || {};
  const total = challan.totalAmount || 0;
  const paid = challan.paidAmount || 0;
  const due = total - paid;

  return (
    <div
      className="challan-slip border-2 border-gray-400 rounded-sm p-3 flex flex-col justify-between"
      style={{ minHeight: '420px', width: '100%', breakInside: 'avoid' }}
    >
      {/* Header */}
      <div>
        <div className="text-center border-b-2 border-gray-400 pb-2 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {copyLabel}
          </div>
          <div className="text-[13px] font-extrabold text-gray-900 leading-tight mt-0.5">
            {SCHOOL_NAME}
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">Monthly Fee Challan</div>
        </div>

        {/* Challan meta */}
        <table className="w-full text-[11px] mb-2">
          <tbody>
            <tr>
              <td className="text-gray-500 w-1/2">Challan No.</td>
              <td className="font-bold text-gray-900 font-mono">{challan.challanNumber}</td>
            </tr>
            <tr>
              <td className="text-gray-500">Student</td>
              <td className="font-semibold text-gray-900 truncate max-w-[120px]">
                {student.fullName || '—'}
              </td>
            </tr>
            <tr>
              <td className="text-gray-500">Class</td>
              <td className="text-gray-800">{cls.name || '—'}</td>
            </tr>
            <tr>
              <td className="text-gray-500">Month</td>
              <td className="text-gray-800">{formatMonth(challan.billingMonth)}</td>
            </tr>
            <tr>
              <td className="text-gray-500">Due Date</td>
              <td className="text-gray-800">
                {challan.dueDate
                  ? new Date(challan.dueDate).toLocaleDateString('en-PK')
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Fee breakdown */}
        <div className="border-t border-gray-300 pt-1">
          <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">
            Fee Breakdown
          </div>
          <table className="w-full">
            <tbody>
              <FeeRow label="Tuition Fee" amount={challan.tuitionFee} />
              <FeeRow label="Admission Fee" amount={challan.admissionFee} />
              <FeeRow label="Exam Fee" amount={challan.examFee} />
              <FeeRow label="Library Fee" amount={challan.libraryFee} />
              <FeeRow label="Transport / Bus Fee" amount={challan.transportFee} />
              <FeeRow label="Sports Fund" amount={challan.sportsFund} />
              <FeeRow label="Computer Fee" amount={challan.computerFee} />
              <FeeRow label="Late Surcharge" amount={challan.lateSurcharge} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div>
        <div className="border-t-2 border-gray-400 mt-2 pt-2 flex justify-between items-center">
          <span className="text-[12px] font-bold uppercase text-gray-700">Total Payable</span>
          <span className="text-[14px] font-extrabold text-gray-900">
            {formatCurrency(due)}
          </span>
        </div>

        {/* Bank info */}
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2">
          <div className="text-[10px] text-gray-500 font-semibold uppercase mb-0.5">
            Bank Details
          </div>
          <div className="text-[10px] text-gray-700">{BANK_NAME}</div>
          <div className="text-[10px] text-gray-700">A/C: {ACCOUNT_TITLE}</div>
          <div className="text-[10px] font-mono text-gray-900">{ACCOUNT_NUMBER}</div>
        </div>

        {/* Signature block */}
        <div className="flex justify-between items-end mt-3 text-[10px] text-gray-400">
          <div className="border-t border-gray-300 w-20 text-center pt-0.5">Bank Stamp</div>
          <div className="border-t border-gray-300 w-20 text-center pt-0.5">Signature</div>
        </div>
      </div>
    </div>
  );
};

/** Main printable challan modal */
const ChallanPrintModal = ({ challan, onClose }) => {
  const printRef = useRef();

  if (!challan) return null;

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Challan – ${challan.challanNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: white; }
            .print-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              padding: 16px;
            }
            .challan-slip {
              border: 2px solid #9ca3af;
              border-radius: 2px;
              padding: 12px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: 420px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 1px 2px; font-size: 11px; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #d1d5db; }
            .border-t-2 { border-top: 2px solid #9ca3af; }
            .border-b-2 { border-bottom: 2px solid #9ca3af; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .font-semibold { font-weight: 600; }
            .font-mono { font-family: monospace; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .print-grid { grid-template-columns: repeat(3, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="print-grid">
            ${printRef.current.innerHTML}
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Bank Challan — {challan.challanNumber}
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              3-copy bank voucher · {formatMonth(challan.billingMonth)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print 3 Copies
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Copy Challan Preview */}
        <div className="p-5">
          <div ref={printRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChallanSlip challan={challan} copyLabel="Bank Copy" />
            <ChallanSlip challan={challan} copyLabel="Student Copy" />
            <ChallanSlip challan={challan} copyLabel="School Copy" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanPrintModal;
