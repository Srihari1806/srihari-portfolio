/* The world outside the train window: one continuous strip of land from the Vizag coast to an
   evening terrace, drawn as four depth layers (far hills and sea, skylines, the main street, and
   the trackside poles). Everything here is static drawing; RideCabin moves the layers. All units are
   window pixels: the window is 624 × 386, and the main layer's x is the world position. */

import { memo, type ReactNode } from 'react';
import { stops } from '@/data/ride';

export const WIN = { w: 624, h: 386 } as const;
/** how fast each layer slides relative to the main street (1) */
export const SPEED = { far: 0.07, mid: 0.28, main: 1, near: 1.9 } as const;
const last = stops[stops.length - 1];
/** camera range on the main layer: from the first landmark centred, to the last */
export const CAM_MIN = stops[0].x - WIN.w / 2;
export const CAM_MAX = last.x - WIN.w / 2;
const span = (speed: number) => Math.ceil(WIN.w + (CAM_MAX + 260) * speed + 260);
/** where a layer's point must sit so it is centred in the window when the camera is at world x */
const on = (speed: number, worldX: number) => WIN.w / 2 + (worldX - WIN.w / 2) * speed;
const X = Object.fromEntries(stops.map((s) => [s.key, s.x])) as Record<(typeof stops)[number]['key'], number>;

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- far: hills, sea, the sun, ships ---------------- */
const Far = memo(function Far() {
  const w = span(SPEED.far);
  const lh = on(SPEED.far, X.vizag) + 150;
  return (
    <svg className="rw-layer rw-far" width={w} height={WIN.h} viewBox={`0 0 ${w} ${WIN.h}`} aria-hidden="true">
      <defs>
        <radialGradient id="rw-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff1c9" />
          <stop offset="0.45" stopColor="#ffc27a" />
          <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rw-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rw-sea-top)" />
          <stop offset="1" stopColor="var(--rw-sea-bot)" />
        </linearGradient>
      </defs>
      <circle cx={on(SPEED.far, X.vizag) - 120} cy={214} r={70} fill="url(#rw-sun)" className="rw-sun" />
      <circle cx={on(SPEED.far, X.vizag) - 120} cy={214} r={19} fill="#fff0c8" className="rw-sun" />
      {/* far ridge, hazy */}
      <path
        className="rw-haze2"
        d={`M0 232 C120 214 210 220 300 206 S470 196 560 214 S720 200 820 208 S980 222 1080 204 S${w - 60} 214 ${w} 210 V250 H0Z`}
      />
      <path className="rw-haze1" d={`M0 240 C90 232 160 236 240 226 S400 230 520 222 S700 236 860 226 S1040 234 ${w} 228 V252 H0Z`} />
      {/* the lighthouse headland across the bay */}
      <path className="rw-haze1" d={`M${lh - 70} 246 C${lh - 40} 226 ${lh - 18} 216 ${lh} 214 C${lh + 30} 214 ${lh + 50} 228 ${lh + 90} 246Z`} />
      <path className="rw-haze1" d={`M${lh - 3} 214v-14h6v14M${lh - 4} 200h8v-4h-8z`} />
      <circle cx={lh} cy={197} r={2.4} className="rw-beacon" />
      {/* the sea */}
      <rect x={0} y={238} width={w} height={70} fill="url(#rw-sea)" />
      <g className="rw-glints">
        {Array.from({ length: Math.ceil(w / 23) }, (_, i) => (
          <rect key={i} x={i * 23 + ((i * 37) % 11)} y={246 + ((i * 53) % 46)} width={6 + ((i * 7) % 12)} height={1.4} rx={0.7} />
        ))}
      </g>
      <g className="rw-ship">
        <path d={`M${lh - 210} 262h34l-4 5h-27z`} />
        <path d={`M${lh - 198} 262v-8h10v8`} />
        <circle cx={lh - 194} cy={257} r={1.2} className="rw-lamp" />
      </g>
    </svg>
  );
});

/* ---------------- mid: skylines and landmarks on the horizon ---------------- */
function Skyline({ x0, x1, seed, base = 250, tall = 70, lit = 0.35 }: { x0: number; x1: number; seed: number; base?: number; tall?: number; lit?: number }) {
  const r = rng(seed);
  const out: ReactNode[] = [];
  let x = x0;
  let k = 0;
  while (x < x1) {
    const bw = 10 + r() * 22;
    const bh = 14 + r() * r() * tall;
    out.push(<rect key={`b${k}`} x={x} y={base - bh} width={bw} height={bh + 4} />);
    for (let wy = base - bh + 4; wy < base - 4; wy += 6)
      for (let wx = x + 2.5; wx < x + bw - 3; wx += 5) if (r() < lit) out.push(<rect key={`w${k}-${wx | 0}-${wy | 0}`} x={wx} y={wy} width={1.8} height={2.2} className="rw-win" />);
    x += bw + r() * 4;
    k++;
  }
  return <g className="rw-sky">{out}</g>;
}

