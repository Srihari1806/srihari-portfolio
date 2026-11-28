'use client';

import { ArrowUpRight, X } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { resumeLink } from '@/data/profile';

/** "Explore my portfolio for:" — re-orders and highlights the page for one role family. */
export function RoleSelector() {
  const { activeRole, role, setActiveRole, availableRoles } = useRole();
  const cv = resumeLink(activeRole);

  return (
    <section className="hs-roles" aria-labelledby="hs-roles-label">
      <span className="hs-roles-stub" aria-hidden="true">Ticket</span>
      <div className="hs-roles-row">
        <p id="hs-roles-label" className="hs-roles-label">
          Explore my portfolio for:
        </p>
        <div className="hs-roles-chips" role="group" aria-labelledby="hs-roles-label">
          {availableRoles.map((r) => {
            const on = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                className={`hs-chip${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => setActiveRole(on ? null : r.id)}
              >
                {r.label}
              </button>
            );
          })}
          {activeRole && (
            <button type="button" className="hs-chip hs-chip--clear" onClick={() => setActiveRole(null)} aria-label="Clear role selection">
              <X aria-hidden="true" strokeWidth={2} />
              Everything
            </button>
          )}
        </div>
      </div>
      <div className="hs-roles-out" aria-live="polite">
        {role ? (
          <p>
            <strong>{role.label}:</strong> {role.focus} <span className="hs-roles-targets">Roles I’m aiming for — {role.targetRoles.join(' · ')}.</span>{' '}
            <a href={cv.href} className="hs-inline-link" {...(cv.isFile ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {cv.label}
              <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
            </a>
          </p>
        ) : (
          <p className="hs-roles-hint">Pick one — the page re-orders around it.</p>
        )}
      </div>
    </section>
  );
}
