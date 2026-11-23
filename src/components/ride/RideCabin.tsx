'use client';

/* Inside the train. The cabin picture never changes; what changes is the view through its window.
   Scrolling moves the train between stops: the page you're leaving slides away, a tunnel goes by,
   and the next page pulls into the window. Each stop's window is a door to that page. */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { CABIN, cabinSpots, ledBoard, sideWindows, speaker, stops, windowGlass, windowRadius, type Box, type StopKey } from '@/data/ride';
import { useTrainSound } from './useTrainSound';

const at = (b: Box): CSSProperties => ({ left: b[0], top: b[1], width: b[2] - b[0], height: b[3] - b[1] });
const WIN_CX = (windowGlass[0] + windowGlass[2]) / 2;
const WIN_CY = (windowGlass[1] + windowGlass[3]) / 2;
const WIN_W = windowGlass[2] - windowGlass[0];
const WIN_H = windowGlass[3] - windowGlass[1];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

type Cam = { s: number; x: number; y: number };
/** where the camera rests: phones fit the window to the width, wide screens fill with the cabin */
function restingCam(vw: number, vh: number): Cam {
  const cover = Math.max(vw / CABIN.w, vh / CABIN.h);
  const fitWindow = vw / (WIN_W + 150);
  const s = Math.min(cover, fitWindow);
  const w = CABIN.w * s;
  const h = CABIN.h * s;
  let x = vw / 2 - WIN_CX * s;
  x = w >= vw ? clamp(x, vw - w, 0) : (vw - w) / 2;
  let y: number;
  if (h >= vh) y = clamp(vh / 2 - WIN_CY * s, vh - h, 0);
  else y = Math.max(56, (vh - h) * 0.3);
  return { s, x, y };
}
/** the first frame inside: the window glass fills the screen, as if we came in through it */
function windowCam(vw: number, vh: number): Cam {
  const s = Math.max(vw / WIN_W, vh / WIN_H) * 1.04;
  return { s, x: vw / 2 - WIN_CX * s, y: vh / 2 - WIN_CY * s };
}