const Mid = memo(function Mid() {
  const w = span(SPEED.mid);
  const viz = on(SPEED.mid, X.vizag);
  const cin = on(SPEED.mid, X.cinema);
  const hum = on(SPEED.mid, X.human);
  const lab = on(SPEED.mid, X.lab);
  const wrk = on(SPEED.mid, X.work);
  return (
    <svg className="rw-layer rw-mid" width={w} height={WIN.h} viewBox={`0 0 ${w} ${WIN.h}`} aria-hidden="true">
      {/* Vizag across the water, and Dolphin's Nose with its lighthouse */}
      <Skyline x0={viz - 330} x1={viz - 60} seed={3} base={252} tall={46} lit={0.3} />
      <path className="rw-mid-hill" d={`M${viz + 40} 256 C${viz + 90} 214 ${viz + 140} 196 ${viz + 190} 194 C${viz + 250} 194 ${viz + 290} 222 ${viz + 360} 256Z`} />
      <g className="rw-mid-hill">
        <path d={`M${viz + 184} 196l2-30h8l2 30z`} />
        <path d={`M${viz + 183} 166h14v-5h-14z`} />
      </g>
      <path className="rw-beam" d={`M${viz + 190} 163 L${viz + 60} 148 L${viz + 60} 176Z`} />
      <circle cx={viz + 190} cy={163} r={2.6} className="rw-beacon" />
      {/* inland: a long ridge, the highway climbing over it */}
      <path className="rw-mid-hill" d={`M${viz + 380} 258 C${viz + 520} 224 ${wrk - 160} 222 ${wrk - 60} 232 S${wrk + 160} 220 ${wrk + 260} 236 S${cin - 200} 226 ${cin - 120} 240 V262 H${viz + 380}Z`} />
      <path className="rw-road-far" d={`M${wrk - 6} 262 C${wrk - 2} 248 ${wrk + 10} 240 ${wrk + 40} 232`} />
      {/* the old city: low skyline and Charminar */}
      <Skyline x0={cin - 260} x1={cin + 250} seed={11} base={256} tall={54} lit={0.45} />
      <g className="rw-sky rw-charminar" transform={`translate(${cin + 96} 256)`}>
        <path d="M-30 0V-34H30V0Z" />
        <path d="M-22 0v-22a8 10 0 0 1 16 0V0M6 0v-22a8 10 0 0 1 16 0V0" className="rw-arch" />
        <path d="M-34 -34h68v-5h-68z" />
        {[-34, 26].map((mx) => (
          <g key={mx}>
            <path d={`M${mx} 0v-62h8V0z`} />
            <path d={`M${mx - 1} -40h10M${mx - 1} -50h10`} className="rw-ring" />
            <path d={`M${mx} -62c0-6 8-6 8 0z`} />
            <path d={`M${mx + 4} -66v-5`} className="rw-ring" />
          </g>
        ))}
        <path d="M-12 -39c0-9 24-9 24 0z" />
      </g>
      {/* suburbs and hills beyond the lab */}
      <path className="rw-mid-hill" d={`M${cin + 260} 262 C${lab - 160} 230 ${lab - 60} 224 ${lab + 40} 232 S${lab + 220} 218 ${hum - 200} 236 V262Z`} />
      <Skyline x0={lab - 150} x1={lab + 140} seed={21} base={258} tall={26} lit={0.3} />
      {/* evening Vizag from the terrace: towers, and Kailasagiri lit up on its hill */}
      <path className="rw-mid-hill" d={`M${hum + 60} 262 C${hum + 120} 220 ${hum + 190} 202 ${hum + 260} 204 S${hum + 380} 230 ${w} 236 V262Z`} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={hum + 150 + i * 12} cy={214 - Math.sin(i / 3) * 6 + i * 0.6} r={1.2} className="rw-lamp" />
      ))}
      <Skyline x0={hum - 330} x1={hum + 70} seed={34} base={252} tall={84} lit={0.55} />
    </svg>
  );
});

