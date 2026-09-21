import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { classApi } from '../../classes/api/classApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import { BookOpen, Users, Calendar, GraduationCap } from 'lucide-react';

export const StudentClassPage = () => {
  const { data, isPending } = useQuery({
    queryKey: ['myStudentClass'],
    queryFn: classApi.getMyStudentClass,
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  const cls = data?.class;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          My Class
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Your current enrollment
        </p>
      </div>

      {!cls ? (
        <EmptyState
          icon={GraduationCap}
          title="Not Enrolled Yet"
          message="You are not currently enrolled in any class. Contact the admin to get enrolled."
        />
      ) : (
        <Card className="max-w-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <Badge variant={cls.status === 'active' ? 'success' : 'secondary'} dot>
              {cls.status}
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-surface-900 dark:text-white">
            {cls.name}
          </h2>
          <p className="text-sm font-mono text-surface-500 mt-1">{cls.code}</p>

          {cls.description && (
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-3">
              {cls.description}
            </p>
          )}

          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-surface-100 dark:border-surface-700 text-sm text-surface-600 dark:text-surface-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              <span>
                <strong className="text-surface-900 dark:text-white">
                  {cls.studentCount ?? 0}
                </strong>{' '}
                classmates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>
                Academic Year:{' '}
                <strong className="text-surface-900 dark:text-white">
                  {cls.academicYear}
                </strong>
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentClassPage;
