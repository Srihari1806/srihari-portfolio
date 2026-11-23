'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accessibility, Compass, Film, Footprints, Map as MapIcon, X } from 'lucide-react';
import type { Snapshot, TheatreEngine } from './engine';
import { route, totalLength, type Exhibit } from './plan';
import { FloorPlan } from './FloorPlan';
import { ExhibitBody } from './Exhibits';
import { useTheatreContent } from './useTheatreContent';
import './game.css';

type Panel=Exhibit|'map'|'index'|'controls';
const keys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'];
const initial:Snapshot={zone:'outside',seated:false,manual:false,discovered:['outside'],heading:0,position:route[0]};
const titles:Record<Panel,string>={ticket:'Your ticket',calendar:'Release calendar',diary:'Recent watches',favorites:'Favorite films',watchlist:'Watchlist',reviews:'Film reviews',screen:'On the screen',seat:'Screen 1',snacks:'Interval counter',music:'The record cabinet',notebook:'The writing notebook',memories:'The projection booth',gate:'Exit gate',exit:'Exit',map:'Theatre floor plan',index:'Browse the theatre',controls:'How to explore'};
export function CinemaGame({user}:{user:string}){
  const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<TheatreEngine|null>(null);
  const dialog=useRef<HTMLDialogElement>(null),dpad=useRef<HTMLDivElement>(null);
  const [state,setState]=useState(initial),[panel,setPanel]=useState<Panel|null>(null),[status,setStatus]=useState<'loading'|'ready'|'fallback'>('loading');
  const panelRef=useRef(panel);panelRef.current=panel;
  const [retry,setRetry]=useState(0);
  const content=useTheatreContent(user,panel);
  useEffect(()=>{if(status==='ready')engine.current?.setContent(content.frames);},[status,content.frames]);
  const show=useCallback((p:Panel|null)=>{if(p==='map'&&engine.current)setState(engine.current.snapshot());engine.current?.pause(Boolean(p));panelRef.current=p;setPanel(p);},[]);
  const interact=useCallback(()=>{const game=engine.current;if(!game)return;const target=game.player.near;if(!target)return;
    if(target.id==='seat'){game.player.sit();setState(game.snapshot());}
    else if(target.id==='gate'){game.player.guide(totalLength);}
    else show(target.id);
  },[show]);
  useEffect(()=>{
    let alive=true;const media=matchMedia('(prefers-reduced-motion: reduce)');
    const quiet=()=>engine.current?.quiet(media.matches);media.addEventListener('change',quiet);
    const fail=()=>{if(alive){setStatus('fallback');show('index');}};
    import('./engine').then(({openTheatre})=>{
      if(!alive||!canvas.current)return;
      engine.current=openTheatre(canvas.current,{state:setState,failed:fail},media.matches);
      engine.current.pause(Boolean(panelRef.current));setStatus('ready');
    }).catch(fail);
    // leaving through the train window: stop drawing the theatre so the train can load quickly
    const leaving=(e:Event)=>{if((e as CustomEvent<{type:string}>).detail?.type==='leaving')engine.current?.pause(true);};
    window.addEventListener('srihari:portal',leaving);
    return ()=>{alive=false;window.removeEventListener('srihari:portal',leaving);media.removeEventListener('change',quiet);engine.current?.dispose();engine.current=null;};
  },[retry,show]);
  useEffect(()=>{
    if(panel){if(!dialog.current?.open)dialog.current?.showModal();}
    else {dialog.current?.close();}
  },[panel]);
  useEffect(()=>{
    const keydown=(e:KeyboardEvent)=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      if(panelRef.current){if(e.key==='Escape'||(e.code==='KeyM'&&panelRef.current==='map')){e.preventDefault();show(null);}return;}
      if((e.target as HTMLElement)?.closest('input,textarea,select'))return;
      if(keys.includes(e.code)){
        if((e.target as HTMLElement)?.closest('header') && e.code.startsWith('Arrow'))return;
        e.preventDefault();engine.current?.player.keys.add(e.code);return;
      }
      if(e.repeat)return;
      if(e.code==='KeyM'){e.preventDefault();show('map');}
      if(e.code==='KeyE'){e.preventDefault();interact();}
      if(e.code==='Escape'&&engine.current?.player.seated){e.preventDefault();engine.current.player.stand();setState(engine.current.snapshot());}
    };
    const keyup=(e:KeyboardEvent)=>engine.current?.player.keys.delete(e.code);
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
    const c=canvas.current;const wheel=(e:WheelEvent)=>{if(panelRef.current||e.ctrlKey)return;e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?c?.clientHeight??700:1;engine.current?.player.guide(Math.max(-9,Math.min(9,(e.deltaY||e.deltaX)*unit*.018)));};
    c?.addEventListener('wheel',wheel,{passive:false});
    return ()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);c?.removeEventListener('wheel',wheel);};
  },[show,interact]);
  const drag=useRef<{id:number;x:number;y:number;kind?:'look'|'walk'}|null>(null);
  const stick=(e:React.PointerEvent<HTMLDivElement>)=>{
    const el=e.currentTarget,r=el.getBoundingClientRect(),g=engine.current;if(!g)return;
    const x=(e.clientX-r.left-r.width/2)/(r.width*.37),z=(e.clientY-r.top-r.height/2)/(r.height*.37),len=Math.max(1,Math.hypot(x,z));
    g.player.stick={x:x/len,z:z/len};el.style.setProperty('--stick-x',String(x/len*20)+'px');el.style.setProperty('--stick-y',String(z/len*20)+'px');
  };
  const rest=()=>{if(engine.current)engine.current.player.stick={x:0,z:0};dpad.current?.style.setProperty('--stick-x','0px');dpad.current?.style.setProperty('--stick-y','0px');};
  return <section className="cg" aria-labelledby="cinema-heading">
    <h1 className="sr-only" id="cinema-heading">Srihari’s walkable cinema</h1>
    <header className="cg-header"><Link href="/" className="cg-brand" aria-label="Srihari, home"><Film aria-hidden="true" size={18}/>srihari<span>.</span></Link>
      <nav aria-label="Primary navigation">{[['Work','/work'],['Cinema','/cinema'],['Lab','/playground'],['Human','/#human']].map(([name,url])=><Link key={url} href={url} aria-current={name==='Cinema'?'page':undefined}>{name}</Link>)}</nav>
    </header>
    <div className="cg-stage">
      <canvas ref={canvas} aria-label="Walkable 3D theatre. Scroll for a guided visit, or use WASD to walk." tabIndex={0}
        onPointerDown={e=>{e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY};}}
        onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
          if(e.pointerType==='touch'&&!d.kind && Math.max(Math.abs(dx),Math.abs(dy))<3)return;
          d.kind??=e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)*1.4?'walk':'look';
          if(d.kind==='walk')engine.current?.player.guide(-dy*.045);else engine.current?.orbit(dx,dy);
          d.x=e.clientX;d.y=e.clientY;}} onLostPointerCapture={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>
      {status==='loading'&&<p className="cg-loading" role="status">Opening the theatre…</p>}
      {status==='fallback'&&<div className="cg-unavailable"><h2>Theatre directory</h2><p>3D rendering is unavailable in this browser. The exhibits are open below.</p><button onClick={()=>show('index')}>Browse exhibits</button><button onClick={()=>{setStatus('loading');setRetry(n=>n+1);}}>Try 3D again</button></div>}
      <div className="cg-bottom"><div className="cg-tools"><button onClick={()=>show('index')}><Accessibility size={16}/> Browse exhibits</button><button onClick={()=>show('map')} aria-label="Open theatre map" title="Theatre map (M)"><MapIcon size={17}/></button><button onClick={()=>show('controls')} aria-label="Exploration controls" title="Controls"><Compass size={17}/></button></div>
        {status==='ready'&&<div className="cg-direction"><span>Scroll to walk</span><i/> <span>WASD to explore</span><i/> <span>Drag to look</span></div>}
      </div>
      {status==='ready'&&<div className="cg-actions">{state.near&&<button className="cg-interact" onClick={interact}><kbd>E</kbd>{state.near.label}</button>}
        {state.seated&&<button onClick={()=>{engine.current?.player.stand();if(engine.current)setState(engine.current.snapshot());}}>Stand up</button>}</div>}
      {status==='ready'&&<div className="cg-touch"><div ref={dpad} className="cg-stick" aria-label="Touch joystick" role="group" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);stick(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))stick(e);}} onLostPointerCapture={rest} onPointerCancel={rest}><span/></div>
        <button aria-label="Walk to the next stop" onClick={()=>engine.current?.player.guide(0,true)}><Footprints size={19}/></button></div>}
    </div>
    <dialog ref={dialog} className="cg-dialog" aria-labelledby="cg-panel-title" onCancel={e=>{e.preventDefault();show(null);}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)show(null);}}}>
      {panel&&<><header><h2 id="cg-panel-title">{titles[panel]}</h2><button autoFocus onClick={()=>show(null)} aria-label="Close panel"><X size={20}/></button></header><div className="cg-dialog-body">
      {panel==='index'?(['ticket','calendar','diary','favorites','watchlist','reviews','screen','music','notebook','exit'] as const).map(id=><button className="cg-index-row" key={id} onClick={()=>show(id)}>{titles[id]}</button>):
       panel==='controls'?<p>Walk with WASD or the arrow keys. Hold Shift to run. Drag to look around. Scroll to join the guided walk, E to interact, M for the map and Esc to close. On touchscreens, use the joystick to walk or swipe up to follow the tour.</p>:
       panel==='map'?<FloorPlan state={state}/>:<ExhibitBody key={panel} id={panel} content={content} open={show}/>}
       {panel!=='index'&&panel!=='map'&&panel!=='controls'&&<button className="cg-index-back" onClick={()=>show('index')}>All exhibits</button>}
      </div></>}
    </dialog>
  </section>;
}

