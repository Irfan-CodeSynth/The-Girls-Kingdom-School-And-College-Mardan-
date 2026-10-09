import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Video,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import tuitionApi from '../api/tuitionApi';
import TuitionPlayer from '../components/TuitionPlayer';

export const StudentTuitionLearnPage = () => {
  const { id: courseId } = useParams();
  const queryClient = useQueryClient();
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['courseCurriculum', courseId],
    queryFn: () => tuitionApi.getCourseCurriculum(courseId),
  });

  const course = data?.course || {};
  const curriculum = data?.curriculum || [];
  const stats = data?.stats || {};

  // Flatten all lectures to easily compute next/active lecture
  const allLectures = curriculum.flatMap((sec) => sec.lectures || []);

  // Set default active lecture on load
  useEffect(() => {
    if (allLectures.length > 0 && !activeLectureId) {
      // Find first uncompleted unlocked lecture, or fallback to first lecture
      const nextToWatch =
        allLectures.find((lec) => !lec.isLocked && !lec.progress?.lectureFullyCompleted) ||
        allLectures[0];
      if (nextToWatch) {
        setActiveLectureId(nextToWatch._id);
        // Expand that section
        setExpandedSections((prev) => ({ ...prev, [nextToWatch.section]: true }));
      }
    }
  }, [allLectures, activeLectureId]);

  // Video progress mutation
  const videoProgressMutation = useMutation({
    mutationFn: ({ lectureId, watchTimeSeconds, watchPercentage }) =>
      tuitionApi.updateVideoProgress(lectureId, { watchTimeSeconds, watchPercentage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseCurriculum', courseId] });
    },
  });

  // Quiz submission mutation
  const quizSubmitMutation = useMutation({
    mutationFn: ({ lectureId, answers }) =>
      tuitionApi.submitLectureQuiz(lectureId, { answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseCurriculum', courseId] });
    },
  });

  const activeLecture = allLectures.find((lec) => lec._id === activeLectureId) || allLectures[0];
  const activeIndex = allLectures.findIndex((lec) => lec._id === activeLectureId);
  const nextLecture = activeIndex >= 0 && activeIndex < allLectures.length - 1 ? allLectures[activeIndex + 1] : null;

  const toggleSection = (secId) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleSelectLecture = (lec) => {
    if (lec.isLocked) return;
    setActiveLectureId(lec._id);
  };

  const handleNextLecture = () => {
    if (nextLecture && !nextLecture.isLocked) {
      setActiveLectureId(nextLecture._id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !course._id) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white p-8 rounded-3xl border border-[#EFE5E0] text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-[#5A0D1A] mx-auto mb-3" />
        <h3 className="font-serif text-xl font-bold text-[#111827]">Access Restricted</h3>
        <p className="text-sm text-[#6B7280] mt-1">
          {error?.response?.data?.message || 'You must be actively enrolled in this online tuition course to stream lectures.'}
        </p>
        <NavLink to="/student/tuitions" className="mt-4 inline-block">
          <Button variant="default" className="bg-[#5A0D1A] text-white">
            Back to My Courses
          </Button>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div className="flex items-center gap-3">
          <NavLink
            to="/student/tuitions"
            className="w-9 h-9 rounded-xl border border-[#EFE5E0] bg-white hover:bg-[#FAF8F5] flex items-center justify-center text-[#5A0D1A] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </NavLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A0D1A] bg-[#5A0D1A]/10 px-2 py-0.5 rounded">
                {course.code}
              </span>
              <span className="text-xs text-[#6B7280]">{course.subject}</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#111827]">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#EFE5E0] shadow-2xs">
          <div className="text-right">
            <p className="text-xs font-bold text-[#111827]">
              {stats.completedLectures || 0} / {stats.totalLectures || 0} Lectures
            </p>
            <p className="text-[11px] text-[#6B7280]">
              {stats.progressPercentage || 0}% Completed
            </p>
          </div>
          <div className="w-16 h-2 bg-[#FAF8F5] border border-[#EFE5E0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5A0D1A] transition-all duration-300"
              style={{ width: `${stats.progressPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dual Pane Layout (Udemy / Coursera LMS Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Tuition Player (8 Cols) */}
        <div className="lg:col-span-8">
          {activeLecture ? (
            <TuitionPlayer
              lecture={activeLecture}
              progress={activeLecture.progress}
              isLocked={activeLecture.isLocked}
              onVideoProgressUpdate={(seconds, pct) =>
                videoProgressMutation.mutate({
                  lectureId: activeLecture._id,
                  watchTimeSeconds: seconds,
                  watchPercentage: pct,
                })
              }
              onQuizSubmit={async (answers) => {
                const res = await quizSubmitMutation.mutateAsync({
                  lectureId: activeLecture._id,
                  answers,
                });
                return res;
              }}
              onNextLecture={handleNextLecture}
              hasNextLecture={Boolean(nextLecture)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center">
              <p className="text-sm text-[#6B7280]">No lectures have been published in this course yet.</p>
            </div>
          )}
        </div>

        {/* Right Pane: Course Curriculum Accordion (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EFE5E0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE5E0]">
            <h3 className="font-serif text-base font-bold text-[#111827] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#5A0D1A]" />
              Course Syllabus
            </h3>
            <span className="text-xs font-semibold text-[#6B7280]">
              {curriculum.length} Sections
            </span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {curriculum.map((section, sIndex) => {
              const isExpanded = expandedSections[section._id] ?? true;
              const sectionLectures = section.lectures || [];

              return (
                <div
                  key={section._id}
                  className="rounded-xl border border-[#EFE5E0] overflow-hidden bg-[#FAF8F5]/30"
                >
                  {/* Section Title Header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full p-3.5 flex items-center justify-between text-left bg-white hover:bg-[#FAF8F5] transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#5A0D1A] uppercase tracking-wider">
                        Section {section.order || sIndex + 1}
                      </p>
                      <h4 className="text-sm font-bold text-[#111827] truncate">
                        {section.title}
                      </h4>
                    </div>
                    <div className="shrink-0 text-[#6B7280]">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Lecture Items */}
                  {isExpanded && (
                    <div className="p-2 space-y-1.5 border-t border-[#EFE5E0] bg-[#FAF8F5]/50">
                      {sectionLectures.map((lec) => {
                        const isActive = lec._id === activeLectureId;
                        const isCompleted = lec.progress?.lectureFullyCompleted;
                        const isLocked = lec.isLocked;

                        return (
                          <button
                            key={lec._id}
                            disabled={isLocked}
                            onClick={() => handleSelectLecture(lec)}
                            className={`w-full p-3 rounded-xl flex items-center justify-between text-left text-xs transition-all ${
                              isActive
                                ? 'bg-[#5A0D1A] text-white shadow-xs font-bold'
                                : isLocked
                                ? 'bg-gray-50/70 text-gray-400 cursor-not-allowed border border-gray-200/50'
                                : 'bg-white hover:bg-white/90 text-[#111827] border border-[#EFE5E0]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2
                                    className={`w-4 h-4 ${
                                      isActive ? 'text-white' : 'text-emerald-600'
                                    }`}
                                  />
                                ) : isLocked ? (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Play
                                    className={`w-4 h-4 ${
                                      isActive ? 'text-white' : 'text-[#5A0D1A]'
                                    }`}
                                  />
                                )}
                              </span>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {lec.order}. {lec.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80">
                                  {lec.video?.durationSeconds > 0 && (
                                    <span>
                                      {Math.round(lec.video.durationSeconds / 60)} min
                                    </span>
                                  )}
                                  {lec.hasQuiz && (
                                    <span className="flex items-center gap-0.5">
                                      • Quiz
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Badge */}
                            <span className="shrink-0 ml-2">
                              {isCompleted ? (
                                <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-emerald-700'}`}>
                                  Done
                                </span>
                              ) : isLocked ? (
                                <span className="text-[10px] text-gray-400">
                                  Locked
                                </span>
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTuitionLearnPage;
