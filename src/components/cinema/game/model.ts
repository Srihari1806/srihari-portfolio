import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { paint, posterTexture, shadowTexture, signTexture, surface } from './art';
export type Vec = [number,number,number];
const identity:Vec=[0,0,0];

export class Workshop {
  readonly geometries=new Map<string,T.BufferGeometry>();
  readonly materials=new Map<string,T.Material>();
  readonly textures=new Set<T.Texture>();
  readonly plain=new T.MeshLambertMaterial({color:0xffffff});
  readonly bulb=new T.MeshBasicMaterial({color:'#ffdfa0'});
  constructor(){
    this.materials.set('paint',this.plain);this.materials.set('bulb',this.bulb);
    this.geometries.set('box',new T.BoxGeometry(1,1,1));
    this.geometries.set('round',new RoundedBoxGeometry(1,1,1,1,.13));
    this.geometries.set('ball',new T.SphereGeometry(.5,16,12));
    this.geometries.set('leaf',new T.IcosahedronGeometry(.5,1));
    this.geometries.set('cyl',new T.CylinderGeometry(.5,.5,1,20));
    this.geometries.set('vase',new T.CylinderGeometry(.49,.33,1,20));
    this.geometries.set('cone',new T.ConeGeometry(.5,1,18));
    this.geometries.set('ring',new T.TorusGeometry(.405,.095,8,32));
    this.geometries.set('quad',new T.PlaneGeometry(1,1));
  }
  tex(t:T.Texture){this.textures.add(t);return t;}
  image(key:string,make:()=>T.Texture,lit=false){
    if(!this.materials.has(key)){const opts={map:this.tex(make()),color:0xffffff};this.materials.set(key,lit?new T.MeshLambertMaterial(opts):new T.MeshBasicMaterial(opts));}
    return this.materials.get(key)!;
  }
  floorMat(kind:'terrazzo'|'carpet',w:number,d:number){
    const k=kind+'-'+w+'-'+d;
    return this.image(k,()=>{const t=surface(kind);t.repeat.set(w/(kind==='carpet'?1.7:2),d/(kind==='carpet'?1.7:2));return t;},true);
  }
  plaster(){return this.image('wall-paint',()=>surface('plaster'),true);}
  poster(i:number,label?:string){return this.image('print-'+i+(label??''),()=>posterTexture(i,label));}
  plaque(title:string,sub:string,bg:string,fg:string,ratio:number){return this.image([title,sub,bg,fg,ratio].join('|'),()=>signTexture(title,sub,bg,fg,ratio));}
  dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());}
}

type Batch={geo:T.BufferGeometry;mat:T.Material;items:{matrix:T.Matrix4;color:T.Color}[]};
// Static props share geometry and material, drawn once per recipe per room.
export class SetBuilder {
  private batches=new Map<string,Batch>();
  group=new T.Group();
  constructor(public kit:Workshop){}
  part(shape:string,color:string,x:number,y:number,z:number,w:number,h:number,d:number,rot:Vec=identity,mat=this.kit.plain as T.Material){
    const geo=this.kit.geometries.get(shape)!;const key=shape+mat.uuid;
    let batch=this.batches.get(key);if(!batch){batch={geo,mat,items:[]};this.batches.set(key,batch);}
    const matrix=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(...rot)),new T.Vector3(w,h,d));
    batch.items.push({matrix,color:new T.Color(color)});return this;
  }
  box(c:string,x:number,y:number,z:number,w:number,h:number,d:number,mat?:T.Material){return this.part('box',c,x,y,z,w,h,d,identity,mat);}
  round(c:string,x:number,y:number,z:number,w:number,h:number,d:number){return this.part('round',c,x,y,z,w,h,d);}
  orb(c:string,x:number,y:number,z:number,w:number,h:number,d:number){return this.part('ball',c,x,y,z,w,h,d);}
  rod(c:string,a:Vec,b:Vec,r:number){
    const v=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());
    const e=new T.Euler().setFromQuaternion(q);return this.part('cyl',c,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r*2,v.length(),r*2,[e.x,e.y,e.z]);
  }
  panel(mat:T.Material,x:number,y:number,z:number,w:number,h:number,yaw=0){return this.part('quad','#ffffff',x,y,z,w,h,1,[0,yaw,0],mat);}
  sign(title:string,sub:string,x:number,y:number,z:number,w:number,h:number,bg=paint.pine,fg=paint.trim){
    this.round(paint.brass,x,y,z-.047,w+.09,h+.09,.10);this.panel(this.kit.plaque(title,sub,bg,fg,w/h),x,y,z+.012,w,h);
  }
  shade(x:number,z:number,w:number,d:number){
    const k='contact'; if(!this.kit.materials.has(k))this.kit.materials.set(k,new T.MeshBasicMaterial({map:this.kit.tex(shadowTexture()),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}));
    this.part('quad','#fff',x,.031,z,w,d,1,[-Math.PI/2,0,0],this.kit.materials.get(k));
  }
  floor(x:number,z:number,w:number,d:number,color:string,kind:'terrazzo'|'carpet'='terrazzo',y=.008){
    this.part('quad',color,x,y,z,w,d,1,[-Math.PI/2,0,0],this.kit.floorMat(kind,w,d));
  }
  finish(){
    for(const {geo,mat,items} of Array.from(this.batches.values())){
      const mesh=new T.InstancedMesh(geo,mat,items.length);
      items.forEach((it,i)=>{mesh.setMatrixAt(i,it.matrix);mesh.setColorAt(i,it.color);});
      mesh.castShadow=!(mat instanceof T.MeshBasicMaterial)&&geo!==this.kit.geometries.get('quad');mesh.receiveShadow=true;
      mesh.computeBoundingSphere();this.group.add(mesh);
    }this.batches.clear();return this.group;
  }
}
export function frame(b:SetBuilder,x:number,y:number,z:number,w:number,h:number,mat:T.Material) {
  b.box('#453c31',x,y,z,w+.18,h+.19,.13);b.box(paint.brass,x,y,z+.07,w+.085,h+.085,.04);
  b.panel(mat,x,y,z+.10,w,h);
}

