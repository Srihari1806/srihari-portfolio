import type { Metadata } from 'next';
import { CinemaHall } from '@/components/cinema/CinemaHall';

export const metadata: Metadata = {
  title: 'Cinema — Srihari Talkies',
  description: 'Walk through a single-screen theatre: a release calendar, my recent Letterboxd watches, writing about films, and my original music.',
};

export default function Cinema() {
  return <CinemaHall />;
}
