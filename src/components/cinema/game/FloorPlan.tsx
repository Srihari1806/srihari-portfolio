import { rooms, zoneNames, type Zone } from './plan';
import type { Snapshot } from './engine';
const indices:Zone[]=['outside','corridor','screen','interval','memory','booth'];
const centers=[[-3,4],[15,-2],[33,-4],[48,-1.5],[61,-1.5],[57,-9]];
export function FloorPlan({state}:{state:Snapshot}){
  const found=state.discovered.includes('booth');
  const visible=found?indices:indices.slice(0,5);
  return <figure className="cg-map"><svg viewBox="-13.5 -13 87 25" role="img" aria-label={'Theatre plan. You are in '+zoneNames[state.zone]+'.'}>
    {rooms.filter(r=>found||r.zone!=='booth').map(({bounds:r,zone},i)=><rect key={i} x={r.x0} y={r.z0} width={r.x1-r.x0} height={r.z1-r.z0} stroke="#665e47" strokeWidth=".30" fill={state.discovered.includes(zone)?'#b4c5aa':'#e7ddc1'}/>)}
    {[24,42,53,65].map(x=><line key={x} x1={x} x2={x} y1={-2} y2={.5} stroke="#f9efce" strokeWidth=".92"/>)}
    <path d="M 2.6 0 H 5.4 M 10 -5.8 V -.3" stroke="#d2d3af" strokeWidth=".6" fill="none"/>
    {found&&<path d="M55.72 -6h1.8" stroke="#d2d3af" strokeWidth=".72"/>}
    {visible.map((k,i)=><text key={k} x={centers[i][0]} y={centers[i][1]+.8} textAnchor="middle" fontSize="2.9" fill="#36493c">{i+1}</text>)}
    <g transform={'translate('+state.position.x+' '+state.position.z+') rotate('+(-state.heading*180/Math.PI)+')'}><circle r="1.28" fill="#843e30" stroke="#fff3cb" strokeWidth=".25"/><path d="M0 2.0L-.71 .56H.71Z" fill="#843e30"/></g>
  </svg><figcaption><strong>You are in {zoneNames[state.zone]}.</strong><ol>{visible.map(k=><li key={k}>{zoneNames[k]} <small>{state.discovered.includes(k)?'Visited':'Unexplored'}</small></li>)}</ol></figcaption></figure>;
}

