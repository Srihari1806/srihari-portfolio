import * as T from 'three';
import { paint as p, random } from './art';
import { SetBuilder, Workshop, frame } from './model';
import { columns, entrance, queuePosts, patrons, type Rect, solid } from './plan';
import { makeVisitor } from './visitor';

export function sconce(b:SetBuilder,x:number,y:number,z:number) {
  b.round(p.brass,x,y-.12,z,.16,.27,.10);b.rod(p.brass,[x,y-.17,z],[x,y-.025,z+.22],.034);
  b.part('vase','#ffe1a3',x,y+.12,z+.22,.22,.29,.22,[0,0,0],b.kit.bulb);
  b.part('cone',p.pine,x,y+.31,z+.22,.31,.13,.31);b.part('cyl',p.brass,x,y-.033,z+.22,.18,.05,.18);
}
export function palm(b:SetBuilder,x:number,z:number,size:number) {
  const y=size*.42;b.part('vase','#a6664a',x,y/2,z,size*.47,y,size*.47);b.part('cyl','#c88d60',x,y,z,size*.49,size*.065,size*.49);
  b.part('cyl','#574531',x,y+.025,z,size*.406,.05,size*.406);
  for(let i=0;i<15;i++){const a=i*2.39,lean=.2+(i%4)*.15,h=size*(.32+(i%5)*.072);
    b.rod('#665d3b',[x,y,z],[x+Math.sin(a)*lean*size,y+h,z+Math.cos(a)*lean*size],.016*size);
    b.part('ball',['#546c46','#6d8351','#819448','#496b52'][i%4],x+Math.sin(a)*lean*size,y+h,z+Math.cos(a)*lean*size,.18*size,.58*size,.055*size,[lean*1.7,a,-.15]);
  } b.shade(x,z,size*.97,size*.77);
}
function scooter(b:SetBuilder,x:number,z:number,c:string){
  const iron='#474841';
  for(const xx of [-.68,.68]){
    b.part('ring',iron,x+xx,.3,z,.61,.61,.85);
    b.part('cyl','#c1b8a0',x+xx,.30,z,.33,.13,.33,[Math.PI/2,0,0]);
    b.part('cyl',iron,x+xx,.30,z+.03,.12,.14,.12,[Math.PI/2,0,0]);
    b.orb(c,x+xx,.50,z,.62,.17,.30);
  }
  b.round('#746d55',x-.05,.36,z,1.04,.12,.32);b.orb(c,x-.40,.55,z,.9,.52,.41);
  b.round('#493c32',x-.3,.78,z,.65,.115,.38);b.part('round',c,x+.36,.61,z,.16,.64,.4,[0,0,.36]);
  b.rod('#a59c81',[x+.45,.66,z],[x+.55,1.08,z],.052);b.orb(c,x+.54,1.05,z,.28,.195,.22);
  b.orb('#ffe8ac',x+.66,1.05,z,.068,.144,.157);b.rod(iron,[x+.48,1.055,z-.24],[x+.48,1.055,z+.24],.029);
  b.rod(iron,[x+.46,1.08,z+.18],[x+.4,1.3,z+.22],.014);b.orb('#ccc7aa',x+.4,1.3,z+.22,.135,.092,.036);
  b.round('#f7d4a2',x-.74,.56,z+.18,.184,.08,.027);b.shade(x,z,2.04,.82);
}
function tree(b:SetBuilder,x:number,z:number,scale:number,seed:number) {
  const r=random(seed),wood='#6d5640';
  b.rod(wood,[x,0,z],[x-.12*scale,2.85*scale,z],.17*scale);
  for(let j=0;j<11;j++){
    const a=j*2.399,rad=scale*(.22+r()*1.5),yy=(2.9+r()*.86)*scale,xx=x+Math.cos(a)*rad,zz=z+Math.sin(a)*rad;
    b.rod(wood,[x-.1*scale,1.95*scale,z],[xx,yy,zz],.068*scale);
    for(let k=0;k<4;k++){
      const w=(.94+r()*.6)*scale;b.part('leaf',['#596e46','#73824b','#485f46','#8e9255'][Math.floor(r()*4)],xx+(r()-.5)*scale,yy+(r()-.4)*scale*.65,zz+(r()-.5)*scale,w,w*.77,w,[r(),r()*3,r()]);
    }
  }
  b.shade(x,z,scale*3.8,scale*2.4);
}
export function createStreet(kit:Workshop){
  const street=new SetBuilder(kit), face=new SetBuilder(kit), rear=new SetBuilder(kit);
  street.floor(-1,4.5,22.5,9.5,'#c8b09b');
  street.box('#a5806a',-1,-.13,6,23,.25,14);
  street.floor(-1,10.6,31,3.3,'#9c8f7e');
  for(let x=-16;x<15;x+=2.2)street.box('#d9c5a8',x,.018,9.06,2.15,.07,.22);
  street.floor(4,1.72,2.84,3.64,'#a3594f','carpet',.023);
  for(const x of [2.63,5.37])street.box('#d3ad70',x,.034,1.76,.04,.018,3.45);
  // The storefront is its own cutaway. Doors and supports are real meshes at the collision plane.
  for(const [x,w] of [[-4.82,14.84],[7.84,4.88]]){
    face.box(p.mint,x,2.7,-.19,w,5.4,.38,kit.plaster());face.box('#426f64',x,.38,.035,w,.75,.12);
    face.box(p.trim,x,.79,.075,w,.075,.12);
  }
  face.box(p.pale,4,4.3,-.16,2.8,2.2,.34,kit.plaster());
  for(const x of [2.53,5.47]){face.round(p.trim,x,1.66,.038,.16,3.31,.19);face.box(p.pine,x,1.6,.07,.055,3.14,.21);}
  face.box(p.wood,4,3.2,.08,3,.16,.18);
  // Parapet steps, fluted pilasters and a central sunrise medallion.
  for(const [w,h] of [[21.4,5.42],[14,5.82],[8.7,6.18],[5.7,6.49]]){
    face.box(p.mint,-.9,(h+4.84)/2,-.31,w,h-4.84,.53,kit.plaster());
    face.round(p.trim,-.9,h,-.26,w+.1,.102,.70);
  }
  for(let i=-5;i<=5;i++){const h=1.15-Math.abs(i)*.12;face.round(i%2?p.pale:p.trim,-.9+i*.34,5.43+h/2,.014,.145,h,.18);}
  for(const x of [-10.7,-7.25,6.7,9.55]){for(let k=0;k<3;k++)face.round(p.pale,x+k*.155,3.14,.063,.085,4.56-Math.abs(k-1)*.45,.16);}
  for(const x of columns){
    face.part('cyl',p.mint,x,1.53,.68,.41,3.06,.41);
    face.part('cyl',p.pine,x,.24,.68,.48,.47,.48);
    for(const y of [.47,2.82,2.94])face.part('cyl',p.brass,x,y,.68,.45,.052,.45);
  }
  // Rounded marquee with a burgundy fascia and individual incandescent bulbs.
  face.round('#4d6559',-.6,3.36,.48,20.5,.46,2.02);
  face.round(p.trim,-.6,3.53,.5,20.65,.16,2.1);
  face.round('#773d38',-.6,3.33,1.42,20.5,.23,.22);
  for(let x=-10.4;x<9.55;x+=.365)face.part('ball','#fff',x,3.32,1.535,.074,.074,.047,[0,0,0],kit.bulb);
  // Hand-lettered enamel fascia is attached to the facade, with a stepped brass surround.
  face.round('#5f4435',-.8,4.41,.13,8.4,1.54,.27);
  face.round(p.brass,-.8,4.41,.25,8.26,1.47,.20);
  face.sign('C I N E M A','చిత్రశాల    •    35 MM',-.8,4.42,.38,8.02,1.33,'#ecdbaf','#764335');
  face.sign('SCREEN  1','ప్రవేశం',4,2.69,.29,2.80,.43,'#384f46','#f7dea3');
  const hoardings = [-9.7,-8.36,7.64,8.93].map((x,id)=>{
    const original=(kit.poster(id) as T.MeshBasicMaterial).map!;
    const material=new T.MeshBasicMaterial({map:original});kit.materials.set('road-hoarding-'+id,material);
    frame(face,x,1.88,.093,1.14,1.72,material);return {material,original};
  });
  // Fluted fanlights, louvres, stepped wings and a balcony rail break up the broad plaster wall.
  for(const x of [-5.95,4.77,7.8]){
    face.round('#627c69',x,4.41,.015,1.44,.78,.11);
    for(let j=0;j<6;j++)face.box('#b1bc94',x,4.11+j*.118,.116,1.35,.044,.11);
  }
  for(const side of [-1,1])for(let j=0;j<3;j++)face.round(p.brass,-.90+side*(1.23+j*.18),5.82-j*.11,.10,1.36+j*.21,.062,.10);
  face.part('cyl','#9f794d',-.9,5.89,.14,.84,.12,.84,[Math.PI/2,0,0]);
  face.part('ring','#e9c994',-.9,5.89,.223,.76,.76,.46);
  for(let j=0;j<5;j++)face.orb('#575e4e',-.9+Math.cos(j*1.257)*.21,5.89+Math.sin(j*1.257)*.21,.255,.15,.15,.035);
  for(const x of [1.28,1.89]){
    face.round(p.pine,x,1.94,.092,.47,1.23,.12);
    for(let j=0;j<7;j++)face.box('#92ab90',x,1.45+j*.16,.171,.47,.056,.09);
  }
  for(const x of [-7.08,.44,6.05])sconce(face,x,2.46,.16);
  // Ticket cage: ribbed wood, semicircular voice grille, brass ledge, paper ticket rolls.
  face.round('#684d39',-3.25,.56,.5,3.35,1.11,.99);face.round('#a66e4a',-3.25,.63,1.01,3.16,.89,.07);
  for(let i=0;i<29;i++)face.box('#80573e',-4.75+i*.107,.60,1.051,.027,.78,.03);
  face.round(p.trim,-3.25,1.12,.53,3.53,.15,1.17);face.box(p.pine,-3.25,1.91,.196,2.88,1.48,.14);
  face.box('#677e6b',-3.25,1.92,.30,2.69,1.29,.095);
  face.box('#394e46',-3.25,1.92,.352,2.63,1.24,.018);
  face.orb('#c19267',-3.65,1.90,.381,.28,.34,.045);face.orb('#443f33',-3.66,2.025,.387,.31,.16,.047);
  face.orb('#b49a74',-3.65,1.56,.389,.61,.48,.041);face.round('#ddd1a5',-2.60,1.64,.39,.43,.24,.02);
  for(let i=-6;i<=6;i++){const x=-3.25+i*.2;face.rod(p.brass,[x,1.35,.433],[x,2.53,.433],.015);}
  for(let i=0;i<3;i++)face.rod(p.brass,[-4.61,1.44+i*.44,.431],[-1.89,1.44+i*.44,.431],.016);
  face.part('ring','#dfbe7f',-3.25,1.73,.457,.49,.49,.44);face.sign('Tickets','టికెట్లు',-3.25,2.74,.53,2.55,.49,'#6f3833','#ffe3ac');
  for(let i=0;i<4;i++)face.part('round',i%2?'#e8bb7e':'#eddac0',-3.25+i*.035,1.213+i*.009,1.01,.32,.016,.149,[0,.19,0]);
  face.sign('Show calendar','RELEASE DATES',-6.2,2.21,.14,1.37,.41);
  frame(face,-6.2,1.46,.14,1.10,.92,kit.plaque('CALENDAR','Upcoming Telugu releases','#e4cf9a','#615644',1.2));
  // A vertical blade sign, typical of old single-screen streetfronts.
  face.round(p.brass,-7.1,4.52,1.76,.95,4.12,.41);face.round(p.ox,-7.1,4.52,1.95,.81,3.99,.21);
  face.rod('#605643',[-7.1,5.8,.08],[-7.1,5.8,1.69],.05);
  'CINEMA'.split('').forEach((char,i)=>face.panel(kit.plaque(char,'',p.ox,'#f9daab',1),-7.1,6.08-i*.62,2.066,.52,.54));
  for(const pos of queuePosts){
    street.part('cyl',p.brass,pos.x,.075,pos.z,.34,.09,.34);street.rod(p.brass,[pos.x,.09,pos.z],[pos.x,.91,pos.z],.038);street.orb(p.brass,pos.x,.94,pos.z,.14,.14,.14);
  }
  for(const x of [-5,-1.65])for(let i=0;i<8;i++){const j=i+1;street.rod(p.ox,[x,.87-Math.sin(i/8*Math.PI)*.16,1.65+i/8*1.35],[x,.87-Math.sin(j/8*Math.PI)*.16,1.65+j/8*1.35],.022);}
  scooter(street,-8,2.05,'#a8b6a1');scooter(street,-10.2,3.3,'#a8664e');
  palm(street,8.7,3.2,1.65);tree(street,-10.6,6.15,1.52,51);tree(rear,11,-7.8,1.56,93);tree(rear,-15,-6,2.15,93);
  const r=random(29);for(let i=0;i<30;i++){const x=-51+i*2.85,h=1+r()*3.5;
    rear.box(i%2?'#a79b89':'#b5ac93',x,h/2,-18-r()*9,2.6+r()*2,h,3.5);
    if(i%4===0)rear.part('cyl','#8b8275',x,h+.46,-21,1,.95,1);
  }
  for(const x of [-12,10.4]){rear.rod('#736751',[x,0,1.8],[x,6.6,1.8],.07);rear.box('#77694c',x,6.38,1.8,1.1,.07,.11);}
  for(let i=0;i<34;i++){
    const xb=-11.99+i*.657, xc=xb+.657, y=(x:number)=>6.23-.97*Math.sin((x+12)/22.35*Math.PI);
    rear.rod('#5a5544',[xb,y(xb),1.81],[xc,y(xc),1.81],.012);
    if(i%2===0){rear.rod('#645c47',[xb,y(xb),1.81],[xb,y(xb)-.1,1.81],.013);rear.part('ball','#fff',xb,y(xb)-.14,1.81,.074,.101,.074,[0,0,0],kit.bulb);}
  }
  const glass=new T.MeshPhongMaterial({color:'#c2d9bf',transparent:true,opacity:.25,shininess:28,depthWrite:false});
  kit.materials.set('foyer-door-glass',glass);
  const doors=[-1,1].map(side=>{
    const d=new SetBuilder(kit),w=entrance.width/2;
    for(const edge of [-1,1])d.box('#815d40',edge*(w/2-.065),1.53,0,.105,3.04,.12);
    d.box('#815d40',0,.59,0,w-.03,1.16,.12);d.box('#815d40',0,2.95,0,w-.03,.19,.12);
    d.box('#d4d9bb',0,2.01,.026,w-.18,1.72,.033,glass);
    d.box('#41675d',0,.64,.069,w-.19,.94,.03);d.box(p.trim,0,1.15,.087,w-.13,.06,.035);
    d.rod(p.brass,[-side*.46,1.1,.133],[-side*.46,1.61,.133],.024);
    const group=d.finish();group.position.set(entrance.x+side*w/2,0,0);return group;
  });
  const extras=patrons.map((v,i)=>{const rig=makeVisitor(kit,i?'#c99f66':'#597b77',i?'#585d52':'#615d55',false);rig.group.position.set(v.x,0,v.z);rig.group.scale.setScalar(i?.93:1.02);rig.group.rotation.y=i?2.92:-2.9;rig.animate(.1,0,false,i,true);return rig;});
  let amount=0;const doorBlocks:Rect[]=[];
  function doorUpdate(x:number,z:number,dt:number){
    amount=T.MathUtils.damp(amount,Math.abs(x-4)<2.75 && Math.abs(z)<2.85?1:0,6,dt);
    doorBlocks.length=0;doors.forEach((g,i)=>{g.position.x=4+(i?1:-1)*(.70+amount*1.39);doorBlocks.push(solid(g.position.x,0,1.37,.13));});
    return doorBlocks;
  }
  return {street:street.finish(),facade:face.finish(),backdrop:rear.finish(),doors,extras,doorUpdate,hoardings};
}

