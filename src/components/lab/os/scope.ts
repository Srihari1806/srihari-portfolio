/* The oscilloscope's maths: real signal generation, additive noise, a single-pole IIR low-pass
   filter and a radix-2 FFT. All samples are computed in the browser; nothing is pre-recorded. */

export type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'sonar';
export type ScopeView = 'time' | 'fft';

export type ScopeState = {
  wave: Wave;
  freq: number; // Hz
  amp: number; // V
  phase: number; // degrees
  noise: number; // V rms
  cutoff: number; // Hz, low-pass
  timeDiv: number; // ms per division (10 divisions)
  voltDiv: number; // V per division (8 divisions)
  paused: boolean;
  view: ScopeView;
  show: { original: boolean; noisy: boolean; filtered: boolean };
};

export const SAMPLE_RATE = 8000; // Hz — the bench's assumed ADC rate
export const N = 1024; // samples per capture (power of two for the FFT)

export const defaultScope = (): ScopeState => ({
  wave: 'sine',
  freq: 220,
  amp: 2,
  phase: 0,
  noise: 0.4,
  cutoff: 600,
  timeDiv: 2,
  voltDiv: 1,
  paused: false,
  view: 'time',
  show: { original: true, noisy: true, filtered: true },
});

/** deterministic gaussian-ish noise (Box–Muller over a seeded LCG) so frames are stable when paused */
function noiseGen(seed: number) {
  let s = seed >>> 0 || 1;
  const u = () => ((s = (s * 1664525 + 1013904223) >>> 0) + 1) / 4294967297;
  return () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u());
}

export function sample(st: ScopeState, t: number): number {
  const ph = (st.phase * Math.PI) / 180;
  const x = 2 * Math.PI * st.freq * t + ph;
  const frac = ((st.freq * t + st.phase / 360) % 1 + 1) % 1;
  switch (st.wave) {
    case 'sine':
      return st.amp * Math.sin(x);
    case 'square':
      return st.amp * (frac < 0.5 ? 1 : -1);
    case 'triangle':
      return st.amp * (4 * Math.abs(frac - 0.5) - 1);
    case 'sawtooth':
      return st.amp * (2 * frac - 1);
    case 'sonar': {
      // SYNTHETIC: a 20 ms linear chirp ping every 64 ms, plus a weaker echo 18 ms later.
      const period = 0.064;
      const tp = ((t % period) + period) % period;
      const ping = (tt: number, g: number) => {
        if (tt < 0 || tt > 0.02) return 0;
        const f0 = st.freq, f1 = st.freq * 3;
        const k = (f1 - f0) / 0.02;
        const env = Math.sin((Math.PI * tt) / 0.02);
        return g * env * Math.sin(2 * Math.PI * (f0 * tt + 0.5 * k * tt * tt) + ph);
      };
      return st.amp * (ping(tp, 1) + ping(tp - 0.018, 0.35));
    }
  }
}

export type Capture = { original: Float32Array; noisy: Float32Array; filtered: Float32Array; spectrum: Float32Array; t0: number };

/** capture N samples starting at t0 */
export function capture(st: ScopeState, t0: number, seed: number): Capture {
  const original = new Float32Array(N), noisy = new Float32Array(N), filtered = new Float32Array(N);
  const n = noiseGen(seed);
  const dt = 1 / SAMPLE_RATE;
  // y[k] = y[k-1] + α (x[k] − y[k-1]),  α = dt / (RC + dt),  RC = 1 / (2π fc)
  const rc = 1 / (2 * Math.PI * st.cutoff);
  const alpha = dt / (rc + dt);
  let y = 0;
  for (let k = 0; k < N; k++) {
    const v = sample(st, t0 + k * dt);
    original[k] = v;
    noisy[k] = v + st.noise * n();
    y = y + alpha * (noisy[k] - y);
    filtered[k] = y;
  }
  return { original, noisy, filtered, spectrum: magnitude(noisy), t0 };
}

