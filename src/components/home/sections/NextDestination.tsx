'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import '@fontsource/vt323/400.css';
import { REBOARD_EVENT } from '@/components/ride/journey';
import { links, mailto, profile, resumeLink } from '@/data/profile';
import { useRole } from '@/context/RoleContext';

const destinations = [
  { code: 'DA', name: 'Data & Analytics', role: 'data' },
  { code: 'SE', name: 'Software Engineering', role: 'software' },
  { code: 'AI', name: 'Applied AI', role: 'ai' },
  { code: 'PB', name: 'Product & Business', role: 'product|business' },
];

/** One split-flap line: the letters settle one after another when the board scrolls into view. */
function Flap({ text, on, delay = 0 }: { text: string; on: boolean; delay?: number }) {
  let n = 0;
  return (
    <span className="nd-flap" aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} className="nd-word" aria-hidden="true">
          {word.split('').map((ch, i) => (
            <span key={i} className={on ? 'is-on' : ''} style={{ animationDelay: `${delay + n++ * 28}ms` }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/** The signature footer: a railway departure board for where I'd like to go next. */
export function NextDestination({ variant = 'home' }: { variant?: 'home' | 'page' }) {
  const { activeRole } = useRole();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const cv = resumeLink(activeRole);

  useEffect(() => {
    if (reduce) return setSeen(true);
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const reboard = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new Event(REBOARD_EVENT));
  };

  const contacts = [
    { label: 'Résumé', value: cv.label, href: cv.href, ext: cv.isFile },
    { label: 'Email', value: links.email, href: mailto(), ext: false },
    { label: 'LinkedIn', value: 'linkedin', href: links.linkedin, ext: true },
    { label: 'GitHub', value: links.github.replace('https://', ''), href: links.github, ext: true },
  ].filter((c) => c.href);

  return (
    <section ref={ref} className={`nd nd--${variant}`} aria-labelledby="nd-title">
      <div className="nd-inner">
        <div className="nd-top">
          <p className="nd-kicker">Departures · Class of {profile.graduation}</p>
          <h2 id="nd-title" className="nd-title">
            Where to next?
          </h2>
        </div>

        <div className="nd-board" role="table" aria-label="Opportunities I'm looking for">
          <div className="nd-board-row nd-board-head" role="row">
            <span role="columnheader">Code</span>
            <span role="columnheader">Destination</span>
            <span role="columnheader">Status</span>
          </div>
          {destinations.map((d, i) => {
            const now = !!activeRole && d.role.split('|').includes(activeRole);
            return (
              <div key={d.code} className={`nd-board-row${now ? ' is-now' : ''}`} role="row">
                <span role="cell" className="nd-code">
                  <Flap text={d.code} on={seen} delay={i * 120} />
                </span>
                <span role="cell">
                  <Flap text={d.name.toUpperCase()} on={seen} delay={i * 120 + 80} />
                </span>
                <span role="cell" className="nd-status">
                  <Flap text={now ? 'NOW BOARDING' : 'OPEN'} on={seen} delay={i * 120 + 400} />
                </span>
              </div>
            );
          })}
        </div>

        <dl className="nd-facts">
          <div>
            <dt>Graduation</dt>
            <dd>{profile.graduation}</dd>
          </div>
          <div>
            <dt>Availability</dt>
            <dd>{profile.availability}</dd>
          </div>
          {contacts.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>
                <a href={c.href} {...(c.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {c.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <div className="nd-bottom">
          <p className="nd-close">The journey continues.</p>
          <div className="nd-actions">
            {variant === 'home' && (
              <button type="button" className="nd-btn" onClick={reboard}>
                Board the train again
              </button>
            )}
            <a href="#top" className="nd-btn nd-btn--ghost">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
