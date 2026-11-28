'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { REBOARD_EVENT } from '@/components/ride/journey';
import { links, mailto, profile, resumeLink } from '@/data/profile';
import { useRole } from '@/context/RoleContext';
import '@fontsource/vt323/400.css';

/* ==========================================================================
   A platform full of personalities. The illustration is one artwork split into
   layers (public/platform): the platform, and the people who move — me (breathing,
   hops when poked), the cricket fan (pumping his fist), the laptop guy (typing).
   Steam, music notes, popcorn, code and birds are drawn live on top.
   Every traveller can be talked to: hover or tap them, like an NPC in a game.
   ========================================================================== */

const W = 1672;
const H = 552;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

type Npc = { key: string; name: string; box: [number, number, number, number]; at: [number, number]; line: string };

const npcs: Npc[] = [
  { key: 'elders', name: 'the couple on the bench', box: [90, 190, 330, 330], at: [210, 175], line: 'Beta, did you eat before boarding?' },
  { key: 'books', name: 'the student with books', box: [330, 110, 115, 330], at: [390, 105], line: 'Exams first. Cinema after.' },
  { key: 'hoodie', name: 'the guy in the hoodie', box: [445, 85, 115, 400], at: [500, 80], line: 'Train late again? Classic.' },
  { key: 'coffee', name: 'the coffee drinker', box: [560, 110, 105, 400], at: [612, 100], line: 'Filter coffee fixes everything.' },
  { key: 'me', name: 'Srihari', box: [700, 20, 185, 510], at: [792, 8], line: 'Hi, I’m Srihari! Where are we headed?' },
  { key: 'guitar', name: 'the guitarist', box: [890, 160, 190, 330], at: [985, 150], line: 'Any requests? Old melodies only.' },
  { key: 'fan', name: 'the cricket fan', box: [1085, 80, 170, 170], at: [1165, 62], line: 'That’s a six! Stats on CricField.' },
  { key: 'family', name: 'the family', box: [1050, 255, 240, 250], at: [1180, 245], line: 'Look, look — the train!' },
  { key: 'popcorn', name: 'the moviegoer', box: [1255, 130, 135, 200], at: [1322, 122], line: 'Interval snacks: sorted.' },
  { key: 'laptop', name: 'the laptop guy', box: [1400, 165, 205, 350], at: [1500, 150], line: 'Pushing to prod from Platform 1.' },
];

const AMBIENT = ['me', 'fan', 'coffee', 'laptop', 'elders', 'guitar', 'family', 'popcorn', 'hoodie', 'books'];

function Layer({ src, x, y, w, h, className, origin }: { src: string; x: number; y: number; w: number; h: number; className: string; origin?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`pf-layer ${className}`}
      style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H), transformOrigin: origin }}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

