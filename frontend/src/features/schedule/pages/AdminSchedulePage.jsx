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
  'w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]';
const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1 font-sans';
const btnPrimary =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60';
const btnGhost =
  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#5A0D1A]" />
            <h2 className="font-serif text-lg font-bold text-[#111827]">Setup Weekly Timetable</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer">
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
              <div key={day} className="rounded-xl border border-[#EFE5E0] bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF8F5] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
                >
                  <span className="font-serif font-bold text-sm text-[#111827]">{day}</span>
                  {expandedDay === day ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                </button>

                {expandedDay === day && (
                  <div className="p-3 space-y-2 bg-white">
                    {schedule[day].map((period, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3.5 ${
                          period.isBreak
                            ? 'border-amber-200 bg-amber-50/60'
                            : 'border-[#EFE5E0] bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-[#111827] w-16 shrink-0 font-sans">
                            {period.isBreak ? 'Break' : `Period ${period.periodNumber}`}
                          </span>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 ml-auto cursor-pointer">
                            <input
                              type="checkbox"
                              checked={period.isBreak}
                              onChange={(e) => updatePeriod(day, idx, 'isBreak', e.target.checked)}
                              className="accent-[#5A0D1A] cursor-pointer"
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
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#EFE5E0] bg-[#FAF8F5] shrink-0">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#EFE5E0] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5A0D1A]" />
            <h2 className="font-serif text-lg font-bold text-[#111827]">
              {isEdit ? 'Edit Datesheet' : 'Create Examination Datesheet'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
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
              <h3 className="font-serif text-sm font-bold text-[#111827]">Subject Entries</h3>
              <button onClick={addEntry} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5] text-[#5A0D1A] text-xs font-bold hover:bg-white transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>
            <div className="space-y-3">
              {entries.map((e, i) => (
                <div key={i} className="rounded-xl border border-[#EFE5E0] p-4 bg-[#FAF8F5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A0D1A] uppercase tracking-wider">Subject #{i + 1}</span>
                    {entries.length > 1 && (
                      <button onClick={() => removeEntry(i)} className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
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
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#EFE5E0] bg-[#FAF8F5] shrink-0">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button
            onClick={() => createMutation.mutate(buildPayload())}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-60"
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
      <table className="w-full text-xs border-collapse font-sans">
        <thead>
          <tr className="bg-[#5A0D1A] text-white">
            <th className="px-3.5 py-3 text-left font-bold text-[11px] uppercase tracking-wider w-28 border-r border-[#EFE5E0]/20">Period</th>
            {DAYS.map((d) => (
              <th key={d} className="px-3.5 py-3 text-center font-bold text-[11px] uppercase tracking-wider border-r border-[#EFE5E0]/20 last:border-r-0">
                {d.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EFE5E0]">
          {periods.map((_, pIdx) => {
            const firstCell = byDay[DAYS[0]][pIdx];
            return (
              <tr key={pIdx} className={firstCell?.isBreak ? 'bg-amber-50/60' : 'hover:bg-[#FAF8F5]/60 transition-colors'}>
                <td className="px-3.5 py-2.5 font-bold text-[#111827] bg-[#FAF8F5]/40 border-r border-[#EFE5E0] whitespace-nowrap">
                  {firstCell?.isBreak ? (
                    <span className="text-amber-800 font-bold">{firstCell.subject}</span>
                  ) : (
                    <>
                      <span className="font-bold text-[#111827]">P{pIdx + 1}</span><br />
                      <span className="text-[10px] font-semibold text-[#6B7280]">
                        {firstCell?.startTime} – {firstCell?.endTime}
                      </span>
                    </>
                  )}
                </td>
                {DAYS.map((d) => {
                  const cell = byDay[d][pIdx];
                  if (!cell) return <td key={d} className="px-3 py-2.5 text-center text-[#9CA3AF] border-r border-[#EFE5E0] last:border-r-0">—</td>;
                  if (cell.isBreak) {
                    return (
                      <td key={d} className="px-3 py-2.5 text-center border-r border-amber-200 last:border-r-0 bg-amber-50/60">
                        <span className="text-amber-800 font-bold">{cell.subject}</span>
                      </td>
                    );
                  }
                  return (
                    <td key={d} className="px-3.5 py-2.5 border-r border-[#EFE5E0] last:border-r-0">
                      {cell.subject ? (
                        <>
                          <p className="font-bold text-[#111827] leading-tight text-xs">{cell.subject}</p>
                          {cell.teacher?.fullName && <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">{cell.teacher.fullName}</p>}
                          {cell.room && <p className="text-[10px] text-[#6B7280]">{cell.room}</p>}
                        </>
                      ) : (
                        <span className="text-[#9CA3AF]">—</span>
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

  // Auto-select first class once loaded if none selected
  React.useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0]._id);
    }
  }, [classes, selectedClassId]);

  const TABS = [
    { id: 'timetables', label: 'Weekly Class Timetables' },
    { id: 'datesheets', label: 'Examination Datesheets' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[10px] font-bold tracking-wider uppercase text-[#5A0D1A]">
              Timetable & Examinations
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
            Academic Schedule & Datesheets
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#4B5563]">
            Configure weekly master period schedules and publish examination datesheets for all cohorts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditDatesheet(null); setShowDatesheetModal(true); }}
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#5A0D1A]" />}
          >
            Create Datesheet
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowTimetableModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Setup Timetable
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-[#EFE5E0] bg-white rounded-t-2xl px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? 'text-[#5A0D1A]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A0D1A]" />
            )}
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
              className="px-3.5 py-2.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] cursor-pointer shadow-2xs"
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
            <Card className="bg-white border border-[#EFE5E0] shadow-xs">
              <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
                <Calendar className="w-12 h-12 mb-3 text-[#5A0D1A]/40" />
                <p className="font-serif font-bold text-base text-[#111827]">Select a class to view its timetable</p>
                <p className="text-xs text-[#6B7280] mt-1">Choose from the dropdown above</p>
              </div>
            </Card>
          ) : loadingTimetable ? (
            <Card className="!p-0 overflow-hidden bg-white border border-[#EFE5E0] shadow-xs">
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            </Card>
          ) : !timetable ? (
            <Card className="bg-white border border-[#EFE5E0] shadow-xs">
              <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
                <AlertCircle className="w-12 h-12 mb-3 text-amber-500/60" />
                <p className="font-serif font-bold text-base text-[#111827]">No timetable found for this class</p>
                <p className="text-xs text-[#6B7280] mt-1">Setup the weekly lecture schedule using the button below</p>
                <button
                  onClick={() => { setShowTimetableModal(true); }}
                  className={`${btnPrimary} mt-4`}
                >
                  <Plus className="w-4 h-4" /> Setup Timetable
                </button>
              </div>
            </Card>
          ) : (
            <Card className="!p-0 overflow-hidden bg-white border border-[#EFE5E0] shadow-xs" header={
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-[#111827] text-base">
                    {classes.find((c) => c._id === selectedClassId)?.name} – Weekly Master Timetable
                  </h3>
                  {timetable.academicYear && (
                    <p className="text-xs text-[#6B7280] font-sans mt-0.5">Academic Year: <strong className="text-[#111827]">{timetable.academicYear}</strong></p>
                  )}
                </div>
                <button
                  onClick={() => setShowTimetableModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#5A0D1A]" /> Edit Timetable
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
            <Card className="bg-white border border-[#EFE5E0] shadow-xs">
              <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
                <BookOpen className="w-12 h-12 mb-3 text-[#5A0D1A]/40" />
                <p className="font-serif font-bold text-base text-[#111827]">No datesheets created yet</p>
                <p className="text-xs text-[#6B7280] mt-1">Publish an examination schedule for your students</p>
                <button
                  onClick={() => { setEditDatesheet(null); setShowDatesheetModal(true); }}
                  className={`${btnPrimary} mt-4`}
                >
                  <Plus className="w-4 h-4" /> Create Datesheet
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {datesheets.map((ds) => (
                <Card key={ds._id} hover className="flex flex-col gap-3 bg-white border border-[#EFE5E0] shadow-xs hover:border-[#5A0D1A]/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-[#111827] text-base leading-tight truncate">{ds.title}</h3>
                      <p className="text-xs text-[#5A0D1A] font-semibold mt-1">
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

                  <div className="text-xs text-[#6B7280] space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-[#5A0D1A]" />
                      {fmt(ds.startDate)} – {fmt(ds.endDate)}
                    </div>
                    <p className="font-semibold text-[#111827]">{ds.entries?.length ?? 0} subjects scheduled</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#EFE5E0]">
                    <button
                      onClick={() => { setEditDatesheet(ds); setShowDatesheetModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-[#111827] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    {ds.status !== 'published' && (
                      <button
                        onClick={() => { if (window.confirm('Publish this datesheet?')) publishMutation.mutate(ds._id); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    <button
                      onClick={() => { if (window.confirm('Delete this datesheet?')) deleteMutation.mutate(ds._id); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
