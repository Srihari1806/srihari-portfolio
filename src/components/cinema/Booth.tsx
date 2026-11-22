'use client';

import { ArrowUpRight, Disc3, Film, Lightbulb, NotebookPen, Radio, Sparkles, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { booth, type BoothItem } from '@/data/cinemaHall';
import { creative } from '@/data/roadtrip';
import type { TrackFeed } from '@/lib/live';
import { BOOTH } from './SceneArt';

const UNSET_SPOTIFY = 'https://open.spotify.com/';

type Can = { key: string; label: string; icon: LucideIcon; items: BoothItem[]; empty: string };
const CANS: Can[] = [
  { key: 'songs', label: 'Songs', icon: Disc3, items: booth.songs, empty: 'In the mix.' },
  { key: 'lyrics', label: 'Lyrics', icon: NotebookPen, items: booth.lyrics, empty: 'Still in the notebook.' },
  { key: 'films', label: 'Short films', icon: Film, items: booth.shortFilms, empty: 'In the edit.' },
  { key: 'boards', label: 'Storyboards', icon: Lightbulb, items: booth.storyboards, empty: 'Being sketched.' },
  {
    key: 'ventures',
    label: 'Ventures',
    icon: Sparkles,
    items: creative.exhibits.map((e) => ({ title: e.title, note: e.line, url: e.href })),
    empty: 'Coming soon.',
  },
];

/** Film cans on the shelf → load one into the light box. */
export function BoothShelf() {
  const [can, setCan] = useState(CANS[0].key);
  const c = CANS.find((x) => x.key === can)!;
  return (
    <>
      <div className="cn-cans" role="tablist" aria-label="What's in the booth" style={{ left: BOOTH.cans.x, top: BOOTH.cans.y, width: BOOTH.cans.w }}>
        {CANS.map((k) => {
          const Icon = k.icon;
          return (
            <button
              key={k.key}
              type="button"
              role="tab"
              id={`cn-can-${k.key}`}
              aria-selected={k.key === can}
              aria-controls="cn-lightbox"
              className={`cn-can${k.key === can ? ' is-on' : ''}`}
              onClick={() => setCan(k.key)}
            >
              <span className="cn-can-lid" aria-hidden="true">
                <Icon aria-hidden="true" />
              </span>
              <span className="cn-can-label">{k.label}</span>
            </button>
          );
        })}
      </div>
      <div
        id="cn-lightbox"
        role="tabpanel"
        aria-labelledby={`cn-can-${c.key}`}
        className="cn-lightbox"
        style={{ left: BOOTH.viewer.x, top: BOOTH.viewer.y, width: BOOTH.viewer.w, height: BOOTH.viewer.h }}
      >
        <p className="cn-lightbox-kind">{c.label}</p>
        {c.items.length ? (
          <ul>
            {c.items.map((it) => (
              <li key={it.title}>
                <span className="cn-frame-hole" aria-hidden="true" />
                <div>
                  <b>{it.title}</b>
                  {it.note && <small>{it.note}</small>}
                </div>
                {it.url ? (
                  <a href={it.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${it.title}`}>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : (
                  <span className="cn-soon">link soon</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="cn-lightbox-empty">{c.empty}</p>
        )}
      </div>
    </>
  );
}

/** The booth radio: Spotify, live when connected. Never claims playback it can't see. */
export function BoothRadio({ feed }: { feed: TrackFeed | null }) {
  const t = feed?.track;
  const profile = booth.spotifyProfile && booth.spotifyProfile !== UNSET_SPOTIFY ? booth.spotifyProfile : '';
  return (
    <div className="cn-radio" style={{ left: BOOTH.radio.x, top: BOOTH.radio.y, width: BOOTH.radio.w, height: BOOTH.radio.h }}>
      <div className="cn-radio-grille" aria-hidden="true" />
      <div className="cn-radio-panel">
        <p className="cn-radio-label">
          <Radio aria-hidden="true" /> Booth radio
        </p>
        {t ? (
          <a className="cn-radio-track" href={t.url} target="_blank" rel="noopener noreferrer">
            {t.art && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.art} alt="" />
            )}
            <span>
              <b>{t.title}</b>
              <small>{t.artist}</small>
              <em>{feed?.source === 'live' ? (t.playing ? 'Now playing on Spotify' : 'Last played on Spotify') : 'Last saved track'}</em>
            </span>
          </a>
        ) : (
          <p className="cn-radio-off">{feed ? 'Off air — Spotify isn’t connected yet.' : 'Tuning…'}</p>
        )}
        {profile ? (
          <a className="cn-radio-link" href={profile} target="_blank" rel="noopener noreferrer">
            My Spotify <ArrowUpRight aria-hidden="true" />
          </a>
        ) : (
          <span className="cn-soon">Spotify link soon</span>
        )}
      </div>
    </div>
  );
}
