import { NextResponse } from 'next/server';
import { spotifyAccessToken } from '@/lib/spotify';
import type { PublicPlaylists } from '@/data/theatre';
export const dynamic='force-dynamic';

export async function GET(){
  try{
    const token=await spotifyAccessToken();
    const get=async(path:string)=>{const r=await fetch('https://api.spotify.com/v1/'+path,{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(4500)});if(!r.ok)throw new Error('Unavailable');return r.json();};
    const [me,lists]=await Promise.all([get('me'),get('me/playlists?limit=50')]);
    type List={name:string;public:boolean|null;owner:{id:string};external_urls:{spotify:string};images?:{url:string}[]};
    const items=(lists.items as List[]).filter(p=>p.public===true && p.owner?.id===me.id && p.external_urls?.spotify).slice(0,8)
      .map(p=>({title:p.name,url:p.external_urls.spotify,image:p.images?.[0]?.url}));
    return NextResponse.json<PublicPlaylists>({source:'live',items},{headers:{'Cache-Control':'s-maxage=1800'}});
  }catch{return NextResponse.json<PublicPlaylists>({source:'unavailable',items:[]});}
}

