'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { missions } from '@/data/roadtrip';
import { kmLabel } from './Milestone';
import type { RoadModel } from './SunsetRoad';

const TOTAL = 4;

/**
 * GTA-inspired HUD (original artwork): a round minimap of the actual road, centred on the bike,
 * plus a short "mission unlocked" notice each time a new kilometre starts.
 * The scroll engine moves `mapRef` / `arrowRef` directly, so this component rarely re-renders.
 */
export function MissionProgress({
  km,
  model,
  mapRef,
  arrowRef,
}: {
  km: number;
  model: RoadModel | null;
  mapRef: RefObject<SVGGElement>;
  arrowRef: RefObject<SVGGElement>;
}) {
  const reduce = useReducedMotion();
  const [toast, setToast] = useState<number | null>(null);
  const last = useRef(km);

  useEffect(() => {
    if (km === last.current) return;
    const forward = km < last.current;
    last.current = km;
    if (!forward) return;
    setToast(km);
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [km]);

  const m = missions[km] ?? missions[0];
  const step = TOTAL - km + 1;
  const pts = model?.path.map((p) => p.join(',')).join(' ') ?? '';

  return (
    <>
      <div className="rt-hud" aria-label={`Mission ${Math.min(step, 5)} of 5: ${m.title}, ${kmLabel(km)} km to go`} role="status">
        <svg className="rt-radar" viewBox="-60 -60 120 120" aria-hidden="true">
          <defs>
            <clipPath id="rt-radar-clip">
              <circle r="56" />
            </clipPath>
            <radialGradient id="rt-radar-bg" r=".6">
              <stop offset="0" stopColor="#3b2a2d" />
              <stop offset="1" stopColor="#24181a" />
            </radialGradient>
          </defs>
          <circle r="58" fill="#F8F5EE" />
          <circle r="56" fill="url(#rt-radar-bg)" />
          <g clipPath="url(#rt-radar-clip)">
            <g ref={mapRef}>
              {pts && (
                <>
                  <polyline points={pts} fill="none" stroke="#5a4547" strokeWidth={70} strokeLinejoin="round" strokeLinecap="round" />
                  <polyline points={pts} fill="none" stroke="#b7a59f" strokeWidth={8} strokeDasharray="28 28" strokeLinejoin="round" />
                </>
              )}
              {model?.checkpoints.map((c) => {
                const p = model.sample(c.y);
                return (
                  <g key={c.km} transform={`translate(${p.x} ${p.y})`}>
                    <circle r={c.km === km ? 46 : 34} fill={c.km >= km ? '#faaf30' : '#FAA356'} stroke="#24181a" strokeWidth={10} />
                    <text y={16} textAnchor="middle" fontSize={44} fontWeight={800} fill="#24181a" fontFamily="system-ui, sans-serif">
                      {c.km}
                    </text>
                  </g>
                );
              })}
            </g>
            <g opacity=".22" stroke="#F8F5EE" strokeWidth=".6">
              <line x1="-60" x2="60" y1="0" y2="0" />
              <line y1="-60" y2="60" x1="0" x2="0" />
              <circle r="28" fill="none" />
            </g>
          </g>
          <g ref={arrowRef}>
            <path d="M0 -8 L6 6 L0 3 L-6 6 Z" fill="#faaf30" stroke="#24181a" strokeWidth="1.4" strokeLinejoin="round" />
          </g>
          <text y="-46" textAnchor="middle" fontSize="7" fontWeight="800" fill="#F8F5EE" letterSpacing=".2em" fontFamily="system-ui, sans-serif">
            N
          </text>
        </svg>
        <div className="rt-hud-label">
          <span className="rt-hud-km">
            <b>{kmLabel(km)}</b> km
          </span>
          <span className="rt-hud-title">{m.title}</span>
        </div>
      </div>

      <div className="rt-toast-wrap" aria-live="polite">
        <AnimatePresence>
          {toast !== null && (
            <motion.div
              key={toast}
              className="rt-toast"
              initial={reduce ? false : { opacity: 0, y: -14, scaleX: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleX: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="rt-toast-kicker">{toast === 0 ? 'Mission complete' : 'Mission unlocked'}</span>
              <span className="rt-toast-title">{missions[toast]?.title}</span>
              <span className="rt-toast-sub">
                {kmLabel(toast)} km · {missions[toast]?.sky}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
