import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';
import parentApi from '../../parent/api/parentApi';
import { Card, Badge, Avatar, Skeleton, Table, Button, Input, Modal } from '../../../components/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  IdCard,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  UserPlus,
  Plus,
  X,
  AlertCircle,
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

export const StudentDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isCreateParentModalOpen, setIsCreateParentModalOpen] = useState(false);
  const [parentForm, setParentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    relationship: 'father',
    cnic: '',
    occupation: '',
    address: '',
  });

  const { data, isPending } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getStudentById(id),
  });

  const { data: parentsList, refetch: refetchParents } = useQuery({
    queryKey: ['studentParents', id],
    queryFn: () => parentApi.getParentsByStudent(id),
    enabled: Boolean(id),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => studentApi.resetPassword(id, 'Student@123456'),
    onSuccess: () => {
      toast.success('Password successfully reset to default: Student@123456');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    },
  });

  const createParentMutation = useMutation({
    mutationFn: (formData) =>
      parentApi.createParent({
        ...formData,
        studentId: id,
      }),
    onSuccess: () => {
      toast.success('Parent Portal ID created and linked to student!');
      setIsCreateParentModalOpen(false);
      setParentForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        relationship: 'father',
        cnic: '',
        occupation: '',
        address: '',
      });
      refetchParents();
      queryClient.invalidateQueries({ queryKey: ['adminParents'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create parent account.');
    },
  });

  const unlinkParentMutation = useMutation({
    mutationFn: (parentId) => parentApi.unlinkStudentFromParent(parentId, id),
    onSuccess: () => {
      toast.success('Parent unlinked from student.');
      refetchParents();
      queryClient.invalidateQueries({ queryKey: ['adminParents'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to unlink parent.');
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

  const student = data?.student;
  const history = student?.enrollmentHistory || [];
  const linkedParents = parentsList || [];

  const historyColumns = [
    {
      key: 'class',
      label: 'Class',
      render: (val) => (
        <span className="font-bold text-[#111827] text-sm">
          {val?.name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'enrolledAt',
      label: 'Enrolled On',
      render: (val) => (
        <span className="text-xs text-[#6B7280]">
          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Enrollment Status',
      render: (val) => (
        <Badge
          variant={
            val === 'active' ? 'success' : val === 'transferred' ? 'warning' : 'danger'
          }
          dot
        >
          {val || 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* ── Top Navigation Breadcrumb ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5A0D1A] hover:text-[#420812] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#EFE5E0] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students Register
        </Link>

        <span className="text-xs text-[#6B7280] font-mono">
          ID: {student?._id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Profile Card ── */}
        <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs overflow-hidden flex flex-col">
          {/* Card Royal Banner Accent */}
          <div className="h-20 bg-gradient-to-r from-[#5A0D1A] via-[#701422] to-[#420812] relative flex items-center justify-end px-4">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-[#EEDAA2]">
              Student Profile
            </span>
          </div>

          <div className="p-6 pt-0 flex flex-col items-center text-center -mt-10">
            <div className="p-1 rounded-full bg-white shadow-md">
              <Avatar
                src={student?.profilePhoto}
                name={student?.fullName}
                size="xl"
              />
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111827] mt-3">
              {student?.fullName}
            </h2>

            <p className="text-xs text-[#6B7280] mt-0.5 font-mono">
              Reg # {student?.studentId || 'N/A'}
            </p>

            <div className="mt-2.5">
              <Badge
                variant={student?.isActive ? 'success' : 'danger'}
                dot
              >
                {student?.isActive ? 'Active Student' : 'Inactive Account'}
              </Badge>
            </div>

            {/* Attributes Info List */}
            <div className="w-full mt-6 space-y-0 border-t border-[#EFE5E0]">
              <InfoRow icon={Mail} label="Email" value={student?.email} />
              <InfoRow icon={Phone} label="Phone" value={student?.phone} />
              <InfoRow icon={IdCard} label="Reg Number" value={student?.studentId} />
              <InfoRow
                icon={BookOpen}
                label="Class"
                value={student?.enrolledClass?.name}
              />
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={
                  student?.createdAt
                    ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
                  if (window.confirm(`Reset password for ${student?.fullName} to default: Student@123456?`)) {
                    resetPasswordMutation.mutate();
                  }
                }}
              >
                Reset Password (Student@123456)
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Academic Details & Parent Portal & Enrollment History ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Academic Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#5A0D1A] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#5A0D1A]" />
              Academic Status Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Currently Enrolled In
                </p>
                <p className="font-serif text-lg font-bold text-[#111827] mt-1">
                  {student?.enrolledClass?.name || 'No Class Assigned'}
                </p>
                {student?.enrolledClass?.code && (
                  <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                    Section / Code: {student.enrolledClass.code}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Portal Access Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <p className="font-bold text-sm text-[#111827]">
                    {student?.isActive ? 'Granted (Active)' : 'Suspended'}
                  </p>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Allows participation in quizzes, timetable and notices
                </p>
              </div>
            </div>
          </div>

          {/* ── Parent Portal Access Card (NEW) ── */}
          <div className="bg-white p-6 rounded-2xl border border-[#EFE5E0] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#5A0D1A]" />
                <h3 className="font-serif text-lg font-bold text-[#111827]">
                  Parent &amp; Guardian Portal Access
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateParentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                Create Parent Portal ID
              </button>
            </div>

            {linkedParents.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      No Parent Portal ID Linked
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Parents cannot monitor attendance, fee slips, or tuitions until credentials are created.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateParentModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#5A0D1A] text-white text-xs font-bold hover:bg-[#420812] transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Create ID Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedParents.map((parent) => (
                  <div
                    key={parent._id}
                    className="p-4 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#111827]">
                          {parent.fullName}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {parent.relationship}
                        </Badge>
                        <Badge
                          variant={parent.isActive ? 'success' : 'danger'}
                          className="text-[10px]"
                        >
                          {parent.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#6B7280] mt-1 space-x-3">
                        <span><strong>Login Email:</strong> {parent.email}</span>
                        {parent.phone && <span><strong>Phone:</strong> {parent.phone}</span>}
                        {parent.cnic && <span><strong>CNIC:</strong> {parent.cnic}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Unlink ${parent.fullName} from ${student?.fullName}?`
                            )
                          ) {
                            unlinkParentMutation.mutate(parent._id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Unlink
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrollment History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#111827]">
                Enrollment History
              </h3>
              <span className="text-xs text-[#6B7280]">
                {history.length} records
              </span>
            </div>

            <Table
              columns={historyColumns}
              data={history}
              emptyTitle="No Prior Enrollment History"
              emptyMessage="This student does not have any previous class transition records."
            />
          </div>
        </div>
      </div>

      {/* ── Modal: Create Parent Portal Account for this Student ── */}
      <Modal
        isOpen={isCreateParentModalOpen}
        onClose={() => setIsCreateParentModalOpen(false)}
        title={`Create Parent Portal ID for ${student?.fullName || 'Student'}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createParentMutation.mutate(parentForm);
          }}
          className="space-y-4 text-xs"
        >
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE5E0] text-[11px] text-[#5A0D1A] font-semibold">
            🎓 Linked Student: <strong>{student?.fullName}</strong> ({student?.studentId || 'Reg N/A'}) — {student?.enrolledClass?.name || 'Class 11'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Parent / Guardian Name *"
              required
              placeholder="e.g. Muhammad Tariq Khan"
              value={parentForm.fullName}
              onChange={(e) => setParentForm({ ...parentForm, fullName: e.target.value })}
            />
            <Input
              label="Parent Login Email *"
              type="email"
              required
              placeholder="e.g. parent@example.com"
              value={parentForm.email}
              onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Portal Password *"
              type="password"
              required
              placeholder="At least 6 characters"
              value={parentForm.password}
              onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
            />
            <Input
              label="Contact Phone Number"
              placeholder="e.g. +92-300-1234567"
              value={parentForm.phone}
              onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#111827] block mb-1">
                Relationship to Student:
              </label>
              <select
                value={parentForm.relationship}
                onChange={(e) => setParentForm({ ...parentForm, relationship: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Legal Guardian</option>
              </select>
            </div>

            <Input
              label="National CNIC Number"
              placeholder="e.g. 16101-1234567-1"
              value={parentForm.cnic}
              onChange={(e) => setParentForm({ ...parentForm, cnic: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-[#EFE5E0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateParentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFE5E0] text-xs font-bold text-[#6B7280] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createParentMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {createParentMutation.isPending ? 'Creating...' : 'Create & Link Parent ID'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDetailPage;
