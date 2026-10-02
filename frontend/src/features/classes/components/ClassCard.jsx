import React from 'react';
import { Card, Badge, Button } from '../../../components/ui';
import { Users, GraduationCap, ArrowRight, Edit, Calendar, BookOpen, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router';

export const ClassCard = ({ cls, onEdit, showAdminControls = false }) => {
  return (
    <Card hover className="p-5 flex flex-col justify-between h-full group transition-all duration-200">
      <div>
        {/* Header row: Icon & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-100 dark:border-primary-800/40">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
              {cls.code}
            </span>
            <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot size="sm">
              {cls.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-surface-900 dark:text-white tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
          {cls.name}
        </h3>

        {/* Academic Year */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-surface-500 dark:text-surface-400">
          <Calendar className="w-3.5 h-3.5 text-primary-500" />
          <span>Academic Year: {cls.academicYear}</span>
        </div>

        {/* Description */}
        {cls.description && (
          <p className="mt-2.5 text-xs text-surface-600 dark:text-surface-400 line-clamp-2 leading-relaxed">
            {cls.description}
          </p>
        )}
      </div>

      {/* Footer info & CTA */}
      <div className="mt-5 pt-3.5 border-t border-surface-100 dark:border-surface-700/60">
        <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-3.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary-500" />
            <span>
              <strong className="text-surface-900 dark:text-white">{cls.studentCount ?? 0}</strong> Students
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              <strong className="text-surface-900 dark:text-white">{cls.teacherCount ?? 0}</strong> Faculty
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/admin/classes/${cls._id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold justify-center"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Class Portal
            </Button>
          </Link>
          {showAdminControls && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cls)}
              className="px-2.5"
              title="Edit Class Cohort"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClassCard;
