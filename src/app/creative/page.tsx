import type { Metadata } from 'next';
import { CreativePage } from '@/components/roadtrip/CreativePage';

export const metadata: Metadata = {
  title: 'Creative — srihari. | The other side of the screen',
  description: 'Independent music, songwriting and creative publishing: Kalakshetra / Desi Muchhatlu, Sahitya Rachanalu and original songs.',
};

export default function Creative() {
  return <CreativePage />;
}
