import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays, Clock, BookOpen, MapPin, Printer, AlertCircle,
  FileText, CheckCircle2, ChevronRight, Award
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import scheduleApi from '../api/scheduleApi';
import PrintableDatesheetModal from '../components/PrintableDatesheetModal';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

const TODAY_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

export default function StudentSchedulePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(TODAY_KEY) ? TODAY_KEY : 'monday');
  const [printDatesheet, setPrintDatesheet] = useState(null);

  // Queries
  const { data: routineData, isLoading: loadingRoutine } = useQuery({
    queryKey: ['studentRoutine'],
    queryFn: () => scheduleApi.getStudentRoutine(),
  });

  const { data: examsData, isLoading: loadingExams } = useQuery({
    queryKey: ['studentExams'],
    queryFn: () => scheduleApi.getStudentExams(),
  });

  const timetable = routineData?.timetable;
  const daySchedule = timetable?.days?.find((d) => d.day === selectedDay);
  const periods = daySchedule?.periods || [];

  const datesheets = examsData?.datesheets || [];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-[#5A0D1A]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#111827]">
              Class Routine &amp; Exam Schedule
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              {timetable?.class?.name ? `${timetable.class.name} • Academic Year ${timetable.academicYear}` : 'Your daily class periods and upcoming examination datesheets'}
            </p>
          </div>
        </div>

        {datesheets.length > 0 && (
          <button
            onClick={() => setPrintDatesheet(datesheets[0])}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Active Datesheet
          </button>
        )}
      </div>

      {/* ── Day Selector Tabs ── */}
      <div className="flex border-b border-[#EFE5E0] gap-1 overflow-x-auto pb-px">
        {DAYS.map((day) => {
          const isToday = day === TODAY_KEY;
          const dayData = timetable?.days?.find((d) => d.day === day);
          const count = dayData?.periods?.filter(p => !p.isBreak)?.length || 0;

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
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFE5E0] text-[#111827] font-semibold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Daily Class Routine Card ── */}
      <Card bodyClassName="p-0 overflow-hidden bg-white border border-[#EFE5E0] shadow-xs">
        <div className="px-5 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-sm font-bold text-[#111827] uppercase tracking-wider">
              {DAY_LABELS[selectedDay]} Class Routine
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Subject timetable, assigned faculty, and room locations
            </p>
          </div>
          <Badge variant="primary">
            {periods.filter(p => !p.isBreak).length} Academic Periods
          </Badge>
        </div>

        {loadingRoutine ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : !timetable ? (
          <div className="py-14 text-center text-[#6B7280]">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#5A0D1A]" />
            <p className="font-serif font-bold text-sm text-[#111827]">
              No timetable configured for your class yet
            </p>
            <p className="text-xs mt-1">Please check back soon or consult the administration.</p>
          </div>
        ) : periods.length === 0 ? (
          <div className="py-14 text-center text-[#6B7280]">
            <p className="font-serif font-bold text-sm text-[#111827]">
              No classes scheduled on {DAY_LABELS[selectedDay]}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFE5E0]">
            {periods.map((period, idx) => {
              if (period.isBreak) {
                return (
                  <div
                    key={idx}
                    className="px-6 py-3 bg-amber-50/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-amber-800 flex items-center gap-2">
                      🥪 {period.subject || 'Break / Recess'}
                    </span>
                    <span className="text-[#6B7280] font-mono">
                      {period.startTime} – {period.endTime}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold font-mono text-[#5A0D1A]">
                        #{period.periodNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">
                        {period.subject}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                        {period.teacher?.fullName && (
                          <span className="font-semibold text-[#111827]">
                            Instructor: {period.teacher.fullName}
                          </span>
                        )}
                        {period.teacher?.fullName && <span>•</span>}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {period.room || 'Classroom'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#EFE5E0] text-[#111827]">
                      {period.startTime} – {period.endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Upcoming Examination Datesheets ── */}
      <Card bodyClassName="p-0 overflow-hidden bg-white border border-[#EFE5E0] shadow-xs">
        <div className="px-5 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#5A0D1A]" />
            <h2 className="font-serif text-sm font-bold text-[#111827] uppercase tracking-wider">
              Official Examination Datesheets
            </h2>
          </div>
          <Badge variant="primary">{datesheets.length} Published</Badge>
        </div>

        {loadingExams ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : datesheets.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280]">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#5A0D1A]" />
            <p className="font-serif font-bold text-sm text-[#111827]">
              No examination datesheets published for your cohort at this time
            </p>
            <p className="text-xs mt-1">Upcoming midterm and final datesheets will appear here automatically.</p>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {datesheets.map((ds) => (
              <div
                key={ds._id}
                className="rounded-2xl border border-[#EFE5E0] bg-white overflow-hidden shadow-xs"
              >
                <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#EFE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-[#111827]">
                        {ds.title}
                      </h3>
                      <Badge variant="danger">{ds.examType?.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1 font-sans">
                      Academic Year: <strong className="text-[#111827]">{ds.academicYear}</strong> • Class: <strong className="text-[#111827]">{ds.class?.name}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setPrintDatesheet(ds)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Examination Slip
                  </button>
                </div>

                {/* Papers list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0] text-[#6B7280] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Day</th>
                        <th className="px-4 py-3">Timing</th>
                        <th className="px-4 py-3">Hall</th>
                        <th className="px-4 py-3 text-right">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE5E0]">
                      {ds.entries?.map((e, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#111827]">
                            {e.subject}
                          </td>
                          <td className="px-4 py-3 text-[#111827] whitespace-nowrap font-medium">
                            {e.examDate ? new Date(e.examDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-4 py-3 text-[#6B7280]">
                            {e.day || (e.examDate ? new Date(e.examDate).toLocaleDateString('en-PK', { weekday: 'long' }) : '—')}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-[#5A0D1A] whitespace-nowrap">
                            {e.startTime} – {e.endTime}
                          </td>
                          <td className="px-4 py-3 text-[#4B5563]">
                            {e.room || 'Main Hall'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#111827]">
                            {e.totalMarks || 100}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {ds.generalInstructions && (
                  <div className="p-4 bg-amber-50/60 border-t border-[#EFE5E0] text-xs">
                    <p className="font-bold text-amber-900 mb-1">
                      ⚠️ Examination Instructions &amp; Hall Regulations:
                    </p>
                    <p className="text-amber-800 whitespace-pre-line leading-relaxed">
                      {ds.generalInstructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Printable Datesheet Modal ── */}
      {printDatesheet && (
        <PrintableDatesheetModal
          datesheet={printDatesheet}
          onClose={() => setPrintDatesheet(null)}
        />
      )}
    </div>
  );
}
