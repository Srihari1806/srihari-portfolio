import * as T from 'three';
import { SetBuilder, Workshop } from './model';
import { paint as p } from './art';
import { exitGate, solid, type Rect } from './plan';
import { sconce } from './street';

export function createExit(kit:Workshop){
  const {x,z,width}=exitGate;
  const set=new SetBuilder(kit);
  // Visitors see the arch face-on from the memory corridor, and can read it again from the lane.
  for(const side of [-1,1]){
    const zz=z+side*(width/2+.19);
    set.box('#809b84',x,1.69,zz,.76,3.38,.48,kit.plaster());
    set.round('#617362',x,.255,zz,.89,.51,.62);set.round(p.trim,x,.54,zz,.86,.11,.58);
    set.round(p.trim,x,3.28,zz,.90,.16,.65);set.round(p.brass,x,3.39,zz,.76,.075,.55);
    set.part('vase','#daba7a',x,3.64,zz,.34,.39,.34);set.orb('#ffdf95',x,3.95,zz,.34,.37,.34);
    for(const y of [1.04,2.8])set.round('#b6b397',x,y,zz,.78,.05,.5);
  }
  const archWidth=width/2+.18,curve=(theta:number)=>({z:z+Math.cos(theta)*archWidth,y:2.79+Math.sin(theta)*.94});
  for(let i=0;i<24;i++){
    const a=curve(Math.PI*i/24),b=curve(Math.PI*(i+1)/24);
    set.rod('#527466',[x,a.y,a.z],[x,b.y,b.z],.15);
    set.rod('#d4b781',[x-.155,a.y-.028,a.z],[x-.155,b.y-.028,b.z],.040);
  }
  const plaque=kit.plaque('EXIT','నిష్క్రమణ','#3c574a','#ffe7ad',3.28);
  set.round('#a58858',x,3.02,z,.15,.625,1.93);
  for(const side of [-1,1])set.panel(plaque,x+side*.09,3.02,z,1.86,.56,side*Math.PI/2);
  // Beyond the threshold is a lit return lane with a curb, striped canopy and rendered paving.
  set.floor(68.5,-.80,7.05,4.40,'#bfad90');
  for(let xx=65.45;xx<71.75;xx+=.91)set.box('#c6b298',xx,.025,1.29,.89,.06,.15);
  set.box('#99aa92',68.47,.94,-3.08,6.97,1.89,.27,kit.plaster());
  set.box('#efe0ae',68.47,1.90,-3.07,7.04,.11,.34);
  for(let xx=65.5;xx<72;xx+=.82)set.box('#738e7b',xx,.754,-2.92,.12,1.5,.11);
  sconce(set,69.42,1.59,-2.93);
  for(let i=0;i<3;i++){const zPost=-2.55+i*1.35;
    set.part('cyl','#56695a',71.73,.33,zPost,.16,.66,.16);set.orb('#af9769',71.73,.69,zPost,.19,.13,.19);
  }
  const leaves=[-1,1].map(side=>{
    const leaf=new SetBuilder(kit),w=width/2,inner=-side;
    for(const y of [.23,.86,1.86])leaf.box('#39564c',0,y,inner*w/2,.091,.092,w-.035);
    for(let j=0;j<=7;j++){
      const d=(.055+j*(w-.12)/7)*inner,top=1.91+.27*Math.sin(j/7*Math.PI);
      leaf.rod('#436457',[0,.17,d],[0,top,d],.025);
      leaf.part('vase',p.brass,0,top+.025,d,.089,.073,.089);leaf.part('cone',p.brass,0,top+.12,d,.083,.15,.083);
    }
    for(let j=0;j<3;j++)leaf.part('ring','#bd9861',0,1.34,(.28+j*.44)*inner,.32,.52,.41,[0,Math.PI/2,0]);
    leaf.box('#536d5f',0,.52,inner*w/2,.073,.42,w-.14);
    leaf.round(p.brass,-.077,1.01,inner*(w-.15),.072,.26,.081);
    const group=leaf.finish();group.position.set(x,0,z+side*w);return group;
  });
  let amount=0;const blockers:Rect[]=[];
  function update(px:number,pz:number,dt:number){
    const close=Math.abs(px-x)<3.45 && Math.abs(pz-z)<2.48;
    amount=T.MathUtils.damp(amount,close?1:0,4.6,dt);
    blockers.length=0;
    for(let i=0;i<2;i++){
      const side=i?1:-1,ang=-side*amount*1.43,g=leaves[i];g.rotation.y=ang;
      for(let j=0;j<9;j++){
        const local=-side*(j+.5)*width/18;
        blockers.push(solid(x+Math.sin(ang)*local,g.position.z+Math.cos(ang)*local,.24,.24));
      }
    }
    return blockers;
  }
  return {frame:set.finish(),leaves,update};
}

