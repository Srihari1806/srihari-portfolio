'use client';

import type { ReactNode } from 'react';

/** Roadside billboard on steel legs, with two flood lamps over the board. */
export function RoadsideBillboard({
  big,
  small,
  tone = 'lime',
  className = '',
  action,
}: {
  big: ReactNode;
  small?: ReactNode;
  tone?: 'lime' | 'dark' | 'paper' | 'green';
  className?: string;
  action?: ReactNode;
}) {
  return (
    <figure className={`rp-bb rp-bb--${tone} ${className}`}>
      <span className="rp-bb-lamp rp-bb-lamp--l" aria-hidden="true" />
      <span className="rp-bb-lamp rp-bb-lamp--r" aria-hidden="true" />
      <div className="rp-bb-frame">
        <div className="rp-bb-poster">
          <p className="rp-bb-big">{big}</p>
          {small && <p className="rp-bb-small">{small}</p>}
          {action && <div className="rp-bb-action">{action}</div>}
        </div>
      </div>
      <span className="rp-bb-walk" aria-hidden="true" />
      <span className="rp-bb-leg rp-bb-leg--l" aria-hidden="true" />
      <span className="rp-bb-leg rp-bb-leg--r" aria-hidden="true" />
      <span className="rp-bb-ground" aria-hidden="true" />
    </figure>
  );
}
