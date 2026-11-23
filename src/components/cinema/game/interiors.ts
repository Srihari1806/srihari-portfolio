import * as T from 'three';
import { paint as p, canvasTexture, random } from './art';
import { Workshop, SetBuilder, frame } from './model';
import { chair, seatColumns, seatRows, benchXs, type Point, type Zone } from './plan';
import { sconce } from './street';

type Shell = { mesh:T.Group; axis:'x'|'z'; at:number; from:number; to:number };
export type PosterSlot = { material:T.MeshBasicMaterial; original:T.Texture };
type Interior = {zone:Zone; x0:number;x1:number; pieces:T.Group; shells:Shell[]; fans:T.Group[]};
const gold='#ba8950', felt='#823b48', mahogany='#694133', ivory='#e7cd9f';

function ceiling(b:SetBuilder,x:number,z:number,w:number,d:number,y:number){
  b.part('quad','#d3bf99',x,y,z,w,d,1,[Math.PI/2,0,0],b.kit.plaster());
  for(let xx=x-w/2+.5;xx<x+w/2;xx+=3.35) b.box('#a28f6e',xx,y-.06,z,.095,.13,d);
}
function makeFan(kit:Workshop,x:number,y:number,z:number){
  const b=new SetBuilder(kit);b.part('cyl','#66543e',0,.19,0,.046,.43,.046);
  b.orb('#806c4b',0,-.02,0,.26,.16,.26);
  for(let j=0;j<3;j++){const a=j*2*Math.PI/3;
    b.part('ball','#66583f',Math.sin(a)*.46,-.045,Math.cos(a)*.46,.235,.042,.94,[0,a,.03]);
  }
  const fan=b.finish();fan.position.set(x,y,z);return fan;
}
function bench(b:SetBuilder,x:number,z:number,w:number){
  for(let j=0;j<4;j++) b.round(j%2?'#ac794b':'#9a6442',x,.48,z-.24+j*.143,w,.088,.121);
  for(let j=0;j<3;j++) b.part('round',j===2?'#b88453':'#966245',x,.67+j*.13,z+.3,w,.104,.073,[-.1,0,0]);
  for(const side of [-1,1]){const a=x+side*(w/2-.24);
    b.rod(p.pine,[a,.05,z-.19],[a,.46,z-.16],.038);b.rod(p.pine,[a,.052,z+.25],[a,.98,z+.33],.04);
    b.rod(p.brass,[a,.69,z-.18],[a,.69,z+.31],.031);b.rod(p.pine,[a,.45,z-.17],[a,.69,z-.18],.026);
  } b.shade(x,z,w+.35,1.15);
}
function reel(b:SetBuilder,x:number,y:number,z:number,size:number){
  b.part('cyl','#9c805c',x,y,z,size,.08,size,[Math.PI/2,0,0]);b.part('ring','#dcc399',x,y,z+.045,size,size,.44);
  for(let i=0;i<5;i++){const a=i*2*Math.PI/5;b.orb('#483e32',x+Math.sin(a)*size*.255,y+Math.cos(a)*size*.255,z+.055,size*.218,size*.218,.035);}
  b.orb('#c9a674',x,y,z+.066,size*.115,size*.115,.05);
}
function projector(b:SetBuilder,x:number,y:number,z:number,s:number){
  b.round('#35433e',x,y+.25*s,z,.78*s,.49*s,.41*s);
  b.part('cyl','#6c766a',x+.44*s,y+.29*s,z,.29*s,.27*s,.29*s,[0,0,-Math.PI/2]);
  b.orb('#eed8a4',x+.57*s,y+.29*s,z,.03*s,.22*s,.22*s);
  reel(b,x-.24*s,y+.67*s,z,s*.50);reel(b,x+.17*s,y+.68*s,z,s*.46);
  for(const off of [-.2,.2])b.rod('#574d3d',[x+off*s,y+.1*s,z],[x+off*1.6*s,y-.25*s,z+.10*s],.034*s);
}
function wallFace(b:SetBuilder,x:number,z:number,w:number,h:number,tint:string,base:string){
  b.box(tint,x,h/2,z,w,h,.20,b.kit.plaster());b.box(base,x,.48,z+.11,w,.96,.081);
  b.box(ivory,x,.985,z+.17,w,.053,.064);b.box('#5c5847',x,.112,z+.16,w,.20,.08);
  b.box(ivory,x,h-.13,z+.1,w,.15,.18);b.box(gold,x,h-.27,z+.1,w,.047,.14);
}
// The camera can move outside a room. Only the wall between the lens and the player cuts away.
function divider(kit:Workshop,axis:'x'|'z',at:number,from:number,to:number,height:number,color:string,base:string,reverse=false):Shell{
  const b=new SetBuilder(kit),len=to-from;
  wallFace(b,0,0,len,height,color,base);
  const mesh=b.finish(),mid=(to+from)/2;
  mesh.position.set(axis==='x'?at:mid,0,axis==='z'?at:mid);
  mesh.rotation.y=(axis==='x'?Math.PI/2:0)+(reverse?Math.PI:0);
  return {mesh,axis,at,from,to};
}
function seat(b:SetBuilder,x:number,z:number,chosen:boolean){
  const velvet=chosen?'#a34d52':felt;
  b.round('#423b32',x,.16,z+.06,.40,.31,.28);b.round('#473632',x,.365,z,.72,.14,.66);
  b.round(velvet,x,.467,z-.061,.708,.181,.64);
  b.part('round','#63313b',x,.77,z+.265,.744,.779,.178,[-.11,0,0]);
  b.part('round',velvet,x,.779,z+.177,.678,.685,.17,[-.11,0,0]);
  for(const s of [-1,1]){b.round(mahogany,x+s*.385,.452,z,.068,.355,.43);
    b.round('#8e6444',x+s*.384,.632,z-.035,.096,.073,.55);
    b.box(gold,x+s*.383,.58,z-.24,.068,.03,.05);
  }
  for(let k=0;k<3;k++)b.orb('#713640',x-.17+k*.17,.91,z+.095,.033,.034,.018);
}
function curtain(b:SetBuilder,x:number,y:number,z:number,w:number,h:number,n:number){
  // A continuous folded velvet curtain with a scalloped hem.
  const shape='velvet-'+w+'-'+h;
  if(!b.kit.geometries.has(shape)){
    const geo=new T.PlaneGeometry(w,h,n*5,8),pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const u=pos.getX(i)/w+.5,v=pos.getY(i)/h+.5,a=u*n*Math.PI*2;
      pos.setXYZ(i,pos.getX(i),pos.getY(i)+(.5+.5*Math.cos(a))*.085*(1-v)**3,(.14+.10*v)*Math.cos(a));
    }geo.computeVertexNormals();b.kit.geometries.set(shape,geo);
  }b.part(shape,'#823c46',x,y,z,1,1,1);
}
function curtainsAndScreen(b:SetBuilder){
  b.box('#412c32',33,3.25,-10.4,18,6.5,.2);b.round('#49382e',33,.32,-9.45,14.04,.64,1.52);
  b.round(gold,33,.62,-8.76,14.04,.045,.07);b.box('#1e2828',33,3.2,-10.09,14.2,4.88,.20);
  b.box('#ae956b',33,3.23,-9.954,12.88,4.31,.075);
  curtain(b,25.85,3.02,-9.64,2.5,5.89,9);curtain(b,40.1,3.02,-9.64,2.5,5.89,9);
  curtain(b,33,5.91,-9.54,17.8,.97,38);
  for(let i=0;i<87;i++){const x=24.37+i*.20;b.rod(gold,[x,5.44,-9.46],[x,5.35+Math.cos(i*.6)*.038,-9.46],.016);}
}
export function projectionCard(title:string,credit:string){
  return canvasTexture(960,360,c=>{
    const g=c.createRadialGradient(500,177,6,500,180,550);g.addColorStop(0,'#fff3ce');g.addColorStop(.70,'#e5d1a9');g.addColorStop(1,'#b0a48c');
    c.fillStyle=g;c.fillRect(0,0,960,360);c.strokeStyle='#997d52';c.lineWidth=2;c.strokeRect(26,24,908,312);
    c.beginPath();c.moveTo(340,104);c.lineTo(440,104);c.moveTo(520,104);c.lineTo(620,104);c.stroke();
    c.beginPath();c.arc(480,103,22,0,Math.PI*2);c.stroke();c.fillStyle='#9a805a';
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.beginPath();c.arc(480+Math.cos(a)*12,103+Math.sin(a)*12,4.3,0,7);c.fill();}
    c.textAlign='center';c.fillStyle='#524e41';c.font='italic bold 63px Georgia';c.fillText(title,480,206,838);
    c.font='22px Georgia';c.fillStyle='#715d47';c.fillText(credit,480,255,823);
    const r=random(72);for(let i=0;i<2500;i++){c.fillStyle='rgba(78,56,39,.055)';c.fillRect(r()*960,r()*360,1,1);}
  });
}
function concessions(b:SetBuilder){
  const x=46.3,z=-4.75;
  b.round('#537e71',x,.57,z,6.37,1.13,1.53);b.round('#e1bd8b',x,1.15,z,6.48,.13,1.63);
  for(let j=0;j<35;j++)b.round('#759489',43.24+j*.18,.57,-3.97,.06,.93,.05);
  b.box(p.brass,x,.13,-3.93,6.37,.095,.055);
  b.sign('Interval','పాప్‌కార్న్   •   థిక్‌షేక్   •   సోడా',46.8,3.25,-5.76,5.8,.79,'#843e38','#f6deb0');
  ['Popcorn','Thickshakes','Soda'].forEach((title,i)=>b.sign(title,'',44+i*2.05,2.47,-5.72,1.67,.47,'#e3c49c','#643e35'));
  // Popcorn cabinet: clear front, metal corners, kettle, scooped kernels and striped paper tubs.
  b.round('#a5543f',44.24,1.31,-4.49,1.29,.24,.85);
  b.round('#ae5740',44.24,2.15,-4.49,1.36,.17,.90);
  for(const dx of [-.56,.56])for(const dz of [-.34,.34])b.rod(gold,[44.24+dx,1.4,-4.49+dz],[44.24+dx,2.11,-4.49+dz],.026);
  b.part('vase','#8b8c78',44.24,1.92,-4.57,.43,.24,.43);
  const r=random(341);for(let i=0;i<90;i++){
    const a=r()*6.28,rad=Math.sqrt(r());b.part('leaf',i%3?'#f0ca74':'#ffdf95',44.24+Math.cos(a)*rad*.48,1.45+(1-rad)*.19+r()*.055,-4.49+Math.sin(a)*rad*.27,.093,.087,.09);
  }
  for(let i=0;i<4;i++){
    const xx=45.15+i*.195;b.part('vase','#f0d8a6',xx,1.39,-4.25,.17,.32,.17);
    b.part('cyl','#b64d41',xx,1.39,-4.25,.151,.073,.151);
  }
  for(const xx of [46.12,46.62]){
    b.round('#678379',xx,1.29,-4.63,.365,.15,.44);b.rod(gold,[xx,1.31,-4.73],[xx,1.93,-4.73],.045);
    b.round('#768e7d',xx,1.92,-4.57,.293,.20,.36);b.rod('#b7b3a0',[xx,1.88,-4.47],[xx,1.49,-4.47],.019);
    b.part('vase','#b4b3a0',xx,1.51,-4.45,.226,.37,.226);
  }
  b.round('#496c66',48.4,1.64,-4.74,.88,.88,.63);b.box('#dfd2ae',48.4,1.71,-4.39,.75,.47,.06);
  for(let i=0;i<3;i++){b.round(['#a75544','#d7ae60','#6e917d'][i],48.16+i*.23,1.79,-4.34,.17,.21,.051);b.orb('#4e5148',48.16+i*.23,1.6,-4.30,.073,.075,.077);}
  // Record cabinet and turntable.
  b.round(mahogany,51.15,.69,-4.45,1.73,1.36,1.68);b.round('#ba895b',51.15,1.39,-4.45,1.81,.10,1.74);
  b.part('cyl','#35372f',50.95,1.463,-4.14,.81,.055,.81);b.part('cyl','#ce9f65',50.95,1.497,-4.14,.25,.023,.25);
  b.rod('#c4b399',[51.68,1.51,-4.46],[51.37,1.53,-4.03],.025);
  for(let i=0;i<15;i++)b.part('box',['#b5996d','#7b6a53','#798780','#a0604f'][i%4],50.52+i*.087,.86,-3.60,.053,.73,.066,[0,0,.05]);
  b.sign('Music corner','RECORDS',51.05,2.7,-5.71,2.28,.62);
  bench(b,48.5,1.72,1.91);
}
function notebook(b:SetBuilder,x:number,y:number,z:number){
  b.part('round','#544638',x,y,z,1.01,.08,.65,[0,-.17,0]);b.part('round','#eddbac',x,y+.058,z,.94,.065,.59,[0,-.17,.018]);
  for(let j=0;j<4;j++)b.part('box','#9d8f70',x-.19,y+.10,z-.16+j*.082,.31,.009,.006,[0,-.17,0]);
  b.part('box','#8e4138',x+.07,y+.10,z+.05,.022,.012,.51,[0,-.17,0]);b.rod('#72533c',[x+.31,y+.105,z-.19],[x+.47,y+.105,z+.12],.015);
}
function memories(b:SetBuilder){
  b.round('#916446',60.35,2.20,-5.73,5.04,2.35,.16);b.box('#bc8b60',60.35,2.2,-5.63,4.79,2.11,.065);
  const r=random(451);for(let j=0;j<9;j++){
    const x=58.42+(j%5)*.88+r()*.13,y=2.64-Math.floor(j/5)*.78+r()*.1,a=(r()-.5)*.23;
    b.part('box',j%3===0?'#d5a46e':'#f0d8a3',x,y,-5.565,.58,j%3===0?.28:.54,.017,[0,0,a]);
    for(let i=0;i<3;i++)b.part('box','#b09a74',x,y-.04+i*.055,-5.55,.33-i*.036,.009,.006,[0,0,a]);
    b.orb(j%2?'#893f36':'#675b44',x,y+.12,-5.54,.049,.052,.029);
  }
  b.round('#93664b',61,1.03,-4.88,4.14,.17,1.16);
  for(const s of [-1,1])for(const dz of [-.41,.41])b.box(mahogany,61+s*1.79,.52,-4.88+dz,.13,1.01,.13);
  notebook(b,60.9,1.19,-4.60);b.part('cyl','#9c7b4a',59.59,1.15,-4.87,.41,.065,.41);
  b.rod(gold,[59.59,1.18,-4.87],[59.69,1.72,-4.88],.033);b.part('cone','#688679',59.7,1.8,-4.81,.47,.25,.40);
  for(let i=0;i<4;i++)b.part('round',i%2?'#775a43':'#b39466',62.4,1.16+i*.065,-4.81,.75,.065,.48,[0,i*.047,0]);
}

