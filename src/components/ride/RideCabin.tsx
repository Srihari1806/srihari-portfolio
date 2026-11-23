'use client';

/* Inside the train. The cabin picture never changes; outside its window runs one continuous world
   (World.tsx). Scrolling is the only source of truth: it moves the train along the line, slowing into
   each stop. At a stop, the landmark (or its Enter button) is a portal: the camera dives through the
   window and hands over to the real page. "Return to train" on those pages brings you back here. */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { CABIN, cabinSpots, ledBoard, sideWindows, speaker, stops, windowGlass, windowRadius, type Box, type StopKey } from '@/data/ride';
import { restingCam, windowCam, type Cam } from './camera';
import { emitPortal, saveJourney } from './journey';
import { useTrainSound } from './useTrainSound';
import { CAM_MAX, CAM_MIN, SPEED, WIN, World } from './World';

const at = (b: Box): CSSProperties => ({ left: b[0], top: b[1], width: b[2] - b[0], height: b[3] - b[1] });
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const N = stops.length;
/** scroll per leg between stops, in viewport heights */
const LEG = 1.25;
/** how far either side of a stop still counts as being at it (trackpad momentum overshoots) */
const NEAR = 0.24;
/** the train is stood still for this much of each end of a leg */
const DWELL = 0.16;

/** progress (in stops) → camera position on the main layer: eases out of a stop, cruises, eases in */
function cameraX(u: number) {
  const k = Math.min(N - 2, Math.floor(u));
  const f = clamp(u - k, 0, 1);
  const t = clamp((f - DWELL) / (1 - 2 * DWELL), 0, 1);
  const g = 0.5 - Math.cos(Math.PI * t) / 2;
  return stops[k].x + (stops[k + 1].x - stops[k].x) * g - WIN.w / 2;
}

