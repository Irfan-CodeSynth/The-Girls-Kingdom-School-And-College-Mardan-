import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Clock, BookOpen, MapPin, Users, CheckCircle2,
  AlertCircle, RefreshCw, Sparkles, Shield
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import scheduleApi from '../api/scheduleApi';

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

export default function TeacherSchedulePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(TODAY_KEY) ? TODAY_KEY : 'monday');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['teacherSchedule'],
    queryFn: () => scheduleApi.getTeacherSchedule(),
  });

  const { data: examData, isLoading: loadingExams } = useQuery({
    queryKey: ['allDatesheetsTeacher'],
    queryFn: () => scheduleApi.getDatesheets({ status: 'published' }),
  });

  const schedule = data?.schedule || {};
  const activeDayPeriods = schedule[selectedDay] || [];

  // Count total classes taught this week
  const totalClassesWeek = Object.values(schedule).reduce(
    (acc, periods) => acc + (periods?.filter(p => !p.isBreak)?.length || 0),
    0
  );

  // Extract exams where this teacher is an invigilator (or list published exams)
  const allDatesheets = examData?.datesheets || [];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#5A0D1A]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#111827]">
              My Teaching Timetable
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Weekly assigned periods, classroom venues, and examination invigilation duties
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EFE5E0] bg-white text-[#111827] text-xs font-bold hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#5A0D1A] ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card bodyClassName="flex items-center gap-4 p-4 bg-white border border-[#EFE5E0] shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-[#5A0D1A]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-serif font-bold text-[#111827] leading-tight">
              {isLoading ? '…' : totalClassesWeek}
            </p>
            <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider">Classes This Week</p>
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4 p-4 bg-white border border-[#EFE5E0] shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-serif font-bold text-[#111827] leading-tight">
              {isLoading ? '…' : (schedule[TODAY_KEY]?.filter(p => !p.isBreak)?.length || 0)}
            </p>
            <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider">Scheduled Today</p>
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4 p-4 bg-white border border-[#EFE5E0] shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-serif font-bold text-[#111827] leading-tight">
              {loadingExams ? '…' : allDatesheets.length}
            </p>
            <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider">Active Exam Schedules</p>
          </div>
        </Card>

        <Card bodyClassName="flex items-center gap-4 p-4 bg-white border border-[#EFE5E0] shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-[#5A0D1A]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-serif font-bold text-[#111827] leading-tight">
              08:00 AM – 02:00 PM
            </p>
            <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider">Academic Shift</p>
          </div>
        </Card>
      </div>

      {/* ── Day Selector Tabs ── */}
      <div className="flex border-b border-[#EFE5E0] gap-1 overflow-x-auto pb-px">
        {DAYS.map((day) => {
          const isToday = day === TODAY_KEY;
          const count = schedule[day]?.filter(p => !p.isBreak)?.length || 0;
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

      {/* ── Active Day Routine Table ── */}
      <Card bodyClassName="p-0 overflow-hidden bg-white border border-[#EFE5E0] shadow-xs">
        <div className="px-5 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-sm font-bold text-[#111827] uppercase tracking-wider">
              {DAY_LABELS[selectedDay]} Schedule
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Assigned lectures and laboratory sessions for this day
            </p>
          </div>
          <Badge variant="primary">
            {activeDayPeriods.filter(p => !p.isBreak).length} Lectures
          </Badge>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : activeDayPeriods.length === 0 ? (
          <div className="py-14 text-center text-[#6B7280]">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#5A0D1A]" />
            <p className="font-serif font-bold text-sm text-[#111827]">
              No classes scheduled for {DAY_LABELS[selectedDay]}
            </p>
            <p className="text-xs mt-1">Enjoy your free period or preparation time!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFE5E0]">
            {activeDayPeriods.map((period, idx) => {
              if (period.isBreak) {
                return (
                  <div
                    key={idx}
                    className="px-6 py-3 bg-amber-50/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-amber-800 flex items-center gap-2">
                      ☕ {period.subject || 'Break / Recess'}
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
                        P{period.periodNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">
                        {period.subject}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1 font-semibold text-[#5A0D1A]">
                          <Users className="w-3.5 h-3.5" />
                          {period.class?.name || 'Class cohort'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {period.room || 'Classroom'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EFE5E0] text-[#111827]">
                      {period.startTime} – {period.endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Active Exam Datesheets & Invigilation ── */}
      <Card bodyClassName="p-0 overflow-hidden bg-white border border-[#EFE5E0] shadow-xs">
        <div className="px-5 py-4 border-b border-[#EFE5E0] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-600" />
            <h2 className="font-serif text-sm font-bold text-[#111827] uppercase tracking-wider">
              Examination Schedules &amp; Institutional Datesheets
            </h2>
          </div>
          <Badge variant="warning">{allDatesheets.length} Scheduled</Badge>
        </div>

        {loadingExams ? (
          <div className="p-5 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : allDatesheets.length === 0 ? (
          <div className="py-10 text-center text-[#6B7280]">
            <p className="text-xs">No active examination datesheets published currently.</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {allDatesheets.map((ds) => (
              <div
                key={ds._id}
                className="p-4 rounded-xl border border-[#EFE5E0] bg-white shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#111827]">
                      {ds.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                      Class: <span className="font-semibold text-[#5A0D1A]">{ds.class?.name}</span>
                    </p>
                  </div>
                  <Badge variant="success">Published</Badge>
                </div>

                <div className="text-xs text-[#6B7280] space-y-1 pt-1 border-t border-[#EFE5E0]">
                  <p><strong>Papers:</strong> {ds.entries?.length || 0} examination papers</p>
                  {ds.startDate && (
                    <p>
                      <strong>Duration:</strong> {new Date(ds.startDate).toLocaleDateString('en-PK')} – {new Date(ds.endDate || ds.startDate).toLocaleDateString('en-PK')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
