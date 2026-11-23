import { NextResponse } from 'next/server';
import { savedShelves, savedShelfUser, type ShelfName, type Shelf, type Shelves } from '@/data/theatre';
import { letterboxd } from '@/data/tfi';
import type { FilmEntry } from '@/lib/live';

export const dynamic='force-dynamic';
const unescapeText=(s:string)=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,digits)=>String.fromCharCode(Number(digits)));
const attr=(s:string,name:string)=>new RegExp('(?:^|\\s)'+name+'="([^"]*)"').exec(s)?.[1];
async function page(url:string){
  const response=await fetch(url,{next:{revalidate:6*3600},signal:AbortSignal.timeout(4200)});
  if(!response.ok)throw new Error('Public shelf unavailable');return response.text();
}
async function shelf(name:ShelfName,user:string):Promise<Shelf>{
  const profile='https://letterboxd.com/'+encodeURIComponent(user)+'/',url=profile+({watched:'films/',favorites:'',watchlist:'watchlist/'}[name]);
  const fallback:Shelf=user===savedShelfUser?savedShelves[name]:{source:'unavailable',films:[],url};
  try{
    let html=await page(url);
    if(name==='favorites'){
      const favorites=html.match(/<section\b[^>]*(?:id|class)="[^"]*(?:favourite-films|favorite-films|profile-favourites)[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
      if(!favorites)return fallback;html=favorites[1];
    }
    // Read only public shelf metadata. Titles, links and artwork come from the same film.
    const films:FilmEntry[]=[];
    for(const tag of html.match(/<div\b[^>]*data-component-class="LazyPoster"[^>]*>/gi)??[]){
      const title=attr(tag,'data-item-name'),path=attr(tag,'data-item-link');
      if(!title||!path||!/^\/film\/[a-z0-9-]+\/$/.test(path))continue;
      const link='https://letterboxd.com'+path;if(films.some(f=>f.url===link))continue;
      const full=unescapeText(title),year=full.match(/ \((\d{4})\)$/)?.[1];
      const saved=Object.values(savedShelves).flatMap(s=>s.films).find(f=>f.url===link);
      films.push({title:year?full.slice(0,-7):full,year,url:link,poster:saved?.poster});
      if(films.length===8)break;
    }
    if(!films.length){
      if(/(?:no films|no movies|hasn.t added any|has not added any|empty watchlist)/i.test(html))return {source:'live',url,films:[]};
      return fallback;
    }
    if(!films.some(f=>f.poster)){
      try{
        const film=await page(films[0].url);
        const poster=film.match(/<meta\s+property="og:image"\s+content="(https:\/\/a\.ltrbxd\.com\/resized\/film-poster\/[^"]+)"/i)?.[1];
        if(poster)films[0].poster=unescapeText(poster);
      }catch{/* The verified film can still be opened at its source. */}
    }
    return {source:'live',url,films,checked:new Date().toISOString().slice(0,10)};
  }catch{return fallback;}
}
export async function GET(){
  const user=process.env.LETTERBOXD_USERNAME||letterboxd.username;
  const [watched,favorites,watchlist]=await Promise.all((['watched','favorites','watchlist'] as const).map(name=>shelf(name,user)));
  return NextResponse.json<Shelves>({watched,favorites,watchlist},{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=1800'}});
}

