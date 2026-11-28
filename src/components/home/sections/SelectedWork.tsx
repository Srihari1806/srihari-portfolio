'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { prioritise } from '@/data/roles';
import { useRole } from '@/context/RoleContext';
import { SectionHead } from './SectionHead';

/** Homepage teaser: three projects, one line each. The full story lives on /work/<project>. */
export function SelectedWork() {
  const { role } = useRole();
  const list = prioritise(projects, role?.projects, (p) => p.key);
  return (
    <section className="hs hs--work" id="selected-work" aria-labelledby="hs-work">
      <SectionHead
        id="hs-work"
        index="02"
        kicker="Selected work"
        title="Three products. All live."
        sub="One line each here. Open a project for the problem, my part, the decisions and the limits."
        aside="receipts inside →"
      />
      <ul className="wk-grid">
        {list.map((p, i) => (
          <li key={p.key} className={`wk-card${role && i === 0 ? ' is-top' : ''}`}>
            <Link href={`/work/${p.key}`} className="wk-link" aria-label={`${p.name}: open the project page`}>
              <span className="wk-shot">
                <Image src={p.image} alt={p.imageAlt} width={800} height={500} sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 92vw" />
              </span>
              <span className="wk-meta">
                <span className={`hs-status hs-status--${p.status}`}>{p.statusLabel}</span>
                <span className="wk-kind">{p.kind}</span>
              </span>
              <span className="wk-name">{p.name}</span>
              <span className="wk-title">{p.title}</span>
              <span className="wk-line">{p.oneLiner}</span>
              <span className="wk-go">
                Open project <ArrowRight aria-hidden="true" strokeWidth={1.8} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="hs-more">
        <Link href="/work" className="hm-btn hm-btn--dark hs-more-btn">
          Take the road trip through my work <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}