/* ---------------- main: the street outside, landmark by landmark ---------------- */
function Tree({ x, y = 296, s = 1, kind = 0 }: { x: number; y?: number; s?: number; kind?: number }) {
  if (kind === 2)
    // coconut palm
    return (
      <g className="rw-tree" transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0 0C2-28 6-52 2-78" className="rw-trunk" />
        <path d="M2-78c-14-6-30-2-38 8 12-6 24-6 36-4M2-78c10-10 28-12 40-4-12-2-26 0-38 6M2-78c-4-12-16-20-28-20 10 4 18 10 24 20M2-78c8-8 20-12 30-8-10 2-18 6-26 12M2-78c2 10-2 22-10 30 4-10 6-20 6-28" />
      </g>
    );
  return (
    <g className="rw-tree" transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2 0v-26h4V0z" className="rw-trunk" />
      {kind === 1 ? <path d="M0-72C16-60 22-40 14-26H-14C-22-40-16-60 0-72Z" /> : <path d="M-22-30c-8-14 4-30 18-28 4-12 22-14 28-2 14 0 20 16 12 26 4 12-8 20-20 16-8 8-24 8-30-2-12 2-16-6-8-10z" />}
    </g>
  );
}

function Lamp({ x, y = 300, h = 58 }: { x: number; y?: number; h?: number }) {
  return (
    <g>
      <path d={`M${x} ${y}v-${h}c0-6 4-8 12-8`} className="rw-pole" />
      <circle cx={x + 13} cy={y - h - 6} r={2.6} className="rw-lamp" />
      <circle cx={x + 13} cy={y - h - 6} r={12} className="rw-glow" />
    </g>
  );
}

function Fillers({ x0, x1, seed, y = 296 }: { x0: number; x1: number; seed: number; y?: number }) {
  // the stretches between stops: walls, shops, trees and poles, never the same twice
  const r = rng(seed);
  const out: ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const pick = r();
    if (pick < 0.32) out.push(<Tree key={i} x={x + 20} y={y} s={0.8 + r() * 0.5} kind={r() < 0.3 ? 2 : r() < 0.5 ? 1 : 0} />);
    else if (pick < 0.62) {
      const bw = 50 + r() * 60;
      const bh = 34 + r() * 46;
      const c = ['#7d5559', '#8d6a5b', '#6c5a6e', '#94705a', '#5f4c5d'][Math.floor(r() * 5)];
      out.push(
        <g key={i}>
          <rect x={x} y={y - bh} width={bw} height={bh} fill={c} className="rw-house" />
          <rect x={x - 3} y={y - bh - 4} width={bw + 6} height={5} className="rw-ledge" />
          {r() < 0.6 ? <rect x={x + bw * 0.25} y={y - 20} width={bw * 0.5} height={20} className="rw-shutter" /> : null}
          {r() < 0.7 ? <rect x={x + 8} y={y - bh + 10} width={10} height={9} className="rw-win3" /> : null}
          {r() < 0.5 ? <rect x={x + bw - 18} y={y - bh + 10} width={10} height={9} className="rw-win3" /> : null}
          {r() < 0.4 ? <rect x={x + 6} y={y - bh - 16} width={16} height={12} rx={2} className="rw-tank" /> : null}
        </g>,
      );
      x += bw - 40;
    } else if (pick < 0.8) {
      out.push(<path key={i} d={`M${x} ${y}v-22h${60 + r() * 50}v22`} className="rw-wall" />);
    } else out.push(<Lamp key={i} x={x + 10} y={y} h={50 + r() * 14} />);
    x += 46 + r() * 44;
    i++;
  }
  return <g>{out}</g>;
}

function Billboard({ x, img, name, line }: { x: number; img: string; name: string; line: string }) {
  const w = 150;
  const h = 86;
  const top = 108;
  return (
    <g>
      <path d={`M${x - 40} ${top + h + 14}V292M${x + 40} ${top + h + 14}V292`} className="rw-pole rw-pole--thick" />
      <path d={`M${x - 48} ${top + h + 14}h96`} className="rw-pole" />
      <rect x={x - w / 2 - 5} y={top - 5} width={w + 10} height={h + 30} rx={3} className="rw-board" />
      <clipPath id={`rw-bb-${name}`}>
        <rect x={x - w / 2} y={top} width={w} height={h} rx={1.5} />
      </clipPath>
      <image href={img} x={x - w / 2} y={top} width={w} height={h} preserveAspectRatio="xMidYMin slice" clipPath={`url(#rw-bb-${name})`} />
      <rect x={x - w / 2} y={top + h} width={w} height={20} className="rw-board-strip" />
      <text x={x - w / 2 + 6} y={top + h + 14} className="rw-board-name">
        {name}
      </text>
      <text x={x + w / 2 - 6} y={top + h + 14} className="rw-board-line" textAnchor="end">
        {line}
      </text>
      {[-44, 44].map((dx) => (
        <g key={dx}>
          <path d={`M${x + dx} ${top - 5}v-6l${dx > 0 ? -8 : 8} -4`} className="rw-pole" />
          <path d={`M${x + dx + (dx > 0 ? -8 : 8)} ${top - 15}L${x + dx - 30} ${top + 40}L${x + dx + 30} ${top + 40}Z`} className="rw-spot" />
        </g>
      ))}
    </g>
  );
}

