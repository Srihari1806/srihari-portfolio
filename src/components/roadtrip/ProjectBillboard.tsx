'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Expand, FileText, Github, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '@/data/roadtrip';
import { useTrip } from './TripContext';

function Screenshot({ project, className = '' }: { project: Project; className?: string }) {
  const [broken, setBroken] = useState(false);
  return broken ? (
    <span className={`rp-pbb-placeholder ${className}`}>
      <span>{project.name}</span>
      <small>screenshot coming soon</small>
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={project.image} alt={project.imageAlt} width={800} height={500} loading="lazy" onError={() => setBroken(true)} />
  );
}

/** Expanded project preview: real screenshot, the problem, what's on the live site, my part, links. */
export function ProjectPreview({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const last = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      last?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="rt-panel-backdrop rt-preview-backdrop"
      onClick={onClose}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rt-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`pv-${project.key}`}
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? false : { opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <button ref={closeRef} type="button" className="rt-panel-close" onClick={onClose} aria-label="Close preview">
          <X aria-hidden="true" />
        </button>
        <div className="rt-preview-shot">
          <Screenshot project={project} />
        </div>
        <div className="rt-preview-body">
          <p className="rt-kicker">
            {project.name} · {project.kind}
          </p>
          <h2 id={`pv-${project.key}`} className="rt-preview-head">
            {project.headline}
          </h2>
          <div className="rt-preview-grid">
            <section>
              <h3>The problem</h3>
              <p>{project.problem}</p>
              <h3>My part</h3>
              <p>{project.role}</p>
              <h3>Recruiter Takeaway</h3>
              <p className="rt-preview-takeaway">{project.takeaway}</p>
            </section>
            <section>
              <h3>On the live site</h3>
              <ul>
                {project.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          </div>
          {project.note && <p className="rt-preview-note">{project.note}</p>}
          <div className="rt-actions">
            <a className="rt-btn rt-btn--lime" href={project.live} target="_blank" rel="noopener noreferrer">
              View live <ArrowUpRight aria-hidden="true" />
            </a>
            {project.caseStudy && (
              <a className="rt-btn rt-btn--outline" href={project.caseStudy} target="_blank" rel="noopener noreferrer">
                <FileText aria-hidden="true" /> Case study
              </a>
            )}
            {project.code && (
              <a className="rt-link" href={project.code} target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" /> Code <ArrowUpRight aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Large roadside billboard carrying a real screenshot of a live product.
 * Clicking the board opens the expanded preview; the caption keeps the live link one tap away.
 */
export function ProjectBillboard({ project, index }: { project: Project; index: number }) {
  const { discover } = useTrip();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const show = () => {
    setOpen(true);
    discover('products');
  };

  return (
    <>
      <motion.figure
        className="rp-bb rp-ibb"
        initial={reduce ? false : { opacity: 0, y: 48, rotate: index % 2 ? 1.4 : -1.4 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="rp-bb-lamp rp-bb-lamp--l" aria-hidden="true" />
        <span className="rp-bb-lamp rp-bb-lamp--r" aria-hidden="true" />
        <div className="rp-bb-frame">
          <button type="button" className="rp-ibb-screen" onClick={show} aria-label={`Open the ${project.name} preview`}>
            <Screenshot project={project} />
            <span className="rp-ibb-hint" aria-hidden="true">
              <Expand /> Preview
            </span>
          </button>
          <figcaption className="rp-ibb-caption">
            <span className="rp-ibb-kind">
              <b>{project.name}</b> · {project.kind}
            </span>
            <span className="rp-ibb-head">{project.headline}</span>
            <span className="rp-ibb-line">{project.line}</span>
            <span className="rp-ibb-actions">
              <a className="rt-btn rt-btn--lime rt-btn--sm" href={project.live} target="_blank" rel="noopener noreferrer">
                View live <ArrowUpRight aria-hidden="true" />
              </a>
              <button type="button" className="rt-btn rt-btn--ghost rt-btn--sm" onClick={show}>
                <Expand aria-hidden="true" /> Preview
              </button>
            </span>
          </figcaption>
        </div>
        <span className="rp-bb-walk" aria-hidden="true" />
        <span className="rp-bb-leg rp-bb-leg--l" aria-hidden="true" />
        <span className="rp-bb-leg rp-bb-leg--r" aria-hidden="true" />
        <span className="rp-bb-ground" aria-hidden="true" />
      </motion.figure>
      {mounted &&
        createPortal(
          <div className="rt rt-portal">
            <AnimatePresence>{open && <ProjectPreview project={project} onClose={close} />}</AnimatePresence>
          </div>,
          document.body,
        )}
    </>
  );
}
