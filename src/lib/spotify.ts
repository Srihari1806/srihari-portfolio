// Server-side only. Tokens are never included in responses or logs.
export async function spotifyAccessToken(){
  const {SPOTIFY_CLIENT_ID:id,SPOTIFY_CLIENT_SECRET:secret,SPOTIFY_REFRESH_TOKEN:refresh}=process.env;
  if(!id||!secret||!refresh)throw new Error('not-configured');
  const response=await fetch('https://accounts.spotify.com/api/token',{
    method:'POST',headers:{Authorization:'Basic '+Buffer.from(id+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh}),cache:'no-store',signal:AbortSignal.timeout(4500),
  });
  if(!response.ok)throw new Error('token HTTP '+response.status);
  const data=await response.json() as {access_token:string};return data.access_token;
}

