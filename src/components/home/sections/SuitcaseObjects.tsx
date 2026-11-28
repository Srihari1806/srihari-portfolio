/* Hand-drawn objects for the suitcase. Charcoal line work, ivory fills and a single lime accent,
   in the same pen as the homepage doodles. All decorative: the text beside them carries the meaning. */

import type { CapabilityKey } from '@/data/capabilities';

const ink = { stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const paper = '#fbf8f1';
const lime = 'var(--lime)';

function Laptop() {
  return (
    <>
      <path d="M26 18h68a4 4 0 0 1 4 4v40H22V22a4 4 0 0 1 4-4z" fill="#2a2622" {...ink} />
      <rect x="29" y="25" width="62" height="31" rx="1.5" fill="#1d2a1d" />
      <path d="M35 33l6 4-6 4M45 41h10" stroke={lime} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 49h22M61 49h12M61 33h20M65 41h14" stroke="#7c8f72" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 62h96l-6 9H18z" fill={paper} {...ink} />
      <path d="M52 66h16" {...ink} strokeWidth={1.8} />
    </>
  );
}

function Notebook() {
  return (
    <>
      <path d="M30 10h56a3 3 0 0 1 3 3v62a3 3 0 0 1-3 3H30z" fill={paper} {...ink} />
      <path d="M30 10v68" {...ink} />
      {[18, 28, 38, 48, 58, 68].map((y) => (
        <circle key={y} cx="30" cy={y} r="2.6" fill={paper} {...ink} strokeWidth={1.6} />
      ))}
      <path d="M40 20h38" {...ink} strokeWidth={1.4} opacity={0.5} />
      <path d="M42 64V40M42 64h40" {...ink} strokeWidth={1.6} />
      <rect x="47" y="52" width="6" height="12" fill={lime} stroke="currentColor" strokeWidth="1.4" />
      <rect x="57" y="45" width="6" height="19" fill={lime} stroke="currentColor" strokeWidth="1.4" />
      <rect x="67" y="49" width="6" height="15" fill={lime} stroke="currentColor" strokeWidth="1.4" />
      <path d="M45 46l10-9 9 5 13-12" {...ink} strokeWidth={1.8} />
      <circle cx="77" cy="30" r="2" fill="currentColor" />
    </>
  );
}

function Circuit() {
  return (
    <>
      <rect x="14" y="14" width="92" height="62" rx="5" fill="#3f6b45" {...ink} />
      <path d="M24 26h18v12h14M24 64h22V50h10M96 30H78v10H64M96 62H80V50H64" stroke="#d9c37a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="50" y="34" width="22" height="22" rx="2" fill="#1e1c1a" {...ink} strokeWidth={1.8} />
      <path d="M54 34v-4M60 34v-4M66 34v-4M54 56v4M60 56v4M66 56v4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="61" cy="45" r="3.2" fill={lime} />
      {[
        [24, 26],
        [24, 64],
        [96, 30],
        [96, 62],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill="#d9c37a" stroke="currentColor" strokeWidth="1.4" />
      ))}
    </>
  );
}

function Compass() {
  return (
    <>
      <circle cx="60" cy="47" r="32" fill="#c8a25e" {...ink} />
      <circle cx="60" cy="47" r="25" fill={paper} {...ink} strokeWidth={1.8} />
      <path d="M60 10v5" {...ink} />
      <circle cx="60" cy="10" r="4" fill="#c8a25e" {...ink} strokeWidth={1.8} />
      <path d="M60 25v4M60 65v4M38 47h4M78 47h4" {...ink} strokeWidth={1.6} />
      <path d="M60 47l7-17-7 3-7-3z" fill={lime} {...ink} strokeWidth={1.6} transform="rotate(32 60 47)" />
      <path d="M60 47l-7 17 7-3 7 3z" fill="#2a2622" {...ink} strokeWidth={1.6} transform="rotate(32 60 47)" />
      <circle cx="60" cy="47" r="2.6" fill="currentColor" />
    </>
  );
}

function Ledger() {
  return (
    <>
      <path d="M20 16h80v58H20z" fill="#7a3f2c" {...ink} />
      <path d="M26 20h68v50H26z" fill={paper} {...ink} strokeWidth={1.6} />
      <path d="M60 20v50" {...ink} strokeWidth={1.6} />
      <path d="M31 30h22M31 38h18M31 46h22M31 54h14" {...ink} strokeWidth={1.3} opacity={0.6} />
      <path d="M66 58l7-8 6 4 9-14" {...ink} strokeWidth={1.8} />
      <path d="M84 40h4v4" {...ink} strokeWidth={1.8} />
      <text x="66" y="34" fontFamily="var(--hand)" fontSize="11" fill="currentColor">₹ ROI</text>
      <path d="M98 30h8v14h-8" fill={lime} {...ink} strokeWidth={1.6} />
    </>
  );
}

function Headphones() {
  return (
    <>
      <path d="M56 70h44l4-46H60z" fill={paper} {...ink} transform="rotate(6 80 47)" />
      <path d="M66 36h28M65 44h24M64 52h27" {...ink} strokeWidth={1.3} opacity={0.6} transform="rotate(6 80 47)" />
      <text x="68" y="66" fontFamily="var(--hand)" fontSize="11" fill="currentColor" transform="rotate(6 80 47)">la la…</text>
      <path d="M20 54V44a22 22 0 0 1 44 0v10" {...ink} strokeWidth={3} />
      <rect x="13" y="50" width="13" height="22" rx="5" fill="#2a2622" {...ink} />
      <rect x="58" y="50" width="13" height="22" rx="5" fill="#2a2622" {...ink} />
      <path d="M16 56v10M61 56v10" stroke={lime} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M96 14l-6 2v10" {...ink} strokeWidth={1.8} />
      <circle cx="88" cy="27" r="2.6" fill="currentColor" />
    </>
  );
}

const map: Record<CapabilityKey, () => JSX.Element> = {
  engineering: Laptop,
  data: Notebook,
  ai: Circuit,
  product: Compass,
  business: Ledger,
  creative: Headphones,
};

export function SuitcaseObject({ kind, className }: { kind: CapabilityKey; className?: string }) {
  const Draw = map[kind];
  return (
    <svg viewBox="0 0 120 86" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="80" rx="40" ry="4" fill="currentColor" opacity="0.12" className="sc-obj-shadow" />
      <g className="sc-obj-body" fill="none">
        <Draw />
      </g>
    </svg>
  );
}
