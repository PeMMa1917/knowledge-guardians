import {expect,it} from 'vitest';
import {newCampaign} from '../src/domain/engine';
import {apply,emptyOutputs} from '../src/domain/rules';
import {PASSAGES} from '../src/domain/corridor';
import {sagaRoute,sagaMove,sagaDecision,sagaTrail,sagaName,sagaAfterword,type SagaStage} from '../src/domain/corridorSagas';
import {MAPS} from '../src/maps';
import {Driver} from './driver';
import {migrateCampaign} from '../src/domain/saves';

const books=import.meta.glob<{default:SagaStage[]}>('../src/content/corridor-sagas/[0-9]*.json',{eager:true});
it('puts 48 local cases in each of the 15 halls, with a unique title and the planned 4–8 stops for every saga',()=>{
  const all=new Set<string>(),lengths=new Map<number,number>();
  for(const [i,p] of PASSAGES.entries()){
    expect(MAPS[p.hall].interactables.filter(a=>a.game==='travelling-cases')).toHaveLength(1);
    const rows=books['../src/content/corridor-sagas/'+(i+1)+'.json'].default;
    expect(new Set(rows.map(r=>r.saga)).size).toBe(48);
    for(const r of rows){expect(sagaRoute(r.saga)).toContain(i+1);expect(r.person && r.object && r.place).toBeTruthy();all.add(sagaName(r.saga));}
  }
  expect(all.size).toBe(120);
  for(let id=1;id<=120;id++){const count=sagaRoute(id).length;lengths.set(count,(lengths.get(count)??0)+1);}
  expect([...lengths.entries()].sort()).toEqual([[4,24],[5,24],[6,24],[7,24],[8,24]]);
});
it('plays every saga in forward and reverse order, rejecting shortcuts and preserving revisions on reload',()=>{
  const base=new Driver();
  for(let id=1;id<=120;id++)for(const order of [sagaRoute(id),[...sagaRoute(id)].reverse()]){
    let s=newCampaign(base.e.pack,'Fictional witness','player-a',42);
    const turn=(move:'inspect'|'settle',choice:0|1)=>{s=apply(sagaMove(s,{type:'SagaMove',saga:id,move,choice}).effects,s,emptyOutputs());};
    const outside=PASSAGES.find((_,i)=>!order.includes(i+1))!;
    s.mapId=outside.hall;expect(()=>turn('inspect',0)).toThrow();
    for(const n of order){
      s.mapId=PASSAGES[n-1].hall;expect(()=>turn('settle',0)).toThrow();
      turn('inspect',1);turn('inspect',0);turn('settle',0);turn('settle',1);
      expect(sagaDecision(s,id,n)).toBe(1);
    }
    s=migrateCampaign(JSON.parse(JSON.stringify(s))).state;
    expect(sagaTrail(s,id)).toEqual(order);expect(sagaAfterword(s,id)).toContain(PASSAGES[order[0]-1].delegate);
  }
});
it('records the player’s actual saga decisions in their adventure diary',()=>{
  const d=new Driver(),id=1;
  d.s.mapId=PASSAGES[sagaRoute(id)[0]-1].hall;
  d.run({type:'SagaMove',saga:id,move:'inspect',choice:0});
  d.run({type:'SagaMove',saga:id,move:'inspect',choice:1});
  d.run({type:'SagaMove',saga:id,move:'settle',choice:0});
  expect(sagaTrail(d.s,id)).toHaveLength(1);
});
