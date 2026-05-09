import React from 'react';
import { cn } from '../utils/cn';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T>({ columns, data, loading, onEdit, onDelete }: DataTableProps<T>) {
  if (loading) return <LoadingSkeleton cols={columns.length + (onEdit || onDelete ? 1 : 0)} />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {columns.map((col, i) => (
                <th key={i} className={cn('px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider', col.className)}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-5 py-16 text-center text-gray-400">No data found</td></tr>
            ) : (
              data.map((item, ri) => (
                <tr key={ri} className="hover:bg-blue-50/40 transition-colors">
                  {columns.map((col, ci) => (
                    <td key={ci} className={cn('px-5 py-3.5 text-sm text-gray-700', col.className)}>
                      {typeof col.accessor === 'function' ? col.accessor(item) : String(item[col.accessor] ?? '')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {onEdit && <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>}
                      {onDelete && <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingSkeleton({ cols }: { cols: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex border-t border-gray-50">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="flex-1 px-5 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></div>
          ))}
        </div>
      ))}
    </div>
  );
}
