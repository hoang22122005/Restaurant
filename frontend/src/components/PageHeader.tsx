import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  onRefresh?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, onAdd, addLabel = 'Add New', onRefresh }) => (
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {description && <p className="text-gray-500 text-sm mt-0.5">{description}</p>}
    </div>
    <div className="flex gap-2">
      {onRefresh && (
        <button onClick={onRefresh} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors" title="Refresh">
          <RefreshCw size={18} />
        </button>
      )}
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-[0.97]">
          <Plus size={18} /> {addLabel}
        </button>
      )}
    </div>
  </div>
);

export default PageHeader;