export function PlatformFooter() {
  const { activeRole } = useRole();
  const reduce = !!useReducedMotion();
  const cv = resumeLink(activeRole);
  const [talking, setTalking] = useState<string | null>(null);
  const [poked, setPoked] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const userTalk = useRef(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  // only animate (and chatter) while the platform is on screen
  useEffect(() => {
    const el = sceneRef.current;
    if (!el || !('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ambient chatter: someone on the platform says something every few seconds
  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    const t = window.setInterval(() => {
      if (Date.now() - userTalk.current < 6000) return; // the visitor is talking to someone
      setTalking(AMBIENT[i++ % AMBIENT.length]);
    }, 3800);
    setTalking('me');
    return () => window.clearInterval(t);
  }, [inView, reduce]);

  // on phones the scene pans; start it on me
  useEffect(() => {
    const w = worldRef.current;
    if (w && w.scrollWidth > w.clientWidth) w.scrollLeft = (w.scrollWidth * 792) / W - w.clientWidth / 2;
  }, []);

  const talk = useCallback((k: string) => {
    userTalk.current = Date.now();
    setTalking(k);
    setPoked(k);
    window.setTimeout(() => setPoked((p) => (p === k ? null : p)), 650);
  }, []);

  const reboard = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new Event(REBOARD_EVENT));
  };

  const speaker = npcs.find((n) => n.key === talking);

  return (
    <section className={`pf${reduce ? ' is-still' : ''}${inView ? ' is-live' : ''}`} aria-labelledby="pf-title">
      <p className="pf-announce" aria-hidden="true">
        <span>
          ★ Attention please: the train to Graduate Opportunities ({profile.graduation}) is expected on Platform 1 · Passengers for Data, Software, Applied AI and Product
          may board now · Please mind the gap between your inbox and mine ★
        </span>
      </p>

      <div className="pf-head">
        <div className="pf-ticket" role="group" aria-labelledby="pf-title">
          <div className="pf-ticket-stub" aria-hidden="true">
            <span>Admit one</span>
            <b>{profile.graduation}</b>
          </div>
          <div className="pf-ticket-main">
            <p className="pf-ticket-kicker">Platform 1 · Next departure</p>
            <h2 id="pf-title" className="pf-ticket-title">
              Where to next?
            </h2>
            <p className="pf-ticket-line">Data · Software · Applied AI · Product & Business</p>
            <ul className="pf-ticket-links">
              <li>
                <a href={mailto()}>Say hello</a>
              </li>
              <li>
                <a href={cv.href} {...(cv.isFile ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {cv.label}
                </a>
              </li>
              {links.linkedin && (
                <li>
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              )}
              <li>
                <a href={links.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
            <p className="pf-ticket-fine">
              {profile.availability} · {links.email}
            </p>
          </div>
        </div>
        <p className="pf-letters" aria-hidden="true">
          SRIHARI.
        </p>
      </div>

      <div className="pf-world" ref={worldRef}>
        <div className="pf-scene2" ref={sceneRef} style={{ backgroundImage: 'url(/platform/platform-base.webp)' }}>
          {/* birds crossing the sky */}
          <svg className="pf-birds" viewBox="0 0 60 20" aria-hidden="true">
            <path d="M2 10q6-6 10 0 4-6 10 0M34 6q5-5 8 0 3-5 8 0" fill="none" stroke="#1c1d1a" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <Layer src="/platform/platform-hero.webp" x={639} y={22} w={264} h={508} className={`pf-me${poked === 'me' ? ' is-poked' : ''}`} origin="50% 100%" />
          <Layer src="/platform/platform-laptop.webp" x={1362} y={168} w={243} h={353} className={`pf-laptop${poked === 'laptop' ? ' is-poked' : ''}`} origin="50% 100%" />
          <Layer src="/platform/platform-fan.webp" x={1214} y={82} w={36} h={68} className="pf-fist" origin="66.7% 85.3%" />

          {/* live effects, positioned on the artwork */}
          <span className="pf-fx pf-steam" style={{ left: pct(658, W), top: pct(118, H) }} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="pf-fx pf-notes" style={{ left: pct(1030, W), top: pct(140, H) }} aria-hidden="true">
            <i>♪</i>
            <i>♫</i>
            <i>♪</i>
          </span>
          <span className="pf-fx pf-pop" style={{ left: pct(1338, W), top: pct(200, H) }} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="pf-fx pf-code" style={{ left: pct(1530, W), top: pct(262, H) }} aria-hidden="true">
            <i>{'{ }'}</i>
            <i>01</i>
            <i>{'</>'}</i>
          </span>
          <span className="pf-fx pf-point" style={{ left: pct(1305, W), top: pct(318, H) }} aria-hidden="true">
            !
          </span>

          {/* everyone can be talked to */}
          {npcs.map((n) => (
            <button
              key={n.key}
              type="button"
              className="pf-npc"
              style={{ left: pct(n.box[0], W), top: pct(n.box[1], H), width: pct(n.box[2], W), height: pct(n.box[3], H) }}
              aria-label={`Talk to ${n.name}`}
              onMouseEnter={() => talk(n.key)}
              onFocus={() => talk(n.key)}
              onClick={() => talk(n.key)}
            />
          ))}

          {speaker && (
            <p key={speaker.key + talking} className={`pf-bubble${speaker.key === 'me' ? ' pf-bubble--me' : ''}`} style={{ left: pct(speaker.at[0], W), top: pct(speaker.at[1], H) }} role="status">
              {speaker.line}
            </p>
          )}
        </div>
      </div>
      <p className="pf-hint" aria-hidden="true">
        psst — hover (or tap) anyone on the platform
      </p>

      <div className="pf-bottom">
        <p className="pf-signoff">Trains may run late. My replies don’t.</p>
        <div className="pf-actions">
          <button type="button" className="pf-btn" onClick={reboard}>
            Board the train again
          </button>
          <a href="#top" className="pf-btn pf-btn--ghost">
            Back to top ↑
          </a>
        </div>
      </div>
    </section>
  );
}
