import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { PostcardFooter } from './PostcardFooter';
import '@/components/home/home.css';
import '@/components/home/sections/sections.css';

/** Shared frame for the editorial pages (About, Lab, Writing, project pages): same header, same footer. */
export function PageShell({ children, className = '', theme, footer = 'board' }: { children: ReactNode; className?: string; theme?: string; footer?: 'board' | 'none' }) {
  return (
    <div className={`hm ${className}`} id="top" data-theme={theme}>
      <div className="hm-page">
        <SiteHeader />
        <main>{children}</main>
        {footer === 'board' && <PostcardFooter />}
      </div>
    </div>
  );
}
