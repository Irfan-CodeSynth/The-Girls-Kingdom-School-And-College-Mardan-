import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Video,
  PlayCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  User,
} from 'lucide-react';
import { Card, Badge, Skeleton } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';
import parentApi from '../api/parentApi';
import ChildSelectorBar from '../components/ChildSelectorBar';

export const ParentTuitionsPage = () => {
  const { selectedChildId, selectedChild } = useParentChild();
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parentChildTuitions', selectedChildId],
    queryFn: () => parentApi.getChildTuitions(selectedChildId),
    enabled: Boolean(selectedChildId),
  });

  const courses = data?.courses || [];

  const totalCourses = courses.length;
  const totalLecturesCount = courses.reduce((sum, c) => sum + (c.totalLectures || 0), 0);
  const completedLecturesCount = courses.reduce((sum, c) => sum + (c.completedLectures || 0), 0);
  const avgProgress =
    totalCourses > 0
      ? Math.round(courses.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / totalCourses)
      : 0;

  const toggleExpand = (courseId) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Ward Selector Bar */}
      <ChildSelectorBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#111827]">
            Online Tuitions & Digital Progress
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Recorded video lecture watch rates, sequential completions, and gatekeeper quiz milestones for {selectedChild?.fullName || 'student'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Enrolled Tuitions
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#111827] mt-1">
            {totalCourses}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Active online subjects</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5A0D1A]">
            Curriculum Progress
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#5A0D1A] mt-1">
            {avgProgress}%
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Average overall completion</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Completed Lectures
          </p>
          <p className="font-serif text-3xl font-extrabold text-emerald-600 mt-1">
            {completedLecturesCount}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Out of {totalLecturesCount} total</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Remaining Lectures
          </p>
          <p className="font-serif text-3xl font-extrabold text-blue-600 mt-1">
            {Math.max(0, totalLecturesCount - completedLecturesCount)}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Lectures in progress</p>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-[#EFE5E0] space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center text-xs text-[#6B7280]">
            <Video className="w-10 h-10 text-[#6B7280]/40 mx-auto mb-3" />
            <p className="font-semibold text-sm text-[#111827]">No Enrolled Online Tuitions</p>
            <p className="mt-1">
              This student has not been assigned any online recorded courses yet.
            </p>
          </div>
        ) : (
          courses.map((item) => {
            const course = item.course || {};
            const isExpanded = expandedCourseId === course._id;
            const progressPct = item.progressPercentage || 0;
            const lectures = item.lectures || [];

            return (
              <div
                key={course._id}
                className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs transition-all"
              >
                {/* Course Header Bar */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#5A0D1A] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EFE5E0]">
                          {course.code || 'LMS'}
                        </span>
                        <h2 className="font-serif text-lg font-bold text-[#111827]">
                          {course.title}
                        </h2>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        Subject: <span className="font-medium text-[#111827]">{course.subject || 'Academics'}</span> • Grade: <span className="font-medium text-[#111827]">{course.gradeLevel || 'Class 11'}</span> • Instructor: <span className="font-medium text-[#111827]">{course.instructor?.fullName || 'Faculty Member'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-36 text-right">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-[#6B7280] font-semibold">Progress</span>
                          <span className="font-bold text-[#111827]">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden border border-[#EFE5E0]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPct === 100
                                ? 'bg-emerald-500'
                                : progressPct >= 50
                                ? 'bg-[#5A0D1A]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#6B7280] mt-1 block">
                          {item.completedLectures} / {item.totalLectures} Lectures Completed
                        </span>
                      </div>

                      <button
                        onClick={() => toggleExpand(course._id)}
                        className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE5E0] text-[#5A0D1A] transition-colors cursor-pointer border border-[#EFE5E0]"
                        title={isExpanded ? 'Collapse' : 'Expand Lecture Records'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Lecture Progress Audit Table */}
                {isExpanded && (
                  <div className="border-t border-[#EFE5E0] bg-[#FAF8F5]/40 p-6">
                    <h3 className="font-serif text-sm font-bold text-[#111827] mb-4">
                      Sequential Lecture Completion Audit
                    </h3>

                    {lectures.length === 0 ? (
                      <p className="text-xs text-[#6B7280]">No lectures registered in this course.</p>
                    ) : (
                      <div className="space-y-3">
                        {lectures.map((lec, index) => {
                          return (
                            <div
                              key={lec._id}
                              className="bg-white p-4 rounded-xl border border-[#EFE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    lec.lectureFullyCompleted
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-gray-100 text-[#6B7280]'
                                  }`}
                                >
                                  {lec.order || index + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-[#111827]">{lec.title}</p>
                                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#6B7280]">
                                    <span>
                                      Video Watch Rate: <strong className={lec.videoCompleted ? 'text-emerald-700' : 'text-amber-700'}>{lec.maxWatchPercentage}%</strong>
                                    </span>
                                    {lec.hasQuiz && (
                                      <span>
                                        • Gatekeeper Quiz:{' '}
                                        {lec.quizCompleted ? (
                                          <strong className="text-emerald-700">Submitted ({lec.quizScore}/{lec.quizTotalMarks} Marks)</strong>
                                        ) : (
                                          <strong className="text-amber-700">Pending</strong>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                {lec.lectureFullyCompleted ? (
                                  <Badge variant="success" className="text-[10px] gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge variant="warning" className="text-[10px] gap-1">
                                    <Clock className="w-3 h-3" />
                                    In Progress
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParentTuitionsPage;
