/* Hand-drawn style SVG art for /about. Pure vector, no photos: the hero desk collage,
   the Vizag coastline, and the three "life outside" panels. */

const INK = '#1d1b16';

export function CricketPanel() {
  return (
    <svg viewBox="0 0 160 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="ab-life-art">
      <rect width="160" height="130" fill="#3f7a46" />
      <path d="M0 0 h160 v40 C110 30 60 50 0 38z" fill="#5a9a5a" />
      <path d="M0 90 C50 80 110 84 160 92 V130 H0z" fill="#d9c58f" />
      {[60, 74, 88].map((x) => (
        <rect key={x} x={x} y="46" width="6" height="56" rx="2" fill="#f3e3b8" stroke={INK} strokeWidth="1.3" />
      ))}
      <rect x="58" y="42" width="38" height="5" rx="2" fill="#f3e3b8" stroke={INK} strokeWidth="1.3" />
      <circle cx="116" cy="104" r="11" fill="#b2281e" stroke={INK} strokeWidth="1.4" />
      <path d="M108 98 C114 104 116 110 114 114" stroke="#f5e6c8" strokeWidth="1.4" fill="none" />
      <path d="M120 20 l20 -12" stroke="#f6e7b3" strokeWidth="2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function CinemaPanel() {
  return (
    <svg viewBox="0 0 160 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="ab-life-art">
      <rect width="160" height="130" fill="#a8473f" />
      <path d="M20 20 l6 6 M140 18 l-5 7 M130 110 l6 4" stroke="#f3c2a0" strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(36 34) rotate(-8)">
        <rect x="0" y="24" width="90" height="58" rx="3" fill="#1d1b16" />
        <path d="M0 0 L88 -14 L92 8 L4 22z" fill="#1d1b16" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${8 + i * 18} ${-1 - i * 2.9} l10 -1.6 l3 18 l-10 1.6z`} fill="#f5efe2" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={'b' + i} d={`M${6 + i * 18} 24 h10 l-6 14 h-10z`} fill="#f5efe2" />
        ))}
        <path d="M10 56 h70 M10 68 h50" stroke="#f5efe2" strokeWidth="2" opacity=".6" />
      </g>
    </svg>
  );
}

export function MusicPanel() {
  return (
    <svg viewBox="0 0 160 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="ab-life-art">
      <rect width="160" height="130" fill="#f2b36b" />
      <circle cx="120" cy="30" r="40" fill="#f7c98a" />
      <path d="M40 84 C40 30 120 30 120 84" stroke="#1d1b16" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="28" y="72" width="26" height="40" rx="10" fill="#3a2f26" stroke="#1d1b16" strokeWidth="2" />
      <rect x="106" y="72" width="26" height="40" rx="10" fill="#3a2f26" stroke="#1d1b16" strokeWidth="2" />
      <text x="126" y="34" fontSize="20" fill="#1d1b16">♫</text>
    </svg>
  );
}
