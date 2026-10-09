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
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#5A0D1A] tracking-tight">
          My Classes
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Classes you are currently assigned to teach and manage
        </p>
      </div>

      {classes.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={BookOpen}
            title="No Classes Assigned"
            description="You haven't been assigned to any classes yet. Contact the administrator."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Link key={cls._id} to={`/teacher/classes/${cls._id}`}>
              <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-[#EFE5E0] hover:border-[#5A0D1A]/40">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-amber-700" />
                  </div>
                  <Badge variant={cls.status === 'active' ? 'success' : 'default'} dot>
                    {cls.status?.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-bold text-[#111827] text-base font-serif">
                  {cls.name}
                </h3>
                <p className="text-xs font-mono text-[#6B7280] mt-1">{cls.code}</p>
                {cls.description && (
                  <p className="text-sm text-[#4B5563] mt-2 line-clamp-2 leading-relaxed">
                    {cls.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EFE5E0] text-xs text-[#6B7280]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#5A0D1A]" />
                      <strong className="text-[#111827]">{cls.studentCount ?? 0}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5A0D1A]" />
                      {cls.academicYear}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#5A0D1A] bg-[#FAF8F5] border border-[#EFE5E0] px-2.5 py-1 rounded-lg flex items-center gap-1">
                    Details & Audit →
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
