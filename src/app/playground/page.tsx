import type { Metadata } from 'next';
import art from '@/assets/tfi/sticker-play.webp';
import { RoomNote } from '@/components/tfi/RoomNote';

export const metadata: Metadata = { title: 'Playground — srihari.', description: 'Experiments, lab builds and small fun things. Moving in soon.' };

export default function Playground() {
  return (
    <RoomNote
      art={art}
      title="The playground is still being wired up."
      body="Experiments, lab builds and small fun things are moving in soon. Until then, the finished stuff is parked on the road."
      next={{ label: 'See the projects', href: '/work' }}
    />
  );
}