function Theatre({ x }: { x: number }) {
  const l = x - 170;
  return (
    <g className="rw-theatre">
      <defs>
        <linearGradient id="rw-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a8" />
          <stop offset="1" stopColor="#f0a35a" />
        </linearGradient>
      </defs>
      {/* the building: art-deco steps, a long façade, the vertical sign */}
      <path d={`M${l + 40} 128V104h40V92h180v12h40v24`} className="rw-th-top" />
      <rect x={l} y={128} width={340} height={172} className="rw-th-wall" />
      <path d={`M${l} 150h340M${l} 286h340`} className="rw-th-band" />
      <rect x={l + 8} y={58} width={40} height={198} rx={3} className="rw-th-sign" />
      {'CINEMA'.split('').map((c, i) => (
        <text key={i} x={l + 28} y={88 + i * 30} className="rw-th-signtxt" textAnchor="middle">
          {c}
        </text>
      ))}
      {/* the marquee, bulbs chasing round it */}
      <rect x={l + 70} y={160} width={250} height={44} rx={3} className="rw-th-marquee" />
      <text x={l + 195} y={191} className="rw-th-name" textAnchor="middle">
        CINEMA
      </text>
      <g className="rw-bulbs">
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={`t${i}`} cx={l + 76 + i * 9.5} cy={164} r={1.7} className={i % 2 ? 'b1' : 'b2'} />
        ))}
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={`b${i}`} cx={l + 76 + i * 9.5} cy={200} r={1.7} className={i % 2 ? 'b2' : 'b1'} />
        ))}
      </g>
      {/* posters either side */}
      {[
        [l + 62, '#c8503e', '#f6c56b'],
        [l + 98, '#2f4f6e', '#e9a86a'],
        [l + 274, '#6a3b6e', '#f2b5a0'],
        [l + 304, '#3e6b4a', '#f4d27a'],
      ].map(([px, a, b], i) => (
        <g key={i}>
          <rect x={px as number} y={214} width={26} height={38} rx={1} fill={a as string} className="rw-poster" />
          <circle cx={(px as number) + 13} cy={228} r={7} fill={b as string} opacity={0.85} />
          <rect x={(px as number) + 4} y={242} width={18} height={2.4} fill={b as string} opacity={0.8} />
        </g>
      ))}
      {/* canopy, entrance and the ticket windows */}
      <path d={`M${l + 128} 222h136l10 10H${l + 118}z`} className="rw-th-canopy" />
      <rect x={l + 160} y={234} width={72} height={66} className="rw-th-door" fill="url(#rw-door)" />
      <path d={`M${l + 196} 234v66M${l + 160} 252h72`} className="rw-th-frame" />
      <rect x={l + 160} y={234} width={72} height={66} className="rw-th-inside" />
      {[l + 128, l + 240].map((tx) => (
        <g key={tx}>
          <rect x={tx} y={246} width={24} height={20} rx={2} fill="url(#rw-door)" />
          <path d={`M${tx + 6} 246v20M${tx + 12} 246v20M${tx + 18} 246v20`} className="rw-th-grill" />
          <text x={tx + 12} y={243} className="rw-th-tix" textAnchor="middle">
            TICKETS
          </text>
        </g>
      ))}
      <path d={`M${l + 150} 300h92l8 8H${l + 142}z`} className="rw-carpet" />
      <path d={`M${l + 118} 300v-14M${l + 140} 300v-14M${l + 252} 300v-14M${l + 274} 300v-14M${l + 118} 290h22M${l + 252} 290h22`} className="rw-rail" />
    </g>
  );
}

