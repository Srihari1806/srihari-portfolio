'use client';

/* Which role family a visitor is exploring the portfolio for (Data & Analytics, Software, …).
   - Shareable: /?for=data restores the selection; changing it updates the URL in place.
   - Remembered for the tab (sessionStorage), so /about and the homepage agree.
   - null = no preference: everything shows in its default order. A role only re-orders and
     highlights — it never hides anything. */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { roleById, roleFamilies, type RoleFamily, type RoleId } from '@/data/roles';

interface RoleContextType {
  activeRole: RoleId | null;
  role: RoleFamily | null;
  setActiveRole: (role: RoleId | null) => void;
  availableRoles: RoleFamily[];
}

const KEY = 'srihari_portfolio_role';
const PARAM = 'for';

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function writeUrl(id: RoleId | null) {
  try {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set(PARAM, id);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {}
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<RoleId | null>(null);

  // read after mount so the server render (no role) always matches the first client render
  useEffect(() => {
    let id: string | null = null;
    try {
      id = new URLSearchParams(window.location.search).get(PARAM) || sessionStorage.getItem(KEY);
    } catch {}
    const found = roleById(id);
    if (found) setActiveRoleState(found.id);
  }, []);

  const setActiveRole = useCallback((id: RoleId | null) => {
    setActiveRoleState(id);
    try {
      if (id) sessionStorage.setItem(KEY, id);
      else sessionStorage.removeItem(KEY);
    } catch {}
    writeUrl(id);
  }, []);

  return (
    <RoleContext.Provider value={{ activeRole, role: roleById(activeRole), setActiveRole, availableRoles: roleFamilies }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
}
