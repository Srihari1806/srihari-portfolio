/**
 * The little illustrated me (same boy as the TFI room: messy black hair, glasses, red tee, blue shorts,
 * white shoes), drawn side-on facing right. CSS on .cn-walker animates the walk cycle and idle breathing.
 */
const INK = '#24100d';

function Leg({ cls }: { cls: string }) {
  return (
    <g className={cls}>
      <path d="M52 168 L50 222" stroke={INK} strokeWidth={15} strokeLinecap="round" />
      <path d="M52 168 L50 222" stroke="#e39a63" strokeWidth={10} strokeLinecap="round" />
      <path d="M50 214 L49 226" stroke="#f4ede2" strokeWidth={11} strokeLinecap="round" />
      <path d="M38 226 C38 216 52 214 64 220 C72 224 72 234 64 235 L40 235 C36 235 36 230 38 226 Z" fill="#f7f2ea" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M40 231 H66" stroke={INK} strokeWidth={2} />
    </g>
  );
}

function Arm({ cls, front }: { cls: string; front?: boolean }) {
  return (
    <g className={cls}>
      <path d="M58 104 C54 124 52 136 54 150" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M58 104 C54 124 52 136 54 150" fill="none" stroke="#e39a63" strokeWidth={9.5} strokeLinecap="round" />
      <path d="M57 102 C55 110 54 114 54 118" fill="none" stroke={front ? '#d6362a' : '#b72c22'} strokeWidth={15} strokeLinecap="round" />
    </g>
  );
}

export function Walker() {
  return (
    <svg className="cn-walker-svg" viewBox="0 0 120 250" aria-hidden="true">
      <ellipse className="cn-walker-shadow" cx="58" cy="238" rx="34" ry="7" fill="rgba(20,6,4,.35)" />
      <g className="cn-walker-body">
        <Arm cls="cn-arm cn-arm--back" />
        <Leg cls="cn-leg cn-leg--back" />
        {/* shorts */}
        <path d="M36 150 L82 150 L84 184 L62 186 L58 172 L54 186 L34 184 Z" fill="#3b4aa0" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        <Leg cls="cn-leg cn-leg--front" />
        {/* tee */}
        <path d="M40 98 C50 90 70 90 80 98 L86 152 C70 158 50 158 34 152 Z" fill="#d6362a" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        <path d="M52 96 C58 102 66 102 70 96" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        <Arm cls="cn-arm cn-arm--front" front />
        {/* head */}
        <g className="cn-head">
          <path d="M56 86 L58 98 L66 98 L66 86 Z" fill="#e39a63" stroke={INK} strokeWidth={3} />
          <path d="M40 58 C40 38 56 30 70 32 C86 34 94 46 92 62 C91 74 84 84 70 86 C54 88 42 78 40 58 Z" fill="#eeaa6f" stroke={INK} strokeWidth={3.5} />
          <path d="M91 60 L97 66 L91 69" fill="#eeaa6f" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d="M80 77 C84 77 86 76 88 74" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
          <ellipse cx="50" cy="62" rx="6" ry="8" fill="#e39a63" stroke={INK} strokeWidth={3} />
          {/* glasses */}
          <rect x="72" y="53" width="19" height="13" rx="3" fill="rgba(255,240,220,.35)" stroke={INK} strokeWidth={3} />
          <path d="M72 58 L54 56" stroke={INK} strokeWidth={2.6} />
          <path className="cn-eye" d="M80 61 C82 59.6 85 59.6 87 61" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          {/* messy hair */}
          <path
            d="M36 62 C28 56 30 46 36 44 C28 36 36 24 46 28 C46 16 62 14 66 22 C72 12 88 16 88 28 C98 26 102 38 94 44 C100 48 98 56 92 54 C88 46 82 44 76 46 C74 52 70 50 68 44 C62 48 58 46 58 40 C54 46 50 50 46 48 C46 56 42 60 36 62 Z"
            fill="#1c1312"
            stroke={INK}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d="M60 24 C64 30 70 32 76 30" fill="none" stroke="#4a3430" strokeWidth={2} strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
