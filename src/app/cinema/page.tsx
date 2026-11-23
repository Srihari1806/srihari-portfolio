import type { Metadata } from 'next';
import { CinemaGame } from '@/components/cinema/game/CinemaGame';
import { letterboxd } from '@/data/tfi';

export const metadata: Metadata = {
  title: 'Cinema | Srihari',
  description: 'Walk through a Hyderabad-inspired single-screen cinema and explore Srihari’s film diary, writing, original music and creative work.',
};

export default function Cinema() {
  return <CinemaGame user={process.env.LETTERBOXD_USERNAME || letterboxd.username} />;
}
