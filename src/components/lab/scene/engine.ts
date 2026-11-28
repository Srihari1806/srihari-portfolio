import * as T from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { buildRoom, type Hot, type HotId, type Pose, type Room } from './room';

/* One renderer, one camera, one controller. Views:
   - room:  the whole workstation, with gentle mouse parallax and a limited drag-orbit
   - focus: the camera glides to an instrument's pose; the instrument becomes operable */

export type EngineEvents = {
  hover: (h: { id: HotId; label: string } | null) => void;
  pick: (id: HotId) => void;
};

const ROOM_DESKTOP: Pose = { pos: new T.Vector3(0.25, 1.82, 2.55), target: new T.Vector3(0.18, 1.2, -1.0) };
const ROOM_PORTRAIT: Pose = { pos: new T.Vector3(0.1, 2.05, 3.9), target: new T.Vector3(0.1, 1.15, -0.95) };

export class LabEngine {
  renderer: T.WebGLRenderer;
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(46, 1, 0.03, 40);
  room: Room;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private ray = new T.Raycaster();
  private ptr = new T.Vector2(9, 9);
  private parallax = new T.Vector2();
  private orbit = 0;
  private cur: Pose;
  private focusId: HotId | null = null;
  private raf = 0;
  private clock = new T.Clock();
  private running = true;
  private hovered: Hot | null = null;
  private markers = new Map<HotId, HTMLElement>();
  private drag: { x: number; o: number } | null = null;
  fanSpeed = 1;
  /** per-frame hooks for live screens */
  onFrame: ((dt: number, t: number) => void) | null = null;
  private reduce: boolean;

  constructor(private canvas: HTMLCanvasElement, mascotUrl: string, private events: EngineEvents, reduce: boolean) {
    this.reduce = reduce;
    this.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.scene.background = new T.Color('#0f110e');
    this.scene.fog = new T.FogExp2('#14160f', 0.06);
    this.room = buildRoom(mascotUrl);
    this.scene.add(this.room.group);
    this.cur = this.roomPose();
    this.camera.position.copy(this.cur.pos);
    this.camera.lookAt(this.cur.target);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new T.Vector2(512, 512), 0.42, 0.4, 0.9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize();
    window.addEventListener('resize', this.resize);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointerleave', this.onLeave);
    document.addEventListener('visibilitychange', this.onVis);
    this.loop();
  }

  get hots() {
    return this.room.hots;
  }
  get focused() {
    return this.focusId;
  }

  private roomPose(): Pose {
    const portrait = this.canvas.clientWidth < this.canvas.clientHeight * 0.95;
    const p = portrait ? ROOM_PORTRAIT : ROOM_DESKTOP;
    return { pos: p.pos.clone(), target: p.target.clone() };
  }

  bindMarker(id: HotId, el: HTMLElement | null) {
    if (el) this.markers.set(id, el);
    else this.markers.delete(id);
  }

