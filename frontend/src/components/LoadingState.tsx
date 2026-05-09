import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <Loader2 size={36} className="animate-spin mb-3 text-blue-500" />
    <p className="text-sm">{message}</p>
  </div>
);

export default LoadingState;
