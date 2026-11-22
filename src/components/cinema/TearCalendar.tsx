'use client';

import gsap from 'gsap';
import { Clapperboard, Popcorn, RotateCcw, Scissors } from 'lucide-react';
import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { calendarEvents } from '@/data/tfi';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type Page = { y: number; m: number };

function Sheet({ page, today }: { page: Page; today: Date }) {
  const key = `${page.y}-${String(page.m + 1).padStart(2, '0')}`;
  const events = calendarEvents.filter((e) => e.date.startsWith(key)).sort((a, b) => a.date.localeCompare(b.date));
  const days = new Date(page.y, page.m + 1, 0).getDate();
  const lead = (new Date(page.y, page.m, 1).getDay() + 6) % 7;
  const marked = new Set(events.map((e) => Number(e.date.slice(8, 10))));
  const isNow = page.y === today.getFullYear() && page.m === today.getMonth();
  return (
    <>
      <div className="cn-cal-head">
        <span className="cn-cal-month">{MONTHS[page.m]}</span>
        <span className="cn-cal-year">{page.y}</span>
      </div>
      <div className="cn-cal-grid" aria-hidden="true">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <b key={i}>{d}</b>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <i key={`b${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => (
          <span key={i} className={`${marked.has(i + 1) ? 'is-marked' : ''}${isNow && today.getDate() === i + 1 ? ' is-today' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      <ul className="cn-cal-events">
        {events.length ? (
          events.slice(0, 3).map((e) => (
            <li key={e.date + e.title}>
              {e.kind === 'release' ? <Clapperboard aria-hidden="true" /> : <Popcorn aria-hidden="true" />}
              <b>{Number(e.date.slice(8, 10))}</b> {e.title}
            </li>
          ))
        ) : (
          <li className="is-empty">No confirmed releases logged yet.</li>
        )}
      </ul>
    </>
  );
}

/**
 * A 12-month tear-off release calendar hung beside the ticket window.
 * Tear with the button, or drag the page down. Data: calendarEvents (src/data/tfi.ts).
 */
export function TearCalendar() {
  const today = useMemo(() => new Date(), []);
  const pages = useMemo<Page[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        return { y: d.getFullYear(), m: d.getMonth() };
      }),
    [today],
  );
  const [idx, setIdx] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const drag = useRef<{ y: number; id: number } | null>(null);
  const last = idx >= pages.length - 1;

  const tear = () => {
    if (busy.current || last) return;
    const el = top.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce) {
      setIdx((i) => i + 1);
      return;
    }
    busy.current = true;
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { clearProps: 'all' });
          setIdx((i) => i + 1);
          busy.current = false;
        },
      })
      .to(el, { rotation: -4, duration: 0.08, transformOrigin: '90% 0%' })
      .to(el, { rotation: 22, y: 420, x: 60, opacity: 0, duration: 0.6, ease: 'power2.in', transformOrigin: '0% 0%' });
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (last) return;
    drag.current = { y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !top.current) return;
    const dy = Math.max(0, e.clientY - d.y);
    gsap.set(top.current, { y: dy * 0.6, rotation: dy * 0.04, transformOrigin: '0% 0%' });
    if (dy > 90) {
      drag.current = null;
      tear();
    }
  };
  const onUp = () => {
    if (!drag.current || !top.current) return;
    drag.current = null;
    gsap.to(top.current, { y: 0, rotation: 0, duration: 0.3, ease: 'back.out(2)' });
  };

  const page = pages[idx];
  const next = pages[idx + 1];
  return (
    <div className="cn-cal" role="group" aria-roledescription="tear-off calendar" aria-label={`Release calendar, ${MONTHS[page.m]} ${page.y}. ${12 - idx} of 12 months left.`}>
      <div className="cn-cal-binding" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="cn-cal-stack">
        {next && (
          <div className="cn-cal-page cn-cal-page--under" aria-hidden="true">
            <Sheet page={next} today={today} />
          </div>
        )}
        <div
          ref={top}
          key={idx}
          className="cn-cal-page"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-live="polite"
        >
          <Sheet page={page} today={today} />
          <span className="cn-cal-perf" aria-hidden="true" />
        </div>
      </div>
      <div className="cn-cal-actions">
        {last ? (
          <button type="button" onClick={() => setIdx(0)}>
            <RotateCcw aria-hidden="true" /> Hang a new calendar
          </button>
        ) : (
          <button type="button" onClick={tear}>
            <Scissors aria-hidden="true" /> Tear off {MONTHS[page.m].slice(0, 3)}
          </button>
        )}
        {idx > 0 && !last && (
          <button type="button" className="cn-cal-back" onClick={() => setIdx((i) => i - 1)} aria-label="Stick the last page back">
            <RotateCcw aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
