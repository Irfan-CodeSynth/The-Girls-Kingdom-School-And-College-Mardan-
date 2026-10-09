import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { teacherApi } from '../api/teacherApi';
import { Card, Badge, Avatar, Skeleton, Table, Button } from '../../../components/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  IdCard,
  Building2,
  KeyRound,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#EFE5E0] last:border-0 font-sans">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#EFE5E0] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#5A0D1A]" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        {label}
      </p>
    </div>
    <p className="text-sm font-bold text-[#111827] text-right">
      {value || '—'}
    </p>
  </div>
);

export const TeacherDetailPage = () => {
  const { id } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teacherApi.getTeacherById(id),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => teacherApi.resetPassword(id, 'Teacher@123456'),
    onSuccess: () => {
      toast.success('Password successfully reset to default: Teacher@123456');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    },
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="col-span-2 h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const teacher = data?.teacher;
  const classes = teacher?.assignedClasses || [];

  const classColumns = [
    {
      key: 'name',
      label: 'Class Name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-[#111827] text-sm">{val}</p>
          <p className="text-xs text-[#6B7280] font-mono">{row.code}</p>
        </div>
      ),
    },
    {
      key: 'academicYear',
      label: 'Academic Year',
      render: (val) => (
        <span className="text-xs font-semibold text-[#111827]">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'success' : 'default'} dot>
          {val || 'active'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Navigation Breadcrumb ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/teachers"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Faculty Roster
        </Link>

        <span className="text-xs text-[#6B7280] font-mono">
          ID: {teacher?._id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Profile Card ── */}
        <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs overflow-hidden flex flex-col">
          {/* Card Royal Banner */}
          <div className="h-20 bg-gradient-to-r from-[#5A0D1A] via-[#701422] to-[#420812] relative flex items-center justify-end px-4">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-[#EEDAA2]">
              Faculty Profile
            </span>
          </div>

          <div className="p-6 pt-0 flex flex-col items-center text-center -mt-10">
            <div className="p-1 rounded-full bg-white shadow-md">
              <Avatar
                src={teacher?.profilePhoto}
                name={teacher?.fullName}
                size="xl"
              />
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111827] mt-3">
              {teacher?.fullName}
            </h2>

            <p className="text-xs text-[#6B7280] mt-0.5 font-mono">
              Staff Code: {teacher?.teacherId || 'N/A'}
            </p>

            <div className="mt-2.5">
              <Badge
                variant={teacher?.isActive ? 'success' : 'danger'}
                dot
              >
                {teacher?.isActive ? 'Active Faculty' : 'Inactive Account'}
              </Badge>
            </div>

            {/* Attributes Info List */}
            <div className="w-full mt-6 space-y-0 border-t border-[#EFE5E0]">
              <InfoRow icon={Mail} label="Email" value={teacher?.email} />
              <InfoRow icon={Phone} label="Phone" value={teacher?.phone} />
              <InfoRow icon={IdCard} label="Staff ID" value={teacher?.teacherId} />
              <InfoRow
                icon={Building2}
                label="Department"
                value={teacher?.department}
              />
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={
                  teacher?.createdAt
                    ? new Date(teacher.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'
                }
              />
            </div>

            {/* Password Reset Action */}
            <div className="w-full pt-4 mt-2 border-t border-[#EFE5E0]">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-amber-800 border-amber-200 bg-amber-50/50 hover:bg-amber-100/70"
                leftIcon={<KeyRound className="w-4 h-4 text-amber-700" />}
                loading={resetPasswordMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Reset password for ${teacher?.fullName} to default: Teacher@123456?`)) {
                    resetPasswordMutation.mutate();
                  }
                }}
              >
                Reset Password (Teacher@123456)
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Teaching Assignments ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#5A0D1A] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#5A0D1A]" />
              Academic Appointment Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Department
                </p>
                <p className="font-serif text-lg font-bold text-[#111827] mt-1">
                  {teacher?.department || 'Unassigned'}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Academic Division & Subject Area
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Teaching Allocation
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <p className="font-bold text-sm text-[#111827]">
                    {classes.length} Assigned {classes.length === 1 ? 'Class' : 'Classes'}
                  </p>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Authorized for attendance, materials & quizzes
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Classes Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#111827]">
                Assigned Teaching Cohorts
              </h3>
              <span className="text-xs text-[#6B7280]">
                {classes.length} classes
              </span>
            </div>

            <Table
              columns={classColumns}
              data={classes}
              emptyTitle="No Classes Assigned"
              emptyMessage="This faculty member has not yet been assigned to instruct any classes."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
