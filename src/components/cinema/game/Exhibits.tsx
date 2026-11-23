'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';
import type { FilmEntry } from '@/lib/live';
import { calendarEvents } from '@/data/tfi';
import { cinemaWriting, favoriteSoundtracks, notebook, records, type MusicLink, type Shelf } from '@/data/theatre';
import type { TheatreContent } from './useTheatreContent';
import type { Exhibit } from './plan';

function out(url:string){return /^https?:\/\//i.test(url);}
function Source({href,children}:{href:string;children:React.ReactNode}){
  if(!out(href))return null;
  return <a className="cg-source" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={13} aria-hidden="true"/></a>;
}
function date(value:string){return new Date(value.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});}
function FilmList({films}:{films:FilmEntry[]}){
  return <ul className="cg-films">{films.map((f,i)=><li key={f.url+i}>
    {f.poster&&<img src={f.poster} alt="" loading="lazy" width="49" height="72"/>}
    <div><a href={f.url} target="_blank" rel="noopener noreferrer">{f.title}</a>
    <small>{[f.year,f.watched?'Watched '+date(f.watched):null,f.rating!=null?f.rating+' / 5':null].filter(Boolean).join(' · ')}</small>
    {f.review&&<p>{f.review.slice(0,190)}{f.review.length>190?'…':''}</p>}</div></li>)}</ul>;
}
function ShelfView({s,loading,empty,link}:{s:Shelf;loading:boolean;empty:string;link:string}){
  return <>{s.films.length>0?<>{s.source==='saved'&&s.checked&&<p className="cg-source-note">Saved from the public shelf on {date(s.checked)}.</p>}<FilmList films={s.films}/></>:<p>{loading?'Checking the public shelf…':empty}</p>}<Source href={s.url}>{link}</Source></>;
}
function Records({list}:{list:MusicLink[]}){return <ul className="cg-records">{list.map(r=><li key={r.url}>
  {r.image&&<img src={r.image} alt="" width="59" height="59" loading="lazy"/>}<div><Source href={r.url}>{r.title}</Source>{r.note&&<p>{r.note}</p>}</div></li>)}</ul>;}
