'use client';

import { useEffect, useState, type RefObject } from 'react';
import { signs } from '@/data/roadtrip';

export type RoadPoint = { x: number; y: number; a: number };
export type RoadModel = {
  width: number;
  roadW: number;
  roadW2: number;
  lane: number;
  startX: number;
  endY: number;
  sample: (y: number) => RoadPoint;
  merge: { wait: RoadPoint; joinY: number } | null;
  /** coarse path for the minimap, and where each kilometre starts */
  path: [number, number][];
  checkpoints: { km: number; y: number }[];
};

type Seg = { kind: 'line'; p0: [number, number]; p1: [number, number] } | { kind: 'curve'; p: [number, number][] };

function bez(p: [number, number][], t: number): [number, number] {
  const u = 1 - t;
  const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
  const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
  return [x, y];
}

function curve(a: [number, number], b: [number, number]): Seg {
  const dy = b[1] - a[1];
  return { kind: 'curve', p: [a, [a[0], a[1] + dy * 0.55], [b[0], b[1] - dy * 0.55], b] };
}

function toD(segs: Seg[]) {
  let d = '';
  segs.forEach((s, i) => {
    const start = s.kind === 'line' ? s.p0 : s.p[0];
    if (i === 0) d += `M${start[0].toFixed(1)},${start[1].toFixed(1)} `;
    if (s.kind === 'line') d += `L${s.p1[0].toFixed(1)},${s.p1[1].toFixed(1)} `;
    else d += `C${s.p[1].join(',')} ${s.p[2].join(',')} ${s.p[3].join(',')} `;
  });
  return d;
}

function sampleSegs(segs: Seg[]) {
  const pts: [number, number][] = [];
  for (const s of segs) {
    if (s.kind === 'line') {
      pts.push(s.p0, s.p1);
    } else {
      for (let i = 0; i <= 40; i++) pts.push(bez(s.p, i / 40));
    }
  }
  return pts.sort((a, b) => a[1] - b[1]);
}

function makeSampler(pts: [number, number][]) {
  return (y: number): RoadPoint => {
    if (y <= pts[0][1]) return { x: pts[0][0], y: pts[0][1], a: 0 };
    const last = pts[pts.length - 1];
    if (y >= last[1]) return { x: last[0], y: last[1], a: 0 };
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid][1] <= y) lo = mid;
      else hi = mid;
    }
    const [x0, y0] = pts[lo];
    const [x1, y1] = pts[hi];
    const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
    const x = x0 + (x1 - x0) * t;
    // heading: angle of travel (down the page), in degrees; 0 = straight down
    const a = (Math.atan2(-(x1 - x0), Math.max(0.0001, y1 - y0)) * 180) / Math.PI;
    return { x, y, a };
  };
}

type Layout = {
  W: number;
  H: number;
  roadW: number;
  roadW2: number;
  main: string;
  wide: string | null;
  side: string | null;
  endY: number;
  endX: number;
  trees: { x: number; y: number; r: number; reel?: boolean }[];
  bands: { top: number; bottom: number }[];
  marquees: { x: number; y: number }[];
  signs: { x: number; y: number; lines: string[]; side: 1 | -1 }[];
  lamps: { x: number; y: number; dir: 1 | -1 }[];
};

/**
 * The winding road. Reads every [data-road] block inside the journey:
 *   data-road="left" | "right"  → road runs beside that block on that side
 *   data-road="end"             → road ends here (destination)
 *   data-merge                  → a side road joins here (where the Car comes in)
 */
