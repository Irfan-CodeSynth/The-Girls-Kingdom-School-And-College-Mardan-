import React from 'react';
import { X, Printer, CalendarDays } from 'lucide-react';
import { Badge } from '../../../components/ui';

// ─── Constants ─────────────────────────────────────────────────
const SCHOOL_NAME = 'The Girls Kingdom School & College Mardan';
const SCHOOL_TAGLINE = 'Soaring in Excellence';
const SCHOOL_ADDRESS = 'Main Road, Mardan, Khyber Pakhtunkhwa';
const PRIMARY_COLOR = '#7c2d37';

const EXAM_TYPE_VARIANT = {
  Midterm: 'info',
  Final: 'danger',
  'Monthly Test': 'warning',
  'Mock Board': 'primary',
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const dayName = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', { weekday: 'long' });
};

// ─── Print HTML generator ───────────────────────────────────────
const buildPrintHtml = (datesheet) => {
  const entries = datesheet?.entries || [];
  const rowsHtml = entries
    .map(
      (e, i) => `
      <tr style="background: ${i % 2 === 0 ? '#fff' : '#fdf8f8'};">
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb;">${e.subject || '—'}</td>
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb; white-space:nowrap;">${fmt(e.examDate)}</td>
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb;">${dayName(e.examDate)}</td>
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb; white-space:nowrap;">${e.startTime || '—'} – ${e.endTime || '—'}</td>
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb;">${e.room || '—'}</td>
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb; text-align:center;">${e.totalMarks ?? '—'}</td>
        <td style="padding:6px 10px; border-bottom:1px solid #e5e7eb; text-align:center;">${e.passingMarks ?? '—'}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Datesheet – ${datesheet?.title || ''}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 11px;
      color: #111827;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      background: ${PRIMARY_COLOR};
      color: #fff;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-radius: 6px 6px 0 0;
      margin-bottom: 0;
    }
    .header-logo {
      width: 54px; height: 54px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
      object-fit: contain;
      flex-shrink: 0;
      background: #fff;
    }
    .header-text .school-name { font-size: 15px; font-weight: 800; line-height: 1.2; }
    .header-text .school-sub { font-size: 9px; opacity: 0.85; margin-top: 2px; }
    .header-text .division { font-size: 10px; font-weight: 700; margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.9; }
    .meta-bar {
      background: #fdf2f2;
      border: 1px solid #f3c0c0;
      border-top: none;
      padding: 10px 18px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 10.5px;
    }
    .meta-bar .meta-item { display: flex; flex-direction: column; }
    .meta-bar .meta-label { font-weight: 700; color: ${PRIMARY_COLOR}; font-size: 9px; text-transform: uppercase; }
    .meta-bar .meta-val { color: #111; font-weight: 600; }
    h2.datesheet-title {
      font-size: 14px; font-weight: 800; color: ${PRIMARY_COLOR};
      text-align: center; margin: 14px 0 4px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    table.entries {
      width: 100%; border-collapse: collapse; margin-top: 10px;
      border: 1px solid #d1d5db;
    }
    table.entries thead tr {
      background: ${PRIMARY_COLOR}; color: #fff;
    }
    table.entries thead th {
      padding: 7px 10px; text-align: left; font-size: 9.5px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }
    table.entries thead th:nth-child(6),
    table.entries thead th:nth-child(7) { text-align: center; }
    .instructions {
      margin-top: 16px; border: 1px solid #f3c0c0;
      background: #fdf8f8; border-radius: 4px; padding: 10px 14px;
    }
    .instructions h3 {
      font-size: 10px; font-weight: 800; color: ${PRIMARY_COLOR};
      text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;
    }
    .instructions p { font-size: 9.5px; color: #374151; line-height: 1.6; white-space: pre-wrap; }
    .sig-section {
      display: flex; justify-content: space-between;
      margin-top: 28px; padding-top: 10px;
    }
    .sig-col { text-align: center; min-width: 160px; }
    .sig-line { border-top: 1.5px solid #6b7280; margin-bottom: 4px; }
    .sig-lbl { font-size: 9px; color: #6b7280; font-weight: 600; }
    .sig-title { font-size: 10px; font-weight: 700; color: #111; }
    .footer-bar {
      margin-top: 18px; border-top: 1px solid #e5e7eb;
      padding-top: 6px; text-align: center;
      font-size: 8.5px; color: #9ca3af;
    }
    @media print {
      body { background: #fff !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <img src="${window.location.origin}/logo.png" alt="Logo" class="header-logo" />
    <div class="header-text">
      <div class="school-name">${SCHOOL_NAME}</div>
      <div class="school-sub">${SCHOOL_TAGLINE} &nbsp;·&nbsp; ${SCHOOL_ADDRESS}</div>
      <div class="division">Examination Division</div>
    </div>
  </div>

  <!-- Meta bar -->
  <div class="meta-bar">
    <div class="meta-item"><span class="meta-label">Class</span><span class="meta-val">${datesheet?.className || datesheet?.class?.name || '—'}</span></div>
    <div class="meta-item"><span class="meta-label">Exam Type</span><span class="meta-val">${datesheet?.examType || '—'}</span></div>
    <div class="meta-item"><span class="meta-label">Academic Year</span><span class="meta-val">${datesheet?.academicYear || '—'}</span></div>
    <div class="meta-item"><span class="meta-label">Exam Period</span><span class="meta-val">${fmt(datesheet?.startDate)} – ${fmt(datesheet?.endDate)}</span></div>
    <div class="meta-item"><span class="meta-label">Total Subjects</span><span class="meta-val">${entries.length}</span></div>
  </div>

  <!-- Title -->
  <h2 class="datesheet-title">${datesheet?.title || 'Examination Datesheet'}</h2>

  <!-- Entries Table -->
  <table class="entries">
    <thead>
      <tr>
        <th>Subject</th>
        <th>Date</th>
        <th>Day</th>
        <th>Time</th>
        <th>Examination Hall</th>
        <th>Total Marks</th>
        <th>Passing Marks</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <!-- Instructions -->
  ${
    datesheet?.generalInstructions
      ? `<div class="instructions">
          <h3>General Instructions</h3>
          <p>${datesheet.generalInstructions}</p>
        </div>`
      : ''
  }

  <!-- Signatures -->
  <div class="sig-section">
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-title">Controller of Examinations</div>
      <div class="sig-lbl">Signature &amp; Stamp</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-title">Principal</div>
      <div class="sig-lbl">Signature &amp; Stamp</div>
    </div>
  </div>

  <div class="footer-bar">
    ${SCHOOL_NAME} &nbsp;|&nbsp; Generated on ${new Date().toLocaleDateString('en-PK', { dateStyle: 'full' })}
  </div>
</body>
</html>`;
};

// ─── Modal Component ────────────────────────────────────────────
const PrintableDatesheetModal = ({ datesheet, onClose }) => {
  if (!datesheet) return null;

  const entries = datesheet?.entries || [];
  const examTypeVariant = EXAM_TYPE_VARIANT[datesheet?.examType] || 'default';

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) {
      alert('Popup blocker is active. Please allow popups and try again.');
      return;
    }
    win.document.write(buildPrintHtml(datesheet));
    win.document.close();
    const img = win.document.querySelector('img');
    if (img) {
      img.onload = () => { win.focus(); win.print(); };
      img.onerror = () => { win.focus(); win.print(); };
      setTimeout(() => { win.focus(); win.print(); }, 600);
    } else {
      setTimeout(() => { win.focus(); win.print(); }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-surface-900 dark:text-white truncate">
                {datesheet.title || 'Examination Datesheet'}
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                {datesheet?.className || datesheet?.class?.name || 'Class'} &nbsp;·&nbsp; {fmt(datesheet?.startDate)} – {fmt(datesheet?.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Datesheet
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Info bar ── */}
        <div className="px-5 py-3 bg-primary-50/60 dark:bg-primary-950/20 border-b border-primary-100 dark:border-primary-900/40 flex flex-wrap gap-4 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 dark:text-primary-400">Exam Type</p>
            <Badge variant={examTypeVariant} size="sm">{datesheet.examType || '—'}</Badge>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 dark:text-primary-400">Academic Year</p>
            <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">{datesheet.academicYear || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 dark:text-primary-400">Total Subjects</p>
            <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">{entries.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500 dark:text-primary-400">Status</p>
            <Badge variant={datesheet.status === 'published' ? 'success' : 'warning'} dot size="sm">
              {datesheet.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Entries Table */}
          <div>
            <h3 className="text-sm font-bold text-surface-800 dark:text-white mb-3">Examination Schedule</h3>
            {entries.length === 0 ? (
              <div className="text-center py-10 text-surface-400 dark:text-surface-500">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No entries in this datesheet</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
                <table className="w-full text-sm">
                  <thead className="bg-primary-600 text-white">
                    <tr>
                      {['Subject', 'Date', 'Day', 'Time', 'Exam Hall', 'Total Marks', 'Passing Marks'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                    {entries.map((e, i) => (
                      <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-surface-900 dark:text-white">{e.subject || '—'}</td>
                        <td className="px-3 py-2.5 text-surface-700 dark:text-surface-300 whitespace-nowrap">{fmt(e.examDate)}</td>
                        <td className="px-3 py-2.5 text-surface-600 dark:text-surface-400">{dayName(e.examDate)}</td>
                        <td className="px-3 py-2.5 text-surface-700 dark:text-surface-300 whitespace-nowrap font-mono text-xs">
                          {e.startTime || '—'} – {e.endTime || '—'}
                        </td>
                        <td className="px-3 py-2.5 text-surface-700 dark:text-surface-300">{e.room || '—'}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-surface-900 dark:text-white">{e.totalMarks ?? '—'}</td>
                        <td className="px-3 py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-semibold">{e.passingMarks ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* General Instructions */}
          {datesheet.generalInstructions && (
            <div className="rounded-xl border border-primary-100 dark:border-primary-900/40 bg-primary-50/50 dark:bg-primary-950/20 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
                General Instructions
              </h3>
              <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">
                {datesheet.generalInstructions}
              </p>
            </div>
          )}

          {/* Signature preview */}
          <div className="flex justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
            <div className="text-center w-44">
              <div className="border-t-2 border-surface-300 dark:border-surface-600 mb-1.5" />
              <p className="text-xs font-bold text-surface-700 dark:text-surface-300">Controller of Examinations</p>
              <p className="text-[10px] text-surface-400">Signature &amp; Stamp</p>
            </div>
            <div className="text-center w-44">
              <div className="border-t-2 border-surface-300 dark:border-surface-600 mb-1.5" />
              <p className="text-xs font-bold text-surface-700 dark:text-surface-300">Principal</p>
              <p className="text-[10px] text-surface-400">Signature &amp; Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableDatesheetModal;
