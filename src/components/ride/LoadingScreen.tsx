'use client';

/* The departure board: a green phosphor screen with the Vizag coast, a train on the line and the
   five stations. "Start Ride" (or a scroll / swipe) starts the count; the train pulls across as it
   loads; at 100% the camera dives into one of the coach windows and hands over to the cabin. */

import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { rideCopy, timeline } from '@/data/ride';

const COACH = 232;
const GAP = 8;
const LOCO = 212;
export const TRAIN_LEN = COACH * 3 + GAP * 3 + LOCO;

function Wheel({ x }: { x: number }) {
  return (
    <g className="rl-wheel" style={{ transformOrigin: `${x}px 519px` }}>
      <circle cx={x} cy={519} r={6.5} />
      <path d={`M${x - 6.5} 519h13M${x} 512.5v13`} />
    </g>
  );
}

function Coach({ x, dive = false }: { x: number; dive?: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={0} y={455} width={COACH} height={60} rx={6} />
      <path d={`M4 461H${COACH - 4}M2 509H${COACH - 2}`} className="rl-faint" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={14 + i * 30} y={470} width={22} height={13} rx={2.5} className={dive && i === 3 ? 'rl-dive' : undefined} data-dive={dive && i === 3 ? '' : undefined} />
      ))}
      <rect x={198} y={466} width={16} height={44} rx={2} />
      <path d="M206 468v40" className="rl-faint" />
      <Wheel x={28} />
      <Wheel x={48} />
      <Wheel x={COACH - 48} />
      <Wheel x={COACH - 28} />
      <path d={`M${COACH} 504h${GAP}`} />
    </g>
  );
}

