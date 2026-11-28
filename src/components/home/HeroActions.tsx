'use client';

import { TrainFront } from 'lucide-react';
import { REBOARD_EVENT } from '@/components/ride/journey';
import { profile } from '@/data/profile';

/** Hero buttons + the at-a-glance facts a recruiter scans for first. */
export function HeroActions() {
  return (
    <>
      <div className="hm-hero-actions">
        <a href="#selected-work" className="hm-btn hm-btn--dark">
          <svg viewBox="0 0 10 12" className="hm-play" aria-hidden="true">
            <path d="M0 0 10 6 0 12z" fill="currentColor" />
          </svg>
          Explore my work
        </a>
        <button
          type="button"
          className="hm-btn hm-btn--outline hm-ride-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            window.dispatchEvent(new Event(REBOARD_EVENT));
          }}
        >
          <TrainFront aria-hidden="true" strokeWidth={1.8} />
          Take the train ride
        </button>
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
