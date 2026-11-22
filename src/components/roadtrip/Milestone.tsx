'use client';

import { useRef, useState } from 'react';

type MilestoneProps = {
  km: number;
  size?: 'hero' | 'stop' | 'mini';
  interactive?: boolean;
  className?: string;
};

const HI_LINES = [
  'Hello, world.',
  'Still a few km to go.',
  'Please stop. I’m load-bearing.',
  '418: I’m a milestone, not a teapot.',
  'Fine. One more spin.',
];

export function kmLabel(km: number) {
  if (km === 0) return '0';
  return km < 1 ? `${Math.round(km * 1000)}` : `${km}`;
}

/** Highway milestone: rounded cap, painted stone, "NH 200" (as in HTTP 200 OK). */
export function Milestone({ km, size = 'stop', interactive = false, className = '' }: MilestoneProps) {
  const [spins, setSpins] = useState(0);
  const [line, setLine] = useState<string | null>(null);
  const startX = useRef<number | null>(null);

  const spin = () => {
    setSpins((s) => s + 1);
    setLine(HI_LINES[spins % HI_LINES.length]);
  };

  const unit = km > 0 && km < 1 ? 'm' : 'km';
  const face = (
    <>
      <span className="rt-ms-cap" aria-hidden="true" />
      <span className="rt-ms-body">
        <span className="rt-ms-nh">NH 200</span>
        <span className="rt-ms-en">HIRED</span>
        <span className="rt-ms-km">
          {kmLabel(km)}
          {size === 'hero' && <small>{unit}</small>}
        </span>
      </span>
    </>
  );

  if (!interactive) {
    return (
      <span className={`rt-ms rt-ms--${size} ${className}`} role="img" aria-label={`Milestone: ${kmLabel(km)} ${unit} to hired`}>
        {face}
      </span>
    );
  }

  return (
    <div className={`rt-ms-wrap ${className}`}>
      <button
        type="button"
        className={`rt-ms rt-ms--${size} is-interactive`}
        style={{ ['--spin' as string]: `${spins * 360}deg` }}
        onClick={spin}
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current !== null && Math.abs(e.clientX - startX.current) > 30) spin();
          startX.current = null;
        }}
        aria-label={`Milestone: ${kmLabel(km)} ${unit} to hired. Tap to say hi.`}
      >
        {face}
      </button>
      <p className="rt-ms-hint" aria-live="polite">
        {line ? <span className="rt-ms-bubble">{line}</span> : <span className="rt-ms-hint-text">Tap or swipe me to say hi</span>}
      </p>
    </div>
  );
}
