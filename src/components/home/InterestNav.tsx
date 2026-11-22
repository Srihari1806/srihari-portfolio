import Link from 'next/link';
import { Clapperboard, Cpu, Headphones } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { interests } from '@/data/home';
import { CricketBallIcon, LaptopCodeIcon, LoopArrow } from './Doodles';

const icons: Record<(typeof interests)[number]['key'], ComponentType<SVGProps<SVGSVGElement>>> = {
  cse: LaptopCodeIcon,
  electronics: (p) => <Cpu strokeWidth={1.3} {...p} />,
  cricket: CricketBallIcon,
  cinema: (p) => <Clapperboard strokeWidth={1.3} {...p} />,
  music: (p) => <Headphones strokeWidth={1.3} {...p} />,
};

export function InterestNav() {
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
              <Link href={it.href}>
                <Icon className="hm-interest-icon" aria-hidden="true" />
                <strong>{it.label}</strong>
                <span>({it.note.join(' · ')})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
