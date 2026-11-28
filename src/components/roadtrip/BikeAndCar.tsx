'use client';

/* Top-down vehicles, both facing down the road (the direction of travel). */
import { useState, type RefObject } from 'react';
import { vehicles } from '@/data/roadtrip';

/** The Bike — Srihari's engineering brain. */
export function Bike({ className = '', beam = true }: { className?: string; beam?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 32 118" aria-hidden="true">
      <defs>
        <linearGradient id="bk-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6c2" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff6c2" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="bk-tank" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#f0b758" />
          <stop offset=".55" stopColor="#c8820a" />
          <stop offset="1" stopColor="#5d7a00" />
        </radialGradient>
        <radialGradient id="bk-helmet" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#5a5a5a" />
          <stop offset="1" stopColor="#141414" />
        </radialGradient>
        <linearGradient id="bk-jacket" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f2a3d" />
          <stop offset=".5" stopColor="#34476a" />
          <stop offset="1" stopColor="#1f2a3d" />
        </linearGradient>
      </defs>
      {beam && <path d="M12 72 L20 72 L31 116 L1 116 Z" fill="url(#bk-beam)" />}
      {/* rear tyre */}
      <rect x="12.5" y="2" width="7" height="17" rx="3.5" fill="#151515" />
      <path d="M13 5h6M13 8h6M13 11h6M13 14h6" stroke="#2c2c2c" strokeWidth=".8" />
      {/* tail light + rear fender */}
      <rect x="11" y="15" width="10" height="5" rx="2" fill="#2a2a2a" />
      <rect x="13" y="15.5" width="6" height="1.8" rx=".9" fill="#ff4d3d" />
      {/* seat */}
      <rect x="10.5" y="20" width="11" height="15" rx="5" fill="#262626" />
      <rect x="12" y="22" width="3" height="10" rx="1.5" fill="#3a3a3a" />
      {/* rider */}
      <ellipse cx="16" cy="34" rx="11.5" ry="6.5" fill="url(#bk-jacket)" />
      <path d="M6 36 L4 53 M26 36 L28 53" stroke="#2a3650" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="16" cy="35" r="6.2" fill="url(#bk-helmet)" />
      <path d="M12 38.5 q4 2.6 8 0" stroke="#c8820a" strokeWidth="1.3" fill="none" />
      {/* fuel tank */}
      <ellipse cx="16" cy="47" rx="6.8" ry="8" fill="url(#bk-tank)" />
      <path d="M16 40 v14" stroke="#fdda9e" strokeWidth=".9" opacity=".7" />
      {/* handlebar + mirrors */}
      <path d="M3 55 H29" stroke="#1b1b1b" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="1.5" y="53.5" width="4" height="3" rx="1" fill="#0d0d0d" />
      <rect x="26.5" y="53.5" width="4" height="3" rx="1" fill="#0d0d0d" />
      <circle cx="5" cy="51" r="1.8" fill="#9fb3c8" stroke="#1b1b1b" strokeWidth=".6" />
      <circle cx="27" cy="51" r="1.8" fill="#9fb3c8" stroke="#1b1b1b" strokeWidth=".6" />
      {/* headlight + front tyre */}
      <ellipse cx="16" cy="60" rx="4" ry="2.6" fill="#2a2a2a" />
      <ellipse cx="16" cy="60.5" rx="2.6" ry="1.6" fill="#fff6c2" />
      <rect x="13" y="61" width="6" height="15" rx="3" fill="#151515" />
    </svg>
  );
}

