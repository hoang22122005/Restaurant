import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = 'Failed to load data', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <AlertCircle size={48} className="mb-3 text-red-400" />
    <p className="text-sm text-red-500 mb-3">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        <RefreshCw size={16} /> Retry
      </button>
    )}
  </div>
);

export default ErrorState;
