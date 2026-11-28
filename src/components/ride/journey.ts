/* One shared record of the train journey, so a visitor can leave through the window and come back to
   the same seat. Kept in memory for the open tab and in sessionStorage across reloads of a page.

   - progress: the ride's single source of truth, in stops (0 = Vizag, 1 = Work … can be fractional)
   - mode: 'riding' while the visitor is on the train or visiting a stop, 'off' once they step off
   - returning: set by "Return to train" for the next homepage mount to pick up */

import type { StopKey } from '@/data/ride';
import { stops } from '@/data/ride';

const KEY = 'srihari_journey';
const RETURN_KEY = 'srihari_journey_return';

type Saved = { progress: number; mode: 'riding' | 'off' };

let memory: Saved | null = null;
/** false until the first page of this tab load has rendered: a refresh always starts with the intro */
let booted = false;

export function markBooted() {
  booted = true;
}
export function hasBooted() {
  return booted;
}

export function readJourney(): Saved | null {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) memory = JSON.parse(raw) as Saved;
  } catch {}
  return memory;
}

export function saveJourney(next: Partial<Saved>) {
  memory = { progress: 0, mode: 'riding', ...readJourney(), ...next };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(memory));
  } catch {}
}

export function setReturning(stop: StopKey) {
  const i = stops.findIndex((s) => s.key === stop);
  saveJourney({ progress: i, mode: 'riding' });
  try {
    sessionStorage.setItem(RETURN_KEY, stop);
  } catch {}
}

/** read and clear the pending return, if any */
export function takeReturning(): StopKey | null {
  try {
    const v = sessionStorage.getItem(RETURN_KEY) as StopKey | null;
    if (v) sessionStorage.removeItem(RETURN_KEY);
    return v && stops.some((s) => s.key === v) ? v : null;
  } catch {
    return null;
  }
}
export function peekReturning(): StopKey | null {
  try {
    return sessionStorage.getItem(RETURN_KEY) as StopKey | null;
  } catch {
    return null;
  }
}

/* --- the portal overlay, shared between the train (going in) and the pages (coming back) --- */
export type PortalEvent =
  | { type: 'enter'; cover: string }
  | { type: 'return'; stop: StopKey }
  | { type: 'train-ready' }
  /** a page is being left for the train: heavy pages (the cinema's 3D) can stop drawing */
  | { type: 'leaving' };
export const PORTAL_EVENT = 'srihari:portal';
export function emitPortal(e: PortalEvent) {
  window.dispatchEvent(new CustomEvent<PortalEvent>(PORTAL_EVENT, { detail: e }));
}

/** fired by "Board the train again" on the homepage: back into the cabin, no departure board */
export const REBOARD_EVENT = 'srihari:reboard';

/* --- once per visit: the full intro plays on the first homepage load of a browser session;
   refreshes and later loads in the same session open straight on the homepage --- */
export const SEEN_KEY = 'srihari_ride_seen';
export function rideSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
export function markRideSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {}
}
