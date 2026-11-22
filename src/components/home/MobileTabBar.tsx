'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Clapperboard, Code2, Cpu } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { mobileTabs } from '@/data/home';
import { CricketBallIcon, InvaderIcon, SoundArcsIcon } from './Doodles';

type Key = (typeof mobileTabs)[number]['key'];

const icons: Record<Key, ComponentType<SVGProps<SVGSVGElement>>> = {
  cse: (p) => <Code2 strokeWidth={1.6} {...p} />,
  electronics: (p) => <Cpu strokeWidth={1.5} {...p} />,
  cricket: (p) => <CricketBallIcon strokeWidth={1.6} {...p} />,
  cinema: (p) => <Clapperboard strokeWidth={1.5} {...p} />,
  music: SoundArcsIcon,
  memes: InvaderIcon,
};

/** Fixed bottom navigation shown on phones only. */
export function MobileTabBar() {
  const [active, setActive] = useState<Key>('cse');
  return (
    <nav className="hm-tabbar hm-only-mobile" aria-label="Explore by interest">
      <ul>
        {mobileTabs.map((t) => {
          const Icon = icons[t.key];
          return (
            <li key={t.key}>
              <Link
                href={t.href}
                {...(t.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={active === t.key ? 'is-active' : undefined}
                onClick={() => setActive(t.key)}
              >
                <Icon className={`hm-tab-icon hm-tab-icon--${t.key}`} aria-hidden="true" />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
