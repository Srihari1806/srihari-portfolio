// All coordinates are metres. Positive X leads through the theatre, positive Z faces the street.
export type Point = { x: number; z: number };
export type Rect = { x0: number; x1: number; z0: number; z1: number };
export type Zone = 'outside' | 'corridor' | 'screen' | 'interval' | 'memory' | 'booth';
export type Exhibit = 'ticket' | 'calendar' | 'diary' | 'favorites' | 'watchlist' | 'reviews' | 'screen' | 'seat' | 'snacks' | 'music' | 'notebook' | 'memories' | 'gate' | 'exit';
export const rect = (x0: number, x1: number, z0: number, z1: number): Rect => ({ x0, x1, z0, z1 });
export const point = (x: number, z: number): Point => ({ x, z });
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);
export const zoneNames: Record<Zone, string> = { outside: 'Ticket foyer', corridor: 'Poster corridor', screen: 'Screen 1', interval: 'Interval', memory: 'Memory wall', booth: 'Projection booth' };
export const rooms: { zone: Zone; bounds: Rect }[] = [
  { zone: 'outside', bounds: rect(-12, 10, 0, 9) }, { zone: 'corridor', bounds: rect(1, 10, -6, 0) },
  { zone: 'corridor', bounds: rect(10, 24, -6, 2.6) }, { zone: 'screen', bounds: rect(24, 42, -10.5, 4.5) },
  { zone: 'interval', bounds: rect(42, 53, -6, 3) }, { zone: 'memory', bounds: rect(53, 65, -6, 3) },
  { zone: 'booth', bounds: rect(54, 60, -11.5, -6) },
  { zone: 'memory', bounds: rect(65, 72, -3, 1.4) },
];
export function contains(r: Rect, p: Point) { return p.x >= r.x0 && p.x <= r.x1 && p.z >= r.z0 && p.z <= r.z1; }
export function zoneAt(p: Point): Zone { return rooms.find(r => contains(r.bounds, p))?.zone ?? 'outside'; }

export const entrance = { x: 4, z: 0, width: 2.8 };
export const exitGate = { x: 65, z: -.85, width: 3.0 };
export const chair = { x: 34.75, z: .92 };
export const seatColumns = [26.9, 27.85, 28.8, 29.75, 30.7, 31.65, 34.75, 35.7, 36.65, 37.6, 38.55, 39.5];
export const seatRows = [-4.65, -2.55, .92, 2.75];
export const benchXs = [13, 20.5];
export const columns = [-10.5, -.45, 6.6, 9.15];
export const queuePosts = [point(-5, 3), point(-5, 1.65), point(-1.65, 3), point(-1.65, 1.65)];
export const patrons = [point(-4.25, 1.65), point(-4.55, 2.6)];
export const solid = (x: number, z: number, w: number, d: number) => rect(x - w/2, x + w/2, z - d/2, z + d/2);
export const partitions: Rect[] = [
  rect(-12, 2.6, -.22, .22), rect(5.4, 10, -.22, .22),
  ...[24, 42, 53].flatMap(x => [rect(x-.15,x+.15,-10.5,-2.05),rect(x-.15,x+.15,.55,4.5)]),
  rect(53,55.7,-6.16,-5.84), rect(57.55,65,-6.16,-5.84),
  rect(64.85,65.15,-6,-2.35),rect(64.85,65.15,.65,3),
];
export const blocks: Rect[] = [
  ...partitions, solid(-3.25,.52,3.3,1.05), solid(-8,2.05,2.25,1), solid(-10.2,3.3,1.95,.95),
  ...columns.map(x=>solid(x,.68,.48,.53)), ...queuePosts.map(p=>solid(p.x,p.z,.16,.18)),
  solid(-5,2.325,.15,1.42), solid(-1.65,2.325,.15,1.42), ...patrons.map(p=>solid(p.x,p.z,.5,.4)),
  solid(-10.6,6.15,1.15,1.15), solid(8.7,3.2,.95,.95),
  ...benchXs.map(x=>solid(x,1.6,2.7,.72)), solid(17.9,1.63,.9,.85),
  ...seatRows.flatMap(z=>seatColumns.map(x=>solid(x,z,.86,.86))),
  solid(33,-9.35,14,1.5), solid(46.3,-4.75,6.35,1.55), solid(51.15,-4.45,1.75,2.2),
  solid(48.5,1.72,1.9,.72), solid(61,-4.88,4.1,1.15), solid(58.4,-9.9,1.65,1.45),
  ...[-2.55,-1.2,.15].map(z=>solid(71.73,z,.18,.18)),
];
export const hotspots: { id: Exhibit; label: string; at: Point; zone: Zone; reach: number }[] = [
  {id:'ticket',label:'Inspect a ticket',at:point(-3.2,1.47),zone:'outside',reach:2.05},
  {id:'calendar',label:'Read the release calendar',at:point(-6.55,.75),zone:'outside',reach:1.65},
  ...(['diary','favorites','watchlist','reviews'] as const).map((id,i)=>({id,label:['Inspect recent watches','Open favorite films','Open the watchlist','Read film reviews'][i],at:point(11.5+i*3.45,-5.52),zone:'corridor' as Zone,reach:2.15})),
  {id:'seat',label:'Take a seat',at:point(chair.x,chair.z-.88),zone:'screen',reach:1.85},
  {id:'screen',label:'Read the projection',at:point(33,-7.7),zone:'screen',reach:3.3},
  {id:'snacks',label:'At the interval counter',at:point(46,-3.45),zone:'interval',reach:2.2},
  {id:'music',label:'Listen at the record cabinet',at:point(51.05,-3),zone:'interval',reach:2.15},
  {id:'notebook',label:'Open the writing notebook',at:point(61,-3.75),zone:'memory',reach:2.45},
  {id:'memories',label:'Inspect the film reels',at:point(57,-8.9),zone:'booth',reach:2.25},
  {id:'gate',label:'Walk through the exit gate',at:point(64,-.92),zone:'memory',reach:1.85},
  {id:'exit',label:'Leave the theatre',at:point(70.5,-.85),zone:'memory',reach:1.8},
];

