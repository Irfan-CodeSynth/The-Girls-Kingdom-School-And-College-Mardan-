import React from 'react';
import { Card, Badge, Button } from '../../../components/ui';
import { Users, GraduationCap, ArrowRight, Edit, Calendar } from 'lucide-react';
import { Link } from 'react-router';

export const ClassCard = ({ cls, onEdit, showAdminControls = false }) => {
  return (
    <Card hover className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot>
            {cls.status?.toUpperCase() || 'ACTIVE'}
          </Badge>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
            {cls.code}
          </span>
        </div>

        <h3 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">
          {cls.name}
        </h3>

        <div className="flex items-center gap-1.5 mt-1 text-xs text-surface-500 dark:text-surface-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{cls.academicYear}</span>
        </div>

        {cls.description && (
          <p className="mt-3 text-xs text-surface-600 dark:text-surface-300 line-clamp-2 leading-relaxed">
            {cls.description}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-700/60">
        <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary-500" />
            <span>
              <strong className="text-surface-900 dark:text-white">{cls.studentCount ?? 0}</strong> Students
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span>
              <strong className="text-surface-900 dark:text-white">{cls.teacherCount ?? 0}</strong> Faculty
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/admin/classes/${cls._id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Details
            </Button>
          </Link>
          {showAdminControls && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(cls)}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClassCard;
