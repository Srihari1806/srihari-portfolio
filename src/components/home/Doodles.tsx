import type { SVGProps } from 'react';

/** Hand-drawn lime underline (used under "imagination." and "CricField"). */
export function ScribbleUnderline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 260 14" fill="none" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <path
        d="M3 9.5C46 6.2 92 4.6 140 4.9c40 .3 79 1.9 117 4.4"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Curved hand-drawn arrow pointing down-left toward the mascot. */
export function HandArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 56" fill="none" aria-hidden="true" {...props}>
      <path
        d="M44 4C30 8 16 18 10 32c-2.4 5.6-3.4 11.4-3.6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M1.5 42.5 6.5 51l6-7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small looping arrow after "also into". */
export function LoopArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2 9c6-7 17-8 28-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M25 3.5 31 8.5l-6.5 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Outline cricket ball icon (lucide has no cricket ball). */
export function CricketBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M5.6 18.4 18.4 5.6" />
      <path d="M7.4 19.6 19.6 7.4" strokeDasharray="1.4 1.6" />
      <path d="M4.4 16.6 16.6 4.4" strokeDasharray="1.4 1.6" />
    </svg>
  );
}

/** Laptop-with-code icon used for CSE / Software. */
export function LaptopCodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="4" width="17" height="12" rx="1.2" />
      <path d="M1.5 19.5h21l-1.2-2.5H2.7z" />
      <path d="m10 8.3-2 1.9 2 1.9M14 8.3l2 1.9-2 1.9M12.6 7.6l-1.2 5.2" />
    </svg>
  );
}

/** Classic pixel dinosaur for the footer, drawn on an 18×17 grid. */
export function PixelDino(props: SVGProps<SVGSVGElement>) {
  // Each row: [y, x-start, length]
  const runs: [number, number, number][] = [
    [0, 9, 8], [1, 8, 10], [2, 8, 2], [2, 11, 7], [3, 8, 10], [4, 8, 10], [5, 8, 5],
    [6, 8, 8], [7, 0, 1], [7, 7, 6], [8, 0, 1], [8, 6, 9], [9, 0, 2], [9, 5, 8], [9, 15, 1],
    [10, 0, 13], [11, 1, 11], [12, 2, 9], [13, 3, 7], [14, 4, 3], [14, 8, 2],
    [15, 4, 2], [15, 9, 1], [16, 4, 3], [16, 9, 2],
  ];
  return (
    <svg viewBox="0 0 18 17" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      {runs.map(([y, x, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Mini sparkline arrow for the CricField mock metrics panel. */
export function Sparkline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 52 26" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2 23 13 13l7 5 11-11 7 5L49 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M41 3h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Three short lime strokes radiating out (the "spark" doodle). */
export function Sparks(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden="true" {...props}>
      <path d="M8 4 5 14M18 9l-9 9M24 20l-12 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Generic "now playing on Spotify" mark: green disc with three arcs. */
export function SpotifyMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="12" fill="#1ED760" />
      <path
        d="M6 9.2c4.2-1.3 8.6-.9 12.2 1M6.8 12.6c3.4-1 7-.7 10 .9M7.6 15.8c2.7-.7 5.4-.5 7.7.7"
        stroke="#0b130e"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Sound-wave arcs used for Music in the mobile tab bar. */
export function SoundArcsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M3 10.5a13 13 0 0 1 18 0M6 14a8.6 8.6 0 0 1 12 0M9.2 17.4a4 4 0 0 1 5.6 0" />
    </svg>
  );
}

/** Pixel space-invader for Memes. */
export function InvaderIcon(props: SVGProps<SVGSVGElement>) {
  const rows = [
    '..X.....X..',
    '...X...X...',
    '..XXXXXXX..',
    '.XX.XXX.XX.',
    'XXXXXXXXXXX',
    'X.XXXXXXX.X',
    'X.X.....X.X',
    '...XX.XX...',
  ];
  return (
    <svg viewBox="0 0 11 8" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      {rows.flatMap((r, y) =>
        r.split('').map((c, x) => (c === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  );
}
