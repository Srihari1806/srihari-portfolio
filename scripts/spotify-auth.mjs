#!/usr/bin/env node
/* One-time Spotify setup. Run on your own computer:  npm run spotify:auth
   1. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
   2. In the Spotify app's settings, add this Redirect URI exactly:  http://127.0.0.1:8888/callback
   3. Run the command, open the printed link, approve.
   The refresh token is written straight into .env.local. It is never printed. */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { exec } from 'node:child_process';

const ENV = '.env.local';
const REDIRECT = 'http://127.0.0.1:8888/callback';
const SCOPES = 'user-read-currently-playing user-read-recently-played playlist-read-private';

function readEnv() {
  if (!existsSync(ENV)) return {};
  return Object.fromEntries(
    readFileSync(ENV, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
}

function setEnv(key, value) {
  const text = existsSync(ENV) ? readFileSync(ENV, 'utf8') : '';
  const line = `${key}=${value}`;
  const re = new RegExp(`^#?\\s*${key}=.*$`, 'm');
  writeFileSync(ENV, re.test(text) ? text.replace(re, line) : `${text.replace(/\s*$/, '')}\n${line}\n`);
}

const env = readEnv();
const id = env.SPOTIFY_CLIENT_ID, secret = env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error('\n✗ Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first (from developer.spotify.com → your app → Settings).\n');
  process.exit(1);
}

const state = randomBytes(12).toString('hex');
const url =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({ response_type: 'code', client_id: id, scope: SCOPES, redirect_uri: REDIRECT, state }).toString();

const server = createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  if (u.pathname !== '/callback') return res.writeHead(404).end();
  const send = (msg) => res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`<body style="font:18px system-ui;padding:40px">${msg}</body>`);
  if (u.searchParams.get('state') !== state) return send('State mismatch — run the command again.');
  const code = u.searchParams.get('code');
  if (!code) return send(`Spotify said: ${u.searchParams.get('error') ?? 'no code'}. Run the command again.`);
  try {
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
    });
    const j = await r.json();
    if (!r.ok || !j.refresh_token) throw new Error(j.error_description || j.error || `HTTP ${r.status}`);
    setEnv('SPOTIFY_REFRESH_TOKEN', j.refresh_token);
    send('✓ Connected. The refresh token was saved to .env.local. You can close this tab.');
    console.log('\n✓ Spotify connected. SPOTIFY_REFRESH_TOKEN saved to .env.local (not printed).');
    console.log('  Next: npm run check:integrations\n');
  } catch (e) {
    send('Token exchange failed — check the client secret and redirect URI, then run again.');
    console.error('\n✗ Token exchange failed:', e.message, '\n');
  } finally {
    setTimeout(() => process.exit(0), 300);
  }
});

server.listen(8888, '127.0.0.1', () => {
  console.log('\nOpen this link, log in to Spotify and approve:\n');
  console.log(url + '\n');
  const opener = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  if (!process.env.NO_OPEN) {
    try { exec(opener, () => {}); } catch { /* could not open a browser; use the printed link */ }
  }
});
