'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Bike as BikeIcon, CarFront, Languages, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { chats, type ChatId, type Msg, type Reply, type Speaker } from '@/data/roadtrip';
import { useTrip } from './TripContext';

const NAMES: Record<Speaker, string> = { me: 'Srihari', bike: 'Bike', car: 'Car' };

function Avatar({ who }: { who: Speaker }) {
  return (
    <span className={`rt-av rt-av--${who}`} aria-hidden="true">
      {who === 'me' ? 'S' : who === 'bike' ? <BikeIcon /> : <CarFront />}
    </span>
  );
}

function Line({ line }: { line: Msg }) {
  const [plain, setPlain] = useState(false);
  const reduce = useReducedMotion();
  return (
    <motion.li
      className={`rt-line rt-line--${line.who}`}
      initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Avatar who={line.who} />
      <div className="rt-line-bubble">
        <span className="rt-line-who">{NAMES[line.who]}</span>
        <span className="rt-line-text">{plain && line.plain ? line.plain : line.text}</span>
        {line.plain && (
          <button type="button" className="rt-translate" aria-pressed={plain} onClick={() => setPlain((v) => !v)}>
            <Languages aria-hidden="true" />
            {plain ? 'Original' : 'In English, please'}
          </button>
        )}
      </div>
    </motion.li>
  );
}

function Typing({ who }: { who: Speaker }) {
  return (
    <div className={`rt-line rt-line--${who} rt-typing`} aria-hidden="true">
      <Avatar who={who} />
      <div className="rt-line-bubble">
        <span className="rt-dots">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

/** Faster, snappier typing time so reading flow is natural and not bogged down by excessive delays. */
const delayFor = (m: Msg, first: boolean) => (first ? 200 : 300) + Math.min(350, m.text.length * 6);

/**
 * One scripted exchange, attached to whatever triggered it.
 * Only one exchange is open at a time (state lives in TripContext); opening another collapses this one
 * to a small "replay" chip. Never blocks scrolling, never shows a long transcript.
 */
export function ConversationalUI({
  id,
  auto = false,
  label,
  className = '',
  onReply,
  idle,
  replay = true,
}: {
  id: ChatId;
  /** play once when the bubble reaches the middle of the screen */
  auto?: boolean;
  label: string;
  className?: string;
  onReply?: (r: Reply) => void;
  /** what to show before the exchange has ever played (e.g. a prompt chip) */
  idle?: ReactNode;
  /** show a small "replay" chip once this exchange has collapsed */
  replay?: boolean;
}) {
  const { activeChat, played, playChat } = useTrip();
  const ex = chats[id];
  const lines = ex.lines as Msg[];
  const replies = ('replies' in ex ? ex.replies : undefined) as Reply[] | undefined;
  const active = activeChat === id;
  const wasPlayed = played.includes(id);
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auto || wasPlayed) return;
    const el = anchor.current;
    if (!el) return;
    // Central viewing area: trigger when entering the middle 50% of the viewport
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          playChat(id);
          io.disconnect();
        }
      },
      { rootMargin: '-20% 0px -20% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [auto, wasPlayed, id, playChat]);

  // opened by a tap but sitting below the fold (e.g. under a billboard on phones): bring it into view
  useEffect(() => {
    if (!active) return;
    const el = anchor.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight - 140) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }, 120);
    return () => window.clearTimeout(t);
  }, [active, reduce]);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setShown(lines.length);
      return;
    }
    setShown(0);
    let i = 0;
    let t = window.setTimeout(function tick() {
      i += 1;
      setShown(i);
      if (i < lines.length) t = window.setTimeout(tick, delayFor(lines[i], false));
    }, delayFor(lines[0], true));
    return () => window.clearTimeout(t);
  }, [active, reduce, lines]);

  const handle = (r: Reply) => {
    onReply?.(r);
    if (r.next) playChat(r.next as ChatId);
    if (r.scrollTo) document.querySelector(r.scrollTo)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const speakers = Array.from(new Set(lines.map((l) => NAMES[l.who])));
  const done = shown >= lines.length;

  return (
    <div ref={anchor} className={`rt-convo ${className}`} data-state={active ? 'open' : wasPlayed ? 'collapsed' : 'idle'}>
      {active ? (
        <div className="rt-convo-box" role="log" aria-live="polite" aria-label={label}>
          <ol className="rt-dialogue">
            {lines.slice(0, shown).map((l, i) => (
              <Line key={`${id}-${i}`} line={l} />
            ))}
          </ol>
          {!done && <Typing who={lines[shown].who} />}
            {done && replies && (
              <motion.div
                className="rt-replies"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                {replies.map((r) =>
                  r.href ? (
                    <a key={r.label} className="rt-reply" href={r.href} target="_blank" rel="noopener noreferrer" onClick={() => onReply?.(r)}>
                      {r.label} <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <button key={r.label} type="button" className="rt-reply" onClick={() => handle(r)}>
                      {r.label}
                    </button>
                  ),
                )}
              </motion.div>
            )}
            {/* Replay action control available directly inside the active exchange once finished */}
            {done && replay && (
              <div className="rt-convo-inline-replay">
                <button
                  type="button"
                  className="rt-convo-replay"
                  onClick={() => {
                    setShown(0);
                    let i = 0;
                    let t = window.setTimeout(function tick() {
                      i += 1;
                      setShown(i);
                      if (i < lines.length) t = window.setTimeout(tick, delayFor(lines[i], false));
                    }, delayFor(lines[0], true));
                  }}
                  aria-label={`Replay exchange: ${label}`}
                >
                  <RotateCcw aria-hidden="true" /> Replay conversation
                </button>
              </div>
            )}
        </div>
      ) : wasPlayed && replay ? (
        <button type="button" className="rt-convo-replay" onClick={() => playChat(id)} aria-label={`Replay: ${label}`}>
          <RotateCcw aria-hidden="true" /> {speakers.join(' & ')} · replay
        </button>
      ) : wasPlayed ? null : (
        idle ?? null
      )}
    </div>
  );
}
