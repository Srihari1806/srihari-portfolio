'use client';

import Link from 'next/link';
import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, FileText, Mail, Play } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { links, mailto, profile, resumeLink } from '@/data/profile';
import { began, beliefs, howIThink, recruiterQuestions, toolkitCards } from '@/data/about';
import { experience, type Experience } from '@/data/experience';
import { skillGroups } from '@/data/skills';
import { roleFamilies } from '@/data/roles';
import { capabilities } from '@/data/capabilities';
import { projectByKey } from '@/data/projects';
import { useRole } from '@/context/RoleContext';
import { SectionHead } from '@/components/home/sections/SectionHead';
import { CinemaPanel, CricketPanel, MusicPanel } from './AboutArt';
import './about.css';

/* /about — DIRECTOR'S CUT. The page plays like a film: cold open, starring, scenes, the pitch,
   the press junket, crew, director's notes, stills, end credits and a post-credits scene.
   Every fact is read from data/ (profile, experience, roles, capabilities, skills, projects). */

type Evidence = { label: string; href?: string };

function evidenceFor(key: string): Evidence | null {
  const p = projectByKey(key);
  if (p) return { label: p.name, href: `/work/${p.key}` };
  if (key === 'portfolio') return { label: 'This site', href: '/' };
  const e = experience.find((x) => x.key === key);
  if (e) return { label: e.org === 'Independent' ? 'Freelance work' : e.org.split(' · ')[0].split(',')[0], href: e.link };
  return null;
}
const uniq = (items: (Evidence | null)[]) => {
  const seen = new Set<string>();
  return items.filter((e): e is Evidence => !!e && !seen.has(e.label) && !!seen.add(e.label));
};
const ext = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});
const orgOf = (e: Experience) => (e.org === 'Independent' ? 'Freelance' : e.org.split(' · ')[0].split(',')[0]);

/** reveal-on-scroll for a section; respects reduced motion */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setOn(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on] as const;
}

function Slate({ id, scene, title, note, aside }: { id: string; scene: string; title: React.ReactNode; note?: string; aside?: string }) {
  const [index, kicker] = scene.split(' · ');
  return <SectionHead id={id} index={index} kicker={kicker} title={title} sub={note} aside={aside} />;
}

