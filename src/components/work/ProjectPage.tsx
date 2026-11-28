import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { projects, type PortfolioProject } from '@/data/projects';
import './work-pages.css';

function Chapter({ n, title, items, empty, children }: { n: number; title: string; items?: string[]; empty?: string; children?: React.ReactNode }) {
  const has = (items && items.length > 0) || !!children;
  return (
    <section className={`pj-ch${has ? '' : ' is-empty'}`} aria-labelledby={`pj-ch-${n}`}>
      <p className="pj-ch-n" aria-hidden="true">
        {String(n).padStart(2, '0')}
      </p>
      <div>
        <h2 id={`pj-ch-${n}`} className="pj-ch-title">
          {title}
        </h2>
        {children}
        {items && items.length > 0 && (
          <ul className="pj-list">
            {items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        {!has && <p className="pj-empty">{empty ?? 'Being written up.'}</p>}
      </div>
    </section>
  );
}

/** One project, told as a case study: Problem → Research → My role → Decisions → Implementation → Evaluation → Lessons. */
export function ProjectPage({ p }: { p: PortfolioProject }) {
  const i = projects.findIndex((x) => x.key === p.key);
  const next = projects[(i + 1) % projects.length];
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

  return (
    <PageShell className="pj">
      <div className="pj-top">
        <Link href="/work" className="pj-back">
          <ArrowLeft aria-hidden="true" strokeWidth={1.8} /> All work
        </Link>
      </div>

      <header className="pj-hero">
        <div className="pj-hero-copy">
          <p className="pj-kicker">
            <span className={`hs-status hs-status--${p.status}`}>{p.statusLabel}</span>
            {p.kind}
          </p>
          <h1 className="pj-name">{p.name}</h1>
          <p className="pj-title">{p.title}</p>
          <p className="pj-lede">{p.oneLiner}</p>
          <div className="pj-actions">
            <a href={p.live} {...ext} className="hm-btn hm-btn--dark pj-btn">
              Open the live product <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
            </a>
            {p.code && (
              <a href={p.code} {...ext} className="hm-btn hm-btn--outline pj-btn">
                <Github aria-hidden="true" strokeWidth={1.8} /> Code
              </a>
            )}
          </div>
        </div>
        <a href={p.live} {...ext} className="pj-shot" aria-label={`${p.name} live site (new tab)`}>
          <Image src={p.image} alt={p.imageAlt} width={800} height={500} priority sizes="(min-width: 1000px) 52vw, 94vw" />
          <span>Real screenshot · live site</span>
        </a>
      </header>

      <dl className="pj-facts">
        <div>
          <dt>For</dt>
          <dd>{p.users}</dd>
        </div>
        <div>
          <dt>My part</dt>
          <dd>{p.contribution}</dd>
        </div>
        {p.tech.length > 0 && (
          <div>
            <dt>Built with</dt>
            <dd>{p.tech.join(' · ')}</dd>
          </div>
        )}
      </dl>
      {p.teamNote && <p className="pj-team">{p.teamNote}</p>}

      <div className="pj-chapters">
        <Chapter n={1} title="Problem">
          <p className="pj-p">{p.problem}</p>
        </Chapter>
        <Chapter n={2} title="Research" items={p.research} />
        <Chapter n={3} title="My role">
          <p className="pj-p">{p.contribution}</p>
          <ul className="pj-list">
            {p.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Chapter>
        <Chapter n={4} title="Decisions" items={p.decisions} />
        <Chapter n={5} title="Implementation" items={p.implementation} />
        <Chapter n={6} title="What it does">
          <ul className="pj-list">
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Chapter>
        <Chapter n={7} title="Evaluation" items={p.evidence} empty="No verified metrics published yet. I’d rather show none than invent one." />
        <Chapter n={8} title="Limitations" items={p.limitations} empty="Being written up." />
        <Chapter n={9} title="Lessons" items={p.lessons} />
      </div>

      <nav className="pj-next" aria-label="Next project">
        <Link href={`/work/${next.key}`}>
          <span>Next project</span>
          <strong>
            {next.name} <ArrowRight aria-hidden="true" strokeWidth={1.8} />
          </strong>
        </Link>
        <Link href="/lab">
          <span>How it works</span>
          <strong>
            Visit the Lab <ArrowRight aria-hidden="true" strokeWidth={1.8} />
          </strong>
        </Link>
      </nav>
    </PageShell>
  );
}
