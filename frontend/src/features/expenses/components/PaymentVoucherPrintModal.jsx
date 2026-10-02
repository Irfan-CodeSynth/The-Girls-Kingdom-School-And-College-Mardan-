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
    campus_rent: 'Campus Rent',
    events_sports: 'Events & Sports',
    lab_library: 'Lab & Library',
    petty_cash: 'Petty Cash',
    other: 'Other',
  }[expense.category] || expense.category;

  const pmLabel = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
  }[expense.paymentMethod] || expense.paymentMethod;

  const statusLabel = {
    paid: 'PAID',
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

  /* ── Outer voucher border ── */
  .voucher{border:2.5px solid #1a3a6b;border-radius:6px;padding:0;overflow:hidden;max-width:780px;margin:0 auto;}

  /* ── Header band ── */
  .vhead{background:#1a3a6b;color:#fff;display:flex;align-items:center;gap:16px;padding:10px 18px;}
  .vhead img{width:64px;height:64px;border-radius:50%;border:2px solid #c9a227;object-fit:cover;}
  .vhead-text{flex:1;}
  .vhead-text h1{font-size:15pt;font-weight:700;letter-spacing:0.3px;}
  .vhead-text p{font-size:8.5pt;opacity:0.85;margin-top:2px;}
  .vhead-right{text-align:right;}
  .vhead-right .pv-label{font-size:8pt;opacity:0.7;text-transform:uppercase;letter-spacing:1px;}
  .vhead-right .pv-no{font-size:14pt;font-weight:700;letter-spacing:1px;color:#c9a227;}
  .vhead-right .pv-date{font-size:8pt;opacity:0.75;margin-top:4px;}

  /* ── Status banner ── */
  .status-bar{background:#f0f4ff;border-bottom:1.5px solid #1a3a6b;padding:5px 18px;display:flex;align-items:center;justify-content:space-between;}
  .status-bar .month{font-size:9pt;color:#555;}
  .status-badge{font-size:9pt;font-weight:700;padding:3px 12px;border-radius:20px;letter-spacing:0.5px;}
  .badge-paid{background:#d1fae5;color:#065f46;}
  .badge-pending{background:#fef9c3;color:#92400e;}
  .badge-cancelled{background:#fee2e2;color:#991b1b;}

  /* ── Body ── */
  .vbody{padding:14px 18px;}

  /* ── Section title ── */
  .sec-title{font-size:8pt;font-weight:700;color:#1a3a6b;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #dde4f0;padding-bottom:4px;margin-bottom:8px;}

  /* ── Info grid ── */
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;margin-bottom:14px;}
  .info-item label{display:block;font-size:7.5pt;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1px;}
  .info-item span{font-size:9.5pt;color:#1a1a2e;font-weight:500;}

  /* ── Amount table ── */
  table{width:100%;border-collapse:collapse;margin-bottom:10px;}
  th{background:#1a3a6b;color:#fff;font-size:9pt;padding:7px 10px;text-align:left;}
  td{font-size:9.5pt;padding:7px 10px;border-bottom:1px solid #e8ecf5;}
  tr:last-child td{border-bottom:none;}
  .amt-col{text-align:right;}

  /* ── Net row ── */
  .net-row{background:#1a3a6b;color:#fff;}
  .net-row td{font-size:10.5pt;font-weight:700;padding:9px 10px;}

  /* ── Amount in words ── */
  .words-box{background:#f8f9ff;border:1px solid #dde4f0;border-radius:6px;padding:8px 12px;margin-bottom:14px;}
  .words-box .wlabel{font-size:7.5pt;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
  .words-box .wvalue{font-size:9.5pt;color:#1a3a6b;font-weight:600;font-style:italic;margin-top:2px;}

  /* ── Remarks ── */
  .remarks-box{background:#fffbeb;border:1px dashed #c9a227;border-radius:6px;padding:8px 12px;margin-bottom:14px;}
  .remarks-box .rlabel{font-size:7.5pt;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
  .remarks-box .rvalue{font-size:9pt;color:#4a3000;margin-top:2px;}

  /* ── Signatures ── */
  .sig-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px;padding-top:14px;border-top:1.5px solid #1a3a6b;}
  .sig-block{text-align:center;}
  .sig-line{border-top:1.5px solid #888;margin-bottom:5px;width:80%;margin-left:auto;margin-right:auto;}
  .sig-label{font-size:7.5pt;color:#555;font-weight:600;}

  /* ── Footer ── */
  .vfooter{background:#f0f4ff;border-top:1.5px solid #1a3a6b;padding:7px 18px;display:flex;justify-content:space-between;align-items:center;}
  .vfooter .fl{font-size:7.5pt;color:#555;}
  .vfooter .fr{font-size:7.5pt;color:#1a3a6b;font-style:italic;}

  /* Print button */
  .print-btn{display:block;margin:20px auto;padding:10px 30px;background:#1a3a6b;color:#fff;border:none;border-radius:8px;font-size:12pt;cursor:pointer;}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨 Print Voucher</button>

<div class="voucher">
  <!-- Header -->
  <div class="vhead">
    <img src="${logoUrl}" alt="School Logo" onerror="this.style.display='none'"/>
    <div class="vhead-text">
      <h1>The Girls Kingdom School &amp; College</h1>
      <p>Mardan, Khyber Pakhtunkhwa, Pakistan</p>
      <p>📞 Contact: Girls Kingdom Education Trust</p>
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
    <div class="sec-title">Expense Details</div>
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
      <div class="info-item">
        <label>Bill / Invoice / Cheque Reference</label>
        <span>${expense.billReference || '—'}</span>
      </div>
      <div class="info-item">
        <label>Recorded By</label>
        <span>${expense.recordedBy?.fullName || 'Administrator'}</span>
      </div>
    </div>

    <!-- Amount Table -->
    <div class="sec-title">Amount Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amt-col">Amount (PKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${expense.title}</td>
          <td class="amt-col">${Number(expense.amount).toLocaleString('en-PK')}</td>
        </tr>
        <tr class="net-row">
          <td>TOTAL PAYABLE</td>
          <td class="amt-col">PKR ${Number(expense.amount).toLocaleString('en-PK')}</td>
        </tr>
      </tbody>
    </table>

    <!-- Amount in Words -->
    <div class="words-box">
      <div class="wlabel">Amount in Words</div>
      <div class="wvalue">${amountInWords}</div>
    </div>

    ${expense.remarks ? `
    <!-- Remarks -->
    <div class="remarks-box">
      <div class="rlabel">Remarks / Notes</div>
      <div class="rvalue">${expense.remarks}</div>
    </div>` : ''}

    <!-- Signatures -->
    <div class="sig-row">
      <div class="sig-block">
        <div style="height:40px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Prepared By<br/>(Accounts Officer)</div>
      </div>
      <div class="sig-block">
        <div style="height:40px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Checked By<br/>(Finance In-Charge)</div>
      </div>
      <div class="sig-block">
        <div style="height:40px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Sanctioned By<br/>(Principal)</div>
      </div>
      <div class="sig-block">
        <div style="height:40px;"></div>
        <div class="sig-line"></div>
        <div class="sig-label">Receiver's Signature<br/>with Date &amp; Stamp</div>
      </div>
    </div>
  </div><!-- /vbody -->

  <!-- Footer -->
  <div class="vfooter">
    <span class="fl">Generated: ${new Date().toLocaleString('en-PK')} | System: Girls Kingdom School ERP</span>
    <span class="fr">This is a computer-generated voucher — no separate stamp required if signed above.</span>
  </div>
</div><!-- /voucher -->
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment Voucher</h2>
            <p className="text-xs text-gray-500">{expense.voucherNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Voucher No.</p>
                <p className="text-lg font-bold text-blue-900">{expense.voucherNumber}</p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  expense.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : expense.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {expense.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Title</p>
                <p className="text-sm text-gray-800 font-medium">{expense.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Paid To</p>
                <p className="text-sm text-gray-800 font-medium">{expense.paidTo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Amount</p>
                <p className="text-sm font-bold text-blue-700">
                  PKR {Number(expense.amount).toLocaleString('en-PK')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Date</p>
                <p className="text-sm text-gray-800">
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
            <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Amount in Words</p>
              <p className="text-xs text-blue-800 font-medium italic mt-0.5">{amountInWords}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              🖨 Print Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
