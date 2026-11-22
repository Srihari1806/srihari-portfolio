'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Copy, FileText, Github, Linkedin, Mail, X } from 'lucide-react';
import { contact, destination } from '@/data/roadtrip';
import { ConversationalUI } from './ConversationalUI';
import { StopHead } from './Stops';
import { useTrip } from './TripContext';

/* ---------------- 0 KM: the last exchange (beside the road) ---------------- */
export function DestinationTalk() {
  const d = destination;
  return (
    <section id="destination" data-km={0} data-road="right" data-tone="dark" className="rt-stop rt-stop--road-right rt-stop--dest" aria-labelledby="destination-title">
      <div className="rt-stop-main">
        <StopHead id="destination" km={0} kicker={d.kicker} title={d.reveal} />
        <p className="rt-dest-line">{d.revealLine}</p>
        <div className="rt-convo-slot">
          <ConversationalUI id="arrival" auto label="The bike and the car arrive" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- the studio + the door ---------------- */
export function FinalDestination() {
  const d = destination;
  const { discover, setContactOpen } = useTrip();
  const [open, setOpen] = useState(false);
  const [knocking, setKnocking] = useState(false);
  const reduce = useReducedMotion();

  const knock = () => {
    if (open || knocking) return;
    discover('door');
    if (reduce) {
      setOpen(true);
      return;
    }
    setKnocking(true);
    window.setTimeout(() => {
      setKnocking(false);
      setOpen(true);
    }, 520);
  };

  return (
    <section id="arrival" className="rt-arrival" data-road="end" data-tone="dark" aria-labelledby="arrival-title">
      <h2 id="arrival-title" className="rt-arrival-ask">
        {d.ask}
      </h2>
      <div className={`rt-office is-${open ? 'open' : 'closed'}`}>
        <div className="rt-office-roof" aria-hidden="true" />
        <div className="rt-office-sign" aria-hidden="true">
          srihari<span>.</span> studio
        </div>
        <div className="rt-office-wall">
          <div className="rt-office-window" aria-hidden="true">
            <span className="rt-window-glass" />
            <span className="rt-window-neon">Open to good problems</span>
            <span className="rt-window-plant" />
          </div>

          <div className="rt-doorway">
            <span className="rt-wall-lamp" aria-hidden="true" />
            <div className="rt-interior" aria-hidden={!open}>
              <span className="rt-interior-light" />
              <span className="rt-interior-poster">Interview room →</span>
              <span className="rt-interior-desk" />
              <span className="rt-interior-chair" />
            </div>
            <button
              type="button"
              className={`rt-door-leaf${knocking ? ' is-shaking' : ''}`}
              onClick={knock}
              aria-label={open ? 'The door is open' : 'Knock on the door to open it'}
              aria-expanded={open}
              aria-controls="rt-final"
              disabled={open}
            >
              <span className="rt-door-pane" aria-hidden="true" />
              <span className="rt-door-panel rt-door-panel--a" aria-hidden="true" />
              <span className="rt-door-panel rt-door-panel--b" aria-hidden="true" />
              <span className="rt-door-knob" aria-hidden="true" />
              <span className="rt-door-cta">{d.door}</span>
            </button>
          </div>

          <div className="rt-office-window rt-office-window--r" aria-hidden="true">
            <span className="rt-window-glass" />
            <span className="rt-window-blinds" />
          </div>
        </div>
        <div className="rt-office-steps" aria-hidden="true">
          <span className="rt-plant rt-plant--l" />
          <span className="rt-step rt-step--1" />
          <span className="rt-step rt-step--2">
            <span className="rt-mat">Welcome, recruiters</span>
          </span>
          <span className="rt-plant rt-plant--r" />
        </div>
      </div>

      {!open && <p className="rt-door-hint">The door opens to the good stuff: contact, résumé, everything.</p>}

      <div id="rt-final" aria-live="polite">
        <AnimatePresence>
          {open && (
            <motion.div
              className="rt-final"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="rt-final-knock">{d.inside}</p>
              <p className="rt-final-roles">
                <span>Roles I’m after</span>
                {d.roles}
              </p>
              <div className="rt-actions">
                <button type="button" className="rt-btn rt-btn--lime" onClick={() => setContactOpen(true)}>
                  <Mail aria-hidden="true" /> Let’s talk
                </button>
                <a className="rt-btn rt-btn--outline" href={contact.resume} target="_blank" rel="noopener noreferrer">
                  <FileText aria-hidden="true" /> View résumé
                </a>
                <a className="rt-btn rt-btn--outline" href="#builds">
                  <ArrowUp aria-hidden="true" /> Revisit projects
                </a>
              </div>
              <div className="rt-final-links">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
                <a href={contact.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                {contact.linkedin ? (
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                ) : (
                  <span>
                    LinkedIn <span className="rt-soon">link soon</span>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="rt-signoff">{d.signoff}</p>
    </section>
  );
}

/* ---------------- contact panel ---------------- */
export function ContactPanel() {
  const { contactOpen, setContactOpen } = useTrip();
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!contactOpen) return;
    lastFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setContactOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [contactOpen, setContactOpen]);

  if (!contactOpen) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  };

  return (
    <div className="rt-panel-backdrop" onClick={() => setContactOpen(false)}>
      <div className="rt-panel" role="dialog" aria-modal="true" aria-labelledby="rt-panel-title" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="rt-panel-close" onClick={() => setContactOpen(false)} aria-label="Close">
          <X aria-hidden="true" />
        </button>
        <p className="rt-kicker">Come on in</p>
        <h2 id="rt-panel-title" className="rt-h3">Let’s talk.</h2>
        <p>
          I’m Srihari — a final-year Electronics &amp; Computer Science student at KIIT (graduating 2027). The bike builds,
          the car asks why. I’m looking at analyst and product roles across data, product, business, growth and sports.
        </p>
        <div className="rt-panel-row">
          <a className="rt-btn rt-btn--dark" href={`mailto:${contact.email}`}>
            <Mail aria-hidden="true" /> {contact.email}
          </a>
          <button type="button" className="rt-chip" onClick={copy}>
            <Copy aria-hidden="true" /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="rt-panel-row">
          {contact.linkedin ? (
            <a className="rt-link" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin aria-hidden="true" /> LinkedIn <ArrowUpRight aria-hidden="true" />
            </a>
          ) : (
            <span className="rt-link is-pending">
              <Linkedin aria-hidden="true" /> LinkedIn <span className="rt-soon">link soon</span>
            </span>
          )}
          <a className="rt-link" href={contact.github} target="_blank" rel="noopener noreferrer">
            <Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="rt-link" href={contact.resume} target="_blank" rel="noopener noreferrer">
            Résumé <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
