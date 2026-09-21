import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  page = 1,
  pages = 1,
  total,
  limit,
  onPageChange,
  hasNext = false,
  hasPrev = false,
}) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 sm:px-6 rounded-b-xl">
      <div className="text-sm text-surface-500 dark:text-surface-400">
        {total !== undefined && (
          <span>
            Showing page <span className="font-semibold text-surface-900 dark:text-white">{page}</span> of{' '}
            <span className="font-semibold text-surface-900 dark:text-white">{pages}</span> ({total} total results)
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev && page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext && page >= pages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
