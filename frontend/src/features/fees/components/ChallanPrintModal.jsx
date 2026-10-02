import React, { useState } from 'react';
import { X, Printer, Eye } from 'lucide-react';

const SCHOOL_NAME = 'The Girls Kingdom School & College Mardan';
const SCHOOL_TAGLINE = 'Soaring in Excellence';
const SCHOOL_ADDRESS = 'Main Road, Mardan, Khyber Pakhtunkhwa';
const BANK_DETAILS = [
  { bank: 'Habib Bank Limited (HBL)', acTitle: 'Girls Kingdom Education Trust', acNo: 'PKR-0123-79012345-01' },
  { bank: 'Muslim Commercial Bank (MCB)', acTitle: 'Girls Kingdom Education Trust', acNo: 'PKR-0456-89012345-02' },
  { bank: 'United Bank Limited (UBL)', acTitle: 'Girls Kingdom Education Trust', acNo: 'PKR-0789-99012345-03' },
];

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

const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };
  return convert(Math.round(num)) + ' Rupees Only';
};

const COPIES = [
  { key: 'bank', label: 'BANK COPY', note: 'To be retained by receiving bank branch' },
  { key: 'student', label: 'STUDENT COPY', note: 'To be retained by student as payment receipt' },
  { key: 'school', label: 'COLLEGE COPY', note: 'To be submitted to Accounts Office after payment' },
];

