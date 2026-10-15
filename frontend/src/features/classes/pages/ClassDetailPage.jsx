import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import classApi from '../api/classApi';
import studentApi from '../../students/api/studentApi';
import teacherApi from '../../teachers/api/teacherApi';
import { MaterialsSection } from '../components/MaterialsSection';
import { AttendanceTab } from '../components/AttendanceTab';
import {
  Card,
  Table,
  Badge,
  Button,
  Tabs,
  Modal,
  Select,
  ConfirmDialog,
  Skeleton,
  Avatar,
} from '../../../components/ui';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Calendar,
  UserPlus,
  Trash2,
  BookOpen,
  PlayCircle,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export const ClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('students');

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteClassModalOpen, setIsDeleteClassModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);

  const { data, isPending } = useQuery({
    queryKey: ['class', id],
    queryFn: () => classApi.getClassById(id),
  });

  const { data: allStudentsData, isPending: loadingStudents, isError: studentsError } = useQuery({
    queryKey: ['students-available'],
    queryFn: () => studentApi.getStudents({ limit: 100 }),
    staleTime: 30000,
  });

  const { data: allTeachersData, isPending: loadingTeachers, isError: teachersError } = useQuery({
    queryKey: ['teachers-available'],
    queryFn: () => teacherApi.getTeachers({ limit: 100 }),
    staleTime: 30000,
  });

  // Mutations
  const enrollMutation = useMutation({
    mutationFn: (studentId) => classApi.enrollStudent(studentId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEnrollModalOpen(false);
      setSelectedStudentId('');
      toast.success('Student enrolled successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to enroll student.');
    },
  });

  const removeEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId) => classApi.removeEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setItemToRemove(null);
      toast.success('Student removed from class.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove enrollment.');
    },
  });

  const assignTeacherMutation = useMutation({
    mutationFn: (teacherId) => classApi.assignTeacher(teacherId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsAssignModalOpen(false);
      setSelectedTeacherId('');
      toast.success('Faculty assigned to class!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to assign teacher.');
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId) => classApi.removeTeacherAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', id] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setItemToRemove(null);
      toast.success('Faculty removed from class.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove assignment.');
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: () => classApi.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully!');
      navigate('/admin/classes');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete class.');
    },
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const cls = data?.class;
  if (!cls) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center">
        <h3 className="font-serif text-xl font-bold text-[#111827]">Class not found</h3>
        <p className="text-sm text-[#6B7280] mt-1">The requested class cohort could not be retrieved.</p>
        <Link to="/admin/classes" className="inline-block mt-4">
          <Button variant="primary">Return to Classes</Button>
        </Link>
      </div>
    );
  }

  const students = cls.enrollments || [];
  const teachers = cls.teacherAssignments || [];

  const studentColumns = [
    {
      key: 'student',
      label: 'Student',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar src={val?.profilePhoto} name={val?.fullName} size="sm" />
          <div>
            <p className="font-bold text-[#111827] text-sm">
              {val?.fullName}
            </p>
            <p className="text-xs text-[#6B7280]">{val?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'enrolledAt',
      label: 'Enrollment Date',
      render: (val) => (
        <span className="text-xs text-[#6B7280]">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'default'} dot>
          {val?.toUpperCase() || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="xs"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() =>
              setItemToRemove({
                type: 'enrollment',
                id: row._id,
                name: row.student?.fullName,
              })
            }
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const teacherColumns = [
    {
      key: 'teacher',
      label: 'Faculty Member',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar src={val?.profilePhoto} name={val?.fullName} size="sm" />
          <div>
            <p className="font-bold text-[#111827] text-sm">
              {val?.fullName}
            </p>
            <p className="text-xs text-[#6B7280]">{val?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Assignment Date',
      render: (val) => (
        <span className="text-xs text-[#6B7280]">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'default'} dot>
          {val?.toUpperCase() || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="xs"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() =>
              setItemToRemove({
                type: 'assignment',
                id: row._id,
                name: row.teacher?.fullName,
              })
            }
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/classes"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classes</span>
        </Link>

        <span className="text-xs text-[#6B7280] font-mono">
          Code: {cls.code}
        </span>
      </div>

      {/* ── Class Overview Banner Card ── */}
      <div className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A] font-bold">
                {cls.code}
              </span>
              <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot>
                {cls.status?.toUpperCase()}
              </Badge>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
              {cls.name}
            </h1>

            <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5A0D1A]" />
                <span>Academic Year: <strong className="text-[#111827]">{cls.academicYear}</strong></span>
              </div>
            </div>

            {cls.description && (
              <p className="mt-3 text-sm text-[#4B5563] max-w-2xl leading-relaxed">
                {cls.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4 text-[#5A0D1A]" />}
              onClick={() => setIsEnrollModalOpen(true)}
            >
              Enroll Student
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<GraduationCap className="w-4 h-4" />}
              onClick={() => setIsAssignModalOpen(true)}
            >
              Assign Faculty
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 border border-rose-200"
              leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
              onClick={() => setIsDeleteClassModalOpen(true)}
            >
              Delete Class
            </Button>
          </div>
        </div>
      </div>

      {/* ── Tabs & Subsections ── */}
      <div className="space-y-4">
        <Tabs
          tabs={[
            {
              id: 'students',
              label: 'Enrolled Students',
              icon: <Users className="w-4 h-4" />,
              count: students.length,
            },
            {
              id: 'teachers',
              label: 'Assigned Faculty',
              icon: <GraduationCap className="w-4 h-4" />,
              count: teachers.length,
            },
            {
              id: 'materials',
              label: 'Course Materials',
              icon: <PlayCircle className="w-4 h-4" />,
            },
            {
              id: 'attendance',
              label: 'Attendance Audit',
              icon: <ClipboardCheck className="w-4 h-4" />,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'students' && (
          <Table
            columns={studentColumns}
            data={students}
            emptyTitle="No Students Enrolled"
            emptyMessage="No students are currently enrolled in this class cohort."
          />
        )}
        {activeTab === 'teachers' && (
          <Table
            columns={teacherColumns}
            data={teachers}
            emptyTitle="No Faculty Assigned"
            emptyMessage="No teachers are currently assigned to teach this class."
          />
        )}
        {activeTab === 'materials' && (
          <MaterialsSection classId={id} userRole="admin" canManage={true} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab classId={id} canManage={true} />
        )}
      </div>

      {/* ── Enroll Student Modal ── */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          setSelectedStudentId('');
        }}
        title="Enroll Student into Class"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6B7280]">
            Select a student to enroll into <strong className="text-[#111827]">{cls?.name}</strong>. If already enrolled elsewhere, their record will transition smoothly.
          </p>

          <Select
            label="Select Registered Student"
            placeholder={
              loadingStudents
                ? 'Loading students...'
                : studentsError
                ? 'Error loading students. Please refresh.'
                : (allStudentsData?.students || []).length === 0
                ? 'No registered students found'
                : 'Choose a student...'
            }
            disabled={loadingStudents || (allStudentsData?.students || []).length === 0}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            options={(allStudentsData?.students || []).map((s) => ({
              value: s._id,
              label: `${s.fullName} (${s.studentId || 'No ID'}) — ${s.email}`,
            }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE5E0]">
            <Button
              variant="outline"
              onClick={() => setIsEnrollModalOpen(false)}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedStudentId}
              loading={enrollMutation.isPending}
              onClick={() => enrollMutation.mutate(selectedStudentId)}
            >
              Confirm Enrollment
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Assign Teacher Modal ── */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedTeacherId('');
        }}
        title="Assign Faculty to Class"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#6B7280]">
            Select an instructor to authorize curriculum management, materials, and quizzes for <strong className="text-[#111827]">{cls?.name}</strong>.
          </p>

          <Select
            label="Select Faculty Member"
            placeholder={
              loadingTeachers
                ? 'Loading faculty members...'
                : teachersError
                ? 'Error loading faculty. Please refresh.'
                : (allTeachersData?.teachers || []).length === 0
                ? 'No registered teachers found'
                : 'Choose an instructor...'
            }
            disabled={loadingTeachers || (allTeachersData?.teachers || []).length === 0}
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            options={(allTeachersData?.teachers || []).map((t) => ({
              value: t._id,
              label: `${t.fullName} (${t.department || 'General'}) — ${t.email}`,
            }))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE5E0]">
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={assignTeacherMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedTeacherId}
              loading={assignTeacherMutation.isPending}
              onClick={() => assignTeacherMutation.mutate(selectedTeacherId)}
            >
              Assign Faculty Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Remove Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={Boolean(itemToRemove)}
        onClose={() => setItemToRemove(null)}
        title={
          itemToRemove?.type === 'enrollment'
            ? 'Remove Student Enrollment?'
            : 'Remove Teacher Assignment?'
        }
        message={`Are you sure you want to remove ${itemToRemove?.name} from ${cls?.name}?`}
        confirmText="Remove"
        loading={
          removeEnrollmentMutation.isPending ||
          removeAssignmentMutation.isPending
        }
        onConfirm={() => {
          if (itemToRemove?.type === 'enrollment') {
            removeEnrollmentMutation.mutate(itemToRemove.id);
          } else {
            removeAssignmentMutation.mutate(itemToRemove.id);
          }
        }}
      />

      {/* ── Delete Class Confirmation Dialog ── */}
      <ConfirmDialog
        isOpen={isDeleteClassModalOpen}
        onClose={() => setIsDeleteClassModalOpen(false)}
        title={`Delete "${cls?.name}"?`}
        message={`Are you sure you want to permanently delete this class (${cls?.code})? All associated student enrollments, faculty assignments, attendance, and materials will also be deleted. This action cannot be undone.`}
        confirmText="Delete Class"
        variant="danger"
        loading={deleteClassMutation.isPending}
        onConfirm={() => deleteClassMutation.mutate()}
      />
    </div>
  );
};

export default ClassDetailPage;
