import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Video,
  FileText,
  HelpCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  Play,
  Save,
  X,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import tuitionApi from '../api/tuitionApi';

export const TeacherTuitionManagePage = () => {
  const { courseId } = useParams();
  const queryClient = useQueryClient();

  // Modals state
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: '', description: '' });

  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    order: 1,
    video: {
      provider: 'youtube',
      videoId: '',
      durationSeconds: 600,
      minWatchPercentage: 90,
    },
    notes: [],
    quiz: {
      title: 'Lecture Assessment',
      questions: [],
    },
    isPublished: true,
  });

  // Current note input
  const [newNote, setNewNote] = useState({ title: '', fileUrl: '', fileType: 'pdf' });

  // Current question input
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    type: 'mcq',
    marks: 1,
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  });

  // Queries
  const { data: courseData } = useQuery({
    queryKey: ['tuitionCourse', courseId],
    queryFn: () => tuitionApi.getCourseById(courseId),
  });
  const course = courseData?.course || {};

  const { data: sectionsData, isLoading: loadingSections } = useQuery({
    queryKey: ['tuitionSections', courseId],
    queryFn: () => tuitionApi.getSections(courseId),
  });
  const sections = sectionsData?.sections || [];

  const { data: lecturesData, isLoading: loadingLectures } = useQuery({
    queryKey: ['tuitionLectures', courseId],
    queryFn: () => tuitionApi.getLectures(courseId),
  });
  const lectures = lecturesData?.lectures || [];

  // Section Mutations
  const createSectionMutation = useMutation({
    mutationFn: (data) => tuitionApi.createSection(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionSections', courseId] });
      setShowSectionModal(false);
      setEditingSection(null);
      setSectionForm({ title: '', description: '' });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, data }) => tuitionApi.updateSection(sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionSections', courseId] });
      setShowSectionModal(false);
      setEditingSection(null);
      setSectionForm({ title: '', description: '' });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId) => tuitionApi.deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionSections', courseId] });
      queryClient.invalidateQueries({ queryKey: ['tuitionLectures', courseId] });
    },
  });

  // Lecture Mutations
  const createLectureMutation = useMutation({
    mutationFn: (payload) =>
      tuitionApi.createLecture(courseId, payload.sectionId, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionLectures', courseId] });
      setShowLectureModal(false);
      setEditingLecture(null);
      resetLectureForm();
    },
  });

  const updateLectureMutation = useMutation({
    mutationFn: ({ lectureId, data }) => tuitionApi.updateLecture(lectureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionLectures', courseId] });
      setShowLectureModal(false);
      setEditingLecture(null);
      resetLectureForm();
    },
  });

  const deleteLectureMutation = useMutation({
    mutationFn: (lectureId) => tuitionApi.deleteLecture(lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionLectures', courseId] });
    },
  });

  // Form Resetters & Openers
  const resetLectureForm = () => {
    setLectureForm({
      title: '',
      description: '',
      order: 1,
      video: {
        provider: 'youtube',
        videoId: '',
        durationSeconds: 600,
        minWatchPercentage: 90,
      },
      notes: [],
      quiz: {
        title: 'Lecture Assessment',
        questions: [],
      },
      isPublished: true,
    });
    setNewNote({ title: '', fileUrl: '', fileType: 'pdf' });
    setNewQuestion({
      questionText: '',
      type: 'mcq',
      marks: 1,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
    });
  };

  const openCreateSection = () => {
    setEditingSection(null);
    setSectionForm({ title: '', description: '' });
    setShowSectionModal(true);
  };

  const openEditSection = (sec) => {
    setEditingSection(sec);
    setSectionForm({
      title: sec.title || '',
      description: sec.description || '',
    });
    setShowSectionModal(true);
  };

  const openAddLecture = (sectionId) => {
    setEditingLecture(null);
    setTargetSectionId(sectionId);
    resetLectureForm();
    const existingCount = lectures.filter((l) => (l.section?._id || l.section) === sectionId).length;
    setLectureForm((prev) => ({ ...prev, order: existingCount + 1 }));
    setShowLectureModal(true);
  };

  const openEditLecture = (lec) => {
    setEditingLecture(lec);
    setTargetSectionId(lec.section?._id || lec.section);
    setLectureForm({
      title: lec.title || '',
      description: lec.description || '',
      order: lec.order || 1,
      video: {
        provider: lec.video?.provider || 'youtube',
        videoId: lec.video?.videoId || '',
        durationSeconds: lec.video?.durationSeconds || 600,
        minWatchPercentage: lec.video?.minWatchPercentage || 90,
      },
      notes: (lec.notes || []).map((n) => ({
        title: n.title,
        fileUrl: n.fileUrl,
        fileType: n.fileType || 'pdf',
        fileSize: n.fileSize || 0,
      })),
      quiz: {
        title: lec.quiz?.title || 'Lecture Assessment',
        questions: (lec.quiz?.questions || []).map((q) => ({
          questionText: q.questionText,
          type: q.type || 'mcq',
          marks: q.marks || 1,
          options: (q.options || []).map((o) => ({
            text: o.text,
            isCorrect: Boolean(o.isCorrect),
          })),
        })),
      },
      isPublished: lec.isPublished !== undefined ? lec.isPublished : true,
    });
    setNewNote({ title: '', fileUrl: '', fileType: 'pdf' });
    setShowLectureModal(true);
  };

  const handleAddNote = () => {
    if (!newNote.title || !newNote.fileUrl) return;
    setLectureForm((prev) => ({
      ...prev,
      notes: [...prev.notes, { ...newNote }],
    }));
    setNewNote({ title: '', fileUrl: '', fileType: 'pdf' });
  };

  const handleRemoveNote = (idx) => {
    setLectureForm((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== idx),
    }));
  };

  const handleAddQuestionOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.questionText) return;
    setLectureForm((prev) => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [...prev.quiz.questions, { ...newQuestion }],
      },
    }));
    setNewQuestion({
      questionText: '',
      type: 'mcq',
      marks: 1,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
    });
  };

  const handleRemoveQuestion = (qIdx) => {
    setLectureForm((prev) => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.filter((_, i) => i !== qIdx),
      },
    }));
  };

  const handleSaveSection = () => {
    if (editingSection) {
      updateSectionMutation.mutate({
        sectionId: editingSection._id,
        data: sectionForm,
      });
    } else {
      createSectionMutation.mutate(sectionForm);
    }
  };

  const handleSaveLecture = () => {
    if (editingLecture) {
      updateLectureMutation.mutate({
        lectureId: editingLecture._id,
        data: lectureForm,
      });
    } else {
      createLectureMutation.mutate({
        sectionId: targetSectionId,
        data: lectureForm,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
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
              {course.title || 'Curriculum Builder'}
            </h1>
          </div>
        </div>

        <Button
          onClick={openCreateSection}
          className="bg-[#5A0D1A] hover:bg-[#430913] text-white gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Course Section
        </Button>
      </div>

      {/* Curriculum Sections & Lectures */}
      <div className="space-y-6">
        {loadingSections ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFE5E0] p-12 text-center max-w-lg mx-auto shadow-xs">
            <Video className="w-12 h-12 text-[#5A0D1A]/40 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#111827]">
              No Sections Created Yet
            </h3>
            <p className="text-sm text-[#6B7280] mt-1 mb-5">
              Organize this tuition course by creating weekly modules or thematic chapters.
            </p>
            <Button
              onClick={openCreateSection}
              className="bg-[#5A0D1A] text-white"
            >
              Add First Section
            </Button>
          </div>
        ) : (
          sections.map((section, sIndex) => {
            const sectionLectures = lectures.filter(
              (l) => (l.section?._id || l.section) === section._id
            );

            return (
              <div
                key={section._id}
                className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs"
              >
                {/* Section Header */}
                <div className="p-5 bg-[#FAF8F5]/50 border-b border-[#EFE5E0] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#5A0D1A] uppercase tracking-wider">
                      Section {section.order || sIndex + 1}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#111827]">
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {section.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => openAddLecture(section._id)}
                      className="bg-[#5A0D1A] hover:bg-[#430913] text-white gap-1 text-xs h-8 px-3"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Lecture
                    </Button>
                    <button
                      onClick={() => openEditSection(section)}
                      className="p-2 rounded-lg text-[#5A0D1A] hover:bg-[#FAF8F5] border border-[#EFE5E0] transition-colors"
                      title="Edit Section"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSectionMutation.mutate(section._id)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Lectures List */}
                <div className="p-4 space-y-3">
                  {sectionLectures.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6B7280] border border-dashed border-[#EFE5E0] rounded-xl">
                      No lectures inside this section yet. Click "Add Lecture" to upload video lesson.
                    </div>
                  ) : (
                    sectionLectures.map((lec) => (
                      <div
                        key={lec._id}
                        className="p-4 rounded-xl border border-[#EFE5E0] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#5A0D1A]">
                                Lec {lec.order}
                              </span>
                              <h4 className="text-sm font-bold text-[#111827] truncate">
                                {lec.title}
                              </h4>
                              {lec.isPublished ? (
                                <Badge variant="success" className="text-[10px] py-0 px-1.5">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-[10px] py-0 px-1.5">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-1">
                              <span>Min Watch: {lec.video?.minWatchPercentage || 90}%</span>
                              <span>• Notes: {lec.notes?.length || 0}</span>
                              <span>
                                • Quiz:{' '}
                                {lec.hasQuiz
                                  ? `${lec.quiz?.questions?.length || 0} Questions`
                                  : 'None'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => openEditLecture(lec)}
                            className="p-2 rounded-lg text-[#5A0D1A] hover:bg-[#FAF8F5] border border-[#EFE5E0] transition-colors"
                            title="Edit Lecture"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLectureMutation.mutate(lec._id)}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                            title="Delete Lecture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── MODAL 1: Create / Edit Section ─── */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EFE5E0] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE5E0]">
              <h3 className="font-serif text-lg font-bold text-[#111827]">
                {editingSection ? 'Edit Course Section' : 'Add Course Section'}
              </h3>
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Week 1: Thermodynamics & Gas Laws"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/30 focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Description / Learning Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of topics covered in this module..."
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/30 focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE5E0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSection(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#5A0D1A] text-white"
                disabled={
                  !sectionForm.title ||
                  createSectionMutation.isPending ||
                  updateSectionMutation.isPending
                }
                onClick={handleSaveSection}
              >
                {editingSection ? 'Update Section' : 'Create Section'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Create / Edit Lecture with Video, Notes & Quiz ─── */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EFE5E0] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE5E0]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#111827]">
                  {editingLecture ? 'Edit Lecture Lesson' : 'Add Lecture Lesson'}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Configure video stream, attachments, and gatekeeper quiz
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLectureModal(false);
                  setEditingLecture(null);
                }}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* 1. General */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-[#111827] block mb-1">
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lecture 01: Introduction to Organic Chemistry"
                    value={lectureForm.title}
                    onChange={(e) =>
                      setLectureForm({ ...lectureForm, title: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lectureForm.order}
                    onChange={(e) =>
                      setLectureForm({
                        ...lectureForm,
                        order: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Lecture Description / Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline key concepts explained in this video..."
                  value={lectureForm.description}
                  onChange={(e) =>
                    setLectureForm({ ...lectureForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                />
              </div>

              {/* 2. Video Stream Details */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE5E0] space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#111827] flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#5A0D1A]" />
                  Recorded Video Stream Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-[#111827] block mb-1">
                      YouTube URL or Embed ID *
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... or Video ID"
                      value={lectureForm.video.videoId}
                      onChange={(e) =>
                        setLectureForm({
                          ...lectureForm,
                          video: { ...lectureForm.video, videoId: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded-xl border border-[#EFE5E0] bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#111827] block mb-1">
                      Min Watch % Gate
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={lectureForm.video.minWatchPercentage}
                      onChange={(e) =>
                        setLectureForm({
                          ...lectureForm,
                          video: {
                            ...lectureForm.video,
                            minWatchPercentage: Number(e.target.value) || 90,
                          },
                        })
                      }
                      className="w-full p-2 rounded-xl border border-[#EFE5E0] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Lecture Notes Attachments */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE5E0] space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#111827] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#5A0D1A]" />
                  Attach Lecture Handouts & Notes
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Handout Title (e.g. Chapter Summary PDF)"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="flex-1 p-2 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                  <input
                    type="url"
                    placeholder="Document URL (https://...)"
                    value={newNote.fileUrl}
                    onChange={(e) => setNewNote({ ...newNote, fileUrl: e.target.value })}
                    className="flex-1 p-2 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNote}
                    className="bg-[#5A0D1A] text-white shrink-0"
                  >
                    Add Note
                  </Button>
                </div>

                {lectureForm.notes.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {lectureForm.notes.map((note, nIdx) => (
                      <div
                        key={nIdx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EFE5E0]"
                      >
                        <span className="font-semibold text-[#111827]">
                          {note.title} ({note.fileUrl})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNote(nIdx)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Gatekeeper Quiz Builder */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE5E0] space-y-4">
                <h4 className="font-serif text-sm font-bold text-[#111827] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#5A0D1A]" />
                  Lecture Gatekeeper Quiz Assessment
                </h4>

                <div className="p-3 bg-white rounded-xl border border-[#EFE5E0] space-y-3">
                  <div>
                    <label className="font-semibold text-[#111827] block mb-1">
                      New Question Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. What is the standard SI unit of Thermodynamic temperature?"
                      value={newQuestion.questionText}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, questionText: e.target.value })
                      }
                      className="w-full p-2 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-semibold text-[#111827] block">
                      Options & Correct Answer Flag
                    </label>
                    {newQuestion.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => {
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: prev.options.map((o, i) => ({
                                ...o,
                                isCorrect: i === oIdx,
                              })),
                            }));
                          }}
                        />
                        <input
                          type="text"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: prev.options.map((o, i) =>
                                i === oIdx ? { ...o, text: val } : o
                              ),
                            }));
                          }}
                          className="flex-1 p-1.5 rounded-lg border border-[#EFE5E0] bg-white text-xs"
                        />
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddQuestionOption}
                        className="text-[11px] h-7 px-2"
                      >
                        + Add Option
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddQuestion}
                        className="bg-[#5A0D1A] text-white text-[11px] h-7 px-3"
                      >
                        Save Question to Quiz
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Questions Preview */}
                {lectureForm.quiz.questions.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-bold text-[#111827]">
                      Configured Questions ({lectureForm.quiz.questions.length})
                    </p>
                    {lectureForm.quiz.questions.map((q, qIndex) => (
                      <div
                        key={qIndex}
                        className="p-3 rounded-xl bg-white border border-[#EFE5E0] flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-[#111827]">
                            Q{qIndex + 1}. {q.questionText}
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            {q.options?.length || 0} options • Correct:{' '}
                            {q.options?.find((o) => o.isCorrect)?.text || 'N/A'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#EFE5E0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLectureModal(false);
                  setEditingLecture(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#5A0D1A] text-white"
                disabled={
                  !lectureForm.title ||
                  createLectureMutation.isPending ||
                  updateLectureMutation.isPending
                }
                onClick={handleSaveLecture}
              >
                {editingLecture ? 'Update Lecture' : 'Save Lecture to Course'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTuitionManagePage;
