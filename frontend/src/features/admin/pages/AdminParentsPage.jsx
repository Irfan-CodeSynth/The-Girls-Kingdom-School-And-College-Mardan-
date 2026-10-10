import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HeartHandshake,
  UserPlus,
  Search,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Link as LinkIcon,
  Unlink,
  Users,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Skeleton, Table, Button, Input, Modal } from '../../../components/ui';
import parentApi from '../../parent/api/parentApi';
import studentApi from '../../students/api/studentApi';
import { toast } from 'sonner';

export const AdminParentsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  // Form states for Create Parent
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    relationship: 'father',
    studentId: '',
    cnic: '',
    occupation: '',
    address: '',
  });

  // Form states for Link Student
  const [linkForm, setLinkForm] = useState({
    studentId: '',
    relationship: 'father',
  });

  // Form states for Reset Password
  const [newPassword, setNewPassword] = useState('');

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data: parentsData, isLoading: isLoadingParents } = useQuery({
    queryKey: ['adminParents', searchTerm],
    queryFn: () => parentApi.getAllParents({ search: searchTerm }),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['adminAllStudentsList'],
    queryFn: () => studentApi.getStudents({ limit: 100 }),
  });

  const parents = parentsData?.parents || [];
  const studentsList = studentsData?.students || [];

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createParentMutation = useMutation({
    mutationFn: (data) => parentApi.createParent(data),
    onSuccess: () => {
      toast.success('Parent Portal ID created successfully!');
      setIsCreateModalOpen(false);
      setCreateForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        relationship: 'father',
        studentId: '',
        cnic: '',
        occupation: '',
        address: '',
      });
      queryClient.invalidateQueries({ queryKey: ['adminParents'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create parent account.');
    },
  });

  const linkStudentMutation = useMutation({
    mutationFn: ({ parentId, data }) => parentApi.linkStudentToParent(parentId, data),
    onSuccess: () => {
      toast.success('Student linked to parent successfully!');
      setIsLinkModalOpen(false);
      setLinkForm({ studentId: '', relationship: 'father' });
      queryClient.invalidateQueries({ queryKey: ['adminParents'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to link student.');
    },
  });

  const unlinkStudentMutation = useMutation({
    mutationFn: ({ parentId, studentId }) => parentApi.unlinkStudentFromParent(parentId, studentId),
    onSuccess: () => {
      toast.success('Student unlinked from parent.');
      queryClient.invalidateQueries({ queryKey: ['adminParents'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to unlink student.');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ parentId, password }) => parentApi.resetParentPassword(parentId, password),
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setIsResetPasswordModalOpen(false);
      setNewPassword('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ parentId, isActive }) => parentApi.toggleParentStatus(parentId, isActive),
    onSuccess: () => {
      toast.success('Parent account status updated.');
      queryClient.invalidateQueries({ queryKey: ['adminParents'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    },
  });

  // Calculate quick metrics
  const totalParents = parents.length;
  const activeParents = parents.filter((p) => p.isActive).length;
  const totalLinkedChildren = parents.reduce((sum, p) => sum + (p.children?.length || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE5E0]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#111827]">
                Parent Portal Accounts
              </h1>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Create parent credentials, manage portal logins, and link enrolled students with their guardians
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          Create Parent Portal ID
        </button>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Total Parent Accounts
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#111827] mt-1">
            {totalParents}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Registered guardians in system</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Active Portal Access
          </p>
          <p className="font-serif text-3xl font-extrabold text-emerald-600 mt-1">
            {activeParents}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Accounts in good standing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE5E0] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5A0D1A]">
            Linked Student Wards
          </p>
          <p className="font-serif text-3xl font-extrabold text-[#5A0D1A] mt-1">
            {totalLinkedChildren}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Active parent-child links</p>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE5E0] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#6B7280]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search parents by name, email, phone number..."
          className="w-full text-xs text-[#111827] focus:outline-none placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#6B7280] hover:text-[#111827] cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* ─── Parents Table ─── */}
      <div className="bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
        {isLoadingParents ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : parents.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B7280]">
            <HeartHandshake className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-sm text-[#111827]">No Parent Accounts Found</p>
            <p className="mt-1">
              Click &quot;Create Parent Portal ID&quot; to register a parent and link them to their daughter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5]/80 text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#EFE5E0]">
                <tr>
                  <th className="py-3.5 px-4">Parent / Guardian</th>
                  <th className="py-3.5 px-4">Login Credentials</th>
                  <th className="py-3.5 px-4">Linked Students</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {parents.map((parent) => {
                  return (
                    <tr key={parent._id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#111827] text-sm">
                          {parent.fullName}
                        </div>
                        <div className="text-[11px] text-[#6B7280] mt-0.5">
                          {parent.phone || 'No phone'} {parent.cnic ? `• CNIC: ${parent.cnic}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-[#5A0D1A] font-semibold">{parent.email}</div>
                        <div className="text-[10px] text-[#6B7280] font-sans">
                          Registered: {new Date(parent.createdAt).toLocaleDateString('en-GB')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {(!parent.children || parent.children.length === 0) ? (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            No student linked
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {parent.children.map((ch) => (
                              <div
                                key={ch._id}
                                className="inline-flex items-center gap-1.5 bg-[#FAF8F5] border border-[#EFE5E0] px-2.5 py-1 rounded-xl text-[11px]"
                              >
                                <span className="font-bold text-[#111827]">{ch.fullName}</span>
                                <span className="text-[#6B7280]">({ch.class?.name || 'Class 11'})</span>
                                <Badge variant="outline" className="text-[9px] capitalize py-0 px-1">
                                  {ch.relationship}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Unlink ${ch.fullName} from ${parent.fullName}?`)) {
                                      unlinkStudentMutation.mutate({
                                        parentId: parent._id,
                                        studentId: ch._id,
                                      });
                                    }
                                  }}
                                  className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                                  title="Unlink student"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={parent.isActive ? 'success' : 'danger'}
                          className="capitalize text-[10px]"
                        >
                          {parent.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedParent(parent);
                              setIsLinkModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#EFE5E0] hover:bg-[#FAF8F5] text-[#5A0D1A] transition-colors cursor-pointer"
                            title="Link Student"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedParent(parent);
                              setIsResetPasswordModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#EFE5E0] hover:bg-amber-50 text-amber-700 transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              toggleStatusMutation.mutate({
                                parentId: parent._id,
                                isActive: !parent.isActive,
                              });
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              parent.isActive
                                ? 'border-[#EFE5E0] hover:bg-rose-50 text-rose-600'
                                : 'border-[#EFE5E0] hover:bg-emerald-50 text-emerald-600'
                            }`}
                            title={parent.isActive ? 'Suspend Account' : 'Activate Account'}
                          >
                            {parent.isActive ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal 1: Create Parent Account ─── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Parent Portal Account"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createParentMutation.mutate(createForm);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Parent Full Name *"
              required
              placeholder="e.g. Muhammad Tariq Khan"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            />
            <Input
              label="Portal Login Email *"
              type="email"
              required
              placeholder="e.g. tariq.parent@gmail.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Portal Password *"
              type="password"
              required
              placeholder="At least 6 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +92-300-1234567"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
          </div>

          {/* Link to Student Dropdown */}
          <div className="space-y-1">
            <label className="font-bold text-[#111827] block">
              Assign Student Ward (Daughter):
            </label>
            <select
              value={createForm.studentId}
              onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
            >
              <option value="">-- Select Enrolled Student (Optional) --</option>
              {studentsList.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.fullName} ({st.studentId || 'Reg N/A'}) — {st.enrolledClass?.name || 'Class 11'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#6B7280]">
              You can also link additional students later after creating the account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#111827] block mb-1">
                Relationship to Student:
              </label>
              <select
                value={createForm.relationship}
                onChange={(e) => setCreateForm({ ...createForm, relationship: e.target.value })}
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
              value={createForm.cnic}
              onChange={(e) => setCreateForm({ ...createForm, cnic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Occupation"
              placeholder="e.g. Civil Engineer / Doctor"
              value={createForm.occupation}
              onChange={(e) => setCreateForm({ ...createForm, occupation: e.target.value })}
            />
            <Input
              label="Residential Address"
              placeholder="e.g. Mardan City"
              value={createForm.address}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-[#EFE5E0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFE5E0] text-xs font-bold text-[#6B7280] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createParentMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {createParentMutation.isPending ? 'Creating...' : 'Create Account & Credentials'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 2: Link Student to Existing Parent ─── */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={`Link Student to ${selectedParent?.fullName || 'Parent'}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!linkForm.studentId) {
              toast.error('Please select a student to link.');
              return;
            }
            linkStudentMutation.mutate({
              parentId: selectedParent._id,
              data: linkForm,
            });
          }}
          className="space-y-4 text-xs"
        >
          <div className="space-y-1">
            <label className="font-bold text-[#111827] block">
              Select Student to Link:
            </label>
            <select
              required
              value={linkForm.studentId}
              onChange={(e) => setLinkForm({ ...linkForm, studentId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
            >
              <option value="">-- Choose Student --</option>
              {studentsList.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.fullName} ({st.studentId || 'Reg N/A'}) — {st.enrolledClass?.name || 'Class 11'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#111827] block">
              Relationship:
            </label>
            <select
              value={linkForm.relationship}
              onChange={(e) => setLinkForm({ ...linkForm, relationship: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#EFE5E0] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
            >
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Legal Guardian</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#EFE5E0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFE5E0] text-xs font-bold text-[#6B7280] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={linkStudentMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {linkStudentMutation.isPending ? 'Linking...' : 'Confirm Link'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 3: Reset Password ─── */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title={`Reset Password for ${selectedParent?.fullName || 'Parent'}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newPassword || newPassword.length < 6) {
              toast.error('Password must be at least 6 characters.');
              return;
            }
            resetPasswordMutation.mutate({
              parentId: selectedParent._id,
              password: newPassword,
            });
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="New Portal Password *"
            type="password"
            required
            placeholder="Enter new secure password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <div className="pt-3 border-t border-[#EFE5E0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFE5E0] text-xs font-bold text-[#6B7280] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#5A0D1A] hover:bg-[#420812] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {resetPasswordMutation.isPending ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminParentsPage;
