import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router';
import {
  Video,
  BookOpen,
  Users,
  Settings,
  Plus,
  PlayCircle,
  BarChart3,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import tuitionApi from '../api/tuitionApi';

export const TeacherTuitionsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['teacherTuitionCourses'],
    queryFn: () => tuitionApi.getCourses({ limit: 100 }),
  });

  const courses = data?.courses || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5A0D1A] to-[#801426] p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" className="text-white/90 border-white/30 bg-white/10 mb-3 gap-1 px-3 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Faculty Tuition Hub
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
            My Online Tuition Courses
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2.5 leading-relaxed">
            Upload recorded lecture streams, attach revision notes, configure gatekeeper quizzes, and monitor student completion progress in real-time.
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111827]">
              Assigned Courses
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Curriculum delivery & lecture management
            </p>
          </div>
          <Badge variant="default" className="bg-[#FAF8F5] text-[#5A0D1A] border border-[#5A0D1A]/20">
            {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Assigned
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#EFE5E0] p-6 space-y-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFE5E0] p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#111827] mb-2">
              No Tuition Courses Assigned Yet
            </h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              When administration assigns you as instructor for online coaching batches, they will appear right here for curriculum management.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A0D1A] bg-[#5A0D1A]/10 px-2.5 py-1 rounded-md">
                      {course.code}
                    </span>
                    <Badge variant={course.status === 'published' ? 'success' : 'default'} className="capitalize text-xs">
                      {course.status}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#5A0D1A]">
                      {course.subject} • {course.gradeLevel}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#111827] mt-0.5">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-2 border-t border-[#EFE5E0]">
                    <div className="flex items-center gap-1.5">
                      <PlayCircle className="w-4 h-4 text-[#5A0D1A]" />
                      <span>{course.totalLecturesCount || 0} Lectures</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#5A0D1A]" />
                      <span>Year {course.academicYear}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-[#FAF8F5]/60 border-t border-[#EFE5E0] grid grid-cols-2 gap-2.5">
                  <NavLink
                    to={`/teacher/tuitions/${course._id}/manage`}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#5A0D1A] hover:bg-[#430913] text-white shadow-2xs transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Manage Course
                  </NavLink>
                  <NavLink
                    to={`/teacher/tuitions/${course._id}/roster`}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-white/80 text-[#5A0D1A] border border-[#5A0D1A]/20 shadow-2xs transition-all"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Student Roster
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTuitionsPage;
