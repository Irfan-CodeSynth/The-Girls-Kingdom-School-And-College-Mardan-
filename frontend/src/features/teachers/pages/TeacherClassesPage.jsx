import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { classApi } from '../../classes/api/classApi';
import { Card, Badge, Skeleton, EmptyState } from '../../../components/ui';
import { BookOpen, Users, Calendar } from 'lucide-react';

export const TeacherClassesPage = () => {
  const { data, isPending } = useQuery({
    queryKey: ['myTeacherClasses'],
    queryFn: classApi.getMyTeacherClasses,
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const classes = data?.classes || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          My Classes
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Classes you are assigned to teach
        </p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Classes Assigned"
          message="You haven't been assigned to any classes yet. Contact the admin."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Link key={cls._id} to={`/teacher/classes/${cls._id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <Badge variant={cls.status === 'active' ? 'success' : 'secondary'} dot>
                    {cls.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-surface-900 dark:text-white text-base">
                  {cls.name}
                </h3>
                <p className="text-xs font-mono text-surface-500 mt-1">{cls.code}</p>
                {cls.description && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 line-clamp-2">
                    {cls.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {cls.studentCount ?? 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cls.academicYear}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClassesPage;
