import React from 'react';
import { Card, Badge, Button } from '../../../components/ui';
import { Users, GraduationCap, ArrowRight, Edit, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router';

export const ClassCard = ({ cls, onEdit, showAdminControls = false }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-full group font-sans">
      <div>
        {/* Header row: Icon & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#5A0D1A] flex items-center justify-center shrink-0 border border-[#EFE5E0] shadow-2xs group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-[#5A0D1A]" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFE5E0] text-[#5A0D1A]">
              {cls.code}
            </span>
            <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot size="sm">
              {cls.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-base sm:text-lg font-bold text-[#111827] tracking-tight group-hover:text-[#5A0D1A] transition-colors line-clamp-1">
          {cls.name}
        </h3>

        {/* Academic Year */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-[#6B7280]">
          <Calendar className="w-3.5 h-3.5 text-[#5A0D1A]" />
          <span>Academic Year: <strong className="text-[#111827]">{cls.academicYear}</strong></span>
        </div>

        {/* Description */}
        {cls.description && (
          <p className="mt-2.5 text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
            {cls.description}
          </p>
        )}
      </div>

      {/* Footer info & CTA */}
      <div className="mt-5 pt-3.5 border-t border-[#EFE5E0]">
        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#5A0D1A]" />
            <span>
              <strong className="text-[#111827]">{cls.studentCount ?? 0}</strong> Students
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              <strong className="text-[#111827]">{cls.teacherCount ?? 0}</strong> Faculty
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/admin/classes/${cls._id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold justify-center"
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#5A0D1A]" />}
            >
              Class Portal
            </Button>
          </Link>
          {showAdminControls && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cls)}
              className="px-2.5 text-[#6B7280] hover:text-[#111827]"
              title="Edit Class Cohort"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
