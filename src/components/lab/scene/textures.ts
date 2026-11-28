import * as T from 'three';

/* Procedural canvas textures for the lab. Everything is drawn here, so the room ships no image
   assets except the mascot. Small random imperfections (grain, dust, scratches) keep surfaces
   from looking like plastic. */

export function canvas(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const el = document.createElement('canvas');
  el.width = w;
  el.height = h;
  const c = el.getContext('2d')!;
  draw(c, w, h);
  return el;
}

export function tex(el: HTMLCanvasElement, repeat?: [number, number], srgb = true) {
  const t = new T.CanvasTexture(el);
  if (srgb) t.colorSpace = T.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

/** deterministic noise so the room looks the same on every visit */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function woodTexture(base = '#6b4a31', dark = '#4a3121', seed = 7) {
  const r = rng(seed);
  return canvas(1024, 512, (c, w, h) => {
    c.fillStyle = base;
    c.fillRect(0, 0, w, h);
    // planks
    for (let p = 0; p < 4; p++) {
      const y0 = (p * h) / 4;
      c.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.08})`;
      c.fillRect(0, y0, w, h / 4);
      for (let i = 0; i < 70; i++) {
        const y = y0 + r() * (h / 4);
        c.strokeStyle = `rgba(${r() > 0.5 ? '40,24,14' : '120,86,58'},${0.08 + r() * 0.18})`;
        c.lineWidth = 0.6 + r() * 2.2;
        c.beginPath();
        c.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x / (60 + r() * 90) + p) * (2 + r() * 4));
        c.stroke();
      }
      c.fillStyle = dark;
      c.fillRect(0, y0, w, 2);
    }
    // knots, scratches, rings from mugs
    for (let i = 0; i < 6; i++) {
      const x = r() * w, y = r() * h;
      c.strokeStyle = 'rgba(40,24,14,.35)';
      for (let k = 0; k < 6; k++) {
        c.beginPath();
        c.ellipse(x, y, 4 + k * 3, 2 + k * 1.5, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }
    c.strokeStyle = 'rgba(230,210,180,.12)';
    for (let i = 0; i < 40; i++) {
      c.lineWidth = r() * 1.2;
      const x = r() * w, y = r() * h;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r() - 0.5) * 120, y + (r() - 0.5) * 12);
      c.stroke();
    }
    c.strokeStyle = 'rgba(60,35,20,.22)';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(w * 0.27, h * 0.62, 26, 0, Math.PI * 1.7);
    c.stroke();
  });
}

export function wallTexture(seed = 3) {
  const r = rng(seed);
  return canvas(512, 512, (c, w, h) => {
    c.fillStyle = '#3a4031';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = `rgba(${r() > 0.5 ? '255,255,240' : '0,0,0'},${r() * 0.05})`;
      c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
    // faint vertical stains
    for (let i = 0; i < 8; i++) {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(0,0,0,${0.06 + r() * 0.06})`);
      c.fillStyle = g;
      c.fillRect(r() * w, 0, 10 + r() * 40, h);
    }
  });
}

export function floorTexture() {
  const r = rng(11);
  return canvas(512, 512, (c, w, h) => {
    // terrazzo-ish lab floor
    c.fillStyle = '#5c574d';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const v = 70 + r() * 90;
      c.fillStyle = `rgba(${v},${v - 6},${v - 14},${0.35 + r() * 0.4})`;
      c.beginPath();
      c.arc(r() * w, r() * h, 0.6 + r() * 2.6, 0, Math.PI * 2);
      c.fill();
    }
    c.strokeStyle = 'rgba(20,18,14,.55)';
    c.lineWidth = 2;
    c.strokeRect(0, 0, w, h);
  });
}

export function corkTexture() {
  const r = rng(19);
  return canvas(512, 384, (c, w, h) => {
    c.fillStyle = '#a9835a';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 7000; i++) {
      c.fillStyle = `rgba(${r() > 0.5 ? '70,45,25' : '210,180,140'},${r() * 0.35})`;
      c.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5);
    }
  });
}

