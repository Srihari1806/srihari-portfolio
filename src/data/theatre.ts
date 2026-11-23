import type { FilmEntry } from '@/lib/live';
import { articles } from './articles';
import { booth, writing } from './cinemaHall';
import { creative } from './roadtrip';

export type ShelfName = 'watched' | 'favorites' | 'watchlist';
export type Shelf = {source:'live'|'saved'|'unavailable'; films:FilmEntry[]; url:string; checked?:string};
export type Shelves = Record<ShelfName,Shelf>;
export type Release = {id:number;title:string;poster:string;releaseDate:string;url:string};
export type MusicLink = {title:string;url:string;note?:string;image?:string};
export type PublicPlaylists = {source:'live'|'unavailable';items:MusicLink[]};

// Dated public shelf selections. A film marked watched is not a dated diary entry or a review.
export const savedShelfUser='srihari_06';
const profile='https://letterboxd.com/'+savedShelfUser+'/';
export const savedShelves:Shelves={
  watched:{source:'saved',checked:'2026-11-22',url:profile+'films/',films:[
    {title:'The Paradise',year:'2026',url:'https://letterboxd.com/film/the-paradise-2026/',poster:'/cinema/prints/the-paradise-2026.jpg'},
    {title:'Peddi',year:'2026',url:'https://letterboxd.com/film/peddi/',poster:'/cinema/prints/peddi.jpg'},
  ]},
  favorites:{source:'unavailable',films:[],url:profile},
  watchlist:{source:'saved',checked:'2026-11-22',url:profile+'watchlist/',films:[
    {title:'Fauzi',url:'https://letterboxd.com/film/fauzi/',poster:'/cinema/prints/fauzi.jpg'},
    {title:'Spirit',url:'https://letterboxd.com/film/spirit-2027/',poster:'/cinema/prints/spirit.jpg'},
  ]},
};

export const records:MusicLink[]=[
  {title:'Alaka Yelanani',note:'Telugu single · Lyrics by Srihari. Music and vocals by Gopi Satwik.',url:'https://music.apple.com/us/album/alaka-yelanani-single/6807356478',image:'/cinema/prints/alaka-yelanani.jpg'},
  {title:'Dil Bezubaan',note:'Hindi single · Gopi Satwik. Lyrics by Chandan and Irfan.',url:'https://music.apple.com/us/album/dil-bezubaan-single/6808949190',image:'/cinema/prints/dil-bezubaan.jpg'},
];
// Only add soundtracks Srihari has explicitly chosen, with their exact public music URLs.
export const favoriteSoundtracks:MusicLink[]=[];
// The production company's own upload, matched to the marked-watched film page.
export const programmeTeaser={filmUrl:'https://letterboxd.com/film/the-paradise-2026/',id:'Y3xewv1ZnHc',name:'The Paradise · Official Telugu teaser',kind:'teaser' as const,publisher:'SLV Cinemas'};
export const cinemaWriting=[
  ...writing.map(w=>({title:w.title,url:w.url,note:w.blurb,source:w.kind})),
  ...articles.filter(a=>a.category==='Cinema & Culture').map(a=>({title:a.title,url:a.externalUrl,note:a.description,source:a.platform})),
].filter(w=>/^https?:\/\//.test(w.url));
export const notebook={
  concepts:[{title:'Amsham',note:'In development. A photographer and a dance teacher cross paths in a non-linear music-video story set between Hyderabad and Bengaluru.'}],
  lyricCredit:records[0],
  publications:[...booth.lyrics,...booth.shortFilms,...booth.storyboards,...articles.filter(a=>a.category==='Original Lyrics & Creative Writing').map(a=>({title:a.title,note:a.description,url:a.externalUrl}))].filter(w=>/^https?:\/\//.test(w.url)),
  projects:creative.exhibits.filter(item=>item.key!=='songs'),
};

