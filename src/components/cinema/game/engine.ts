import * as T from 'three';
import { canvasTexture, shadowTexture } from './art';
import { Workshop } from './model';
import { WalkerController } from './controller';
import { createStreet } from './street';
import { createInteriors, projectionCard, type PosterSlot } from './interiors';
import { FollowCamera } from './follow-camera';
import { createExit } from './exit-gate';
import { makeVisitor } from './visitor';
import type { Exhibit, Point, Zone } from './plan';

export type FrameContent={posterUrls:(string|undefined)[];upcomingUrls:string[];albumUrls:string[];screenTitle:string;screenCredit:string};
export type Snapshot={zone:Zone;near?:{id:Exhibit;label:string};seated:boolean;manual:boolean;discovered:Zone[];position:Point;heading:number};
type Events={state:(s:Snapshot)=>void;failed:()=>void};
export function openTheatre(canvas:HTMLCanvasElement,events:Events,reduced:boolean){
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.11;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  const kit=new Workshop(),scene=new T.Scene(),sky=kit.tex(canvasTexture(4,512,c=>{
    const g=c.createLinearGradient(0,0,0,512);g.addColorStop(0,'#819da2');g.addColorStop(.47,'#e8bc98');g.addColorStop(.82,'#e5ba95');g.addColorStop(1,'#b99c83');c.fillStyle=g;c.fillRect(0,0,4,512);
  }));
  scene.background=sky;scene.fog=new T.FogExp2('#d8ae8b',.019);
  const camera=new T.PerspectiveCamera(44,1,.09,112),player=new WalkerController();
  const street=createStreet(kit),hero=makeVisitor(kit),gate=createExit(kit),rig=new FollowCamera();
  scene.add(gate.frame,...gate.leaves);
  scene.add(street.street,street.facade,street.backdrop,...street.doors,...street.extras.map(r=>r.group),hero.group);
  const hemi=new T.HemisphereLight('#ffefd8','#a78773',1.53),sun=new T.DirectionalLight('#ffce93',2.15),fill=new T.DirectionalLight('#b5d7d1',.64);
  fill.position.set(3,5,7);sun.castShadow=true;
  const sc=sun.shadow.camera;sc.left=-14;sc.right=14;sc.top=13;sc.bottom=-13;sc.near=.5;sc.far=65;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.035;sun.shadow.bias=-.00028;
  scene.add(hemi,fill,sun,sun.target);
  const shadowMaterial=new T.MeshBasicMaterial({map:kit.tex(shadowTexture()),transparent:true,depthWrite:false});
  const shadow=new T.Mesh(kit.geometries.get('quad'),shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.scale.set(1.03,.77,1);scene.add(shadow);
  const focus=new T.Vector3(),look=new T.Vector3(),sunset=new T.Vector3(-14,17,8);
  let last=0,frame=0,time=0,paused=false,closed=false,initial=true;
  let distanceToPlayer=10.45;
  let interior:ReturnType<typeof createInteriors>|undefined;
  let content:FrameContent|undefined,slide='';
  const requested=new Map<PosterSlot,string|undefined>(),loader=new T.TextureLoader();
  function setPrint(slot:PosterSlot,url:string|undefined){
    if(requested.get(slot)===url)return;
    requested.set(slot,url);
    const old=slot.material.map;
    if(old && old!==slot.original){kit.textures.delete(old);old.dispose();}
    slot.material.map=slot.original;slot.material.needsUpdate=true;
    if(!url)return;
    loader.load(url,texture=>{
      if(closed||requested.get(slot)!==url){texture.dispose();return;}
      texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;slot.material.map=kit.tex(texture);slot.material.needsUpdate=true;
    },undefined,()=>{ /* Keep the physical print when a provider cannot supply a texture. */ });
  }
  function dressSet(){
    if(!content)return;
    const c=content;street.hoardings.forEach((slot,i)=>setPrint(slot,c.upcomingUrls[(i+2)%4]));
    if(!interior)return;
    interior.slots.forEach((slot,i)=>setPrint(slot,c.posterUrls[i]));interior.albumSlots.forEach((slot,i)=>setPrint(slot,c.albumUrls[i]));
    const title=c.screenTitle+'|'+c.screenCredit;
    if(slide!==title){const old=interior.screenMat.map;if(old){kit.textures.delete(old);old.dispose();}
      interior.screenMat.map=kit.tex(projectionCard(c.screenTitle,c.screenCredit));slide=title;}
  }
  function prepareInterior(){if(closed||interior)return;interior=createInteriors(kit);scene.add(interior.group);dressSet();}
  let lastStamp='',stampTime=0,pixelCap=1.5,slow=0;
  const resize=()=>{
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,w<650?1.22:1.55,pixelCap));renderer.setSize(w,h,false);
    camera.aspect=w/h;camera.fov=w/h<.85?62:44;camera.updateProjectionMatrix();
  };
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function snapshot():Snapshot{const near=player.near;return {zone:player.zone,near:near?{id:near.id,label:near.label}:undefined,seated:player.seated,manual:player.manual,discovered:Array.from(player.discovered),position:{...player.position},heading:player.heading};}
  function render(now:number){
    if(closed)return;
    frame=requestAnimationFrame(render);if(document.hidden || (paused&&!initial)){last=0;return;}
    const real=last?(now-last)/1000:1/60;last=now;const dt=Math.min(real,.075);time+=dt;
    let left=dt;
    const movementYaw=rig.inputYaw(player);
    while(left>.00001){
      const step=Math.min(left,1/60),{x,z}=player.position;
      const doorBlocks=street.doorUpdate(x,z,step);
      const gateBlocks=gate.update(x,z,step);
      player.tick(step,movementYaw,x>52?gateBlocks:doorBlocks);
      left-=step;
    }
    const {x,z}=player.position;const inside=player.zone!=='outside' && x<65.35;
    if(inside&&!interior)prepareInterior();
    hero.group.position.set(x,0,z);hero.group.rotation.y=player.heading;hero.animate(dt,player.speed,player.seated,time,reduced);
    shadow.position.set(x,.043,z);
    rig.update(player,dt,reduced);
    const portrait=camera.aspect<.85;
    const inHall=player.zone==='screen';
    look.set(x+rig.leadX*(portrait?.72:1),player.seated?1.98:inHall?2.05:inside?1.65:x>65?1.68:2.66,z+rig.leadZ);
    if(initial||reduced)focus.copy(look);else focus.lerp(look,1-Math.exp(-6*dt));
    const desiredRadius=inside?(portrait?5.35:6.65):portrait?7.45:10.45;
    distanceToPlayer=initial?desiredRadius:T.MathUtils.damp(distanceToPlayer,desiredRadius,5,dt);
    camera.position.set(focus.x+Math.sin(rig.yaw)*distanceToPlayer,focus.y+Math.sin(rig.pitch)*distanceToPlayer,focus.z+Math.cos(rig.yaw)*distanceToPlayer);
    camera.lookAt(focus);
    street.facade.visible=!(z<-.16 && camera.position.z>-.12 || z>.16 && camera.position.z<-.24);
    for(const d of street.doors)d.visible=street.facade.visible;
    sun.target.position.set(Math.round(x/2)*2,0,Math.round(z/2)*2);
    street.street.visible=x<18;street.facade.visible=street.facade.visible&&x<18;street.backdrop.visible=!inside || x<10;
    street.extras.forEach(extra=>{extra.group.visible=x<12;});
    gate.frame.visible=x>52;gate.leaves.forEach(leaf=>{leaf.visible=x>52;});
    interior?.view(player.position,camera.position,dt,reduced);
    sun.intensity=T.MathUtils.damp(sun.intensity,inHall?.35:inside?.95:2.0,4,dt);
    hemi.intensity=T.MathUtils.damp(hemi.intensity,inHall?.79:inside?1.38:1.53,4,dt);
    sun.position.copy(sun.target.position).add(sunset);
    renderer.render(scene,camera);initial=false;
    if(real>.047 && real<.3)slow+=dt;else slow=Math.max(0,slow-dt*.6);
    if(slow>2 && pixelCap>.82){pixelCap=Math.max(.8,pixelCap-.22);slow=0;resize();}
    if(now-stampTime>90 || !lastStamp){
      stampTime=now;const s=snapshot(),id=[s.zone,s.near?.id,s.seated,s.manual,s.discovered.length].join('/');
      if(id!==lastStamp){lastStamp=id;events.state(s);}
    }
  }
  const focusLoss=()=>{player.release();last=0;};
  const lost=(e:Event)=>{e.preventDefault();events.failed();};
  window.addEventListener('blur',focusLoss);document.addEventListener('visibilitychange',focusLoss);canvas.addEventListener('webglcontextlost',lost);
  render(performance.now());
  const setup=window.setTimeout(prepareInterior,160);
  return {
    player,snapshot, orbit:(dx:number,dy:number)=>rig.orbit(dx,dy),
    pause:(value:boolean)=>{paused=value;player.release();last=0;},quiet:(v:boolean)=>{reduced=v;},
    setContent:(value:FrameContent)=>{content=value;dressSet();},
    dispose:()=>{closed=true;clearTimeout(setup);cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('blur',focusLoss);document.removeEventListener('visibilitychange',focusLoss);canvas.removeEventListener('webglcontextlost',lost);
      hero.dispose();street.extras.forEach(n=>n.dispose());shadowMaterial.dispose();scene.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose();});sun.shadow.dispose();kit.dispose();renderer.dispose();},
  };
}
export type TheatreEngine=ReturnType<typeof openTheatre>;

