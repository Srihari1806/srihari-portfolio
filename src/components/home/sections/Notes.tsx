import { ArrowUpRight } from 'lucide-react';
import { noteCategories, notes, publishingProfiles } from '@/data/notes';
import { SectionHead } from './SectionHead';

const STATUS = { published: 'Published', draft: 'Draft', 'in-research': 'In research' } as const;

/** "Notes along the way" — research and writing. Only published pieces or clearly labelled drafts. */
export function Notes({ index = '05' }: { index?: string }) {
  return (
    <section className="hs hs--notes" id="notes" aria-labelledby="hs-notes">
      <SectionHead
        id="hs-notes"
        index={index}
        kicker="Research & writing"
        title="Notes Along The Way."
        sub="Case studies, PRDs and analysis. Pieces still being researched are labelled as such."
        aside="ink still drying"
      />
      <div className="nt-wrap">
        <ul className="nt-cats" aria-label="Writing categories">
          {noteCategories.map((c) => {
            const n = notes.filter((x) => x.category === c).length;
            return (
              <li key={c} className={n ? '' : 'is-empty'}>
                <span>{c}</span>
                <span className="nt-count">{n ? n : '—'}</span>
              </li>
            );
          })}
        </ul>
        <div>
          <ul className="nt-list">
            {notes.map((n) => (
              <li key={n.title} className="nt-item">
                <p className="nt-item-meta">
                  {n.category}
                  <span className={`nt-status nt-status--${n.status}`}>{STATUS[n.status]}</span>
                </p>
                {n.url ? (
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="nt-item-title">
                    {n.title} <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
                  </a>
                ) : (
                  <p className="nt-item-title">{n.title}</p>
                )}
                <p className="nt-item-desc">{n.description}</p>
              </li>
            ))}
          </ul>
          {publishingProfiles.length > 0 && (
            <p className="nt-profiles">
              More of my work on{' '}
              {publishingProfiles.map((p, i) => (
                <span key={p.label}>
                  {i > 0 && ' · '}
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="hs-inline-link">
                    {p.label}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
