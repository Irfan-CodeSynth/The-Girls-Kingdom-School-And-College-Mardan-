import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Input, Button } from '../../../components/ui';
import { useLogin } from '../hooks/useLogin';
import { Mail, Lock, Users, GraduationCap, ShieldCheck, HeartHandshake } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const ROLES_INFO = [
  {
    id: 'parent',
    label: 'Parent Portal',
    icon: HeartHandshake,
    badge: 'Parent & Guardian Access',
    desc: 'Monitor attendance, fee challans, exam schedules & online tuitions',
    emailPlaceholder: 'parent@example.com',
  },
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    badge: 'Student Campus',
    desc: 'Classrooms, digital quizzes, timetable & online tuitions',
    emailPlaceholder: 'student@girlskingdom.edu',
  },
  {
    id: 'teacher',
    label: 'Faculty',
    icon: Users,
    badge: 'Teacher Desk',
    desc: 'Grading queue, class roster & curriculum management',
    emailPlaceholder: 'teacher@girlskingdom.edu',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    badge: 'Administration',
    desc: 'System governance, financials & staff management',
    emailPlaceholder: 'admin@girlskingdom.edu',
  },
];

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();
  const [selectedRole, setSelectedRole] = useState('parent');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const activeRoleConfig = ROLES_INFO.find((r) => r.id === selectedRole) || ROLES_INFO[0];

  const handleRoleSelect = (roleItem) => {
    setSelectedRole(roleItem.id);
  };

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div className="space-y-4">
      {/* ─── Portal Role Switcher Tabs ─── */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block text-center">
          Select Your Portal Role
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-[#EFE5E0]">
          {ROLES_INFO.map((r) => {
            const Icon = r.icon;
            const isActive = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isActive
                    ? 'bg-[#5A0D1A] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-gray-400'}`} />
                <span className="text-[11px] truncate w-full">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Banner Badge */}
      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-center">
        <span className="text-xs font-bold text-[#5A0D1A] block">
          {activeRoleConfig.badge}
        </span>
        <span className="text-[11px] text-[#6B7280] block leading-tight mt-0.5">
          {activeRoleConfig.desc}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Email Address"
          type="email"
          placeholder={activeRoleConfig.emailPlaceholder}
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 cursor-pointer font-bold"
          loading={isPending}
        >
          Sign In to {activeRoleConfig.label}
        </Button>

        <div className="pt-3 border-t border-[#EFE5E0] text-center space-y-1.5">
          <p className="text-[11px] text-[#6B7280]">
            Need a student or teacher account?
          </p>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <Link
              to="/register/student"
              className="text-[#5A0D1A] hover:text-[#420812] hover:underline"
            >
              Register as Student
            </Link>
            <span className="text-[#D1D5DB]">|</span>
            <Link
              to="/register/teacher"
              className="text-[#5A0D1A] hover:text-[#420812] hover:underline"
            >
              Register as Teacher
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
