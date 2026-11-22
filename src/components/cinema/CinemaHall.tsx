'use client';

import '@/components/home/home.css';
import '@/components/tfi/tfi.css';
import './cinema.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Clapperboard, Film } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SiteHeader } from '@/components/home/SiteHeader';
import { useNowPlaying, useTvFeed } from '@/components/tfi/useLive';
import { chats, credits, hall, postCredits, stops, type StopKey, type Who } from '@/data/cinemaHall';
import { BoothRadio, BoothShelf } from './Booth';
import { PosterWall } from './PosterWall';
import { ProjectionScreen } from './ProjectionScreen';
import { H, SceneArt, TOTAL, X } from './SceneArt';
import { TearCalendar } from './TearCalendar';
import { Walker } from './Walker';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const NAV = [
  { label: 'work', href: '/work' },
  { label: 'cinema', href: '/cinema' },
  { label: 'play', href: '/playground' },
  { label: 'write', href: '/writing' },
];
const NAMES: Record<Who, string> = { me: 'Srihari', usher: 'Usher', booth: 'Projectionist' };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const stopAt = (u: number): StopKey | null =>
  u >= X.credits ? 'credits' : u >= X.booth ? 'booth' : u >= X.auditorium ? 'auditorium' : u >= X.corridor ? 'corridor' : u >= X.counter ? 'counter' : null;

