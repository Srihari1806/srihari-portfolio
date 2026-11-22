import type { Metadata } from 'next';
import art from '@/assets/tfi/sticker-write.webp';
import { RoomNote } from '@/components/tfi/RoomNote';

export const metadata: Metadata = { title: 'Writing — srihari.', description: 'Notes, scripts and ideas. The notebook is still in drafts.' };

export default function Writing() {
  return (
    <RoomNote
      art={art}
      title="The notebook is still in drafts."
      body="Notes, scripts and ideas are on their way. Lyrics and poetry already live on the creative page."
      next={{ label: 'Read the creative side', href: '/creative' }}
    />
  );
}
