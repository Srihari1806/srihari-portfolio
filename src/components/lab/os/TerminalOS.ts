/* CURIOSITY OS — a small, safe command interpreter rendered onto the CRT's canvas.
   It never executes anything: every command maps to text or to a portfolio action. */

import { experiments, STATUS_TEXT } from '@/data/labExperiments';
import { links, profile, resume } from '@/data/profile';
import { projects } from '@/data/projects';
import { skillGroups } from '@/data/skills';

export type OsAction =
  | { type: 'focus'; target: 'scope' | 'wall' | 'breadboard' | 'monitor' | 'notebook' | 'server' }
  | { type: 'directory' }
  | { type: 'exit' }
  | { type: 'link'; href: string; label: string }
  | { type: 'nav'; href: string };

type Line = { t: string; c?: string };

const GREEN = '#9dff8a';
const DIM = '#5fae58';
const AMBER = '#ffcf6b';
const WHITE = '#e8ffe0';

const COMMANDS: Record<string, string> = {
  help: 'list commands',
  ls: 'list the lab’s folders',
  about: 'who runs this lab',
  skills: 'skills, grouped, with evidence',
  projects: 'shipped projects',
  software: 'software engineering archive',
  electronics: 'open the oscilloscope bench',
  data: 'open the data monitor',
  ai: 'applied AI status',
  architecture: 'walk to the architecture wall',
  experiments: 'the experiment directory',
  research: 'open the research journal',
  sort: 'run the sorting visualizer',
  github: 'GitHub profile',
  resume: 'résumé',
  open: 'open <project>  e.g. open cricfield',
  clear: 'clear the screen',
  exit: 'step back from the computer',
};

const ARCHIVE: { topic: string; state: string; evidence: string }[] = [
  { topic: 'Programming languages', state: 'shown', evidence: 'TypeScript (CricField, HireMap, this site) · Python, SQL (CricField)' },
  { topic: 'Frontend engineering', state: 'shown', evidence: 'React + Vite (CricField), React + TS (HireMap, team), Next.js (this site)' },
  { topic: 'Backend engineering', state: 'shown', evidence: 'Express 5 API with zod validation (CricField)' },
  { topic: 'API development', state: 'shown', evidence: 'CricField API — see the architecture wall' },
  { topic: 'Database management', state: 'shown', evidence: 'SQLite + Drizzle ORM warehouse (CricField)' },
  { topic: 'Testing and debugging', state: 'shown', evidence: 'Playwright end-to-end tests (CricField)' },
  { topic: 'Git and deployment', state: 'shown', evidence: 'This site: Git + Vercel' },
  { topic: 'Data structures & algorithms', state: 'notes', evidence: 'Coursework. Try `sort` for a live visualizer.' },
  { topic: 'Object-oriented programming', state: 'notes', evidence: 'Coursework — write-up planned' },
  { topic: 'Operating systems', state: 'notes', evidence: 'Coursework — write-up planned' },
  { topic: 'Computer networks', state: 'notes', evidence: 'Coursework — the server rack has a request-flow demo' },
];

export class TerminalOS {
  lines: Line[] = [];
  input = '';
  history: string[] = [];
  private hIdx = -1;
  powered = true;
  brightness = 1;
  scanlines = true;
  private boot: { at: number; queue: Line[] } | null = null;
  private sortAnim: { arr: number[]; i: number; j: number; done: boolean; swaps: number; compares: number; t: number } | null = null;
  private cursorT = 0;
  dirty = true;
  onAction: (a: OsAction) => void = () => {};

  constructor() {
    this.powerOn();
  }

  powerOn() {
    this.powered = true;
    this.lines = [];
    this.boot = {
      at: 0,
      queue: [
        { t: 'CURIOSITY SYSTEMS', c: AMBER },
        { t: 'LAB-01', c: AMBER },
        { t: profile.degree.replace('B.Tech, ', ''), c: DIM },
        { t: 'Initializing research environment...', c: DIM },
        { t: 'Mounting /circuits /code /questions ... ok', c: DIM },
        { t: 'System ready.', c: GREEN },
        { t: "Type 'help' to begin.", c: WHITE },
        { t: '' },
      ],
    };
    this.dirty = true;
  }