function Loco({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M0 515V457H156L190 468Q206 478 ${LOCO - 2} 498V515Z`} />
      <path d="M164 462L189 471Q198 478 200 488H166Z" />
      <path d="M8 470h44v26h-44zM60 470h40v26h-40zM108 470h34v26h-34z" className="rl-faint" />
      <path d="M14 476h32M14 482h32M14 488h32M66 476h28M66 482h28M66 488h28" className="rl-faint" />
      <rect x={146} y={468} width={12} height={40} rx={2} />
      <path d="M40 457l14-9h40l14 9" className="rl-faint" />
      <circle cx={LOCO - 6} cy={503} r={3} className="rl-headlight" />
      <Wheel x={28} />
      <Wheel x={50} />
      <Wheel x={LOCO - 56} />
      <Wheel x={LOCO - 34} />
    </g>
  );
}

const STATION_ICONS: Record<string, ReactNode> = {
  vizag: <path d="M3 22c4 0 4-3 8-3s4 3 8 3 4-3 8-3M5 15c3-6 9-9 15-5-4 0-6 2-5 6 2-3 5-3 7-2" />,
  cinema: <path d="M5 11h22v13H5zM5 11l3-5 19-2 1 5M11 5l2 5M18 4l2 5" />,
  cricket: <path d="M9 6v20M16 6v20M23 6v20M7 6h18" />,
  product: <path d="M7 8h18v12H7zM4 23h24M13 23v-3h6v3" />,
  beyond: <path d="M16 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM3 19c4 3 22-3 26-8 1-2-2-2-5-1" />,
};

export type LoadingHandle = { diveTarget: () => DOMRect | null };

export const LoadingScreen = forwardRef<LoadingHandle, {
  phase: 'idle' | 'loading' | 'diving';
  progress: number;
  onStart: () => void;
  onSkip: () => void;
}>(function LoadingScreen({ phase, progress, onStart, onSkip }, ref) {
  const trainRef = useRef<SVGGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    diveTarget: () => rootRef.current?.querySelector('[data-dive]')?.getBoundingClientRect() ?? null,
  }));

  // the train's place on the line follows the count; wheels turn by the distance travelled
  const head = 560 + (958 - 560) * (progress / 100);
  useEffect(() => {
    const g = trainRef.current;
    if (!g) return;
    g.style.transform = `translateX(${head - TRAIN_LEN}px)`;
    rootRef.current?.style.setProperty('--head', String(head));
    g.style.setProperty('--turn', `${(head / 6.5) * (180 / Math.PI)}deg`);
  }, [head]);

  // "scroll to begin the journey": a wheel turn or an upward swipe starts the count too
  useEffect(() => {
    if (phase !== 'idle') return;
    let y0 = 0;
    const wheel = (e: WheelEvent) => e.deltaY > 8 && onStart();
    const ts = (e: TouchEvent) => (y0 = e.touches[0].clientY);
    const tm = (e: TouchEvent) => y0 - e.touches[0].clientY > 30 && onStart();
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', ts);
      window.removeEventListener('touchmove', tm);
    };
  }, [phase, onStart]);

  const lit = Math.min(12, Math.floor((progress / 100) * 12 + 0.0001));
  const reached = (i: number) => progress >= (i / (timeline.length - 1)) * 100 - 0.5;

  return (
    <div ref={rootRef} className={`rl rl--${phase}`}>
      <div className="rl-glass" aria-hidden="true" />
      <button type="button" className="rl-skip" onClick={onSkip}>
        {rideCopy.skip}
      </button>

      <div className="rl-ui">
        <p className="rl-kicker">[&nbsp;&nbsp;{rideCopy.kicker}&nbsp;&nbsp;]</p>
        <button type="button" className="rl-start" onClick={onStart} disabled={phase !== 'idle'}>
          <span>{rideCopy.start}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 18L18 6M8 6h10v10" />
          </svg>
        </button>
        <p className="rl-hint" aria-live="polite">
          {phase === 'idle' ? rideCopy.hint : `${rideCopy.boarding}…`}
        </p>
      </div>

      <div className="rl-scene" aria-hidden="true">
        <svg viewBox="0 200 1600 345" preserveAspectRatio="xMidYMax meet">
          <defs>
            <filter id="rl-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="rl-sun-clip">
              <rect x="1300" y="300" width="200" height="118" />
            </clipPath>
            <pattern id="rl-sun-lines" width="4" height="7" patternUnits="userSpaceOnUse">
              <rect width="4" height="4.6" fill="#ff9a3c" />
            </pattern>
          </defs>

          <g className="rl-line" filter="url(#rl-glow)">
            {/* clouds over the hill, in dots */}
            <path className="rl-dots" d="M0 268c22-22 54-24 76-8 14-22 48-24 64-6 20-12 46-8 58 10 18-4 34 4 40 16H0" />
            <path className="rl-dots" d="M150 300h210M60 318h170" />
            <path className="rl-dots" d="M1470 318c12-16 34-18 46-6 10-12 34-12 44 2 14-2 28 4 40 14" />
            {/* the hill and its lighthouse */}
            <path d="M0 404Q60 372 104 364H172Q250 372 336 410Q420 450 470 492T520 521" />
            <path className="rl-faint" d="M0 432Q120 404 220 412T480 486" />
            <path d="M106 364V342H168V364M118 342L123 268H139L144 342M116 268V261H146V268M122 261V247H140V261M119 247L131 235L143 247" />
            <path className="rl-faint" d="M120 330L142 316M121 312L141 299M122 293L140 282M126 247v14M131 247v14M136 247v14" />
            <path className="rl-beam" d="M122 252L-40 214V292Z" />
            <path d="M56 364v-14h22v14M60 350l7-7 7 7" className="rl-faint" />
            {[
              [254, 384],
              [302, 398],
              [350, 414],
              [398, 434],
            ].map(([x, y]) => (
              <g key={x}>
                <path d={`M${x} ${y}v-24`} className="rl-faint" />
                <circle cx={x} cy={y - 26} r={2.4} className="rl-lamp" />
              </g>
            ))}
            {/* the far shore: dotted hills, the sun going down behind them, the city lights */}
            <path className="rl-dots" d="M880 470L960 452L1040 438L1110 426L1180 414L1260 402L1320 386L1380 396L1440 380L1520 392L1600 384" />
            <g clipPath="url(#rl-sun-clip)" className="rl-sun">
              <circle cx="1396" cy="410" r="56" fill="url(#rl-sun-lines)" />
            </g>
            <path d="M1290 418L1340 404L1380 412L1430 400L1480 414L1520 404L1600 412V470H1290Z" className="rl-occlude" />
            <path className="rl-sea" d="M1350 482h22M1384 482h30M1426 482h16M1362 492h40M1412 492h22M1374 502h30" />
            <g className="rl-city">
              <path d="M1180 470v-22h18v22M1204 470v-34h16v34M1226 470v-16h20v16M1252 470v-44h14v44M1272 470v-26h18v26M1296 470v-38h22v38M1326 470v-20h18v20M1350 470v-30h14v30M1440 470v-24h20v24M1466 470v-48h16v48M1488 470v-32h22v32M1516 470v-56h12v56M1534 470v-28h22v28M1562 470v-40h16v40M1582 470v-22h18v22" />
              {[1186, 1192, 1210, 1214, 1232, 1240, 1256, 1262, 1278, 1302, 1312, 1332, 1356, 1446, 1472, 1476, 1494, 1502, 1520, 1540, 1548, 1566, 1572, 1588].map((x, i) => (
                <rect key={x} x={x} y={452 + ((i * 7) % 14)} width="3" height="3" className="rl-win" />
              ))}
            </g>
            <path className="rl-dots rl-dots--amber" d="M640 466H1180" />
            {[700, 760, 820, 880, 940, 1000, 1060, 1120].map((x) => (
              <g key={x}>
                <path d={`M${x} 466v-14`} className="rl-faint" />
                <circle cx={x} cy={450} r={1.8} className="rl-lamp" />
              </g>
            ))}
            {/* the line itself */}
            <path d="M0 521H1600" className="rl-track" />
            <path d="M0 528H1600" className="rl-faint" />
            <g ref={trainRef} className="rl-train">
              <Coach x={0} />
              <Coach x={COACH + GAP} />
              <Coach x={(COACH + GAP) * 2} dive />
              <Loco x={(COACH + GAP) * 3} />
            </g>
          </g>
        </svg>
      </div>

      <ol className="rl-stations">
        {timeline.map((s, i) => (
          <li key={s.key} className={reached(i) ? 'is-lit' : ''}>
            <i aria-hidden="true" />
            <svg viewBox="0 0 32 30" aria-hidden="true">
              {STATION_ICONS[s.key]}
            </svg>
            <b>{s.name}</b>
            <span>{s.line}</span>
          </li>
        ))}
      </ol>

      <div className="rl-bar" role="progressbar" aria-label={rideCopy.loading} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <span>{phase === 'idle' ? 'Ready when you are' : rideCopy.loading}</span>
        <span className="rl-cells" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} className={i < lit ? 'is-on' : ''} />
          ))}
        </span>
        <b>{Math.round(progress)}%</b>
      </div>
    </div>
  );
});