function Workshop({ x }: { x: number }) {
  const l = x - 160;
  return (
    <g className="rw-lab">
      <path d={`M${l} 154l50-30v30l50-30v30l50-30v30l50-30v30l50-30v30l70-0`} className="rw-lab-roof" />
      <rect x={l} y={154} width={320} height={146} className="rw-lab-wall" />
      <rect x={l + 50} y={160} width={190} height={18} rx={2} className="rw-lab-sign" />
      <text x={l + 145} y={173} className="rw-lab-signtxt" textAnchor="middle">
        ELECTRONICS LAB
      </text>
      {/* through the big window: the bench */}
      <rect x={l + 30} y={188} width={230} height={80} className="rw-lab-glass" />
      <rect x={l + 30} y={188} width={230} height={80} className="rw-lab-room" />
      <g>
        <rect x={l + 40} y={196} width={64} height={34} rx={2} className="rw-lab-peg" />
        {[
          [l + 46, 201, 18, 11],
          [l + 70, 203, 26, 9],
          [l + 50, 216, 14, 10],
          [l + 72, 216, 22, 9],
        ].map(([a, b, c, d], i) => (
          <rect key={i} x={a} y={b} width={c} height={d} rx={1} className="rw-pcb" />
        ))}
        <rect x={l + 118} y={200} width={54} height={40} rx={3} className="rw-scope" />
        <rect x={l + 122} y={204} width={36} height={28} rx={1.5} className="rw-scope-screen" />
        <path d={`M${l + 122} 218 q4.5-9 9 0 t9 0 t9 0 t9 0`} className="rw-wave" />
        <path d={`M${l + 162} 208h6M${l + 162} 214h6M${l + 162} 220h6`} className="rw-knob" />
        <rect x={l + 184} y={198} width={46} height={32} rx={2} className="rw-monitor" />
        <path d={`M${l + 189} 205h22M${l + 189} 210h30M${l + 189} 215h16M${l + 189} 220h26`} className="rw-code" />
        <path d={`M${l + 205} 230v8`} className="rw-pole" />
        <path d={`M${l + 238} 214l12-12v6`} className="rw-pole" />
        <path d={`M${l + 250} 202l-14 30h-22z`} className="rw-labcone" />
        <rect x={l + 30} y={240} width={230} height={6} className="rw-bench" />
        <path d={`M${l + 140} 240v-10l6-2`} className="rw-iron" />
        <path d={`M${l + 146} 226c2-4-2-6 0-10`} className="rw-smoke" />
      </g>
      <path d={`M${l + 30} 188h230v80H${l + 30}zM${l + 107} 188v80M${l + 184} 188v80`} className="rw-lab-mullion" />
      <g transform={`translate(${l + 282} 160) rotate(5)`}>
        <path d="M-14 0l-8 8M14 0l8 8" className="rw-pole" />
        <rect x={-30} y={6} width={52} height={14} rx={2} className="rw-lab-tag" />
        <text x={-4} y={16} className="rw-lab-tagtxt" textAnchor="middle">
          setting up
        </text>
      </g>
      <rect x={l + 278} y={222} width={28} height={78} className="rw-lab-door" />
      <circle cx={l + 300} cy={262} r={1.6} className="rw-lamp" />
      <path d={`M${l - 20} 300v-60h12v60`} className="rw-pole" />
      <rect x={l - 30} y={232} width={32} height={22} rx={2} className="rw-transformer" />
    </g>
  );
}