export const route = [
  point(-2.95,4.4), point(-3.15,1.79), point(-2.75,3.65), point(.1,3.8), point(4,2.2),
  point(4,-2.8), point(8.8,-3), point(11.5,-4.05), point(15,-4.1), point(18.4,-4.1), point(21.85,-4.05),
  point(23,-.8), point(25.2,-.8), point(33.1,-.8), point(33.1,-6.9), point(33.1,-.8), point(34.75,-.8),
  point(41,-.8), point(43.1,-.8), point(46,-2.95), point(51,-2.6), point(52.1,-.75),
  point(54,-.75), point(57.2,-3.2), point(61,-3.05), point(64,-.92), point(67.15,-.85), point(70.5,-.85)
];
export const tourStops = [1,7,10,14,16,19,20,24,25,27];
export const lengths = route.map((_,i)=> route.slice(1,i+1).reduce((sum,p,n)=>sum+distance(p,route[n]),0));
export const totalLength = lengths[lengths.length-1];
export function routePoint(s: number) {
  const i = lengths.findIndex(n=>n>s);
  if (i<1) return {...route[i===0?0:route.length-1]};
  const t=(s-lengths[i-1])/(lengths[i]-lengths[i-1]);
  return point(route[i-1].x+(route[i].x-route[i-1].x)*t,route[i-1].z+(route[i].z-route[i-1].z)*t);
}
// At a crossing, prefer the segment the visitor was following before taking manual control.
export function nearestRoute(p: Point, previous: number) {
  let best=0, score=Infinity;
  for(let i=1;i<route.length;i++){
    const a=route[i-1], b=route[i], len=lengths[i]-lengths[i-1];
    const t=Math.min(1,Math.max(0,((p.x-a.x)*(b.x-a.x)+(p.z-a.z)*(b.z-a.z))/(len*len)));
    const s=lengths[i-1]+t*len, cost=distance(p,routePoint(s))+Math.min(.08,Math.abs(s-previous)*.002);
    if(cost<score){ best=s; score=cost; }
  }
  return best;
}

const radius=.245;
export function walkable(p: Point, doors: Rect[] = []) {
  for (const [dx,dz] of [[-radius,0],[radius,0],[0,-radius],[0,radius],[-.174,-.174],[.174,-.174],[-.174,.174],[.174,.174]]) {
    if(!rooms.some(r=>contains(r.bounds,{x:p.x+dx,z:p.z+dz}))) return false;
  }
  return ![blocks,doors].some(group=>group.some(r=>{
    const dx=p.x-Math.max(r.x0,Math.min(r.x1,p.x)), dz=p.z-Math.max(r.z0,Math.min(r.z1,p.z));
    return dx*dx+dz*dz<radius*radius;
  }));
}
export function move(p: Point, dx: number, dz: number, doors: Rect[] = []) {
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.10));
  for(let n=0;n<steps;n++){
    if(walkable(point(p.x+dx/steps,p.z),doors)) p.x+=dx/steps;
    if(walkable(point(p.x,p.z+dz/steps),doors)) p.z+=dz/steps;
  }
}
function clearLine(a: Point,b: Point) {
  const n=Math.max(1,Math.ceil(distance(a,b)/.13));
  for(let i=1;i<=n;i++) if(!walkable(point(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n)))return false;
  return true;
}
// A short grid search is needed only when rejoining from the far side of a seat block or partition.
export function pathTo(a: Point,b: Point): Point[] | null {
  if(clearLine(a,b))return [b];
  const step=.46, key=(x:number,z:number)=>x+','+z;
  type Node={p:Point;g:number;f:number;prev?:Node;ix:number;iz:number};
  const root:Node={p:a,g:0,f:distance(a,b),ix:0,iz:0}, open=[root], costs=new Map([[key(0,0),0]]);
  const directions=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
  for(let count=0;open.length && count<7000;count++){
    let next=0;
    for(let i=1;i<open.length;i++) if(open[i].f<open[next].f) next=i;
    const current=open.splice(next,1)[0];
    if(current.g>(costs.get(key(current.ix,current.iz))??Infinity))continue;
    if(distance(current.p,b)<.85 && clearLine(current.p,b)){
      const path=[b]; let node:Node|undefined=current;
      while(node?.prev){path.unshift(node.p);node=node.prev;}
      return path;
    }
    for(const [x,z] of directions){
      const ix=current.ix+x, iz=current.iz+z, p=point(a.x+ix*step,a.z+iz*step);
      const g=current.g+Math.hypot(x,z)*step, id=key(ix,iz);
      if(g>=(costs.get(id)??Infinity) || !clearLine(current.p,p))continue;
      costs.set(id,g);open.push({p,g,f:g+distance(p,b),prev:current,ix,iz});
    }
  }
  return null;
}

