import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Journey } from '@/components/home/sections/Journey';
import { Toolkit } from '@/components/home/sections/Toolkit';
import { LifeOutside } from '@/components/home/sections/LifeOutside';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHead } from '@/components/home/sections/SectionHead';
import { links, mailto, profile } from '@/data/profile';
import { began, beliefs, howIThink } from '@/data/about';
import './about.css';

/* Phase 1 About: professional facts first, readable without any journey.
   The illustrated Vizag house and terrace (Phase 3) will wrap these same sections. */

const elsewhere = [
  { label: 'Email', href: mailto() },
  { label: 'LinkedIn', href: links.linkedin },
  { label: 'GitHub', href: links.github },
  { label: 'CricField', href: links.cricfield },
  { label: 'Sahitya Rachanalu', href: links.sahitya },
  { label: 'Kalakshetra', href: links.kalakshetra },
  { label: 'Songs & credits', href: links.linktree },
  { label: 'Letterboxd', href: links.letterboxd },
  { label: 'Spotify', href: links.spotify },
  { label: 'YouTube', href: links.youtube },
  { label: 'Instagram', href: links.instagram },
].filter((l) => l.href);

export function AboutPage() {
  return (
    <PageShell className="ab">
          <section className="ab-hero" aria-labelledby="ab-title">
            <p className="hm-eyebrow">
              <span className="hm-eyebrow-dot" aria-hidden="true" />
              {profile.degree.replace('B.Tech, ', '')} · Class of {profile.graduation}
            </p>
            <h1 id="ab-title" className="ab-title">
              Hi, I’m {profile.shortName}.
            </h1>
            <p className="ab-lede">
              A {profile.identity.toLowerCase()} from {profile.location.split(',')[0]}, studying {profile.degree.replace('B.Tech, ', '')} at {profile.school}.
            </p>
            <ul className="ab-pillars" aria-label="How the pieces fit">
              {profile.pillars.map((p) => (
                <li key={p.label}>
                  <strong>{p.label}</strong> {p.line}
                </li>
              ))}
            </ul>
            <nav className="ab-jump" aria-label="On this page">
              <a href="#journey">Experience</a>
              <a href="#skills">Skills</a>
              <a href="#how-i-think">How I think</a>
              <a href="#elsewhere">Find me elsewhere</a>
            </nav>
          </section>

          <section className="hs" aria-labelledby="ab-began">
            <SectionHead id="ab-began" index="01" kicker="Where it began" title="Vizag, circuits and a lot of cinema." />
            <div className="ab-two">
              <p>
                I’m from {profile.location}, and a final-year {profile.degree} student at {profile.school}, graduating in {profile.graduation}.
              </p>
              {began.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>

          <Journey index="02" headingId="ab-journey" />

          <div id="skills">
            <Toolkit index="03" />
          </div>

          <LifeOutside index="04" />

          <section className="hs" id="how-i-think" aria-labelledby="ab-think">
            <SectionHead id="ab-think" index="05" kicker="How I think" title="Engineer first. Then the questions." />
            <ol className="ab-think">
              {howIThink.map((t) => (
                <li key={t.label}>
                  <span>{t.label}</span>
                  {t.text}
                </li>
              ))}
            </ol>
            {beliefs.length > 0 ? (
              <ul className="ab-beliefs">
                {beliefs.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="ab-note">Things I believe in — coming soon, in my own words.</p>
            )}
          </section>

          <section className="hs" id="elsewhere" aria-labelledby="ab-else">
            <SectionHead id="ab-else" index="06" kicker="Find me elsewhere" title="Links that actually go somewhere." />
            <ul className="ab-links">
              {elsewhere.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {l.label} <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
                  </a>
                </li>
              ))}
              <li>
                <Link href="/#selected-work">
                  Selected work <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
                </Link>
              </li>
            </ul>
          </section>
    </PageShell>
  );
}
