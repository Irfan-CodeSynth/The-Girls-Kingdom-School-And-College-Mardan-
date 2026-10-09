import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import {
  Video,
  BookOpen,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import tuitionApi from '../api/tuitionApi';

export const StudentTuitionsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myTuitionEnrollments'],
    queryFn: () => tuitionApi.getMyEnrollments(),
  });

  const enrollments = data?.enrollments || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5A0D1A] to-[#801426] p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="text-white/90 border-white/30 bg-white/10 mb-3 gap-1 px-3 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Digital Academy Portal
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
            Online Tuitions & Video Lectures
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2.5 leading-relaxed">
            Access your recorded classroom lectures, download study handouts, attempt section quizzes, and progress week-by-week at your own pace.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111827]">
              Enrolled Online Tuition Courses
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Official courses assigned by school administration
            </p>
          </div>
          <Badge variant="default" className="bg-[#FAF8F5] text-[#5A0D1A] border border-[#5A0D1A]/20">
            {enrollments.length} {enrollments.length === 1 ? 'Course' : 'Courses'} Active
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#EFE5E0] p-6 space-y-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFE5E0] p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#111827] mb-2">
              No Online Tuitions Assigned Yet
            </h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              You are currently not enrolled in any online tuition course. When school administration enrolls you into specialized coaching sessions, they will immediately show up here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((en) => {
              const course = en.course || {};
              const progressPct = en.progressPercentage || 0;
              const instructor = course.instructor || {};

              return (
                <div
                  key={en._id}
                  className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Thumbnail / Header */}
                  <div className="h-44 bg-gradient-to-br from-[#5A0D1A] to-[#2D060D] p-5 flex flex-col justify-between relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-radial from-[#801426]/40 to-transparent" />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-md">
                        {course.code || 'TUITION'}
                      </span>
                      <span className="text-[11px] font-semibold bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-md">
                        {course.gradeLevel || 'College'}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <span className="text-xs font-medium text-amber-200">
                        {course.subject}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white line-clamp-1 drop-shadow-xs">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <User className="w-3.5 h-3.5 text-[#5A0D1A]" />
                        <span>Instructor: <strong className="text-[#111827]">{instructor.fullName || 'Assigned Faculty'}</strong></span>
                      </div>

                      {course.description && (
                        <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-[#EFE5E0]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#111827]">Curriculum Progress</span>
                        <span className="font-bold text-[#5A0D1A]">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF8F5] border border-[#EFE5E0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5A0D1A] transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Action CTA */}
                    <NavLink
                      to={`/student/tuitions/${course._id}`}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#FAF8F5] hover:bg-[#5A0D1A] text-[#5A0D1A] hover:text-white border border-[#5A0D1A]/20 hover:border-transparent transition-all shadow-2xs group"
                    >
                      <span>Continue Learning</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTuitionsPage;
