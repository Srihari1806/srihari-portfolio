/* Where the camera sits in the cabin picture, shared by the ride and the portal overlay so the
   window's place on screen is computed the same way by both. */

import { CABIN, windowGlass } from '@/data/ride';

export type Cam = { s: number; x: number; y: number };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const WIN_CX = (windowGlass[0] + windowGlass[2]) / 2;
export const WIN_CY = (windowGlass[1] + windowGlass[3]) / 2;
export const WIN_W = windowGlass[2] - windowGlass[0];
export const WIN_H = windowGlass[3] - windowGlass[1];

/** at rest: phones fit the window to the width, wide screens fill with the cabin */
export function restingCam(vw: number, vh: number): Cam {
  const cover = Math.max(vw / CABIN.w, vh / CABIN.h);
  const fitWindow = vw / (WIN_W + 150);
  const s = Math.min(cover, fitWindow);
  const w = CABIN.w * s;
  const h = CABIN.h * s;
  let x = vw / 2 - WIN_CX * s;
  x = w >= vw ? clamp(x, vw - w, 0) : (vw - w) / 2;
  const y = h >= vh ? clamp(vh / 2 - WIN_CY * s, vh - h, 0) : Math.max(56, (vh - h) * 0.3);
  return { s, x, y };
}

/** the window glass filling the screen (and a bit more: the brass frame passes beyond the edges) */
export function windowCam(vw: number, vh: number, over = 1.04): Cam {
  const s = Math.max(vw / WIN_W, vh / WIN_H) * over;
  return { s, x: vw / 2 - WIN_CX * s, y: vh / 2 - WIN_CY * s };
}

/** the window glass's rectangle on screen for a camera */
export function glassRect(c: Cam) {
  return { left: c.x + windowGlass[0] * c.s, top: c.y + windowGlass[1] * c.s, width: WIN_W * c.s, height: WIN_H * c.s };
}
