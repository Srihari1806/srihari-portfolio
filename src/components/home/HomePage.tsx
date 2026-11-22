'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { useMode } from '@/context/ModeContext';
import { TfiHome } from '@/components/tfi/TfiHome';
import { NormalHome } from './NormalHome';

/**
 * Day = the Normal homepage (unchanged). Night = TFI mode, the illustrated room.
 * The choice is remembered by ModeContext (localStorage) across pages and reloads.
 */
export function HomePage() {
  const { mode, toggleMode, isMounted } = useMode();
  const reduce = useReducedMotion();
  const [dusk, setDusk] = useState<null | 'to-night' | 'to-day'>(null);
  const busy = useRef(false);

  // a short sunset (or sunrise) wash hides the swap between the two homepages
  const switchMode = useCallback(() => {
    if (busy.current) return;
    if (reduce) {
      toggleMode();
      return;
    }
    busy.current = true;
    setDusk(mode === 'tfi' ? 'to-day' : 'to-night');
    window.setTimeout(() => {
      toggleMode();
      window.scrollTo(0, 0);
    }, 420);
    window.setTimeout(() => {
      setDusk(null);
      busy.current = false;
    }, 520);
  }, [mode, reduce, toggleMode]);

  const night = isMounted && mode === 'tfi';

  return (
    <>
      <div data-home={night ? 'tfi' : 'normal'}>
        {night ? <TfiHome onToggleTheme={switchMode} /> : <NormalHome onToggleTheme={switchMode} />}
      </div>
      <AnimatePresence>
        {dusk && (
          <motion.div
            key={dusk}
            className={`home-dusk home-dusk--${dusk}`}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.55 } }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
