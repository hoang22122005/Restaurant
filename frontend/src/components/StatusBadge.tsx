import React from 'react';
import { cn } from '../utils/cn';

const colorMap: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
};

const statusColors: Record<string, string> = {
  // Generic
  Active: 'green', Open: 'green', Available: 'green', Paid: 'green', Completed: 'green', Confirmed: 'green',
  Inactive: 'red', Closed: 'red', Unavailable: 'red', Failed: 'red', Cancelled: 'red',
  Pending: 'yellow',
  Refunded: 'blue',
  // Customer types
  VIP: 'blue', Regular: 'gray', New: 'green',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const color = statusColors[status] || 'gray';
  return (
    <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold', colorMap[color], className)}>
      {status}
    </span>
  );
};

export default StatusBadge;
