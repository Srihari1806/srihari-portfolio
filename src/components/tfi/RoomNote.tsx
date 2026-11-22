import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './tfi.css';

/** A small holding page for rooms that aren't furnished yet (Play, Write). Honest, short, on-palette. */
export function RoomNote({ art, title, body, next }: { art: StaticImageData; title: string; body: string; next: { label: string; href: string } }) {
  return (
    <div className="tfi-note-page">
      <main className="tfi-note">
        <Image src={art} alt="" className="tfi-note-art" priority sizes="240px" />
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="tfi-note-links">
          <Link href="/" className="tfi-note-btn">
            <ArrowLeft aria-hidden="true" /> Back to the room
          </Link>
          <Link href={next.href} className="tfi-note-link">
            {next.label} <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </main>
    </div>
  );
}