/* ---------- one short conversation per stop, revealed like an AI chat ---------- */
function StopChat({ stop, instant }: { stop: StopKey | null; instant: boolean }) {
  const lines = stop ? chats[stop] : [];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!stop) return;
    if (instant) {
      setShown(lines.length);
      return;
    }
    setShown(0);
    let n = 0;
    let t = window.setTimeout(function step() {
      n += 1;
      setShown(n);
      if (n < lines.length) t = window.setTimeout(step, 650 + lines[n].text.length * 12);
    }, 450);
    return () => window.clearTimeout(t);
  }, [stop, instant, lines]);

  if (!stop) return null;
  const visible = lines.slice(0, shown).slice(-2); // older lines collapse
  const typing = shown < lines.length ? lines[shown] : null;
  return (
    <div className="cn-chat" role="log" aria-live="polite" aria-label="Conversation">
      <AnimatePresence initial={false} mode="popLayout">
        {visible.map((l) => (
          <motion.p
            layout
            key={stop + l.text}
            className={`cn-msg cn-msg--${l.who}`}
            initial={instant ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <b>{NAMES[l.who]}</b>
            {l.text}
          </motion.p>
        ))}
        {typing && (
          <motion.p layout key={`${stop}-typing-${shown}`} className={`cn-msg cn-msg--${typing.who} cn-msg--typing`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
            <b>{NAMES[typing.who]}</b>
            <span className="cn-dots">
              <i />
              <i />
              <i />
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * /cinema — Srihari Talkies. One pinned stage; scrolling walks a small me through the hall while the camera
 * pans (GSAP ScrollTrigger), pausing at each stop. Reduced motion: the hall becomes a plain sideways scroll.
 */
export function CinemaHall() {
  const stageRef = useRef<HTMLDivElement>(null);
  const estRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLDivElement>(null);
  const rollRef = useRef<HTMLDivElement>(null);
  const goTo = useRef<(k: StopKey | 'start') => void>(() => {});
  const [ready, setReady] = useState(false);
  const [stop, setStop] = useState<StopKey | null>(null);
  const [isStatic, setStatic] = useState(false);
  const tv = useTvFeed(6);
  const music = useNowPlaying();

  useEffect(() => {
    const stage = stageRef.current!;
    const est = estRef.current!;
    const camera = cameraRef.current!;
    const track = trackRef.current!;
    const scene = sceneRef.current!;
    const walker = walkerRef.current!;
    const roll = rollRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStatic(reduce);
    let ctx: gsap.Context | null = null;
    let current: StopKey | null = null;
    let size = { w: 0, h: 0 };

    const setActive = (k: StopKey | null) => {
      if (k === current) return;
      current = k;
      setStop(k);
      stage.dataset.stop = k ?? 'entrance';
    };

    const build = () => {
      ctx?.revert();
      const vw = window.innerWidth;
      const vh = stage.clientHeight;
      size = { w: vw, h: vh };
      const s = vh / H;
      const vu = vw / s;
      const wide = vu >= 1100;
      const f = wide ? 0.62 : 0.5;
      const maxX = Math.max(0, TOTAL * s - vw);
      const pos = (u: number, fr = f) => clamp(u * s - fr * vw, 0, maxX);
      scene.style.transform = `scale(${s})`;
      track.style.width = `${TOTAL * s}px`;
      stage.style.setProperty('--vu', `${vu}px`);
      const walkerLeft = vw * (wide ? 0.2 : 0.06);
      walker.style.left = `${walkerLeft}px`;
      walker.style.setProperty('--s', String(s));
      stage.style.setProperty('--walker-right', `${walkerLeft + 128 * s}px`);
      const anchorU = (x: number) => (x + f * vw) / s;

      ctx = gsap.context(() => {
        if (reduce) {
          // static: a sideways-scrolling hall, no pinning, no camera moves
          const onScroll = () => setActive(stopAt(anchorU(stage.scrollLeft)));
          stage.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
          goTo.current = (k) => {
            const u = k === 'start' ? 0 : k === 'counter' ? 1700 : k === 'corridor' ? 3330 : k === 'auditorium' ? 5700 : k === 'booth' ? (wide ? 7600 : 7880) : TOTAL;
            stage.scrollTo({ left: k === 'credits' ? maxX : pos(u), behavior: 'auto' });
          };
          return () => stage.removeEventListener('scroll', onScroll);
        }

        const hold = vh * 0.9;
        const keys: { stop: StopKey | null; x: number; hold: number; slow?: number; zoom?: boolean }[] = [
          { stop: null, x: 0, hold: hold * (vu < 1400 ? 0.5 : 0.35) },
          { stop: 'counter', x: pos(1700), hold },
          { stop: 'corridor', x: pos(3330), hold: hold * 0.3 },
          { stop: 'corridor', x: pos(4445), hold: hold * 0.45, slow: 1.5 },
          { stop: 'auditorium', x: pos(5700, wide ? 0.56 : 0.5), hold: hold * 1.1, zoom: true },
          { stop: 'booth', x: pos(wide ? 7600 : 7880), hold },
          { stop: 'credits', x: maxX, hold: hold * 0.9 },
        ];
        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        const holdAt: Partial<Record<StopKey | 'start', number>> = { start: 0 };
        let t = keys[0].hold;
        tl.set(track, { x: 0 }, 0).set(camera, { scale: 1 }, 0).set(roll, { y: 0 }, 0);
        // narrow screens open on a wide establishing shot of the facade, then dolly in as the walk starts
        const z0 = vu < 1400 ? vu / 1450 : 1;
        tl.set(est, { scale: z0, transformOrigin: '0px 50%' }, 0).set(walker, { opacity: z0 < 1 ? 0 : 1 }, 0);
        for (let i = 1; i < keys.length; i++) {
          const k = keys[i];
          const dur = Math.max(80, Math.abs(k.x - keys[i - 1].x) * (k.slow ?? 1));
          tl.to(track, { x: -k.x, duration: dur, ease: k.slow ? 'none' : 'sine.inOut' }, t);
          if (i === 1 && z0 < 1) {
            tl.to(est, { scale: 1, duration: dur, ease: 'sine.inOut' }, t);
            tl.to(walker, { opacity: 1, duration: dur * 0.35 }, t + dur * 0.65);
          }
          if (k.zoom) {
            tl.to(camera, { scale: 1.05, duration: dur * 0.5 + k.hold * 0.4, ease: 'sine.inOut' }, t + dur * 0.5);
            tl.to(camera, { scale: 1, duration: k.hold * 0.45, ease: 'sine.inOut' }, t + dur + k.hold * 0.55);
          }
          if (k.stop === 'credits') tl.fromTo(roll, { y: 0 }, { y: -900, duration: dur + k.hold, ease: 'none' }, t);
          t += dur;
          if (k.stop && holdAt[k.stop] === undefined) holdAt[k.stop] = t;
          tl.to({}, { duration: k.hold }, t);
          t += k.hold;
        }

        camera.style.transformOrigin = `${walkerLeft + 64 * s}px ${930 * s}px`;
        const st = ScrollTrigger.create({
          animation: tl,
          trigger: stage,
          start: 'top top',
          end: `+=${Math.round(t)}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        });

        // walk while the camera moves, stand when it holds; face the way we're going
        let lastX = 0;
        let still = 0;
        const tick = () => {
          const x = -(gsap.getProperty(track, 'x') as number);
          const dx = x - lastX;
          lastX = x;
          if (Math.abs(dx) > 0.25) {
            still = 0;
            walker.classList.add('is-walking');
            walker.classList.toggle('is-back', dx < 0);
          } else if (++still > 6) walker.classList.remove('is-walking');
          setActive(stopAt(anchorU(x)));
        };
        gsap.ticker.add(tick);

        goTo.current = (k) => {
          const at = holdAt[k] ?? 0;
          window.scrollTo({ top: st.start + at + (k === 'start' ? 0 : 2), behavior: 'auto' });
        };
        return () => {
          gsap.ticker.remove(tick);
          walker.classList.remove('is-walking', 'is-back');
        };
      }, stage);
      ScrollTrigger.refresh();
      setReady(true);
    };

    build();
    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        // ignore the mobile URL bar growing/shrinking
        if (window.innerWidth !== size.w || Math.abs(stageRef.current!.clientHeight - size.h) > 120) build();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    // keyboard: tabbing into a stop brings the camera there
    const onFocus = (e: FocusEvent) => {
      const k = (e.target as HTMLElement).closest<HTMLElement>('[data-stop]')?.dataset.stop as StopKey | undefined;
      if (k && k !== current) goTo.current(k);
    };
    track.addEventListener('focusin', onFocus);
    return () => {
      window.removeEventListener('resize', onResize);
      track.removeEventListener('focusin', onFocus);
      ctx?.revert();
    };
  }, []);

  return (
    <div className="cn-page">
      {/* the site header keeps its own wrapper; the stage stays outside it so pinning works */}
      <div className="hm tfi-home cn-hm">
        <div className="hm-page tfi-head">
          <SiteHeader links={NAV} />
        </div>
      </div>
      <h1 className="tfi-sr">
        {hall.name} — Srihari&apos;s cinema side: a release calendar, recent watches, writing about films, and original music.
      </h1>

      <div ref={stageRef} className={`cn-stage${ready ? ' is-ready' : ''}${isStatic ? ' is-static' : ''}`} data-stop="entrance">
        <div ref={estRef} className="cn-camera cn-establish">
        <div ref={cameraRef} className="cn-camera">
          <div ref={trackRef} className="cn-track">
            <div ref={sceneRef} className="cn-scene" style={{ width: TOTAL, height: H }}>
              <SceneArt />

              <div className="cn-hint" style={{ left: 540, top: 880 }}>
                <span>Scroll to walk in</span> <ArrowDown aria-hidden="true" />
              </div>

              <div data-stop="counter">
                <section className="cn-spot" style={{ left: 1520, top: 210, width: 360 }} aria-label="Ticket counter: release calendar">
                  <TearCalendar />
                </section>
              </div>

              <div data-stop="corridor">
                <section aria-label="Poster corridor: recent watches from my Letterboxd diary">
                  <PosterWall feed={tv} />
                </section>
              </div>

              <div data-stop="auditorium">
                <section aria-label="Auditorium: writing about films">
                  <ProjectionScreen feed={tv} />
                </section>
              </div>

              <div data-stop="booth">
                <section aria-label="Projection booth: music and creative work">
                  <BoothRadio feed={music} />
                  <BoothShelf />
                </section>
              </div>

              <div data-stop="credits">
                <div className="cn-roll-window" style={{ left: 8380, top: 120, width: 640, height: 640 }} aria-label="End credits">
                  <div ref={rollRef} className="cn-roll">
                    <p className="cn-the-end">The End</p>
                    {credits.map(([role, name]) => (
                      <p key={role} className="cn-credit">
                        <small>{role}</small>
                        {name}
                      </p>
                    ))}
                  </div>
                </div>
                <section className="cn-postcredit" style={{ left: 9120, top: 220, width: 440 }} aria-label="Post-credit scene">
                  <p className="cn-postcredit-kicker">
                    <Clapperboard aria-hidden="true" /> Post-credit scene
                  </p>
                  <p className="cn-postcredit-line">{postCredits.line}</p>
                  <ul>
                    {postCredits.links.map((l) => (
                      <li key={l.label}>
                        {l.href.startsWith('/') ? (
                          <Link href={l.href}>
                            {l.label} <ArrowRight aria-hidden="true" />
                          </Link>
                        ) : l.href && l.href !== 'https://open.spotify.com/' ? (
                          <a href={l.href} target="_blank" rel="noopener noreferrer">
                            {l.label} <ArrowRight aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="cn-soon">
                            {l.label} · link soon
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div ref={walkerRef} className="cn-walker" aria-hidden="true">
          <Walker />
        </div>
        <StopChat stop={stop} instant={isStatic} />

        <nav className="cn-stops" aria-label="Jump to a stop">
          {stops.map((s) => (
            <button key={s.key} type="button" className={stop === s.key ? 'is-on' : ''} aria-current={stop === s.key ? 'step' : undefined} onClick={() => goTo.current(s.key)}>
              <span className="cn-stops-dot" aria-hidden="true" />
              <span className="cn-stops-label">{s.title}</span>
            </button>
          ))}
        </nav>

        {!ready && (
          <div className="cn-loading" aria-hidden="true">
            <Film /> Tickets, please…
          </div>
        )}
      </div>
    </div>
  );
}
