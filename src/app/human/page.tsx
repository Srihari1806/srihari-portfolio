import type { Metadata } from 'next';
import art from '@/assets/tfi/sticker-write.webp';
import { RoomNote } from '@/components/tfi/RoomNote';

export const metadata: Metadata = {
  title: 'Human — srihari.',
  description: 'Behind the code: stories, instincts, cinema, music and what keeps me curious.',
};

export default function HumanPage() {
  return (
    <RoomNote
      art={art}
      title="Meet the human behind the terminal."
      body="Engineer by degree, storyteller by instinct. Between software architectures and circuits, you will find me watching regional cinema, writing songs, and overthinking cricket data."
      next={{ label: 'Explore the road trip', href: '/work' }}
    />
  );
}