  powerOff() {
    this.powered = false;
    this.boot = null;
    this.sortAnim = null;
    this.dirty = true;
  }

  private push(t: string, c = GREEN) {
    // wrap at 74 columns
    const words = t.split(' ');
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > 74) {
        this.lines.push({ t: cur, c });
        cur = w;
      } else cur = (cur ? cur + ' ' : '') + w;
    }
    this.lines.push({ t: cur, c });
    if (this.lines.length > 400) this.lines.splice(0, this.lines.length - 400);
    this.dirty = true;
  }

  suggestions(): string[] {
    const q = this.input.trim().toLowerCase();
    if (!q || q.includes(' ')) return [];
    return Object.keys(COMMANDS).filter((k) => k.startsWith(q) && k !== q).slice(0, 5);
  }

  key(e: { key: string; ctrlKey?: boolean; metaKey?: boolean; preventDefault?: () => void }) {
    if (!this.powered) return;
    const k = e.key;
    if (this.boot && k === 'Enter') {
      // typed during boot: finish booting instantly, then run it
      this.boot.queue.forEach((l) => this.push(l.t, l.c));
      this.boot = null;
    }
    if (k === 'Enter') return this.submit();
    if (k === 'Backspace') this.input = this.input.slice(0, -1);
    else if (k === 'ArrowUp') {
      if (this.history.length) {
        this.hIdx = this.hIdx < 0 ? this.history.length - 1 : Math.max(0, this.hIdx - 1);
        this.input = this.history[this.hIdx];
      }
      e.preventDefault?.();
    } else if (k === 'ArrowDown') {
      if (this.hIdx >= 0) {
        this.hIdx = Math.min(this.history.length, this.hIdx + 1);
        this.input = this.history[this.hIdx] ?? '';
        if (this.hIdx === this.history.length) this.hIdx = -1;
      }
      e.preventDefault?.();
    } else if (k === 'Tab') {
      const s = this.suggestions();
      if (s.length) this.input = s[0];
      e.preventDefault?.();
    } else if (k === 'l' && e.ctrlKey) {
      this.lines = [];
      e.preventDefault?.();
    } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && this.input.length < 60) this.input += k;
    this.dirty = true;
  }

  run(cmd: string) {
    this.input = cmd;
    this.submit();
  }

  private submit() {
    const raw = this.input.trim();
    this.push(`srihari@lab-01:~$ ${raw}`, WHITE);
    this.input = '';
    this.hIdx = -1;
    if (!raw) return;
    this.history.push(raw);
    const [cmd, ...args] = raw.toLowerCase().split(/\s+/);
    this.exec(cmd, args);
  }

  private exec(cmd: string, args: string[]) {
    const P = (t: string, c?: string) => this.push(t, c);
    switch (cmd) {
      case 'help':
        Object.entries(COMMANDS).forEach(([k, v]) => P(`  ${k.padEnd(13)} ${v}`, k === 'help' ? AMBER : GREEN));
        P('  Tip: ↑/↓ history · Tab completes · Esc leaves the desk', DIM);
        break;
      case 'ls':
        P('circuits/   code/   data/   ai/   blueprints/   journal/   experiments.txt', AMBER);
        P('Type a folder name without the slash, e.g. `data`.', DIM);
        break;
      case 'about':
        P(`${profile.name} — ${profile.identity}.`, WHITE);
        P(`${profile.degree}, ${profile.school}. Class of ${profile.graduation}.`);
        P('Engineering is the foundation. Analytics is the intelligence. Product thinking is the direction.');
        P(profile.availability + '.', DIM);
        break;
      case 'skills':
        skillGroups.forEach((g) => {
          P(`[${g.title}]`, AMBER);
          P('  ' + g.skills.map((s) => (s.evidence?.length ? `${s.name}*` : s.name)).join(' · '));
        });
        P('* shown in real work — see projects', DIM);
        break;
      case 'projects':
        projects.forEach((p) => P(`  ${p.key.padEnd(10)} ${p.name} — ${p.statusLabel}`));
        P('`open <name>` takes you to the project page.', DIM);
        break;
      case 'open': {
        const p = projects.find((x) => x.key === args[0]);
        if (!p) return P(`open: no project called '${args[0] ?? ''}'. Try: ${projects.map((x) => x.key).join(', ')}`, AMBER);
        P(`Opening ${p.name}...`, WHITE);
        this.onAction({ type: 'nav', href: `/work/${p.key}` });
        break;
      }
      case 'software':
        P('SOFTWARE ENGINEERING ARCHIVE', AMBER);
        ARCHIVE.forEach((a) => P(`  ${a.state === 'shown' ? '■' : '□'} ${a.topic.padEnd(29)} ${a.evidence}`, a.state === 'shown' ? GREEN : DIM));
        P('■ backed by real code   □ coursework notes, write-up planned', DIM);
        break;
      case 'electronics':
        P('Powering the signal bench...', WHITE);
        this.onAction({ type: 'focus', target: 'scope' });
        break;
      case 'data':
        P('Switching to the data monitor...', WHITE);
        this.onAction({ type: 'focus', target: 'monitor' });
        break;
      case 'ai':
        P('APPLIED AI', AMBER);
        experiments
          .filter((e) => e.domain === 'Applied AI')
          .forEach((e) => P(`  [${STATUS_TEXT[e.status].toUpperCase()}] ${e.title}`, e.status === 'planned' ? DIM : GREEN));
        P('Nothing here claims a benchmark. Demos arrive with real computed results.', DIM);
        break;
      case 'architecture':
        P('Walking to the blueprint wall...', WHITE);
        this.onAction({ type: 'focus', target: 'wall' });
        break;
      case 'experiments':
        experiments.forEach((e) => P(`  [${STATUS_TEXT[e.status].padEnd(11)}] ${e.title}`, e.status === 'planned' ? DIM : GREEN));
        this.onAction({ type: 'directory' });
        break;
      case 'research':
      case 'journal':
        P('Opening the notebook...', WHITE);
        this.onAction({ type: 'focus', target: 'notebook' });
        break;
      case 'sort':
        this.startSort();
        break;
      case 'github':
        P(links.github, WHITE);
        this.onAction({ type: 'link', href: links.github, label: 'Open GitHub' });
        break;
      case 'resume':
        if (resume.available) {
          P(resume.general, WHITE);
          this.onAction({ type: 'link', href: resume.general, label: 'Open résumé' });
        } else {
          P('Résumé is being finalised. Request it by email:', AMBER);
          P(links.email, WHITE);
          this.onAction({ type: 'link', href: `mailto:${links.email}?subject=R%C3%A9sum%C3%A9%20request`, label: 'Email for résumé' });
        }
        break;
      case 'clear':
        this.lines = [];
        this.dirty = true;
        break;
      case 'exit':
        P('Bye. The lab closes. Curiosity doesn’t.', DIM);
        this.onAction({ type: 'exit' });
        break;
      case 'sudo':
        P('Nice try. This lab runs on curiosity, not root.', AMBER);
        break;
      case 'rm':
        P('Things here get broken on purpose, but not like that.', AMBER);
        break;
      default:
        P(`${cmd}: command not found. Type 'help'.`, AMBER);
    }
  }

  private startSort() {
    const arr = Array.from({ length: 24 }, () => 2 + Math.floor(Math.random() * 14));
    this.sortAnim = { arr, i: 0, j: 0, done: false, swaps: 0, compares: 0, t: 0 };
    this.push('BUBBLE SORT · O(n²) comparisons · watch the largest values sink right', AMBER);
  }

  tick(dt: number) {
    this.cursorT += dt;
    if (Math.floor(this.cursorT * 2) !== Math.floor((this.cursorT - dt) * 2)) this.dirty = true;
    if (this.boot) {
      this.boot.at += dt;
      if (this.boot.at > 0.2) {
        this.boot.at = 0;
        const next = this.boot.queue.shift();
        if (next) this.push(next.t, next.c);
        else this.boot = null;
      }
    }
    const s = this.sortAnim;
    if (s && !s.done) {
      s.t += dt;
      while (s.t > 0.045) {
        s.t -= 0.045;
        const n = s.arr.length;
        if (s.i >= n - 1) {
          s.done = true;
          this.push(`sorted: ${s.compares} comparisons, ${s.swaps} swaps for n=${n}.`, GREEN);
          break;
        }
        s.compares++;
        if (s.arr[s.j] > s.arr[s.j + 1]) {
          [s.arr[s.j], s.arr[s.j + 1]] = [s.arr[s.j + 1], s.arr[s.j]];
          s.swaps++;
        }
        s.j++;
        if (s.j >= n - 1 - s.i) {
          s.j = 0;
          s.i++;
        }
      }
      this.dirty = true;
    }
  }

  /** draw onto the CRT canvas */
  render(c: CanvasRenderingContext2D, w: number, h: number) {
    this.dirty = false;
    c.fillStyle = '#041007';
    c.fillRect(0, 0, w, h);
    if (!this.powered) {
      c.fillStyle = '#020503';
      c.fillRect(0, 0, w, h);
      return;
    }
    const g = c.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, h * 0.8);
    g.addColorStop(0, 'rgba(40,120,40,.18)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    const fs = 21, lh = 25, pad = 58;
    c.font = `${fs}px "VT323", "Courier New", monospace`;
    c.textBaseline = 'top';
    const sortRows = this.sortAnim && !this.sortAnim.done ? 9 : 0;
    const rows = Math.floor((h - pad * 2) / lh) - 1 - sortRows;
    const visible = this.lines.slice(-rows);
    visible.forEach((l, i) => {
      c.fillStyle = l.c || GREEN;
      c.shadowColor = l.c || GREEN;
      c.shadowBlur = 6;
      c.fillText(l.t, pad, pad + i * lh);
    });
    let y = pad + visible.length * lh;
    if (sortRows && this.sortAnim) {
      const s = this.sortAnim;
      const bw = (w - pad * 2) / s.arr.length;
      s.arr.forEach((v, i) => {
        const active = i === s.j || i === s.j + 1;
        const sorted = i >= s.arr.length - s.i;
        c.fillStyle = active ? AMBER : sorted ? WHITE : GREEN;
        c.fillRect(pad + i * bw + 2, y + (sortRows * lh - 10) - v * 13, bw - 4, v * 13);
      });
      y += sortRows * lh;
    }
    {
      const prompt = `srihari@lab-01:~$ ${this.input}`;
      c.fillStyle = WHITE;
      c.fillText(prompt, pad, y);
      if (Math.floor(this.cursorT * 2) % 2 === 0) c.fillRect(pad + c.measureText(prompt).width + 3, y + 3, 11, fs - 2);
      const s = this.suggestions();
      if (s.length) {
        c.fillStyle = DIM;
        c.fillText('  ' + s.join('  ') + '   [Tab]', pad, y + lh);
      }
    }
    c.shadowBlur = 0;
    if (this.scanlines) {
      c.fillStyle = 'rgba(0,0,0,.22)';
      for (let yy = 0; yy < h; yy += 3) c.fillRect(0, yy, w, 1);
    }
    // vignette
    const v = c.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.78);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,.55)');
    c.fillStyle = v;
    c.fillRect(0, 0, w, h);
    if (this.brightness < 1) {
      c.fillStyle = `rgba(0,0,0,${1 - this.brightness})`;
      c.fillRect(0, 0, w, h);
    }
  }
}
