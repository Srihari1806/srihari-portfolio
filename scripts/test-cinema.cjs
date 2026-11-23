// Run with node --test scripts/test-cinema.cjs. Exercise the same movement model as the WebGL scene.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText,file);
const {WalkerController}=require('../src/components/cinema/game/controller.ts');
const {route,routePoint,totalLength,distance,walkable,pathTo,hotspots,chair,point,move,blocks}=require('../src/components/cinema/game/plan.ts');

test('the entire tour can be walked forwards and backwards',()=>{
  const visitor=new WalkerController();
  for(const target of [totalLength,0]){
    visitor.guide(target===0?-999:999);
    for(let i=0;i<6000&&Math.abs(visitor.progress-target)>.001;i++){
      visitor.tick(1/60,0,[]);assert.ok(walkable(visitor.position));
    }
    assert.ok(distance(visitor.position,routePoint(target))<.01,'guided progress '+visitor.progress+' of '+target);
  }
  assert.equal(visitor.discovered.size,5);assert.ok(!visitor.discovered.has('booth'));
});
test('walls, props, chair rows and the outside boundary block a continuous sweep',()=>{
  for(const [start,dx,dz] of [[point(-3.2,2),0,-4],[point(23.4,1.6),2,0],[point(34.75,-.6),0,3],[point(-11,7),-3,0]]){
    const end={...start};move(end,dx,dz);assert.ok(walkable(end));assert.ok(distance(end,start)<Math.hypot(dx,dz)-.15);
  }
  assert.ok(blocks.length>60);
});
test('manual movement wins over the wheel and can rejoin from the projection booth',()=>{
  const visitor=new WalkerController();visitor.guide(8);visitor.keys.add('KeyD');visitor.tick(.016,0,[]);
  const saved=visitor.target;visitor.guide(9);assert.equal(visitor.target,saved);assert.equal(visitor.manual,true);
  visitor.release();visitor.position=point(55.4,-10.2);visitor.tick(.016,0,[]);assert.ok(visitor.discovered.has('booth'));
  const from={...visitor.position};visitor.guide(2);assert.ok(distance(from,visitor.position)<.001);assert.ok(!visitor.manual);
  for(let i=0;i<2200;i++){const prior={...visitor.position};visitor.tick(1/60,0,[]);assert.ok(distance(prior,visitor.position)<.08);assert.ok(walkable(visitor.position));}
  assert.ok(distance(visitor.position,routePoint(visitor.target))<.03);
});
test('every exhibit is reachable, with a collision-free aisle when standing up',()=>{
  for(const h of hotspots){assert.ok(walkable(h.at),h.id);assert.ok(pathTo(route[0],h.at),h.id);}
  const visitor=new WalkerController();visitor.position=point(chair.x,chair.z-.88);visitor.sit();assert.equal(visitor.seated,true);visitor.stand();assert.ok(walkable(visitor.position));
});

