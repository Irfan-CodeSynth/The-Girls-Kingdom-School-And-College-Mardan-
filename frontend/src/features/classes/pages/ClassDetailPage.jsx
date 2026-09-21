import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import classApi from '../api/classApi';
import studentApi from '../../students/api/studentApi';
import teacherApi from '../../teachers/api/teacherApi';
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
} from 'lucide-react';
import { toast } from 'sonner';

export const ClassDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('students');

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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
      toast.success('Teacher assignment removed.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove assignment.');
    },
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const cls = data?.class;
  const students = data?.students || [];
  const teachers = data?.teachers || [];

  const studentColumns = [
    {
      key: 'student',
      label: 'Student',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar src={val?.profilePhoto} name={val?.fullName} size="sm" />
          <div>
            <p className="font-semibold text-surface-900 dark:text-white">
              {val?.fullName}
            </p>
            <p className="text-xs text-surface-500">{val?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'enrolledAt',
      label: 'Enrollment Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'default'} dot>
          {val?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20"
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
            <p className="font-semibold text-surface-900 dark:text-white">
              {val?.fullName}
            </p>
            <p className="text-xs text-surface-500">{val?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Assignment Date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'default'} dot>
          {val?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20"
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
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/admin/classes"
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Classes</span>
      </Link>

      {/* Class Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot>
                {cls.status?.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                {cls.code}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
              {cls.name}
            </h1>

            <div className="flex items-center gap-4 mt-2 text-xs text-surface-500 dark:text-surface-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Academic Year: {cls.academicYear}</span>
              </div>
            </div>

            {cls.description && (
              <p className="mt-3 text-sm text-surface-600 dark:text-surface-300 max-w-2xl">
                {cls.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
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
          </div>
        </div>
      </Card>

      {/* Tabs */}
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
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'students' ? (
          <Table
            columns={studentColumns}
            data={students}
            emptyTitle="No Students Enrolled"
            emptyMessage="No students are currently enrolled in this class cohort."
          />
        ) : (
          <Table
            columns={teacherColumns}
            data={teachers}
            emptyTitle="No Faculty Assigned"
            emptyMessage="No teachers are currently assigned to teach this class."
          />
        )}
      </div>

      {/* Enroll Student Modal */}
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
          <p className="text-sm text-surface-500">
            Select a student to enroll into <strong>{cls?.name}</strong>. If already enrolled in another class, their enrollment will be transferred automatically.
          </p>

          <Select
            label="Select Student"
            placeholder={
              loadingStudents
                ? 'Loading students...'
                : studentsError
                ? 'Error loading students. Please refresh.'
                : (allStudentsData?.students || []).length === 0
                ? 'No registered students found'
                : 'Choose a registered student...'
            }
            disabled={loadingStudents || (allStudentsData?.students || []).length === 0}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            options={(allStudentsData?.students || []).map((s) => ({
              value: s._id,
              label: `${s.fullName} (${s.studentId || 'No ID'}) — ${s.email}`,
            }))}
          />
          {!loadingStudents && (allStudentsData?.students || []).length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No students found. Students must register through the student portal first.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button
              variant="ghost"
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

      {/* Assign Teacher Modal */}
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
          <p className="text-sm text-surface-500">
            Select a teacher to authorize quiz creation and management for <strong>{cls?.name}</strong>.
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
                : 'Choose a registered instructor...'
            }
            disabled={loadingTeachers || (allTeachersData?.teachers || []).length === 0}
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            options={(allTeachersData?.teachers || []).map((t) => ({
              value: t._id,
              label: `${t.fullName} (${t.department || 'General'}) — ${t.email}`,
            }))}
          />
          {!loadingTeachers && (allTeachersData?.teachers || []).length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No faculty members found. Register a teacher through the teacher portal first.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button
              variant="ghost"
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
              Assign Teacher
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToRemove)}
        onClose={() => setItemToRemove(null)}
        title={
          itemToRemove?.type === 'enrollment'
            ? 'Remove Student Enrollment?'
            : 'Remove Teacher Assignment?'
        }
        message={`Are you sure you want to remove ${itemToRemove?.name} from ${cls?.name}? They will lose access to all quizzes assigned to this class.`}
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
    </div>
  );
};

export default ClassDetailPage;
