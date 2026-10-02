import React from 'react';
import { X, Printer, Receipt } from 'lucide-react';
import { Badge } from '../../../components/ui';

export default function PaymentVoucherPrintModal({ expense, onClose }) {
  if (!expense) return null;

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tensArr = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function n2w(num) {
    if (!num || num === 0) return 'Zero';
    if (num < 20) return ones[num];
    if (num < 100) return tensArr[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + n2w(num % 100) : '');
    if (num < 100000) return n2w(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + n2w(num % 1000) : '');
    if (num < 10000000) return n2w(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + n2w(num % 100000) : '');
    return n2w(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + n2w(num % 10000000) : '');
  }
  const amountInWords = n2w(Math.round(expense.amount)) + ' Rupees Only';

  const fmt = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const catLabel = {
    utilities: 'Utilities (Electricity/Gas/Water)',
    maintenance: 'Maintenance & Repairs',
    supplies: 'Supplies & Stationery',
    transport: 'Transport & Fuel',
    campus_rent: 'Campus Lease & Rent',
    events_sports: 'Events & Sports',
    lab_library: 'Lab & Library',
    petty_cash: 'Petty Cash',
    other: 'Other Expense',
  }[expense.category] || expense.category;

  const pmLabel = {
    cash: 'Cash Payment',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
  }[expense.paymentMethod] || expense.paymentMethod;

  const statusLabel = {
    paid: 'PAID & DISBURSED',
    pending_approval: 'PENDING APPROVAL',
    cancelled: 'CANCELLED',
  }[expense.status] || expense.status;

  const logoUrl = window.location.origin + '/logo.png';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Payment Voucher – ${expense.voucherNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;font-size:11pt;}
  @page{size:A4 portrait;margin:14mm 16mm 14mm 16mm;}
  @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}
    .no-print{display:none!important;}}

  /* Outer voucher border */
  .voucher{border:2.5px solid #7c2d37;border-radius:6px;padding:0;overflow:hidden;max-width:780px;margin:0 auto;}

  /* Header band */
  .vhead{background:#7c2d37;color:#fff;display:flex;align-items:center;gap:16px;padding:12px 20px;}
  .vhead img{width:64px;height:64px;border-radius:50%;border:2px solid #d97706;object-fit:cover;background:#fff;}
  .vhead-text{flex:1;}
  .vhead-text h1{font-size:16pt;font-weight:700;letter-spacing:0.3px;}
  .vhead-text p{font-size:8.5pt;opacity:0.9;margin-top:2px;}
  .vhead-right{text-align:right;}
  .vhead-right .pv-label{font-size:8pt;opacity:0.8;text-transform:uppercase;letter-spacing:1px;}
  .vhead-right .pv-no{font-size:14pt;font-weight:700;letter-spacing:1px;color:#fef08a;}
  .vhead-right .pv-date{font-size:8pt;opacity:0.85;margin-top:4px;}

  /* Status banner */
  .status-bar{background:#fdf2f4;border-bottom:1.5px solid #7c2d37;padding:6px 20px;display:flex;align-items:center;justify-content:space-between;}
  .status-bar .month{font-size:9pt;color:#555;}
  .status-badge{font-size:9pt;font-weight:700;padding:3px 14px;border-radius:20px;letter-spacing:0.5px;}
  .badge-paid{background:#d1fae5;color:#065f46;}
  .badge-pending{background:#fef9c3;color:#92400e;}
  .badge-cancelled{background:#fee2e2;color:#991b1b;}

  /* Body */
  .vbody{padding:16px 20px;}

  /* Section title */
  .sec-title{font-size:8pt;font-weight:700;color:#7c2d37;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #fed7aa;padding-bottom:4px;margin-bottom:10px;}

  /* Info grid */
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin-bottom:14px;}
  .info-item label{display:block;font-size:7.5pt;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1px;}
  .info-item span{font-size:9.5pt;color:#1a1a2e;font-weight:500;}

  /* Amount table */
  table{width:100%;border-collapse:collapse;margin-bottom:12px;}
  th{background:#7c2d37;color:#fff;font-size:9pt;padding:8px 12px;text-align:left;}
  td{font-size:9.5pt;padding:8px 12px;border-bottom:1px solid #fed7aa;}
  tr:last-child td{border-bottom:none;}
  .amt-col{text-align:right;}

  /* Net row */
  .net-row{background:#7c2d37;color:#fff;}
  .net-row td{font-size:10.5pt;font-weight:700;padding:10px 12px;}

  /* Amount in words */
  .words-box{background:#fdf2f4;border:1px solid #fecdd3;border-radius:6px;padding:9px 14px;margin-bottom:14px;}
  .words-box .wlabel{font-size:7.5pt;color:#7c2d37;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
  .words-box .wvalue{font-size:9.5pt;color:#7c2d37;font-weight:600;font-style:italic;margin-top:2px;}

  /* Remarks */
  .remarks-box{background:#fffbeb;border:1px dashed #d97706;border-radius:6px;padding:9px 14px;margin-bottom:14px;}
  .remarks-box .rlabel{font-size:7.5pt;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
  .remarks-box .rvalue{font-size:9pt;color:#4a3000;margin-top:2px;}

  /* Signatures */
  .sig-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px;padding-top:16px;border-top:1.5px solid #7c2d37;}
  .sig-block{text-align:center;}
  .sig-line{border-top:1.5px solid #888;margin-bottom:6px;width:80%;margin-left:auto;margin-right:auto;}
  .sig-label{font-size:7.5pt;color:#555;font-weight:600;}

  /* Footer */
  .vfooter{background:#fdf2f4;border-top:1.5px solid #7c2d37;padding:8px 20px;display:flex;justify-content:space-between;align-items:center;}
  .vfooter .fl{font-size:7.5pt;color:#555;}
  .vfooter .fr{font-size:7.5pt;color:#7c2d37;font-style:italic;}

  /* Print button */
  .print-btn{display:block;margin:20px auto;padding:10px 30px;background:#7c2d37;color:#fff;border:none;border-radius:8px;font-size:12pt;font-weight:600;cursor:pointer;}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨 Print Payment Voucher</button>

<div class="voucher">
  <!-- Header -->
  <div class="vhead">
    <img src="${logoUrl}" alt="School Logo" onerror="this.style.display='none'"/>
    <div class="vhead-text">
      <h1>The Girls Kingdom School &amp; College</h1>
      <p>Mardan, Khyber Pakhtunkhwa, Pakistan</p>
      <p>Official Institutional Expenditure &amp; Disbursal Record</p>
    </div>
    <div class="vhead-right">
      <div class="pv-label">Payment Voucher</div>
      <div class="pv-no">${expense.voucherNumber}</div>
      <div class="pv-date">Date: ${fmt(expense.expenseDate)}</div>
    </div>
  </div>

  <!-- Status Bar -->
  <div class="status-bar">
    <span class="month">Billing Month: <strong>${expense.billingMonth || 'N/A'}</strong></span>
    <span class="status-badge badge-${expense.status === 'paid' ? 'paid' : expense.status === 'cancelled' ? 'cancelled' : 'pending'}">
      ● ${statusLabel}
    </span>
  </div>

  <!-- Body -->
  <div class="vbody">
    <div class="sec-title">Expenditure &amp; Payee Particulars</div>
    <div class="info-grid">
      <div class="info-item">
        <label>Expense Title</label>
        <span>${expense.title}</span>
      </div>
      <div class="info-item">
        <label>Category</label>
        <span>${catLabel}</span>
      </div>
      <div class="info-item">
        <label>Paid To (Payee / Vendor)</label>
        <span>${expense.paidTo}</span>
      </div>
      <div class="info-item">
        <label>Payment Method</label>
        <span>${pmLabel}</span>
      </div>
      ${expense.billReference ? `
      <div class="info-item">
        <label>Bill / Invoice Reference #</label>
        <span>${expense.billReference}</span>
      </div>` : ''}
      <div class="info-item">
        <label>Accounting Cycle</label>
        <span>${expense.billingMonth || 'Current'}</span>
      </div>
    </div>

    <!-- Amount Breakdown Table -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Category</th>
          <th>Payment Mode</th>
          <th class="amt-col">Amount (PKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${expense.title}</strong><br/><small style="color:#666;">Payee: ${expense.paidTo}</small></td>
          <td>${catLabel}</td>
          <td>${pmLabel}</td>
          <td class="amt-col" style="font-weight:700;">PKR ${Number(expense.amount).toLocaleString('en-PK')}</td>
        </tr>
        <tr class="net-row">
          <td colspan="3"><strong>TOTAL DISBURSED AMOUNT</strong></td>
          <td class="amt-col">PKR ${Number(expense.amount).toLocaleString('en-PK')}</td>
        </tr>
      </tbody>
    </table>

    <!-- Amount in words -->
    <div class="words-box">
      <div class="wlabel">Amount in Words</div>
      <div class="wvalue">${amountInWords}</div>
    </div>

    <!-- Remarks -->
    ${expense.remarks ? `
    <div class="remarks-box">
      <div class="rlabel">Administrative Remarks &amp; Notes</div>
      <div class="rvalue">${expense.remarks}</div>
    </div>` : ''}

    <!-- Signatures -->
    <div class="sig-row">
      <div class="sig-block">
        <div style="height:36px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Prepared By<br/>(Accountant)</div>
      </div>
      <div class="sig-block">
        <div style="height:36px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Verified By<br/>(Accounts Officer)</div>
      </div>
      <div class="sig-block">
        <div style="height:36px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Sanctioned By<br/>(Principal)</div>
      </div>
      <div class="sig-block">
        <div style="height:36px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Receiver's Signature<br/>with Stamp</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="vfooter">
    <span class="fl">Generated: ${new Date().toLocaleString('en-PK')} | Girls Kingdom Education ERP</span>
    <span class="fr">Official Institutional Financial Record</span>
  </div>
</div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-200/50 dark:border-primary-800/40 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-surface-900 dark:text-white">Institutional Payment Voucher</h2>
              <p className="text-xs font-mono text-primary-600 dark:text-primary-400">{expense.voucherNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-6 space-y-4">
          <div className="bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Voucher Identification</p>
                <p className="text-base font-extrabold font-mono text-primary-700 dark:text-primary-300 mt-0.5">{expense.voucherNumber}</p>
              </div>
              <Badge variant={expense.status === 'paid' ? 'success' : expense.status === 'cancelled' ? 'danger' : 'warning'}>
                {expense.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-200/60 dark:border-surface-700/60 text-xs">
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Expense Title</p>
                <p className="font-bold text-surface-900 dark:text-white mt-0.5 truncate">{expense.title}</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Paid To (Payee)</p>
                <p className="font-bold text-surface-900 dark:text-white mt-0.5 truncate">{expense.paidTo}</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Disbursed Amount</p>
                <p className="font-extrabold text-sm text-primary-600 dark:text-primary-400 mt-0.5">
                  PKR {Number(expense.amount).toLocaleString('en-PK')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Date of Expense</p>
                <p className="font-medium text-surface-700 dark:text-surface-300 mt-0.5">
                  {expense.expenseDate
                    ? new Date(expense.expenseDate).toLocaleDateString('en-PK', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-xl p-3 border border-surface-200/70 dark:border-surface-700/70">
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Amount in Words</p>
              <p className="text-xs font-semibold italic text-primary-700 dark:text-primary-300 mt-0.5">{amountInWords}</p>
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Official Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
