import type { ReactNode } from 'react';

/** Editorial section heading: a numbered kicker, a serif title and an optional handwritten aside. */
export function SectionHead({
  id,
  index,
  kicker,
  title,
  sub,
  aside,
}: {
  id: string;
  index: string;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  aside?: string;
}) {
  return (
    <header className="hs-head">
      <p className="hs-kicker">
        <span className="hs-index">{index}</span>
        {kicker}
      </p>
      <h2 id={id} className="hs-title">
        {title}
      </h2>
      {sub && <p className="hs-sub">{sub}</p>}
      {aside && (
        <p className="hs-aside" aria-hidden="true">
          {aside}
        </p>
      )}
    </header>
  );
}
