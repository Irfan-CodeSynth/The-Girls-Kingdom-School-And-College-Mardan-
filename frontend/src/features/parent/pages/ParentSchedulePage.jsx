import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  Printer,
  BookOpen,
  MapPin,
  Calendar,
  AlertCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';
import parentApi from '../api/parentApi';
import ChildSelectorBar from '../components/ChildSelectorBar';
import PrintableDatesheetModal from '../../schedule/components/PrintableDatesheetModal';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

const TODAY_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
  new Date().getDay()
];

export const ParentSchedulePage = () => {
  const { selectedChildId, selectedChild } = useParentChild();
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'timetable'
  const [selectedDay, setSelectedDay] = useState(
    DAYS.includes(TODAY_KEY) ? TODAY_KEY : 'monday'
  );
  const [printDatesheet, setPrintDatesheet] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildExams', selectedChildId],
    queryFn: () => parentApi.getChildExams(selectedChildId),
    enabled: Boolean(selectedChildId),
  });

  const datesheets = data?.datesheets || [];
  const timetable = data?.timetable || null;
  const currentClass = data?.class || selectedChild?.class;

  const daySchedule = timetable?.days?.find((d) => d.day === selectedDay);
  const periods = daySchedule?.periods || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ward Selector Bar */}
      <ChildSelectorBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#111827]">
            Exam Datesheets & Timetable
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Institutional examinations routine and daily classroom schedule for {selectedChild?.fullName || 'student'}
            {currentClass?.name ? ` (${currentClass.name})` : ''}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#EFE5E0] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exams'
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Exam Datesheets ({datesheets.length})
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timetable'
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Class Routine
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : activeTab === 'exams' ? (
        /* ─── Examination Datesheets Section ─── */
        <div className="space-y-6">
          {datesheets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center text-xs text-[#6B7280]">
              <Calendar className="w-10 h-10 text-[#6B7280]/40 mx-auto mb-3" />
              <p className="font-semibold text-sm text-[#111827]">No Published Datesheets</p>
              <p className="mt-1">
                There are currently no active examination date sheets published for this class.
              </p>
            </div>
          ) : (
            datesheets.map((ds) => {
              const startFmt = ds.startDate
                ? new Date(ds.startDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';
              const endFmt = ds.endDate
                ? new Date(ds.endDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—';

              return (
                <div
                  key={ds._id}
                  className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs"
                >
                  {/* Datesheet Header */}
                  <div className="p-5 bg-[#FAF8F5] border-b border-[#EFE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-lg font-bold text-[#111827]">
                          {ds.title}
                        </h2>
                        <Badge variant="primary" className="text-[10px]">
                          {ds.examType || 'Term Examination'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Schedule Duration: {startFmt} – {endFmt} • Academic Year {ds.academicYear || '2025-2026'}
                      </p>
                    </div>

                    <button
                      onClick={() => setPrintDatesheet(ds)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Printer className="w-4 h-4" />
                      Print Official Slip
                    </button>
                  </div>

                  {/* Entries Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5]/60 text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#EFE5E0]">
                        <tr>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Exam Date</th>
                          <th className="py-3 px-4">Time Slot</th>
                          <th className="py-3 px-4">Room / Hall</th>
                          <th className="py-3 px-4">Total Marks</th>
                          <th className="py-3 px-4">Syllabus Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE5E0]">
                        {(ds.entries || []).map((entry, idx) => {
                          const examDateFmt = entry.examDate
                            ? new Date(entry.examDate).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—';

                          return (
                            <tr key={idx} className="hover:bg-[#FAF8F5]/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-[#111827]">
                                {entry.subject}
                              </td>
                              <td className="py-3 px-4 text-[#111827] font-medium">
                                {examDateFmt}
                              </td>
                              <td className="py-3 px-4 text-[#6B7280]">
                                {entry.startTime} – {entry.endTime}
                              </td>
                              <td className="py-3 px-4 text-[#6B7280]">
                                {entry.room || 'Examination Hall'}
                              </td>
                              <td className="py-3 px-4 font-bold text-[#5A0D1A]">
                                {entry.totalMarks || 100} Marks
                              </td>
                              <td className="py-3 px-4 text-[#6B7280] max-w-xs truncate">
                                {entry.syllabus || 'As communicated in classroom'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ─── Daily Class Timetable Section ─── */
        <div className="space-y-6">
          {!timetable ? (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center text-xs text-[#6B7280]">
              <Clock className="w-10 h-10 text-[#6B7280]/40 mx-auto mb-3" />
              <p className="font-semibold text-sm text-[#111827]">No Active Timetable</p>
              <p className="mt-1">
                A daily routine has not been uploaded for this student&apos;s class section yet.
              </p>
            </div>
          ) : (
            <>
              {/* Day Selector Tabs */}
              <div className="flex border-b border-[#EFE5E0] gap-1 overflow-x-auto pb-px">
                {DAYS.map((day) => {
                  const isToday = day === TODAY_KEY;
                  const dayData = timetable?.days?.find((d) => d.day === day);
                  const count = dayData?.periods?.filter((p) => !p.isBreak)?.length || 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                        selectedDay === day
                          ? 'border-[#5A0D1A] text-[#5A0D1A] bg-[#FAF8F5]'
                          : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      <span>{DAY_LABELS[day]}</span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Today
                        </span>
                      )}
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-[#111827]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Day Periods Grid */}
              <div className="bg-white rounded-2xl border border-[#EFE5E0] p-6 shadow-xs">
                {periods.length === 0 ? (
                  <p className="text-center text-xs text-[#6B7280] py-8">
                    No periods scheduled for {DAY_LABELS[selectedDay]}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {periods.map((period, idx) => {
                      if (period.isBreak) {
                        return (
                          <div
                            key={idx}
                            className="md:col-span-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-amber-900">
                              ☕ {period.subject || 'Break / Recess'}
                            </span>
                            <span className="text-amber-800 font-medium">
                              {period.startTime} – {period.endTime}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/30 hover:border-[#5A0D1A]/30 transition-all flex items-start justify-between"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A0D1A]">
                              Period {period.periodNumber || idx + 1}
                            </span>
                            <p className="font-serif font-bold text-sm text-[#111827]">
                              {period.subject}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              Teacher: {period.teacher?.fullName || period.teacherName || 'Faculty Member'}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-xs font-semibold text-[#111827] block">
                              {period.startTime} – {period.endTime}
                            </span>
                            {period.room && (
                              <Badge variant="outline" className="text-[10px]">
                                Room {period.room}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Datesheet Modal */}
      {printDatesheet && (
        <PrintableDatesheetModal
          datesheet={printDatesheet}
          onClose={() => setPrintDatesheet(null)}
        />
      )}
    </div>
  );
};

export default ParentSchedulePage;
