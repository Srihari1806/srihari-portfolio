'use client';

/* The boy in the room, as four "shots" of the same film.
   The room picture never moves. A restored patch paints the baked-in boy out of it; one pose layer at
   a time is laid on top; small frame swaps (eyes, hands, a breath) keep him alive. Pose changes are
   cuts: the frame dips, the old layer is removed, and only then is the new one shown, so two boys
   never share the screen. Everything is in room pixels (1672 × 941) inside .tfi-layer. */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import manifest from '@/data/tfiPoses.json';
import { character, type Box, type PoseKey } from '@/data/tfi';

type Layer = { src: string; box: number[]; mode?: 'part' | 'swap' };
type PoseArt = { a: Layer; b?: Layer; c?: Layer };
type Manifest = { version: number; plate?: Layer; bubble?: Layer; poses: Partial<Record<PoseKey, PoseArt>> };

const art = manifest as Manifest;
export const POSE_ORDER: PoseKey[] = ['rug', 'desk', 'tv', 'sleep'];
/** poses whose art has been made; empty until the artwork is ingested — then the old baked boy stays */
export const availablePoses: PoseKey[] = art.plate ? POSE_ORDER.filter((p) => art.poses[p]) : [];
export const charactersReady = availablePoses.length > 0;

const at = (b: number[] | Box): CSSProperties => ({ left: b[0], top: b[1], width: b[2] - b[0], height: b[3] - b[1] });