export function RideCabin({ reduce, onExit, entering }: { reduce: boolean; onExit: () => void; entering: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const viewRefs = useRef<(HTMLElement | null)[]>([]);
  const tunnelRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const cam = useRef<Cam>({ s: 1, x: 0, y: 0 });
  const [stop, setStop] = useState(0);
  const [heading, setHeading] = useState<number | null>(null);
  const [card, setCard] = useState(false);
  const [vh, setVh] = useState(0);
  const sound = useTrainSound();

  const apply = useCallback(() => {
    const c = camRef.current;
    if (c) c.style.transform = `translate(${cam.current.x}px, ${cam.current.y}px) scale(${cam.current.s})`;
  }, []);

  // camera: start on the window, pull back into the cabin; keep it fitted on resize
  useEffect(() => {
    const vw = window.innerWidth;
    const h = window.innerHeight;
    setVh(h);
    const rest = restingCam(vw, h);
    setCard(CABIN.h * rest.s < h - 150);
    if (entering && !reduce) {
      cam.current = windowCam(vw, h);
      apply();
      const tw = gsap.to(cam.current, { ...rest, duration: 1.7, ease: 'power3.inOut', delay: 0.15, onUpdate: apply });
      return () => void tw.kill();
    }
    cam.current = rest;
    apply();
  }, [apply, entering, reduce]);
  useEffect(() => {
    const onResize = () => {
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

  // the journey: scroll position → which stop, and what the window shows on the way
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let last = -1;
    let lastU = 0;
    let vel = 0;
    let dir = 1;
    let raf = 0;
    const n = stops.length;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const H = root.clientHeight;
      const u = clamp(root.scrollTop / H, 0, n - 1);
      vel = vel * 0.85 + Math.abs(u - lastU) * 0.15;
      if (u !== lastU) dir = u > lastU ? 1 : -1;
      if (u === lastU && vel < 0.0005 && last >= 0) return;
      lastU = u;
      const k = Math.min(n - 2, Math.floor(u));
      const f = u - k;
      // each stop's page: slides out to the left as we leave, in from the right as we arrive
      viewRefs.current.forEach((el, i) => {
        if (!el) return;
        let x = 120;
        let o = 0;
        if (i === k) {
          const t = clamp(f / 0.45, 0, 1);
          x = reduce ? 0 : -110 * easeIn(t);
          o = reduce ? 1 - clamp((f - 0.3) / 0.2, 0, 1) : t >= 1 ? 0 : 1;
        } else if (i === k + 1) {
          const t = clamp((f - 0.55) / 0.45, 0, 1);
          x = reduce ? 0 : 110 * (1 - easeOut(t));
          o = reduce ? clamp((f - 0.5) / 0.2, 0, 1) : t <= 0 ? 0 : 1;
        }
        el.style.transform = `translateX(${x}%)`;
        el.style.opacity = String(o);
        el.style.visibility = o > 0 ? 'visible' : 'hidden';
      });
      // the dark stretch between stations, with lights going by
      const dark = clamp(1 - Math.abs(f - 0.5) / 0.38, 0, 1) * (f > 0.02 && f < 0.98 ? 1 : 0);
      if (tunnelRef.current) tunnelRef.current.style.opacity = String(dark);
      if (sideRef.current) sideRef.current.style.opacity = String(dark * 0.9);
      if (streakRef.current) streakRef.current.style.backgroundPositionX = `${-u * 5200}px, ${-u * 3900}px, ${-u * 2600}px`;
      if (lightRef.current) {
        lightRef.current.style.opacity = String(reduce ? 0 : dark * 0.55);
        lightRef.current.style.backgroundPositionX = `${-u * 1900}px`;
      }
      // a little sway while the train is moving
      if (swayRef.current && !reduce) {
        const m = Math.min(1, vel * 60);
        swayRef.current.style.transform = `translateY(${Math.sin(performance.now() / 95) * 1.6 * m}px)`;
      }
      const near = Math.round(u);
      const at = Math.abs(u - near) < 0.06 ? near : -1;
      if (at !== last) {
        last = at;
        setStop(at);
        // between stations the board reads the next stop in the direction of travel
        setHeading(at < 0 ? (dir < 0 ? k : k + 1) : null);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const goTo = useCallback(
    (i: number) => {
      const root = rootRef.current;
      if (root) root.scrollTo({ top: i * root.clientHeight, behavior: reduce ? 'auto' : 'smooth' });
    },
    [reduce],
  );
  const goToKey = (k: StopKey) => goTo(stops.findIndex((s) => s.key === k));

  // the ride scrolls in its own layer: keyboard users can use the arrows and Page keys right away
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  const here = stop >= 0 ? stops[stop] : null;
  const next = heading !== null ? stops[heading] : null;
  const board = here
    ? `${here.name} · ${here.line}`
    : next
      ? `Next stop · ${next.name}`
      : '';

  return (
    <div ref={rootRef} className="rc" tabIndex={-1} aria-label="Train ride through the portfolio">
      <div className="rc-stage">
        <div ref={swayRef} className="rc-sway">
          <div ref={camRef} className="rc-cam" style={{ width: CABIN.w, height: CABIN.h }}>
            {/* the view, behind the cabin picture's window */}
            <div className="rc-window" style={{ ...at(windowGlass), borderRadius: windowRadius }}>
              {stops.map((s, i) => {
                if (!s.view) return <div key={s.key} ref={(el) => void (viewRefs.current[i] = el)} className="rc-view rc-view--sky" />;
                const inner = (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.view} alt="" draggable={false} />
                    <span className="rc-plate">
                      <b>{s.name}</b> {s.line}
                      <em>{s.cta} ↗</em>
                    </span>
                  </>
                );
                const props = {
                  ref: (el: HTMLElement | null) => void (viewRefs.current[i] = el),
                  className: 'rc-view',
                  'aria-label': `${s.cta}: ${s.viewAlt}`,
                  tabIndex: stop === i ? 0 : -1,
                };
                if (s.key === 'home') return <button key={s.key} type="button" {...props} onClick={onExit}>{inner}</button>;
                return s.external ? (
                  <a key={s.key} {...props} href={s.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                ) : (
                  <Link key={s.key} {...props} href={s.href}>{inner}</Link>
                );
              })}
              <div ref={tunnelRef} className="rc-tunnel" aria-hidden="true">
                <div ref={streakRef} className="rc-streaks" />
              </div>
            </div>
            <div ref={sideRef} className="rc-sides" aria-hidden="true">
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
          <div className="rc-card" aria-hidden={!here}>
            {here ? (
              <>
                <p>
                  <b>{here.name}</b> {here.line}
                </p>
                {here.key === 'vizag' ? (
                  <span>Scroll to ride ↓</span>
                ) : here.key === 'home' ? (
                  <button type="button" onClick={onExit}>{here.cta} ↗</button>
                ) : here.external ? (
                  <a href={here.href} target="_blank" rel="noopener noreferrer">{here.cta} ↗</a>
                ) : (
                  <Link href={here.href}>{here.cta} ↗</Link>
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
      {/* the track: one screen of scroll per stop */}
      {stops.slice(1).map((s) => (
        <div key={s.key} className="rc-leg" style={{ height: vh || '100vh' }} />
      ))}
    </div>
  );
}
