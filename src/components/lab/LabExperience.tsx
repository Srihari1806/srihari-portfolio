'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Maximize2, Minimize2, Power } from 'lucide-react';
import mascot from '@/assets/home/mascot.webp';
import { useRole } from '@/context/RoleContext';
import { experiments, experimentById, STATUS_TEXT, type Experiment, type Instrument } from '@/data/labExperiments';
import { TerminalOS, type OsAction } from './os/TerminalOS';
import { capture, defaultScope, drawScope, type ScopeState } from './os/scope';
import { ArchPanel, BoardPanel, FLOW, MonitorPanel, NotebookPanel, PIPELINE, ScopePanel, ServerPanel, type BoardState } from './panels';
import type { LabEngine } from './scene/engine';
import type { HotId } from './scene/room';
import { LabPage } from './LabPage';
import '@fontsource/vt323/400.css';
import './lab-experience.css';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Lab', href: '/lab' },
  { label: 'Cinema', href: '/cinema' },
  { label: 'About', href: '/about' },
];

const INSTRUMENTS: { id: Instrument; label: string; short: string }[] = [
  { id: 'crt', label: 'Curiosity OS', short: 'Computer' },
  { id: 'scope', label: 'Oscilloscope', short: 'Scope' },
  { id: 'breadboard', label: 'Breadboard', short: 'Breadboard' },
  { id: 'wall', label: 'Architecture wall', short: 'Blueprints' },
  { id: 'monitor', label: 'Data monitor', short: 'Data' },
  { id: 'server', label: 'Server rack', short: 'Server' },
  { id: 'notebook', label: 'Research journal', short: 'Journal' },
];
const TITLES: Record<Instrument, string> = {
  crt: 'CURIOSITY OS',
  scope: 'Signal bench · oscilloscope',
  breadboard: 'Embedded basics · breadboard',
  wall: 'Architecture wall',
  monitor: 'Data & intelligence',
  server: 'Request-flow explorer',
  notebook: 'Things I Broke, Fixed & Learned.',
};
const TOGGLES: HotId[] = ['lamp', 'window', 'headphones', 'fan', 'crtPower'];

/* ambient sound: brown noise through a low-pass, only after the visitor asks for it */
function makeAmbient() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.2;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  src.connect(lp).connect(gain).connect(ctx.destination);
  src.start();
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.2);
  return {
    stop: () => {
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      window.setTimeout(() => ctx.close(), 600);
    },
  };
}

function drawMonitor(c: CanvasRenderingContext2D, w: number, h: number, t: number) {
  c.fillStyle = '#071512';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#7ad7c4';
  c.font = '30px "VT323", monospace';
  c.fillText('CRICFIELD · DATA PIPELINE', 34, 52);
  c.fillStyle = 'rgba(122,215,196,.55)';
  c.font = '22px "VT323", monospace';
  c.fillText('stages as documented in the repo README', 34, 82);
  const bw = 150, gap = (w - 68 - bw * 3) / 2;
  PIPELINE.forEach((p, i) => {
    const x = 34 + (i % 3) * (bw + gap), y = 130 + Math.floor(i / 3) * 190;
    const on = Math.floor(t * 1.2) % PIPELINE.length === i;
    c.strokeStyle = on ? '#ffcf6b' : '#7ad7c4';
    c.lineWidth = 3;
    c.strokeRect(x, y, bw, 100);
    c.fillStyle = on ? '#ffcf6b' : '#bdf3e6';
    c.font = '22px "VT323", monospace';
    const words = p.split(' ');
    words.reduce<string[]>((acc, word) => {
      const lastL = acc[acc.length - 1];
      if (lastL && (lastL + ' ' + word).length < 14) acc[acc.length - 1] = lastL + ' ' + word;
      else acc.push(word);
      return acc;
    }, []).forEach((line, j) => c.fillText(line, x + 10, y + 32 + j * 24));
    if (i % 3 < 2) {
      c.strokeStyle = '#7ad7c4';
      c.beginPath();
      c.moveTo(x + bw + 8, y + 50);
      c.lineTo(x + bw + gap - 8, y + 50);
      c.stroke();
    }
  });
  c.fillStyle = 'rgba(122,215,196,.8)';
  c.font = '24px "VT323", monospace';
  c.fillText(`SQL> ${Math.floor(t * 2) % 2 ? '_' : ' '}   (playground planned)`, 34, h - 40);
  c.fillStyle = 'rgba(0,0,0,.2)';
  for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
}

