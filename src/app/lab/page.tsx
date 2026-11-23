import type { Metadata } from 'next';
import art from '@/assets/tfi/sticker-play.webp';
import { RoomNote } from '@/components/tfi/RoomNote';

export const metadata: Metadata = {
  title: 'Lab — srihari.',
  description: 'Circuits, embedded systems and hardware prototypes. The lab workbench is being set up.',
};

export default function LabPage() {
  return (
    <RoomNote
      art={art}
      title="The lab workbench is being set up."
      body="Circuits, embedded systems, sensors and hardware prototypes are currently on the test bench. Until the schematics are published, explore the software builds parked on the road."
      next={{ label: 'See the projects', href: '/work' }}
    />
  );
}
