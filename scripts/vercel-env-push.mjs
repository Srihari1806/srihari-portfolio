// Writes each needed value from .env.local into .vercel-env-tmp/<KEY> so the .cmd can pipe it to `vercel env add`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .filter((l) => l && !l.startsWith('#') && l.includes('='))
  .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const KEYS = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN', 'TMDB_READ_TOKEN', 'TMDB_API_KEY'];
mkdirSync('.vercel-env-tmp', { recursive: true });
for (const k of KEYS) { if (env[k]) writeFileSync(`.vercel-env-tmp/${k}`, env[k]); console.log(k, env[k] ? 'ready' : 'MISSING'); }