function drawFgen(c: CanvasRenderingContext2D, w: number, h: number, freq: number) {
  c.fillStyle = '#1a0503';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#ff5a3a';
  c.font = '44px "VT323", monospace';
  c.fillText(`${String(Math.round(freq)).padStart(5, ' ')} Hz`, 14, 48);
}

export function LabExperience() {
  const router = useRouter();
  const reduce = !!useReducedMotion();
  const { activeRole } = useRole();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LabEngine | null>(null);
  const osRef = useRef<TerminalOS>(new TerminalOS());
  const inputRef = useRef<HTMLInputElement>(null);
  const fsRef = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef(new Map<HotId, HTMLButtonElement>());
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const [focus, setFocus] = useState<Instrument | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [link, setLink] = useState<{ href: string; label: string } | null>(null);
  const [fs, setFs] = useState(false);
  const [crt, setCrt] = useState({ power: true, brightness: 1, scanlines: true });
  const [scope, setScopeState] = useState<ScopeState>(defaultScope);
  const [board, setBoard] = useState<BoardState>({ power: true, mode: 'blink', pressed: false, duty: 128 });
  const [env, setEnv] = useState({ lamp: true, night: true, sound: false, fan: 1 });
  const [flow, setFlow] = useState({ step: -1, hit: false });
  const ambient = useRef<{ stop: () => void } | null>(null);
  const live = useRef({ scope, board, flow, focus, scopeT: 0 });
  live.current.scope = scope;
  live.current.board = board;
  live.current.flow = flow;
  live.current.focus = focus;

  const setScope = useCallback((p: Partial<ScopeState>) => setScopeState((s) => ({ ...s, ...p })), []);

  const go = useCallback((id: Instrument | null) => {
    setIntro(false);
    setFocus(id);
    setLink(null);
    engineRef.current?.focus(id);
    if (id === 'crt') window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 300);
  }, []);

  /* OS → room */
  useEffect(() => {
    osRef.current.onAction = (a: OsAction) => {
      if (a.type === 'focus') go(a.target);
      else if (a.type === 'directory') document.getElementById('lab-directory')?.scrollIntoView({ behavior: 'smooth' });
      else if (a.type === 'exit') go(null);
      else if (a.type === 'link') setLink({ href: a.href, label: a.label });
      else if (a.type === 'nav') router.push(a.href);
    };
  }, [go, router]);

  /* boot the engine (three.js is loaded only here) */
  useEffect(() => {
    let alive = true;
    (async () => {
      const mod = await import('./scene/engine');
      if (!alive) return;
      if (!mod.webglAvailable() || !canvasRef.current) {
        setWebgl(false);
        return;
      }
      setWebgl(true);
      let engine: LabEngine;
      try {
        engine = new mod.LabEngine(
          canvasRef.current,
          mascot.src,
          {
            hover: (h) => setHover(h ? h.label : null),
            pick: (id) => handlePick.current(id),
          },
          reduce,
        );
      } catch {
        setWebgl(false);
        return;
      }
      engineRef.current = engine;
      markerRefs.current.forEach((el, id) => engine.bindMarker(id, el));
      const room = engine.room;
      const crtCtx = room.crtCanvas.getContext('2d')!;
      const scCtx = room.scopeCanvas.getContext('2d')!;
      const monCtx = room.monitorCanvas.getContext('2d')!;
      const fgCtx = room.fgenCanvas.getContext('2d')!;
      let acc = 0, monAcc = 0, lastFreq = -1;
      engine.onFrame = (dt, t) => {
        const L = live.current;
        const os = osRef.current;
        os.tick(dt);
        if (os.dirty) {
          os.render(crtCtx, room.crtCanvas.width, room.crtCanvas.height);
          room.crtTexture.needsUpdate = true;
          const f = fsRef.current;
          if (f) f.getContext('2d')!.drawImage(room.crtCanvas, 0, 0, f.width, f.height);
        }
        // scope at ~30 fps
        acc += dt;
        if (acc > 1 / 30) {
          acc = 0;
          if (!L.scope.paused) L.scopeT += 1 / 30;
          const cap = capture(L.scope, L.scope.wave === 'sonar' ? L.scopeT % 0.064 : L.scopeT % 1, Math.floor(L.scopeT * 30));
          drawScope(scCtx, room.scopeCanvas.width, room.scopeCanvas.height, L.scope, cap);
          room.scopeTexture.needsUpdate = true;
          const ks = room.knobs;
          const r = (v: number, a: number, b: number) => -2.3 + ((v - a) / (b - a)) * 4.6;
          ks[0].rotation.y = r(L.scope.freq, 20, 1200);
          ks[1].rotation.y = r(L.scope.amp, 0.2, 4);
          ks[2].rotation.y = r(L.scope.timeDiv, 0.5, 10);
          ks[3].rotation.y = r(L.scope.voltDiv, 0.25, 2);
          ks[4].rotation.y = r(L.scope.noise, 0, 2);
          ks[5].rotation.y = r(L.scope.cutoff, 50, 3000);
        }
        if (L.scope.freq !== lastFreq) {
          lastFreq = L.scope.freq;
          drawFgen(fgCtx, room.fgenCanvas.width, room.fgenCanvas.height, L.scope.freq);
          room.fgenTexture.needsUpdate = true;
        }
        monAcc += dt;
        if (monAcc > 0.4) {
          monAcc = 0;
          drawMonitor(monCtx, room.monitorCanvas.width, room.monitorCanvas.height, t);
          room.monitorTexture.needsUpdate = true;
        }
        // breadboard LEDs follow the circuit
        const b = L.board;
        const on = b.power;
        room.leds.red.emissiveIntensity = on && b.mode === 'blink' && Math.floor(t * 2) % 2 === 0 ? 3 : 0;
        room.leds.green.emissiveIntensity = on && b.mode === 'button' && b.pressed ? 3 : 0;
        room.leds.amber.emissiveIntensity = on && b.mode === 'pwm' ? (b.duty / 255) * 3.4 : 0;
        // server LEDs: idle twinkle, or a sweep while a request is in flight
        room.serverLeds.forEach((m, i) => {
          const active = L.flow.step >= 0;
          m.emissiveIntensity = active ? (Math.floor(t * 12 + i) % 3 === 0 ? 3 : 0.4) : Math.sin(t * (1.3 + (i % 5) * 0.7) + i) > 0.2 ? 1.6 : 0.15;
        });
        room.crtLed.emissiveIntensity = os.powered ? 2.4 : 0.05;
        room.crtGlow.intensity = os.powered ? 0.22 * os.brightness : 0;
      };
      setReady(true);
      // deep link: /lab?exp=<id>
      const q = new URLSearchParams(window.location.search);
      const exp = experimentById(q.get('exp'));
      if (exp) window.setTimeout(() => go(exp.instrument), 400);
    })();
    return () => {
      alive = false;
      engineRef.current?.dispose();
      engineRef.current = null;
      ambient.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* picks from the 3D room */
  const handlePick = useRef<(id: HotId) => void>(() => {});
  handlePick.current = (id: HotId) => {
    setIntro(false);
    const e = engineRef.current;
    if (!e) return;
    if (TOGGLES.includes(id)) {
      if (id === 'lamp')
        setEnv((s) => {
          const lamp = !s.lamp;
          e.room.lamp.light.intensity = lamp ? 5.5 : 0;
          e.room.lamp.fill.intensity = lamp ? 1.1 : 0;
          e.room.lamp.bulb.emissiveIntensity = lamp ? 3 : 0;
          return { ...s, lamp };
        });
      if (id === 'window')
        setEnv((s) => {
          const night = !s.night;
          e.room.windowGlass.map = night ? e.room.skylines.night : e.room.skylines.evening;
          e.room.windowGlass.needsUpdate = true;
          e.room.moon.color.set(night ? '#9ab4ff' : '#ffb27a');
          e.room.moon.intensity = night ? 0.6 : 1.1;
          return { ...s, night };
        });
      if (id === 'fan')
        setEnv((s) => {
          const fan = (s.fan + 1) % 3;
          e.fanSpeed = fan;
          return { ...s, fan };
        });
      if (id === 'headphones')
        setEnv((s) => {
          if (s.sound) {
            ambient.current?.stop();
            ambient.current = null;
          } else {
            try {
              ambient.current = makeAmbient();
            } catch {
              /* no audio available */
            }
          }
          return { ...s, sound: !s.sound };
        });
      if (id === 'crtPower') togglePower();
      return;
    }
    if (live.current.focus === id && id === 'crt') {
      inputRef.current?.focus({ preventScroll: true });
      return;
    }
    go(id as Instrument);
  };

  const togglePower = () => {
    const os = osRef.current;
    if (os.powered) os.powerOff();
    else os.powerOn();
    setCrt((c) => ({ ...c, power: os.powered }));
  };

  /* Esc steps back */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (fs) setFs(false);
      else if (live.current.focus) go(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fs, go]);

  /* request-flow animation */
  const runFlow = () => {
    const steps = flow.hit ? FLOW.length - 1 : FLOW.length;
    let i = 0;
    setFlow((f) => ({ ...f, step: 0 }));
    const t = window.setInterval(() => {
      i++;
      if (i >= steps) {
        window.clearInterval(t);
        window.setTimeout(() => setFlow((f) => ({ ...f, step: -1 })), 900);
        setFlow((f) => ({ ...f, step: steps - 1 }));
      } else setFlow((f) => ({ ...f, step: i }));
    }, reduce ? 200 : 750);
  };

  const ordered = useMemo(() => {
    if (!activeRole) return experiments;
    return [...experiments].sort((a, b) => Number(b.roles.includes(activeRole)) - Number(a.roles.includes(activeRole)));
  }, [activeRole]);

  const openExp = (e: Experiment) => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    window.setTimeout(() => go(e.instrument), 350);
  };

  const hotsWithMarkers: { id: HotId; label: string }[] = [
    { id: 'crt', label: 'Computer' },
    { id: 'scope', label: 'Oscilloscope' },
    { id: 'breadboard', label: 'Breadboard' },
    { id: 'wall', label: 'Blueprints' },
    { id: 'monitor', label: 'Data' },
    { id: 'notebook', label: 'Journal' },
    { id: 'server', label: 'Server' },
    { id: 'lamp', label: 'Lamp' },
    { id: 'window', label: 'Window' },
    { id: 'headphones', label: 'Sound' },
  ];

  if (webgl === false) return <LabFallback ordered={ordered} />;

  return (
    <div className={`lx${focus ? ` is-focus is-${focus}` : ''}`}>
      <section className="lx-stage" aria-label="Curiosity Lab — interactive engineering room">
        <canvas ref={canvasRef} className="lx-canvas" />

        <header className="lx-bar">
          <Link href="/" className="lx-logo">
            srihari<span>.</span>
          </Link>
          <nav aria-label="Main navigation" className="lx-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={n.href === '/lab' ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <a href="#lab-directory" className="lx-skip">
            Skip to experiments ↓
          </a>
        </header>

        {/* markers on the equipment */}
        <div className="lx-markers" aria-hidden={!!focus}>
          {hotsWithMarkers.map((h) => (
            <button
              key={h.id}
              type="button"
              ref={(el) => {
                if (el) markerRefs.current.set(h.id, el);
                else markerRefs.current.delete(h.id);
                engineRef.current?.bindMarker(h.id, el);
              }}
              className={`lx-marker${TOGGLES.includes(h.id) ? ' is-toggle' : ''}`}
              onClick={() => handlePick.current(h.id)}
              tabIndex={focus ? -1 : 0}
            >
              <i aria-hidden="true" />
              <span>{h.label}</span>
            </button>
          ))}
        </div>

        {hover && !focus && <p className="lx-hover">{hover}</p>}

        {!ready && (
          <div className="lx-loading" role="status">
            <span>Warming up the soldering iron…</span>
          </div>
        )}

        {intro && (
          <div className="lx-intro">
            <p className="lx-intro-sys">&gt; Curiosity detected. System initialized.</p>
            <h1 className="lx-intro-title">CURIOSITY LAB</h1>
            <p className="lx-intro-sub">Built it. Broke it. Understood it.</p>
            <div className="lx-intro-actions">
              <button type="button" className="lx-btn lx-btn--amber" onClick={() => setIntro(false)} disabled={!ready}>
                {ready ? 'Enter the lab' : 'Loading…'}
              </button>
              <button type="button" className="lx-btn" onClick={() => go('crt')} disabled={!ready}>
                Sit at the computer
              </button>
              <a href="#lab-directory" className="lx-btn lx-btn--ghost" onClick={() => setIntro(false)}>
                Skip to experiments
              </a>
            </div>
            <p className="lx-intro-hint">Click anything that glows. Drag to look around. Esc steps back.</p>
          </div>
        )}

        {/* the focused instrument's controls */}
        {focus && (
          <aside className={`lx-panel lx-panel--${focus}`} aria-label={TITLES[focus]}>
            <div className="lx-panel-head">
              <button type="button" className="lx-back" onClick={() => go(null)}>
                <ArrowLeft aria-hidden="true" /> Back to the bench <kbd>Esc</kbd>
              </button>
              <h2>{TITLES[focus]}</h2>
            </div>
            {focus === 'crt' && (
              <div className="lx-panel-body">
                <p className="lx-p">Type on your keyboard — the terminal is live. Try <code>help</code>, <code>projects</code>, <code>sort</code> or <code>electronics</code>.</p>
                <div className="lx-quick">
                  {['help', 'about', 'skills', 'projects', 'software', 'sort', 'architecture', 'experiments'].map((c) => (
                    <button key={c} type="button" onClick={() => osRef.current.run(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="lx-row">
                  <button type="button" className={`lx-toggle${crt.power ? ' is-on' : ''}`} onClick={togglePower} aria-pressed={crt.power}>
                    <Power aria-hidden="true" /> {crt.power ? 'On' : 'Off'}
                  </button>
                  <button
                    type="button"
                    className={`lx-toggle${crt.scanlines ? ' is-on' : ''}`}
                    aria-pressed={crt.scanlines}
                    onClick={() => {
                      osRef.current.scanlines = !crt.scanlines;
                      osRef.current.dirty = true;
                      setCrt((c) => ({ ...c, scanlines: !c.scanlines }));
                    }}
                  >
                    Scanlines
                  </button>
                  <button type="button" className="lx-toggle" onClick={() => setFs(true)}>
                    <Maximize2 aria-hidden="true" /> Fullscreen
                  </button>
                </div>
                <label className="lx-range">
                  Brightness
                  <input
                    type="range"
                    min={0.35}
                    max={1}
                    step={0.05}
                    value={crt.brightness}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      osRef.current.brightness = v;
                      osRef.current.dirty = true;
                      setCrt((c) => ({ ...c, brightness: v }));
                    }}
                  />
                </label>
                {link && (
                  <a href={link.href} className="lx-link" {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {link.label} <ArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
            {focus === 'scope' && <ScopePanel st={scope} set={setScope} />}
            {focus === 'breadboard' && <BoardPanel st={board} set={(p) => setBoard((b) => ({ ...b, ...p }))} />}
            {focus === 'wall' && <ArchPanel />}
            {focus === 'monitor' && <MonitorPanel />}
            {focus === 'server' && <ServerPanel step={flow.step} hit={flow.hit} setHit={(v) => setFlow((f) => ({ ...f, hit: v }))} run={runFlow} />}
            {focus === 'notebook' && <NotebookPanel />}
          </aside>
        )}

        {/* hidden input: the CRT's keyboard (also brings up the phone keyboard) */}
        <input
          ref={inputRef}
          className="lx-kbd"
          aria-label="Curiosity OS terminal input"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          tabIndex={focus === 'crt' ? 0 : -1}
          onKeyDown={(e) => {
            if (['Enter', 'Backspace', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key) || (e.ctrlKey && e.key === 'l')) {
              e.preventDefault();
              osRef.current.key(e);
            }
          }}
          onInput={(e) => {
            const v = e.currentTarget.value;
            for (const ch of v) osRef.current.key({ key: ch });
            e.currentTarget.value = '';
          }}
        />

        {/* phones and keyboard users: pick an instrument directly */}
        <nav className="lx-chips" aria-label="Instruments">
          {INSTRUMENTS.map((i) => (
            <button key={i.id} type="button" aria-pressed={focus === i.id} onClick={() => go(focus === i.id ? null : i.id)} disabled={!ready}>
              {i.short}
            </button>
          ))}
        </nav>

        {fs && (
          <div className="lx-fs" role="dialog" aria-label="Curiosity OS fullscreen" onClick={() => inputRef.current?.focus()}>
            <canvas ref={fsRef} width={1024} height={768} />
            <button type="button" className="lx-toggle" onClick={() => setFs(false)}>
              <Minimize2 aria-hidden="true" /> Exit fullscreen <kbd>Esc</kbd>
            </button>
          </div>
        )}
      </section>

      <Directory ordered={ordered} openExp={openExp} canOpen />
    </div>
  );
}

function Directory({ ordered, openExp, canOpen }: { ordered: Experiment[]; openExp?: (e: Experiment) => void; canOpen: boolean }) {
  const domains = Array.from(new Set(ordered.map((e) => e.domain)));
  return (
    <section id="lab-directory" className="lx-dir" aria-labelledby="lx-dir-title">
      <div className="lx-dir-head">
        <p className="lx-dir-kicker">Experiment directory</p>
        <h2 id="lx-dir-title">Everything on the bench, without the walking.</h2>
        <p className="lx-dir-sub">
          Statuses are literal: <b>Completed</b>, <b>Prototype</b> (works now), <b>In progress</b>, <b>Planned</b>. Link straight to one with <code>/lab?exp=…</code>.
        </p>
      </div>
      {domains.map((d) => (
        <div key={d} className="lx-dir-group">
          <h3>{d}</h3>
          <ul>
            {ordered
              .filter((e) => e.domain === d)
              .map((e) => (
                <li key={e.id} id={`exp-${e.id}`} className={`lx-exp lx-exp--${e.status}`}>
                  <div className="lx-exp-top">
                    <span className={`lx-st lx-st--${e.status}`}>{STATUS_TEXT[e.status]}</span>
                    <h4>{e.title}</h4>
                  </div>
                  <p>{e.summary}</p>
                  <p className="lx-exp-skills">{e.skills.join(' · ')}</p>
                  <div className="lx-exp-links">
                    {canOpen && e.status !== 'planned' && openExp && (
                      <button type="button" onClick={() => openExp(e)}>
                        Open on the bench →
                      </button>
                    )}
                    {e.source && (
                      <a href={e.source.href} target="_blank" rel="noopener noreferrer">
                        {e.source.label} ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <p className="lx-close">The lab closes. Curiosity doesn’t.</p>
    </section>
  );
}

function LabFallback({ ordered }: { ordered: Experiment[] }) {
  return (
    <div className="lx lx--fallback">
      <p className="lx-fallback-note">Your browser can’t show the 3D lab, so here is the same content as pages.</p>
      <LabPage />
      <Directory ordered={ordered} canOpen={false} />
    </div>
  );
}