/** a night (or evening) Vizag skyline: hills, a lighthouse, ships' lights on the sea */
export function skylineTexture(mode: 'evening' | 'night') {
  const r = rng(5);
  return canvas(1024, 640, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    if (mode === 'night') {
      g.addColorStop(0, '#0b1326');
      g.addColorStop(0.55, '#1b2a44');
      g.addColorStop(0.72, '#2e3b52');
    } else {
      g.addColorStop(0, '#2c3a5c');
      g.addColorStop(0.45, '#c9736a');
      g.addColorStop(0.7, '#f0b071');
    }
    g.addColorStop(1, '#101722');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    if (mode === 'night') {
      for (let i = 0; i < 160; i++) {
        c.fillStyle = `rgba(255,255,255,${r() * 0.8})`;
        c.fillRect(r() * w, r() * h * 0.5, 1.4, 1.4);
      }
      c.fillStyle = '#f4ecd2';
      c.beginPath();
      c.arc(w * 0.78, h * 0.18, 26, 0, Math.PI * 2);
      c.fill();
    }
    // hills (Kailasagiri-ish) and the sea
    c.fillStyle = mode === 'night' ? '#0e1420' : '#3b3047';
    c.beginPath();
    c.moveTo(0, h * 0.62);
    c.quadraticCurveTo(w * 0.18, h * 0.44, w * 0.38, h * 0.6);
    c.quadraticCurveTo(w * 0.55, h * 0.52, w * 0.7, h * 0.63);
    c.lineTo(w, h * 0.6);
    c.lineTo(w, h * 0.72);
    c.lineTo(0, h * 0.72);
    c.fill();
    // city lights
    for (let i = 0; i < 220; i++) {
      c.fillStyle = r() > 0.25 ? 'rgba(255,201,120,.9)' : 'rgba(180,220,255,.8)';
      const x = r() * w, y = h * (0.58 + r() * 0.13);
      c.fillRect(x, y, 2, 2);
    }
    // sea
    const s = c.createLinearGradient(0, h * 0.72, 0, h);
    s.addColorStop(0, mode === 'night' ? '#14203a' : '#5a4f6a');
    s.addColorStop(1, '#070b12');
    c.fillStyle = s;
    c.fillRect(0, h * 0.72, w, h);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = 'rgba(255,214,150,.25)';
      c.fillRect(r() * w, h * (0.74 + r() * 0.2), 10 + r() * 30, 1.2);
    }
    // lighthouse on the point
    c.fillStyle = '#d8d2c2';
    c.fillRect(w * 0.12, h * 0.48, 10, 46);
    c.fillStyle = '#ffd27a';
    c.fillRect(w * 0.12 - 2, h * 0.46, 14, 8);
    const beam = c.createRadialGradient(w * 0.12 + 5, h * 0.465, 2, w * 0.12 + 5, h * 0.465, 90);
    beam.addColorStop(0, 'rgba(255,220,140,.55)');
    beam.addColorStop(1, 'rgba(255,220,140,0)');
    c.fillStyle = beam;
    c.beginPath();
    c.moveTo(w * 0.12 + 5, h * 0.465);
    c.lineTo(w * 0.32, h * 0.4);
    c.lineTo(w * 0.32, h * 0.5);
    c.fill();
    // a ship
    c.fillStyle = '#ffcf80';
    c.fillRect(w * 0.55, h * 0.8, 3, 3);
    c.fillRect(w * 0.57, h * 0.8, 3, 3);
  });
}

const SPINES = ['#7b2d26', '#2f4b5c', '#3e5a3a', '#8a6a2f', '#5b3b5e', '#24323f', '#9a4c2b', '#4f5b2a', '#6d6458', '#2b2a28'];
const TITLES = ['SIGNALS & SYSTEMS', 'DIGITAL ELECTRONICS', 'CLRS', 'OPERATING SYSTEMS', 'DBMS', 'NETWORKS', 'MICROPROCESSORS', 'PROBABILITY', 'LINEAR ALGEBRA', 'CONTROL SYSTEMS', 'PYTHON', 'SQL', 'DSP', 'EMBEDDED C', 'ML'];

export function spineTexture(i: number) {
  return canvas(64, 320, (c, w, h) => {
    c.fillStyle = SPINES[i % SPINES.length];
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.08)';
    c.fillRect(0, 0, 6, h);
    c.fillStyle = '#e8d9a8';
    c.fillRect(0, 26, w, 3);
    c.fillRect(0, h - 40, w, 3);
    c.save();
    c.translate(w / 2 + 6, h / 2);
    c.rotate(-Math.PI / 2);
    c.font = 'bold 17px Georgia, serif';
    c.textAlign = 'center';
    c.fillStyle = '#efe3bf';
    c.fillText(TITLES[i % TITLES.length], 0, 0);
    c.restore();
  });
}

/** blueprint paper with a hand-drawn architecture sketch */
export function blueprintTexture(title: string, boxes: string[]) {
  return canvas(512, 384, (c, w, h) => {
    c.fillStyle = '#1f4f7a';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.08)';
    for (let x = 0; x < w; x += 16) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }
    for (let y = 0; y < h; y += 16) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
    c.fillStyle = '#e9f2f8';
    c.font = 'bold 30px "Courier New", monospace';
    c.fillText(title, 22, 44);
    c.strokeStyle = '#e9f2f8';
    c.lineWidth = 2.5;
    c.font = '17px "Courier New", monospace';
    boxes.forEach((b, i) => {
      const x = 26 + (i % 3) * 160, y = 90 + Math.floor(i / 3) * 120;
      c.strokeRect(x, y, 130, 64);
      c.fillText(b, x + 10, y + 38);
      if (i % 3 < 2 && i + 1 < boxes.length) {
        c.beginPath();
        c.moveTo(x + 132, y + 32);
        c.lineTo(x + 158, y + 32);
        c.stroke();
      }
    });
    c.strokeRect(10, 10, w - 20, h - 20);
  });
}