/** The Car — Srihari's product brain. Charcoal, with a lime pinstripe. */
export function Car({ className = '', beam = true }: { className?: string; beam?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 50 130" aria-hidden="true">
      <defs>
        <linearGradient id="cr-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1c1718" />
          <stop offset=".25" stopColor="#3a3234" />
          <stop offset=".5" stopColor="#5a4f51" />
          <stop offset=".75" stopColor="#3a3234" />
          <stop offset="1" stopColor="#1c1718" />
        </linearGradient>
        <linearGradient id="cr-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2633" />
          <stop offset="1" stopColor="#3b5167" />
        </linearGradient>
        <linearGradient id="cr-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6c2" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff6c2" stopOpacity="0" />
        </linearGradient>
      </defs>
      {beam && <path d="M8 92 L42 92 L50 128 L0 128 Z" fill="url(#cr-beam)" />}
      {/* tyres */}
      <rect x="1" y="16" width="6" height="15" rx="2.5" fill="#141414" />
      <rect x="43" y="16" width="6" height="15" rx="2.5" fill="#141414" />
      <rect x="1" y="64" width="6" height="15" rx="2.5" fill="#141414" />
      <rect x="43" y="64" width="6" height="15" rx="2.5" fill="#141414" />
      {/* body */}
      <path d="M12 3 H38 Q46 3 46 13 V82 Q46 94 34 95 H16 Q4 94 4 82 V13 Q4 3 12 3 Z" fill="url(#cr-body)" stroke="#120e0f" strokeWidth="1" />
      {/* tail lights */}
      <rect x="7" y="4" width="8" height="3" rx="1.5" fill="#ff4d3d" />
      <rect x="35" y="4" width="8" height="3" rx="1.5" fill="#ff4d3d" />
      {/* rear window */}
      <path d="M10 13 H40 L37 23 H13 Z" fill="url(#cr-glass)" />
      {/* roof */}
      <rect x="11" y="24" width="28" height="31" rx="4" fill="#443b3d" />
      <path d="M14 27 h22" stroke="#FAA356" strokeWidth="1" opacity=".7" />
      <path d="M25 4 V94" stroke="#faaf30" strokeWidth="1.2" opacity=".55" />
      {/* side windows */}
      <path d="M8 24 L11 25 V54 L8 56 Z M42 24 L39 25 V54 L42 56 Z" fill="url(#cr-glass)" />
      {/* windscreen */}
      <path d="M12 56 H38 L42 69 H8 Z" fill="url(#cr-glass)" />
      <path d="M14 59 L22 59" stroke="#8fb0cc" strokeWidth="1" opacity=".6" />
      {/* mirrors */}
      <ellipse cx="3" cy="58" rx="3" ry="2" fill="#2a2526" />
      <ellipse cx="47" cy="58" rx="3" ry="2" fill="#2a2526" />
      {/* bonnet */}
      
      {/* headlights */}
      <path d="M7 86 Q8 92 15 92 L15 89 Z" fill="#fff6c2" />
      <path d="M43 86 Q42 92 35 92 L35 89 Z" fill="#fff6c2" />
    </svg>
  );
}

/** Name tag with a hidden explanation of what each vehicle stands for. */
function VehicleTag({ kind }: { kind: 'bike' | 'car' }) {
  const [open, setOpen] = useState(false);
  const v = vehicles[kind];
  return (
    <div className="rt-tag">
      <button type="button" className="rt-tag-pill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="rt-tag-name">{v.name}</span>
        <span className="rt-tag-role">{v.role}</span>
        <span className="rt-tag-q" aria-hidden="true">?</span>
      </button>
      {open && (
        <div className="rt-tag-pop" role="note">
          <b>Hidden in plain sight.</b> {v.explain}
        </div>
      )}
    </div>
  );
}

/** Both vehicles. Positions are written straight to the refs by the scroll engine (no re-renders). */
export function BikeAndCar({ bikeRef, carRef }: { bikeRef: RefObject<HTMLDivElement>; carRef: RefObject<HTMLDivElement> }) {
  return (
    <>
      <div className="rt-veh rt-veh--car" ref={carRef}>
        <div className="rt-veh-body">
          <Car className="rt-veh-svg" />
        </div>
        <VehicleTag kind="car" />
      </div>
      <div className="rt-veh rt-veh--bike" ref={bikeRef}>
        <div className="rt-veh-body">
          <span className="rt-puff" />
          <span className="rt-puff rt-puff--2" />
          <Bike className="rt-veh-svg" />
        </div>
        <VehicleTag kind="bike" />
      </div>
    </>
  );
}
