import { ArrowUpRight } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { stations, STATUS_LABEL, type Station } from '@/data/lab';
import { Workshop } from './Workshop';
import './lab.css';

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="lb-block">
      <h4>{title}</h4>
      <ul>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

function StationCard({ s, n }: { s: Station; n: number }) {
  return (
    <section id={`station-${s.key}`} className={`lb-station lb-station--${s.status}`} aria-labelledby={`lb-${s.key}`}>
      <header className="lb-station-head">
        <p className="lb-station-n">Station {n}</p>
        <h2 id={`lb-${s.key}`}>{s.name}</h2>
        <p className="lb-bench">{s.bench}</p>
        <span className={`lb-status lb-status--${s.status}`}>{STATUS_LABEL[s.status]}</span>
      </header>
      <div className="lb-station-body">
        <p className="lb-summary">{s.summary}</p>
        <ul className="lb-topics" aria-label="Topics">
          {s.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <dl className="lb-dl">
          <div>
            <dt>Objective</dt>
            <dd>{s.objective}</dd>
          </div>
          {s.io && (
            <>
              <div>
                <dt>Inputs</dt>
                <dd>{s.io.inputs}</dd>
              </div>
              <div>
                <dt>Outputs</dt>
                <dd>{s.io.outputs}</dd>
              </div>
            </>
          )}
        </dl>
        <div className="lb-blocks">
          <Block title="Methodology" items={s.methodology} />
          <Block title="Architecture" items={s.architecture} />
          <Block title="Results" items={s.results} />
          <Block title="Limitations" items={s.limitations} />
          <Block title="Lessons learned" items={s.lessons} />
        </div>
        {s.next && (
          <p className="lb-next">
            <strong>On the bench next:</strong> {s.next}
          </p>
        )}
        <div className="lb-foot">
          {s.code.map((c) => (
            <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" className="hs-inline-link">
              {c.label} <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
            </a>
          ))}
          {s.source && <span className="lb-source">{s.source}</span>}
        </div>
      </div>
    </section>
  );
}

export function LabPage() {
  return (
    <PageShell className="lb">
      <header className="lb-hero">
        <p className="lb-kicker">The Lab · technical workshop</p>
        <h1 className="lb-title">Work shows what I built. The Lab shows how it works.</h1>
        <p className="lb-lede">Five stations, one bench. Each station says plainly whether its write-up is done or still on the bench.</p>
      </header>
      <Workshop />
      <nav className="lb-index" aria-label="Stations">
        {stations.map((s, i) => (
          <a key={s.key} href={`#station-${s.key}`}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {s.name}
            <i className={`lb-dot lb-dot--${s.status}`} aria-hidden="true" />
          </a>
        ))}
      </nav>
      <div className="lb-stations">
        {stations.map((s, i) => (
          <StationCard key={s.key} s={s} n={i + 1} />
        ))}
      </div>
    </PageShell>
  );
}
