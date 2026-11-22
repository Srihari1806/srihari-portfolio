'use client';

import { CarFront } from 'lucide-react';
import type { ReactNode } from 'react';
import { builds, merge } from '@/data/roadtrip';
import { PRDCarousel } from './PRDCarousel';
import { ConversationalUI } from './ConversationalUI';
import { ProjectBillboard } from './ProjectBillboard';
import { Milestone } from './Milestone';
import { useTrip } from './TripContext';

type Side = 'left' | 'right';

export function StopHead({ id, km, kicker, title }: { id: string; km: number; kicker: string; title: ReactNode }) {
  return (
    <div className="rt-stop-head">
      <Milestone km={km} />
      <div>
        <p className="rt-kicker">{kicker}</p>
        <h2 id={`${id}-title`} className="rt-h2">
          {title}
        </h2>
      </div>
    </div>
  );
}

/* ---------------- 3 KM · three billboards along the bends ---------------- */
function AskChip({ name, chat }: { name: string; chat: 'cricfield' | 'hiremap' | 'cinephile' }) {
  const { playChat, discover } = useTrip();
  return (
    <button
      type="button"
      className="rt-ask"
      onClick={() => {
        playChat(chat);
        discover('products');
      }}
    >
      <span className="rt-av rt-av--car" aria-hidden="true">
        <CarFront />
      </span>
      The car has a question about {name}
    </button>
  );
}

export function BuildsStop() {
  return (
    <>
      {builds.projects.map((p, i) => {
        const road: Side = i % 2 === 0 ? 'left' : 'right';
        const id = i === 0 ? 'builds' : `build-${p.key}`;
        return (
          <section
            key={p.key}
            id={id}
            {...(i === 0 ? { 'data-km': builds.km } : {})}
            data-road={road}
            className={`rt-stop rt-stop--bb rt-stop--road-${road}${i === 0 ? ' rt-stop--first' : ''}`}
            aria-labelledby={i === 0 ? `${id}-title` : undefined}
            aria-label={i === 0 ? undefined : p.name}
          >
            <div className="rt-stop-main">
              {i === 0 && <StopHead id={id} km={builds.km} kicker={builds.kicker} title={builds.title} />}
              <div className="rt-bb-row">
                <ProjectBillboard project={p} index={i} />
                <ConversationalUI
                  id={p.key}
                  label={`The car asks about ${p.name}`}
                  className="rt-bb-convo"
                  idle={<AskChip name={p.name} chat={p.key} />}
                />
              </div>
              {i === builds.projects.length - 1 && <ConversationalUI id="builds" auto label="The bike sums up" className="rt-convo--after" />}
            </div>
          </section>
        );
      })}
    </>
  );
}

/* ---------------- 2 KM · the car joins, then the case studies ---------------- */
export function MergeStop() {
  const { discover } = useTrip();
  return (
    <section id="product-lab" data-km={merge.km} data-road="right" data-merge="" className="rt-stop rt-stop--road-right rt-stop--merge" aria-labelledby="product-lab-title">
      <div className="rt-stop-main">
        <div className="rt-convo-slot rt-convo-slot--merge">
          <ConversationalUI id="merge" auto label="The bike and the car meet" onReply={() => discover('decision')} />
          <ConversationalUI id="speed" label="Speed, then" replay={false} />
          <ConversationalUI id="judgment" label="Judgment, then" replay={false} />
          <ConversationalUI id="both" label="Both" replay={false} />
        </div>
        <StopHead id="product-lab" km={merge.km} kicker={merge.kicker} title={merge.title} />
        <PRDCarousel />
      </div>
    </section>
  );
}
