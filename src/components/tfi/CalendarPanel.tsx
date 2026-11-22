'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clapperboard, Popcorn, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { calendarEvents } from '@/data/tfi';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** The desk calendar, opened up: month navigation with a paper flip, releases and personal movie plans. */
export function CalendarPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [dir, setDir] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      last?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (d: number) => {
    setDir(d);
    setView((v) => {
      const m = v.m + d;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  };

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthKey = `${view.y}-${String(view.m + 1).padStart(2, '0')}`;
  const events = calendarEvents.filter((e) => e.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date));
  const byDay = new Map(events.map((e) => [Number(e.date.slice(8, 10)), e]));
  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="tfi-modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="tfi-cal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tfi-cal-title"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? false : { y: 30, scale: 0.92, rotate: -2 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { y: 20, scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="tfi-cal-rings" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <button ref={closeRef} type="button" className="tfi-cal-close" onClick={onClose} aria-label="Close calendar">
              <X aria-hidden="true" />
            </button>
            <div className="tfi-cal-head">
              <button type="button" onClick={() => go(-1)} aria-label="Previous month">
                <ChevronLeft aria-hidden="true" />
              </button>
              <h2 id="tfi-cal-title" aria-live="polite">
                {MONTHS[view.m]} <span>{view.y}</span>
              </h2>
              <button type="button" onClick={() => go(1)} aria-label="Next month">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
            <div className="tfi-cal-page-wrap">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={monthKey}
                  className="tfi-cal-page"
                  custom={dir}
                  initial={reduce ? { opacity: 0 } : { rotateX: dir > 0 ? -95 : 95, opacity: 0.6 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { rotateX: dir > 0 ? 95 : -95, opacity: 0 }}
                  transition={{ duration: reduce ? 0.12 : 0.42, ease: [0.3, 0.7, 0.2, 1] }}
                >
                  <div className="tfi-cal-grid" role="grid" aria-label={`${MONTHS[view.m]} ${view.y}`}>
                    {DAYS.map((d) => (
                      <span key={d} className="tfi-cal-dow" role="columnheader">
                        {d}
                      </span>
                    ))}
                    {cells.map((d, i) => {
                      if (!d) return <span key={`b${i}`} />;
                      const ev = byDay.get(d);
                      const isToday = iso(view.y, view.m, d) === todayIso;
                      return (
                        <span
                          key={d}
                          role="gridcell"
                          className={`tfi-cal-day${isToday ? ' is-today' : ''}${ev ? ` has-${ev.kind}` : ''}`}
                          aria-label={`${d} ${MONTHS[view.m]}${isToday ? ', today' : ''}${ev ? `, ${ev.title}` : ''}`}
                          title={ev?.title}
                        >
                          {d}
                        </span>
                      );
                    })}
                  </div>
                  <ul className="tfi-cal-events">
                    {events.length ? (
                      events.map((e) => (
                        <li key={e.date + e.title} className={`is-${e.kind}`}>
                          {e.kind === 'release' ? <Clapperboard aria-hidden="true" /> : <Popcorn aria-hidden="true" />}
                          <b>{Number(e.date.slice(8, 10))}</b> {e.title}
                          {e.note && <small> · {e.note}</small>}
                        </li>
                      ))
                    ) : (
                      <li className="is-empty">Nothing booked this month. FDFS plans pending.</li>
                    )}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