export function createInteriors(kit:Workshop){
  const list:Interior[]=[],slots:PosterSlot[]=[];
  const make=(zone:Zone,x0:number,x1:number)=>{const b=new SetBuilder(kit),shells:Shell[]=[],fans:T.Group[]=[];return {b,shells,fans,done:()=>list.push({zone,x0,x1,pieces:b.finish(),shells,fans})};};
  const hall=make('corridor',1,24),h=hall.b;
  h.floor(5.5,-3,9,6,'#a5a78b');h.floor(17,-1.7,14,8.6,'#bcad91');
  h.box('#a55248',13,-.002,-.77,22,.043,1.16);for(const side of [-1,1])h.box(gold,13,.026,-.77+side*.54,22,.014,.033);
  ceiling(h,5.5,-3,9,6,4.18);ceiling(h,17,-1.7,14,8.6,4.18);
  hall.shells.push(divider(kit,'x',1,-6,0,4.23,p.mint,p.pine),divider(kit,'z',2.65,10,24,4.23,p.mint,p.pine,true),divider(kit,'x',10,0,2.65,4.23,p.mint,p.pine));
  const gallery=new SetBuilder(kit);
  wallFace(gallery,12.5,-6.04,23,4.2,'#90a999','#647b67');
  gallery.sign('Screen 1','ప్రదర్శనశాల',5.2,2.77,-5.86,3.95,.83);
  ['WATCHED','FAVORITES','WATCHLIST','REVIEWS'].forEach((name,i)=>{
    const x=11.5+i*3.45;
    const original=(kit.poster(i,name) as T.MeshBasicMaterial).map!;
    const mat=new T.MeshBasicMaterial({map:original});kit.materials.set('gallery-wall-'+i,mat);slots.push({material:mat,original});
    frame(gallery,x,2.28,-5.81,1.41,2.06,mat);
    gallery.sign(name,'',x,.99,-5.72,1.21,.23,'#665442','#efddae');
    sconce(gallery,x-1.61,2.59,-5.9);
  });
  const galleryGroup=gallery.finish();hall.shells.push({mesh:galleryGroup,axis:'z',at:-6.04,from:1,to:24});
  for(const x of benchXs)bench(h,x,1.6,2.7);
  h.round('#846e4f',17.9,.47,1.63,.9,.92,.85);projector(h,17.9,1.1,1.63,.75);
  for(const x of [6.9,14.2,20.8])hall.fans.push(makeFan(kit,x,3.96,-2.7));
  hall.done();

  const screen=make('screen',24,42),a=screen.b;
  a.floor(33,-3,18,15,'#825349','carpet');ceiling(a,33,-3,18,15,6.44);
  // The two side portals, cross aisle and central aisle stay clear at floor level.
  for(const xx of [24,42]){
    for(const [from,to] of [[-10.5,-2.05],[.55,4.5]])screen.shells.push(divider(kit,'x',xx,from,to,6.4,'#985c4f','#68453f',xx===42));
    a.box('#96604e',xx,4.84,-.75,.28,3.11,2.62);a.box(gold,xx,3.28,-.75,.31,.075,2.75);
  }
  screen.shells.push(divider(kit,'z',4.51,24,42,6.4,'#85574c','#65433c',true));
  const stage=new SetBuilder(kit);curtainsAndScreen(stage);const stageGroup=stage.finish();
  screen.shells.push({mesh:stageGroup,axis:'z',at:-10.5,from:24,to:42});
  const screenMat=new T.MeshBasicMaterial({map:kit.tex(projectionCard('Screen 1','Film writing · Srihari’s diary')),toneMapped:false});kit.materials.set('projected-slide',screenMat);
  const projection=new T.Mesh(kit.geometries.get('quad'),screenMat);projection.position.set(33,3.22,-9.902);projection.scale.set(12.64,4.08,1);stageGroup.add(projection);
  for(const z of seatRows)for(const x of seatColumns)seat(a,x,z,x===chair.x&&z===chair.z);
  for(const x of [32.58,33.75]){a.box('#c1985f',x,.027,-.86,.045,.021,10.4);
    for(let z=-5.8;z<4;z+=1.18)a.part('box','#ffda8d',x,.057,z,.066,.025,.13,[0,0,0],kit.bulb);
  }
  for(const x of [25,41])for(const z of [-7,-3,1,3.3]){
    a.box('#7a493e',x,1.6,z,.21,3.2,.41);a.part('vase','#ffdc98',x,2.52,z,.30,.43,.30,[0,0,0],kit.bulb);
  }
  const beamGeometry=new T.ConeGeometry(1,1,32,1,true);beamGeometry.translate(0,-.5,0);kit.geometries.set('projector-light',beamGeometry);
  const beamMaterial=new T.MeshBasicMaterial({color:'#f8d699',transparent:true,opacity:.035,blending:T.AdditiveBlending,side:T.DoubleSide,depthWrite:false});kit.materials.set('light-shaft',beamMaterial);
  const beam=new T.Mesh(beamGeometry,beamMaterial);beam.position.set(33,4.88,3.91);beam.scale.set(5.9,13.7,2.4);
  beam.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),new T.Vector3(0,-1.7,-13.6).normalize());a.group.add(beam);
  a.round('#4a443b',33,4.89,4.02,1.04,.48,.52);a.orb('#edd9a1',33,4.87,3.74,.24,.24,.08);
  screen.done();

  const snack=make('interval',42,53),s=snack.b;
  s.floor(47.5,-1.5,11,9,'#d1b598');ceiling(s,47.5,-1.5,11,9,4.3);
  const counterWall=new SetBuilder(kit);wallFace(counterWall,47.5,-6.07,11,4.3,'#bd9278','#637e70');
  snack.shells.push({mesh:counterWall.finish(),axis:'z',at:-6.1,from:42,to:53},divider(kit,'z',3.01,42,53,4.3,p.mint,p.pine,true));
  concessions(s);snack.fans.push(makeFan(kit,47.8,4.03,-1.7));snack.done();

  const memory=make('memory',53,65),m=memory.b;
  m.floor(59,-1.5,12,9,'#bfa990');ceiling(m,59,-1.5,12,9,4.1);
  for(const [from,to] of [[53,55.7],[57.55,65]])memory.shells.push(divider(kit,'z',-6,from,to,4.1,'#9cae97','#667c69'));
  for(const [from,to] of [[-6,-2.05],[.55,3]])memory.shells.push(divider(kit,'x',53,from,to,4.1,'#a6846b','#655e4e'));
  memory.shells.push(divider(kit,'z',3.01,53,65,4.1,p.mint,p.pine,true));
  for(const [from,to] of [[-6,-2.35],[.65,3]])memory.shells.push(divider(kit,'x',65,from,to,3.48,p.pale,p.pine,true));
  m.box('#8f9e86',56.62,3.47,-6,1.86,1.27,.20);m.box('#726451',56.61,2.83,-6,1.90,.08,.25);
  // An unobtrusive unmarked service opening beside the projection window.
  m.box('#4e5145',54.51,2.09,-5.82,1.72,1.04,.073);m.box('#6e7864',54.51,2.09,-5.77,1.57,.89,.046);
  for(const x of [54.10,54.86])m.box('#424d44',x,2.09,-5.736,.043,.91,.03);
  sconce(m,57.9,2.94,-5.79);sconce(m,63.25,2.93,-5.78);memories(m);memory.done();
  const booth=make('booth',54,60),b=booth.b;b.floor(57,-8.75,6,5.5,'#938a74');ceiling(b,57,-8.75,6,5.5,3.48);
  booth.shells.push(divider(kit,'z',-11.49,54,60,3.5,'#7d9987','#47675a'),divider(kit,'x',54,-11.5,-6,3.5,p.mint,p.pine),divider(kit,'x',60,-11.5,-6,3.5,p.mint,p.pine,true));
  b.round('#75553c',58.4,.59,-9.9,1.65,1.17,1.45);projector(b,58.38,1.45,-9.75,1.37);
  for(let i=0;i<4;i++)reel(b,54.79+i*.94,2.27,-11.25,.67-i*.026);
  b.box(p.wood,56.45,1.81,-11.20,4.28,.091,.38);sconce(b,58.99,2.57,-11.31);booth.done();
  const albumSlots:PosterSlot[]=[];
  [snack,memory].forEach((room,i)=>{
    const original=(kit.poster(i+2) as T.MeshBasicMaterial).map!;
    const material=new T.MeshBasicMaterial({map:original});kit.materials.set('sleeve-'+i,material);
    const prints=new SetBuilder(kit);
    if(i===0)frame(prints,51.05,1.91,-5.31,.83,.83,material);
    else frame(prints,62.12,2.37,-5.51,.73,.73,material);
    room.b.group.add(prints.finish());albumSlots.push({material,original});
  });
  const group=new T.Group();for(const room of list)group.add(room.pieces,...room.shells.map(w=>w.mesh),...room.fans);
  function view(pos:Point,cam:T.Vector3,dt:number,reduced:boolean){
    for(const room of list){const close=pos.x>room.x0-12 && pos.x<room.x1+12;
      room.pieces.visible=close;
      for(const fan of room.fans){fan.visible=close;if(close&&!reduced)fan.rotation.y+=dt*1.25;}
      for(const wall of room.shells){const cross=(pos[wall.axis]-wall.at)*(cam[wall.axis]-wall.at)<0;
        const other=wall.axis==='x'?'z':'x',t=(wall.at-pos[wall.axis])/(cam[wall.axis]-pos[wall.axis]||.001);
        const along=pos[other]+(cam[other]-pos[other])*t;
        wall.mesh.visible=close && !(cross && along>=wall.from-.6 && along<=wall.to+.6);
      }
    }
  }
  return {group,slots,albumSlots,screenMat,view};
}

