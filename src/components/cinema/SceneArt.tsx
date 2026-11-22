/**
 * "Srihari Talkies" — one continuous single-screen theatre, drawn as inked SVG in the TFI room palette.
 * Scene units: the hall is TOTAL × H; everything interactive is positioned in the same units (Scene.tsx).
 */
import { hall } from '@/data/cinemaHall';

export const H = 1000;
export const FLOOR = 830;
export const X = { entrance: 0, counter: 1400, corridor: 3000, auditorium: 4800, booth: 6600, credits: 8200, end: 9600 } as const;
export const TOTAL = X.end;

const INK = '#24100d';
const ink = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { ...ink, strokeWidth: 2.5 };

const range = (a: number, b: number, step: number) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);

/* ---------- shared interior pieces ---------- */
function Interior({ x0, x1, wall = 'wall', wains = '#9b4630', ceiling = '#3a1311', bulbs = true }: { x0: number; x1: number; wall?: string; wains?: string; ceiling?: string; bulbs?: boolean }) {
  return (
    <g>
      <rect x={x0} y={0} width={x1 - x0} height={FLOOR} fill={`url(#${wall})`} />
      <rect x={x0} y={0} width={x1 - x0} height={118} fill={ceiling} />
      <rect x={x0} y={112} width={x1 - x0} height={16} fill="#d98c3a" {...thin} />
      <rect x={x0} y={600} width={x1 - x0} height={FLOOR - 600} fill={wains} />
      <path d={`M${x0} 600 H${x1}`} {...ink} />
      <path d={`M${x0} 614 H${x1}`} {...thin} opacity=".6" />
      {range(x0 + 60, x1 - 60, 160).map((x) => (
        <rect key={x} x={x} y={636} width={120} height={166} rx={4} fill="none" {...thin} opacity=".45" />
      ))}
      {bulbs &&
        range(x0 + 80, x1 - 40, 200).map((x) => (
          <g key={x}>
            <circle cx={x} cy={60} r={70} fill="url(#bulb-glow)" />
            <path d={`M${x} 0 V44`} {...thin} />
            <circle cx={x} cy={56} r={11} fill="#ffe6a8" {...thin} />
          </g>
        ))}
    </g>
  );
}

function TileFloor({ x0, x1, a = '#b85c3c', b = '#a24e33' }: { x0: number; x1: number; a?: string; b?: string }) {
  return (
    <g>
      <rect x={x0} y={FLOOR} width={x1 - x0} height={H - FLOOR} fill={a} />
      {range(x0, x1 - 1, 90).map((x, i) =>
        [0, 1].map((r) => (i + r) % 2 === 0 && <rect key={`${x}-${r}`} x={x} y={FLOOR + r * 85} width={90} height={85} fill={b} />),
      )}
      <path d={`M${x0} ${FLOOR} H${x1}`} {...ink} />
    </g>
  );
}

function Arch({ x, label }: { x: number; label?: string }) {
  return (
    <g>
      <rect x={x - 46} y={128} width={92} height={FLOOR - 128} fill="#6a2a1c" {...ink} />
      <rect x={x - 58} y={128} width={116} height={40} fill="#d98c3a" {...ink} />
      <rect x={x - 58} y={FLOOR - 40} width={116} height={40} fill="#8b3a22" {...ink} />
      <path d={`M${x - 30} 190 V${FLOOR - 60} M${x + 30} 190 V${FLOOR - 60}`} {...thin} opacity=".5" />
      {label && (
        <text x={x} y={156} textAnchor="middle" className="cn-t cn-t--tiny" fill={INK}>
          {label}
        </text>
      )}
    </g>
  );
}

