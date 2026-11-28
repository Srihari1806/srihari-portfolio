import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  blueprintTexture,
  breadboardTexture,
  canvas,
  corkTexture,
  floorTexture,
  noteTexture,
  paperTexture,
  pcbTexture,
  postcardTexture,
  skylineTexture,
  spineTexture,
  tex,
  ticketTexture,
  wallTexture,
  woodTexture,
} from './textures';

/* The Curiosity Lab, built in metres. The bench top sits at y = 0.92, the back wall at z = -1.6.
   Every interactive object registers an id, a set of meshes to click, an anchor for its marker
   and a camera pose that frames it. */

export type Pose = { pos: T.Vector3; target: T.Vector3 };
export type HotId = 'crt' | 'scope' | 'breadboard' | 'monitor' | 'wall' | 'notebook' | 'server' | 'lamp' | 'window' | 'headphones' | 'fan' | 'crtPower';
export type Hot = { id: HotId; label: string; meshes: T.Object3D[]; anchor: T.Vector3; pose?: Pose };

const v = (x: number, y: number, z: number) => new T.Vector3(x, y, z);
const TOP = 0.92;

function mat(color: T.ColorRepresentation, rough = 0.7, metal = 0, extra: Partial<T.MeshStandardMaterialParameters> = {}) {
  return new T.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
}
function rbox(w: number, h: number, d: number, r = 0.008, seg = 3) {
  return new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));
}
function mesh(g: T.BufferGeometry, m: T.Material | T.Material[], x = 0, y = 0, z = 0, cast = true, receive = true) {
  const o = new T.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = cast;
  o.receiveShadow = receive;
  return o;
}

export type Room = {
  group: T.Group;
  hots: Hot[];
  crtCanvas: HTMLCanvasElement;
  crtTexture: T.CanvasTexture;
  scopeCanvas: HTMLCanvasElement;
  scopeTexture: T.CanvasTexture;
  monitorCanvas: HTMLCanvasElement;
  monitorTexture: T.CanvasTexture;
  fgenCanvas: HTMLCanvasElement;
  fgenTexture: T.CanvasTexture;
  crtScreen: T.Mesh;
  crtGlow: T.PointLight;
  crtLed: T.MeshStandardMaterial;
  lamp: { light: T.SpotLight; bulb: T.MeshStandardMaterial; fill: T.PointLight };
  fan: T.Group;
  leds: { red: T.MeshStandardMaterial; green: T.MeshStandardMaterial; amber: T.MeshStandardMaterial };
  serverLeds: T.MeshStandardMaterial[];
  knobs: T.Mesh[];
  windowGlass: T.MeshBasicMaterial;
  skylines: { evening: T.Texture; night: T.Texture };
  moon: T.DirectionalLight;
  notebookPages: { left: T.MeshStandardMaterial; right: T.MeshStandardMaterial };
};