  private resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 800 ? 1.4 : 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this.focusId) this.cur = this.roomPose();
  };

  private setPtr(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  private pickAt(): Hot | null {
    this.ray.setFromCamera(this.ptr, this.camera);
    const all = this.hots.flatMap((h) => h.meshes);
    const hit = this.ray.intersectObjects(all, true)[0];
    if (!hit) return null;
    let o: T.Object3D | null = hit.object;
    while (o) {
      const found = this.hots.find((h) => h.meshes.includes(o!));
      if (found) return found;
      o = o.parent;
    }
    return null;
  }

  private onMove = (e: PointerEvent) => {
    this.setPtr(e);
    if (!this.focusId) this.parallax.set(this.ptr.x, this.ptr.y);
    if (this.drag && !this.focusId) {
      const dx = (e.clientX - this.drag.x) / this.canvas.clientWidth;
      this.orbit = Math.max(-0.35, Math.min(0.35, this.drag.o + dx * 1.4));
    }
    const h = this.pickAt();
    if (h !== this.hovered) {
      this.hovered = h;
      this.canvas.style.cursor = h ? 'pointer' : this.drag ? 'grabbing' : 'grab';
      this.events.hover(h ? { id: h.id, label: h.label } : null);
    }
  };
  private onDown = (e: PointerEvent) => {
    this.setPtr(e);
    this.drag = { x: e.clientX, o: this.orbit };
    (this.drag as { x: number; o: number; t?: number }).t = performance.now();
  };
  private onUp = (e: PointerEvent) => {
    const d = this.drag as { x: number; o: number; t?: number } | null;
    this.drag = null;
    if (!d) return;
    const moved = Math.abs(e.clientX - d.x) > 6;
    if (moved) return;
    this.setPtr(e);
    const h = this.pickAt();
    if (h) this.events.pick(h.id);
  };
  private onLeave = () => {
    this.parallax.set(0, 0);
    this.hovered = null;
    this.events.hover(null);
  };
  private onVis = () => {
    if (document.hidden) this.pause();
    else this.resume();
  };

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
  resume() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    this.loop();
  }

  /** glide to an instrument (or back to the room when id is null) */
  focus(id: HotId | null) {
    const h = id ? this.hots.find((x) => x.id === id) : null;
    if (id && !h?.pose) return;
    this.focusId = h ? id : null;
    const to = h?.pose ? { pos: h.pose.pos.clone(), target: h.pose.target.clone() } : this.roomPose();
    if (h?.pose) {
      // leave room for the instrument panel: frame the object left of it (desktop) or above it (phone)
      // phones are narrow: step back so the whole instrument fits
      if (this.canvas.clientWidth < this.canvas.clientHeight) to.pos.copy(to.target.clone().add(to.pos.clone().sub(to.target).multiplyScalar(1.8)));
      const dir = to.target.clone().sub(to.pos);
      const dist = dir.length();
      const right = dir.clone().normalize().cross(new T.Vector3(0, 1, 0)).normalize();
      const up = right.clone().cross(dir.clone().normalize()).normalize();
      const wide = this.canvas.clientWidth > 760;
      const shift = wide ? right.multiplyScalar(dist * 0.2) : up.multiplyScalar(-dist * 0.2);
      to.pos.add(shift);
      to.target.add(shift);
    }
    if (!h) this.orbit = 0;
    const from = { px: this.cur.pos.x, py: this.cur.pos.y, pz: this.cur.pos.z, tx: this.cur.target.x, ty: this.cur.target.y, tz: this.cur.target.z };
    gsap.killTweensOf(from);
    gsap.to(from, {
      px: to.pos.x,
      py: to.pos.y,
      pz: to.pos.z,
      tx: to.target.x,
      ty: to.target.y,
      tz: to.target.z,
      duration: this.reduce ? 0 : 1.25,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.cur.pos.set(from.px, from.py, from.pz);
        this.cur.target.set(from.tx, from.ty, from.tz);
      },
    });
    this.markers.forEach((el) => (el.style.opacity = h ? '0' : ''));
  }

  private tmp = new T.Vector3();
  private loop = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    // camera: base pose + orbit + parallax (room view only)
    const base = this.cur.pos.clone().sub(this.cur.target);
    if (!this.focusId) base.applyAxisAngle(new T.Vector3(0, 1, 0), this.orbit);
    const pos = this.cur.target.clone().add(base);
    if (!this.focusId && !this.reduce) pos.add(new T.Vector3(this.parallax.x * 0.12, this.parallax.y * 0.07, 0));
    this.camera.position.lerp(pos, this.focusId ? 1 : 0.08);
    this.camera.lookAt(this.cur.target);
    // ambient life
    if (!this.reduce) this.room.fan.rotation.y += dt * 1.6 * this.fanSpeed;
    this.onFrame?.(dt, t);
    this.composer.render();
    // markers follow their objects
    if (this.markers.size) {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      this.hots.forEach((hot) => {
        const el = this.markers.get(hot.id);
        if (!el) return;
        this.tmp.copy(hot.anchor).project(this.camera);
        const vis = this.tmp.z < 1 && Math.abs(this.tmp.x) < 1.05 && Math.abs(this.tmp.y) < 1.05;
        el.style.transform = `translate(${((this.tmp.x + 1) / 2) * w}px, ${((1 - this.tmp.y) / 2) * h}px)`;
        el.style.visibility = vis ? 'visible' : 'hidden';
      });
    }
  };

  dispose() {
    this.pause();
    window.removeEventListener('resize', this.resize);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
    document.removeEventListener('visibilitychange', this.onVis);
    this.scene.traverse((o) => {
      const m = o as T.Mesh;
      m.geometry?.dispose?.();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mm) => {
        (mm as T.MeshStandardMaterial).map?.dispose();
        mm.dispose();
      });
    });
    this.composer.dispose();
    this.renderer.dispose();
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
