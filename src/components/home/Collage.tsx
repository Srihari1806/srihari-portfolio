import Image from 'next/image';
import collage from '@/assets/home/collage.webp';

/**
 * Layered creative collage: taped film frame, cricket blueprint, circuit board,
 * cinema ticket and pixel-art meme sticker.
 */
export function Collage() {
  return (
    <div className="hm-collage">
      <Image
        src={collage}
        alt="Collage of a sunset film-camera frame, a cricket batting blueprint, a circuit board, a cinema admit-one ticket and a pixel-art cat sticker"
        className="hm-collage-img"
        sizes="(min-width: 1200px) 530px, (min-width: 768px) 55vw, 92vw"
        priority
      />
    </div>
  );
}
