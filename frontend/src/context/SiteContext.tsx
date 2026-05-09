import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SiteId } from '../utils/constants';
import { SITE_TO_BRANCH } from '../utils/constants';

interface SiteContextValue {
  siteId: SiteId;
  branchId: string;
  setSiteId: (id: SiteId) => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteId, setSiteIdState] = useState<SiteId>(
    () => (localStorage.getItem('X-Site-Id') as SiteId) || 'MAIN'
  );

  const setSiteId = useCallback((id: SiteId) => {
    localStorage.setItem('X-Site-Id', id);
    setSiteIdState(id);
  }, []);

  const branchId = SITE_TO_BRANCH[siteId];

  return (
    <SiteContext.Provider value={{ siteId, branchId, setSiteId }}>
      {children}
    </SiteContext.Provider>
  );
};

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be inside SiteProvider');
  return ctx;
}
