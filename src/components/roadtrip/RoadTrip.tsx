'use client';

import '@fontsource-variable/anek-latin/index.css';
import '@fontsource/mukta/400.css';
import '@fontsource/mukta/500.css';
import '@fontsource/mukta/600.css';
import '@fontsource/mukta/700.css';
import './roadtrip.css';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowDown, ArrowRight, FileText, Menu, Radio, X } from 'lucide-react';
import { contact, intro, radio } from '@/data/roadtrip';
import { BikeAndCar } from './BikeAndCar';
import { RoadsideBillboard } from './Billboard';
import { ConversationalUI } from './ConversationalUI';
import { CreativeDetour } from './CreativeDetour';
import { ContactPanel, DestinationTalk, FinalDestination } from './FinalDestination';
import { Milestone, kmLabel } from './Milestone';
import { MissionProgress } from './MissionProgress';
import { RoadScene } from './RoadScene';
import { BuildsStop, MergeStop } from './Stops';
import { SunsetRoad, type RoadModel } from './SunsetRoad';
import { TripProvider, useTrip } from './TripContext';

const START_KM = intro.km;

/* ---------------- math ---------------- */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
};

/* Ground colour under the road, by kilometre: golden hour → burnt coral → twilight → evening. */
const GROUND = { gold: '#F6CFA0', coral: '#EF9F84', twilight: '#4B3141', night: '#2D191B' };

function useActiveKm() {
  const [km, setKm] = useState(START_KM);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.55;
      let current = START_KM;
      document.querySelectorAll<HTMLElement>('[data-km]').forEach((el) => {
        if (el.getBoundingClientRect().top < line) current = Number(el.dataset.km);
      });
      setKm(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return km;
}

/* ---------------- optional radio (never autoplays) ---------------- */
function RadioButton() {
  const [open, setOpen] = useState(false);
  if (!radio.spotifyEmbed) return null;
  return (
    <div className="rt-radio">
      <button type="button" className="rt-iconbtn" aria-expanded={open} onClick={() => setOpen((o) => !o)} aria-label={radio.label}>
        {open ? <X aria-hidden="true" /> : <Radio aria-hidden="true" />}
      </button>
      {open && (
        <div className="rt-radio-pop">
          <p className="rt-kicker">{radio.label}</p>
          <iframe title={radio.label} src={radio.spotifyEmbed} width="100%" height="152" loading="lazy" allow="encrypted-media" />
        </div>
      )}
    </div>
  );
}

/* ---------------- header: the way out is always visible ---------------- */
const PRIMARY_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Lab', href: '/lab' },
  { label: 'Cinema', href: '/cinema' },
  { label: 'About', href: '/about' },
] as const;