function Screening({content:c}:{content:TheatreContent}){
  const [play,setPlay]=useState(false);
  useEffect(()=>setPlay(false),[c.video?.id]);
  return <>
    {c.latest&&<><h3>Latest dated watch</h3><FilmList films={[c.latest]}/></>}
    {!c.latest&&c.programme&&<><h3>From my watched shelf</h3><FilmList films={[c.programme]}/></>}
    {c.video&&/^[a-zA-Z0-9_-]{11}$/.test(c.video.id)&&(play?<iframe className="cg-trailer" title={c.video.name} src={'https://www.youtube-nocookie.com/embed/'+c.video.id+'?rel=0'} allow="encrypted-media; picture-in-picture" allowFullScreen/>:
      <button className="cg-text-button" onClick={()=>setPlay(true)}><Play size={15}/> Open official {c.video.kind}</button>)}
    {c.video&&<Source href={'https://www.youtube.com/watch?v='+c.video.id}>Watch on YouTube</Source>}
    <h3>Film writing</h3>
    {cinemaWriting.length?cinemaWriting.map(w=><article key={w.url}><Source href={w.url}>{w.title}</Source><small>{w.source}</small>{w.note&&<p>{w.note}</p>}</article>):<p>No published cinema essays are linked here yet.</p>}
    {c.reviews.length>0&&<><h3>From my reviews</h3><FilmList films={c.reviews.slice(0,3)}/></>}
    <Source href={c.profile+'films/reviews/'}>Reviews on Letterboxd</Source>
  </>;
}
export function ExhibitBody({id,content:c,open}:{id:Exhibit;content:TheatreContent;open:(panel:Exhibit)=>void}){
  switch(id){
    case 'ticket':return <><div className="cg-ticket"><small>GENERAL ADMISSION</small><strong>Admit One</strong><span>Screen 1 · Single screen</span></div><p>The doors beside the ticket window open as you approach.</p><button className="cg-text-button" onClick={()=>open('calendar')}>Check the release calendar</button></>;
    case 'calendar':{
      const movies=c.upcoming?.movies??[];
      return <>{movies.length?<><p className="cg-source-note">Upcoming Telugu releases · TMDB. Dates can change.</p><ul className="cg-films">{[...movies].sort((a,b)=>a.releaseDate.localeCompare(b.releaseDate)).map(m=><li key={m.id}><img src={m.poster} alt="" width="48" height="70" loading="lazy"/><div><Source href={m.url}>{m.title}</Source><small>{date(m.releaseDate)}</small></div></li>)}</ul></>:<p>{!c.upcoming?'Checking upcoming Telugu releases…':c.upcoming.source==='live'?'TMDB returned no dated Telugu releases for this window.':'Upcoming release dates are unavailable from TMDB.'}</p>}
       {calendarEvents.map(e=><p key={e.date+e.title}>{date(e.date)} · {e.title}</p>)}<small>This product uses the TMDB API but is not endorsed or certified by TMDB.</small></>;
    }
    case 'diary':return <>{c.diary?.entries?.length?<><p className="cg-source-note">{c.diary.source==='cached'?'Saved diary entries':'Dated diary entries'} · newest watch first</p><FilmList films={c.diary.entries}/></>:
      <><p>{!c.diary?'Checking the dated diary…':c.diary.source==='live'?'The public feed has no dated diary entries.':'The dated diary feed is unavailable.'}</p><h3>Marked as watched</h3><ShelfView s={c.collection.watched} loading={c.shelfLoading} empty="The watched shelf is unavailable." link="Open watched films"/></>}
      <Source href={c.profile+'films/diary/'}>Open the dated diary</Source></>;
    case 'favorites':return <ShelfView s={c.collection.favorites} loading={c.shelfLoading} empty="Favorite picks are unavailable here. The profile is the source for Srihari’s selections." link="Visit Srihari’s profile"/>;
    case 'watchlist':return <ShelfView s={c.collection.watchlist} loading={c.shelfLoading} empty="There are no watchlist previews available here." link="Open the full watchlist"/>;
    case 'reviews':return <>{c.reviews.length?<FilmList films={c.reviews}/>:<p>{c.diary?'No reviews are available from the public feed.':'Checking the review shelf…'}</p>}<Source href={c.profile+'films/reviews/'}>Open the reviews</Source></>;
    case 'seat':case 'screen':return <Screening content={c}/>;
    case 'snacks':return <><p>Popcorn at the window, a steel tumbler at the thickshake mixer and a record waiting beside the soda fountain.</p><button className="cg-text-button" onClick={()=>open('music')}>Browse the record cabinet</button></>;
    case 'music':{
      const t=c.music?.track,playing=t?.playing && c.music?.source==='live' && Date.now()-Date.parse(c.music?.fetchedAt??'')<90000;
      return <><h3>Released singles</h3><Records list={records}/><h3>Spotify</h3>
      {t?<><p className="cg-source-note">{playing?'Playing now':c.music?.source==='cached'?'Saved listening activity':'Last reported track'}</p><Records list={[{title:t.title,note:t.artist,url:t.url,image:t.art}]}/></>:<p>{c.music?'Listening activity is unavailable.':'Checking listening activity…'}</p>}
      <h3>Public playlists</h3>{c.playlists?.items?.length?<Records list={c.playlists.items}/>:<p>{!c.playlists?'Checking public playlists…':c.playlists.source==='live'?'No public playlists were returned for this account.':'Spotify playlists are unavailable.'}</p>}
      {favoriteSoundtracks.length>0&&<><h3>Favorite soundtracks</h3><Records list={favoriteSoundtracks}/></>}</>;
    }
    case 'notebook':case 'memories':return <>{id==='memories'&&<p>The projectionist’s shelf keeps the music and writing that went into this corner of the portfolio.</p>}
      <h3>Lyrics</h3><Records list={[notebook.lyricCredit]}/><h3>Film concepts</h3>{notebook.concepts.map(c=><article key={c.title}><strong>{c.title}</strong><p>{c.note}</p></article>)}
      {notebook.publications.length>0&&<><h3>Pages from the notebook</h3>{notebook.publications.map(w=><Source href={w.url} key={w.url}>{w.title}</Source>)}</>}
      <h3>Creative projects</h3>{notebook.projects.map(p=><article key={p.key}><strong>{p.title}</strong><p>{p.line}</p>{p.href&&<Source href={p.href}>View project</Source>}</article>)}
      <Link href="/creative" className="cg-source">Open creative work</Link></>;
    case 'gate':case 'exit':return <><p>The lane opens back onto the portfolio.</p><Link className="cg-source" href="/">Return home</Link><Link className="cg-source" href="/work">Explore the work road trip</Link></>;
  }
}