/* ---------- 1. the street & facade ---------- */
function Entrance() {
  const bulbs = [...range(350, 1110, 38).map((x) => [x, 200]), ...range(350, 1110, 38).map((x) => [x, 322]), ...range(238, 284, 46).map((y) => [340, y]), ...range(238, 284, 46).map((y) => [1120, y])];
  return (
    <g>
      <rect x={0} y={0} width={1400} height={FLOOR} fill="url(#dusk)" />
      {[
        [80, 60],
        [210, 130],
        [1240, 90],
        [1330, 40],
        [600, 40],
        [940, 70],
        [40, 210],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={2.4} fill="#ffe6c4" opacity=".85" />
      ))}
      <circle cx={1290} cy={150} r={34} fill="#fff1cf" opacity=".9" />
      {/* building */}
      <path d="M120 830 V210 H200 V160 H1260 V210 H1340 V830 Z" fill="#c96a3f" {...ink} />
      <path d="M120 250 H1340" {...thin} opacity=".5" />
      {range(150, 1310, 64).map((x) => (
        <path key={x} d={`M${x} 520 V${x % 128 === 22 ? 830 : 830}`} {...thin} opacity=".14" />
      ))}
      {/* marquee */}
      <rect x={330} y={186} width={800} height={150} rx={10} fill="#2b1210" {...ink} />
      {bulbs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7} className={`cn-bulb cn-bulb--${i % 3}`} fill="#ffd23f" stroke={INK} strokeWidth={2} />
      ))}
      <text x={730} y={276} textAnchor="middle" className="cn-t cn-t--marquee">
        {hall.name.toUpperCase()}
      </text>
      <text x={730} y={318} textAnchor="middle" className="cn-t cn-t--telugu">
        {hall.telugu}
      </text>
      <g transform="translate(1040 214)">
        <rect width={70} height={34} rx={6} fill="#d6362a" {...thin} />
        <text x={35} y={24} textAnchor="middle" className="cn-t cn-t--badge">
          70MM
        </text>
      </g>
      {/* now showing letter board */}
      <rect x={420} y={356} width={620} height={128} fill="#f7ecd6" {...ink} />
      {range(380, 470, 30).map((y) => (
        <path key={y} d={`M430 ${y} H1030`} stroke="#c9b48e" strokeWidth={1.5} />
      ))}
      <text x={730} y={404} textAnchor="middle" className="cn-t cn-t--board">
        NOW SHOWING
      </text>
      <text x={730} y={452} textAnchor="middle" className="cn-t cn-t--letters">
        {hall.nowShowing[0].toUpperCase()} · {hall.nowShowing[1].toUpperCase()}
      </text>
      {/* doors */}
      {[500, 760].map((x) => (
        <g key={x}>
          <rect x={x} y={540} width={200} height={290} fill="#5a2216" {...ink} />
          {[0, 100].map((dx) => (
            <g key={dx}>
              <rect x={x + dx + 8} y={552} width={84} height={270} fill="#7a2e1e" {...thin} />
              <circle cx={x + dx + 50} cy={620} r={24} fill="#ffcf7a" {...thin} />
              <path d={`M${x + dx + 50} 596 V644 M${x + dx + 26} 620 H${x + dx + 74}`} stroke={INK} strokeWidth={2} opacity=".5" />
              <rect x={x + dx + (dx ? 12 : 72)} y={690} width={8} height={40} rx={3} fill="#d98c3a" {...thin} />
            </g>
          ))}
        </g>
      ))}
      {/* A/C board + framed posters */}
      <g transform="translate(180 520)">
        <rect width={170} height={70} rx={8} fill="#f7ecd6" {...ink} />
        <text x={85} y={32} textAnchor="middle" className="cn-t cn-t--small">
          A/C · AIR COOLED
        </text>
        <text x={85} y={56} textAnchor="middle" className="cn-t cn-t--tiny" fill="#9b4630">
          {hall.tagline.split('·')[2]?.trim()}
        </text>
      </g>
      {[200, 1100].map((x, i) => (
        <g key={x}>
          <rect x={x} y={612} width={150} height={200} fill="#2b1210" {...ink} />
          <rect x={x + 12} y={624} width={126} height={176} fill={i ? 'url(#poster-b)' : 'url(#poster-a)'} {...thin} />
          <circle cx={x + 75} cy={690} r={22} fill="#ffe1a8" opacity=".9" />
          <path d={`M${x + 52} 800 C${x + 60} 740 ${x + 90} 740 ${x + 98} 800 Z`} fill="#2b1210" />
          <circle cx={x + 75} cy={726} r={12} fill="#2b1210" />
        </g>
      ))}
      {/* street lamp + pavement */}
      <path d="M1370 830 V300 C1370 270 1340 260 1320 270" fill="none" {...ink} strokeWidth={8} />
      <circle cx={1318} cy={284} r={80} fill="url(#bulb-glow)" />
      <path d="M1300 272 h36 l-6 18 h-24 Z" fill="#ffe6a8" {...thin} />
      <rect x={0} y={FLOOR} width={1400} height={H - FLOOR} fill="#6b4a3c" />
      {range(0, 1400, 140).map((x) => (
        <path key={x} d={`M${x} ${FLOOR} L${x - 30} ${H}`} {...thin} opacity=".35" />
      ))}
      <path d={`M0 ${FLOOR} H1400`} {...ink} />
      <rect x={480} y={FLOOR} width={500} height={24} fill="#8b3a22" {...thin} />
    </g>
  );
}

