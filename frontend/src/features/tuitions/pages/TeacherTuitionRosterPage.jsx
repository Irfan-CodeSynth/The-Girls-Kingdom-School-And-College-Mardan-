import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  HelpCircle,
  BarChart3,
  Search,
  Eye,
  Award,
  BookOpen,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import tuitionApi from '../api/tuitionApi';

export const TeacherTuitionRosterPage = () => {
  const { courseId } = useParams();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'lectures'
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['teacherTuitionAnalytics', courseId],
    queryFn: () => tuitionApi.getTeacherAnalytics(courseId),
  });

  const course = data?.course || {};
  const studentAnalytics = data?.studentAnalytics || [];
  const lectureAnalytics = data?.lectureAnalytics || [];

  const filteredStudents = studentAnalytics.filter((s) => {
    const name = s.student?.fullName?.toLowerCase() || '';
    const email = s.student?.email?.toLowerCase() || '';
    const term = search.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div className="flex items-center gap-3">
          <NavLink
            to="/teacher/tuitions"
            className="w-10 h-10 rounded-xl border border-[#EFE5E0] bg-white hover:bg-[#FAF8F5] flex items-center justify-center text-[#5A0D1A] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A0D1A] bg-[#5A0D1A]/10 px-2 py-0.5 rounded">
                {course.code || 'CODE'}
              </span>
              <span className="text-xs text-[#6B7280]">
                {course.subject} • {course.gradeLevel}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#111827]">
              Student Roster & Completion Records
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-[#FAF8F5] text-[#5A0D1A] border border-[#5A0D1A]/20 py-1.5 px-3">
            <Users className="w-4 h-4 mr-1.5" />
            {data?.totalEnrolled || 0} Enrolled Students
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#EFE5E0] pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'students'
              ? 'bg-[#5A0D1A] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Completion Records ({studentAnalytics.length})
        </button>

        <button
          onClick={() => setActiveTab('lectures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'lectures'
              ? 'bg-[#5A0D1A] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Lecture Engagement Analytics ({lectureAnalytics.length})
        </button>
      </div>

      {/* Tab 1: Students Roster */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="max-w-md relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enrolled student by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EFE5E0] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
            />
          </div>

          {isLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center text-xs text-[#6B7280]">
              No student records found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0] text-[#6B7280] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Completed Lectures</th>
                      <th className="py-3.5 px-4">Curriculum Progress</th>
                      <th className="py-3.5 px-4">Quiz Attempts</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE5E0]">
                    {filteredStudents.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#111827]">
                            {item.student?.fullName || 'Student'}
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            {item.student?.email}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#111827]">
                          {item.completedLectures} / {item.totalLectures}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 max-w-[140px]">
                            <div className="flex-1 h-2 bg-[#FAF8F5] border border-[#EFE5E0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5A0D1A]"
                                style={{ width: `${item.progressPercentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-[#5A0D1A] shrink-0">
                              {item.progressPercentage}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#111827]">
                          {item.quizAttemptCount} attempts
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedStudent(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EFE5E0] text-[11px] font-bold text-[#5A0D1A] hover:bg-[#FAF8F5] transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lecture Engagement Analytics */}
      {activeTab === 'lectures' && (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0] text-[#6B7280] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Lecture</th>
                  <th className="py-3.5 px-4">Watched Video</th>
                  <th className="py-3.5 px-4">Avg Watch %</th>
                  <th className="py-3.5 px-4">Fully Completed</th>
                  <th className="py-3.5 px-4">Quiz Submissions</th>
                  <th className="py-3.5 px-4">Avg Quiz Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {lectureAnalytics.map((lec, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#111827]">
                        {lec.order}. {lec.title}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {lec.hasQuiz ? 'With Quiz Assessment' : 'Video Only'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      {lec.watchedCount} / {lec.totalEnrolled} students
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#5A0D1A]">
                      {lec.avgWatchPercentage}%
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600">
                        {lec.completedCount} students
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      {lec.quizAttempts} attempts
                    </td>

                    <td className="py-3.5 px-4">
                      {lec.avgQuizScore !== null ? (
                        <span className="font-bold text-[#5A0D1A]">
                          {lec.avgQuizScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EFE5E0] max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE5E0]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#111827]">
                  {selectedStudent.student?.fullName}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {selectedStudent.student?.email} • Curriculum Progress: {selectedStudent.progressPercentage}%
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#111827]">
                Lecture Progress Breakdown
              </h4>

              {selectedStudent.detailedProgress && selectedStudent.detailedProgress.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudent.detailedProgress.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#111827]">
                          Lecture ID: {p.lecture?.toString().slice(-6)}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          Max Watched: {p.maxWatchPercentage}% • Video Done:{' '}
                          {p.videoCompleted ? 'Yes' : 'No'}
                        </p>
                      </div>

                      <div className="text-right">
                        {p.quizCompleted && (
                          <p className="font-bold text-[#5A0D1A]">
                            Quiz: {p.quizScore}/{p.quizTotalMarks} ({p.quizPercentage}%)
                          </p>
                        )}
                        <Badge
                          variant={p.lectureFullyCompleted ? 'success' : 'default'}
                          className="text-[10px]"
                        >
                          {p.lectureFullyCompleted ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280]">
                  Student has not started streaming lectures yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTuitionRosterPage;