export function SunsetRoad({
  journeyRef,
  onModel,
}: {
  journeyRef: RefObject<HTMLDivElement>;
  onModel: (m: RoadModel) => void;
}) {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const el = journeyRef.current;
    if (!el) return;

    const build = () => {
      const W = el.clientWidth;
      const H = el.scrollHeight;
      const mobile = W < 700;
      const roadW = mobile ? 34 : 84;
      const roadW2 = mobile ? 54 : 146;
      const lane = mobile ? 12 : 36;
      const xL = mobile ? 32 : Math.max(150, W * 0.27);
      const xR = mobile ? 48 : W - Math.max(150, W * 0.27);
      const startX = mobile ? 40 : W / 2;
      const blocks = Array.from(el.querySelectorAll<HTMLElement>('[data-road]')).map((b) => ({
        top: b.offsetTop,
        h: b.offsetHeight,
        side: b.dataset.road as 'left' | 'right' | 'end',
        merge: b.hasAttribute('data-merge'),
        cinema: b.dataset.theme === 'cinema',
        id: b.id,
        km: b.dataset.km ? Number(b.dataset.km) : null,
      }));
      if (!blocks.length) return;

      const pre: Seg[] = [];
      const post: Seg[] = [];
      let merged = false;
      const push = (sg: Seg) => (merged ? post : pre).push(sg);
      let cur: [number, number] = [startX, 0];
      let sideD: string | null = null;
      let merge: RoadModel['merge'] = null;
      const trees: Layout['trees'] = [];
      const lamps: Layout['lamps'] = [];
      const bands: Layout['bands'] = [];
      const marquees: Layout['marquees'] = [];
      const signList: Layout['signs'] = [];
      const checkpoints: RoadModel['checkpoints'] = [];
      let endY = H;
      let endX = startX;

      blocks.forEach((b, i) => {
        if (b.side === 'end') {
          endX = mobile ? 40 : W / 2;
          endY = b.top + (mobile ? 40 : 70);
          push(curve(cur, [endX, endY]));
          cur = [endX, endY];
          return;
        }
        const x = b.side === 'left' ? xL : xR;
        const top: [number, number] = [x, b.top + (i === 0 ? (mobile ? 120 : 230) : mobile ? 40 : 90)];
        const bot: [number, number] = [x, b.top + b.h + (mobile ? 0 : 10)];
        const gapMid = (cur[1] + top[1]) / 2;
        push(curve(cur, top));
        if (b.merge) {
          const jy = top[1] + (mobile ? 110 : 250);
          push({ kind: 'line', p0: top, p1: [x, jy] });
          merged = true;
          push({ kind: 'line', p0: [x, jy], p1: bot });
        } else {
          push({ kind: 'line', p0: top, p1: bot });
        }

        if (b.km !== null) checkpoints.push({ km: b.km, y: top[1] });
        if (b.cinema) {
          // the road turns into a cinema boulevard: warm marquee light spills over this stretch
          bands.push({ top: b.top - (mobile ? 40 : 120), bottom: b.top + b.h + (mobile ? 30 : 60) });
          marquees.push({ x, y: top[1] + (mobile ? 6 : 10) });
        }
        const sign = signs[b.id];
        if (sign && !mobile) {
          // a witty road sign on the outer verge, at the start of the straight
          const side: 1 | -1 = b.side === 'left' ? -1 : 1;
          signList.push({ x: x + side * (roadW / 2 + 96), y: top[1] + 60, lines: sign.split('|'), side });
        }
        if (!mobile) {
          // trees in the bend (film reels once the cinema stretch begins), clear of the road
          const midX = (cur[0] + x) / 2;
          const reel = b.cinema;
          trees.push({ x: midX - (W * 0.22 + 30), y: gapMid - 30, r: 26, reel });
          trees.push({ x: midX + (W * 0.22 + 40), y: gapMid + 20, r: 34, reel });
          trees.push({ x: midX + (W * 0.22 - 30), y: gapMid - 60, r: 18, reel });
          // street lamps on the inner edge of the straight
          const dir: 1 | -1 = b.side === 'left' ? 1 : -1;
          const half = (merged ? roadW2 : roadW) / 2;
          for (let y = top[1] + 180; y < bot[1] - 60; y += 300) lamps.push({ x: x + dir * (half + 16), y, dir });
        }

        if (b.merge) {
          // side road joining from the outer edge
          const outer = b.side === 'left' ? -60 : W + 60;
          const edge = b.side === 'left' ? -1 : 1;
          const joinY = top[1] + (mobile ? 110 : 250);
          const s0: [number, number] = [outer, joinY - (mobile ? 150 : 230)];
          const c1: [number, number] = [(outer + x) / 2, s0[1]];
          const xe = x + edge * (roadW2 - roadW) / 2;
          const c2: [number, number] = [xe, joinY - (mobile ? 80 : 130)];
          const s3: [number, number] = [xe, joinY];
          sideD = `M${s0.join(',')} C${c1.join(',')} ${c2.join(',')} ${s3.join(',')}`;
          const t = 0.55;
          const [wx, wy] = bez([s0, c1, c2, s3], t);
          const [nx, ny] = bez([s0, c1, c2, s3], t + 0.02);
          merge = {
            wait: { x: wx, y: wy, a: (Math.atan2(-(nx - wx), ny - wy) * 180) / Math.PI },
            joinY,
          };
        }
        cur = bot;
      });

      const pts = sampleSegs([...pre, ...post]);
      const path: [number, number][] = [];
      for (let yy = 0; yy <= endY; yy += 40) {
        const p = makeSampler(pts)(yy);
        path.push([Math.round(p.x), Math.round(p.y)]);
      }
      const model: RoadModel = { width: W, roadW, roadW2, lane, startX, endY, sample: makeSampler(pts), merge, path, checkpoints };
      onModel(model);
      setLayout({ W, H, roadW, roadW2, main: toD(pre), wide: post.length ? toD(post) : null, side: sideD, endY, endX, trees, lamps, bands, marquees, signs: signList });
    };

    build();
    const ro = new ResizeObserver(() => build());
    ro.observe(el);
    window.addEventListener('load', build);
    return () => {
      ro.disconnect();
      window.removeEventListener('load', build);
    };
  }, [journeyRef, onModel]);

  if (!layout) return null;
  const { W, H, roadW, roadW2, main, wide, side, endX, endY, trees, lamps, bands, marquees, signs: roadSigns } = layout;
  const mobile = W < 700;
  const mw = (wide ? roadW2 : roadW) + (mobile ? 18 : 40);

  const Road = ({ d, w = roadW }: { d: string; w?: number }) => (
    <g fill="none" strokeLinejoin="round">
      <path d={d} stroke="rgba(45,25,27,.22)" strokeWidth={w + 30} transform="translate(0 10)" />
      <path d={d} stroke="#3a2f30" strokeWidth={w + (mobile ? 8 : 14)} />
      <path d={d} stroke="#e9d9c8" strokeWidth={w + (mobile ? 8 : 14)} strokeDasharray={mobile ? '9 9' : '14 14'} />
      <path d={d} stroke="#2a2526" strokeWidth={w} />
      <path d={d} stroke="#F8F5EE" strokeWidth={w - (mobile ? 6 : 12)} />
      <path d={d} stroke="#2a2526" strokeWidth={w - (mobile ? 9 : 17)} />
      <path d={d} stroke="#F8F5EE" strokeWidth={mobile ? 2 : 3.5} strokeDasharray={mobile ? '14 18' : '26 34'} className="rt-road-dash" />
    </g>
  );

  return (
    <svg className="rt-roadlayer" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <radialGradient id="tr-canopy" cx=".38" cy=".35" r=".7">
          <stop offset="0" stopColor="#c98b62" />
          <stop offset=".55" stopColor="#7d5a46" />
          <stop offset="1" stopColor="#4f3a35" />
        </radialGradient>
        <linearGradient id="cinema-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1411" stopOpacity="0" />
          <stop offset=".12" stopColor="#1a1411" stopOpacity="1" />
          <stop offset=".88" stopColor="#1a1411" stopOpacity="1" />
          <stop offset="1" stopColor="#1a1411" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cinema-spot" cx=".5" cy=".3" r=".6">
          <stop offset="0" stopColor="#EA795B" stopOpacity=".28" />
          <stop offset="1" stopColor="#EA795B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lamp-glow" r=".5">
          <stop offset="0" stopColor="#ffd59a" stopOpacity=".95" />
          <stop offset="1" stopColor="#FAA356" stopOpacity="0" />
        </radialGradient>
      </defs>
      {bands.map((b, i) => (
        <g key={`b${i}`}>
          <rect x={0} y={b.top} width={W} height={b.bottom - b.top} fill="url(#cinema-spot)" />
        </g>
      ))}
      {trees.map((t, i) =>
        t.reel ? (
          <g key={`t${i}`} transform={`translate(${t.x} ${t.y})`} opacity=".9">
            <circle r={t.r} fill="#2b2420" stroke="#c9a14a" strokeWidth={2} />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <circle key={a} r={t.r * 0.2} cx={Math.cos((a * Math.PI) / 180) * t.r * 0.58} cy={Math.sin((a * Math.PI) / 180) * t.r * 0.58} fill="#1a1411" />
            ))}
            <circle r={t.r * 0.14} fill="#c9a14a" />
          </g>
        ) : (
        <g key={`t${i}`}>
          <ellipse cx={t.x + t.r * 0.55} cy={t.y + t.r * 0.6} rx={t.r * 1.15} ry={t.r * 0.8} fill="rgba(45,25,27,.22)" />
          <circle cx={t.x} cy={t.y} r={t.r} fill="url(#tr-canopy)" />
          <circle cx={t.x - t.r * 0.3} cy={t.y - t.r * 0.3} r={t.r * 0.45} fill="#ffc785" opacity=".45" />
        </g>
        ),
      )}
      {side && <Road d={side} />}
      {wide && <Road d={wide} w={roadW2} />}
      <Road d={main} />
      {/* end of road: barrier */}
      <g transform={`translate(${endX} ${endY})`}>
        <rect x={-((wide ? roadW2 : roadW) / 2 + 12)} y={-2} width={(wide ? roadW2 : roadW) + 24} height={10} rx={3} fill="#fff" stroke="#9c2c21" />
        {Array.from({ length: Math.ceil(((wide ? roadW2 : roadW) + 24) / 16) }, (_, i) => (
          <rect key={i} x={-((wide ? roadW2 : roadW) / 2 + 12) + i * 16} y={-2} width={8} height={10} fill="#c0392b" />
        ))}
      </g>
      {roadSigns.map((g, i) => {
        const w = 150;
        const h = 22 + g.lines.length * 17;
        return (
          <g key={`s${i}`} transform={`translate(${g.x - w / 2} ${g.y})`}>
            <ellipse cx={w / 2 + 10} cy={h + 54} rx={w * 0.42} ry={7} fill="rgba(45,25,27,.22)" />
            <rect x={w / 2 - 34} y={h - 2} width={5} height={56} fill="#4a3d3c" />
            <rect x={w / 2 + 29} y={h - 2} width={5} height={56} fill="#4a3d3c" />
            <rect width={w} height={h} rx={6} fill="#1f4d3a" stroke="#F8F5EE" strokeWidth={2.5} />
            {g.lines.map((l, k) => (
              <text
                key={k}
                x={w / 2}
                y={22 + k * 17}
                textAnchor="middle"
                fill={k === 0 ? '#D7FF31' : '#F8F5EE'}
                fontSize={k === 0 ? 12 : 12.5}
                fontWeight={k === 0 ? 800 : 600}
                letterSpacing={k === 0 ? '.14em' : '.02em'}
                fontFamily="'Anek Latin Variable', system-ui, sans-serif"
              >
                {k === 0 ? l.toUpperCase() : l}
              </text>
            ))}
          </g>
        );
      })}
      {marquees.map((m, i) => (
        <g key={`m${i}`} transform={`translate(${m.x} ${m.y})`} className="rt-marquee">
          <rect x={-mw / 2 - 8} y={-6} width={8} height={30} rx={2} fill="#3b2f26" />
          <rect x={mw / 2} y={-6} width={8} height={30} rx={2} fill="#3b2f26" />
          <rect x={-mw / 2 - 4} y={-2} width={mw + 8} height={mobile ? 16 : 24} rx={3} fill="#7a1f17" stroke="#c9a14a" strokeWidth={2} />
          {Array.from({ length: Math.floor((mw + 4) / (mobile ? 7 : 9)) }, (_, k) => (
            <circle key={k} cx={-mw / 2 + 2 + k * (mobile ? 7 : 9)} cy={mobile ? 1 : 2} r={mobile ? 1.4 : 1.8} fill="#ffe27a" className="rt-bulb" style={{ animationDelay: `${(k % 4) * 0.25}s` }} />
          ))}
          {!mobile && (
            <text x={0} y={17} textAnchor="middle" fill="#ffe9b0" fontSize={10} fontWeight={700} letterSpacing=".22em" fontFamily="system-ui, sans-serif">
              NOW SHOWING
            </text>
          )}
        </g>
      ))}
      {lamps.map((l, i) => (
        <g key={`l${i}`} transform={`translate(${l.x} ${l.y})`}>
          <circle r={34} fill="url(#lamp-glow)" transform={`translate(${-l.dir * 18} 0)`} />
          <path d={`M0 0 H${-l.dir * 18}`} stroke="#4a463d" strokeWidth={3} strokeLinecap="round" />
          <circle r={5} fill="#4a463d" />
          <ellipse cx={-l.dir * 20} cy={0} rx={5} ry={3.5} fill="#fff3b0" stroke="#4a463d" strokeWidth={1.2} />
        </g>
      ))}
    </svg>
  );
}
