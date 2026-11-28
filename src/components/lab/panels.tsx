'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { architectures } from '@/data/labArchitecture';
import { capture, defaultScope, peakHz, rms, SAMPLE_RATE, type ScopeState, type Wave } from './os/scope';

/* Instrument panels docked beside the focused equipment. Each one operates the real thing in the
   room: knobs turn, LEDs light, the server blinks. */

export function Knob({ label, value, min, max, step, unit, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  const angle = -135 + ((value - min) / (max - min)) * 270;
  return (
    <label className="lx-knob">
      <span className="lx-knob-dial" style={{ transform: `rotate(${angle}deg)` }} aria-hidden="true">
        <i />
      </span>
      <span className="lx-knob-txt">
        <b>{label}</b>
        <span>
          {fmt ? fmt(value) : value} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={`${label} (${unit})`} />
    </label>
  );
}

/* ---------------- oscilloscope ---------------- */
export function ScopePanel({ st, set }: { st: ScopeState; set: (p: Partial<ScopeState>) => void }) {
  const cap = useMemo(() => capture(st, 0, 7), [st]);
  const ratio = rms(cap.noisy) > 0 ? rms(cap.filtered) / rms(cap.noisy) : 0;
  const waves: Wave[] = ['sine', 'square', 'triangle', 'sawtooth', 'sonar'];
  return (
    <div className="lx-panel-body">
      <div className="lx-seg" role="group" aria-label="Waveform">
        {waves.map((w) => (
          <button key={w} type="button" aria-pressed={st.wave === w} onClick={() => set({ wave: w })}>
            {w === 'sonar' ? 'sonar ping*' : w}
          </button>
        ))}
      </div>
      <div className="lx-knobs">
        <Knob label="Frequency" value={st.freq} min={20} max={1200} step={5} unit="Hz" onChange={(v) => set({ freq: v })} />
        <Knob label="Amplitude" value={st.amp} min={0.2} max={4} step={0.1} unit="V" onChange={(v) => set({ amp: v })} fmt={(v) => v.toFixed(1)} />
        <Knob label="Phase" value={st.phase} min={0} max={360} step={5} unit="°" onChange={(v) => set({ phase: v })} />
        <Knob label="Noise" value={st.noise} min={0} max={2} step={0.05} unit="V rms" onChange={(v) => set({ noise: v })} fmt={(v) => v.toFixed(2)} />
        <Knob label="Low-pass" value={st.cutoff} min={50} max={3000} step={10} unit="Hz" onChange={(v) => set({ cutoff: v })} />
        <Knob label="Time / div" value={st.timeDiv} min={0.5} max={10} step={0.5} unit="ms" onChange={(v) => set({ timeDiv: v })} />
        <Knob label="Volts / div" value={st.voltDiv} min={0.25} max={2} step={0.25} unit="V" onChange={(v) => set({ voltDiv: v })} fmt={(v) => v.toFixed(2)} />
      </div>
      <div className="lx-seg" role="group" aria-label="Traces">
        {(['original', 'noisy', 'filtered'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={st.show[k]} className={`lx-trace lx-trace--${k}`} onClick={() => set({ show: { ...st.show, [k]: !st.show[k] } })}>
            {k}
          </button>
        ))}
        <button type="button" aria-pressed={st.view === 'fft'} onClick={() => set({ view: st.view === 'fft' ? 'time' : 'fft' })}>
          FFT
        </button>
        <button type="button" aria-pressed={st.paused} onClick={() => set({ paused: !st.paused })}>
          {st.paused ? 'Run' : 'Stop'}
        </button>
        <button type="button" onClick={() => set(defaultScope())}>
          Reset
        </button>
      </div>
      <dl className="lx-readout">
        <div>
          <dt>Peak (FFT)</dt>
          <dd>{peakHz(cap.spectrum).toFixed(0)} Hz</dd>
        </div>
        <div>
          <dt>Noisy rms</dt>
          <dd>{rms(cap.noisy).toFixed(2)} V</dd>
        </div>
        <div>
          <dt>Filtered / noisy</dt>
          <dd>{(ratio * 100).toFixed(0)}%</dd>
        </div>
      </dl>
      <details className="lx-notes">
        <summary>Engineering notes</summary>
        <p>
          Sampling: {SAMPLE_RATE} Hz, 1024 samples per capture, so the bench can represent tones up to {SAMPLE_RATE / 2} Hz (Nyquist). Noise is Gaussian, added per sample.
        </p>
        <p>
          Filter: first-order IIR low-pass, <code>y[k] = y[k−1] + α(x[k] − y[k−1])</code> with <code>α = Δt / (RC + Δt)</code>, <code>RC = 1/(2π·f_c)</code>. Square and sawtooth waves lose their sharp edges as you lower the cut-off — that is
          their high harmonics being removed.
        </p>
        <p>Spectrum: Hann-windowed radix-2 FFT of the noisy capture; the peak bin is reported above.</p>
        <p>* Sonar ping is synthetic: a linear chirp every 64 ms with a weaker echo 18 ms later. It uses no real or internship data.</p>
      </details>
    </div>
  );
}

/* ---------------- breadboard ---------------- */
export type BoardState = { power: boolean; mode: 'blink' | 'button' | 'pwm'; pressed: boolean; duty: number };
const CODE: Record<BoardState['mode'], string> = {
  blink: `void setup() { pinMode(13, OUTPUT); }
void loop() {
  digitalWrite(13, HIGH); delay(500);
  digitalWrite(13, LOW);  delay(500);
}`,
  button: `void setup() {
  pinMode(2, INPUT_PULLUP);   // button to GND
  pinMode(12, OUTPUT);
}
void loop() {
  digitalWrite(12, digitalRead(2) == LOW);
}`,
  pwm: `int duty = 128;               // 0..255
void setup() { pinMode(9, OUTPUT); }
void loop() { analogWrite(9, duty); }`,
};
const EXPLAIN: Record<BoardState['mode'], string> = {
  blink: 'Pin 13 → 220 Ω → red LED → GND. The loop toggles the pin every 500 ms, so the LED blinks at 1 Hz.',
  button: 'Pin 2 reads a push button wired to GND with the internal pull-up, so pressed reads LOW. Pin 12 drives the green LED through 220 Ω.',
  pwm: 'Pin 9 outputs PWM (~490 Hz on an Uno). The LED sees the average voltage, so a higher duty cycle looks brighter.',
};
export function BoardPanel({ st, set }: { st: BoardState; set: (p: Partial<BoardState>) => void }) {
  return (
    <div className="lx-panel-body">
      <div className="lx-seg" role="group" aria-label="Circuit">
        {(['blink', 'button', 'pwm'] as const).map((m) => (
          <button key={m} type="button" aria-pressed={st.mode === m} onClick={() => set({ mode: m })}>
            {m === 'blink' ? 'LED blink' : m === 'button' ? 'Button → LED' : 'PWM dimming'}
          </button>
        ))}
      </div>
      <div className="lx-row">
        <button type="button" className={`lx-toggle${st.power ? ' is-on' : ''}`} aria-pressed={st.power} onClick={() => set({ power: !st.power })}>
          USB power {st.power ? 'ON' : 'OFF'}
        </button>
        {st.mode === 'button' && (
          <button
            type="button"
            className={`lx-toggle${st.pressed ? ' is-on' : ''}`}
            onPointerDown={() => set({ pressed: true })}
            onPointerUp={() => set({ pressed: false })}
            onPointerLeave={() => set({ pressed: false })}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && set({ pressed: true })}
            onKeyUp={() => set({ pressed: false })}
          >
            Hold the button
          </button>
        )}
      </div>
      {st.mode === 'pwm' && <Knob label="Duty cycle" value={st.duty} min={0} max={255} step={1} unit={`/ 255 (${Math.round((st.duty / 255) * 100)}%)`} onChange={(v) => set({ duty: v })} />}
      <p className="lx-p">{EXPLAIN[st.mode]}</p>
      <pre className="lx-code">
        <code>{CODE[st.mode]}</code>
      </pre>
      <p className="lx-fine">A visual demonstration of three circuits, not a circuit simulator. Wokwi links will be added when the simulations are published.</p>
    </div>
  );
}