/* ---------- 2. ticket counter ---------- */
function Counter() {
  const x = X.counter;
  return (
    <g>
      <Interior x0={x} x1={X.corridor} />
      <TileFloor x0={x} x1={X.corridor} />
      {/* wall clock */}
      <g transform="translate(1980 210)">
        <circle r={46} fill="#f7ecd6" {...ink} />
        <path d="M0 0 V-28 M0 0 L20 10" {...ink} />
        <circle r={4} fill={INK} />
      </g>
      {/* booth */}
      <rect x={2060} y={270} width={640} height={560} fill="#8b3a22" {...ink} />
      <rect x={2090} y={300} width={580} height={60} fill="#2b1210" {...ink} />
      <text x={2380} y={343} textAnchor="middle" className="cn-t cn-t--sign">
        TICKETS
      </text>
      <rect x={2180} y={390} width={400} height={190} fill="url(#window-glow)" {...ink} />
      <path d="M2290 520 C2290 470 2330 452 2380 452 C2430 452 2470 470 2470 520 L2470 580 L2290 580 Z" fill="#3a1714" />
      <circle cx={2380} cy={428} r={34} fill="#3a1714" />
      {range(2210, 2560, 30).map((bx) => (
        <path key={bx} d={`M${bx} 392 V578`} stroke={INK} strokeWidth={3} />
      ))}
      <rect x={2160} y={578} width={440} height={26} fill="#d98c3a" {...ink} />
      <rect x={2320} y={560} width={120} height={20} fill="#f7ecd6" {...thin} />
      {range(2090, 2650, 140).map((px) => (
        <rect key={px} x={px} y={640} width={110} height={160} rx={4} fill="#7a2e1e" {...thin} />
      ))}
      {/* price board */}
      <g transform="translate(2760 250)">
        <rect width={200} height={260} fill="#2b1210" {...ink} />
        <text x={100} y={40} textAnchor="middle" className="cn-t cn-t--small" fill="#ffd23f">
          RATES
        </text>
        {[
          ['BALCONY', '₹200'],
          ['FIRST CLASS', '₹150'],
          ['SECOND', '₹100'],
          ['FLOOR', '₹50'],
        ].map(([k, v], i) => (
          <g key={k} transform={`translate(0 ${84 + i * 46})`}>
            <text x={18} className="cn-t cn-t--rate">
              {k}
            </text>
            <text x={182} textAnchor="end" className="cn-t cn-t--rate">
              {v}
            </text>
          </g>
        ))}
      </g>
      {/* queue rails */}
      {[1950, 2280, 2610, 2900].map((qx, i, a) => (
        <g key={qx}>
          {i < a.length - 1 && <path d={`M${qx} 742 C${qx + 80} 800 ${a[i + 1] - 80} 800 ${a[i + 1]} 742`} fill="none" stroke="#9e1b1b" strokeWidth={12} strokeLinecap="round" />}
          <rect x={qx - 8} y={730} width={16} height={180} rx={6} fill="#d9a441" {...thin} />
          <circle cx={qx} cy={728} r={14} fill="#f2c45a" {...thin} />
          <ellipse cx={qx} cy={912} rx={34} ry={10} fill="#d9a441" {...thin} />
        </g>
      ))}
      {/* house full board */}
      <g transform="translate(2830 540)">
        <path d="M10 290 L50 0 H150 L190 290" fill="none" {...ink} strokeWidth={6} />
        <rect x={30} y={30} width={140} height={90} fill="#f7ecd6" {...ink} />
        <text x={100} y={68} textAnchor="middle" className="cn-t cn-t--small" fill="#b3261e">
          HOUSE
        </text>
        <text x={100} y={104} textAnchor="middle" className="cn-t cn-t--small" fill="#b3261e">
          FULL
        </text>
      </g>
      {/* nail for the calendar */}
      <circle cx={1700} cy={196} r={7} fill="#d9a441" {...thin} />
    </g>
  );
}

