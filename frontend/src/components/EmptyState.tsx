import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState: React.FC<{ message?: string }> = ({ message = 'No data available' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <Inbox size={48} className="mb-3" />
    <p className="text-sm">{message}</p>
  </div>
);

export default EmptyState;