/** magnitude spectrum (single-sided, Hann-windowed) via an iterative radix-2 FFT */
export function magnitude(x: Float32Array) {
  const n = x.length;
  const re = new Float32Array(n), im = new Float32Array(n);
  for (let i = 0; i < n; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
  const out = new Float32Array(n / 2);
  for (let i = 0; i < n / 2; i++) out[i] = (2 * Math.hypot(re[i], im[i])) / (n / 2);
  return out;
}

export function peakHz(spec: Float32Array) {
  let best = 1;
  for (let i = 2; i < spec.length; i++) if (spec[i] > spec[best]) best = i;
  return (best * SAMPLE_RATE) / (spec.length * 2);
}

export function rms(x: Float32Array) {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return Math.sqrt(s / x.length);
}

const COL = { grid: 'rgba(120,255,160,.14)', axis: 'rgba(120,255,160,.32)', original: '#9dff8a', noisy: 'rgba(255,207,107,.8)', filtered: '#7ad7ff' };

/** draw the CRT face of the oscilloscope */
export function drawScope(c: CanvasRenderingContext2D, w: number, h: number, st: ScopeState, cap: Capture) {
  c.fillStyle = '#04120a';
  c.fillRect(0, 0, w, h);
  c.strokeStyle = COL.grid;
  c.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    c.beginPath();
    c.moveTo((i * w) / 10, 0);
    c.lineTo((i * w) / 10, h);
    c.stroke();
  }
  for (let i = 0; i <= 8; i++) {
    c.beginPath();
    c.moveTo(0, (i * h) / 8);
    c.lineTo(w, (i * h) / 8);
    c.stroke();
  }
  c.strokeStyle = COL.axis;
  c.beginPath();
  c.moveTo(0, h / 2);
  c.lineTo(w, h / 2);
  c.moveTo(w / 2, 0);
  c.lineTo(w / 2, h);
  c.stroke();

  c.lineJoin = 'round';
  if (st.view === 'time') {
    const span = (st.timeDiv * 10) / 1000; // seconds on screen
    const count = Math.min(N, Math.max(8, Math.round(span * SAMPLE_RATE)));
    const yOf = (v: number) => h / 2 - (v / (st.voltDiv * 4)) * (h / 2);
    const trace = (arr: Float32Array, color: string, width: number) => {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.shadowColor = color;
      c.shadowBlur = 8;
      c.beginPath();
      for (let k = 0; k < count; k++) {
        const x = (k / (count - 1)) * w;
        const y = yOf(arr[k]);
        if (k) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.stroke();
    };
    if (st.show.noisy) trace(cap.noisy, COL.noisy, 1.4);
    if (st.show.original) trace(cap.original, COL.original, 2.4);
    if (st.show.filtered) trace(cap.filtered, COL.filtered, 2.4);
  } else {
    const spec = cap.spectrum;
    const maxF = SAMPLE_RATE / 2;
    let peak = 0.001;
    for (let i = 1; i < spec.length; i++) peak = Math.max(peak, spec[i]);
    c.fillStyle = COL.original;
    c.shadowColor = COL.original;
    c.shadowBlur = 6;
    for (let i = 1; i < spec.length; i++) {
      const x = (i / spec.length) * w;
      const bh = (spec[i] / peak) * (h - 30);
      c.fillRect(x, h - bh, Math.max(1, w / spec.length), bh);
    }
    c.shadowBlur = 0;
    c.fillStyle = 'rgba(157,255,138,.7)';
    c.font = '16px "VT323", monospace';
    for (let k = 0; k <= 4; k++) c.fillText(`${Math.round((k * maxF) / 4)} Hz`, (k * w) / 4 + 4, 18);
  }
  c.shadowBlur = 0;
  c.fillStyle = 'rgba(157,255,138,.85)';
  c.font = '18px "VT323", monospace';
  const label = st.view === 'time' ? `${st.timeDiv} ms/div  ${st.voltDiv} V/div` : 'FFT · noisy input';
  c.fillText(label, 8, h - 10);
  c.fillText(st.paused ? 'STOP' : 'RUN', w - 48, h - 10);
  c.fillStyle = 'rgba(0,0,0,.18)';
  for (let yy = 0; yy < h; yy += 3) c.fillRect(0, yy, w, 1);
}