export function buildRoom(mascotUrl: string): Room {
  const g = new T.Group();
  const hots: Hot[] = [];
  const add = (...o: T.Object3D[]) => g.add(...o);

  /* ---------------- shell: floor, walls, ceiling ---------------- */
  const floorTex = tex(floorTexture(), [5, 4]);
  const floor = mesh(new T.PlaneGeometry(8, 6), mat('#ffffff', 0.85, 0, { map: floorTex }), 0, 0, 0.6, false, true);
  floor.rotation.x = -Math.PI / 2;
  add(floor);

  const wallTex = tex(wallTexture(), [3, 1.4]);
  const wallMat = mat('#ffffff', 0.92, 0, { map: wallTex });
  const back = mesh(new T.PlaneGeometry(7, 3.4), wallMat, 0, 1.7, -1.6, false, true);
  const left = mesh(new T.PlaneGeometry(5, 3.4), wallMat, -3.2, 1.7, 0.6, false, true);
  left.rotation.y = Math.PI / 2;
  const right = mesh(new T.PlaneGeometry(5, 3.4), wallMat, 3.2, 1.7, 0.6, false, true);
  right.rotation.y = -Math.PI / 2;
  const ceil = mesh(new T.PlaneGeometry(7, 5), mat('#26271f', 0.95), 0, 3.4, 0.6, false, false);
  ceil.rotation.x = Math.PI / 2;
  add(back, left, right, ceil);
  // charcoal wainscot and a dado rail
  const wains = mat('#23251f', 0.8);
  add(mesh(new T.BoxGeometry(7, 0.9, 0.03), wains, 0, 0.45, -1.585, false, true));
  add(mesh(new T.BoxGeometry(7, 0.04, 0.05), mat('#4a3a2a', 0.6), 0, 0.92, -1.575, false, true));
  add(mesh(new T.BoxGeometry(7, 0.12, 0.03), mat('#1b1c18', 0.7), 0, 0.06, -1.58, false, true));

  /* ---------------- the workbench ---------------- */
  const woodTex = tex(woodTexture(), [1, 1]);
  const topMat = mat('#ffffff', 0.62, 0, { map: woodTex });
  add(mesh(rbox(4.0, 0.06, 1.02, 0.012), topMat, 0, TOP - 0.03, -1.06));
  const legMat = mat('#3a2a1e', 0.7);
  for (const x of [-1.92, 1.92]) for (const z of [-1.5, -0.62]) add(mesh(new T.BoxGeometry(0.07, TOP - 0.06, 0.07), legMat, x, (TOP - 0.06) / 2, z));
  add(mesh(new T.BoxGeometry(3.8, 0.05, 0.05), legMat, 0, 0.18, -1.5));
  // drawer cabinet under the left end
  const cab = mat('#5b4331', 0.6, 0, { map: tex(woodTexture('#5b4331', '#3b2a1f', 21)) });
  add(mesh(rbox(0.62, 0.72, 0.86, 0.01), cab, -1.5, 0.48, -1.07));
  for (let i = 0; i < 3; i++) {
    add(mesh(rbox(0.56, 0.2, 0.02, 0.006), cab, -1.5, 0.24 + i * 0.235, -0.635));
    add(mesh(new T.BoxGeometry(0.12, 0.016, 0.02), mat('#b9a782', 0.35, 0.8), -1.5, 0.3 + i * 0.235, -0.62));
  }
  // a back riser shelf with a power strip
  add(mesh(rbox(3.9, 0.03, 0.2, 0.006), topMat, 0, TOP + 0.36, -1.46));
  for (const x of [-1.9, 0, 1.9]) add(mesh(new T.BoxGeometry(0.03, 0.36, 0.2), legMat, x, TOP + 0.18, -1.46));
  add(mesh(rbox(0.5, 0.04, 0.06, 0.01), mat('#e9e4d6', 0.5), 1.0, TOP + 0.02, -1.5));

  /* ---------------- CURIOSITY CRT ---------------- */
  const beige = mat('#d9cfb6', 0.55);
  const beigeDark = mat('#c2b797', 0.6);
  const crt = new T.Group();
  crt.position.set(-0.32, TOP, -1.08);
  crt.add(mesh(rbox(0.32, 0.045, 0.3, 0.012), beigeDark, 0, 0.022, 0.02));
  crt.add(mesh(new T.CylinderGeometry(0.06, 0.08, 0.04, 24), beigeDark, 0, 0.06, 0.02));
  const bezel = mesh(rbox(0.5, 0.42, 0.16, 0.035), beige, 0, 0.3, 0.06);
  crt.add(bezel);
  const hood = mesh(rbox(0.42, 0.34, 0.3, 0.05), beige, 0, 0.29, -0.14);
  hood.scale.set(1, 1, 1);
  crt.add(hood);
  crt.add(mesh(rbox(0.3, 0.24, 0.12, 0.04), beigeDark, 0, 0.29, -0.31));
  // vents
  for (let i = 0; i < 7; i++) crt.add(mesh(new T.BoxGeometry(0.2, 0.006, 0.01), mat('#8f876f', 0.8), 0, 0.42 - i * 0.012, -0.2 - i * 0.0));
  // recessed screen
  crt.add(mesh(rbox(0.41, 0.31, 0.02, 0.02), mat('#1d1f1a', 0.5), 0, 0.31, 0.135));
  const crtCanvas = canvas(1024, 768, (c) => {
    c.fillStyle = '#041007';
    c.fillRect(0, 0, 1024, 768);
  });
  const crtTexture = tex(crtCanvas);
  const screenGeo = new T.PlaneGeometry(0.38, 0.285, 16, 12);
  // a gentle CRT bulge
  const pos = screenGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / 0.19, y = pos.getY(i) / 0.1425;
    pos.setZ(i, 0.012 * (1 - 0.5 * (x * x + y * y)));
  }
  screenGeo.computeVertexNormals();
  const crtScreen = new T.Mesh(screenGeo, new T.MeshBasicMaterial({ map: crtTexture, toneMapped: false }));
  crtScreen.position.set(0, 0.31, 0.142);
  crt.add(crtScreen);
  // badge + power button + LED
  const badge = tex(
    canvas(256, 40, (c) => {
      c.fillStyle = '#d9cfb6';
      c.fillRect(0, 0, 256, 40);
      c.fillStyle = '#5a5240';
      c.font = 'bold 22px Arial';
      c.fillText('CURIOSITY  LAB-01', 12, 28);
    }),
  );
  crt.add(mesh(new T.PlaneGeometry(0.16, 0.025), new T.MeshStandardMaterial({ map: badge, roughness: 0.6 }), -0.1, 0.12, 0.141, false, false));
  const powerBtn = mesh(new T.CylinderGeometry(0.014, 0.014, 0.012, 20), mat('#b9ad90', 0.5), 0.17, 0.12, 0.142);
  powerBtn.rotation.x = Math.PI / 2;
  crt.add(powerBtn);
  const crtLed = mat('#30ff60', 0.3, 0, { emissive: '#30ff60', emissiveIntensity: 2.4 });
  crt.add(mesh(new T.SphereGeometry(0.005, 10, 10), crtLed, 0.13, 0.12, 0.142));
  const crtGlow = new T.PointLight('#7dff8a', 0.22, 1.2, 2);
  crtGlow.position.set(0, 0.3, 0.7);
  crt.add(crtGlow);
  add(crt);
  const crtW = crt.position.clone();
  hots.push({
    id: 'crt',
    label: 'Curiosity OS — the computer',
    meshes: [crtScreen, bezel, hood],
    anchor: crtW.clone().add(v(0, 0.55, 0.08)),
    pose: { pos: crtW.clone().add(v(0, 0.34, 0.78)), target: crtW.clone().add(v(0, 0.31, 0.12)) },
  });
  hots.push({ id: 'crtPower', label: 'Power', meshes: [powerBtn], anchor: crtW.clone().add(v(0.17, 0.12, 0.15)) });

  // keyboard, mouse, cable
  const kb = new T.Group();
  kb.position.set(-0.32, TOP, -0.7);
  kb.rotation.y = 0.03;
  kb.add(mesh(rbox(0.46, 0.028, 0.16, 0.008), beige, 0, 0.014, 0));
  const keyGeo = rbox(0.024, 0.014, 0.024, 0.004, 2);
  const keyMat = mat('#e6dcc3', 0.5);
  const keyCount = 15 * 5;
  const keys = new T.InstancedMesh(keyGeo, keyMat, keyCount);
  const m4 = new T.Matrix4();
  let k = 0;
  for (let r = 0; r < 5; r++)
    for (let cI = 0; cI < 15; cI++) {
      m4.makeTranslation(-0.196 + cI * 0.028, 0.034, -0.056 + r * 0.028);
      keys.setMatrixAt(k++, m4);
    }
  keys.castShadow = true;
  kb.add(keys);
  kb.add(mesh(rbox(0.16, 0.014, 0.022, 0.004), keyMat, 0, 0.034, 0.084));
  add(kb);
  const mouse = mesh(new T.SphereGeometry(0.03, 24, 16), beige, 0.02, TOP + 0.012, -0.68);
  mouse.scale.set(1, 0.45, 1.5);
  add(mouse);
  const cord = new T.CatmullRomCurve3([v(0.02, TOP + 0.01, -0.73), v(0.0, TOP + 0.004, -0.86), v(-0.12, TOP + 0.004, -0.96), v(-0.2, TOP + 0.01, -1.1)]);
  add(mesh(new T.TubeGeometry(cord, 30, 0.003, 6), mat('#c9bfa6', 0.6)));

  /* ---------------- personal objects ---------------- */
  // cricket ball with a seam
  const ball = new T.Group();
  ball.position.set(-0.66, TOP + 0.036, -0.64);
  ball.add(mesh(new T.SphereGeometry(0.036, 32, 24), mat('#8f1f1a', 0.45)));
  const seam = mesh(new T.TorusGeometry(0.0362, 0.0025, 6, 48), mat('#efe6d0', 0.6));
  seam.rotation.y = Math.PI / 2;
  ball.add(seam);
  ball.rotation.z = 0.4;
  add(ball);
  // cutting chai
  const chai = new T.Group();
  chai.position.set(-0.98, TOP, -0.98);
  chai.add(mesh(new T.CylinderGeometry(0.03, 0.024, 0.075, 24, 1, true), new T.MeshStandardMaterial({ color: '#e9e2cf', roughness: 0.1, transparent: true, opacity: 0.35, side: T.DoubleSide }), 0, 0.0375, 0));
  chai.add(mesh(new T.CylinderGeometry(0.027, 0.023, 0.05, 24), mat('#9a6a3a', 0.3), 0, 0.026, 0));
  add(chai);

  /* ---------------- engineering notebook ---------------- */
  const nb = new T.Group();
  nb.position.set(-1.2, TOP, -0.74);
  nb.rotation.y = 0.12;
  nb.add(mesh(rbox(0.44, 0.012, 0.3, 0.004), mat('#1f3a5a', 0.7), 0, 0.006, 0));
  const leftPage = mat('#d6cdb8', 0.95, 0, {
    map: tex(paperTexture(['Built it.', 'Broke it.', 'Understood it.', '', 'Entries: objective →', 'hypothesis → method →', 'results → lessons'], { title: 'Things I Broke,', hand: true })),
  });
  const rightPage = mat('#cdc4ae', 0.95, 0, {
    map: tex(paperTexture(['Fixed & Learned.', '', '— ground first, then', '  blame the code', '— Nyquist: fs > 2·f', '— cache ≠ truth'], { hand: true })),
  });
  const pl = mesh(new T.PlaneGeometry(0.2, 0.28), leftPage, -0.101, 0.0135, 0, false, true);
  pl.rotation.set(-Math.PI / 2, 0.05, 0);
  const pr = mesh(new T.PlaneGeometry(0.2, 0.28), rightPage, 0.101, 0.0135, 0, false, true);
  pr.rotation.set(-Math.PI / 2, -0.05, 0);
  nb.add(pl, pr);
  const pen = mesh(new T.CylinderGeometry(0.004, 0.004, 0.14, 10), mat('#1d1d1b', 0.4), 0.16, 0.02, 0.02);
  pen.rotation.set(Math.PI / 2, 0, 0.5);
  nb.add(pen);
  add(nb);
  const nbW = nb.position.clone();
  hots.push({
    id: 'notebook',
    label: 'Research journal',
    meshes: [pl, pr],
    anchor: nbW.clone().add(v(0, 0.08, 0)),
    pose: { pos: nbW.clone().add(v(0.06, 0.58, 0.26)), target: nbW.clone().add(v(0, 0, -0.02)) },
  });

  /* ---------------- desk lamp ---------------- */
  const lampG = new T.Group();
  lampG.position.set(-1.68, TOP, -1.28);
  const metal = mat('#2c3a33', 0.45, 0.6);
  lampG.add(mesh(new T.CylinderGeometry(0.075, 0.085, 0.025, 32), metal, 0, 0.012, 0));
  const arm1 = mesh(new T.CylinderGeometry(0.008, 0.008, 0.5, 10), metal, 0.06, 0.25, 0.05);
  arm1.rotation.set(0.25, 0, -0.25);
  const arm2 = mesh(new T.CylinderGeometry(0.008, 0.008, 0.42, 10), metal, 0.26, 0.5, 0.18);
  arm2.rotation.set(-0.9, 0, -1.05);
  lampG.add(arm1, arm2);
  const head = mesh(new T.ConeGeometry(0.08, 0.14, 32, 1, true), mat('#2f4a3f', 0.4, 0.5, { side: T.DoubleSide }), 0.46, 0.5, 0.34);
  head.rotation.set(0.5, 0, 0.7);
  lampG.add(head);
  const bulb = mat('#ffd9a0', 0.2, 0, { emissive: '#ffcf8a', emissiveIntensity: 3 });
  const bulbM = mesh(new T.SphereGeometry(0.028, 16, 12), bulb, 0.43, 0.48, 0.32, false, false);
  lampG.add(bulbM);
  add(lampG);
  const lampLight = new T.SpotLight('#ffcf94', 5.5, 4, 0.85, 0.6, 1.6);
  lampLight.position.copy(lampG.position).add(v(0.43, 0.46, 0.32));
  lampLight.target.position.set(-0.75, TOP, -0.82);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.bias = -0.0004;
  lampLight.shadow.radius = 4;
  add(lampLight, lampLight.target);
  const fill = new T.PointLight('#ffb36b', 1.1, 3.4, 2);
  fill.position.copy(lampLight.position).add(v(0.1, -0.05, 0.2));
  add(fill);
  hots.push({ id: 'lamp', label: 'Desk lamp (on / off)', meshes: [head, bulbM, arm2], anchor: lampLight.position.clone().add(v(0, 0.08, 0)) });

  /* ---------------- secondary monitor (data) ---------------- */
  const mon = new T.Group();
  mon.position.set(0.36, TOP, -1.2);
  mon.rotation.y = -0.18;
  mon.add(mesh(rbox(0.18, 0.016, 0.14, 0.006), mat('#2a2b27', 0.5), 0, 0.008, 0));
  mon.add(mesh(new T.CylinderGeometry(0.012, 0.012, 0.16, 12), mat('#2a2b27', 0.5), 0, 0.09, -0.02));
  const monBody = mesh(rbox(0.44, 0.3, 0.035, 0.012), mat('#2a2b27', 0.55), 0, 0.3, 0);
  mon.add(monBody);
  const monitorCanvas = canvas(1024, 640, () => {});
  const monitorTexture = tex(monitorCanvas);
  const monScreen = new T.Mesh(new T.PlaneGeometry(0.4, 0.25), new T.MeshBasicMaterial({ map: monitorTexture, toneMapped: false }));
  monScreen.position.set(0, 0.305, 0.0185);
  mon.add(monScreen);
  mon.add(mesh(new T.PlaneGeometry(0.07, 0.07), new T.MeshStandardMaterial({ map: tex(noteTexture(['ground', 'first!'])), roughness: 0.9 }), 0.19, 0.42, 0.02, false, false));
  add(mon);
  const monW = mon.position.clone();
  hots.push({
    id: 'monitor',
    label: 'Data & intelligence monitor',
    meshes: [monScreen, monBody],
    anchor: monW.clone().add(v(0, 0.52, 0)),
    pose: { pos: monW.clone().add(v(0.1, 0.32, 0.6)), target: monW.clone().add(v(0, 0.3, 0)) },
  });

  /* ---------------- mascot standee ---------------- */
  const mascotTex = new T.TextureLoader().load(mascotUrl, (t) => {
    t.colorSpace = T.SRGBColorSpace;
  });
  const standee = mesh(new T.PlaneGeometry(0.15, 0.15), new T.MeshStandardMaterial({ map: mascotTex, transparent: true, alphaTest: 0.2, roughness: 0.8, side: T.DoubleSide }), 0.07, TOP + 0.09, -1.34, true, false);
  standee.rotation.y = -0.2;
  add(standee, mesh(rbox(0.09, 0.012, 0.04, 0.004), topMat, 0.07, TOP + 0.006, -1.34));

  /* ---------------- oscilloscope + function generator ---------------- */
  const sc = new T.Group();
  sc.position.set(0.98, TOP, -1.14);
  sc.rotation.y = -0.22;
  const scBody = mesh(rbox(0.42, 0.24, 0.34, 0.02), mat('#b8b3a4', 0.5, 0.15), 0, 0.12 + 0.02, 0);
  sc.add(scBody);
  sc.add(mesh(new T.BoxGeometry(0.4, 0.22, 0.004), mat('#3a3d3a', 0.6, 0.2), 0, 0.14, 0.171));
  for (const x of [-0.17, 0.17]) sc.add(mesh(new T.BoxGeometry(0.03, 0.02, 0.3), mat('#2a2a28', 0.8), x, 0.01, 0));
  const scopeCanvas = canvas(640, 512, () => {});
  const scopeTexture = tex(scopeCanvas);
  const scScreen = new T.Mesh(new T.PlaneGeometry(0.2, 0.16), new T.MeshBasicMaterial({ map: scopeTexture, toneMapped: false }));
  scScreen.position.set(-0.085, 0.145, 0.175);
  sc.add(scScreen);
  const knobs: T.Mesh[] = [];
  const knobMat = mat('#1d1e1c', 0.45, 0.3);
  const knobMark = mat('#e9e4d6', 0.4);
  [
    [0.07, 0.2],
    [0.13, 0.2],
    [0.07, 0.13],
    [0.13, 0.13],
    [0.07, 0.065],
    [0.13, 0.065],
  ].forEach(([x, y], i) => {
    const kn = mesh(new T.CylinderGeometry(0.017, 0.019, 0.02, 24), knobMat, x, y, 0.182);
    kn.rotation.x = Math.PI / 2;
    const mark = mesh(new T.BoxGeometry(0.003, 0.004, 0.014), knobMark, 0, 0.011, -0.007);
    kn.add(mark);
    knobs.push(kn);
    sc.add(kn);
    void i;
  });
  for (const x of [-0.15, -0.09, -0.03]) {
    const bnc = mesh(new T.CylinderGeometry(0.008, 0.008, 0.02, 12), mat('#c9c4b0', 0.3, 0.9), x, 0.04, 0.18);
    bnc.rotation.x = Math.PI / 2;
    sc.add(bnc);
  }
  add(sc);
  const scW = sc.position.clone();
  hots.push({
    id: 'scope',
    label: 'Oscilloscope — signals & DSP',
    meshes: [scScreen, scBody],
    anchor: scW.clone().add(v(0, 0.34, 0.05)),
    pose: { pos: scW.clone().add(v(0.12, 0.24, 0.55)), target: scW.clone().add(v(0, 0.14, 0.12)) },
  });
  // probe cable from the scope to the breadboard
  const probe = new T.CatmullRomCurve3([v(0.86, TOP + 0.04, -0.96), v(0.84, TOP + 0.01, -0.84), v(0.72, TOP + 0.006, -0.78), v(0.66, TOP + 0.02, -0.72)]);
  add(mesh(new T.TubeGeometry(probe, 30, 0.003, 6), mat('#2c4a7a', 0.5)));

  const fg = new T.Group();
  fg.position.set(1.5, TOP, -1.2);
  fg.rotation.y = -0.3;
  fg.add(mesh(rbox(0.3, 0.12, 0.26, 0.012), mat('#7e8a86', 0.5, 0.2), 0, 0.06, 0));
  const fgenCanvas = canvas(256, 64, () => {});
  const fgenTexture = tex(fgenCanvas);
  fg.add(mesh(new T.PlaneGeometry(0.12, 0.03), new T.MeshBasicMaterial({ map: fgenTexture, toneMapped: false }), -0.06, 0.08, 0.131, false, false));
  for (let i = 0; i < 4; i++) {
    const kn = mesh(new T.CylinderGeometry(0.01, 0.011, 0.014, 16), knobMat, 0.04 + (i % 2) * 0.05, 0.085 - Math.floor(i / 2) * 0.04, 0.134);
    kn.rotation.x = Math.PI / 2;
    fg.add(kn);
  }
  add(fg);

  // multimeter
  const mm = new T.Group();
  mm.position.set(1.36, TOP + 0.014, -0.76);
  mm.rotation.y = 0.4;
  mm.add(mesh(rbox(0.09, 0.028, 0.17, 0.012), mat('#e2b62c', 0.7), 0, 0, 0));
  mm.add(mesh(new T.BoxGeometry(0.07, 0.002, 0.04), mat('#9aa78c', 0.3, 0, { emissive: '#3a4a30', emissiveIntensity: 0.3 }), 0, 0.015, -0.05));
  const dial = mesh(new T.CylinderGeometry(0.022, 0.022, 0.008, 24), mat('#222', 0.5), 0, 0.016, 0.02);
  mm.add(dial);
  add(mm);
  for (const [col, off] of [
    ['#b02a20', 0.02],
    ['#1d1d1b', -0.02],
  ] as const) {
    const lead = new T.CatmullRomCurve3([v(1.36 + off, TOP + 0.02, -0.68), v(1.3 + off, TOP + 0.006, -0.6), v(1.16 + off, TOP + 0.006, -0.62), v(1.08 + off, TOP + 0.01, -0.7)]);
    add(mesh(new T.TubeGeometry(lead, 24, 0.0028, 6), mat(col, 0.5)));
  }

  /* ---------------- breadboard + boards ---------------- */
  const bb = new T.Group();
  bb.position.set(0.62, TOP, -0.72);
  bb.rotation.y = -0.08;
  const bbTop = mat('#ffffff', 0.75, 0, { map: tex(breadboardTexture()) });
  const bbBody = mesh(new T.BoxGeometry(0.32, 0.012, 0.11), [mat('#e8e4da', 0.7), mat('#e8e4da', 0.7), bbTop, mat('#e8e4da', 0.7), mat('#e8e4da', 0.7), mat('#e8e4da', 0.7)], 0, 0.006, 0);
  bb.add(bbBody);
  const ledMk = (c: string) => mat(c, 0.3, 0, { emissive: c, emissiveIntensity: 0 });
  const leds = { red: ledMk('#ff3b2a'), green: ledMk('#41ff6a'), amber: ledMk('#ffb21f') };
  ([['red', -0.06], ['green', 0], ['amber', 0.06]] as const).forEach(([k2, x]) => {
    const led = mesh(new T.SphereGeometry(0.007, 14, 10), leds[k2], x, 0.024, -0.02);
    led.scale.y = 1.4;
    bb.add(led, mesh(new T.CylinderGeometry(0.0007, 0.0007, 0.014, 4), mat('#bbb', 0.3, 0.9), x, 0.013, -0.02));
    // resistor
    const res = mesh(new T.CylinderGeometry(0.0028, 0.0028, 0.016, 10), mat('#d8b98a', 0.6), x, 0.016, 0.022);
    res.rotation.z = Math.PI / 2;
    bb.add(res);
  });
  const btn = mesh(rbox(0.014, 0.008, 0.014, 0.002), mat('#222', 0.6), 0.11, 0.016, 0.02);
  bb.add(btn, mesh(new T.CylinderGeometry(0.004, 0.004, 0.006, 12), mat('#c0392b', 0.5), 0.11, 0.022, 0.02));
  ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#ecf0f1'].forEach((col, i) => {
    const wire = new T.CatmullRomCurve3([v(-0.13 + i * 0.012, 0.012, -0.045), v(-0.16 + i * 0.01, 0.05, -0.05), v(-0.25 + i * 0.008, 0.03, -0.03), v(-0.29 + i * 0.006, 0.012, -0.02)]);
    bb.add(mesh(new T.TubeGeometry(wire, 20, 0.0015, 5), mat(col, 0.5)));
  });
  add(bb);
  const ard = mesh(new T.BoxGeometry(0.11, 0.006, 0.08), [mat('#16605f'), mat('#16605f'), mat('#ffffff', 0.6, 0, { map: tex(pcbTexture('UNO', '#1b6c73')) }), mat('#16605f'), mat('#16605f'), mat('#16605f')], 0.32, TOP + 0.003, -0.73);
  ard.rotation.y = -0.05;
  add(ard);
  const esp = mesh(new T.BoxGeometry(0.055, 0.005, 0.028), [mat('#111'), mat('#111'), mat('#ffffff', 0.6, 0, { map: tex(pcbTexture('ESP32', '#1d1d1d')) }), mat('#111'), mat('#111'), mat('#111')], 0.45, TOP + 0.0025, -0.62);
  esp.rotation.y = 0.3;
  add(esp);
  const bbW = bb.position.clone();
  hots.push({
    id: 'breadboard',
    label: 'Breadboard — embedded basics',
    meshes: [bbBody, ard],
    anchor: bbW.clone().add(v(-0.1, 0.1, 0)),
    pose: { pos: bbW.clone().add(v(-0.08, 0.42, 0.22)), target: bbW.clone().add(v(-0.08, 0, -0.01)) },
  });

  // soldering station
  const ss = new T.Group();
  ss.position.set(1.78, TOP, -0.86);
  ss.rotation.y = -0.5;
  ss.add(mesh(rbox(0.14, 0.08, 0.12, 0.01), mat('#2f3a44', 0.5, 0.3), 0, 0.04, 0));
  ss.add(mesh(new T.PlaneGeometry(0.05, 0.02), new T.MeshBasicMaterial({ color: '#ff6a3a', toneMapped: false }), -0.02, 0.06, 0.061, false, false));
  const helix = new T.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => v(0.12 + Math.cos(i * 0.9) * 0.018, 0.02 + i * 0.0022, Math.sin(i * 0.9) * 0.018)));
  ss.add(mesh(new T.TubeGeometry(helix, 120, 0.002, 6), mat('#9aa0a6', 0.3, 0.9)));
  const iron = mesh(new T.CylinderGeometry(0.008, 0.004, 0.16, 12), mat('#1d1d1b', 0.5), 0.12, 0.08, 0);
  iron.rotation.z = 0.5;
  ss.add(iron);
  add(ss);

  /* ---------------- architecture wall (cork) ---------------- */
  const wall = new T.Group();
  wall.position.set(-1.25, 1.85, -1.57);
  wall.add(mesh(rbox(1.62, 1.02, 0.04, 0.008), mat('#5a3f2b', 0.6, 0, { map: tex(woodTexture('#5a3f2b', '#3a281b', 31)) }), 0, 0, 0));
  const cork = mesh(new T.PlaneGeometry(1.52, 0.92), mat('#ffffff', 0.95, 0, { map: tex(corkTexture()) }), 0, 0, 0.021, false, true);
  wall.add(cork);
  const pin = (x: number, y: number, col = '#c0392b') => wall.add(mesh(new T.SphereGeometry(0.009, 10, 8), mat(col, 0.4), x, y, 0.035, false, false));
  const pinned: [string, string[], number, number, number, number][] = [
    ['CRICFIELD', ['Cricsheet', 'Ingest', 'SQLite', 'Express API', 'React UI', 'Static JSON'], -0.46, 0.16, 0.5, 0.03],
    ['HIREMAP', ['React+TS', 'Firebase', 'ATS flow'], 0.12, 0.2, 0.42, -0.04],
    ['CINEPHILE', ['not', 'documented', 'yet'], 0.5, -0.18, 0.34, 0.05],
  ];
  const blueprintMeshes: T.Mesh[] = [];
  pinned.forEach(([t, boxes, x, y, w, rot]) => {
    const bp = mesh(new T.PlaneGeometry(w, w * 0.75), mat('#ffffff', 0.85, 0, { map: tex(blueprintTexture(t, boxes)) }), x, y, 0.025 + blueprintMeshes.length * 0.001, false, true);
    bp.rotation.z = rot;
    wall.add(bp);
    blueprintMeshes.push(bp);
    pin(x, y + w * 0.34);
  });
  const tk = mesh(new T.PlaneGeometry(0.2, 0.088), mat('#ffffff', 0.8, 0, { map: tex(ticketTexture()) }), -0.48, -0.3, 0.03, false, false);
  tk.rotation.z = -0.12;
  wall.add(tk);
  pin(-0.56, -0.28, '#2a6f97');
  const pc = mesh(new T.PlaneGeometry(0.2, 0.13), mat('#ffffff', 0.8, 0, { map: tex(postcardTexture()) }), -0.17, -0.3, 0.03, false, false);
  pc.rotation.z = 0.08;
  wall.add(pc);
  pin(-0.17, -0.24, '#e2b62c');
  [
    [['Nyquist!', 'fs > 2f'], '#f6e27a', 0.2, -0.27, 0.1],
    [['the lab', "closes.", "curiosity", "doesn't."], '#a8e0c5', 0.66, 0.26, -0.08],
  ].forEach(([txt, col, x, y, r]) => {
    const n = mesh(new T.PlaneGeometry(0.13, 0.13), mat('#ffffff', 0.9, 0, { map: tex(noteTexture(txt as string[], col as string)) }), x as number, y as number, 0.03, false, false);
    n.rotation.z = r as number;
    wall.add(n);
  });
  add(wall);
  const wallW = wall.position.clone();
  hots.push({
    id: 'wall',
    label: 'Architecture wall',
    meshes: [cork, ...blueprintMeshes],
    anchor: wallW.clone().add(v(0, 0.56, 0.05)),
    pose: { pos: wallW.clone().add(v(0.05, -0.05, 1.45)), target: wallW.clone().add(v(0, -0.02, 0)) },
  });

  /* ---------------- book shelf above the wall ---------------- */
  add(mesh(rbox(1.7, 0.035, 0.24, 0.006), topMat, -1.25, 2.52, -1.48));
  for (const x of [-2.05, -0.45]) add(mesh(new T.BoxGeometry(0.03, 0.12, 0.2), mat('#2a2a26', 0.4, 0.6), x, 2.46, -1.5));
  let bx = -2.0;
  for (let i = 0; bx < -0.55; i++) {
    const bw = 0.03 + ((i * 37) % 5) * 0.008;
    const bh = 0.2 + ((i * 53) % 7) * 0.012;
    const spine = mat('#ffffff', 0.8, 0, { map: tex(spineTexture(i)) });
    const book = mesh(new T.BoxGeometry(bw, bh, 0.17), [mat(SPINE(i)), mat(SPINE(i)), mat('#e9e0c9'), mat('#e9e0c9'), spine, mat(SPINE(i))], bx + bw / 2, 2.5375 + bh / 2, -1.47);
    if (i % 9 === 6) book.rotation.z = 0.18;
    add(book);
    bx += bw + 0.004;
  }

  /* ---------------- window: evening / night Vizag ---------------- */
  const skylines = { evening: tex(skylineTexture('evening')), night: tex(skylineTexture('night')) };
  const glass = new T.MeshBasicMaterial({ map: skylines.night, toneMapped: false });
  glass.color.setScalar(0.85);
  const win = new T.Group();
  win.position.set(1.55, 1.95, -1.58);
  win.add(mesh(new T.PlaneGeometry(1.3, 1.0), glass, 0, 0, 0.005, false, false));
  const frame = mat('#4a3a2a', 0.55);
  win.add(mesh(new T.BoxGeometry(1.42, 0.06, 0.08), frame, 0, 0.53, 0.03), mesh(new T.BoxGeometry(1.42, 0.06, 0.08), frame, 0, -0.53, 0.03));
  win.add(mesh(new T.BoxGeometry(0.06, 1.12, 0.08), frame, -0.68, 0, 0.03), mesh(new T.BoxGeometry(0.06, 1.12, 0.08), frame, 0.68, 0, 0.03));
  win.add(mesh(new T.BoxGeometry(0.03, 1.0, 0.04), frame, 0, 0, 0.03), mesh(new T.BoxGeometry(1.3, 0.03, 0.04), frame, 0, 0.1, 0.03));
  win.add(mesh(new T.BoxGeometry(1.5, 0.04, 0.18), frame, 0, -0.57, 0.08));
  const pane = mesh(new T.PlaneGeometry(1.3, 1.0), new T.MeshStandardMaterial({ color: '#9fb7c8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.08 }), 0, 0, 0.04, false, false);
  win.add(pane);
  add(win);
  const moon = new T.DirectionalLight('#9ab4ff', 0.6);
  moon.position.set(1.6, 2.4, -3);
  moon.target.position.set(0.5, 0.9, -0.6);
  add(moon, moon.target);
  hots.push({ id: 'window', label: 'Window (evening / night)', meshes: [pane], anchor: win.position.clone().add(v(0, 0.62, 0.05)) });

  /* ---------------- headphones on a wall hook ---------------- */
  const hp = new T.Group();
  hp.position.set(0.0, 1.62, -1.55);
  hp.add(mesh(new T.CylinderGeometry(0.006, 0.006, 0.05, 8), mat('#9aa0a6', 0.3, 0.9), 0, 0.02, 0.02));
  const bandM = mat('#1f2a2a', 0.5);
  const band = mesh(new T.TorusGeometry(0.085, 0.009, 10, 32, Math.PI), bandM, 0, -0.07, 0.05);
  hp.add(band);
  const cupL = mesh(new T.CylinderGeometry(0.038, 0.038, 0.03, 24), mat('#f2a93b', 0.5), -0.085, -0.08, 0.05);
  cupL.rotation.z = Math.PI / 2;
  const cupR = cupL.clone();
  cupR.position.x = 0.085;
  hp.add(cupL, cupR);
  add(hp);
  hots.push({ id: 'headphones', label: 'Headphones (ambient sound)', meshes: [band, cupL, cupR], anchor: hp.position.clone().add(v(0, 0.06, 0.05)) });

  /* ---------------- server rack ---------------- */
  const sv = new T.Group();
  sv.position.set(2.5, 0, -1.1);
  sv.rotation.y = -0.35;
  const svBody = mesh(rbox(0.56, 1.0, 0.62, 0.012), mat('#202321', 0.45, 0.4), 0, 0.5, 0);
  sv.add(svBody);
  const serverLeds: T.MeshStandardMaterial[] = [];
  for (let u = 0; u < 5; u++) {
    sv.add(mesh(rbox(0.5, 0.13, 0.02, 0.004), mat('#2c302d', 0.4, 0.5), 0, 0.2 + u * 0.16, 0.31));
    for (let l = 0; l < 4; l++) {
      const m2 = mat(l % 2 ? '#41ff6a' : '#ffb21f', 0.3, 0, { emissive: l % 2 ? '#41ff6a' : '#ffb21f', emissiveIntensity: 1.5 });
      serverLeds.push(m2);
      sv.add(mesh(new T.SphereGeometry(0.006, 8, 6), m2, -0.2 + l * 0.025, 0.2 + u * 0.16, 0.322, false, false));
    }
    for (let p = 0; p < 6; p++) sv.add(mesh(new T.BoxGeometry(0.018, 0.012, 0.004), mat('#0d0e0d', 0.6), 0.02 + p * 0.03, 0.2 + u * 0.16, 0.322, false, false));
  }
  add(sv);
  const svW = sv.position.clone();
  hots.push({
    id: 'server',
    label: 'Server rack — request flow',
    meshes: [svBody],
    anchor: svW.clone().add(v(0, 1.12, 0)),
    pose: { pos: svW.clone().add(v(-0.9, 1.05, 1.75)), target: svW.clone().add(v(0, 0.55, 0)) },
  });

  /* ---------------- ceiling fan ---------------- */
  const fan = new T.Group();
  fan.position.set(0.1, 3.0, -0.3);
  add(mesh(new T.CylinderGeometry(0.015, 0.015, 0.4, 8), mat('#3a3a34', 0.4, 0.6), 0.1, 3.2, -0.3, false, false));
  fan.add(mesh(new T.CylinderGeometry(0.09, 0.07, 0.1, 24), mat('#4a4a40', 0.4, 0.5), 0, 0, 0, false, false));
  for (let i = 0; i < 3; i++) {
    const blade = mesh(rbox(0.62, 0.012, 0.13, 0.004), mat('#6b5a44', 0.6), 0.38, -0.02, 0, false, false);
    const holder = new T.Group();
    holder.rotation.y = (i * Math.PI * 2) / 3;
    blade.rotation.x = 0.08;
    holder.add(blade);
    fan.add(holder);
  }
  add(fan);
  hots.push({ id: 'fan', label: 'Ceiling fan (speed)', meshes: [fan], anchor: fan.position.clone().add(v(0, 0.05, 0)) });

  /* ---------------- ambient light ---------------- */
  add(new T.HemisphereLight('#9aa898', '#2a1d12', 0.8));
  const roomFill = new T.PointLight('#ffcf9a', 0.8, 7, 2);
  const rackLight = new T.PointLight('#9fc4ff', 0.6, 3, 2);
  rackLight.position.set(2.0, 1.6, -0.2);
  add(rackLight);
  roomFill.position.set(0.6, 2.7, 0.8);
  add(roomFill);

  return {
    group: g,
    hots,
    crtCanvas,
    crtTexture,
    scopeCanvas,
    scopeTexture,
    monitorCanvas,
    monitorTexture,
    fgenCanvas,
    fgenTexture,
    crtScreen,
    crtGlow,
    crtLed,
    lamp: { light: lampLight, bulb, fill },
    fan,
    leds,
    serverLeds,
    knobs,
    windowGlass: glass,
    skylines,
    moon,
    notebookPages: { left: leftPage, right: rightPage },
  };
}

const SPINE_COLS = ['#7b2d26', '#2f4b5c', '#3e5a3a', '#8a6a2f', '#5b3b5e', '#24323f', '#9a4c2b', '#4f5b2a', '#6d6458', '#2b2a28'];
function SPINE(i: number) {
  return SPINE_COLS[i % SPINE_COLS.length];
}