function House({ x }: { x: number }) {
  const l = x - 130;
  return (
    <g className="rw-home">
      <rect x={l} y={206} width={240} height={94} className="rw-home-wall" />
      <rect x={l + 18} y={146} width={196} height={60} className="rw-home-wall rw-home-wall--up" />
      <path d={`M${l - 6} 206h252v6H${l - 6}z M${l + 12} 146h208v-5H${l + 12}z`} className="rw-ledge" />
      {/* terrace: parapet, plants, a chair, a guitar, string lights */}
      <path d={`M${l + 12} 141v-20h208v20`} className="rw-parapet" />
      <path d={`M${l + 12} 128h208`} className="rw-pole" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${l + 22 + i * 17} 141v-13`} className="rw-pole" />
      ))}
      <path d={`M${l + 12} 100 Q${l + 70} 114 ${l + 116} 104 T${l + 220} 102`} className="rw-string" />
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const px = l + 12 + t * 208;
        const py = 100 + Math.sin(t * Math.PI * 2) * 6 + 4 * Math.sin(t * Math.PI);
        return <circle key={i} cx={px} cy={py + 2} r={1.9} className={`rw-fairy ${i % 3 === 0 ? 'f1' : i % 3 === 1 ? 'f2' : 'f3'}`} />;
      })}
      {[l + 24, l + 48, l + 186, l + 204].map((px, i) => (
        <g key={px}>
          <path d={`M${px - 6} 121h12l-2 10h-8z`} className="rw-pot" />
          <path d={i % 2 ? `M${px} 121c-8-10-4-18 0-22 4 6 6 14 0 22M${px} 121c6-6 12-8 14-6-4 2-8 4-14 6` : `M${px} 121c-10-4-12-12-6-16 2 6 4 10 6 16M${px} 121c8-6 10-14 4-18-2 6-4 12-4 18`} className="rw-leaf" />
        </g>
      ))}
      <path d={`M${l + 138} 121v-14h14v14M${l + 136} 113h18`} className="rw-chair" />
      <g transform={`translate(${l + 168} 121) rotate(-14)`} className="rw-guitar">
        <ellipse cx={0} cy={-6} rx={6} ry={7} />
        <ellipse cx={0} cy={-14} rx={4.4} ry={4.6} />
        <path d="M-1 -18v-16h2v16z" />
      </g>
      {/* lit windows */}
      {[
        [l + 34, 160],
        [l + 92, 160],
        [l + 150, 160],
        [l + 24, 226],
        [l + 82, 226],
      ].map(([wx, wy]) => (
        <g key={`${wx}-${wy}`}>
          <rect x={wx} y={wy} width={40} height={28} rx={1.5} className="rw-home-win" />
          <path d={`M${wx + 20} ${wy}v28M${wx} ${wy + 14}h40`} className="rw-home-mull" />
          <path d={`M${wx} ${wy}h12v28c-6-8-10-18-12-28z`} className="rw-curtain" />
        </g>
      ))}
      <rect x={l + 140} y={234} width={28} height={66} rx={1.5} className="rw-home-door" />
      <circle cx={l + 154} cy={228} r={2} className="rw-lamp" />
      <circle cx={l + 154} cy={228} r={14} className="rw-glow" />
      {/* the outside staircase up to the terrace */}
      <path d={`M${l + 240} 300l60-0 M${l + 300} 300V230`} className="rw-pole" />
      <path d={Array.from({ length: 9 }, (_, i) => `M${l + 296 - i * 9} ${300 - i * 9 - 9}h11v9`).join(' ') + ` M${l + 220} 141 L${l + 300} 221`} className="rw-stairs" />
      <path d={`M${l + 226} 128L${l + 306} 210`} className="rw-pole" />
      {/* a cricket bat by the steps, and the tulsi pot */}
      <path d={`M${l + 312} 300l4-26 4 1-3 25zM${l + 316} 274l1-8`} className="rw-bat" />
      <path d={`M${l + 196} 300v-14h16v14zM${l + 204} 286c-6-8-2-14 0-16 2 4 4 10 0 16`} className="rw-tulsi" />
      <path d={`M${l - 40} 300v-26h36v26M${l - 40} 274l18-10 18 10`} className="rw-gate" />
    </g>
  );
}

const Main = memo(function Main() {
  const w = span(SPEED.main);
  const work = X.work;
  return (
    <svg className="rw-layer rw-main" width={w} height={WIN.h} viewBox={`0 0 ${w} ${WIN.h}`} aria-hidden="true">
      <defs>
        <linearGradient id="rw-ground" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2="0">
          <stop offset="0" stopColor="#5c3e46" />
          <stop offset="0.3" stopColor="#56393f" />
          <stop offset="0.55" stopColor="#47323e" />
          <stop offset="0.78" stopColor="#382a38" />
          <stop offset="1" stopColor="#2a2030" />
        </linearGradient>
      </defs>
      {/* ground everywhere inland; the beach and the sea stay open at Vizag */}
      <path d={`M1080 300 C1140 292 1180 290 1240 290 H${w} V${WIN.h} H1080Z`} fill="url(#rw-ground)" />
      {/* --- Vizag: sand, the sea wall, the beach road, the Kursura submarine on the sand --- */}
      <path d="M0 296 Q300 286 620 292 T1240 292 V306 H0Z" className="rw-sand" />
      <g className="rw-sub">
        <path d={`M${X.vizag - 120} 292 C${X.vizag - 110} 270 ${X.vizag - 40} 264 ${X.vizag + 60} 264 L${X.vizag + 118} 268 C${X.vizag + 130} 272 ${X.vizag + 132} 284 ${X.vizag + 118} 292 Z`} />
        <path d={`M${X.vizag - 10} 264v-18h34l6 18`} />
        <path d={`M${X.vizag + 4} 246v-8M${X.vizag + 14} 246v-12`} className="rw-pole" />
        <path d={`M${X.vizag - 100} 292h220v4h-220z`} className="rw-plinth" />
      </g>
      <rect x={0} y={306} width={1260} height={14} className="rw-seawall" />
      <path d={Array.from({ length: 64 }, (_, i) => `M${i * 20} 306v-8`).join(' ') + ' M0 300h1260'} className="rw-railing" />
      {Array.from({ length: 13 }, (_, i) => (
        <Lamp key={i} x={40 + i * 92} y={306} h={44} />
      ))}
      {[150, 300, 600, 760, 940].map((px, i) => (
        <Tree key={px} x={px} y={300} s={0.95 + (i % 2) * 0.2} kind={2} />
      ))}
      <rect x={0} y={320} width={w} height={30} className="rw-road" />
      <path d={`M0 335h${w}`} className="rw-dash" />
      {/* --- inland to the highway --- */}
      <Fillers x0={1280} x1={1700} seed={5} />
      {/* --- Work: the highway alongside the line, a curve climbing away, three billboards --- */}
      <rect x={1640} y={288} width={820} height={8} className="rw-barrier-shadow" />
      <path d={`M1640 288h820`} className="rw-barrier" />
      <path d={Array.from({ length: 42 }, (_, i) => `M${1644 + i * 20} 288v8`).join(' ')} className="rw-pole" />
      <path d={`M${work - 120} 320 C${work - 60} 300 ${work - 18} 292 ${work - 8} 262 C${work - 2} 246 ${work + 2} 240 ${work + 10} 232 L${work + 18} 232 C${work + 14} 244 ${work + 16} 262 ${work + 36} 288 C${work + 50} 302 ${work + 90} 312 ${work + 140} 320Z`} className="rw-road rw-road--curve" />
      <path d={`M${work + 13} 236 C${work + 10} 252 ${work + 10} 272 ${work + 26} 300`} className="rw-dash rw-dash--curve" />
      <Billboard x={work - 170} img="/projects/cricfield.jpg" name="CricField" line="what I analyse" />
      <Billboard x={work} img="/projects/hiremap.jpg" name="HireMap" line="what I build" />
      <Billboard x={work + 170} img="/projects/cinephile.jpg" name="Cinephile" line="what I love" />
      <g className="rw-milestone">
        <path d={`M${work + 300} 318v-26a10 10 0 0 1 20 0v26z`} />
        <path d={`M${work + 300} 300h20`} className="rw-milestone-band" />
        <text x={work + 310} y={312} textAnchor="middle" className="rw-milestone-txt">
          4km
        </text>
      </g>
      {[1660, 1700, 1760, work + 270, work + 340, work + 400, work + 450].map((px, i) => (
        <Tree key={px} x={px} y={286} s={0.9 + (i % 3) * 0.15} kind={i % 3 === 2 ? 1 : 0} />
      ))}
      <g className="rw-car rw-car--a">
        <path d={`M${work - 400} 318h46l-6-10h-26l-8 10z`} />
        <circle cx={work - 352} cy={314} r={2} className="rw-head" />
      </g>
      <g className="rw-car rw-car--b">
        <path d={`M${work + 160} 330h52l-8-12h-30l-10 12z`} />
        <circle cx={work + 162} cy={326} r={1.8} className="rw-tail" />
      </g>
      {/* --- into town --- */}
      <Fillers x0={2470} x1={3000} seed={8} />
      {/* --- Cinema: a city street and the single-screen theatre --- */}
      <Street x0={3000} x1={3420} seed={13} />
      <Theatre x={X.cinema} />
      <Street x0={3780} x1={4300} seed={17} />
      {[3060, 3200, 3340, 3860, 4000, 4150, 4290].map((px) => (
        <Lamp key={px} x={px} y={304} h={56} />
      ))}
      <Auto x={3330} />
      <Auto x={3880} flip />
      {/* --- out to the edge of town, the workshop --- */}
      <Fillers x0={4320} x1={4960} seed={29} />
      <Workshop x={X.lab} />
      <Fillers x0={5340} x1={6420} seed={41} />
      {/* --- a quiet residential street, home --- */}
      <Tree x={6440} y={300} s={1.2} kind={2} />
      <Tree x={6520} y={300} s={1.05} kind={2} />
      <House x={X.human} />
      <Tree x={6990} y={300} s={1.15} kind={2} />
      <Fillers x0={7030} x1={w} seed={55} />
      <path d={`M1260 304h${w}`} className="rw-kerb" />
    </svg>
  );
});

function Street({ x0, x1, seed }: { x0: number; x1: number; seed: number }) {
  // a row of two- and three-storey shops: signboards, balconies, tanks on the roofs
  const r = rng(seed);
  const out: ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const bw = Math.min(x1 - x, 64 + r() * 60);
    if (bw < 30) break;
    const top = 112 + r() * 70;
    const c = ['#7a4e52', '#8a6a5a', '#6a5a6e', '#9a6a54', '#5e4a5a', '#80605e'][Math.floor(r() * 6)];
    const sign = ['#e9b44c', '#d9584a', '#5aa9a0', '#e58b5a', '#c7d36a'][Math.floor(r() * 5)];
    out.push(
      <g key={i}>
        <rect x={x} y={top} width={bw} height={300 - top} fill={c} className="rw-house" />
        <rect x={x - 2} y={top - 4} width={bw + 4} height={5} className="rw-ledge" />
        {Array.from({ length: Math.floor((262 - top) / 30) }, (_, row) =>
          Array.from({ length: Math.max(1, Math.floor(bw / 26)) }, (_, col) => (
            <rect key={`${row}-${col}`} x={x + 7 + col * 26} y={top + 10 + row * 30} width={13} height={15} className={r() < 0.55 ? 'rw-win3' : 'rw-win-off'} />
          )),
        )}
        {r() < 0.6 ? <path d={`M${x + 4} ${top + 40}h${bw - 8}v4h-${bw - 8}z`} className="rw-balcony" /> : null}
        <rect x={x + 4} y={262} width={bw - 8} height={12} rx={1.5} fill={sign} className="rw-shopsign" />
        <rect x={x + 8} y={276} width={bw - 16} height={24} className={r() < 0.6 ? 'rw-shop-lit' : 'rw-shutter'} />
        {r() < 0.5 ? <rect x={x + 8} y={top - 14} width={16} height={11} rx={2} className="rw-tank" /> : null}
      </g>,
    );
    x += bw + 2;
    i++;
  }
  return (
    <g>
      {out}
      <rect x={x0} y={300} width={x1 - x0} height={6} className="rw-footpath" />
    </g>
  );
}

function Auto({ x, flip = false }: { x: number; flip?: boolean }) {
  return (
    <g className="rw-auto" transform={`translate(${x} 318) scale(${flip ? -1 : 1} 1)`}>
      <path d="M-18 0v-14c0-8 6-12 16-12h8c6 0 10 6 12 12l2 14z" className="rw-auto-body" />
      <path d="M-18 -14h22" className="rw-auto-roof" />
      <circle cx={-12} cy={0} r={4} className="rw-wheel" />
      <circle cx={14} cy={0} r={4} className="rw-wheel" />
    </g>
  );
}

/* ---------------- near: catenary poles, wires, bushes along the track ---------------- */
const Near = memo(function Near() {
  const w = span(SPEED.near);
  const r = rng(77);
  const poles: ReactNode[] = [];
  // where each stop's view sits on this layer: keep poles out of the middle of the window there
  const clear = stops.map((s) => (s.x - WIN.w / 2) * SPEED.near + WIN.w / 2);
  for (let x = 120; x < w; x += 360 + Math.floor(r() * 60)) {
    const blocked = clear.find((c) => Math.abs(x - c) < 230);
    if (blocked !== undefined) x = blocked + 236;
    poles.push(
      <g key={x}>
        <path d={`M${x} ${WIN.h + 4}V-4`} className="rw-near-pole" />
        <path d={`M${x} 24h-70M${x} 40l-56-16`} className="rw-near-arm" />
      </g>,
    );
    if (r() < 0.6) poles.push(<path key={`b${x}`} d={`M${x + 140} ${WIN.h}c-6-34 22-40 30-26 8-20 36-10 30 10 14-4 22 10 14 16z`} className="rw-bush" />);
  }
  return (
    <svg className="rw-layer rw-near" width={w} height={WIN.h} viewBox={`0 0 ${w} ${WIN.h}`} aria-hidden="true">
      <path d={`M0 22h${w}M0 30h${w}`} className="rw-wire" />
      {poles}
      <path d={`M0 ${WIN.h - 10}h${w}`} className="rw-near-edge" />
    </svg>
  );
});

/** The whole outside, in depth order. RideCabin positions each layer by the camera. */
export function World() {
  return (
    <>
      <div className="rw-sky-fill" aria-hidden="true">
        <div className="rw-stars" />
      </div>
      <Far />
      <Mid />
      <Main />
      <Near />
    </>
  );
}
