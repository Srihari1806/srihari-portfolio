import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { NextDestination } from '@/components/home/sections/NextDestination';
import '@/components/home/home.css';
import '@/components/home/sections/sections.css';

/** Shared frame for the editorial pages (About, Lab, Writing, project pages): same header, same footer. */
export function PageShell({ children, className = '', theme }: { children: ReactNode; className?: string; theme?: string }) {
  return (
    <div className={`hm ${className}`} id="top" data-theme={theme}>
      <div className="hm-page">
        <SiteHeader />
        <main>{children}</main>
        <NextDestination variant="page" />
      </div>
    </div>
  );
}
