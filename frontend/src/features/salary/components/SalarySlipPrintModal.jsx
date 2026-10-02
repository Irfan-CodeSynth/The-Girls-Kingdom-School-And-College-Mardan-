import React from 'react';
import { X, Printer } from 'lucide-react';

const SCHOOL_NAME = 'The Girls Kingdom School & College Mardan';
const SCHOOL_TAGLINE = 'Soaring in Excellence';
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

const Row = ({ label, value, bold, isDeduction }) => (
  <tr className="border-b border-surface-200 dark:border-surface-700">
    <td className={`py-1.5 pr-4 text-xs ${bold ? 'font-bold text-surface-900 dark:text-white' : 'text-surface-600 dark:text-surface-400'}`}>
      {label}
    </td>
    <td className={`py-1.5 text-right text-xs ${bold ? 'font-bold' : 'font-medium'} ${isDeduction ? 'text-rose-600 dark:text-rose-400' : 'text-surface-900 dark:text-white'}`}>
      {fmt(value)}
    </td>
  </tr>
);

/** Complete Self-Contained HTML generator for printing */
const generatePrintHtml = (slip, amountInWords, logoUrl) => {
  const teacher = slip.teacher || {};
  const structure = slip.salaryStructure || {};
  const issueDate = slip.createdAt ? new Date(slip.createdAt).toLocaleDateString('en-PK') : new Date().toLocaleDateString('en-PK');
  const paidDate = slip.paidAt ? new Date(slip.paidAt).toLocaleDateString('en-PK') : '—';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Salary Slip - ${slip.slipNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            background: #fff;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .voucher-container {
            max-width: 760px;
            margin: 0 auto;
            border: 2px solid #1e3a5f;
            border-radius: 4px;
            overflow: hidden;
          }

          /* Header */
          .header-bar {
            background: #1e3a5f;
            color: #ffffff;
            padding: 14px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .school-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: contain;
            background: #ffffff;
            border: 2px solid #cbd5e1;
            flex-shrink: 0;
          }
          .header-text {
            flex: 1;
          }
          .school-name {
            font-size: 17px;
            font-weight: 800;
            letter-spacing: -0.01em;
            line-height: 1.2;
          }
          .school-tagline {
            font-size: 10.5px;
            color: #93c5fd;
            font-style: italic;
            margin-top: 2px;
          }
          .school-address {
            font-size: 9.5px;
            color: #e2e8f0;
            margin-top: 2px;
          }

          /* Sub-title bar */
          .title-strip {
            background: #f1f5f9;
            border-bottom: 2px solid #cbd5e1;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .voucher-heading {
            font-size: 11px;
            font-weight: 800;
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .slip-no-badge {
            font-size: 10.5px;
            font-weight: 700;
            font-family: monospace;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            padding: 2px 8px;
            border-radius: 3px;
            color: #0f172a;
          }

          /* Meta Grid */
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-bottom: 1.5px solid #cbd5e1;
          }
          .meta-table td {
            padding: 5px 10px;
            font-size: 10px;
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
          }
          .meta-table td:last-child {
            border-right: none;
          }
          .lbl {
            color: #475569;
            font-weight: 600;
            width: 18%;
            background: #f8fafc;
          }
          .val {
            color: #0f172a;
            width: 32%;
          }
          .mono { font-family: monospace; }
          .bold { font-weight: 700; }
          .text-success { color: #15803d; font-weight: 700; }

          /* Dual Table Body */
          .dual-container {
            display: flex;
            width: 100%;
            border-bottom: 1.5px solid #cbd5e1;
          }
          .col-half {
            flex: 1;
            padding: 10px 14px;
          }
          .col-half:first-child {
            border-right: 1.5px solid #cbd5e1;
          }
          .col-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #1e3a5f;
            padding-bottom: 5px;
            margin-bottom: 6px;
            border-bottom: 1.5px solid #cbd5e1;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
          }
          table.data-table td {
            padding: 3.5px 0;
            font-size: 10.5px;
            border-bottom: 1px dashed #e2e8f0;
          }
          table.data-table tr:last-child td {
            border-bottom: none;
          }
          .subtotal-row td {
            padding-top: 6px !important;
            border-top: 1.5px solid #1e3a5f !important;
            font-weight: 800 !important;
            font-size: 11px !important;
            color: #0f172a !important;
          }
          .text-right { text-align: right; }

          /* Net Salary Bar */
          .net-bar {
            background: #1e3a5f;
            color: #ffffff;
            padding: 10px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .net-lbl {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .net-amount {
            font-size: 19px;
            font-weight: 900;
            letter-spacing: 0.02em;
          }

          /* Words Row */
          .words-bar {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 6px 18px;
            font-size: 9.5px;
            color: #334155;
          }

          /* Attendance & Remarks */
          .notes-bar {
            background: #ffffff;
            border-bottom: 1.5px solid #cbd5e1;
            padding: 6px 18px;
            font-size: 9.5px;
            color: #475569;
            display: flex;
            gap: 20px;
          }

          /* Signatures */
          .sig-row {
            display: flex;
            padding: 35px 20px 14px;
            background: #ffffff;
          }
          .sig-box {
            flex: 1;
            text-align: center;
            padding: 0 10px;
          }
          .sig-line {
            border-top: 1.5px solid #475569;
            margin-bottom: 4px;
          }
          .sig-label {
            font-size: 9px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .voucher-footer {
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
            padding: 4px 10px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="voucher-container">
          <!-- Header -->
          <div class="header-bar">
            <img src="${logoUrl}" alt="College Seal" class="school-logo" />
            <div class="header-text">
              <div class="school-name">${SCHOOL_NAME}</div>
              <div class="school-tagline">${SCHOOL_TAGLINE}</div>
              <div class="school-address">${SCHOOL_ADDRESS}</div>
            </div>
          </div>

          <!-- Subtitle Strip -->
          <div class="title-strip">
            <span class="voucher-heading">CONFIDENTIAL SALARY DISBURSEMENT VOUCHER — ${formatMonth(slip.billingMonth).toUpperCase()}</span>
            <span class="slip-no-badge">${slip.slipNumber}</span>
          </div>

          <!-- Meta Grid -->
          <table class="meta-table">
            <tr>
              <td class="lbl">Employee Name:</td>
              <td class="val bold">${teacher.fullName || '—'}</td>
              <td class="lbl">Designation:</td>
              <td class="val">${structure.designation || 'Faculty Member'}</td>
            </tr>
            <tr>
              <td class="lbl">Department:</td>
              <td class="val">${structure.department || 'Academic'}</td>
              <td class="lbl">Billing Month:</td>
              <td class="val bold">${formatMonth(slip.billingMonth)}</td>
            </tr>
            <tr>
              <td class="lbl">Bank Name:</td>
              <td class="val">${slip.bankName || '—'}</td>
              <td class="lbl">Payment Mode:</td>
              <td class="val text-success">${(slip.paymentMethod || 'Bank Transfer').toUpperCase().replace('_', ' ')}</td>
            </tr>
            <tr>
              <td class="lbl">Account Title:</td>
              <td class="val">${slip.accountTitle || teacher.fullName || '—'}</td>
              <td class="lbl">Account / IBAN:</td>
              <td class="val mono bold">${slip.iban || slip.accountNumber || '—'}</td>
            </tr>
            <tr>
              <td class="lbl">Disbursement Date:</td>
              <td class="val">${paidDate}</td>
              <td class="lbl">Issue Date:</td>
              <td class="val">${issueDate}</td>
            </tr>
          </table>

          <!-- Earnings vs Deductions -->
          <div class="dual-container">
            <!-- Left: Earnings -->
            <div class="col-half">
              <div class="col-title">Earnings (PKR)</div>
              <table class="data-table">
                <tr><td>Basic Salary</td><td class="text-right">${fmt(slip.basicSalary)}</td></tr>
                ${slip.houseRentAllowance > 0 ? `<tr><td>House Rent Allowance (HRA)</td><td class="text-right">${fmt(slip.houseRentAllowance)}</td></tr>` : ''}
                ${slip.medicalAllowance > 0 ? `<tr><td>Medical Allowance</td><td class="text-right">${fmt(slip.medicalAllowance)}</td></tr>` : ''}
                ${slip.transportAllowance > 0 ? `<tr><td>Transport Allowance</td><td class="text-right">${fmt(slip.transportAllowance)}</td></tr>` : ''}
                ${slip.specialAllowance > 0 ? `<tr><td>Special / Academic Allowance</td><td class="text-right">${fmt(slip.specialAllowance)}</td></tr>` : ''}
                ${slip.bonus > 0 ? `<tr><td>Bonus / Incentive</td><td class="text-right">${fmt(slip.bonus)}</td></tr>` : ''}
                <tr class="subtotal-row"><td>GROSS EARNINGS</td><td class="text-right">${fmt(slip.grossSalary)}</td></tr>
              </table>
            </div>

            <!-- Right: Deductions -->
            <div class="col-half">
              <div class="col-title">Deductions (PKR)</div>
              <table class="data-table">
                ${slip.taxDeduction > 0 ? `<tr><td>Income Tax / WHT</td><td class="text-right">${fmt(slip.taxDeduction)}</td></tr>` : '<tr><td>Income Tax / WHT</td><td class="text-right">Rs. 0</td></tr>'}
                ${slip.providentFund > 0 ? `<tr><td>Provident Fund (PF)</td><td class="text-right">${fmt(slip.providentFund)}</td></tr>` : ''}
                ${slip.eobiDeduction > 0 ? `<tr><td>EOBI Contribution</td><td class="text-right">${fmt(slip.eobiDeduction)}</td></tr>` : ''}
                ${slip.leaveDeductions > 0 ? `<tr><td>Unpaid Leaves Deduction (${slip.unpaidLeaves} days)</td><td class="text-right">${fmt(slip.leaveDeductions)}</td></tr>` : ''}
                ${slip.advanceDeduction > 0 ? `<tr><td>Advance Salary Recovery</td><td class="text-right">${fmt(slip.advanceDeduction)}</td></tr>` : ''}
                <tr class="subtotal-row"><td>TOTAL DEDUCTIONS</td><td class="text-right">${fmt(slip.totalDeductions)}</td></tr>
              </table>
            </div>
          </div>

          <!-- Net Pay Bar -->
          <div class="net-bar">
            <span class="net-lbl">Net Salary Payable:</span>
            <span class="net-amount">Rs. ${Number(slip.netSalary || 0).toLocaleString()}</span>
          </div>

          <!-- Words Bar -->
          <div class="words-bar">
            <strong>Amount in Words:</strong> ${amountInWords || '—'}
          </div>

          <!-- Notes -->
          <div class="notes-bar">
            <span>Total Working Days: <strong>${slip.totalWorkingDays || 30}</strong></span>
            <span>Paid Days: <strong>${slip.paidDays || 30}</strong></span>
            <span>Unpaid Leaves: <strong>${slip.unpaidLeaves || 0}</strong></span>
            ${slip.remarks ? `<span>Remarks: <strong>${slip.remarks}</strong></span>` : ''}
          </div>

          <!-- Signatures -->
          <div class="sig-row">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-label">Prepared By (Accounts)</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-label">Verified By (HOD)</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-label">Approved By (Principal)</div>
            </div>
          </div>

          <div class="voucher-footer">
            This is an electronically generated official salary voucher of The Girls Kingdom School & College Mardan.
          </div>
        </div>
      </body>
    </html>
  `;
};

const SalarySlipPrintModal = ({ slip, amountInWords, onClose }) => {
  if (!slip) return null;

  const teacher = slip.teacher || {};
  const structure = slip.salaryStructure || {};
  const logoUrl = `${window.location.origin}/logo.png`;

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=800');
    if (!win) {
      alert('Popup blocker prevented print window from opening. Please allow popups.');
      return;
    }

    win.document.write(generatePrintHtml(slip, amountInWords, logoUrl));
    win.document.close();

    const img = win.document.querySelector('img');
    if (img) {
      img.onload = () => { win.focus(); win.print(); };
      img.onerror = () => { win.focus(); win.print(); };
      setTimeout(() => { win.focus(); win.print(); }, 500);
    } else {
      win.focus();
      win.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-contain shadow-xs border border-primary-100" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">
                  Salary Disbursement Voucher
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {slip.slipNumber}
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                {teacher.fullName} ({structure.designation || 'Faculty'}) · {formatMonth(slip.billingMonth)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-100 dark:bg-surface-900/50">
          <div className="bg-white dark:bg-surface-800 border-2 border-primary-900/30 dark:border-primary-700/50 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-[#1e3a5f] text-white p-4 sm:p-5 flex items-center gap-4">
              <img src="/logo.png" alt="College Logo" className="w-14 h-14 rounded-full object-contain bg-white p-0.5 shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-bold leading-tight">{SCHOOL_NAME}</h3>
                <p className="text-xs text-blue-200 italic mt-0.5">{SCHOOL_TAGLINE}</p>
                <p className="text-[11px] text-surface-300 mt-0.5">{SCHOOL_ADDRESS}</p>
              </div>
            </div>

            {/* Strip */}
            <div className="bg-surface-50 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700 px-4 py-2 flex justify-between items-center text-xs">
              <span className="font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                Monthly Salary Slip — {formatMonth(slip.billingMonth)}
              </span>
              <span className="font-mono text-surface-600 dark:text-surface-300 font-semibold">{slip.slipNumber}</span>
            </div>

            {/* Meta */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800">
              <div>
                <p className="text-surface-500 dark:text-surface-400">Employee Name</p>
                <p className="font-bold text-surface-900 dark:text-white mt-0.5">{teacher.fullName || '—'}</p>
              </div>
              <div>
                <p className="text-surface-500 dark:text-surface-400">Designation</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 mt-0.5">{structure.designation || 'Faculty'}</p>
              </div>
              <div>
                <p className="text-surface-500 dark:text-surface-400">Department</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 mt-0.5">{structure.department || 'Science'}</p>
              </div>
              <div>
                <p className="text-surface-500 dark:text-surface-400">Payment Status</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize">{slip.status}</p>
              </div>
              <div>
                <p className="text-surface-500 dark:text-surface-400">Bank Name</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 mt-0.5">{slip.bankName || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-surface-500 dark:text-surface-400">IBAN / Account No.</p>
                <p className="font-mono font-medium text-surface-800 dark:text-surface-200 mt-0.5 truncate">{slip.iban || slip.accountNumber || '—'}</p>
              </div>
              <div>
                <p className="text-surface-500 dark:text-surface-400">Payment Method</p>
                <p className="font-medium text-surface-800 dark:text-surface-200 mt-0.5 capitalize">{slip.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}</p>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-200 dark:divide-surface-700 p-4 gap-4">
              {/* Earnings */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 pb-1 mb-2 border-b border-surface-200 dark:border-surface-700">
                  Earnings (PKR)
                </h4>
                <table className="w-full">
                  <tbody>
                    <Row label="Basic Salary" value={slip.basicSalary} />
                    {slip.houseRentAllowance > 0 && <Row label="House Rent Allowance (HRA)" value={slip.houseRentAllowance} />}
                    {slip.medicalAllowance > 0 && <Row label="Medical Allowance" value={slip.medicalAllowance} />}
                    {slip.transportAllowance > 0 && <Row label="Transport Allowance" value={slip.transportAllowance} />}
                    {slip.specialAllowance > 0 && <Row label="Special Allowance" value={slip.specialAllowance} />}
                    {slip.bonus > 0 && <Row label="Bonus / Incentive" value={slip.bonus} />}
                    <Row label="GROSS EARNINGS" value={slip.grossSalary} bold />
                  </tbody>
                </table>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-1 mb-2 border-b border-surface-200 dark:border-surface-700">
                  Deductions (PKR)
                </h4>
                <table className="w-full">
                  <tbody>
                    <Row label="Income Tax / WHT" value={slip.taxDeduction || 0} isDeduction />
                    {slip.providentFund > 0 && <Row label="Provident Fund (PF)" value={slip.providentFund} isDeduction />}
                    {slip.eobiDeduction > 0 && <Row label="EOBI Contribution" value={slip.eobiDeduction} isDeduction />}
                    {slip.leaveDeductions > 0 && <Row label={`Unpaid Leaves (${slip.unpaidLeaves}d)`} value={slip.leaveDeductions} isDeduction />}
                    {slip.advanceDeduction > 0 && <Row label="Advance Salary Recovery" value={slip.advanceDeduction} isDeduction />}
                    <Row label="TOTAL DEDUCTIONS" value={slip.totalDeductions} bold isDeduction />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="bg-[#1e3a5f] text-white p-4 flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Net Salary Payable:</span>
              <span className="text-lg sm:text-xl font-black">Rs. {(slip.netSalary || 0).toLocaleString()}</span>
            </div>

            {/* Words & Attendance */}
            <div className="p-3 bg-surface-50 dark:bg-surface-700/30 text-xs text-surface-600 dark:text-surface-400 border-t border-surface-200 dark:border-surface-700 space-y-1">
              <div>
                <strong>Amount in Words:</strong> {amountInWords || '—'}
              </div>
              <div className="flex gap-4 text-[11px] pt-1">
                <span>Working Days: <strong>{slip.totalWorkingDays || 30}</strong></span>
                <span>Paid Days: <strong>{slip.paidDays || 30}</strong></span>
                <span>Unpaid Leaves: <strong>{slip.unpaidLeaves || 0}</strong></span>
              </div>
            </div>

            {/* Signatures */}
            <div className="p-4 grid grid-cols-3 gap-4 text-center border-t border-surface-200 dark:border-surface-700 pt-6">
              <div>
                <div className="border-t border-surface-300 dark:border-surface-600 mb-1" />
                <p className="text-[10px] text-surface-500 dark:text-surface-400 font-medium">Prepared By (Accounts)</p>
              </div>
              <div>
                <div className="border-t border-surface-300 dark:border-surface-600 mb-1" />
                <p className="text-[10px] text-surface-500 dark:text-surface-400 font-medium">Verified By (HOD)</p>
              </div>
              <div>
                <div className="border-t border-surface-300 dark:border-surface-600 mb-1" />
                <p className="text-[10px] text-surface-500 dark:text-surface-400 font-medium">Approved By (Principal)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlipPrintModal;
