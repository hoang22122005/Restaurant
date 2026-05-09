import React from 'react';
import { useSite } from '../context/SiteContext';
import { SITE_OPTIONS } from '../utils/constants';
import type { SiteId } from '../utils/constants';
import { Globe } from 'lucide-react';

const SiteSwitcher: React.FC = () => {
  const { siteId, setSiteId } = useSite();

  return (
    <div className="flex items-center gap-3">
      <div className="flex bg-gray-100 rounded-lg p-1">
        {SITE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSiteId(opt.id as SiteId)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              siteId === opt.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
        <Globe size={13} />
        {SITE_OPTIONS.find(o => o.id === siteId)?.label}
      </div>
    </div>
  );
};

export default SiteSwitcher;
