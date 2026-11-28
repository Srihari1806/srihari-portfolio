import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHead } from './SectionHead';

/* Four destinations, four small flat scenes in each world's own colours.
   The homepage only points the way; each page tells its own story. */

function Scene({ kind }: { kind: string }) {
  switch (kind) {
    case 'work':
      return (
        <svg viewBox="0 0 320 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="120" fill="#e9b07a" />
          <circle cx="232" cy="70" r="26" fill="#f6d59a" />
          <path d="M0 78 60 60l50 12 60-22 70 20 80-14v66H0z" fill="#b5735f" />
          <path d="M0 92h320v28H0z" fill="#5b3b45" />
          <path d="M150 120 168 92h-8l-18 28z" fill="#f3e3c4" />
          <path d="M10 104h30M70 104h30M130 104h30M190 104h30M250 104h30" stroke="#f3e3c4" strokeWidth="2.5" />
          <circle cx="96" cy="88" r="5" fill="#1c1d1a" /><circle cx="116" cy="88" r="5" fill="#1c1d1a" />
          <path d="M92 82h28l-6-8h-12z" fill="#1c1d1a" />
        </svg>
      );
    case 'lab':
      return (
        <svg viewBox="0 0 320 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="120" fill="#2b2620" />
          <path d="M160 0v22" stroke="#6a5a45" strokeWidth="2" />
          <path d="M140 22h40l14 18h-68z" fill="#d9a441" />
          <path d="M126 40h68l50 80H76z" fill="#f2c86b" opacity=".16" />
          <rect x="0" y="86" width="320" height="34" fill="#4a3a2a" />
          <rect x="40" y="56" width="70" height="30" rx="3" fill="#1d2a1d" stroke="#8a7a5a" strokeWidth="2" />
          <path d="M46 72q8-12 16 0t16 0 16 0" stroke="#a8e07a" strokeWidth="2" fill="none" />
          <rect x="200" y="66" width="80" height="20" rx="2" fill="#e9e2d2" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={208 + i * 10} cy="76" r="1.6" fill="#7a6a52" />
          ))}
          <path d="M214 66v-10M244 66v-14M262 66v-8" stroke="#c0392b" strokeWidth="2" />
        </svg>
      );
    case 'cinema':
      return (
        <svg viewBox="0 0 320 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="120" fill="#5c1f2b" />
          <path d="M70 120V40h180v80z" fill="#e8d9b5" />
          <path d="M60 40h200l-10-16H70z" fill="#c98f3b" />
          <rect x="96" y="50" width="128" height="26" fill="#2a1418" />
          <text x="160" y="68" textAnchor="middle" fontFamily="var(--serif)" fontWeight="700" fontSize="15" fill="#f2c86b">NOW SHOWING</text>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <circle key={i} cx={78 + i * 23.5} cy="32" r="2.4" fill="#fff3c4" />
          ))}
          <path d="M140 120V90h40v30z" fill="#7a2a35" />
          <path d="M0 108h70M250 108h70" stroke="#9fc9b6" strokeWidth="6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 320 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <rect width="320" height="120" fill="#e7b8a0" />
          <rect y="82" width="320" height="38" fill="#7aa3a8" />
          <path d="M0 92h320" stroke="#f3e3c4" strokeWidth="2" opacity=".6" />
          <circle cx="250" cy="76" r="16" fill="#f6d59a" />
          <path d="M60 120V58l40-26 40 26v62z" fill="#b65a3c" />
          <path d="M52 60 100 28l48 32" stroke="#6e3524" strokeWidth="5" fill="none" />
          <rect x="88" y="78" width="22" height="42" fill="#5a2e20" />
          <path d="M140 66h60v54h-60z" fill="#c9714f" />
          <path d="M136 66h68" stroke="#5a2e20" strokeWidth="3" />
          <path d="M146 58v8M160 58v8M174 58v8M188 58v8M146 58h46" stroke="#5a2e20" strokeWidth="2" />
          <path d="M276 50v34M268 56h16" stroke="#1c1d1a" strokeWidth="2" />
        </svg>
      );
  }
}

const doors = [
  { key: 'work', href: '/work', title: 'Work', line: 'What I’ve built', pf: 1 },
  { key: 'lab', href: '/lab', title: 'Lab', line: 'How it works', pf: 2 },
  { key: 'cinema', href: '/cinema', title: 'Cinema', line: 'What I love', pf: 3 },
  { key: 'about', href: '/about', title: 'About', line: 'Who’s driving', pf: 4 },
];

export function Destinations() {
  return (
    <section className="hs hs--doors" aria-labelledby="hs-doors">
      <SectionHead id="hs-doors" index="01" kicker="Choose a platform" title={<>Where would you <em>like to go?</em></>} />
      <ul className="dr-grid">
        {doors.map((d) => (
          <li key={d.key}>
            <Link href={d.href} className={`dr-card dr-card--${d.key}`}>
              <span className="dr-scene">
                <Scene kind={d.key} />
              </span>
              <span className="dr-sign">
                <span className="dr-pf">Platform {d.pf}</span>
                <span className="dr-title">{d.title}</span>
                <span className="dr-line">
                  {d.line} <ArrowRight aria-hidden="true" strokeWidth={2} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="dr-also">
        Also on board: <Link href="/writing" className="hs-inline-link">notes</Link> ·{' '}
        <a href="https://sahitya-rachanalu.vercel.app/" className="hs-inline-link">lyrics &amp; songs</a>
      </p>
    </section>
  );
}
