'use client';

/* The ride that opens the portfolio, on every load and refresh of the homepage: the departure board
   (LoadingScreen), the dive into a coach window, then the cabin (RideCabin), where scrolling rides
   past every stop. Stepping off, or skipping, reveals the homepage underneath.
   Coming back from a stop ("Return to train", or the browser's Back) skips the board and puts the
   visitor in the same seat, at the same stop. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { CABIN, stops } from '@/data/ride';
import { hasBooted, peekReturning, readJourney, saveJourney, takeReturning } from './journey';
import { LoadingScreen, type LoadingHandle } from './LoadingScreen';
import { RideCabin } from './RideCabin';
import '@fontsource/vt323/400.css';
import './ride.css';

type Phase = 'idle' | 'loading' | 'diving' | 'cabin' | 'leaving' | 'gone';
type Start = { phase: Phase; entry: 'intro' | 'return' | 'resume'; at: number };

/** how this mount begins. A fresh load or a refresh is always the full intro (and matches the server
    render); arriving here from inside the site picks the journey up where it was left. */
function decideStart(): Start {
  if (typeof window === 'undefined' || !hasBooted()) return { phase: 'idle', entry: 'intro', at: 0 };
  const ret = peekReturning();
  if (ret) return { phase: 'cabin', entry: 'return', at: stops.findIndex((s) => s.key === ret) };
  const j = readJourney();
  if (j?.mode === 'riding') return { phase: 'cabin', entry: 'resume', at: Math.min(stops.length - 1, Math.max(0, j.progress)) };
  if (j?.mode === 'off') return { phase: 'gone', entry: 'intro', at: 0 };
  return { phase: 'idle', entry: 'intro', at: 0 };
}
const MIN_LOAD_MS = 3400;

function preload(srcs: string[], onEach: (done: number) => void) {
  let done = 0;
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((res) => {
          const im = new Image();
          im.onload = im.onerror = () => {
            onEach(++done);
            res();
          };
          im.src = src;
        }),
    ),
  );
}

export function TrainRide() {
  const reduce = !!useReducedMotion();
  const [begin] = useState(decideStart);
  const [phase, setPhase] = useState<Phase>(begin.phase);
  const [progress, setProgress] = useState(0);
  const [cabinIn, setCabinIn] = useState(begin.phase === 'cabin');
  useEffect(() => {
    if (begin.entry === 'return') takeReturning();
  }, [begin.entry]);
  const loadRef = useRef<LoadingHandle>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // the homepage underneath must not scroll, or take keyboard focus, while the ride is on
  useEffect(() => {
    const on = phase !== 'gone';
    document.documentElement.classList.toggle('ride-on', on);
    const behind = on && rootRef.current?.parentElement ? Array.from(rootRef.current.parentElement.children).filter((el) => el !== rootRef.current) : [];
    behind.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      document.documentElement.classList.remove('ride-on');
      behind.forEach((el) => el.removeAttribute('inert'));
    };
  }, [phase]);

  const finish = useCallback(() => {
    saveJourney({ mode: 'off' });
    setPhase('leaving');
    window.setTimeout(
      () => {
        setPhase('gone');
        window.scrollTo(0, 0);
      },
      reduce ? 50 : 650,
    );
  }, [reduce]);

  const dive = useCallback(() => {
    setPhase('diving');
    const board = boardRef.current;
    const scene = board?.querySelector<HTMLElement>('.rl-scene');
    const target = loadRef.current?.diveTarget();
    if (reduce || !board || !scene || !target) {
      setCabinIn(true);
      setPhase('cabin');
      return;
    }
    const box = scene.getBoundingClientRect();
    const ox = target.left + target.width / 2 - box.left;
    const oy = target.top + target.height / 2 - box.top;
    const scale = (Math.max(window.innerWidth / target.width, window.innerHeight / target.height) * 1.25);
    gsap.set(scene, { transformOrigin: `${ox}px ${oy}px` });
    const tl = gsap.timeline();
    tl.to(board.querySelectorAll('.rl-ui, .rl-stations, .rl-bar, .rl-skip'), { opacity: 0, y: 12, duration: 0.45, ease: 'power2.in' }, 0)
      // the camera dives at the coach, faster and faster, until its window is all there is
      .to(scene, { scale, duration: 1.35, ease: 'expo.in' }, 0.1)
      .add(() => setCabinIn(true), 1.15)
      .to(board, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 1.3)
      .add(() => setPhase('cabin'), 1.66);
  }, [reduce]);

  const start = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('loading');
    const srcs = [CABIN.src, '/projects/cricfield.jpg', '/projects/hiremap.jpg', '/projects/cinephile.jpg'];
    let loaded = 0;
    const all = preload(srcs, (d) => (loaded = d / srcs.length));
    let ready = false;
    void all.then(() => (ready = true));
    const t0 = performance.now();
    const min = reduce ? 700 : MIN_LOAD_MS;
    let raf = 0;
    // the count runs on a clock, but it never reaches 100 before the pictures have actually arrived
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / min);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const cap = ready ? 100 : 55 + loaded * 40;
      const p = Math.min(eased * 100, cap);
      setProgress(p);
      if (p >= 100) {
        window.setTimeout(dive, reduce ? 0 : 350);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dive, phase, reduce]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && phase !== 'gone' && phase !== 'leaving' && finish();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [finish, phase]);

  if (phase === 'gone') return null;
  const boardOn = phase === 'idle' || phase === 'loading' || phase === 'diving';

  return (
    <div ref={rootRef} className={`ride ${phase === 'leaving' ? 'is-leaving' : ''}`} role="region" aria-label="Portfolio intro: a train ride">
      {cabinIn && <RideCabin reduce={reduce} entry={begin.entry} startAt={begin.at} onExit={finish} />}
      {boardOn && (
        <div ref={boardRef} className="ride-board">
          <LoadingScreen ref={loadRef} phase={phase as 'idle' | 'loading' | 'diving'} progress={progress} onStart={start} onSkip={finish} />
        </div>
      )}
    </div>
  );
}
