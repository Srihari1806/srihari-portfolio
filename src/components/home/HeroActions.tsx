'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { profile, resumeLink } from '@/data/profile';

/** Hero buttons + the at-a-glance facts a recruiter scans for first. */
export function HeroActions() {
  const { activeRole } = useRole();
  const cv = resumeLink(activeRole);
  return (
    <>
      <div className="hm-hero-actions">
        <a href="#selected-work" className="hm-btn hm-btn--dark">
          <svg viewBox="0 0 10 12" className="hm-play" aria-hidden="true">
            <path d="M0 0 10 6 0 12z" fill="currentColor" />
          </svg>
          Explore my work
        </a>
        <a
          href={cv.href}
          className="hm-btn hm-btn--outline"
          {...(cv.isFile ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {cv.isFile ? 'View résumé' : cv.label}
          <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
        </a>
      </div>
      <ul className="hm-hero-facts" aria-label="At a glance">
        <li>
          <span className="hm-dot hm-dot--green" aria-hidden="true" />
          {profile.availability}
        </li>
        <li>Graduation: {profile.graduation}</li>
        <li>Interests: {profile.interests}</li>
      </ul>
    </>
  );
}