/* ---------------- architecture explorer ---------------- */
export function ArchPanel() {
  const [key, setKey] = useState('cricfield');
  const d = architectures.find((a) => a.key === key)!;
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => setSel(d.nodes[0]?.id ?? null), [d]);
  const node = d.nodes.find((n) => n.id === sel);
  return (
    <div className="lx-panel-body">
      <div className="lx-seg" role="tablist" aria-label="Project">
        {architectures.map((a) => (
          <button key={a.key} type="button" role="tab" aria-selected={a.key === key} aria-pressed={a.key === key} onClick={() => setKey(a.key)}>
            {a.name}
          </button>
        ))}
      </div>
      <p className="lx-fine">{d.note}</p>
      {d.nodes.length > 0 ? (
        <div className="lx-arch">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {d.edges.map((e, i) => {
              const a = d.nodes.find((n) => n.id === e.from)!, b = d.nodes.find((n) => n.id === e.to)!;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cfe4f2" strokeWidth={0.5} strokeDasharray={e.inferred ? '1.6 1.4' : undefined} vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          {d.nodes.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`lx-node${sel === n.id ? ' is-on' : ''}${n.owner === 'team' ? ' is-team' : ''}${n.owner === 'mine' ? ' is-mine' : ''}`}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              onClick={() => setSel(n.id)}
              aria-pressed={sel === n.id}
            >
              {n.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="lx-arch lx-arch--empty">Blueprint intentionally blank.</div>
      )}
      {node && (
        <dl className="lx-dl">
          <div>
            <dt>Purpose</dt>
            <dd>{node.purpose}</dd>
          </div>
          {node.tech.length > 0 && (
            <div>
              <dt>Technologies</dt>
              <dd>{node.tech.join(' · ')}</dd>
            </div>
          )}
          {node.inputs && (
            <div>
              <dt>Inputs</dt>
              <dd>{node.inputs}</dd>
            </div>
          )}
          {node.outputs && (
            <div>
              <dt>Outputs</dt>
              <dd>{node.outputs}</dd>
            </div>
          )}
          {node.owner && (
            <div>
              <dt>Who built it</dt>
              <dd>{node.owner === 'mine' ? 'Me' : 'The team (not my contribution)'}</dd>
            </div>
          )}
          {node.source && (
            <div>
              <dt>Source</dt>
              <dd>{node.source}</dd>
            </div>
          )}
        </dl>
      )}
      <p className="lx-fine">Dashed = inferred connection. Why each technology was chosen and its trade-offs will be added from my own notes, not guessed.</p>
      {d.repo && (
        <a href={d.repo} target="_blank" rel="noopener noreferrer" className="lx-link">
          Repository <ArrowUpRight aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

/* ---------------- data monitor ---------------- */
export const PIPELINE = ['Cricsheet ball-by-ball', 'Python data scripts', 'SQLite warehouse', 'Model fitting (Python)', 'Static JSON / API', 'React analytics UI'];
export function MonitorPanel() {
  return (
    <div className="lx-panel-body">
      <p className="lx-p">The CricField pipeline, as documented in its README. Stage details beyond that are being written up — nothing here invents a method or an accuracy number.</p>
      <ol className="lx-pipe">
        {PIPELINE.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
      <ul className="lx-status">
        <li>
          <b>In progress</b> Schema walkthrough of the warehouse
        </li>
        <li>
          <b>Planned</b> Read-only SQL playground on a labelled sample dataset
        </li>
        <li>
          <b>Planned</b> Pressure Lab method, with worked examples
        </li>
        <li>
          <b>Planned</b> A small ML model you can tune · RAG evaluation bench
        </li>
      </ul>
      <Link href="/work/cricfield" className="lx-link">
        CricField project page <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ---------------- request-flow explorer ---------------- */
export const FLOW = [
  { k: 'browser', n: 'Browser', d: 'Builds the HTTP request: method, URL, headers. A cookie or token may ride along for authentication.' },
  { k: 'api', n: 'API', d: 'Validates input, authorises the caller, decides what data it needs.' },
  { k: 'cache', n: 'Cache', d: 'If a fresh copy exists (cache hit), answer now. Otherwise (miss) go to the database.' },
  { k: 'db', n: 'Database', d: 'Runs the query using indexes; returns rows. Usually the slowest step.' },
  { k: 'resp', n: 'Response', d: 'API shapes JSON, sets cache headers, sends it back; the cache keeps a copy for next time.' },
];
export function ServerPanel({ step, hit, setHit, run }: { step: number; hit: boolean; setHit: (v: boolean) => void; run: () => void }) {
  const path = hit ? FLOW.filter((f) => f.k !== 'db') : FLOW;
  return (
    <div className="lx-panel-body">
      <p className="lx-fine">Educational simulation of a typical web request. It is not a diagram of any deployed system of mine.</p>
      <div className="lx-row">
        <button type="button" className="lx-toggle is-on" onClick={run}>
          Send a request
        </button>
        <label className="lx-check">
          <input type="checkbox" checked={hit} onChange={(e) => setHit(e.target.checked)} /> Cache hit
        </label>
      </div>
      <ol className="lx-flow">
        {path.map((f, i) => (
          <li key={f.k} className={i === step ? 'is-on' : i < step ? 'is-done' : ''}>
            <b>{f.n}</b>
            <span>{f.d}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- notebook ---------------- */
const PAGES = [
  {
    t: 'Things I Broke, Fixed & Learned.',
    b: ['Every entry follows the same ten steps:', '1 Objective · 2 Hypothesis · 3 Methodology · 4 Implementation · 5 Inputs', '6 Outputs · 7 Results · 8 Limitations · 9 Lessons · 10 Source'],
  },
  { t: 'Entries', b: ['No entries are published yet.', 'The first ones are being written from real debugging sessions — they will appear here, dated, with links to code.'] },
  { t: 'Margin notes', b: ['Ground first, then blame the code.', 'fs > 2·f, always.', 'A cache is a copy, not the truth.', 'Built it. Broke it. Understood it.'] },
];
export function NotebookPanel() {
  const [p, setP] = useState(0);
  const [turn, setTurn] = useState<'' | 'next' | 'prev'>('');
  const go = (d: number) => {
    const n = Math.max(0, Math.min(PAGES.length - 1, p + d));
    if (n === p) return;
    setTurn(d > 0 ? 'next' : 'prev');
    window.setTimeout(() => {
      setP(n);
      setTurn('');
    }, 260);
  };
  const page = PAGES[p];
  return (
    <div className="lx-panel-body">
      <div className={`lx-page${turn ? ` is-${turn}` : ''}`}>
        <h3>{page.t}</h3>
        {page.b.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <span className="lx-page-n">
          {p + 1} / {PAGES.length}
        </span>
      </div>
      <div className="lx-row">
        <button type="button" className="lx-toggle" onClick={() => go(-1)} disabled={p === 0}>
          ← Previous page
        </button>
        <button type="button" className="lx-toggle" onClick={() => go(1)} disabled={p === PAGES.length - 1}>
          Next page →
        </button>
      </div>
    </div>
  );
}

/** small helper so panels can keep scroll position on swap */
export function useStable<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}