export function paperTexture(lines: string[], opts: { title?: string; hand?: boolean; ruled?: boolean; bg?: string } = {}) {
  return canvas(512, 640, (c, w, h) => {
    c.fillStyle = opts.bg || '#f3ead6';
    c.fillRect(0, 0, w, h);
    if (opts.ruled !== false) {
      c.strokeStyle = 'rgba(60,110,170,.22)';
      for (let y = 90; y < h; y += 34) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }
      c.strokeStyle = 'rgba(190,60,60,.35)';
      c.beginPath();
      c.moveTo(56, 0);
      c.lineTo(56, h);
      c.stroke();
    }
    c.fillStyle = '#23262b';
    const font = opts.hand ? '"Segoe Print", "Comic Sans MS", cursive' : 'Georgia, serif';
    if (opts.title) {
      c.font = `bold 34px ${font}`;
      c.fillText(opts.title, 70, 70);
    }
    c.font = `24px ${font}`;
    lines.forEach((l, i) => c.fillText(l, 70, 120 + i * 34));
  });
}

export function ticketTexture() {
  return canvas(320, 140, (c, w, h) => {
    c.fillStyle = '#f2d27a';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#8f2a1a';
    c.setLineDash([6, 5]);
    c.beginPath();
    c.moveTo(80, 6);
    c.lineTo(80, h - 6);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#8f2a1a';
    c.font = 'bold 26px Georgia, serif';
    c.fillText('ADMIT ONE', 98, 62);
    c.font = '16px Georgia, serif';
    c.fillText('BALCONY · 2ND SHOW', 98, 92);
    c.save();
    c.translate(44, h / 2);
    c.rotate(-Math.PI / 2);
    c.font = 'bold 16px Georgia';
    c.textAlign = 'center';
    c.fillText('No. 0427', 0, 6);
    c.restore();
  });
}

export function postcardTexture() {
  return canvas(320, 210, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e9a66d');
    g.addColorStop(0.6, '#f4d7a1');
    g.addColorStop(1, '#3f7d86');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#3f7d86';
    c.fillRect(0, h * 0.68, w, h);
    c.fillStyle = '#5b3b3a';
    c.beginPath();
    c.moveTo(0, h * 0.7);
    c.quadraticCurveTo(w * 0.3, h * 0.42, w * 0.6, h * 0.7);
    c.fill();
    c.fillStyle = '#fbf7ee';
    c.font = 'bold 36px Georgia, serif';
    c.fillText('VIZAG', 18, 48);
    c.font = 'italic 16px Georgia, serif';
    c.fillText('city of destiny', 22, 72);
    c.strokeStyle = '#fbf7ee';
    c.lineWidth = 6;
    c.strokeRect(3, 3, w - 6, h - 6);
  });
}

export function noteTexture(text: string[], color = '#f6e27a') {
  return canvas(256, 256, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(0,0,0,.06)';
    c.fillRect(0, h - 26, w, 26);
    c.fillStyle = '#2b2a28';
    c.font = '27px "Segoe Print", "Comic Sans MS", cursive';
    text.forEach((t, i) => c.fillText(t, 16, 52 + i * 38));
  });
}

export function breadboardTexture() {
  return canvas(512, 256, (c, w, h) => {
    c.fillStyle = '#efece4';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#d9d4c8';
    c.fillRect(0, h / 2 - 8, w, 16);
    // rails
    c.strokeStyle = '#c0392b';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(10, 10);
    c.lineTo(w - 10, 10);
    c.stroke();
    c.strokeStyle = '#2b5fa8';
    c.beginPath();
    c.moveTo(10, 36);
    c.lineTo(w - 10, 36);
    c.stroke();
    c.fillStyle = '#3a3a38';
    for (let x = 16; x < w - 10; x += 10.4) {
      for (const y of [20, 28, h - 28, h - 20]) c.fillRect(x, y, 3.2, 3.2);
      for (let y = 52; y < h / 2 - 10; y += 10.4) c.fillRect(x, y, 3.2, 3.2);
      for (let y = h / 2 + 14; y < h - 40; y += 10.4) c.fillRect(x, y, 3.2, 3.2);
    }
  });
}

export function pcbTexture(label: string, color = '#1f6f7a') {
  return canvas(256, 192, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,.25)';
    c.lineWidth = 1.5;
    for (let i = 0; i < 18; i++) {
      c.beginPath();
      const y = 20 + i * 9;
      c.moveTo(30, y);
      c.lineTo(120 + (i % 4) * 12, y);
      c.lineTo(140 + (i % 4) * 12, y + 14);
      c.stroke();
    }
    c.fillStyle = '#111';
    c.fillRect(150, 60, 60, 60);
    c.fillStyle = '#ddd';
    c.font = 'bold 18px Arial';
    c.fillText(label, 14, h - 14);
    c.fillStyle = '#d4b04c';
    for (let x = 14; x < w - 10; x += 11) {
      c.fillRect(x, 6, 6, 6);
      c.fillRect(x, h - 36, 6, 6);
    }
  });
}
