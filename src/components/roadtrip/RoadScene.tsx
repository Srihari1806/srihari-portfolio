/**
 * Hero scene: a coastal highway at sunset (palette from the Vizag beach reference).
 * Layered sky → clouds → far and near hills → sea with sun glitter → dusk ground → charcoal road.
 */

const W = 1440;
const H = 900;
const HORIZON = 520;
const TOP = { l: 704, r: 736 };
const BOTTOM = { l: 380, r: 1060 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const edgeX = (side: 'l' | 'r', t: number) => lerp(TOP[side], BOTTOM[side], t);
const y = (t: number) => lerp(HORIZON, H, t);

// Perspective spacing: segments get longer toward the viewer.
const N = 26;
const ts = Array.from({ length: N + 1 }, (_, i) => Math.pow(i / N, 2.2));

function kerbs(side: 'l' | 'r') {
  const out: { d: string; c: string }[] = [];
  for (let i = 0; i < N; i++) {
    const t0 = ts[i];
    const t1 = ts[i + 1];
    const w0 = lerp(1.2, 18, t0);
    const w1 = lerp(1.2, 18, t1);
    const dir = side === 'l' ? -1 : 1;
    const x0 = edgeX(side, t0);
    const x1 = edgeX(side, t1);
    out.push({
      d: `M${x0},${y(t0)} L${x1},${y(t1)} L${x1 + dir * w1},${y(t1)} L${x0 + dir * w0},${y(t0)} Z`,
      c: i % 2 ? '#e9d9c8' : '#3a2f30',
    });
  }
  return out;
}

function dashes() {
  const out: string[] = [];
  for (let i = 1; i < N; i += 2) {
    const t0 = ts[i];
    const t1 = ts[i + 1];
    const cx0 = (edgeX('l', t0) + edgeX('r', t0)) / 2;
    const cx1 = (edgeX('l', t1) + edgeX('r', t1)) / 2;
    const w0 = lerp(0.6, 14, t0);
    const w1 = lerp(0.6, 14, t1);
    out.push(`M${cx0 - w0},${y(t0)} L${cx1 - w1},${y(t1)} L${cx1 + w1},${y(t1)} L${cx0 + w0},${y(t0)} Z`);
  }
  return out;
}

function edgeLine(side: 'l' | 'r') {
  const inset = side === 'l' ? 1 : -1;
  return [0, 1].map((t) => [edgeX(side, t) + inset * lerp(0.8, 22, t) * 1.3, y(t)]);
}

const KERB_L = kerbs('l');
const KERB_R = kerbs('r');
const DASHES = dashes();

/** Palm silhouette, base at (x, base). */
function Palm({ x, base, s, lean = 1 }: { x: number; base: number; s: number; lean?: number }) {
  const tip: [number, number] = [lean * 14, -120];
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`} fill="#3a2427">
      <path d={`M-3 0 Q${lean * 6} -60 ${tip[0] - 2} ${tip[1]} L${tip[0] + 2} ${tip[1]} Q${lean * 10} -60 3 0 Z`} />
      {[-150, -115, -70, -35, 10, 40].map((a, i) => (
        <path
          key={i}
          d="M0 0 q24 -14 52 6 q-26 -6 -52 0 Z"
          transform={`translate(${tip[0]} ${tip[1]}) rotate(${a}) scale(${1 - i * 0.04})`}
        />
      ))}
    </g>
  );
}

function Cloud({ x, yy, w, o = 1, lit = '#f6b487' }: { x: number; yy: number; w: number; o?: number; lit?: string }) {
  return (
    <g opacity={o}>
      <ellipse cx={x} cy={yy} rx={w} ry={w * 0.06} fill="#8d5156" />
      <ellipse cx={x - w * 0.12} cy={yy + w * 0.035} rx={w * 0.78} ry={w * 0.03} fill={lit} />
      <ellipse cx={x + w * 0.35} cy={yy - w * 0.04} rx={w * 0.45} ry={w * 0.04} fill="#a35f5c" />
    </g>
  );
}

export function RoadScene() {
  const el = edgeLine('l');
  const er = edgeLine('r');
  return (
    <svg className="rt-scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#503232" />
          <stop offset=".28" stopColor="#69454F" />
          <stop offset=".55" stopColor="#9B524C" />
          <stop offset=".8" stopColor="#EA795B" />
          <stop offset=".95" stopColor="#FAA356" />
          <stop offset="1" stopColor="#ffc785" />
        </linearGradient>
        <radialGradient id="rt-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff1cf" />
          <stop offset=".22" stopColor="#ffd59a" />
          <stop offset=".5" stopColor="#FAA356" stopOpacity=".55" />
          <stop offset="1" stopColor="#EA795B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rt-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9876a" />
          <stop offset="1" stopColor="#8a4f52" />
        </linearGradient>
        <linearGradient id="rt-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e5a52" />
          <stop offset=".4" stopColor="#7a4a48" />
          <stop offset="1" stopColor="#5a3537" />
        </linearGradient>
        <linearGradient id="rt-asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b5455" />
          <stop offset=".22" stopColor="#3b3132" />
          <stop offset="1" stopColor="#2a2526" />
        </linearGradient>
        <linearGradient id="rt-road-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FAA356" stopOpacity=".45" />
          <stop offset=".35" stopColor="#FAA356" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* sky, sun, clouds */}
      <rect width={W} height={HORIZON + 2} fill="url(#rt-sky)" />
      <circle cx={760} cy={HORIZON - 4} r={260} fill="url(#rt-sun)" />
      <circle cx={760} cy={HORIZON - 4} r={40} fill="#fff1cf" opacity=".95" />
      <Cloud x={1120} yy={170} w={260} o={0.55} />
      <Cloud x={260} yy={238} w={220} o={0.6} />
      <Cloud x={980} yy={300} w={180} o={0.75} lit="#ffc38f" />
      <Cloud x={520} yy={360} w={300} o={0.7} lit="#ffc38f" />
      <Cloud x={1300} yy={392} w={160} o={0.6} lit="#ffd09f" />
      <g fill="none" stroke="#3a2427" strokeWidth={1.6} strokeLinecap="round" opacity=".75">
        <path d="M1046 254 q5 -5 10 0 q5 -5 10 0" />
        <path d="M1022 278 q4 -4 8 0 q4 -4 8 0" />
        <path d="M1072 288 q3 -3 6 0 q3 -3 6 0" />
      </g>

      {/* far hills (left) and the sea (right) */}
      <path
        d={`M0 ${HORIZON - 40} C120 ${HORIZON - 96} 210 ${HORIZON - 104} 300 ${HORIZON - 70} C380 ${HORIZON - 44} 440 ${HORIZON - 60} 520 ${HORIZON - 34} C590 ${HORIZON - 16} 640 ${HORIZON - 8} 700 ${HORIZON} L0 ${HORIZON} Z`}
        fill="#7f4a52"
        opacity=".85"
      />
      <path
        d={`M0 ${HORIZON - 12} C90 ${HORIZON - 52} 170 ${HORIZON - 58} 250 ${HORIZON - 30} C320 ${HORIZON - 8} 420 ${HORIZON - 24} 520 ${HORIZON - 4} L560 ${HORIZON + 2} L0 ${HORIZON + 2} Z`}
        fill="#5d3a42"
      />
      <rect x={740} y={HORIZON - 4} width={W - 740} height={44} fill="url(#rt-sea)" />
      <g stroke="#ffe1b0" strokeLinecap="round" opacity=".85">
        {[
          [770, 2, 46],
          [796, 8, 64],
          [830, 15, 30],
          [760, 21, 80],
          [880, 27, 40],
          [800, 33, 96],
        ].map(([x, dy, w], i) => (
          <line key={i} x1={x} y1={HORIZON + dy} x2={x + w} y2={HORIZON + dy} strokeWidth={i % 2 ? 1.4 : 2} />
        ))}
      </g>
      {/* lighthouse on the far headland */}
      <g transform={`translate(1290 ${HORIZON - 4})`} fill="#4a2c32">
        <path d="M-60 4 C-40 -16 10 -22 70 -8 L70 4 Z" />
        <path d="M-4 -14 L4 -14 L3 -44 L-3 -44 Z" />
        <rect x={-5} y={-50} width={10} height={6} />
        <circle cx={0} cy={-47} r={2.5} fill="#ffe1b0" />
      </g>

      {/* dusk ground */}
      <rect y={HORIZON + 38} width={W} height={H - HORIZON - 38} fill="url(#rt-ground)" />
      <rect y={HORIZON} width={740} height={40} fill="#86524f" />
      <path d={`M740 ${HORIZON + 40} L${W} ${HORIZON + 40} L${W} ${HORIZON + 52} L740 ${HORIZON + 46} Z`} fill="#e9b48a" opacity=".55" />

      {/* telegraph poles */}
      <g stroke="#3a2427" strokeWidth={1.8}>
        {[0.04, 0.1, 0.2, 0.36].map((t, i) => {
          const x = edgeX('l', t) - lerp(30, 300, t);
          const yy = y(t);
          const h = lerp(14, 120, t);
          return (
            <g key={i}>
              <line x1={x} y1={yy} x2={x} y2={yy - h} />
              <line x1={x - h * 0.12} y1={yy - h * 0.92} x2={x + h * 0.12} y2={yy - h * 0.92} />
            </g>
          );
        })}
      </g>
      <Palm x={1250} base={HORIZON + 150} s={1.15} lean={1} />
      <Palm x={1330} base={HORIZON + 120} s={0.9} lean={-1} />
      <Palm x={1080} base={HORIZON + 52} s={0.45} />
      <Palm x={150} base={HORIZON + 170} s={1} lean={-1} />

      {/* road */}
      <path d={`M${TOP.l},${HORIZON} L${TOP.r},${HORIZON} L${BOTTOM.r},${H} L${BOTTOM.l},${H} Z`} fill="url(#rt-asphalt)" />
      <path d={`M${TOP.l},${HORIZON} L${TOP.r},${HORIZON} L${BOTTOM.r},${H} L${BOTTOM.l},${H} Z`} fill="url(#rt-road-glow)" />
      {KERB_L.map((k, i) => (
        <path key={`l${i}`} d={k.d} fill={k.c} />
      ))}
      {KERB_R.map((k, i) => (
        <path key={`r${i}`} d={k.d} fill={k.c} />
      ))}
      <path d={`M${el[0][0]},${el[0][1]} L${el[1][0]},${el[1][1]}`} stroke="#F8F5EE" strokeWidth={3} />
      <path d={`M${er[0][0]},${er[0][1]} L${er[1][0]},${er[1][1]}`} stroke="#F8F5EE" strokeWidth={3} />
      {DASHES.map((d, i) => (
        <path key={i} d={d} fill="#F8F5EE" />
      ))}
    </svg>
  );
}
