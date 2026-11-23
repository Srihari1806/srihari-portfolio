'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Film, Play, X } from 'lucide-react';
import { useFilmDiary, useNowPlaying, useTvFeed } from '@/components/tfi/useLive';
import { writing } from '@/data/cinemaHall';
import { letterboxd } from '@/data/tfi';
import { Walker } from './Walker';
import './cinema.css';
import './theatre-journey.css';

type Movie = { id: number; title: string; poster: string; releaseDate: string; url: string };
const scenes = ['Entrance', 'Poster corridor', 'Auditorium', 'Interval', 'Memory wall'];
const date = (value: string) => new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function TheatreJourney() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [walking, setWalking] = useState(false);
  const [backward, setBackward] = useState(false);
  const [upcoming, setUpcoming] = useState<{ source: string; movies: Movie[] } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [panel, setPanel] = useState<'releases' | 'diary' | 'writing' | null>(null);
  const diary = useFilmDiary();
  const tv = useTvFeed(1);
  const music = useNowPlaying();
  const latest = diary?.entries?.[0];
  // Only attach a video if it belongs to the latest diary entry, never an older cached film.
  const video = latest && tv?.films?.[0]?.url === latest.url ? tv.films[0].video : null;
  const active = Math.min(4, Math.round(progress));

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/cinema/upcoming', { signal: controller.signal }).then(r => r.json()).then(setUpcoming).catch(() => { if (!controller.signal.aborted) setUpcoming({ source: 'unavailable', movies: [] }); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    let frame = 0;
    let idle = 0;
    let previous = 0;
    const update = () => {
      if (!root.current) return;
      const rect = root.current.getBoundingClientRect();
      const next = Math.max(0, Math.min(4, -rect.top / Math.max(1, rect.height - innerHeight) * 4));
      setProgress(reduced ? Math.round(next) : next);
      if (Math.abs(next - previous) > .001) {
        setBackward(next < previous); setWalking(true);
        clearTimeout(idle); idle = window.setTimeout(() => setWalking(false), 160);
      }
      previous = next;
    };
    const scroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', scroll);
    return () => { cancelAnimationFrame(frame); clearTimeout(idle); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); };
  }, [reduced]);
  useEffect(() => { setPlaying(false); }, [active, latest?.url]);
  const go = (index: number) => {
    if (!root.current) return;
    const top = root.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (root.current.offsetHeight - innerHeight) * index / 4, behavior: reduced ? 'auto' : 'smooth' });
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('button,a,input,select,textarea,dialog')) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(Math.max(0, Math.min(4, active + (event.key === 'ArrowRight' ? 1 : -1)))); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });

  return <main className="talkies" ref={root}>
    <div className="talkies-stage">
      <header className="talkies-header"><Link href="/" aria-label="Back to portfolio"><ArrowLeft size={15} /> srihari</Link><span>SRIHARI TALKIES <i /> A SINGLE-SCREEN LOVE LETTER</span><Link href="/work">Work <ArrowRight size={14} /></Link></header>
      <h1 className="sr-only">Srihari Talkies: a five-stop cinema walkthrough</h1>
      <div className="talkies-track" style={{ transform: `translate3d(${-progress * 100}vw,0,0)` }}>
        {scenes.map((name, index) => <section key={name} ref={element => { if (element) element.inert = active !== index; }} className={`talkies-scene talkies-scene-${index}`} aria-label={name} aria-hidden={active !== index}>
          <div className="talkies-canvas">
            <img className="talkies-art" src={`/cinema/scene-${index}.png`} alt={`${name} at Srihari Talkies: terracotta arches, brass lamps and red carpets`} loading={index < 2 ? 'eager' : 'lazy'} />
            {index === 0 && <><div className="talkies-entrance-label"><span>ONE TICKET. MANY STORIES.</span><h2>Welcome to<br /><em>my kind of cinema.</em></h2><button onClick={() => go(1)}>Step inside <ArrowRight size={15} /></button></div><button className="talkies-hotspot entrance-calendar" onClick={() => setPanel('releases')}>Release calendar</button><button className="talkies-hotspot entrance-posters" onClick={() => go(1)}>Upcoming posters</button><button className="talkies-hotspot entrance-ticket" onClick={() => go(2)}>Latest watch</button></>}
            {index === 1 && <><div className="talkies-poster-wall">{upcoming?.movies.slice(0, 6).map(m => <a href={m.url} target="_blank" rel="noopener noreferrer" key={m.id}><img src={m.poster} alt={m.title} /><span>{m.title}<small>{date(m.releaseDate)} · TMDB</small></span></a>)}</div><div className="talkies-caption"><span>COMING TO THE BIG SCREEN</span><h2>The next first-day feeling.</h2><p>{!upcoming ? 'Loading upcoming Telugu films…' : upcoming.movies.length ? 'Upcoming Telugu releases · TMDB · release dates may change' : 'Upcoming posters are unavailable. The illustrated posters are decorative.'}</p><button onClick={() => setPanel('diary')}>My recent watches <ArrowRight size={14} /></button></div></>}
            {index === 2 && <><div className="talkies-projection">{playing && video ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={`${latest?.title} official ${video.kind}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <div className="talkies-film-screen">{latest?.poster && <img src={latest.poster} alt={latest.title} />}<div><span>MY LATEST LETTERBOXD WATCH</span><h2>{latest?.title || 'The projector is warming up.'}</h2><p>{latest ? `${latest.year || ''}${latest.watched ? ' · Watched ' + date(latest.watched) : ''}${latest.rating ? ' · ' + latest.rating + '/5' : ''}` : diary ? 'Connect your Letterboxd diary to light up this screen.' : 'Loading my latest diary entry…'}</p>{video ? <button onClick={() => setPlaying(true)}><Play size={15} /> Play official {video.kind}</button> : latest && <a href={latest.url} target="_blank" rel="noopener noreferrer">Read on Letterboxd ↗</a>}</div></div>}</div><button className="talkies-hotspot auditorium-writing" onClick={() => setPanel('writing')}>Essays & scene notes</button><button className="talkies-hotspot auditorium-diary" onClick={() => setPanel('diary')}>My diary</button></>}
            {index === 3 && <div className="talkies-interval-card"><span>INTERVAL / TAKE A BREATHER</span><h2>Popcorn ki company?<br /><em>A little music.</em></h2>{music?.track ? <a href={music.track.url} target="_blank" rel="noopener noreferrer" className="talkies-track-link">{music.track.art && <img src={music.track.art} alt="" />}<div><small>{music.track.playing ? 'NOW PLAYING' : 'LAST PLAYED'} · SPOTIFY</small><strong>{music.track.title}</strong><p>{music.track.artist}</p></div><Play size={18} /></a> : <p>My Spotify listening activity will appear here when connected.</p>}<Link href="/creative">Original music & lyrics <ArrowRight size={15} /></Link></div>}
            {index === 4 && <><div className="talkies-memory-note"><span>AFTER THE CREDITS</span><h2>Some films end.<br /><em>Some stay.</em></h2><p>{latest?.review ? latest.review.slice(0, 300) : 'A place for the scenes, songs and stories that come home with me.'}</p>{latest && <a href={latest.url} target="_blank" rel="noopener noreferrer">{latest.review ? 'Read my full review' : 'My latest diary entry'} ↗</a>}<button onClick={() => setPanel('writing')}>Open my notebook <ArrowRight size={15} /></button></div><Link className="talkies-hotspot memory-exit" href="/">Back to the real world</Link></>}
          </div>
        </section>)}
      </div>
      <div className={`talkies-guide cn-walker ${walking && !reduced ? 'is-walking' : ''} ${backward ? 'is-back' : ''}`} style={{ left: `${12 + (progress % 1) * 9}%`, opacity: walking ? 1 : .9 }}><Walker /></div>
      <div className="talkies-bottom"><span className="talkies-scroll-hint">SCROLL TO WALK <span aria-hidden="true">→</span></span><nav aria-label="Theatre stops">{scenes.map((name, i) => <button key={name} aria-current={active === i ? 'step' : undefined} onClick={() => go(i)}><span>0{i + 1}</span>{name}</button>)}</nav><div className="talkies-scene-counter"><span>Scene {active + 1} / 5</span><button aria-label="Next scene" onClick={() => go(active === 4 ? 0 : active + 1)}><ArrowRight size={24} /></button></div></div>
      {panel && <ContentPanel title={panel === 'releases' ? 'Coming soon · Telugu cinema' : panel === 'diary' ? 'My Letterboxd diary' : 'The cinema notebook'} onClose={() => setPanel(null)}>
        {panel === 'releases' && (upcoming?.movies.length ? <div className="talkies-panel-posters">{upcoming.movies.map(m => <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"><img src={m.poster} alt={m.title} /><strong>{m.title}</strong><small>{date(m.releaseDate)} · TMDB</small></a>)}</div> : <p>Upcoming releases are currently unavailable. Check the TMDB connection.</p>)}
        {panel === 'diary' && (diary?.entries?.length ? <div className="talkies-panel-posters">{diary.entries.map((f, i) => <a key={f.url + i} href={f.url} target="_blank" rel="noopener noreferrer">{f.poster && <img src={f.poster} alt={f.title} />}<strong>{f.title}</strong><small>{f.watched ? date(f.watched) : 'Diary entry'}{f.rating ? ' · ' + f.rating + '/5' : ''}</small></a>)}</div> : <p>The diary is not available yet.{letterboxd.profileUrl && <a href={letterboxd.profileUrl} target="_blank" rel="noopener noreferrer"> Open Letterboxd ↗</a>}</p>)}
        {panel === 'writing' && (writing.length ? writing.map(w => <a className="talkies-piece" key={w.title} href={w.url} target="_blank" rel="noopener noreferrer">{w.title} ↗</a>) : <><p>Film essays and scene breakdowns are on the way. Published notes will appear here.</p><Link href="/writing">Visit the writing room ↗</Link></>)}
        <p className="talkies-attribution">Movie metadata and posters: TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. Diary and ratings: Letterboxd.</p>
      </ContentPanel>}
    </div>
  </main>;
}

function ContentPanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { element?.close(); document.body.style.overflow = overflow; }; }, []);
  return <dialog ref={dialog} className="talkies-dialog" aria-label={title} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="talkies-dialog-inner"><header><h2>{title}</h2><button aria-label="Close panel" onClick={onClose} autoFocus><X size={22} /></button></header>{children}</div></dialog>;
}