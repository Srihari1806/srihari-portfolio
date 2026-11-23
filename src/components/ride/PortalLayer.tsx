'use client';

/* The portal between the train window and the pages. Lives in the root layout, so it survives route
   changes and can cover them:
   - going in: the train's camera dives at the window; this layer takes over in the destination's own
     colours, the route changes underneath, and the page opens out of a window-shaped hole.
   - coming back: "Return to train" closes the page into the window's exact place on screen, the
     train mounts behind it at the same stop, and the cabin appears around the window. */

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from 'framer-motion';
import { stopByHref } from '@/data/ride';
import { glassRect, restingCam, WIN_H, WIN_W } from './camera';
import { PORTAL_EVENT, emitPortal, markBooted, setReturning, type PortalEvent } from './journey';
import '@fontsource/vt323/400.css';
import './portal.css';

const CABIN_WALL = 'linear-gradient(#2e3329, #262a21 60%, #1d2019)';

export function PortalLayer() {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = !!useReducedMotion();
  const coverRef = useRef<HTMLDivElement>(null);
  const pending = useRef<null | 'enter' | 'return'>(null);
  const lastPath = useRef(pathname);
  const [bg, setBg] = useState('');
  const [on, setOn] = useState(false);
  const here = stopByHref(pathname);

  useEffect(() => markBooted(), []);
  // on a stop's page, have the train ready to come back to
  useEffect(() => {
    if (here) router.prefetch('/');
  }, [here, router]);

  /** the hole in the cover, as CSS padding around it (all zero = the whole screen shows through) */
  const hole = useCallback((r: { left: number; top: number; width: number; height: number } | 'none' | 'all') => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (r === 'none') return { paddingTop: vh / 2, paddingBottom: vh / 2, paddingLeft: vw / 2, paddingRight: vw / 2 };
    if (r === 'all') return { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 };
    return { paddingTop: r.top, paddingLeft: r.left, paddingBottom: vh - r.top - r.height, paddingRight: vw - r.left - r.width };
  }, []);

  // events from the train (going in) and from the Return button (coming back)
  useEffect(() => {
    const onPortal = (e: Event) => {
      const d = (e as CustomEvent<PortalEvent>).detail;
      const el = coverRef.current;
      if (!el) return;
      if (d.type === 'enter') {
        if (pending.current === 'enter') return;
        pending.current = 'enter';
        setBg(d.cover);
        setOn(true);
        gsap.killTweensOf(el);
        gsap.set(el, { ...hole('none'), opacity: 0 });
        gsap.to(el, { opacity: 1, duration: 0.38, ease: 'power1.in' });
      } else if (d.type === 'train-ready' && pending.current === 'return') {
        // the train is behind us at the same stop: let the cabin appear around the window
        pending.current = null;
        gsap.to(el, { opacity: 0, duration: 0.5, ease: 'power1.out', delay: 0.05, onComplete: () => setOn(false) });
      }
    };
    window.addEventListener(PORTAL_EVENT, onPortal);
    return () => window.removeEventListener(PORTAL_EVENT, onPortal);
  }, [hole]);

  // arriving on the page we dived into: open it out of a window-shaped hole
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const el = coverRef.current;
    if (!el || pending.current !== 'enter') return;
    pending.current = null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(vw * 0.78, (vh * 0.78 * WIN_W) / WIN_H);
    const h = (w * WIN_H) / WIN_W;
    gsap.set(el, hole({ left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h }));
    // two frames for the page to paint before the hole opens
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        gsap.to(el, { ...hole('all'), duration: 0.95, ease: 'power3.inOut', delay: 0.06 });
        gsap.to(el, { opacity: 0, duration: 0.35, delay: 0.75, onComplete: () => setOn(false) });
      }),
    );
  }, [pathname, hole]);

  // safety: never leave a cover stuck on screen
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => {
      pending.current = null;
      setOn(false);
    }, 6000);
    return () => window.clearTimeout(t);
  }, [on]);

  const back = useCallback(() => {
    if (!here) return;
    const el = coverRef.current;
    if (reduce || !el) {
      emitPortal({ type: 'leaving' });
      setReturning(here.key);
      router.push('/');
      return;
    }
    emitPortal({ type: 'leaving' });
    // close the page down into the window, exactly where the window will be in the cabin
    pending.current = 'return';
    setBg(CABIN_WALL);
    setOn(true);
    const target = glassRect(restingCam(window.innerWidth, window.innerHeight));
    gsap.killTweensOf(el);
    gsap.set(el, { ...hole('all'), opacity: 1 });
    gsap.to(el, { ...hole(target), duration: 0.85, ease: 'power3.inOut' });
    // on the clock, not on the tween's last frame: a heavy page (the cinema's 3D) can starve frames
    window.setTimeout(() => {
      gsap.set(el, hole(target));
      setReturning(here.key);
      router.push('/');
    }, 870);
  }, [here, hole, reduce, router]);

  return (
    <>
      <div ref={coverRef} className={`ride-portal ${on ? 'is-on' : ''}`} style={{ background: bg || undefined }} aria-hidden="true" />
      {here && (
        <button type="button" className={`portal-back portal-back--${here.key}`} onClick={back}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 15V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 11h12M9 21l1.5-4M15 21l-1.5-4M9 14h.01M15 14h.01" />
          </svg>
          Return to train
        </button>
      )}
    </>
  );
}
