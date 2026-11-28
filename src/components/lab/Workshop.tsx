import { stations, STATUS_LABEL } from '@/data/lab';

/* The workshop: one continuous bench under warm lamps, five stations along it.
   Each station is a link down to its write-up. Flat 2.5D: a back wall, a bench top and its front edge. */

const X = [130, 365, 600, 835, 1070];

function Prop({ k }: { k: string }) {
  switch (k) {
    case 'software':
      return (
        <g>
          <rect x="-78" y="-150" width="156" height="104" rx="6" fill="#1b1d18" stroke="#8a7a5a" strokeWidth="3" />
          <rect x="-68" y="-140" width="136" height="84" fill="#15251a" />
          <path d="M-58-126l10 7-10 7M-42-112h22" stroke="#a8e07a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M-58-96h70M-58-84h40M-10-84h36M-58-72h56" stroke="#6f8a62" strokeWidth="3" strokeLinecap="round" />
          <path d="M-10-46v14M-30-32h40" stroke="#8a7a5a" strokeWidth="5" />
          <path d="M-70-18h140l8 14H-78z" fill="#3a3128" stroke="#8a7a5a" strokeWidth="2" />
        </g>
      );
    case 'data':
      return (
        <g>
          <path d="M-90-120h50v50h40" stroke="#b98a4a" strokeWidth="10" fill="none" />
          <path d="M-90-80h20v40h30" stroke="#8a6a3a" strokeWidth="10" fill="none" />
          <ellipse cx="40" cy="-110" rx="44" ry="12" fill="#d8c9a6" stroke="#5a4532" strokeWidth="3" />
          <path d="M-4-110v92a44 12 0 0 0 88 0v-92" fill="#c7b58c" stroke="#5a4532" strokeWidth="3" />
          <path d="M-4-80a44 12 0 0 0 88 0M-4-50a44 12 0 0 0 88 0" stroke="#5a4532" strokeWidth="2.5" fill="none" />
          <circle cx="60" cy="-92" r="4" fill="#a8e07a" />
        </g>
      );
    case 'analytics':
      return (
        <g>
          <path d="M-60 0-30-150M60 0 30-150M0-150V0" stroke="#5a4532" strokeWidth="5" />
          <rect x="-70" y="-150" width="140" height="96" fill="#f4ecda" stroke="#5a4532" strokeWidth="3" />
          <path d="M-56-68v-62M-56-68h112" stroke="#5a4532" strokeWidth="2.5" />
          <rect x="-46" y="-92" width="16" height="24" fill="#b5735f" />
          <rect x="-24" y="-112" width="16" height="44" fill="#b5735f" />
          <rect x="-2" y="-100" width="16" height="32" fill="#b5735f" />
          <rect x="20" y="-124" width="16" height="56" fill="#c8820a" />
          <path d="M-40-112l22-14 22 8 26-18" stroke="#1c1d1a" strokeWidth="2.5" fill="none" />
        </g>
      );
    case 'ai':
      return (
        <g>
          <rect x="-56" y="-170" width="112" height="168" rx="6" fill="#23251f" stroke="#8a7a5a" strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x="-44" y={-158 + i * 31} width="88" height="22" rx="3" fill="#2f322a" stroke="#4d5040" />
              <circle cx="-32" cy={-147 + i * 31} r="3.5" fill={i % 2 ? '#f2b33d' : '#a8e07a'} />
              <circle cx="-20" cy={-147 + i * 31} r="3.5" fill="#a8e07a" opacity={i === 2 ? 0.3 : 1} />
              <path d={`M0 ${-147 + i * 31}h34`} stroke="#4d5040" strokeWidth="3" />
            </g>
          ))}
        </g>
      );
    default:
      return (
        <g>
          <rect x="-80" y="-128" width="104" height="80" rx="6" fill="#cfc4ad" stroke="#5a4532" strokeWidth="3" />
          <rect x="-70" y="-118" width="66" height="56" fill="#0f1a12" />
          <path d="M-66-90q8-22 16 0t16 0 16 0 14-8" stroke="#a8e07a" strokeWidth="2.5" fill="none" />
          <circle cx="8" cy="-104" r="6" fill="#5a4532" /><circle cx="8" cy="-80" r="6" fill="#5a4532" />
          <rect x="20" y="-34" width="70" height="30" rx="2" fill="#efe8d8" stroke="#5a4532" strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={28 + i * 10} cy="-19" r="1.8" fill="#8a7a5a" />
          ))}
          <path d="M34-34v-16M54-34v-22M74-34v-12" stroke="#c0392b" strokeWidth="2.5" />
          <path d="M-60-48v44" stroke="#5a4532" strokeWidth="5" />
        </g>
      );
  }
}

export function Workshop() {
  return (
    <div className="lb-scene">
      <svg viewBox="0 0 1200 440" className="lb-svg" role="group" aria-label="The workshop: five stations">
        <rect width="1200" height="440" fill="#2a241e" />
        {/* back wall boards */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M${i * 160} 0v300`} stroke="#241f1a" strokeWidth="3" />
        ))}
        {/* pegboard + blueprint pinned on the wall */}
        <rect x="470" y="40" width="260" height="120" fill="#2f4a5a" opacity=".55" />
        <path d="M490 140h220M500 60v90M520 80h60v40h-60zM600 70h40v60M640 100h50" stroke="#cfe0e6" strokeWidth="1.5" fill="none" opacity=".6" />
        {/* lamps and their light */}
        {X.map((x) => (
          <g key={x}>
            <path d={`M${x} 0v40`} stroke="#5c4d3c" strokeWidth="2" />
            <path d={`M${x - 22} 40h44l12 16h-68z`} fill="#d9a441" />
            <path d={`M${x - 34} 56h68l70 244H${x - 104}z`} fill="#f2c86b" opacity=".09" />
          </g>
        ))}
        {/* bench */}
        <rect x="0" y="300" width="1200" height="22" fill="#7a5c40" />
        <rect x="0" y="322" width="1200" height="118" fill="#4a3727" />
        <path d="M0 322h1200" stroke="#2a1f16" strokeWidth="3" />
        {stations.map((s, i) => (
          <a key={s.key} href={`#station-${s.key}`} className={`lb-prop lb-prop--${s.status}`} aria-label={`${s.name} station — ${STATUS_LABEL[s.status]}`}>
            <g transform={`translate(${X[i]} 302)`}>
              <rect x="-110" y="-200" width="220" height="330" fill="transparent" />
              <g className="lb-prop-art">
                <Prop k={s.key} />
              </g>
              <rect x="-86" y="38" width="172" height="52" rx="4" fill="#efe6d2" stroke="#2a1f16" strokeWidth="2" />
              <text x="0" y="62" textAnchor="middle" fontFamily="var(--serif)" fontWeight="700" fontSize="19" fill="#1c1d1a">
                {s.name}
              </text>
              <circle cx="-56" cy="77" r="4" fill={s.status === 'in-progress' ? '#d9902b' : '#896321'} />
              <text x="-46" y="81" fontFamily="var(--sans)" fontSize="11.5" fill="#4b4338">
                {STATUS_LABEL[s.status]}
              </text>
            </g>
          </a>
        ))}
      </svg>
    </div>
  );
}