/* the sky over the journey: golden over the sea at Vizag, dusk by the cinema, night at home */
const SKY = [
  { t: 0, top: [110, 92, 140], mid: [233, 138, 92], hor: [251, 196, 126], sea: [[222, 130, 110], [120, 84, 118]] },
  { t: 0.27, top: [94, 76, 128], mid: [226, 119, 90], hor: [246, 168, 108], sea: [[206, 116, 106], [104, 72, 106]] },
  { t: 0.52, top: [64, 58, 110], mid: [182, 95, 110], hor: [233, 140, 104], sea: [[170, 98, 112], [84, 62, 98]] },
  { t: 0.76, top: [42, 43, 85], mid: [111, 74, 114], hor: [192, 106, 98], sea: [[120, 80, 112], [56, 48, 86]] },
  { t: 1, top: [25, 29, 63], mid: [63, 56, 102], hor: [155, 90, 98], sea: [[86, 66, 108], [36, 34, 70]] },
] as const;
const mix = (a: readonly number[], b: readonly number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

type Entry = 'intro' | 'return' | 'resume';

export function RideCabin({ reduce, onExit, entry, startAt }: { reduce: boolean; onExit: () => void; entry: Entry; startAt: number }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const cam = useRef<Cam>({ s: 1, x: 0, y: 0 });
  const busy = useRef(false);
  const [stop, setStop] = useState(Math.round(startAt));
  const [heading, setHeading] = useState<number | null>(null);
  const [card, setCard] = useState(false);
  const [vh, setVh] = useState(0);
  const [portal, setPortal] = useState(false);
  const sound = useTrainSound();

  const apply = useCallback(() => {
    const c = camRef.current;
    if (c) c.style.transform = `translate3d(${cam.current.x}px, ${cam.current.y}px, 0) scale(${cam.current.s})`;
  }, []);
  const leg = () => (rootRef.current?.clientHeight ?? window.innerHeight) * LEG;

  // put the journey where it was left before the first paint (a return, or Back from a stop)
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root) root.scrollTop = startAt * root.clientHeight * LEG;
    setVh(window.innerHeight);
  }, [startAt]);

  // camera: how we arrive in the cabin
  useEffect(() => {
    const vw = window.innerWidth;
    const h = window.innerHeight;
    const rest = restingCam(vw, h);
    setCard(CABIN.h * rest.s < h - 150);
    const world = worldRef.current;
    const tweens: gsap.core.Tween[] = [];
    if (entry === 'intro' && !reduce) {
      // straight out of the loading screen's dive: window first, then the cabin around it
      cam.current = windowCam(vw, h);
      apply();
      tweens.push(gsap.to(cam.current, { ...rest, duration: 1.7, ease: 'power3.inOut', delay: 0.15, onUpdate: apply }));
    } else {
      cam.current = rest;
      apply();
    }
    if (entry === 'return' && world) {
      // back from a page: the window starts close on the landmark, the world settles back into place
      const s = stops[Math.round(startAt)];
      gsap.set(world, { scale: reduce ? 1 : 2.1, transformOrigin: `${s.focus[0]}px ${s.focus[1]}px` });
      requestAnimationFrame(() => emitPortal({ type: 'train-ready' }));
      if (!reduce) tweens.push(gsap.to(world, { scale: 1, duration: 1.35, ease: 'power3.out', delay: 0.15 }));
    }
    if (entry === 'resume' && rootRef.current && !reduce) tweens.push(gsap.from(rootRef.current, { opacity: 0, duration: 0.4 }));
    return () => tweens.forEach((t) => t.kill());
  }, [apply, entry, reduce, startAt]);

  useEffect(() => {
    const onResize = () => {
      if (busy.current) return;
      const h = window.innerHeight;
      setVh(h);
      const rest = restingCam(window.innerWidth, h);
      setCard(CABIN.h * rest.s < h - 150);
      gsap.killTweensOf(cam.current);
      cam.current = rest;
      apply();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [apply]);

  // the journey loop: one number (scroll progress) drives the layers, the sky and the stop
  useEffect(() => {
    const root = rootRef.current;
    const world = worldRef.current;
    if (!root || !world) return;
    const layers = {
      far: world.querySelector<SVGSVGElement>('.rw-far'),
      mid: world.querySelector<SVGSVGElement>('.rw-mid'),
      main: world.querySelector<SVGSVGElement>('.rw-main'),
      near: world.querySelector<SVGSVGElement>('.rw-near'),
    };
    let raf = 0;
    let lastX = NaN;
    let lastT = -1;
    let lastU = -1;
    let vel = 0;
    let dir = 1;
    let shownStop = -2;
    let shownHead = -2;
    let saved = -1;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!root.clientHeight) return; // not laid out yet (or hidden)
      const u = clamp(root.scrollTop / (root.clientHeight * LEG), 0, N - 1);
      const x = cameraX(u);
      const dx = Number.isNaN(lastX) ? 0 : x - lastX;
      vel = vel * 0.8 + dx * 0.2;
      if (u !== lastU && lastU >= 0) dir = u > lastU ? 1 : -1;
      const moving = Math.abs(vel) > 0.05;
      if (x !== lastX) {
        lastX = x;
        (Object.keys(layers) as (keyof typeof layers)[]).forEach((k) => {
          const el = layers[k];
          if (el) el.style.transform = `translate3d(${(-x * SPEED[k]).toFixed(2)}px, 0, 0)`;
        });
      }
      // the sky changes in small steps, so the layers aren't repainted on every frame
      const tq = Math.round(clamp((x - CAM_MIN) / (CAM_MAX - CAM_MIN), 0, 1) * 120) / 120;
      if (tq !== lastT) {
        lastT = tq;
        const t = tq;
        let i = 0;
        while (i < SKY.length - 2 && t > SKY[i + 1].t) i++;
        const a = SKY[i];
        const b = SKY[i + 1];
        const f = clamp((t - a.t) / (b.t - a.t), 0, 1);
        const st = world.style;
        st.setProperty('--rw-top', mix(a.top, b.top, f));
        st.setProperty('--rw-mid', mix(a.mid, b.mid, f));
        st.setProperty('--rw-hor', mix(a.hor, b.hor, f));
        st.setProperty('--rw-sea-top', mix(a.sea[0], b.sea[0], f));
        st.setProperty('--rw-sea-bot', mix(a.sea[1], b.sea[1], f));
        st.setProperty('--rw-night', t.toFixed(3));
        // the cabin's side windows look out on the same sky
        const sides = rootRef.current?.querySelector<HTMLElement>('.rc-sides');
        sides?.style.setProperty('--rw-top', mix(a.top, b.top, f));
        sides?.style.setProperty('--rw-mid', mix(a.mid, b.mid, f));
        sides?.style.setProperty('--rw-hor', mix(a.hor, b.hor, f));
      }
      // speed shows in the poles going by (a little blur) and a sway in the carriage
      if (layers.near) {
        const blur = reduce ? 0 : Math.min(2.4, Math.abs(vel) * 0.09);
        layers.near.style.filter = blur > 0.25 ? `blur(${blur.toFixed(2)}px)` : '';
      }
      if (swayRef.current && !reduce) swayRef.current.style.transform = moving ? `translate3d(0, ${(Math.sin(performance.now() / 95) * Math.min(1.6, Math.abs(vel) * 0.08)).toFixed(2)}px, 0)` : '';
      if (lightRef.current) lightRef.current.style.opacity = reduce ? '0' : String(Math.min(0.5, Math.abs(vel) * 0.03));
      if (lightRef.current && moving) lightRef.current.style.backgroundPositionX = `${(-x * 2.4).toFixed(0)}px`;
      lastU = u;
      // which stop we're at: generous either side, so momentum doesn't carry us past it
      const near = Math.round(u);
      const here = Math.abs(u - near) <= NEAR ? near : -1;
      const head = here >= 0 ? -1 : dir > 0 ? Math.min(N - 1, Math.floor(u) + 1) : Math.floor(u);
      if (here !== shownStop || head !== shownHead) {
        shownStop = here;
        shownHead = head;
        setStop(here);
        setHeading(head >= 0 ? head : null);
        if (here >= 0 && stops[here].href) router.prefetch(stops[here].href);
        if (head >= 0 && stops[head].href) router.prefetch(stops[head].href);
      }
      const r = Math.round(u * 100) / 100;
      if (r !== saved && !busy.current) {
        saved = r;
        saveJourney({ progress: r, mode: 'riding' });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce, router]);

  const goTo = useCallback(
    (i: number) => {
      const root = rootRef.current;
      if (root) root.scrollTo({ top: i * root.clientHeight * LEG, behavior: reduce ? 'auto' : 'smooth' });
    },
    [reduce],
  );
  const goToKey = (k: StopKey) => goTo(stops.findIndex((s) => s.key === k));

  /** through the window: the train settles, the camera moves in, the frame passes the edges of the screen */
  const enter = useCallback(
    (i: number) => {
      const s = stops[i];
      const root = rootRef.current;
      const world = worldRef.current;
      if (!s.href || busy.current || !root || !world) return;
      busy.current = true;
      saveJourney({ progress: i, mode: 'riding' });
      if (reduce) {
        router.push(s.href);
        return;
      }
      setPortal(true);
      const vw = window.innerWidth;
      const h = window.innerHeight;
      const tl = gsap.timeline();
      // settle exactly on the stop first, if momentum left us a little off it
      const target = i * root.clientHeight * LEG;
      if (Math.abs(root.scrollTop - target) > 2) tl.to(root, { scrollTop: target, duration: 0.35, ease: 'power2.out' });
      tl.set(world, { transformOrigin: `${s.focus[0]}px ${s.focus[1]}px` })
        .to(world, { scale: 2.3, duration: 1.15, ease: 'power2.in' }, '>')
        .to(cam.current, { ...windowCam(vw, h, 1.4), duration: 1.15, ease: 'power3.inOut', onUpdate: apply }, '<')
        .add(() => emitPortal({ type: 'enter', cover: s.cover }), '-=0.4');
      // the route change runs on the clock too, so a slow frame rate can't hold the visitor here
      const total = tl.duration() * 1000;
      window.setTimeout(() => emitPortal({ type: 'enter', cover: s.cover }), Math.max(0, total - 380));
      window.setTimeout(() => router.push(s.href), total + 50);
    },
    [apply, reduce, router],
  );

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  const here = stop >= 0 ? stops[stop] : null;
  const next = heading !== null ? stops[heading] : null;
  const board = here ? `${here.name} · ${here.line}` : next ? `Next stop · ${next.name}` : '';

  return (
    <div ref={rootRef} className={`rc ${portal ? 'is-portal' : ''}`} tabIndex={-1} aria-label="Train ride through the portfolio. Scroll to travel between stops.">
      <div className="rc-stage">
        <div ref={swayRef} className="rc-sway">
          <div ref={camRef} className="rc-cam" style={{ width: CABIN.w, height: CABIN.h }}>
            <div className="rc-window" style={{ ...at(windowGlass), borderRadius: windowRadius }}>
              <div ref={worldRef} className="rw" style={{ width: WIN.w, height: WIN.h }}>
                <World />
              </div>
              {here?.href ? (
                <>
                  <button type="button" className="rc-landmark" onClick={() => enter(stop)} aria-label={`${here.cta}: go through the window to the ${here.name} page`} tabIndex={-1} />
                  <button type="button" className="rc-enter" onClick={() => enter(stop)}>
                    <b>{here.name}</b> {here.cta} <span aria-hidden="true">↗</span>
                  </button>
                </>
              ) : null}
            </div>
            <div className="rc-sides" aria-hidden="true">
              {sideWindows.map((b, i) => (
                <i key={i} style={at(b)} />
              ))}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="rc-cabin" src={CABIN.src} alt="Inside a train carriage at sunset: a bench seat, a luggage rack with a bag, camera and headphones, a cricket ball, a film ticket and a lighthouse sketch on the walls" draggable={false} />
            <div ref={lightRef} className="rc-light" aria-hidden="true" />
            <div className="rc-led" style={at(ledBoard)} aria-live="polite">
              <span key={board}>{board}</span>
            </div>
            {cabinSpots.map((s) =>
              s.stop ? (
                <button key={s.key} type="button" className="rc-spot" style={at(s.box)} aria-label={`Ride to ${s.label}`} onClick={() => goToKey(s.stop!)}>
                  <span>{s.label}</span>
                </button>
              ) : s.href?.startsWith('http') ? (
                <a key={s.key} className="rc-spot" style={at(s.box)} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <span>{s.label}</span>
                </a>
              ) : (
                <Link key={s.key} className="rc-spot" style={at(s.box)} href={s.href!} aria-label={s.label}>
                  <span>{s.label}</span>
                </Link>
              ),
            )}
            <button type="button" className={`rc-spot rc-speaker ${sound.on ? 'is-on' : ''}`} style={at(speaker)} aria-pressed={sound.on} aria-label="Train sound" onClick={sound.toggle}>
              <i aria-hidden="true" />
              <span>{sound.on ? 'Sound on' : 'Sound off'}</span>
            </button>
          </div>
        </div>

        {card && (
          <div className="rc-card">
            {here ? (
              <>
                <p>
                  <b>{here.name}</b> {here.line}
                </p>
                {here.href ? (
                  <button type="button" onClick={() => enter(stop)}>
                    {here.cta} ↗
                  </button>
                ) : (
                  <span>Scroll to ride ↓</span>
                )}
              </>
            ) : (
              <p className="rc-card-next">{next ? `Next stop · ${next.name}` : ''}</p>
            )}
          </div>
        )}

        {stop === 0 && !card && <p className="rc-nudge">Scroll to ride ↓</p>}
        <nav className="rc-line" aria-label="Stops">
          {stops.map((s, i) => (
            <button key={s.key} type="button" aria-current={stop === i ? 'step' : undefined} onClick={() => goTo(i)}>
              <i aria-hidden="true" />
              <span>{s.name}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="rl-skip rc-exit" onClick={onExit}>
          Step off ↗
        </button>
      </div>
      {/* the track: scroll room for every leg between stops */}
      {stops.slice(1).map((s) => (
        <div key={s.key} className="rc-leg" style={{ height: vh ? vh * LEG : `${LEG * 100}vh` }} />
      ))}
    </div>
  );
}
