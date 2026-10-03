import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Plus, Settings, ChevronDown, ChevronUp, Trash2, Pencil,
  Send, BookOpen, Clock, AlertCircle, RefreshCw, X, Check,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import scheduleApi from '../api/scheduleApi';
import { classApi } from '../../classes/api/classApi';
import { teacherApi } from '../../teachers/api/teacherApi';

// ─── Helpers ────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EXAM_TYPES = ['Midterm', 'Final', 'Monthly Test', 'Mock Board'];
const EXAM_TYPE_VARIANT = {
  Midterm: 'info', Final: 'danger', 'Monthly Test': 'warning', 'Mock Board': 'primary',
};
const STATUS_VARIANT = { draft: 'warning', published: 'success', archived: 'default' };

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const selectCls =
  'w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const inputCls =
  'w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';
const labelCls = 'block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1';
const btnPrimary =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60';
const btnGhost =
  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer';

// ─── Default periods ────────────────────────────────────────────
const makeDefaultPeriods = () => [
  { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', subject: '', teacher: '', room: '', isBreak: false },
  { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', subject: '', teacher: '', room: '', isBreak: false },
  { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', subject: '', teacher: '', room: '', isBreak: false },
  { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', subject: 'Morning Break', teacher: '', room: '', isBreak: true },
  { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', subject: '', teacher: '', room: '', isBreak: false },
  { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', subject: '', teacher: '', room: '', isBreak: false },
  { periodNumber: 7, startTime: '12:00 PM', endTime: '12:30 PM', subject: 'Lunch & Prayer Break', teacher: '', room: '', isBreak: true },
  { periodNumber: 8, startTime: '12:30 PM', endTime: '01:15 PM', subject: '', teacher: '', room: '', isBreak: false },
  { periodNumber: 9, startTime: '01:15 PM', endTime: '02:00 PM', subject: '', teacher: '', room: '', isBreak: false },
];

const makeDefaultSchedule = () =>
  DAYS.reduce((acc, day) => { acc[day] = makeDefaultPeriods(); return acc; }, {});

// ─── CreateTimetableModal ────────────────────────────────────────
const CreateTimetableModal = ({ onClose, onSuccess, classes, teachers, initialClassId }) => {
  const [classId, setClassId] = useState(initialClassId || '');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [notes, setNotes] = useState('');
  const [schedule, setSchedule] = useState(makeDefaultSchedule());
  const [expandedDay, setExpandedDay] = useState('Monday');

  const mutation = useMutation({
    mutationFn: (data) => scheduleApi.upsertTimetable(data),
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const toggleDay = (day) => setExpandedDay((p) => (p === day ? null : day));

  const updatePeriod = (day, idx, field, value) => {
    setSchedule((prev) => {
      const copy = { ...prev, [day]: prev[day].map((p, i) => i === idx ? { ...p, [field]: value } : p) };
      return copy;
    });
  };

  const handleSave = () => {
    if (!classId) return alert('Please select a class');
    const entries = [];
    DAYS.forEach((day) => {
      schedule[day].forEach((p) => {
        entries.push({ day, ...p, teacher: p.teacher || undefined });
      });
    });
    mutation.mutate({ classId, academicYear, notes, entries });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-bold text-surface-900 dark:text-white">Setup Weekly Timetable</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Top fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Class *</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className={selectCls}>
                <option value="">Select class…</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Academic Year</label>
              <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={inputCls} placeholder="e.g. 2025-2026" />
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="Optional notes…" />
            </div>
          </div>

          {/* Day accordions */}
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-surface-800 dark:text-white">{day}</span>
                  {expandedDay === day ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
                </button>

                {expandedDay === day && (
                  <div className="p-3 space-y-2">
                    {schedule[day].map((period, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 ${
                          period.isBreak
                            ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20'
                            : 'border-surface-200 dark:border-surface-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-surface-600 dark:text-surface-400 w-16 shrink-0">
                            {period.isBreak ? 'Break' : `Period ${period.periodNumber}`}
                          </span>
                          <label className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 ml-auto cursor-pointer">
                            <input
                              type="checkbox"
                              checked={period.isBreak}
                              onChange={(e) => updatePeriod(day, idx, 'isBreak', e.target.checked)}
                              className="accent-amber-500 cursor-pointer"
                            />
                            Break
                          </label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          <div>
                            <label className={labelCls}>Start</label>
                            <input value={period.startTime} onChange={(e) => updatePeriod(day, idx, 'startTime', e.target.value)} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>End</label>
                            <input value={period.endTime} onChange={(e) => updatePeriod(day, idx, 'endTime', e.target.value)} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Subject</label>
                            <input
                              value={period.subject}
                              onChange={(e) => updatePeriod(day, idx, 'subject', e.target.value)}
                              className={inputCls}
                              disabled={period.isBreak}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Teacher</label>
                            <select
                              value={period.teacher}
                              onChange={(e) => updatePeriod(day, idx, 'teacher', e.target.value)}
                              className={selectCls}
                              disabled={period.isBreak}
                            >
                              <option value="">—</option>
                              {(teachers || []).map((t) => (
                                <option key={t._id} value={t._id}>{t.fullName}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Room</label>
                            <input
                              value={period.room}
                              onChange={(e) => updatePeriod(day, idx, 'room', e.target.value)}
                              className={inputCls}
                              disabled={period.isBreak}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 shrink-0">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button onClick={handleSave} disabled={mutation.isPending} className={btnPrimary}>
            {mutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CreateDatesheetModal ────────────────────────────────────────
const makeEntry = () => ({
  subject: '', examDate: '', startTime: '', endTime: '',
  room: '', invigilator: '', totalMarks: '', passingMarks: '', syllabus: '',
});

const CreateDatesheetModal = ({ onClose, onSuccess, classes, editDatesheet }) => {
  const isEdit = !!editDatesheet;
  const [form, setForm] = useState({
    title: editDatesheet?.title || '',
    examType: editDatesheet?.examType || 'Midterm',
    classId: editDatesheet?.class?._id || editDatesheet?.classId || '',
    academicYear: editDatesheet?.academicYear || new Date().getFullYear().toString(),
    startDate: editDatesheet?.startDate?.slice(0, 10) || '',
    endDate: editDatesheet?.endDate?.slice(0, 10) || '',
    generalInstructions: editDatesheet?.generalInstructions || '',
  });
  const [entries, setEntries] = useState(
    editDatesheet?.entries?.length ? editDatesheet.entries.map((e) => ({
      subject: e.subject || '',
      examDate: e.examDate?.slice(0, 10) || '',
      startTime: e.startTime || '',
      endTime: e.endTime || '',
      room: e.room || '',
      invigilator: e.invigilator || '',
      totalMarks: e.totalMarks ?? '',
      passingMarks: e.passingMarks ?? '',
      syllabus: e.syllabus || '',
    })) : [makeEntry()]
  );

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setEntry = (i, k, v) => setEntries((p) => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const addEntry = () => setEntries((p) => [...p, makeEntry()]);
  const removeEntry = (i) => setEntries((p) => p.filter((_, idx) => idx !== i));

  const createMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? scheduleApi.updateDatesheet(editDatesheet._id, payload) : scheduleApi.createDatesheet(payload),
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const publishMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? scheduleApi.updateDatesheet(editDatesheet._id, payload).then(() => scheduleApi.publishDatesheet(editDatesheet._id))
        : scheduleApi.createDatesheet({ ...payload, status: 'published' }),
    onSuccess: () => { onSuccess(); onClose(); },
  });

  const buildPayload = () => ({
    ...form,
    entries: entries.map((e) => ({
      ...e,
      totalMarks: e.totalMarks !== '' ? Number(e.totalMarks) : undefined,
      passingMarks: e.passingMarks !== '' ? Number(e.passingMarks) : undefined,
    })),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-bold text-surface-900 dark:text-white">
              {isEdit ? 'Edit Datesheet' : 'Create Examination Datesheet'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Datesheet Title *</label>
              <input value={form.title} onChange={(e) => setField('title', e.target.value)} className={inputCls} placeholder="e.g. Final Term Examinations 2025" />
            </div>
            <div>
              <label className={labelCls}>Exam Type *</label>
              <select value={form.examType} onChange={(e) => setField('examType', e.target.value)} className={selectCls}>
                {EXAM_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Class *</label>
              <select value={form.classId} onChange={(e) => setField('classId', e.target.value)} className={selectCls}>
                <option value="">Select class…</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Academic Year</label>
              <input value={form.academicYear} onChange={(e) => setField('academicYear', e.target.value)} className={inputCls} placeholder="2025-2026" />
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>General Instructions</label>
              <textarea
                value={form.generalInstructions}
                onChange={(e) => setField('generalInstructions', e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Instructions for students…"
              />
            </div>
          </div>

          {/* Entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-surface-800 dark:text-white">Subject Entries</h3>
              <button onClick={addEntry} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold hover:brightness-95 transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>
            <div className="space-y-3">
              {entries.map((e, i) => (
                <div key={i} className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/50 dark:bg-surface-700/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-surface-500 dark:text-surface-400">Subject #{i + 1}</span>
                    {entries.length > 1 && (
                      <button onClick={() => removeEntry(i)} className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    <div>
                      <label className={labelCls}>Subject</label>
                      <input value={e.subject} onChange={(ev) => setEntry(i, 'subject', ev.target.value)} className={inputCls} placeholder="Mathematics" />
                    </div>
                    <div>
                      <label className={labelCls}>Exam Date</label>
                      <input type="date" value={e.examDate} onChange={(ev) => setEntry(i, 'examDate', ev.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Start Time</label>
                      <input value={e.startTime} onChange={(ev) => setEntry(i, 'startTime', ev.target.value)} className={inputCls} placeholder="09:00 AM" />
                    </div>
                    <div>
                      <label className={labelCls}>End Time</label>
                      <input value={e.endTime} onChange={(ev) => setEntry(i, 'endTime', ev.target.value)} className={inputCls} placeholder="12:00 PM" />
                    </div>
                    <div>
                      <label className={labelCls}>Exam Hall / Room</label>
                      <input value={e.room} onChange={(ev) => setEntry(i, 'room', ev.target.value)} className={inputCls} placeholder="Hall A" />
                    </div>
                    <div>
                      <label className={labelCls}>Invigilator</label>
                      <input value={e.invigilator} onChange={(ev) => setEntry(i, 'invigilator', ev.target.value)} className={inputCls} placeholder="Teacher name" />
                    </div>
                    <div>
                      <label className={labelCls}>Total Marks</label>
                      <input type="number" value={e.totalMarks} onChange={(ev) => setEntry(i, 'totalMarks', ev.target.value)} className={inputCls} placeholder="100" />
                    </div>
                    <div>
                      <label className={labelCls}>Passing Marks</label>
                      <input type="number" value={e.passingMarks} onChange={(ev) => setEntry(i, 'passingMarks', ev.target.value)} className={inputCls} placeholder="40" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className={labelCls}>Syllabus (optional)</label>
                      <input value={e.syllabus} onChange={(ev) => setEntry(i, 'syllabus', ev.target.value)} className={inputCls} placeholder="Chapters 1-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 shrink-0">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button
            onClick={() => createMutation.mutate(buildPayload())}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer disabled:opacity-60"
          >
            {createMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            Save as Draft
          </button>
          <button
            onClick={() => publishMutation.mutate(buildPayload())}
            disabled={publishMutation.isPending}
            className={btnPrimary}
          >
            {publishMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isEdit ? 'Update & Publish' : 'Save & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Timetable Grid ─────────────────────────────────────────────
const TimetableGrid = ({ timetable }) => {
  if (!timetable) return null;
  const entries = timetable.entries || [];

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = entries.filter((e) => e.day === d).sort((a, b) => a.periodNumber - b.periodNumber);
    return acc;
  }, {});

  const periods = byDay[DAYS[0]] || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-primary-600 text-white">
            <th className="px-3 py-2.5 text-left font-bold text-[11px] uppercase tracking-wider w-28 border-r border-primary-500">Period</th>
            {DAYS.map((d) => (
              <th key={d} className="px-3 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider border-r border-primary-500 last:border-r-0">
                {d.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
          {periods.map((_, pIdx) => {
            const firstCell = byDay[DAYS[0]][pIdx];
            return (
              <tr key={pIdx} className={firstCell?.isBreak ? 'bg-amber-50 dark:bg-amber-950/20' : 'hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors'}>
                <td className="px-3 py-2.5 font-semibold text-surface-600 dark:text-surface-400 border-r border-surface-200 dark:border-surface-700 whitespace-nowrap">
                  {firstCell?.isBreak ? (
                    <span className="text-amber-700 dark:text-amber-400">{firstCell.subject}</span>
                  ) : (
                    <>P{pIdx + 1}<br />
                      <span className="text-[10px] font-normal text-surface-400 dark:text-surface-500">
                        {firstCell?.startTime} – {firstCell?.endTime}
                      </span>
                    </>
                  )}
                </td>
                {DAYS.map((d) => {
                  const cell = byDay[d][pIdx];
                  if (!cell) return <td key={d} className="px-3 py-2.5 text-center text-surface-300 dark:text-surface-600 border-r border-surface-200 dark:border-surface-700 last:border-r-0">—</td>;
                  if (cell.isBreak) {
                    return (
                      <td key={d} className="px-3 py-2.5 text-center border-r border-amber-200 dark:border-amber-800/30 last:border-r-0">
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">{cell.subject}</span>
                      </td>
                    );
                  }
                  return (
                    <td key={d} className="px-3 py-2.5 border-r border-surface-200 dark:border-surface-700 last:border-r-0">
                      {cell.subject ? (
                        <>
                          <p className="font-semibold text-surface-900 dark:text-white leading-tight">{cell.subject}</p>
                          {cell.teacher?.fullName && <p className="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5">{cell.teacher.fullName}</p>}
                          {cell.room && <p className="text-[10px] text-surface-400 dark:text-surface-500">{cell.room}</p>}
                        </>
                      ) : (
                        <span className="text-surface-300 dark:text-surface-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────
const AdminSchedulePage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('timetables');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showDatesheetModal, setShowDatesheetModal] = useState(false);
  const [editDatesheet, setEditDatesheet] = useState(null);

  // ── Queries ──
  const { data: classesData } = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: () => classApi.getClasses({ limit: 100 }),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', 'all'],
    queryFn: () => teacherApi.getTeachers({ limit: 100 }),
  });

  const {
    data: timetableData,
    isLoading: loadingTimetable,
    refetch: refetchTimetable,
  } = useQuery({
    queryKey: ['timetable', selectedClassId],
    queryFn: () => scheduleApi.getTimetableByClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  const {
    data: datesheetsData,
    isLoading: loadingDatesheets,
    refetch: refetchDatesheets,
  } = useQuery({
    queryKey: ['datesheets', 'admin'],
    queryFn: () => scheduleApi.getDatesheets({}),
    enabled: activeTab === 'datesheets',
  });

  const publishMutation = useMutation({
    mutationFn: (id) => scheduleApi.publishDatesheet(id),
    onSuccess: () => refetchDatesheets(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.deleteDatesheet(id),
    onSuccess: () => refetchDatesheets(),
  });

  const classes = classesData?.classes || [];
  const teachers = teachersData?.teachers || teachersData || [];
  const timetable = timetableData?.timetable || timetableData;
  const datesheets = datesheetsData?.datesheets || datesheetsData || [];

  const TABS = [
    { id: 'timetables', label: 'Weekly Class Timetables' },
    { id: 'datesheets', label: 'Examination Datesheets' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
              Class Timetable &amp; Exam Scheduler
            </h1>
            <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
              Manage weekly timetables and examination datesheets for all classes
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => { setEditDatesheet(null); setShowDatesheetModal(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold hover:brightness-95 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Datesheet
          </button>
          <button
            onClick={() => setShowTimetableModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Setup Timetable
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Timetables ── */}
      {activeTab === 'timetables' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">Select a class to view timetable…</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {selectedClassId && (
              <button
                onClick={() => refetchTimetable()}
                className={btnGhost}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>

          {!selectedClassId ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500">
                <Calendar className="w-12 h-12 mb-3 opacity-25" />
                <p className="font-semibold text-surface-600 dark:text-surface-400">Select a class to view its timetable</p>
                <p className="text-sm mt-1">Choose from the dropdown above</p>
              </div>
            </Card>
          ) : loadingTimetable ? (
            <Card className="!p-0 overflow-hidden">
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            </Card>
          ) : !timetable ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500">
                <AlertCircle className="w-12 h-12 mb-3 opacity-25" />
                <p className="font-semibold text-surface-600 dark:text-surface-400">No timetable found for this class</p>
                <p className="text-sm mt-1">Create one using the button below</p>
                <button
                  onClick={() => { setShowTimetableModal(true); }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Setup Timetable
                </button>
              </div>
            </Card>
          ) : (
            <Card className="!p-0 overflow-hidden" header={
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white text-sm">
                    {classes.find((c) => c._id === selectedClassId)?.name} – Weekly Timetable
                  </h3>
                  {timetable.academicYear && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Academic Year: {timetable.academicYear}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowTimetableModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Timetable
                </button>
              </div>
            }>
              <TimetableGrid timetable={timetable} />
            </Card>
          )}
        </div>
      )}

      {/* ── Tab: Datesheets ── */}
      {activeTab === 'datesheets' && (
        <div className="space-y-4">
          {loadingDatesheets ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
            </div>
          ) : datesheets.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-surface-400 dark:text-surface-500">
                <BookOpen className="w-12 h-12 mb-3 opacity-25" />
                <p className="font-semibold text-surface-600 dark:text-surface-400">No datesheets created yet</p>
                <p className="text-sm mt-1">Create your first examination datesheet</p>
                <button
                  onClick={() => { setEditDatesheet(null); setShowDatesheetModal(true); }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Datesheet
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {datesheets.map((ds) => (
                <Card key={ds._id} hover className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-surface-900 dark:text-white text-sm leading-tight truncate">{ds.title}</h3>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                        {ds.class?.name || ds.className || '—'}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[ds.status] || 'default'} dot size="sm">
                      {ds.status ? ds.status.charAt(0).toUpperCase() + ds.status.slice(1) : 'Draft'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={EXAM_TYPE_VARIANT[ds.examType] || 'default'} size="sm">{ds.examType}</Badge>
                    {ds.academicYear && <Badge variant="secondary" size="sm">{ds.academicYear}</Badge>}
                  </div>

                  <div className="text-xs text-surface-600 dark:text-surface-400 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 shrink-0" />
                      {fmt(ds.startDate)} – {fmt(ds.endDate)}
                    </div>
                    <p>{ds.entries?.length ?? 0} subjects scheduled</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-surface-100 dark:border-surface-700">
                    <button
                      onClick={() => { setEditDatesheet(ds); setShowDatesheetModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    {ds.status !== 'published' && (
                      <button
                        onClick={() => { if (window.confirm('Publish this datesheet?')) publishMutation.mutate(ds._id); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    <button
                      onClick={() => { if (window.confirm('Delete this datesheet?')) deleteMutation.mutate(ds._id); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showTimetableModal && (
        <CreateTimetableModal
          classes={classes}
          teachers={teachers}
          initialClassId={selectedClassId}
          onClose={() => setShowTimetableModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['timetable', selectedClassId] });
          }}
        />
      )}

      {showDatesheetModal && (
        <CreateDatesheetModal
          classes={classes}
          editDatesheet={editDatesheet}
          onClose={() => { setShowDatesheetModal(false); setEditDatesheet(null); }}
          onSuccess={() => refetchDatesheets()}
        />
      )}
    </div>
  );
};

export default AdminSchedulePage;
