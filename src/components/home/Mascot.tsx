import { getImageProps } from 'next/image';
import mascot from '@/assets/home/mascot.webp';
import mascotMobile from '@/assets/home/mascot-mobile.webp';
import { hero } from '@/data/home';
import { HandArrow } from './Doodles';

const ALT =
  'Illustrated cricket-ball mascot in sunglasses and headphones, relaxing with a laptop and popcorn';

/** Cricket-ball mascot with the handwritten note. Mobile gets its own crop and note. */
export function Mascot() {
  const common = { alt: ALT, sizes: '(min-width: 1200px) 330px, (min-width: 768px) 42vw, 46vw', priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: mascot });
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: mascotMobile });

  return (
    <div className="hm-mascot">
      <p className="hm-handnote" aria-label="Into: code, circuits, cricket, cinema and a lot of memes">
        {hero.handNote.map((line) => (
          <span key={line} className="hm-hide-mobile" aria-hidden="true">
            {line}
          </span>
        ))}
        {hero.handNoteMobile.map((line) => (
          <span key={`m-${line}`} className="hm-only-mobile" aria-hidden="true">
            {line}
          </span>
        ))}
      </p>
      <HandArrow className="hm-handnote-arrow" />
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...imgProps} className="hm-mascot-img" />
      </picture>
    </div>
  );
}
