import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

const SCHOOL_NAME = 'The Girls Kingdom School & College Mardan';
const SCHOOL_ADDRESS = 'Main Road, Mardan, Khyber Pakhtunkhwa, Pakistan';

const formatMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
};

const fmt = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;

const Row = ({ label, value, bold }) => (
  <tr className="border-b border-gray-200">
    <td className={`py-1 pr-4 text-[11px] ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
      {label}
    </td>
    <td className={`py-1 text-right text-[11px] ${bold ? 'font-bold text-gray-900' : 'text-gray-800'}`}>
      {fmt(value)}
    </td>
  </tr>
);

const SalarySlipPrintModal = ({ slip, amountInWords, onClose }) => {
  const printRef = useRef();

  if (!slip) return null;

  const teacher = slip.teacher || {};

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=800,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Slip – ${slip.slipNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: white; padding: 24px; }
            .slip-container { max-width: 720px; margin: 0 auto; border: 2px solid #374151; }
            .header { text-align: center; background: #1e3a5f; color: white; padding: 16px 12px; }
            .header h1 { font-size: 15px; font-weight: 800; }
            .header p { font-size: 10px; margin-top: 4px; opacity: 0.85; }
            .title-bar { background: #f3f4f6; text-align: center; padding: 6px; font-size: 12px; font-weight: 700; border-bottom: 1px solid #d1d5db; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid #d1d5db; }
            .meta-cell { padding: 6px 10px; border-right: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
            .meta-label { color: #6b7280; font-size: 10px; }
            .meta-value { font-weight: 600; color: #111827; margin-top: 1px; }
            .body-grid { display: grid; grid-template-columns: 1fr 1fr; }
            .col { padding: 10px; border-right: 1px solid #d1d5db; }
            .col:last-child { border-right: none; }
            .col-header { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 4px; font-size: 11px; }
            .total-row { border-top: 2px solid #374151; font-weight: 800; font-size: 12px; }
            .net-bar { background: #1e3a5f; color: white; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
            .net-bar .label { font-size: 12px; font-weight: 700; text-transform: uppercase; }
            .net-bar .amount { font-size: 18px; font-weight: 900; }
            .words-bar { background: #f9fafb; padding: 8px 16px; font-size: 10px; color: #374151; border-top: 1px solid #e5e7eb; }
            .sig-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border-top: 1px solid #d1d5db; }
            .sig-cell { padding: 24px 12px 12px; text-align: center; font-size: 10px; color: #6b7280; border-right: 1px solid #e5e7eb; }
            .sig-cell:last-child { border-right: none; }
            .sig-line { border-top: 1px solid #9ca3af; margin-bottom: 4px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Salary Slip — {slip.slipNumber}
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              {formatMonth(slip.billingMonth)} · {teacher.fullName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Preview */}
        <div className="p-5">
          <div
            ref={printRef}
            className="border-2 border-gray-700 rounded-sm overflow-hidden font-sans"
          >
            {/* School Header */}
            <div className="bg-[#1e3a5f] text-white text-center py-4 px-3">
              <h1 className="text-base font-extrabold tracking-tight">{SCHOOL_NAME}</h1>
              <p className="text-[10px] mt-1 opacity-80">{SCHOOL_ADDRESS}</p>
            </div>

            {/* Slip Title */}
            <div className="bg-gray-100 text-center py-2 border-b border-gray-300">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Confidential Monthly Salary Slip — {formatMonth(slip.billingMonth)}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              {[
                { label: 'Employee Name', value: teacher.fullName || '—' },
                { label: 'Slip Number', value: slip.slipNumber },
                { label: 'Designation', value: slip.salaryStructure?.designation || '—' },
                { label: 'Department', value: slip.salaryStructure?.department || '—' },
                { label: 'Billing Month', value: formatMonth(slip.billingMonth) },
                { label: 'Payment Mode', value: slip.paymentMethod?.replace('_', ' ') || 'Pending' },
                { label: 'Bank / Account Title', value: slip.accountTitle || '—' },
                { label: 'IBAN / Acc. No.', value: slip.iban || slip.accountNumber || '—' },
              ].map((item, i) => (
                <div key={i} className={`px-3 py-2 ${i % 2 === 0 ? 'border-r border-gray-200' : ''} border-b border-gray-200`}>
                  <p className="text-[10px] text-gray-500">{item.label}</p>
                  <p className="text-[11px] font-semibold text-gray-900 mt-0.5 break-all">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-2 border-b border-gray-300">
              {/* Earnings */}
              <div className="p-3 border-r border-gray-300">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1.5 mb-2">
                  Earnings (PKR)
                </p>
                <table className="w-full">
                  <tbody>
                    <Row label="Basic Salary" value={slip.basicSalary} />
                    {slip.houseRentAllowance > 0 && <Row label="House Rent Allowance" value={slip.houseRentAllowance} />}
                    {slip.medicalAllowance > 0 && <Row label="Medical Allowance" value={slip.medicalAllowance} />}
                    {slip.transportAllowance > 0 && <Row label="Transport Allowance" value={slip.transportAllowance} />}
                    {slip.specialAllowance > 0 && <Row label="Special Allowance" value={slip.specialAllowance} />}
                    {slip.bonus > 0 && <Row label="Bonus / Incentive" value={slip.bonus} />}
                    <Row label="GROSS EARNINGS" value={slip.grossSalary} bold />
                  </tbody>
                </table>
              </div>

              {/* Deductions */}
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1.5 mb-2">
                  Deductions (PKR)
                </p>
                <table className="w-full">
                  <tbody>
                    {slip.taxDeduction > 0 && <Row label="Income Tax / WHT" value={slip.taxDeduction} />}
                    {slip.providentFund > 0 && <Row label="Provident Fund" value={slip.providentFund} />}
                    {slip.eobiDeduction > 0 && <Row label="EOBI Deduction" value={slip.eobiDeduction} />}
                    {slip.leaveDeductions > 0 && <Row label="Unpaid Leave Deductions" value={slip.leaveDeductions} />}
                    {slip.advanceDeduction > 0 && <Row label="Advance Salary Recovery" value={slip.advanceDeduction} />}
                    <Row label="TOTAL DEDUCTIONS" value={slip.totalDeductions} bold />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Pay Bar */}
            <div className="bg-[#1e3a5f] text-white flex justify-between items-center px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-widest">Net Salary Payable</span>
              <span className="text-xl font-black">Rs. {(slip.netSalary || 0).toLocaleString()}</span>
            </div>

            {/* Amount in Words */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <p className="text-[10px] text-gray-600">
                <span className="font-semibold">Amount in Words:</span>{' '}
                {amountInWords || '—'}
              </p>
            </div>

            {/* Attendance Note */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-600 flex gap-6">
              <span>Working Days: <strong>{slip.totalWorkingDays}</strong></span>
              <span>Paid Days: <strong>{slip.paidDays}</strong></span>
              <span>Unpaid Leaves: <strong>{slip.unpaidLeaves}</strong></span>
              {slip.remarks && <span>Remarks: <strong>{slip.remarks}</strong></span>}
            </div>

            {/* Signature Row */}
            <div className="grid grid-cols-3 border-t border-gray-300">
              {['Prepared By (Accounts)', 'Verified By (HOD)', 'Approved By (Principal)'].map(
                (label) => (
                  <div key={label} className="px-4 pt-6 pb-3 text-center border-r border-gray-200 last:border-r-0">
                    <div className="border-t border-gray-400 mb-1" />
                    <p className="text-[9px] text-gray-500">{label}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipPrintModal;
