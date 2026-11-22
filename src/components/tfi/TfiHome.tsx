'use client';

import Image from 'next/image';
import Link from 'next/link';
import room from '@/assets/tfi/room.webp';
import { useEffect, useRef } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { stickers } from '@/data/tfi';
import { TfiRoom } from './TfiRoom';
import './tfi.css';

const NAV = [
  { label: 'work', href: '/work' },
  { label: 'cinema', href: '/cinema' },
  { label: 'play', href: '/playground' },
  { label: 'write', href: '/writing' },
];

/** Night mode homepage: the site header, the room, and (on phones) a dock of direct links. */
export function TfiHome({ onToggleTheme }: { onToggleTheme?: () => void }) {
  const stage = useRef<HTMLDivElement>(null);

  // phones: the room is wider than the screen — start centred on the boy, let people pan
  useEffect(() => {
    const el = stage.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = el.scrollWidth * 0.47 - el.clientWidth / 2;
  }, []);

  return (
    <div className="hm tfi-home">
      <div className="hm-page tfi-head">
        <SiteHeader onToggleTheme={onToggleTheme} links={NAV} />
      </div>
      <div className="tfi-backdrop" aria-hidden="true">
        <Image src={room} alt="" fill sizes="320px" quality={40} />
      </div>
      <main className="tfi-stage" ref={stage} tabIndex={-1} aria-label="TFI mode — Srihari's room">
        <h1 className="tfi-sr">Srihari — TFI mode. Explore the room: the stickers and objects are links.</h1>
        <TfiRoom />
      </main>
      <p className="tfi-pan-hint" aria-hidden="true">
        ← drag to look around →
      </p>
      <nav className="tfi-dock" aria-label="Room shortcuts">
        {stickers.map((s) => (
          <Link key={s.key} href={s.key === 'music' ? '#tfi-player' : s.href} className={`tfi-dock-${s.key}`}>
            {s.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
