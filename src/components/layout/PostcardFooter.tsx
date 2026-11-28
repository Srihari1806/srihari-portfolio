'use client';

import Link from 'next/link';
import { ArrowUp, ArrowUpRight, FileText, Github, Mail } from 'lucide-react';
import { links, mailto, profile, resumeLink } from '@/data/profile';
import { useRole } from '@/context/RoleContext';
import './postcard-footer.css';

/* The footer for every editorial page: a postcard you can send me.
   Message on the left, address and stamp on the right. Everything comes from data/profile. */

const TRACKS = ['Data & Analytics', 'Software', 'Applied AI', 'Product & Business'];

export function PostcardFooter() {
  const { activeRole } = useRole();
  const cv = resumeLink(activeRole);
  const address = [
    { label: links.email, href: mailto('Hello from your portfolio'), icon: <Mail aria-hidden="true" /> },
    { label: links.github.replace('https://', ''), href: links.github, icon: <Github aria-hidden="true" /> },
    { label: 'LinkedIn', href: links.linkedin, icon: <ArrowUpRight aria-hidden="true" /> },
  ].filter((a) => a.href);

  return (
    <footer className="pc" aria-labelledby="pc-title">
      <div className="pc-card">
        <div className="pc-message">
          <p className="pc-kicker">A postcard from {profile.location.split(',')[0]}</p>
          <h2 id="pc-title" className="pc-title">
            Let’s build something <span className="pc-mark">worth using.</span>
          </h2>
          <p className="pc-body">
            {profile.availability}, graduating {profile.graduation}. If you’re hiring for data, software, AI or product, I’d love to hear what you’re working on.
          </p>
          <div className="pc-cta">
            <a href={mailto('Hello from your portfolio')} className="pc-btn pc-btn--lime">
              <Mail aria-hidden="true" /> Say hello
            </a>
            <a href={cv.href} className="pc-btn" {...(cv.isFile ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <FileText aria-hidden="true" /> {cv.label}
            </a>
          </div>
          <p className="pc-sign" aria-hidden="true">
            — Srihari
          </p>
        </div>

        <div className="pc-side">
          <div className="pc-stamps" aria-hidden="true">
            <div className="pc-postmark">
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="pcCircle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
                </defs>
                <circle cx="60" cy="60" r="54" />
                <circle cx="60" cy="60" r="34" />
                <text>
                  <textPath href="#pcCircle">OPEN TO WORK · CLASS OF {profile.graduation} · VIZAG ·</textPath>
                </text>
                <text x="60" y="58" textAnchor="middle" className="pc-pm-big">
                  {TRACKS.length}
                </text>
                <text x="60" y="72" textAnchor="middle" className="pc-pm-small">
                  TRACKS
                </text>
              </svg>
            </div>
            <div className="pc-stamp">
              <div className="pc-stamp-in">
                <svg viewBox="0 0 60 50" aria-hidden="true">
                  <path d="M0 38 C14 30 30 34 60 30 V50 H0Z" fill="#2f7a72" />
                  <path d="M24 32 C30 18 40 14 50 18 C56 21 58 27 60 30 L24 32Z" fill="#1a1512" opacity=".85" />
                  <rect x="40" y="10" width="3" height="10" fill="#c8442b" />
                  <circle cx="16" cy="14" r="7" fill="#f2a93b" />
                </svg>
                <span>₹ 2027</span>
              </div>
            </div>
          </div>
          <p className="pc-to">To: the next team</p>
          <ul className="pc-address">
            {address.map((a) => (
              <li key={a.label}>
                <a href={a.href} {...(a.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {a.icon}
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pc-foot">
        <nav aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/work">Work</Link>
          <Link href="/lab">Lab</Link>
          <Link href="/cinema">Cinema</Link>
          <Link href="/about">About</Link>
          {links.sahitya && (
            <a href={links.sahitya} target="_blank" rel="noopener noreferrer">
              Sahitya Rachanalu
            </a>
          )}
        </nav>
        <p className="pc-copy">
          © {new Date().getFullYear()} {profile.name} · Built in Vizag &amp; Bhubaneswar
        </p>
        <a href="#top" className="pc-top">
          Back to top <ArrowUp aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
