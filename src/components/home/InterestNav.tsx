'use client';

import Link from 'next/link';
import { Clapperboard, Cpu, Headphones } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { interests } from '@/data/home';
import { useRole } from '@/context/RoleContext';
import type { RoleId } from '@/data/roles';
import { useEffect, useState } from 'react';
import { SUITCASE_EVENT, setSuitcase, type SuitcaseDetail } from '@/lib/events';
import { MiniCase } from './sections/Suitcase';
import { CricketBallIcon, LaptopCodeIcon, LoopArrow } from './Doodles';

const icons: Record<(typeof interests)[number]['key'], ComponentType<SVGProps<SVGSVGElement>>> = {
  cse: LaptopCodeIcon,
  electronics: (p) => <Cpu strokeWidth={1.3} {...p} />,
  cricket: CricketBallIcon,
  cinema: (p) => <Clapperboard strokeWidth={1.3} {...p} />,
  music: (p) => <Headphones strokeWidth={1.3} {...p} />,
};

/** "also into": a rail ticket. Each stop opens its page in the same tab and tunes the site to that role family. */
export function InterestNav() {
  const { activeRole, setActiveRole } = useRole();
  const [bag, setBag] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setBag((e as CustomEvent<SuitcaseDetail>).detail.open);
    window.addEventListener(SUITCASE_EVENT, on);
    return () => window.removeEventListener(SUITCASE_EVENT, on);
  }, []);
  return (
    <nav className="hm-interests" aria-label="Things I'm also into">
      <p className="hm-also" aria-hidden="true">
        also into <LoopArrow className="hm-also-arrow" />
      </p>
      <ul>
        {interests.map((it) => {
          const Icon = icons[it.key];
          return (
            <li key={it.key}>
              <Link
                href={it.href}
                className={it.role && it.role === activeRole ? 'is-on' : undefined}
                onClick={() => it.role && setActiveRole(it.role as RoleId)}
              >
                <span className="hm-interest-go" aria-hidden="true">→</span>
                <Icon className="hm-interest-icon" aria-hidden="true" />
                <strong>{it.label}</strong>
                <span>({it.note.join(' · ')})</span>
              </Link>
            </li>
          );
        })}
        <li className="hm-carry">
          <button type="button" aria-expanded={bag} aria-controls="carry" onClick={() => setSuitcase(!bag)}>
            <MiniCase className={`hm-carry-case${bag ? ' is-open' : ''}`} />
            <strong>What I carry</strong>
            <span>{bag ? 'close the bag ↑' : 'open the bag ↓'}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
