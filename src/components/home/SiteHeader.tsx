'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Moon, Sun, X } from 'lucide-react';
import { contactHref, navLinks } from '@/data/home';
import { useMode } from '@/context/ModeContext';

type SiteHeaderProps = {
  /** Optional override callback. Falls back to ModeContext toggleMode */
  onToggleTheme?: () => void;
  /** Optional nav override (TFI mode points the links at real pages instead of homepage sections) */
  links?: readonly { label: string; href: string }[];
};

export function SiteHeader({ onToggleTheme, links = navLinks }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
  const { mode, toggleMode, isMounted } = useMode();
  const handleToggle = onToggleTheme || toggleMode;
  const isDark = mode === 'tfi';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="hm-header">
      <Link href="/" className="hm-logo" aria-label="srihari — home">
        srihari<span>.</span>
      </Link>

      <nav
        id="hm-nav"
        className={`hm-nav${open ? ' is-open' : ''}`}
        aria-label="Main navigation"
      >
        {links.map((l) => (
          <Link key={l.label} href={l.href} onClick={() => setOpen(false)} aria-current={isCurrent(l.href) ? 'page' : undefined}>
            <span aria-hidden="true">/&nbsp;</span>
            {l.label}
          </Link>
        ))}
        <a href={contactHref} onClick={() => setOpen(false)}>
          <span aria-hidden="true">/&nbsp;</span>say hello
          <ArrowUpRight aria-hidden="true" className="hm-nav-arrow" strokeWidth={1.8} />
        </a>
        <button type="button" className="hm-nav-theme hm-only-mobile" onClick={handleToggle}>
          {isMounted && isDark ? <Sun aria-hidden="true" strokeWidth={1.8} /> : <Moon aria-hidden="true" strokeWidth={1.8} />}
          {isMounted && isDark ? 'Day mode' : 'Night · TFI mode'}
        </button>
      </nav>

      <div className="hm-header-actions">
        <button
          type="button"
          className="hm-theme-toggle"
          onClick={handleToggle}
          aria-label={isMounted && isDark ? 'Switch to day (Normal mode)' : 'Switch to night (TFI mode)'}
          title={isMounted && isDark ? 'Day · Normal mode' : 'Night · TFI mode'}
        >
          {isMounted && isDark ? (
            <Sun strokeWidth={1.8} aria-hidden="true" style={{ color: 'var(--lime)' }} />
          ) : (
            <Moon strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="hm-menu-toggle"
          aria-expanded={open}
          aria-controls="hm-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden="true" /> : <span className="hm-burger" aria-hidden="true"><i /><i /><i /></span>}
        </button>
      </div>
    </header>
  );
}
