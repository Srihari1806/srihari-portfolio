'use client';

/* The speaker panel in the cabin: a low rumble and the clack of the rails, made in the browser
   (no audio files). Off until the visitor turns it on; stops when the ride ends or the tab hides. */

import { useCallback, useEffect, useRef, useState } from 'react';

export function useTrainSound() {
  const [on, setOn] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const stopFn = useRef<(() => void) | null>(null);

  const start = useCallback(() => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    const ac = ctx.current ?? new AC();
    ctx.current = ac;
    void ac.resume();
    // brown noise → low-pass: the rumble under the floor
    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.5, ac.currentTime + 0.8);
    src.connect(lp).connect(master).connect(ac.destination);
    src.start();
    // clack-clack of the rail joints
    const clack = (t: number) => {
      const n = ac.createBufferSource();
      n.buffer = buf;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900;
      bp.Q.value = 2;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      n.connect(bp).connect(g).connect(master);
      n.start(t, Math.random());
      n.stop(t + 0.12);
    };
    let next = ac.currentTime + 0.3;
    const timer = window.setInterval(() => {
      while (next < ac.currentTime + 0.4) {
        clack(next);
        clack(next + 0.13);
        next += 1.05;
      }
    }, 150);
    stopFn.current = () => {
      window.clearInterval(timer);
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0, ac.currentTime, 0.15);
      window.setTimeout(() => src.stop(), 600);
    };
    return true;
  }, []);

  const stop = useCallback(() => {
    stopFn.current?.();
    stopFn.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (stopFn.current) {
      stop();
      setOn(false);
    } else setOn(start());
  }, [start, stop]);

  useEffect(() => {
    const vis = () => {
      if (document.hidden && stopFn.current) {
        stop();
        setOn(false);
      }
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      document.removeEventListener('visibilitychange', vis);
      stop();
      void ctx.current?.close();
    };
  }, [stop]);

  return { on, toggle };
}