/* ---------- 3. poster corridor ---------- */
export const POSTERS = [3090, 3340, 3590, 3840, 4090, 4340].map((x) => ({ x, y: 240, w: 210, h: 315 }));
function Corridor() {
  const x0 = X.corridor;
  return (
    <g>
      <Interior x0={x0} x1={X.auditorium} wall="wall2" bulbs={false} />
      <TileFloor x0={x0} x1={X.auditorium} />
      {/* carpet runner */}
      <rect x={x0} y={872} width={X.auditorium - x0} height={92} fill="#8e1c1c" />
      <path d={`M${x0} 880 H${X.auditorium} M${x0} 956 H${X.auditorium}`} stroke="#e0a43c" strokeWidth={5} />
      {/* picture lights + frames (posters are live HTML on top) */}
      {POSTERS.map((p) => (
        <g key={p.x}>
          <circle cx={p.x + p.w / 2} cy={p.y + 40} r={190} fill="url(#bulb-glow)" opacity=".7" />
          <rect x={p.x - 16} y={p.y - 16} width={p.w + 32} height={p.h + 32} fill="#d9a441" {...ink} />
          <rect x={p.x - 4} y={p.y - 4} width={p.w + 8} height={p.h + 8} fill="#2b1210" {...thin} />
          <path d={`M${p.x + 40} ${p.y - 42} H${p.x + p.w - 40} l-12 18 H${p.x + 52} Z`} fill="#3a1311" {...thin} />
          {range(p.x - 10, p.x + p.w + 10, 28).map((bx) => (
            <circle key={bx} cx={bx} cy={p.y + p.h + 30} r={5} className={`cn-bulb cn-bulb--${(bx / 28) % 3 | 0}`} fill="#ffd23f" stroke={INK} strokeWidth={1.5} />
          ))}
        </g>
      ))}
      {/* popcorn cart */}
      <g transform="translate(4600 560)">
        <rect x={0} y={120} width={170} height={170} rx={8} fill="#b3261e" {...ink} />
        <rect x={10} y={0} width={150} height={120} fill="rgba(255,240,200,.65)" {...ink} />
        {range(20, 150, 16).map((px, i) => (
          <circle key={px} cx={px} cy={90 - (i % 3) * 14} r={10} fill="#fff4d6" {...thin} />
        ))}
        <path d="M-6 0 H176 L160 -40 H10 Z" fill="#f7ecd6" {...ink} />
        <text x={85} y={-12} textAnchor="middle" className="cn-t cn-t--tiny" fill="#b3261e">
          POPCORN ₹50
        </text>
        <circle cx={34} cy={300} r={22} fill="#2b1210" {...ink} />
        <circle cx={136} cy={300} r={22} fill="#2b1210" {...ink} />
      </g>
      <Arch x={x0} label="FOYER" />
    </g>
  );
}

/* ---------- 4. auditorium ---------- */
export const SCREEN = { x: 5080, y: 180, w: 1240, h: 460 };
function Auditorium() {
  const x0 = X.auditorium;
  const s = SCREEN;
  return (
    <g>
      <Interior x0={x0} x1={X.booth} wall="wall-dark" wains="#4a1a14" ceiling="#1d0908" bulbs={false} />
      <rect x={x0} y={FLOOR} width={X.booth - x0} height={H - FLOOR} fill="#261010" />
      {/* projector beam from the booth port */}
      <polygon className="cn-beam" points={`6600,138 6600,178 ${s.x + 40},${s.y + s.h} ${s.x + 40},${s.y}`} fill="url(#beam)" />
      {/* proscenium + curtains */}
      <rect x={4930} y={110} width={1540} height={620} fill="#3a1311" {...ink} />
      <rect x={s.x - 6} y={s.y - 6} width={s.w + 12} height={s.h + 12} fill="#0e0807" {...ink} />
      {[
        [4930, 150],
        [6320, 150],
      ].map(([cx, w]) => (
        <g key={cx}>
          <rect x={cx} y={130} width={w} height={600} fill="#9e1b1b" {...ink} />
          {range(cx + 18, cx + w - 10, 26).map((fx) => (
            <path key={fx} d={`M${fx} 140 C${fx + 8} 400 ${fx - 8} 600 ${fx} 724`} stroke="#6d1010" strokeWidth={6} fill="none" />
          ))}
        </g>
      ))}
      <path d="M4930 110 H6470 V190 C6300 220 6100 170 5700 196 C5300 170 5100 220 4930 190 Z" fill="#b3261e" {...ink} />
      {range(4960, 6440, 60).map((fx) => (
        <circle key={fx} cx={fx} cy={186 + Math.sin(fx) * 8} r={6} fill="#e0a43c" {...thin} />
      ))}
      <rect x={4900} y={730} width={1600} height={40} fill="#6a3b24" {...ink} />
      {/* exit sign */}
      <g transform="translate(4840 230)">
        <rect width={80} height={36} rx={4} fill="#2f6f3a" {...thin} />
        <text x={40} y={25} textAnchor="middle" className="cn-t cn-t--tiny" fill="#e8ffe0">
          EXIT
        </text>
      </g>
      {/* seats: three rows, the nearest biggest */}
      {[
        { y: 800, w: 70, h: 70, c: '#5a1515', step: 84, o: 0 },
        { y: 870, w: 84, h: 84, c: '#6e1a1a', step: 100, o: 40 },
        { y: 950, w: 100, h: 100, c: '#7e1e1e', step: 118, o: 10 },
      ].map((r, ri) => (
        <g key={ri}>
          {range(x0 + r.o, X.booth - 60, r.step).map((sx) => (
            <g key={sx}>
              <rect x={sx} y={r.y - r.h} width={r.w} height={r.h} rx={r.w * 0.28} fill={r.c} {...ink} />
              <path d={`M${sx + 10} ${r.y - r.h + 14} H${sx + r.w - 10}`} stroke="#9e2a2a" strokeWidth={4} />
            </g>
          ))}
        </g>
      ))}
      {/* a couple of heads in the dark */}
      {[5250, 5900, 6280].map((hx) => (
        <g key={hx} fill="#140706">
          <circle cx={hx} cy={712} r={26} />
          <path d={`M${hx - 40} 760 C${hx - 36} 732 ${hx + 36} 732 ${hx + 40} 760 Z`} />
        </g>
      ))}
    </g>
  );
}