/* ---------------------------------------------------------------- COLD OPEN */
function Marquee() {
  const rows = ['NOW SHOWING', 'SRIHARI', `CLASS OF ${profile.graduation}`];
  return (
    <div className="dc-marquee" aria-hidden="true">
      <div className="dc-marquee-crown">
        <span>★ Vizag Talkies ★</span>
      </div>
      <div className="dc-marquee-frame">
        <div className="dc-marquee-board">
          {rows.map((r, i) => (
            <p key={r} className={`dc-letters dc-letters--${i}`}>
              {r.split('').map((ch, n) => (
                <span key={n} className={ch === ' ' ? 'is-gap' : ''}>
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
      <div className="dc-marquee-legs">
        <span />
        <span />
      </div>
      <p className="dc-marquee-note">a data-driven product builder, in his debut feature</p>
    </div>
  );
}

function ColdOpen() {
  const cv = resumeLink();
  return (
    <section className="dc-open" aria-labelledby="dc-title">
      <div className="dc-open-copy">
        <p className="hm-eyebrow">
          <span className="hm-eyebrow-dot" aria-hidden="true" />
          About · Director’s cut
        </p>
        <p className="dc-presents">A Visakhapatnam × KIIT production</p>
        <h1 id="dc-title" className="dc-title">
          <span className="dc-title-small">Hi, I’m</span>
          <span className="dc-title-name">Srihari.</span>
        </h1>
        <p className="dc-logline">
          A {profile.identity.toLowerCase()} studying {profile.degree.replace('B.Tech, ', '')} — building where data, software, AI and product meet.
        </p>
        <dl className="dc-meta">
          <div>
            <dt>Release</dt>
            <dd>Class of {profile.graduation}</dd>
          </div>
          <div>
            <dt>Filmed in</dt>
            <dd>Vizag · Bhubaneswar</dd>
          </div>
          <div>
            <dt>Now showing</dt>
            <dd>Open to internships &amp; graduate roles</dd>
          </div>
        </dl>
        <div className="dc-open-cta">
          <a href="#pitch" className="dc-btn dc-btn--gold">
            <Play aria-hidden="true" /> Watch the pitch
          </a>
          <a href={cv.href} className="dc-btn" {...(cv.isFile ? ext(cv.href) : {})}>
            <FileText aria-hidden="true" /> {cv.label}
          </a>
        </div>
      </div>
      <Marquee />
    </section>
  );
}

/* ---------------------------------------------------------------- STARRING */
function Starring() {
  const [ref, on] = useReveal<HTMLElement>();
  return (
    <section ref={ref} className={`hs dc-sec dc-starring${on ? ' is-on' : ''}`} aria-labelledby="dc-star">
      <div className="dc-lobby">
        <span className="dc-lobby-corner dc-lobby-corner--tl" aria-hidden="true" />
        <span className="dc-lobby-corner dc-lobby-corner--tr" aria-hidden="true" />
        <span className="dc-lobby-corner dc-lobby-corner--bl" aria-hidden="true" />
        <span className="dc-lobby-corner dc-lobby-corner--br" aria-hidden="true" />
      <p className="hs-kicker dc-star-kicker" id="dc-star">
        <span className="hs-index">01</span>Starring
      </p>
      <p className="dc-star-name">{profile.name}</p>
      <p className="dc-star-as">as The Builder</p>
      <p className="dc-star-with">with</p>
      <ul className="dc-cast">
        {profile.pillars.map((p, i) => (
          <li key={p.label} style={{ transitionDelay: `${150 + i * 90}ms` }}>
            <strong>{p.label}</strong>
            <span>as the {p.line.replace(/^is my |^connects my work to /, '').replace(/\.$/, '')}</span>
          </li>
        ))}
      </ul>
      <div className="dc-synopsis">
        <p className="dc-synopsis-label">Synopsis</p>
        <p>
          From {profile.location}; a final-year {profile.degree} student at {profile.school}, graduating in {profile.graduation}. {began.join(' ')}
        </p>
      </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- SCENES (journey) */
function Scenes() {
  const [open, setOpen] = useState<string>(experience.find((e) => e.kind === 'work')?.key ?? experience[0].key);
  const panel = useId();
  const cur = experience.find((e) => e.key === open) ?? experience[0];
  const blocks = [
    { t: 'What I did', items: cur.responsibilities },
    { t: 'Skills used', items: cur.skills },
    { t: 'What I learned', items: cur.lessons },
  ].filter((b) => b.items.length);
  return (
    <section className="hs dc-sec" id="scenes" aria-labelledby="dc-scenes">
      <Slate id="dc-scenes" scene="02 · Reel one: the journey" title={<>Scenes so <em>far.</em></>} aside="tap a frame" note="Every stop, in order. Pick a frame to read the scene notes." />
      <div className="dc-strip-wrap">
        <p className="dc-edge" aria-hidden="true">
          {experience.map((e, i) => (
            <span key={e.key}>
              SRIHARI 5219 ▸ {String(i + 1).padStart(2, '0')}A
            </span>
          ))}
        </p>
        <ol className="dc-strip" aria-label="Experience timeline">
          {experience.map((e, i) => {
            const on = e.key === open;
            return (
              <li key={e.key}>
                <button type="button" className={`dc-frame dc-frame--${e.kind}${on ? ' is-on' : ''}`} aria-pressed={on} aria-controls={panel} onClick={() => setOpen(e.key)}>
                  <span className="dc-frame-no">SC {String(i + 1).padStart(2, '0')}</span>
                  <span className="dc-frame-year">{e.year}</span>
                  <span className="dc-frame-org">{e.kind === 'next' ? 'To be continued' : orgOf(e)}</span>
                  <span className="dc-frame-role">{e.kind === 'next' ? 'Next destination' : e.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div id={panel} className="dc-notes" aria-live="polite">
        <p className="dc-notes-head">
          <span>Scene notes</span> {cur.period}
        </p>
        <h3>
          {cur.title} <em>· {cur.org}</em>
        </h3>
        <p className="dc-notes-sum">{cur.summary}</p>
        {blocks.length > 0 && (
          <div className="dc-notes-cols">
            {blocks.map((b) => (
              <div key={b.t}>
                <p>{b.t}</p>
                <ul>
                  {b.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {cur.pending && <p className="dc-notes-pending">Scene still in the edit — {cur.pending.toLowerCase()}.</p>}
        {cur.link && (
          <a href={cur.link} className="dc-link" {...ext(cur.link)}>
            Visit {orgOf(cur)} <ArrowUpRight aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- THE PITCH (posters) */
const GENRE: Record<string, string> = { data: 'A data thriller', software: 'A build story', ai: 'Sci-fi, but useful', product: 'Coming-of-product', business: 'A market drama' };

function Pitch() {
  const { role } = useRole();
  return (
    <section className="hs dc-sec" id="pitch" aria-labelledby="dc-pitch">
      <Slate id="dc-pitch" scene="03 · Reel two: for recruiters" title={<>The <em>pitch.</em></>} aside="now casting" note="Five roles I’m auditioning for. Each poster says what I’d bring, and where you can see it." />
      <ul className="dc-posters">
        {roleFamilies.map((r) => {
          const cap = capabilities.find((c) => c.key === r.capabilities[0]);
          const proof = uniq([...r.projects.slice(0, 2).map(evidenceFor), ...r.experience.slice(0, 1).map(evidenceFor)]);
          return (
            <li key={r.id} className={`dc-frame-brass${role?.id === r.id ? ' is-on' : ''}`}>
              <div className={`dc-poster dc-poster--${r.id}`}>
              <p className="dc-poster-genre">{GENRE[r.id]}</p>
              <p className="dc-poster-presents">Beesetti Srihari presents</p>
              <h3>{r.label}</h3>
              {cap && <p className="dc-poster-tag">“{cap.contribution}”</p>}
              <p className="dc-poster-roles">Cast as: {r.targetRoles.slice(0, 3).join(' · ')}</p>
              <p className="dc-poster-feat">
                Featuring{' '}
                {proof.map((p, i) => (
                  <span key={p.label}>
                    {p.href ? (
                      <a href={p.href} {...ext(p.href)}>
                        {p.label}
                      </a>
                    ) : (
                      p.label
                    )}
                    {i < proof.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
              <p className="dc-poster-billing">Coming {profile.graduation} · now casting</p>
              <Link href={`/?for=${r.id}`} className="dc-poster-go">
                Watch for this role →
              </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- PRESS JUNKET (Q&A) */
function Junket() {
  const [i, setI] = useState(0);
  const q = recruiterQuestions[i];
  const cap = q.capability ? capabilities.find((c) => c.key === q.capability) : null;
  const exps = (q.experience ?? []).map((k) => experience.find((e) => e.key === k)).filter((e): e is Experience => !!e);
  const proof = uniq([...(cap ? cap.projects.map(evidenceFor) : []), ...(cap ? cap.experience.map(evidenceFor) : []), ...exps.map((e) => evidenceFor(e.key))]);
  return (
    <section className="hs dc-sec" id="junket" aria-labelledby="dc-junket">
      <Slate id="dc-junket" scene="04 · Reel three: recruiter Q&A" title={<>Press <em>junket.</em></>} note="The questions recruiters usually ask. Answers come straight from this portfolio — no AI, no guesswork." />
      <div className="dc-junket">
        <div className="dc-mics" role="tablist" aria-label="Questions">
          {recruiterQuestions.map((x, n) => (
            <button key={x.q} role="tab" aria-selected={n === i} className={`dc-pass${n === i ? ' is-on' : ''}`} onClick={() => setI(n)}>
              <span className="dc-pass-tag">Press · Q{n + 1}</span>
              <span className="dc-pass-q">{x.q}</span>
            </button>
          ))}
        </div>
        <div className="dc-answer" role="tabpanel" key={i}>
          <p className="dc-paper-mast">
            <span>The Vizag Gazette</span>
            <em>Entertainment · Talent · Class of {profile.graduation}</em>
          </p>
          <p className="dc-answer-q">“{q.q}”</p>
          <p className="dc-answer-by">Answered on record, from this portfolio</p>
          {cap && <p className="dc-answer-a">{cap.contribution}</p>}
          {exps.length > 0 && (
            <ul className="dc-answer-list">
              {exps.map((e) => (
                <li key={e.key}>
                  <strong>{e.title}</strong> — {e.org} <span>({e.period})</span>
                </li>
              ))}
            </ul>
          )}
          {q.profile === 'availability' && (
            <p className="dc-answer-a">
              {profile.availability}. I graduate from {profile.school} in {profile.graduation}. The quickest way to talk is email.
            </p>
          )}
          {proof.length > 0 && (
            <p className="dc-answer-proof">
              <span>On record:</span>
              {proof.map((p) =>
                p.href ? (
                  <a key={p.label} href={p.href} {...ext(p.href)}>
                    {p.label} ↗
                  </a>
                ) : (
                  <em key={p.label}>{p.label}</em>
                ),
              )}
            </p>
          )}
          {q.profile === 'availability' && (
            <a href={mailto('Opportunity')} className="dc-btn dc-btn--gold">
              <Mail aria-hidden="true" /> {links.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- CREW (skills as a call sheet) */
function Crew() {
  return (
    <section className="hs dc-sec" id="crew" aria-labelledby="dc-crew">
      <Slate id="dc-crew" scene="05 · Reel four: skills & evidence" title={<>Crew &amp; <em>equipment.</em></>} note="Every department gets a ticket. Underlined names have been used in real work; the stub says where." aside="admit one" />
      <ul className="dc-tickets">
        {toolkitCards.map((c, n) => {
          const skills = c.groups.flatMap((k) => skillGroups.find((g) => g.key === k)?.skills ?? []);
          const proof = uniq(skills.flatMap((s) => s.evidence ?? []).map(evidenceFor)).slice(0, 2);
          return (
            <li key={c.title} className={`dc-ticket dc-ticket--${n % 4}`}>
              <div className="dc-ticket-main">
                <p className="dc-ticket-top">
                  <span>Dept. {String(n + 1).padStart(2, '0')}</span>
                  <span>Row {String.fromCharCode(65 + n)} · Seat {n + 3}</span>
                </p>
                <h3>{c.title}</h3>
                <p className="dc-ticket-skills">
                  {skills.slice(0, 5).map((s) => (
                    <span key={s.name} className={s.evidence?.length ? 'is-lit' : ''}>
                      {s.name}
                    </span>
                  ))}
                </p>
              </div>
              <div className="dc-ticket-stub">
                <span className="dc-ticket-admit">Admit one</span>
                <span className="dc-ticket-on">{proof.length ? `on set: ${proof.map((p) => p.label).join(', ')}` : 'in rehearsal'}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- DIRECTOR'S NOTES */
function DirectorsNotes() {
  return (
    <section className="hs dc-sec" id="notes" aria-labelledby="dc-dir">
      <Slate id="dc-dir" scene="06 · Reel five: how I think" title={<>Director’s <em>notes.</em></>} note="How I think, written the only way a director would." aside="final draft" />
      <ol className="dc-script">
        {howIThink.map((t, n) => (
          <li key={t.label} style={{ ['--r' as string]: `${[-1, 0.7, -0.5, 0.9][n % 4]}deg` }}>
            <span className="dc-brads" aria-hidden="true" />
            <p className="dc-script-page">{n + 1}.</p>
            <p className="dc-script-slug">INT. {t.label.toUpperCase()} — DAY</p>
            <p className="dc-script-char">SRIHARI (V.O.)</p>
            <p className="dc-script-paren">(on {t.label.toLowerCase()})</p>
            <p className="dc-script-line">{t.text}</p>
          </li>
        ))}
      </ol>
      {beliefs.length > 0 && (
        <ul className="dc-beliefs">
          {beliefs.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- STILLS */
const stills = [
  { key: 'cricket', art: <CricketPanel />, title: 'Cricket', sub: 'The fandom that turned into a data puzzle — and into CricField.', link: { label: 'CricField', href: '/work/cricfield' } },
  { key: 'cinema', art: <CinemaPanel />, title: 'Cinema', sub: 'A film diary and a running curiosity about why we love stories.', link: { label: 'Enter the cinema', href: '/cinema' } },
  { key: 'music', art: <MusicPanel />, title: 'Music', sub: 'Original songs, Telugu lyrics and an independent music journey.', link: { label: 'Sahitya Rachanalu', href: links.sahitya } },
];

function Stills() {
  return (
    <section className="hs dc-sec" id="stills" aria-labelledby="dc-stills">
      <Slate id="dc-stills" scene="07 · Reel six: things I love" title={<>Off-<em>screen.</em></>} note="The worlds that inspire what I build." />
      <ul className="dc-stills">
        {stills.map((s) => (
          <li key={s.key}>
            <a href={s.link.href} className="dc-still" {...ext(s.link.href)}>
              <span className="dc-still-img">
                {s.art}
                <span className="dc-still-sub">{s.sub}</span>
              </span>
              <span className="dc-still-cap">
                <strong>{s.title}</strong>
                <em>{s.link.label} ↗</em>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- END CREDITS + POST-CREDITS */
function EndCredits() {
  const elsewhere = [
    { label: 'Email', href: mailto() },
    { label: 'LinkedIn', href: links.linkedin },
    { label: 'GitHub', href: links.github },
    { label: 'CricField', href: links.cricfield },
    { label: 'Sahitya Rachanalu', href: links.sahitya },
    { label: 'Kalakshetra', href: links.kalakshetra },
    { label: 'Songs & credits', href: links.linktree },
    { label: 'Selected work', href: '/work' },
  ].filter((l) => l.href);
  const credits: [string, string][] = [
    ['Written & directed by', profile.name],
    ['Produced at', profile.school],
    ...experience.filter((e) => e.kind !== 'next').map((e) => [e.title, orgOf(e)] as [string, string]),
    ['Filmed on location', 'Visakhapatnam · Bhubaneswar'],
    ['Soundtrack', 'Sahitya Rachanalu'],
    ['Special thanks', 'Cricket, cinema & good music'],
  ];
  return (
    <section className="hs dc-sec dc-end" id="credits" aria-labelledby="dc-end">
      <Slate id="dc-end" scene="08 · Roll credits" title={<>End <em>credits.</em></>} note="Everyone and everywhere that made this film — and where to find me after it." />
      <div className="dc-cinema">
        <span className="dc-curtain dc-curtain--l" aria-hidden="true" />
        <span className="dc-curtain dc-curtain--r" aria-hidden="true" />
        <span className="dc-valance" aria-hidden="true" />
      <div className="dc-roll" aria-hidden="true">
        <div className="dc-roll-in">
          {[...credits, ...credits].map(([k, v], i) => (
            <p key={i}>
              <span>{k}</span>
              <strong>{v}</strong>
            </p>
          ))}
        </div>
      </div>
        <span className="dc-seats" aria-hidden="true" />
      </div>
      <ul className="dc-elsewhere" aria-label="Find me elsewhere">
        {elsewhere.map((l) => (
          <li key={l.label}>
            <a href={l.href} {...ext(l.href)}>
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutPage() {
  return (
    <PageShell className="dc">
      <ColdOpen />
      <Starring />
      <Scenes />
      <Pitch />
      <Junket />
      <Crew />
      <DirectorsNotes />
      <Stills />
      <EndCredits />
    </PageShell>
  );
}
