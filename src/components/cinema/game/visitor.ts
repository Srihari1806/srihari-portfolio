import * as T from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Vec, Workshop } from './model';
import { random } from './art';

// One skinned draw call. Sleeves, clothing, face and glasses share the same articulated skeleton.
export function makeVisitor(kit:Workshop, shirt='#b74038', trousers='#26394b', bag=true) {
  const group=new T.Group(), bones:T.Bone[]=[], parts:T.BufferGeometry[]=[];
  function joint(name:string,parent:T.Object3D,position:Vec){
    const b=new T.Bone();b.name=name;b.position.set(...position);parent.add(b);bones.push(b);return b;
  }
  const hip=joint('pelvis',group,[0,.865,0]), chest=joint('spine',hip,[0,.09,0]), head=joint('head',chest,[0,.485,0]);
  const legs=[-1,1].map((s,i)=>{const thigh=joint('hip'+i,hip,[s*.118,-.02,0]),shin=joint('knee'+i,thigh,[0,-.37,0]),foot=joint('ankle'+i,shin,[0,-.365,0]);return {s,thigh,shin,foot};});
  const arms=[-1,1].map((s,i)=>{const arm=joint('shoulder'+i,chest,[s*.245,.365,0]),elbow=joint('elbow'+i,arm,[s*.035,-.253,0]);return {s,arm,elbow};});
  group.updateMatrixWorld(true);
  function piece(b:T.Bone,shape:string,color:string,pos:Vec,scale:Vec,rotation:Vec=[0,0,0]){
    const primitive=kit.geometries.get(shape)!;
    const g=primitive.index?primitive.toNonIndexed():primitive.clone();g.deleteAttribute('uv');
    const matrix=new T.Matrix4().compose(new T.Vector3(...pos),new T.Quaternion().setFromEuler(new T.Euler(...rotation)),new T.Vector3(...scale));
    g.applyMatrix4(matrix.premultiply(b.matrixWorld));const n=g.attributes.position.count, c=new T.Color(color);
    const colors=new Float32Array(n*3),indices=new Uint16Array(n*4),weights=new Float32Array(n*4);
    const bi=bones.indexOf(b);for(let i=0;i<n;i++){colors.set([c.r,c.g,c.b],i*3);indices[i*4]=bi;weights[i*4]=1;}
    g.setAttribute('color',new T.BufferAttribute(colors,3));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));parts.push(g);
  }
  const skin='#ae7150',skinLight='#be825b',hair='#25231f';
  piece(hip,'ball',trousers,[0,.01,0],[.445,.30,.35]);
  piece(chest,'vase',shirt,[0,.165,0],[.51,.45,.38]);
  piece(chest,'ball',shirt,[0,.33,0],[.542,.23,.365]);
  piece(chest,'cyl','#83382e',[0,-.045,0],[.385,.035,.31]);
  piece(chest,'cyl',skin,[0,.43,.008],[.18,.17,.17]);
  piece(chest,'cyl','#823b32',[0,.403,0],[.253,.034,.22]);
  piece(head,'ball',skin,[0,.15,.012],[.39,.463,.363]);
  piece(head,'ball',skinLight,[0,.105,.066],[.318,.285,.29]);
  for(const side of [-1,1]){
    piece(head,'ball',skin,[side*.191,.16,-.003],[.078,.13,.083]);
    piece(head,'ball','#563b31',[side*.081,.185,.177],[.025,.028,.018]);
    piece(head,'ring','#302d29',[side*.088,.194,.188],[.156,.127,.1]);
  }
  piece(head,'ball',skinLight,[0,.137,.191],[.078,.083,.091]);
  piece(head,'round','#824b3d',[0,.055,.183],[.071,.012,.012],[0,0,-.04]);
  piece(head,'box','#332c27',[0,.202,.198],[.06,.014,.016]);
  for(const s of [-1,1])piece(head,'box','#302f28',[s*.164,.205,.092],[.013,.015,.19]);
  piece(head,'ball',hair,[0,.282,-.034],[.432,.302,.397]);
  piece(head,'ball',hair,[0,.171,-.106],[.38,.243,.21]);
  const r=random(49);
  for(let i=0;i<21;i++){
    const a=i*2.4,rad=.10+r()*.086;
    piece(head,'ball',i%5===0?'#393127':hair,[Math.sin(a)*rad,.32+r()*.065,Math.cos(a)*rad-.014],[.13+r()*.071,.102+r()*.052,.143],[.25,a,.32]);
  }
  for(const s of [-1,1])piece(head,'ball',hair,[s*.172,.232,.07],[.078,.153,.106],[.26,0,-s*.16]);
  piece(head,'ball',hair,[-.077,.278,.135],[.224,.12,.13],[0,0,.32]);
  for(const {s,arm,elbow} of arms){
    piece(arm,'ball',skin,[s*.013,-.14,.002],[.116,.29,.126]);
    piece(arm,'vase',shirt,[s*.018,-.068,.006],[.17,.173,.164],[0,0,s*.14]);
    piece(elbow,'ball',skinLight,[0,-.108,.016],[.105,.254,.109]);
    piece(elbow,'ball',skinLight,[-s*.008,-.232,.026],[.109,.14,.103]);
    piece(elbow,'ball',skin,[-s*.048,-.218,.052],[.045,.078,.057]);
  }
  for(const {s,thigh,shin,foot} of legs){
    piece(thigh,'ball',skin,[0,-.238,0],[.154,.31,.16]);piece(thigh,'vase',trousers,[0,-.151,0],[.239,.315,.275]);
    piece(thigh,'cyl','#36495a',[0,-.299,0],[.19,.025,.218]);
    piece(shin,'ball',skinLight,[0,-.152,-.006],[.128,.331,.144]);
    piece(shin,'cyl','#efdfbb',[0,-.299,0],[.118,.11,.132]);
    piece(foot,'round','#e9dfc5',[0,-.041,.048],[.163,.142,.28]);piece(foot,'round','#b49e7e',[0,-.091,.051],[.174,.041,.293]);
    for(let j=0;j<3;j++)piece(foot,'round','#ffeed7',[0,.015,.071+j*.026],[.075,.013,.013],[0,s*.18,0]);
  }
  if(bag){
    piece(chest,'round','#ad8557',[0,.133,-.217],[.357,.41,.164],[-.08,0,0]);
    piece(chest,'round','#c49a68',[0,.253,-.30],[.35,.174,.083],[-.12,0,0]);
    piece(chest,'round','#aa7950',[0,.019,-.305],[.255,.109,.06]);
    for(const s of [-1,1]){
      piece(chest,'round','#dac095',[s*.164,.198,.144],[.045,.406,.041],[.02,0,s*.11]);
      piece(chest,'round','#bf986b',[s*.161,.355,0],[.058,.074,.348],[-.08,0,0]);
      piece(chest,'box','#6a513e',[s*.102,.18,-.346],[.039,.107,.013]);
      piece(chest,'box','#e2b66a',[s*.102,.174,-.355],[.047,.027,.01]);
    }
  }
  const geometry=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());
  const material=new T.MeshLambertMaterial({vertexColors:true});
  const mesh=new T.SkinnedMesh(geometry,material),skeleton=new T.Skeleton(bones);
  mesh.bind(skeleton);mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  let phase=0, gait=0,sit=0;
  function animate(dt:number,speed:number,seated:boolean,time:number,quiet=false) {
    gait=T.MathUtils.damp(gait,Math.min(1,speed/2.15),10,dt);sit=T.MathUtils.damp(sit,seated?1:0,11,dt);
    phase+=dt*(speed>3?11.7:7.6)*gait;
    hip.position.y=.865-.30*sit+(quiet?0:Math.sin(time*1.5)*.005*(1-gait))+Math.abs(Math.cos(phase))*.028*gait*(1-sit);
    chest.rotation.x=(speed>3?.105:.035)*gait+.065*sit; chest.rotation.y=Math.sin(phase)*.105*gait*(1-sit);
    head.rotation.y=-chest.rotation.y*.65+(quiet?0:Math.sin(time*.66)*.055*(1-gait));
    for(let i=0;i<2;i++){
      const f=Math.sin(phase+i*Math.PI),{thigh,shin,foot}=legs[i],{s,arm,elbow}=arms[i];
      thigh.rotation.x=-f*gait*(speed>3?.82:.55)*(1-sit)-1.5*sit;
      shin.rotation.x=Math.max(0,-f)*gait*(speed>3?1.11:.72)*(1-sit)+1.52*sit;
      foot.rotation.x=-shin.rotation.x*.37*(1-sit);arm.rotation.x=f*.55*gait*(1-sit)-.23*sit;
      arm.rotation.z=s*(.12+.03*gait);elbow.rotation.x=-.14-(speed>3?.72:.2)*gait-.65*sit;
    }
  }
  return {group,animate,dispose:()=>{geometry.dispose();material.dispose();skeleton.dispose();}};
}

