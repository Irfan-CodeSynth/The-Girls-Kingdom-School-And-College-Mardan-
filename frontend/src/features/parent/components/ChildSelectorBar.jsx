import React from 'react';
import { Users, GraduationCap, ChevronDown, Sparkles, UserCheck } from 'lucide-react';
import { Badge, Skeleton } from '../../../components/ui';
import { useParentChild } from '../context/ParentChildContext';

export const ChildSelectorBar = () => {
  const { children, selectedChild, selectedChildId, setSelectedChildId, isLoadingChildren } =
    useParentChild();

  if (isLoadingChildren) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFE5E0] p-4 shadow-xs">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFE5E0] p-4 text-xs text-[#6B7280] shadow-xs flex items-center gap-2">
        <Users className="w-4 h-4 text-[#5A0D1A]" />
        <span>No student wards linked to your parent account yet. Please contact administration.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EFE5E0] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Active Child Highlight */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0 font-serif font-bold text-base shadow-2xs">
          {selectedChild?.fullName ? selectedChild.fullName.charAt(0) : 'S'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm sm:text-base text-[#111827] truncate">
              {selectedChild?.fullName || 'Selected Student'}
            </span>
            <Badge variant="default" className="text-[10px] bg-[#FAF8F5] text-[#5A0D1A] border border-[#5A0D1A]/20 capitalize">
              {selectedChild?.relationship || 'Ward'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
            <span className="font-medium text-[#111827]">
              {selectedChild?.class?.name || 'Class Assigned'}
            </span>
            {selectedChild?.studentId && (
              <>
                <span>•</span>
                <span>Roll: {selectedChild.studentId}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Child Switcher Tabs / Dropdown */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-[#6B7280] hidden md:inline">
            Switch Child:
          </span>
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#EFE5E0]">
            {children.map((child) => {
              const isActive = child._id === selectedChildId;
              return (
                <button
                  key={child._id}
                  type="button"
                  onClick={() => setSelectedChildId(child._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#5A0D1A] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-white'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{child.fullName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildSelectorBar;
