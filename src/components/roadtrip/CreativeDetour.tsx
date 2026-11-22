'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { creative, type Exhibit } from '@/data/roadtrip';
import { ConversationalUI } from './ConversationalUI';
import { Milestone } from './Milestone';
import { useTrip } from './TripContext';

/** A cinema-poster exhibit. Pure typography unless real artwork is set in data/roadtrip.ts. */
export function ExhibitPoster({ e, i, open }: { e: Exhibit; i: number; open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className={`rt-exhibit rt-exhibit--${i}`}
      initial={false}
      animate={open ? { opacity: 1, y: 0 } : { opacity: reduce ? 1 : 0.4, y: reduce ? 0 : 10 }}
      transition={{ duration: 0.5, delay: open && !reduce ? 0.12 * i : 0 }}
    >
      <div className="rt-exhibit-poster">
        {e.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt="" loading="lazy" />
        )}
        <span className="rt-exhibit-tag">{e.tag}</span>
        <h3 className="rt-exhibit-title">{e.title}</h3>
        <span className={`rt-curtain${open ? ' is-open' : ''}`} aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
      <p className="rt-exhibit-line">{e.line}</p>
      <p className="rt-exhibit-uses" aria-label="Where it meets the day job">
        {e.uses.map((u) => (
          <span key={u}>{u}</span>
        ))}
      </p>
      {e.href ? (
        <a className="rt-exhibit-link" href={e.href} target="_blank" rel="noopener noreferrer">
          Listen / read <ArrowUpRight aria-hidden="true" />
        </a>
      ) : (
        <span className="rt-soon">link soon</span>
      )}
    </motion.article>
  );
}

/** 1 km: the road becomes a twilight cinema boulevard. Tech gives way to music, writing and films. */
export function CreativeDetour() {
  const c = creative;
  const { discover } = useTrip();
  const [open, setOpen] = useState(false);
  const shelf = useRef<HTMLDivElement>(null);

  const reveal = () => {
    setOpen(true);
    discover('creative');
  };

  // if the visitor scrolls on without replying, raise the curtain anyway — nothing is gated
  useEffect(() => {
    const el = shelf.current;
    if (!el || open) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && reveal(), { rootMargin: '0px 0px -55% 0px' });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <section id="creative" data-km={c.km} data-road="left" data-theme="cinema" data-tone="dark" className="rt-stop rt-stop--road-left rt-stop--cinema" aria-labelledby="creative-title">
      <div className="rt-stop-main">
        <div className="rt-stop-head">
          <Milestone km={c.km} />
          <div>
            <p className="rt-kicker">{c.kicker}</p>
            <h2 id="creative-title" className="rt-h2">
              {c.title}
            </h2>
          </div>
        </div>
        <div className="rt-convo-slot">
          <ConversationalUI id="cinema" auto label="Srihari, at the cinema" onReply={reveal} />
          <ConversationalUI id="cinemaReally" label="Srihari, at the cinema" />
        </div>
        <div ref={shelf} className={`rt-exhibits${open ? ' is-open' : ''}`}>
          {c.exhibits.map((e, i) => (
            <ExhibitPoster key={e.key} e={e} i={i} open={open} />
          ))}
        </div>
        <Link href={c.cta.href} className="rt-btn rt-btn--lime rt-cinema-cta">
          {c.cta.label} <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
