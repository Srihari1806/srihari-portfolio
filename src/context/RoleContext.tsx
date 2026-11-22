'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types';

interface RoleContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  availableRoles: Role[];
}

export const ROLES: Role[] = [
  'Product Management',
  'Software Development',
  'Data Analytics',
  'UI/UX Design',
  'Marketing & Growth',
  'Creative Strategy',
];

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRoleState] = useState<Role>('Product Management');

  useEffect(() => {
    const saved = localStorage.getItem('srihari_portfolio_role') as Role;
    if (saved && ROLES.includes(saved)) {
      setActiveRoleState(saved);
    }
  }, []);

  const setActiveRole = (role: Role) => {
    setActiveRoleState(role);
    localStorage.setItem('srihari_portfolio_role', role);
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        availableRoles: ROLES,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
