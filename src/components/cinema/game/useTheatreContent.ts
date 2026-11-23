'use client';

import { useMemo } from 'react';
import { useFilmDiary, usePoll } from '@/components/tfi/useLive';
import { cinemaWriting, programmeTeaser, records, savedShelves, savedShelfUser, type PublicPlaylists, type Release, type Shelf, type Shelves } from '@/data/theatre';
import type { TrackFeed, TvFeed } from '@/lib/live';
import type { FrameContent } from './engine';

function textureUrl(src:string|undefined){
  if(!src)return undefined;
  if(src.startsWith('/cinema/prints/'))return src;
  if(/^https:\/\/(image\.tmdb\.org\/t\/p\/|a\.ltrbxd\.com\/resized\/)/.test(src))return '/_next/image?url='+encodeURIComponent(src)+'&w=384&q=80';
}
export function useTheatreContent(user:string,panel:string|null){
  const diary=useFilmDiary();
  const shelves=usePoll<Shelves>('/api/cinema/shelves',6*3600_000);
  const upcoming=usePoll<{source:string;movies:Release[]}>('/api/cinema/upcoming',3600_000);
  const music=usePoll<TrackFeed>(panel==='music'?'/api/spotify':null,60_000);
  const playlists=usePoll<PublicPlaylists>(panel==='music'?'/api/cinema/playlists':null,1800_000);
  const latest=diary?.entries?.[0];
  const tv=usePoll<TvFeed>(latest && (panel==='screen'||panel==='diary')?'/api/tv?limit=1&official=1':null,1800_000);
  const profile='https://letterboxd.com/'+encodeURIComponent(user)+'/';
  const empty=(url:string):Shelf=>({source:'unavailable',url,films:[]});
  const fallback=user===savedShelfUser?savedShelves:{watched:empty(profile+'films/'),favorites:empty(profile),watchlist:empty(profile+'watchlist/')};
  const collection=shelves?.watched?shelves:fallback;
  const reviews=diary?.reviews??diary?.entries?.filter(f=>f.review)??[];
  const programme=collection.watched.films.find(f=>f.url===programmeTeaser.filmUrl);
  const video=latest?tv?.films?.find(f=>f.url===latest.url)?.video:programme?programmeTeaser:undefined;
  const screenTitle=latest?.title??cinemaWriting[0]?.title??reviews[0]?.title??programme?.title??'Screen 1';
  const screenCredit=latest?'Latest dated watch · Letterboxd':cinemaWriting[0]?'From the cinema notebook':reviews[0]?'From the review shelf':programme?'From my watched shelf · Official teaser':'Film diary & writing';
  const recentPrint=latest?.poster??collection.watched.films.find(f=>f.poster)?.poster;
  const favoritePrint=collection.favorites.films.find(f=>f.poster)?.poster,plannedPrint=collection.watchlist.films.find(f=>f.poster)?.poster,reviewPrint=reviews.find(f=>f.poster)?.poster;
  const frames=useMemo<FrameContent>(()=>({
    posterUrls:[recentPrint,favoritePrint,plannedPrint,reviewPrint].map(textureUrl),
    upcomingUrls:(upcoming?.movies?.length?upcoming.movies:collection.watchlist.films).map(m=>textureUrl(m.poster)).filter((u):u is string=>Boolean(u)).slice(0,4),
    albumUrls:records.flatMap(r=>r.image?[r.image]:[]),screenTitle,screenCredit,
  }),[recentPrint,favoritePrint,plannedPrint,reviewPrint,upcoming,collection.watchlist.films,screenTitle,screenCredit]);
  return {profile,collection,diary,reviews,latest,programme,video,music,playlists,upcoming,frames,shelfLoading:!shelves};
}
export type TheatreContent=ReturnType<typeof useTheatreContent>;

