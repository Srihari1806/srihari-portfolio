import { chair, distance, hotspots, lengths, move, nearestRoute, pathTo, point, route, routePoint, totalLength, tourStops, zoneAt, type Point, type Rect, type Zone } from './plan';

export class WalkerController {
  position={...route[0]};
  heading=2.1;
  speed=0;
  seated=false;
  manual=false;
  progress=0;
  target=0;
  stick=point(0,0);
  keys=new Set<string>();
  discovered=new Set<Zone>(['outside']);
  private joining:Point[]=[];
  private velocity=point(0,0);
  get zone(){return zoneAt(this.position);}
  get near(){
    if(this.seated)return hotspots.find(h=>h.id==='screen');
    return hotspots.filter(h=>h.zone===this.zone && distance(this.position,h.at)<h.reach &&
      (h.id!=='seat'||(this.position.z<chair.z-.4 && Math.abs(this.position.x-chair.x)<1.1))
    ).sort((a,b)=>distance(this.position,a.at)-distance(this.position,b.at))[0];
  }
  release(){this.keys.clear();this.stick=point(0,0);this.velocity=point(0,0);this.speed=0;}
  keyDirection(){return this.keys.has('KeyW')||this.keys.has('KeyA')||this.keys.has('KeyS')||this.keys.has('KeyD')||['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>this.keys.has(k))||Math.hypot(this.stick.x,this.stick.z)>.05;}
  guide(delta:number,nextStop=false){
    if(this.keyDirection())return;
    if(this.seated)this.stand();
    if(this.manual){
      const nearest=nearestRoute(this.position,this.progress),join=pathTo(this.position,routePoint(nearest));
      if(!join)return;
      this.progress=this.target=nearest;this.joining=join;this.manual=false;this.velocity=point(0,0);
    }
    this.target=nextStop?(tourStops.map(i=>lengths[i]).find(s=>s>this.target+.18)??totalLength):Math.max(0,Math.min(totalLength,this.target+delta));
  }
  sit(){
    if(this.near?.id!=='seat')return;
    this.release();this.seated=true;this.manual=true;this.joining=[];this.heading=Math.PI;
    this.position=point(chair.x,chair.z-.05);
  }
  stand(){
    if(!this.seated)return;
    this.position=point(chair.x,chair.z-.88);this.seated=false;this.manual=true;this.heading=Math.PI;
  }
  tick(dt:number,yaw:number,doors:Rect[]){
    if(dt<=0)return;
    const p=this.position,start={...p};
    const pressed=(...k:string[])=>Number(k.some(key=>this.keys.has(key)));
    let dx=pressed('KeyD','ArrowRight')-pressed('KeyA','ArrowLeft')+this.stick.x;
    let dz=pressed('KeyS','ArrowDown')-pressed('KeyW','ArrowUp')+this.stick.z;
    const input=Math.hypot(dx,dz);
    if(this.seated){if(input>.05)this.stand();return;}
    if(input>.05){
      this.manual=true;this.joining=[];
      const mag=Math.min(input,1), speed=(this.keys.has('ShiftLeft')||this.keys.has('ShiftRight')||Math.hypot(this.stick.x,this.stick.z)>.93?4.45:2.45)*mag;
      dx/=input;dz/=input;const blend=1-Math.exp(-15*dt);
      this.velocity.x+=((dx*Math.cos(yaw)+dz*Math.sin(yaw))*speed-this.velocity.x)*blend;
      this.velocity.z+=((-dx*Math.sin(yaw)+dz*Math.cos(yaw))*speed-this.velocity.z)*blend;
      move(p,this.velocity.x*dt,this.velocity.z*dt,doors);
    }else if(this.manual){
      const damp=Math.exp(-20*dt);this.velocity.x*=damp;this.velocity.z*=damp;
      move(p,this.velocity.x*dt,this.velocity.z*dt,doors);
    }else{
      let budget=dt*3.25;
      while(budget>.0001){
        const join=this.joining[0];const delta=this.target-this.progress;
        if(!join && Math.abs(delta)<.001)break;
        // Never cut a corner when a wheel event spans several route segments.
        const corner=delta>0?lengths.find(n=>n>this.progress+.0001):[...lengths].reverse().find(n=>n<this.progress-.0001);
        const s=this.progress+Math.sign(delta)*Math.min(budget,Math.abs(delta),Math.abs((corner??this.target)-this.progress));
        const goal=join??routePoint(s),gap=distance(p,goal),step=Math.min(budget,gap);
        const old={...p};
        if(gap>.0001)move(p,(goal.x-p.x)*step/gap,(goal.z-p.z)*step/gap,doors);
        budget-=step;
        if(distance(p,goal)<.001){
          if(join)this.joining.shift();else this.progress=s;
        }else if(distance(old,p)<.0001 || !join)break;
        if(step<.00001 && !join)break;
      }
    }
    const traveled=distance(start,p);this.speed=traveled/dt;
    if(traveled>.0004){
      const angle=Math.atan2(p.x-start.x,p.z-start.z);
      this.heading+=Math.atan2(Math.sin(angle-this.heading),Math.cos(angle-this.heading))*(1-Math.exp(-13*dt));
    }
    this.discovered.add(this.zone);
  }
}

