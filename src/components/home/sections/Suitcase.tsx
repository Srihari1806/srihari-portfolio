'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { capabilities, type CapabilityKey } from '@/data/capabilities';
import { experience } from '@/data/experience';
import { projects } from '@/data/projects';
import { useRole } from '@/context/RoleContext';
import { SUITCASE_EVENT, setSuitcase, type SuitcaseDetail } from '@/lib/events';
import { SuitcaseObject } from './SuitcaseObjects';

const orgOf = (k: string) => experience.find((e) => e.key === k);
const projOf = (k: string) => projects.find((p) => p.key === k);

function Details({ k }: { k: CapabilityKey }) {
  const c = capabilities.find((x) => x.key === k)!;
  const supporting = [...c.projects.map((p) => projOf(p)?.name).filter(Boolean), ...c.alsoSeenIn] as string[];
  const related = c.experience.map(orgOf).filter(Boolean);
  return (
    <>
      <dl className="sc-dl">
        <div>
          <dt>What I can contribute</dt>
          <dd>{c.contribution}</dd>
        </div>
        <div>
          <dt>Relevant skills</dt>
          <dd>
            <ul className="sc-tags">
              {c.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </dd>
        </div>
        {supporting.length > 0 && (
          <div>
            <dt>Supporting work</dt>
            <dd>{supporting.join(' · ')}</dd>
          </div>
        )}
        {related.length > 0 && (
          <div>
            <dt>Related experience</dt>
            <dd>{related.map((e) => `${e!.title}, ${e!.org.split(' · ')[0]}`).join(' · ')}</dd>
          </div>
        )}
      </dl>
      <a href={c.evidenceHref} className="sc-evidence">
        {c.evidenceLabel}
        <ArrowRight aria-hidden="true" strokeWidth={1.8} />
      </a>
    </>
  );
}

/** "What I carry with me" — folded inside the ADMIT ONE ticket. The ticket's suitcase stub unfolds this
    drawer right under it; closed, it takes no space. Inside: hover an object to read its packing note. */
export function Suitcase() {
  const { role } = useRole();
  const reduce = useReducedMotion();
  const relevant = role?.capabilities ?? [];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CapabilityKey | null>(null);
  const panelId = useId();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = (e: Event) => setOpen((e as CustomEvent<SuitcaseDetail>).detail.open);
    window.addEventListener(SUITCASE_EVENT, on);
    return () => window.removeEventListener(SUITCASE_EVENT, on);
  }, []);

  // bring the opened bag into view
  useEffect(() => {
    if (open) window.setTimeout(() => ref.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }), 80);
  }, [open, reduce]);

  useEffect(() => {
    if (role?.capabilities[0]) setActive(role.capabilities[0] as CapabilityKey);
  }, [role]);

  const toggle = (v: boolean) => setSuitcase(v);
  const current = capabilities.find((c) => c.key === active);
  const t = reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section ref={ref} className={`sc-drawer${open ? ' is-open' : ''}`} id="carry" aria-label="What I bring on board">
      {/* phones: the ticket row is hidden, so the bag gets its own slim ticket */}
      <button type="button" className="sc-mini hm-only-mobile" aria-expanded={open} onClick={() => toggle(!open)}>
        <span className="sc-mini-stub" aria-hidden="true">
          <MiniCase />
        </span>
        <span className="sc-mini-txt">
          <b>What I bring on board</b>
          <span>{open ? 'Close the bag' : 'Open the suitcase'}</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="bag" className="sc-drawer-in" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={t}>
            <div className="sc-bag hm-hide-mobile">
              <div className="sc-bag-head">
                <p className="sc-bag-kicker">What I bring on board</p>
                <h2 className="sc-bag-title">What I carry with me.</h2>
                <button type="button" className="sc-x" onClick={() => toggle(false)} aria-label="Close the suitcase">
                  ×
                </button>
              </div>
              <div className="sc-bag-body">
                <div className="sc-base sc-base--compact">
                  <ul className="sc-row" role="list">
                    {capabilities.map((c, i) => {
                      const on = c.key === active;
                      const rel = relevant.includes(c.key);
                      return (
                        <motion.li key={c.key} initial={reduce ? false : { y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...t, delay: reduce ? 0 : 0.15 + i * 0.05 }}>
                          <button
                            type="button"
                            className={`sc-obj-btn${on ? ' is-on' : ''}${rel ? ' is-rel' : ''}`}
                            aria-controls={panelId}
                            aria-pressed={on}
                            onMouseEnter={() => setActive(c.key)}
                            onFocus={() => setActive(c.key)}
                            onClick={() => setActive(c.key)}
                          >
                            <SuitcaseObject kind={c.key} className="sc-obj" />
                            <span className="sc-item-title">{c.title}</span>
                            <span className="sc-note" aria-hidden="true">
                              {c.note}
                            </span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
                <div id={panelId} className="sc-note-card sc-note-card--side" aria-live="polite">
                  <span className="sc-tape" aria-hidden="true" />
                  {current ? (
                    <>
                      <p className="sc-panel-kicker">Packing list · {current.object}</p>
                      <p className="sc-panel-title">{current.title}</p>
                      <Details k={current.key} />
                    </>
                  ) : (
                    <p className="sc-note-empty">
                      Six things I never travel without.
                      <span>Hover one to read its tag ←</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ol className="sc-flat hm-only-mobile">
              {capabilities.map((c) => (
                <li key={c.key} className={`sc-flat-item${relevant.includes(c.key) ? ' is-rel' : ''}`}>
                  <div className="sc-flat-head">
                    <SuitcaseObject kind={c.key} className="sc-flat-obj" />
                    <div>
                      <p className="sc-item-obj">{c.object}</p>
                      <h3 className="sc-flat-title">{c.title}</h3>
                    </div>
                  </div>
                  <Details k={c.key} />
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** a small closed suitcase for ticket stubs */
export function MiniCase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true">
      <path d="M17 10V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" fill="none" stroke="#1c1d1a" strokeWidth="3" />
      <rect x="3" y="10" width="42" height="27" rx="5" fill="var(--red)" stroke="#1c1d1a" strokeWidth="2.5" />
      <path d="M3 21h42" stroke="#fbe6b8" strokeWidth="3" />
      <path d="M13 10v27M35 10v27" stroke="#2a1b14" strokeWidth="3" />
      <rect x="20" y="17" width="8" height="7" rx="1.5" fill="#d9a441" stroke="#1c1d1a" strokeWidth="1.5" />
    </svg>
  );
}