/* ---------- 5. projection booth ---------- */
export const BOOTH = { cans: { x: 7620, y: 214, w: 520 }, viewer: { x: 7620, y: 400, w: 520, h: 360 }, radio: { x: 6700, y: 560, w: 300, h: 230 } };
function Booth() {
  const x0 = X.booth;
  return (
    <g>
      <rect x={x0} y={0} width={X.credits - x0} height={FLOOR} fill="#5b2a20" />
      {range(0, FLOOR, 44).map((by, i) => (
        <g key={by}>
          <path d={`M${x0} ${by} H${X.credits}`} stroke="#3f1c15" strokeWidth={3} />
          {range(x0 + (i % 2 ? 0 : 60), X.credits, 120).map((bx) => (
            <path key={bx} d={`M${bx} ${by} V${by + 44}`} stroke="#3f1c15" strokeWidth={3} />
          ))}
        </g>
      ))}
      <rect x={x0} y={FLOOR} width={X.credits - x0} height={H - FLOOR} fill="#6a3b24" />
      {range(FLOOR + 34, H, 34).map((py) => (
        <path key={py} d={`M${x0} ${py} H${X.credits}`} stroke="#4f2b19" strokeWidth={3} />
      ))}
      <path d={`M${x0} ${FLOOR} H${X.credits}`} {...ink} />
      {/* port window to the auditorium */}
      <rect x={6680} y={150} width={190} height={130} fill="#ffcf7a" {...ink} />
      <rect x={6680} y={150} width={190} height={130} fill="url(#window-glow)" />
      <path d="M6775 150 V280" {...thin} />
      {/* hanging bulb */}
      <path d="M7300 0 V120" {...thin} />
      <circle cx={7300} cy={150} r={170} fill="url(#bulb-glow)" />
      <path d="M7280 118 h40 l-6 22 h-28 Z" fill="#ffe6a8" {...thin} />
      {/* the projector */}
      <g>
        <rect x={7060} y={480} width={420} height={200} rx={18} fill="#3b3534" {...ink} />
        <rect x={7090} y={510} width={160} height={120} rx={10} fill="#524948" {...thin} />
        <path d="M7060 560 H6960 L6930 540 V610 L6960 590 H7060" fill="#2b2625" {...ink} />
        <circle cx={6930} cy={575} r={30} fill="#ffe6a8" {...ink} />
        <circle cx={6930} cy={575} r={90} fill="url(#bulb-glow)" />
        <rect x={7160} y={680} width={40} height={150} fill="#2b2625" {...ink} />
        <rect x={7340} y={680} width={40} height={150} fill="#2b2625" {...ink} />
        <rect x={7110} y={820} width={320} height={22} rx={6} fill="#2b2625" {...ink} />
        {[
          [7170, 330],
          [7390, 330],
        ].map(([cx, cy], i) => (
          <g key={cx}>
            <path d={`M${cx} ${cy} L${cx + (i ? -40 : 40)} 490`} {...ink} strokeWidth={8} />
            <g className="cn-reel" style={{ transformOrigin: `${cx}px ${cy}px` }}>
              <circle cx={cx} cy={cy} r={118} fill="#2b2625" {...ink} />
              <circle cx={cx} cy={cy} r={104} fill="#4a4241" {...thin} />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * 58} cy={cy + Math.sin((a * Math.PI) / 180) * 58} r={26} fill="#2b2625" {...thin} />
              ))}
              <circle cx={cx} cy={cy} r={14} fill="#d9a441" {...thin} />
            </g>
          </g>
        ))}
        <path d="M7170 448 C7240 470 7320 470 7390 448" fill="none" stroke="#1b1716" strokeWidth={6} />
      </g>
      {/* shelf for the film cans + desk under the light box */}
      <rect x={7600} y={372} width={560} height={18} fill="#8b5a32" {...ink} />
      <rect x={7600} y={780} width={560} height={26} fill="#8b5a32" {...ink} />
      <rect x={7620} y={806} width={20} height={24} fill="#6a3b24" {...thin} />
      <rect x={8120} y={806} width={20} height={24} fill="#6a3b24" {...thin} />
      {/* radio table */}
      <rect x={6690} y={790} width={320} height={20} fill="#8b5a32" {...ink} />
      <rect x={6710} y={810} width={16} height={20} fill="#6a3b24" {...thin} />
      <rect x={6974} y={810} width={16} height={20} fill="#6a3b24" {...thin} />
      <g transform="translate(6640 330)">
        <rect width={30} height={160} fill="#3a1311" {...thin} />
        <text x={15} y={80} textAnchor="middle" className="cn-t cn-t--tiny cn-t--vertical" fill="#ffd23f">
          STAFF ONLY
        </text>
      </g>
    </g>
  );
}

