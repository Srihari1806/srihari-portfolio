'use client';

import { useId, useState } from 'react';
import { experience, type Experience } from '@/data/experience';
import { useRole } from '@/context/RoleContext';
import { SectionHead } from './SectionHead';

const KIND: Record<Experience['kind'], string> = {
  education: 'Season ticket',
  work: 'Internship',
  venture: 'Founder',
  freelance: 'Freelance',
  next: 'Open ticket',
};

function TicketDetail({ e }: { e: Experience }) {
  const blocks = [
    { t: 'What I did', items: e.responsibilities },
    { t: 'Skills', items: e.skills },
    { t: 'Lessons', items: e.lessons },
  ].filter((b) => b.items.length > 0);
  return (
    <div className="jt-detail-in">
      <p className="jt-detail-title">
        {e.title} <span>· {e.org}</span>
      </p>
      <p className="jt-detail-sum">{e.summary}</p>
      {blocks.length > 0 && (
        <div className="jt-detail-cols">
          {blocks.map((b) => (
            <div key={b.t}>
              <p className="jt-detail-label">{b.t}</p>
              <ul>
                {b.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {e.pending && <p className="jt-pending">{e.pending}.</p>}
      {e.link && (
        <a href={e.link} className="hs-inline-link jt-visit">
          Visit {e.org} ↗
        </a>
      )}
    </div>
  );
}

/** "My journey so far" — one railway ticket per stage, stamped with its year. */
export function Journey({ index = '03', headingId = 'hs-journey' }: { index?: string; headingId?: string }) {
  const { role } = useRole();
  const rel = role?.experience ?? [];
  const [open, setOpen] = useState<string | null>(null);
  const panelId = useId();
  const current = experience.find((e) => e.key === open);

  return (
    <section className="hs hs--journey" id="journey" aria-labelledby={headingId}>
      <SectionHead id={headingId} index={index} kicker="Experience" title="My Journey So Far." sub="Every stop so far, in order. Tap a ticket for the details." aside="valid for one career" />
      <ol className="jt-list">
        {experience.map((e) => {
          const on = open === e.key;
          return (
            <li key={e.key} id={`ticket-${e.key}`}>
              <button
                type="button"
                className={`jt-ticket jt-ticket--${e.kind}${on ? ' is-on' : ''}${rel.includes(e.key) ? ' is-rel' : ''}`}
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => setOpen(on ? null : e.key)}
              >
                <span className="jt-stub" aria-hidden="true">
                  <span className="jt-stamp">{e.year}</span>
                </span>
                <span className="jt-main">
                  <span className="jt-kind">{KIND[e.kind]}</span>
                  <span className="jt-period">{e.period}</span>
                  <span className="jt-title">{e.title}</span>
                  <span className="jt-org">{e.org}</span>
                  <span className="jt-sum">{e.summary}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div id={panelId} className={`jt-detail${current ? ' is-open' : ''}`} aria-live="polite">
        {current && <TicketDetail e={current} />}
      </div>
    </section>
  );
}
