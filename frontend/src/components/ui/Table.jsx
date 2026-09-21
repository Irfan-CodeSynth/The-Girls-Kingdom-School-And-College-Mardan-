import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  emptyTitle = 'No Records Found',
  rowKey = '_id',
  onRowClick,
  striped = false,
}) => {
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-8">
        <EmptyState title={emptyTitle} description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-xs">
      <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700 text-left text-sm">
        <thead className="bg-surface-50 dark:bg-surface-900/50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
          {data.map((row, rowIdx) => {
            const key = row[rowKey] || rowIdx;
            const isClickable = Boolean(onRowClick);
            return (
              <tr
                key={key}
                onClick={isClickable ? () => onRowClick(row) : undefined}
                className={`
                  transition-colors
                  ${striped && rowIdx % 2 === 1 ? 'bg-surface-50/50 dark:bg-surface-900/20' : ''}
                  ${isClickable ? 'cursor-pointer hover:bg-surface-100/70 dark:hover:bg-surface-700/50' : 'hover:bg-surface-50/70 dark:hover:bg-surface-700/20'}
                `}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-6 py-4 whitespace-nowrap text-surface-900 dark:text-surface-100 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
