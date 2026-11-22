'use client';

import '@fontsource-variable/anek-latin/index.css';
import '@fontsource/mukta/400.css';
import '@fontsource/mukta/600.css';
import '@fontsource/mukta/700.css';
import './roadtrip.css';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { contact, creative } from '@/data/roadtrip';
import { ExhibitPoster } from './CreativeDetour';
import { TripProvider } from './TripContext';

/** /creative — the full "other side": music, writing and songs. Content lives in data/roadtrip.ts → creative. */
export function CreativePage() {
  return (
    <TripProvider>
      <div className="rt rt-creative">
        <header className="rt-creative-head">
          <Link href="/work#creative" className="rt-skip">
            <ArrowLeft aria-hidden="true" /> Back on the road
          </Link>
          <a className="rt-btn rt-btn--lime rt-btn--sm" href={`mailto:${contact.email}`}>
            Say hi
          </a>
        </header>
        <main className="rt-creative-main">
          <p className="rt-kicker">srihari. / creative</p>
          <h1 className="rt-h2">{creative.title}</h1>
          <p className="rt-creative-lede">Songs, lyrics, poetry and independent music. Same curiosity, different screen.</p>
          <div className="rt-exhibits is-open">
            {creative.exhibits.map((e, i) => (
              <ExhibitPoster key={e.key} e={e} i={i} open />
            ))}
          </div>
          <p className="rt-creative-note">Artwork, releases and credits are being added here.</p>
        </main>
      </div>
    </TripProvider>
  );
}