function Header({ km }: { km: number }) {
  const { setContactOpen } = useTrip();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  return (
    <header className="rt-header">
      <Link href="/" className="rt-brand" aria-label="srihari — back to home" onClick={() => setMobileMenuOpen(false)}>
        <Milestone km={km} size="mini" />
        <span>
          <strong>
            srihari<span className="rt-dot">.</span> <span className="rt-brand-sub">/ work</span>
          </strong>
          <small aria-live="polite">{km === 0 ? 'You’ve arrived' : `${kmLabel(km)} km to hired`}</small>
        </span>
      </Link>

      {/* Primary site navigation */}
      <nav className="rt-header-nav rt-primary-nav rt-hide-sm" aria-label="Site navigation">
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`rt-navlink ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="rt-navlink-prefix" aria-hidden="true">/ </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Secondary actions */}
      <nav className="rt-header-nav rt-secondary-nav" aria-label="Work shortcuts">
        <a href="#builds" className="rt-navlink rt-action-projects rt-hide-sm">
          Projects
        </a>
        <a href="#arrival" className="rt-skipride rt-hide-xs">
          Skip ride
        </a>
        <a href={contact.resume} target="_blank" rel="noopener noreferrer" className="rt-navlink rt-hide-sm" aria-label="Résumé (opens in a new tab)">
          <FileText aria-hidden="true" />
          <span>Résumé</span>
        </a>
        <RadioButton />
        <button type="button" className="rt-btn rt-btn--lime rt-btn--sm rt-hide-xs" onClick={() => setContactOpen(true)}>
          Say hi
        </button>

        {/* Compact mobile menu toggle */}
        <button
          type="button"
          className="rt-menu-toggle rt-show-sm"
          aria-expanded={mobileMenuOpen}
          aria-controls="rt-mobile-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div id="rt-mobile-menu" className="rt-mobile-nav" role="dialog" aria-modal="true" aria-label="Site and work navigation">
          <div className="rt-mobile-nav-inner">
            <div className="rt-mobile-nav-section">
              <span className="rt-mobile-nav-heading">Navigation</span>
              <ul className="rt-mobile-nav-list">
                {PRIMARY_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={`rt-mobile-nav-link ${isActive ? 'is-active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span aria-hidden="true">/ </span>{item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rt-mobile-nav-section">
              <span className="rt-mobile-nav-heading">Work shortcuts</span>
              <ul className="rt-mobile-nav-list">
                <li>
                  <a href="#builds" className="rt-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Jump to Projects (3 KM)
                  </a>
                </li>
                <li>
                  <a href="#arrival" className="rt-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Skip ride (Destination)
                  </a>
                </li>
                <li>
                  <a
                    href={contact.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rt-mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText aria-hidden="true" /> Résumé (PDF)
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className="rt-btn rt-btn--lime rt-btn--sm"
                    style={{ width: '100%', marginTop: '6px' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setContactOpen(true);
                    }}
                  >
                    Say hi / Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- hero: 4 km, mission start ---------------- */
function Hero({ heroRef, parts }: { heroRef: RefObject<HTMLElement>; parts: RefObject<Record<string, HTMLElement | null>> }) {
  const { discover } = useTrip();
  const set = (k: string) => (el: HTMLElement | null) => {
    if (parts.current) parts.current[k] = el;
  };
  return (
    <section className="rt-hero" ref={heroRef} data-km={START_KM} aria-labelledby="rt-hero-title">
      <div className="rt-stage">
        <div className="rt-aerial" ref={set('aerial')} aria-hidden="true">
          <div className="rt-fields" ref={set('fields')}>
            <i className="rt-tree" style={{ left: '63%', top: '16%' }} />
            <i className="rt-tree rt-tree--lg" style={{ left: '76%', top: '50%' }} />
            <i className="rt-tree" style={{ left: '28%', top: '68%' }} />
            <i className="rt-tree rt-tree--sm" style={{ left: '86%', top: '80%' }} />
            <i className="rt-tree rt-tree--sm" style={{ left: '20%', top: '28%' }} />
            <i className="rt-tree rt-tree--lg" style={{ left: '12%', top: '84%' }} />
          </div>
          <div className="rt-aerial-road" ref={set('road')}>
            <div className="rt-aerial-dash" ref={set('dash')} />
          </div>
        </div>
        <div className="rt-persp" ref={set('persp')}>
          <RoadScene />
        </div>
        <div className="rt-hero-inner" ref={set('copy')}>
          <div className="rt-hero-copy">
            <p className="rt-hero-eyebrow">srihari. / work · Mission 1 of 5</p>
            <h1 id="rt-hero-title" className="rt-h1">
              <span>{intro.title}</span>
              <span className="rt-h1-light">{intro.subtitle}</span>
            </h1>
            <div className="rt-convo-slot rt-convo-slot--hero">
              <ConversationalUI id="start" auto label="Srihari and the bike, at the start line" className="rt-convo--hero" />
            </div>
            <div className="rt-actions">
              <a href="#builds" className="rt-btn rt-btn--lime" onClick={() => discover('start')}>
                {intro.cta} <ArrowDown aria-hidden="true" />
              </a>
              <a href="#arrival" className="rt-skip">
                In a hurry? Skip ride <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <RoadsideBillboard big={intro.billboard} tone="lime" className="rt-hero-bb" />
          <Milestone km={START_KM} size="hero" interactive className="rt-hero-ms" />
        </div>
        <p className="rt-scroll-hint" ref={set('hint')} aria-hidden="true">
          Scroll to ride <ArrowDown />
        </p>
      </div>
    </section>
  );
}

/* ---------------- the trip: one eased scroll engine drives camera, sky, vehicles and minimap ---------------- */
type HeroOut = { roadX: number; bikeOpacity: number; p: number };

function Trip() {
  const km = useActiveKm();
  const rootRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const tripRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const bikeRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SVGGElement>(null);
  const arrowRef = useRef<SVGGElement>(null);
  const parts = useRef<Record<string, HTMLElement | null>>({});
  const model = useRef<RoadModel | null>(null);
  const [modelState, setModelState] = useState<RoadModel | null>(null);
  const kick = useRef<() => void>(() => {});

  const onModel = useCallback((m: RoadModel) => {
    model.current = m;
    setModelState(m);
    kick.current();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let sy = window.scrollY;
    let raf = 0;
    const hero: HeroOut = { roadX: window.innerWidth / 2, bikeOpacity: 0, p: 0 };

    const updateHero = (y: number, vh: number, vw: number) => {
      const h = heroRef.current;
      const P = parts.current;
      const j = journeyRef.current;
      const m = model.current;
      if (!h || !j) return;
      const p = reduce ? 1 : clamp((y - h.offsetTop) / Math.max(1, h.offsetHeight - vh));
      hero.p = p;
      if (reduce) {
        hero.bikeOpacity = 0;
        return;
      }
      const small = vw < 700;
      const copyOut = ease(seg(p, 0, 0.24));
      if (P.copy) {
        P.copy.style.opacity = String(1 - copyOut);
        P.copy.style.transform = `translate3d(0, ${-70 * copyOut}px, 0)`;
        P.copy.style.visibility = copyOut >= 1 ? 'hidden' : 'visible';
      }
      if (P.hint) P.hint.style.opacity = String(1 - seg(p, 0.02, 0.1));
      if (P.persp) {
        P.persp.style.opacity = String(1 - ease(seg(p, 0.12, 0.34)));
        // lightweight camera push-in while the copy leaves
        P.persp.style.transform = `scale(${1 + 0.08 * ease(seg(p, 0, 0.34))})`;
      }
      const tilt = ease(seg(p, 0.12, 0.58));
      if (P.aerial) {
        P.aerial.style.opacity = String(ease(seg(p, 0.1, 0.3)));
        P.aerial.style.transform = `perspective(900px) rotateX(${lerp(64, 0, tilt)}deg) scale(${lerp(1.6, 1, tilt)})`;
      }
      const jr = j.getBoundingClientRect();
      const targetX = jr.left + (m ? m.startX : jr.width / 2);
      const targetW = m ? m.roadW + (small ? 8 : 14) : 98;
      const base = small ? 120 : 190;
      const slide = ease(seg(p, 0.5, 0.92));
      const x = lerp(vw / 2, targetX, slide);
      const w = lerp(base, targetW, slide);
      if (P.road) {
        P.road.style.width = `${w}px`;
        P.road.style.transform = `translate3d(${x - w / 2}px,0,0)`;
      }
      if (P.dash) P.dash.style.transform = `translate3d(0, ${-((y * 0.9) % 60)}px, 0)`;
      if (P.fields) P.fields.style.opacity = String(1 - seg(p, 0.72, 1));
      hero.roadX = x;
      hero.bikeOpacity = ease(seg(p, 0.3, 0.46));
      rootRef.current?.classList.toggle('is-past-hero', p >= 1);
    };

    // ground colour: golden → coral → twilight → night, blended in the gaps between stops
    const updateSky = (y: number, vh: number) => {
      const sky = skyRef.current;
      if (!sky) return;
      const top = (id: string) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + y : 0;
      };
      const b = top('build-cinephile');
      const pl = top('product-lab');
      const cr = top('creative');
      const de = top('destination');
      const stops: [number, string][] = [
        [b + 200, GROUND.gold],
        [pl + 60, GROUND.coral],
        [cr - 240, GROUND.coral],
        [cr + 120, GROUND.twilight],
        [de - 160, GROUND.twilight],
        [de + 160, GROUND.night],
      ];
      const line = y + vh * 0.5;
      let c = stops[0][1];
      if (line >= stops[stops.length - 1][0]) c = stops[stops.length - 1][1];
      else
        for (let i = 0; i < stops.length - 1; i++) {
          const [y0, c0] = stops[i];
          const [y1, c1] = stops[i + 1];
          if (line >= y0 && line < y1) {
            c = mix(c0, c1, ease(seg(line, y0, y1)));
            break;
          }
        }
      sky.style.backgroundColor = c;
      if (glowRef.current) glowRef.current.style.opacity = String(1 - seg(line, pl, cr + 200));
    };

    const place = (el: HTMLDivElement | null, x: number, y: number, a: number, o: number, side: string, bounce = 0) => {
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.style.opacity = String(o);
      el.dataset.side = side;
      const body = el.firstElementChild as HTMLElement | null;
      if (body) {
        body.style.transform = bounce !== 0 ? `rotate(${a}deg) scale(${1 + bounce * 0.14}) translate3d(0, ${-bounce * 9}px, 0)` : `rotate(${a}deg)`;
      }
    };

    const updateVehicles = (y: number, vh: number) => {
      const trip = tripRef.current;
      const j = journeyRef.current;
      const m = model.current;
      if (!trip || !j || !m) return;
      const lineY = y + vh * 0.62 - trip.offsetTop;
      const jTop = j.offsetTop;
      const jLeft = j.offsetLeft;
      const jy = lineY - jTop;
      const sideOf = (x: number) => (x < m.width / 2 ? 'left' : 'right');
      const merge = m.merge;
      const outer = merge && merge.wait.x > m.width / 2 ? 1 : -1;
      const jyc = Math.min(jy, m.endY);
      // after the merge the bike keeps to the inner lane, the car rides alongside in the outer lane
      const laneT = merge ? ease(seg(jyc, merge.joinY - 120, merge.joinY + 40)) : 0;
      rootRef.current?.classList.toggle('is-merged', jy >= 0 && laneT > 0.5);

      // calculate suspension bounce when near any speed breaker (within +/- 32px)
      let bikeBounce = 0;
      if (!reduce && m.speedBreakers && m.speedBreakers.length > 0) {
        for (const sb of m.speedBreakers) {
          const dist = Math.abs(jyc - sb.y);
          if (dist < 34) {
            // bell curve bounce: 0 -> 1 -> 0
            const factor = Math.cos((dist / 34) * (Math.PI / 2));
            bikeBounce = Math.max(bikeBounce, factor);
          }
        }
      }

      // minimap follows the bike along the real road
      const my = Math.max(0, jyc);
      const mp = m.sample(my);
      if (mapRef.current) mapRef.current.setAttribute('transform', `scale(0.06) translate(${-mp.x} ${-my})`);
      if (arrowRef.current) arrowRef.current.setAttribute('transform', `rotate(${180 + mp.a})`);

      // Bike
      if (jy < 0) {
        place(bikeRef.current, hero.roadX - trip.getBoundingClientRect().left, lineY, 0, hero.bikeOpacity, 'left');
      } else {
        const pt = m.sample(jyc);
        const bx = pt.x - outer * m.lane * laneT;
        place(bikeRef.current, jLeft + bx, jTop + pt.y, pt.a, 1, sideOf(pt.x), bikeBounce);
      }

      // Car: waits on the connecting road, then pulls in beside the bike (never ahead of it)
      if (merge) {
        const { wait, joinY } = merge;
        const t = ease(seg(jyc, joinY - 170, joinY + 30));
        if (t <= 0) {
          place(carRef.current, jLeft + wait.x, jTop + wait.y, wait.a, 1, sideOf(wait.x));
        } else {
          const pt = m.sample(Math.max(jyc, joinY));
          const tx = pt.x + outer * m.lane;
          place(carRef.current, jLeft + lerp(wait.x, tx, t), jTop + lerp(wait.y, pt.y, t), lerp(wait.a, pt.a, t), 1, sideOf(pt.x));
        }
      }
    };

    const tick = () => {
      raf = 0;
      const target = window.scrollY;
      const diff = target - sy;
      
      // Check if approaching any speed-breaker in the journey to naturally ease movement
      let easeFactor = 0.12;
      const trip = tripRef.current;
      const j = journeyRef.current;
      const m = model.current;
      if (!reduce && trip && j && m && m.speedBreakers) {
        const vh = window.innerHeight;
        const lineY = target + vh * 0.62 - trip.offsetTop;
        const jy = lineY - j.offsetTop;
        for (const sb of m.speedBreakers) {
          const dist = Math.abs(jy - sb.y);
          if (dist < 180) {
            // Smoothly reduce response factor to give a feeling of slowing down over the hump
            const slow = 1 - (1 - dist / 180) * 0.55;
            easeFactor = Math.min(easeFactor, 0.12 * slow);
          }
        }
      }

      sy = reduce || Math.abs(diff) < 0.4 ? target : sy + diff * easeFactor;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      updateHero(sy, vh, vw);
      updateSky(sy, vh);
      updateVehicles(sy, vh);
      rootRef.current?.classList.toggle('is-moving', Math.abs(diff) > 1.5);
      if (sy !== target) raf = requestAnimationFrame(tick);
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kick.current = go;
    go();
    window.addEventListener('scroll', go, { passive: true });
    window.addEventListener('resize', go);
    return () => {
      window.removeEventListener('scroll', go);
      window.removeEventListener('resize', go);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="rt" ref={rootRef}>
      <div className="rt-sky" ref={skyRef} aria-hidden="true">
        <div className="rt-sky-glow" ref={glowRef} />
      </div>
      <a href="#builds" className="rt-skiplink">
        Skip to the projects
      </a>
      <Header km={km} />
      <main className="rt-trip" ref={tripRef}>
        <Hero heroRef={heroRef} parts={parts} />
        <div className="rt-journey" ref={journeyRef}>
          <SunsetRoad journeyRef={journeyRef} onModel={onModel} />
          <BuildsStop />
          <MergeStop />
          <CreativeDetour />
          <DestinationTalk />
          <FinalDestination />
        </div>
        <BikeAndCar bikeRef={bikeRef} carRef={carRef} />
      </main>
      <MissionProgress km={km} model={modelState} mapRef={mapRef} arrowRef={arrowRef} />
      <ContactPanel />
      <footer className="rt-footer">
        <p>Made by Srihari. Built by the bike, questioned by the car.</p>
        <Link href="/">Back to the homepage</Link>
      </footer>
    </div>
  );
}

export function RoadTrip() {
  return (
    <TripProvider>
      <Trip />
    </TripProvider>
  );
}
