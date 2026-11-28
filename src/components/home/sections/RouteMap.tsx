'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { experience } from '@/data/experience';
import { useRole } from '@/context/RoleContext';
import { SectionHead } from './SectionHead';

/** The journey as a railway route: one stop at a time, with a little train that moves to it. */
export function RouteMap({ index = '02' }: { index?: string }) {
  const { role } = useRole();
  const [at, setAt] = useState(experience.length - 2); // start at the latest real stop
  const n = experience.length;
  const e = experience[at];

  // a role jumps the train to the stop that matters most for it
  useEffect(() => {
    const k = role?.experience[0];
    const i = experience.findIndex((x) => x.key === k);
    if (i >= 0) setAt(i);
  }, [role]);

  // on narrow screens the rail scrolls: keep the selected stop in view
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const w = wrap.current;
    if (!w || w.scrollWidth <= w.clientWidth) return;
    const stop = w.querySelectorAll<HTMLElement>('.rm-stop')[at];
    if (stop) w.scrollTo({ left: stop.offsetLeft - w.clientWidth / 2, behavior: 'smooth' });
  }, [at]);

  const pct = (i: number) => (n === 1 ? 50 : 4 + (i / (n - 1)) * 92);

  return (
    <section className="hs hs--route" aria-labelledby="hs-route">
      <SectionHead id="hs-route" index={index} kicker="The route so far" title={<>Seven stops. <em>One line.</em></>} />

      <div className="rm">
        <div className="rm-track-wrap" ref={wrap}>
          <div className="rm-track" role="tablist" aria-label="Career stops">
            <span className="rm-rail" aria-hidden="true" />
            <span className="rm-train" style={{ left: `${pct(at)}%` }} aria-hidden="true">
              <svg viewBox="0 0 64 30">
                <rect x="2" y="4" width="50" height="18" rx="5" fill="var(--teal)" />
                <path d="M52 8h4a6 6 0 0 1 6 6v8H52z" fill="var(--red)" />
                <rect x="8" y="8" width="9" height="7" rx="1.5" fill="#fbe6b8" />
                <rect x="21" y="8" width="9" height="7" rx="1.5" fill="#fbe6b8" />
                <rect x="34" y="8" width="9" height="7" rx="1.5" fill="#fbe6b8" />
                <path d="M2 18h50" stroke="var(--amber)" strokeWidth="2" />
                <circle cx="14" cy="25" r="3.4" fill="#1c1d1a" />
                <circle cx="44" cy="25" r="3.4" fill="#1c1d1a" />
              </svg>
            </span>
            {experience.map((x, i) => (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={i === at}
                className={`rm-stop${i === at ? ' is-on' : ''}${i < at ? ' is-past' : ''}${x.kind === 'next' ? ' is-next' : ''}`}
                style={{ left: `${pct(i)}%` }}
                onClick={() => setAt(i)}
              >
                <span className="rm-dot" aria-hidden="true" />
                <span className="rm-year">{x.year}</span>
                <span className="rm-name">{x.org.split(' · ')[0].replace('KIIT University, Bhubaneswar', 'KIIT')}</span>
              </button>
            ))}
          </div>
        </div>

        <article className={`rm-card rm-card--${e.kind}`} role="tabpanel" aria-live="polite">
          <div className="rm-card-stub">
            <span className="rm-count">
              {String(at + 1).padStart(2, '0')}
              <i>/ {String(n).padStart(2, '0')}</i>
            </span>
            <span className="rm-period">{e.period}</span>
          </div>
          <div className="rm-card-main">
            <p className="rm-org">{e.org}</p>
            <h3 className="rm-title">{e.title}</h3>
            <p className="rm-sum">{e.summary}</p>
            {e.skills.length > 0 && (
              <ul className="rm-skills">
                {e.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            {e.pending && <p className="rm-pending">{e.pending}…</p>}
            {e.link && (
              <a href={e.link} className="rm-visit">
                Visit {e.org} ↗
              </a>
            )}
          </div>
          <div className="rm-nav">
            <button type="button" onClick={() => setAt((at - 1 + n) % n)} aria-label="Previous stop">
              <ArrowLeft aria-hidden="true" strokeWidth={2} />
            </button>
            <button type="button" onClick={() => setAt((at + 1) % n)} aria-label="Next stop">
              <ArrowRight aria-hidden="true" strokeWidth={2} />
            </button>
            <Link href={`/about#ticket-${e.key}`} className="rm-more">
              Full ticket
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
