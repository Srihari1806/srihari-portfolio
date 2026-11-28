#!/usr/bin/env node
/* Checks the live-data connections using .env.local. Prints only OK / failed — never a key.
   Run: npm run check:integrations */

import { readFileSync, existsSync } from 'node:fs';

const env = existsSync('.env.local')
  ? Object.fromEntries(
      readFileSync('.env.local', 'utf8')
        .split(/\r?\n/)
        .filter((l) => l && !l.startsWith('#') && l.includes('='))
        .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
    )
  : {};

async function spotify() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: s, SPOTIFY_REFRESH_TOKEN: rt } = env;
  if (!id || !s || !rt) return '✗ Spotify: missing ' + ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN'].filter((k) => !env[k]).join(', ');
  const t = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${s}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt }),
  });
  if (!t.ok) return `✗ Spotify: token refresh failed (HTTP ${t.status})`;
  const { access_token } = await t.json();
  const r = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: { Authorization: `Bearer ${access_token}` } });
  if (!r.ok) return `✗ Spotify: recently-played failed (HTTP ${r.status}) — re-run npm run spotify:auth`;
  const j = await r.json();
  return `✓ Spotify: connected${j.items?.[0] ? ` — last played “${j.items[0].track.name}”` : ''}`;
}

async function tmdb() {
  const { TMDB_API_KEY: key, TMDB_READ_TOKEN: token } = env;
  if (!key && !token) return '✗ TMDB: missing TMDB_READ_TOKEN (or TMDB_API_KEY)';
  const url = 'https://api.themoviedb.org/3/configuration' + (token ? '' : `?api_key=${key}`);
  const r = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return r.ok ? `✓ TMDB: connected (${token ? 'read access token' : 'API key'})` : `✗ TMDB: HTTP ${r.status} — check the key`;
}

for (const check of [spotify, tmdb]) {
  try {
    console.log(await check());
  } catch (e) {
    console.log(`✗ ${check.name}: ${e.message}`);
  }
}
