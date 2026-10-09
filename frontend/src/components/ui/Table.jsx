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
      <div className="w-full bg-white rounded-2xl border border-[#EFE5E0] overflow-hidden shadow-xs">
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
      <div className="w-full bg-white rounded-2xl border border-[#EFE5E0] p-8 shadow-xs">
        <EmptyState title={emptyTitle} description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-2xl border border-[#EFE5E0] shadow-xs">
      <table className="min-w-full divide-y divide-[#EFE5E0] text-left text-sm font-sans">
        <thead className="bg-[#FAF8F5]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280] ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EFE5E0] bg-white">
          {data.map((row, rowIdx) => {
            const key = row[rowKey] || rowIdx;
            const isClickable = Boolean(onRowClick);
            return (
              <tr
                key={key}
                onClick={isClickable ? () => onRowClick(row) : undefined}
                className={`
                  transition-colors
                  ${striped && rowIdx % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'}
                  ${isClickable ? 'cursor-pointer hover:bg-[#FDFBF7]' : 'hover:bg-[#FAF8F5]'}
                `}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-6 py-4 whitespace-nowrap text-[#111827] ${col.cellClassName || ''}`}
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