function Img({ layer, className = '', style }: { layer: Layer; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={layer.src} alt="" draggable={false} decoding="async" className={`tfi-ch-img ${className}`} style={{ ...at(layer.box), ...style }} />;
}

/** b-frame rhythm per pose: blink, type, or breathe */
const BEAT: Record<PoseKey, 'blink' | 'type' | 'breathe'> = { rug: 'blink', tv: 'blink', desk: 'type', sleep: 'breathe' };

function useBeat(pose: PoseKey | null, run: boolean) {
  const [b, setB] = useState(false);
  const [c, setC] = useState(false);
  useEffect(() => {
    setB(false);
    setC(false);
    if (!pose || !run) return;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const kind = BEAT[pose];
    if (kind === 'blink') {
      const blink = (then: () => void) => {
        setB(true);
        later(() => (setB(false), then()), 120);
      };
      const loop = () => later(() => blink(() => (Math.random() < 0.2 ? later(() => blink(loop), 170) : loop())), 2600 + Math.random() * 4200);
      loop();
    } else if (kind === 'type') {
      // bursts of key presses, then a pause to read what was typed
      const burst = (n: number) => {
        if (n <= 0) return later(() => burst(8 + Math.floor(Math.random() * 16)), 900 + Math.random() * 2200);
        setB((v) => !v);
        later(() => burst(n - 1), 95 + Math.random() * 80);
      };
      burst(10);
    } else {
      const breathe = () => (setB((v) => !v), later(breathe, 2300));
      later(breathe, 1200);
    }
    // the occasional glance: a head turn held for a moment (only if that frame was drawn)
    if (art.poses[pose]?.c && pose !== 'sleep') {
      const glance = () =>
        later(() => {
          setC(true);
          later(() => (setC(false), glance()), 1500 + Math.random() * 900);
        }, 9000 + Math.random() * 8000);
      glance();
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pose, run]);
  return { b, c };
}

/** Phone light on his face, shifting as he flicks from post to post. */
function ScreenGlow({ box }: { box: Box }) {
  return <div className="tfi-ch-glow" style={at(box)} aria-hidden="true" />;
}

export function TfiCharacter({ pose, cutting }: { pose: PoseKey | null; cutting: boolean }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  const live = !reduce && visible && !cutting;
  // every shot's frames are fetched up front, so a cut never lands on an empty frame
  useEffect(() => {
    if (!charactersReady) return;
    const all = Object.values(art.poses).flatMap((p) => [p?.a, p?.b, p?.c]);
    [art.bubble, ...all].forEach((l) => {
      if (l) new window.Image().src = l.src;
    });
  }, []);
  const { b, c } = useBeat(pose, live);
  if (!charactersReady || !art.plate) return null;
  const p = pose ? art.poses[pose] : undefined;
  const swapB = b && p?.b?.mode === 'swap';
  const swapC = c && p?.c?.mode === 'swap';
  const breathe = BEAT[pose ?? 'rug'] === 'breathe';

  return (
    <div className="tfi-ch" aria-hidden="true">
      <Img layer={art.plate} className="tfi-ch-plate" />
      {p && (
        <div key={pose} className={`tfi-ch-pose tfi-ch-pose--${pose} ${live && !breathe ? 'is-breathing' : ''}`}>
          {!swapB && !swapC && <Img layer={p.a} />}
          {p.b && (p.b.mode === 'swap' ? swapB && !swapC : true) && (
            <Img layer={p.b} className={`tfi-ch-b ${p.b.mode === 'part' ? (breathe ? 'is-soft' : '') : ''}`} style={{ opacity: p.b.mode === 'swap' || b ? 1 : 0 }} />
          )}
          {p.c && (p.c.mode === 'swap' ? swapC : true) && <Img layer={p.c} style={{ opacity: c ? 1 : 0 }} />}
          {pose === 'rug' && character.screenGlow && live && <ScreenGlow box={character.screenGlow} />}
        </div>
      )}
      {pose === 'rug' && art.bubble && <Img layer={art.bubble} className="tfi-ch-bubble" />}
    </div>
  );
}

/* ---------------- the director: which shot is on screen ---------------- */
const IDLE_SLEEP_MS = 45_000;

export function usePoseDirector() {
  const reduce = useReducedMotion();
  const first: PoseKey | null = availablePoses.includes('rug') ? 'rug' : availablePoses[0] ?? null;
  const [pose, setPose] = useState<PoseKey | null>(first);
  const [cutting, setCutting] = useState<false | 'cut' | 'time'>(false);
  const poseRef = useRef(pose);
  const awake = useRef<PoseKey | null>(first);
  const dwell = useRef(0);
  const timers = useRef<number[]>([]);

  const cutTo = useCallback(
    (next: PoseKey, kind: 'cut' | 'time' = 'cut') => {
      if (!availablePoses.includes(next) || next === poseRef.current) return;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      poseRef.current = next;
      if (next !== 'sleep') awake.current = next;
      if (reduce) return setPose(next);
      // dip → (old shot gone) → new shot → lift; the swap happens only while the frame is dark
      const dip = kind === 'time' ? 420 : 90;
      const hold = kind === 'time' ? 260 : 40;
      setCutting(kind);
      timers.current.push(
        window.setTimeout(() => setPose(next), dip),
        window.setTimeout(() => setCutting(false), dip + hold),
      );
    },
    [reduce],
  );

  /** hover/focus on a room object: a short dwell so sweeping the mouse across doesn't machine-gun cuts */
  const suggest = useCallback(
    (next: PoseKey | undefined) => {
      window.clearTimeout(dwell.current);
      if (!next) return;
      dwell.current = window.setTimeout(() => cutTo(next), 280);
    },
    [cutTo],
  );

  // nobody around for a while → he dozes off; the first sign of life wakes him into the last shot
  useEffect(() => {
    if (!availablePoses.includes('sleep')) return;
    let idle = 0;
    const arm = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => cutTo('sleep', 'time'), IDLE_SLEEP_MS);
    };
    const wake = () => {
      if (poseRef.current === 'sleep' && awake.current && awake.current !== 'sleep') cutTo(awake.current, 'time');
      arm();
    };
    const evs = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(idle);
      evs.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [cutTo]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  return { pose, cutting, cutTo, suggest };
}

/** The dark frame of a cut, with a breath of film grain. */
export function CutFrame({ kind }: { kind: false | 'cut' | 'time' }) {
  return <div className={`tfi-cut ${kind ? `is-${kind}` : ''}`} aria-hidden="true" />;
}

const LABEL: Record<PoseKey, string> = { rug: 'On the rug', desk: 'At the desk', tv: 'Watching TV', sleep: 'Asleep' };

/** Small scene picker, like reel numbers on a film can. */
export function SceneSelector({ pose, onPick }: { pose: PoseKey | null; onPick: (p: PoseKey) => void }) {
  if (availablePoses.length < 2) return null;
  return (
    <div className="tfi-scenes" role="group" aria-label="Choose what Srihari is doing">
      <span aria-hidden="true">Scene</span>
      {availablePoses.map((p, i) => (
        <button key={p} type="button" aria-pressed={pose === p} aria-label={LABEL[p]} title={LABEL[p]} onClick={() => onPick(p)}>
          {i + 1}
        </button>
      ))}
    </div>
  );
}
