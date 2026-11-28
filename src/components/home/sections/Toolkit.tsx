'use client';

import { skillGroups } from '@/data/skills';
import { prioritise } from '@/data/roles';
import { useRole } from '@/context/RoleContext';
import { evidenceHref, evidenceLabel } from '@/lib/evidence';
import { SectionHead } from './SectionHead';

/** "Inside my toolkit" — skills grouped by capability, each tied to the work that shows it. */
export function Toolkit({ index = '04' }: { index?: string }) {
  const { role } = useRole();
  const groups = prioritise(skillGroups, role?.skills, (g) => g.key);
  const rel = new Set(role?.skills.slice(0, 2) ?? []);

  return (
    <section className="hs hs--toolkit" aria-labelledby="hs-toolkit">
      <SectionHead
        id="hs-toolkit"
        index={index}
        kicker="Skills & evidence"
        title="Inside My Toolkit."
        sub="Grouped by what they let me do. Where a skill shows up in real work, the work is named next to it."
      />
      <p className="tk-legend">
        <span>
          <i className="tk-mark tk-mark--shown" aria-hidden="true" /> shown in real work
        </span>
        <span>
          <i className="tk-mark" aria-hidden="true" /> in my toolkit, write-up to come
        </span>
        <span>
          <i className="tk-mark tk-mark--learning" aria-hidden="true" /> currently learning
        </span>
      </p>
      <div className="tk-grid">
        {groups.map((g) => (
          <article key={g.key} className={`tk-group${rel.has(g.key) ? ' is-rel' : ''}`} aria-labelledby={`tk-${g.key}`}>
            <h3 id={`tk-${g.key}`} className="tk-title">
              {g.title}
            </h3>
            <p className="tk-line">{g.line}</p>
            <ul className="tk-skills">
              {g.skills.map((s) => {
                const shown = !!s.evidence?.length;
                return (
                  <li key={s.name} className={s.status === 'learning' ? 'is-learning' : shown ? 'is-shown' : ''}>
                    <i className={`tk-mark${s.status === 'learning' ? ' tk-mark--learning' : shown ? ' tk-mark--shown' : ''}`} aria-hidden="true" />
                    <span className="tk-name">{s.name}</span>
                    {s.status === 'learning' && <span className="hs-sr"> (currently learning)</span>}
                    {shown && (
                      <span className="tk-ev">
                        {s.evidence!.map((k, i) => (
                          <span key={k}>
                            {i > 0 && ', '}
                            <a href={evidenceHref(k)}>{evidenceLabel(k)}</a>
                          </span>
                        ))}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