/* ---------- 6. post-credits ---------- */
function Credits() {
  const x0 = X.credits;
  return (
    <g>
      <rect x={x0} y={0} width={X.end - x0} height={H} fill="#0d0605" />
      <rect x={x0 - 300} y={0} width={300} height={H} fill="url(#fade-black)" />
      {/* one last seat and an empty popcorn tub */}
      <g transform="translate(9180 690)">
        <rect x={0} y={0} width={150} height={150} rx={40} fill="#3e1010" stroke="#000" strokeWidth={4} />
        <rect x={-14} y={110} width={178} height={40} rx={14} fill="#4e1414" stroke="#000" strokeWidth={4} />
        <path d="M190 112 L200 150 H240 L250 112 Z" fill="#f7ecd6" stroke="#000" strokeWidth={3} />
        <path d="M194 116 L246 116" stroke="#d6362a" strokeWidth={6} />
      </g>
    </g>
  );
}

export function SceneArt() {
  return (
    <svg className="cn-art" viewBox={`0 0 ${TOTAL} ${H}`} width={TOTAL} height={H} aria-hidden="true">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b1426" />
          <stop offset=".6" stopColor="#5a2430" />
          <stop offset="1" stopColor="#9b4630" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a2a22" />
          <stop offset="1" stopColor="#4e1816" />
        </linearGradient>
        <linearGradient id="wall2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e2420" />
          <stop offset="1" stopColor="#451513" />
        </linearGradient>
        <linearGradient id="wall-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e0f0e" />
          <stop offset="1" stopColor="#1d0908" />
        </linearGradient>
        <radialGradient id="bulb-glow" r=".5">
          <stop offset="0" stopColor="#ffd59a" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffb45a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="window-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a0" />
          <stop offset="1" stopColor="#f2a15a" />
        </linearGradient>
        <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff1cf" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff1cf" stopOpacity=".04" />
        </linearGradient>
        <linearGradient id="fade-black" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d0605" stopOpacity="0" />
          <stop offset="1" stopColor="#0d0605" />
        </linearGradient>
        <linearGradient id="poster-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#69454F" />
          <stop offset=".6" stopColor="#EA795B" />
          <stop offset="1" stopColor="#FAA356" />
        </linearGradient>
        <linearGradient id="poster-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b1426" />
          <stop offset=".6" stopColor="#9b4630" />
          <stop offset="1" stopColor="#f2c45a" />
        </linearGradient>
      </defs>
      <Entrance />
      <Counter />
      <Corridor />
      <Auditorium />
      <Booth />
      <Credits />
      <Arch x={X.counter} label="LOBBY" />
    </svg>
  );
}
