import type { WalkerController } from './controller';

const turn = (from:number,to:number) => Math.atan2(Math.sin(to-from),Math.cos(to-from));
const ease = (rate:number,dt:number) => 1-Math.exp(-rate*dt);

/** Shoulder camera with independent movement intent. Holding right must not describe a circle
 * as the camera swings around behind the walker. A new key chord uses the new view direction. */
export class FollowCamera {
  yaw=-.38;
  pitch=.18;
  leadX=1.4;
  leadZ=-1.1;
  private movementBasis=this.yaw;
  private chord='';
  private dragYaw=this.yaw;
  private dragPitch=this.pitch;
  private lookHold=0;
  private travelled=false;

  inputYaw(p:WalkerController){
    const horizontal=Number(p.keys.has('KeyD')||p.keys.has('ArrowRight'))-Number(p.keys.has('KeyA')||p.keys.has('ArrowLeft'));
    const vertical=Number(p.keys.has('KeyS')||p.keys.has('ArrowDown'))-Number(p.keys.has('KeyW')||p.keys.has('ArrowUp'));
    const analog=Math.hypot(p.stick.x,p.stick.z)>.05;
    const chord=analog?'stick':horizontal+','+vertical;
    if(chord!==this.chord || this.lookHold>0 || (!analog && horizontal===0 && vertical===0))this.movementBasis=this.yaw;
    this.chord=chord;return this.movementBasis;
  }
  orbit(dx:number,dy:number){
    if(this.lookHold<=0){this.dragYaw=this.yaw;this.dragPitch=this.pitch;}
    this.dragYaw-=dx*.006;this.dragPitch=Math.min(.84,Math.max(.075,this.dragPitch+dy*.003));
    this.lookHold=1.65;
  }
  update(p:WalkerController,dt:number,reduced:boolean){
    const walking=p.speed>.12,atGate=p.position.x>62.7 && p.position.z>-2.65;
    this.travelled ||= walking;
    this.lookHold=Math.max(0,this.lookHold-dt);
    const dragging=this.lookHold>0;
    let desired=this.yaw,rate=3.45;
    const east=Math.sin(p.heading),south=Math.cos(p.heading);
    if(dragging){desired=this.dragYaw;rate=16;}
    else if(p.seated)desired=-.04;
    else if(walking){
      // Show a little of the side elevation on the eastbound guided tour.
      const shoulder=p.manual?.19:east*.59;
      desired=p.heading+Math.PI+shoulder;
      if(atGate && !p.manual)desired=-1.40;
    }else if(!p.manual && this.travelled && p.near){
      desired=atGate?-1.40:p.near.id==='screen'?-.10:-.25;
      rate=1.8;
    }
    const step=turn(this.yaw,desired)*ease(rate,dt);
    const cap=dt*(dragging?7.8:reduced?1.4:2.3);
    this.yaw+=Math.max(-cap,Math.min(cap,step));
    const targetPitch=dragging?this.dragPitch:p.seated?.13:walking?(p.zone==='outside'?.21:.26):this.pitch;
    this.pitch+=(targetPitch-this.pitch)*ease(dragging?14:2.3,dt);
    let x=this.leadX,z=this.leadZ;
    if(p.seated){x=(33-p.position.x)*.44;z=-2.85;}
    else if(dragging){x=-Math.sin(this.yaw)*.78;z=-Math.cos(this.yaw)*.78;}
    else if(walking){const lead=p.speed>3.5?1.76:1.24;x=east*lead;z=south*lead;}
    else if(this.travelled && !p.manual && p.near){x=atGate?1.24:0;z=atGate?0:-.97;}
    this.leadX+=(x-this.leadX)*ease(4,dt);this.leadZ+=(z-this.leadZ)*ease(4,dt);
  }
}