/** Single Copy HTML string generator for print window */
const renderSlipHtml = (challan, copy, logoUrl) => {
  const student = challan.student || {};
  const cls = challan.class || {};
  const total = challan.totalAmount || 0;
  const paid = challan.paidAmount || 0;
  const due = total - paid;

  const feeItems = [
    { label: 'Tuition Fee', amount: challan.tuitionFee },
    { label: 'Admission Fee', amount: challan.admissionFee },
    { label: 'Exam Fee', amount: challan.examFee },
    { label: 'Library Fee', amount: challan.libraryFee },
    { label: 'Transport / Bus Fee', amount: challan.transportFee },
    { label: 'Sports Fund', amount: challan.sportsFund },
    { label: 'Computer / Lab Fee', amount: challan.computerFee },
    { label: 'Late Surcharge', amount: challan.lateSurcharge },
  ].filter((f) => f.amount && Number(f.amount) > 0);

  const issueDate = challan.createdAt ? new Date(challan.createdAt).toLocaleDateString('en-PK') : new Date().toLocaleDateString('en-PK');
  const dueDate = challan.dueDate ? new Date(challan.dueDate).toLocaleDateString('en-PK') : '—';

  return `
    <div class="challan-slip">
      <!-- Copy Header Banner -->
      <div class="copy-banner">
        <span class="copy-title">${copy.label}</span>
      </div>

      <!-- College Header with Logo -->
      <div class="college-header">
        <img src="${logoUrl}" alt="College Logo" class="college-logo" />
        <div class="college-info">
          <div class="college-name">${SCHOOL_NAME}</div>
          <div class="college-sub">${SCHOOL_TAGLINE} · ${SCHOOL_ADDRESS}</div>
          <div class="voucher-title">FEE DEPOSIT VOUCHER — ${formatMonth(challan.billingMonth).toUpperCase()}</div>
        </div>
      </div>

      <!-- Student & Challan Meta Table -->
      <table class="meta-table">
        <tr>
          <td class="lbl">Challan No:</td>
          <td class="val mono bold">${challan.challanNumber || '—'}</td>
          <td class="lbl">Issue Date:</td>
          <td class="val">${issueDate}</td>
        </tr>
        <tr>
          <td class="lbl">Student Name:</td>
          <td class="val bold">${student.fullName || '—'}</td>
          <td class="lbl">Due Date:</td>
          <td class="val bold text-danger">${dueDate}</td>
        </tr>
        <tr>
          <td class="lbl">Class / Grade:</td>
          <td class="val">${cls.name || '—'}</td>
          <td class="lbl">Billing Month:</td>
          <td class="val">${formatMonth(challan.billingMonth)}</td>
        </tr>
      </table>

      <!-- Particulars Table -->
      <table class="fee-table">
        <thead>
          <tr>
            <th style="width: 32px; text-align: center;">#</th>
            <th>Fee Particulars</th>
            <th style="text-align: right; width: 100px;">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody>
          ${feeItems
            .map(
              (item, i) => `
            <tr>
              <td style="text-align: center; color: #666;">${i + 1}</td>
              <td>${item.label}</td>
              <td style="text-align: right; font-weight: 600;">Rs. ${Number(item.amount).toLocaleString()}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <!-- Total Row -->
      <div class="total-row">
        <span class="total-lbl">TOTAL PAYABLE:</span>
        <span class="total-val">${formatCurrency(due)}</span>
      </div>

      <!-- Amount in Words -->
      <div class="words-row">
        <strong>In Words:</strong> ${numberToWords(due)}
      </div>

      <!-- Bank Instructions -->
      <div class="bank-box">
        <div class="bank-title">DESIGNATED BANK ACCOUNTS (ANY BRANCH IN PAKISTAN):</div>
        <div class="bank-text">
          • <strong>HBL:</strong> A/C 0123-79012345-01 (Girls Kingdom Trust)<br/>
          • <strong>MCB / UBL / BOK:</strong> Education Fees Collection Code: <strong>GK-MRD</strong>
        </div>
        <div class="bank-note">
          * Please deposit on or before due date. A surcharge of Rs. 50/day applies thereafter.
        </div>
      </div>

      <!-- Signature Row -->
      <div class="sig-grid">
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-lbl">Depositor's Signature</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-lbl">Bank Cashier / Stamp</div>
        </div>
        <div class="sig-col">
          <div class="sig-line"></div>
          <div class="sig-lbl">Accounts Officer</div>
        </div>
      </div>

      <div class="copy-footer-note">${copy.note}</div>
    </div>
  `;
};

const ChallanPrintModal = ({ challan, onClose }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'bank' | 'student' | 'school'

  if (!challan) return null;

  const logoUrl = `${window.location.origin}/logo.png`;
  const total = challan.totalAmount || 0;
  const paid = challan.paidAmount || 0;
  const due = total - paid;
  const student = challan.student || {};
  const cls = challan.class || {};

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=1120,height=800');
    if (!win) {
      alert('Popup blocker prevented print window from opening. Please allow popups.');
      return;
    }

    const slipsHtml = COPIES.map((copy) => renderSlipHtml(challan, copy, logoUrl)).join(
      '<div class="cut-divider"><div class="cut-line"></div><span class="cut-icon">✂</span><div class="cut-line"></div></div>'
    );

    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Fee Challan - ${challan.challanNumber}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm 8mm;
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
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .challan-sheet {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              gap: 8px;
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
            }
            .challan-slip {
              flex: 1;
              min-width: 0;
              border: 1.5px solid #1e3a5f;
              border-radius: 4px;
              padding: 8px 10px;
              background: #fff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-size: 10px;
              line-height: 1.25;
            }
            .cut-divider {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 12px;
              color: #9ca3af;
              font-size: 10px;
            }
            .cut-line {
              flex: 1;
              border-left: 1px dashed #9ca3af;
            }
            .cut-icon {
              padding: 4px 0;
            }

            /* Copy Banner */
            .copy-banner {
              background: #1e3a5f;
              color: #fff;
              text-align: center;
              padding: 3px 6px;
              border-radius: 2px;
              margin-bottom: 6px;
            }
            .copy-title {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.1em;
            }

            /* College Header */
            .college-header {
              display: flex;
              align-items: center;
              gap: 8px;
              border-bottom: 1.5px solid #cbd5e1;
              padding-bottom: 6px;
              margin-bottom: 6px;
            }
            .college-logo {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              object-contain: cover;
              flex-shrink: 0;
            }
            .college-info {
              flex: 1;
              min-width: 0;
            }
            .college-name {
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
              line-height: 1.15;
            }
            .college-sub {
              font-size: 7.5px;
              color: #64748b;
              margin-top: 1px;
            }
            .voucher-title {
              font-size: 8.5px;
              font-weight: 700;
              color: #1e3a5f;
              margin-top: 2px;
              letter-spacing: 0.04em;
            }

            /* Tables */
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .meta-table {
              margin-bottom: 6px;
              border: 1px solid #e2e8f0;
              background: #f8fafc;
            }
            .meta-table td {
              padding: 2.5px 4px;
              font-size: 9px;
              border: 1px solid #e2e8f0;
            }
            .meta-table .lbl {
              color: #475569;
              font-weight: 600;
              width: 28%;
            }
            .meta-table .val {
              color: #0f172a;
              width: 22%;
            }
            .mono { font-family: monospace; }
            .bold { font-weight: 700; }
            .text-danger { color: #b91c1c; }

            .fee-table {
              margin-bottom: 6px;
              border: 1px solid #cbd5e1;
            }
            .fee-table th {
              background: #f1f5f9;
              color: #334155;
              font-size: 8.5px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 3px 5px;
              border: 1px solid #cbd5e1;
              letter-spacing: 0.03em;
            }
            .fee-table td {
              padding: 2px 5px;
              font-size: 9px;
              border-bottom: 1px solid #f1f5f9;
            }

            /* Total Row */
            .total-row {
              background: #1e3a5f;
              color: #ffffff;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 4px 8px;
              border-radius: 2px;
              margin-bottom: 4px;
            }
            .total-lbl {
              font-size: 9.5px;
              font-weight: 800;
              letter-spacing: 0.05em;
            }
            .total-val {
              font-size: 12px;
              font-weight: 900;
              letter-spacing: 0.02em;
            }

            /* Words */
            .words-row {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 2.5px 6px;
              font-size: 8px;
              color: #334155;
              border-radius: 2px;
              margin-bottom: 6px;
            }

            /* Bank Box */
            .bank-box {
              background: #fdfaf3;
              border: 1px solid #fde68a;
              padding: 4px 6px;
              border-radius: 2px;
              margin-bottom: 6px;
            }
            .bank-title {
              font-size: 7.5px;
              font-weight: 800;
              color: #92400e;
              margin-bottom: 1px;
            }
            .bank-text {
              font-size: 7.5px;
              color: #78350f;
              line-height: 1.25;
            }
            .bank-note {
              font-size: 7px;
              color: #b45309;
              margin-top: 1px;
              font-style: italic;
            }

            /* Signatures */
            .sig-grid {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              margin-top: 6px;
              padding-top: 4px;
            }
            .sig-col {
              flex: 1;
              text-align: center;
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              margin-bottom: 2px;
            }
            .sig-lbl {
              font-size: 7.5px;
              color: #64748b;
              font-weight: 600;
            }
            .copy-footer-note {
              font-size: 7px;
              color: #94a3b8;
              text-align: center;
              margin-top: 4px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="challan-sheet">
            ${slipsHtml}
          </div>
        </body>
      </html>
    `);

    win.document.close();

    // Ensure all images are loaded before triggering print dialog
    const img = win.document.querySelector('img');
    if (img) {
      img.onload = () => {
        win.focus();
        win.print();
      };
      img.onerror = () => {
        win.focus();
        win.print();
      };
      setTimeout(() => {
        win.focus();
        win.print();
      }, 500);
    } else {
      win.focus();
      win.print();
    }
  };

  const feeItems = [
    { label: 'Tuition Fee', amount: challan.tuitionFee },
    { label: 'Admission Fee', amount: challan.admissionFee },
    { label: 'Exam Fee', amount: challan.examFee },
    { label: 'Library Fee', amount: challan.libraryFee },
    { label: 'Transport / Bus Fee', amount: challan.transportFee },
    { label: 'Sports Fund', amount: challan.sportsFund },
    { label: 'Computer / Lab Fee', amount: challan.computerFee },
    { label: 'Late Surcharge', amount: challan.lateSurcharge },
  ].filter((f) => f.amount && Number(f.amount) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-contain shadow-xs border border-primary-100" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white">
                  3-Copy Bank Fee Challan
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold">
                  {challan.challanNumber}
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                {student.fullName} ({cls.name || 'Class'}) · {formatMonth(challan.billingMonth)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print All 3 Copies (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-nav on small screens */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <span>🖨️ <strong>Print Ready:</strong> Click &quot;Print All 3 Copies&quot; to print Bank Copy, Student Copy, and College Copy formatted for A4 Landscape.</span>
          </div>
          <div className="hidden sm:flex gap-1">
            {['all', 'bank', 'student', 'school'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                }`}
              >
                {tab === 'all' ? 'All 3 Copies' : `${tab} Copy`}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-100 dark:bg-surface-900/50">
          <div className={`grid gap-4 ${activeTab === 'all' ? 'grid-cols-1 md:grid-cols-3' : 'max-w-md mx-auto grid-cols-1'}`}>
            {COPIES.filter((c) => activeTab === 'all' || activeTab === c.key).map((copy) => (
              <div
                key={copy.key}
                className="bg-white dark:bg-surface-800 border-2 border-surface-300 dark:border-surface-600 rounded-xl p-4 shadow-sm flex flex-col justify-between"
              >
                {/* Copy Badge */}
                <div>
                  <div className="text-center bg-[#1e3a5f] text-white py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase mb-3">
                    {copy.label}
                  </div>

                  {/* College Header */}
                  <div className="flex items-center gap-2.5 border-b border-surface-200 dark:border-surface-700 pb-3 mb-3">
                    <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full object-contain shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-surface-900 dark:text-white leading-tight">
                        {SCHOOL_NAME}
                      </h3>
                      <p className="text-[10px] text-surface-500 dark:text-surface-400">{SCHOOL_TAGLINE}</p>
                      <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                        MONTHLY FEE CHALLAN
                      </p>
                    </div>
                  </div>

                  {/* Student Info Table */}
                  <div className="bg-surface-50 dark:bg-surface-700/50 rounded-lg p-2.5 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">Challan No:</span>
                      <span className="font-mono font-bold text-surface-900 dark:text-white">{challan.challanNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">Student:</span>
                      <span className="font-semibold text-surface-900 dark:text-white truncate max-w-[150px]">{student.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">Class:</span>
                      <span className="text-surface-700 dark:text-surface-300">{cls.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">Billing Month:</span>
                      <span className="text-surface-700 dark:text-surface-300">{formatMonth(challan.billingMonth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-500 dark:text-surface-400">Due Date:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {challan.dueDate ? new Date(challan.dueDate).toLocaleDateString('en-PK') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Particulars Table */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                      Fee Breakdown
                    </p>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                        {feeItems.map((item) => (
                          <tr key={item.label} className="py-1">
                            <td className="py-1 text-surface-600 dark:text-surface-400">{item.label}</td>
                            <td className="py-1 text-right font-medium text-surface-900 dark:text-white">
                              PKR {Number(item.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  {/* Total Bar */}
                  <div className="bg-[#1e3a5f] text-white p-2.5 rounded-lg flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Payable:</span>
                    <span className="text-sm font-extrabold">{formatCurrency(due)}</span>
                  </div>

                  {/* In words */}
                  <div className="text-[10px] text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/50 p-2 rounded-md mb-2">
                    <strong>Words:</strong> {numberToWords(due)}
                  </div>

                  {/* Bank Details */}
                  <div className="text-[10px] bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 p-2 rounded-md mb-3 space-y-0.5 text-amber-900 dark:text-amber-300">
                    <div className="font-bold uppercase tracking-wider">Bank Details:</div>
                    <div>HBL / MCB / UBL (Any Branch)</div>
                    <div>A/C: Girls Kingdom Education Trust</div>
                    <div className="font-mono text-[9px]">A/C No: PKR-SCHOOL-TRUST-001</div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-surface-200 dark:border-surface-700 text-[10px] text-surface-400">
                    <div>
                      <div className="border-t border-surface-300 dark:border-surface-600 mb-1" />
                      <span>Bank Stamp / Signature</span>
                    </div>
                    <div>
                      <div className="border-t border-surface-300 dark:border-surface-600 mb-1" />
                      <span>Authorized Officer</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanPrintModal;
