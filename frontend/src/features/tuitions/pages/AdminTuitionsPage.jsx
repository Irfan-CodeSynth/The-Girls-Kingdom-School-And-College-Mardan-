import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Plus,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  UserPlus,
  X,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { Card, Badge, Skeleton, Button } from '../../../components/ui';
import tuitionApi from '../api/tuitionApi';
import api from '../../../config/api';

export const AdminTuitionsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'enrollments'
  const [search, setSearch] = useState('');

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    code: '',
    subject: '',
    gradeLevel: 'College 1st Year',
    instructor: '',
    description: '',
    academicYear: new Date().getFullYear().toString(),
  });

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollTargetCourse, setEnrollTargetCourse] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Queries
  const { data: overviewData, isLoading: loadingOverview } = useQuery({
    queryKey: ['adminTuitionOverview'],
    queryFn: () => tuitionApi.getAdminOverview(),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachersList'],
    queryFn: async () => {
      const res = await api.get('/teachers', { params: { limit: 100 } });
      return res.data?.data?.teachers || [];
    },
  });

  const { data: studentsData } = useQuery({
    queryKey: ['studentsList'],
    queryFn: async () => {
      const res = await api.get('/students', { params: { limit: 100 } });
      return res.data?.data?.students || [];
    },
  });

  const teachers = teachersData || [];
  const students = studentsData || [];
  const courses = overviewData?.courses || [];
  const recentEnrollments = overviewData?.recentEnrollments || [];

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data) => tuitionApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTuitionOverview'] });
      setShowCourseModal(false);
      setCourseForm({
        title: '',
        code: '',
        subject: '',
        gradeLevel: 'College 1st Year',
        instructor: '',
        description: '',
        academicYear: new Date().getFullYear().toString(),
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => tuitionApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTuitionOverview'] });
    },
  });

  const enrollStudentMutation = useMutation({
    mutationFn: (payload) =>
      tuitionApi.enrollStudent(payload.courseId, { studentId: payload.studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTuitionOverview'] });
      setShowEnrollModal(false);
      setSelectedStudentId('');
    },
  });

  const filteredCourses = courses.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(term) ||
      c.code?.toLowerCase().includes(term) ||
      c.subject?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5A0D1A] to-[#801426] p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="outline" className="text-white/90 border-white/30 bg-white/10 mb-3 gap-1 px-3 py-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Administrative Governance
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
              Online Tuitions & Digital Classes
            </h1>
            <p className="text-white/80 text-sm sm:text-base mt-2.5 leading-relaxed">
              Provision online coaching modules, assign teaching faculty, and enroll students into digital learning programs separate from campus classes.
            </p>
          </div>

          <Button
            onClick={() => setShowCourseModal(true)}
            className="bg-white hover:bg-[#FAF8F5] text-[#5A0D1A] font-bold shadow-md self-start md:self-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Tuition Course
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {overviewData?.totalCourses || 0}
            </p>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#6B7280]">
              Total Tuition Courses
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {overviewData?.totalEnrollments || 0}
            </p>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#6B7280]">
              Active Enrolled Students
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold text-[#111827]">
              {overviewData?.activeCourses || 0}
            </p>
            <p className="text-xs uppercase tracking-wider font-semibold text-[#6B7280]">
              Published Programs
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#EFE5E0] pb-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'courses'
              ? 'bg-[#5A0D1A] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          <Video className="w-4 h-4" />
          Tuition Courses Directory ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('enrollments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'enrollments'
              ? 'bg-[#5A0D1A] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Enrollment Records ({recentEnrollments.length})
        </button>
      </div>

      {/* Tab 1: Courses Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="max-w-md relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course by title, code, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EFE5E0] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
            />
          </div>

          {loadingOverview ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center text-xs text-[#6B7280]">
              No online tuition courses found. Click "Create Tuition Course" above to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-[#EFE5E0] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A0D1A] bg-[#5A0D1A]/10 px-2.5 py-1 rounded-md">
                        {c.code}
                      </span>
                      <Badge
                        variant={c.status === 'published' ? 'success' : 'default'}
                        className="text-[10px]"
                      >
                        {c.status}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-[#5A0D1A]">
                        {c.subject} • {c.gradeLevel}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#111827] mt-0.5">
                        {c.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Instructor: <strong>{c.instructor?.fullName || 'Not assigned'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EFE5E0] flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEnrollTargetCourse(c);
                        setShowEnrollModal(true);
                      }}
                      className="bg-[#5A0D1A] hover:bg-[#430913] text-white text-xs h-8 px-3 gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Enroll Student
                    </Button>

                    <button
                      onClick={() => deleteCourseMutation.mutate(c._id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Recent Enrollments Record */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EFE5E0] text-[#6B7280] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Enrolled Course</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {recentEnrollments.map((en, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#111827]">
                        {en.student?.fullName || 'Student'}
                      </p>
                      <p className="text-[11px] text-[#6B7280]">
                        {en.student?.email}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#111827]">
                        {en.course?.title}
                      </p>
                      <span className="text-[10px] text-[#5A0D1A] bg-[#5A0D1A]/10 px-1.5 py-0.5 rounded">
                        {en.course?.code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="text-[10px]">
                        {en.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {new Date(en.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: Create Course ─── */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EFE5E0] max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE5E0]">
              <h3 className="font-serif text-lg font-bold text-[#111827]">
                Create Online Tuition Course
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics FSC Part 1 Online Coaching"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PHY-FSC-101"
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, code: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Physics"
                    value={courseForm.subject}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, subject: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    Grade / Class Level *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Year / Grade 11"
                    value={courseForm.gradeLevel}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, gradeLevel: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={courseForm.academicYear}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, academicYear: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Assigned Instructor *
                </label>
                <select
                  value={courseForm.instructor}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, instructor: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                >
                  <option value="">Select Teaching Faculty</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Overview of this online tuition course..."
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE5E0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCourseModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#5A0D1A] text-white"
                disabled={
                  !courseForm.title ||
                  !courseForm.code ||
                  !courseForm.subject ||
                  !courseForm.instructor
                }
                onClick={() => createCourseMutation.mutate(courseForm)}
              >
                Create Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Enroll Student ─── */}
      {showEnrollModal && enrollTargetCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#EFE5E0] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE5E0]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#111827]">
                  Enroll Student
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Course: {enrollTargetCourse.title} ({enrollTargetCourse.code})
                </p>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Select Student to Enroll *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white"
                >
                  <option value="">Choose a student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFE5E0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEnrollModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#5A0D1A] text-white"
                disabled={!selectedStudentId}
                onClick={() =>
                  enrollStudentMutation.mutate({
                    courseId: enrollTargetCourse._id,
                    studentId: selectedStudentId,
                  })
                }
              >
                Confirm Enrollment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTuitionsPage;
