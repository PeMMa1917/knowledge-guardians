import { describe,expect,it } from 'vitest';
import { Driver } from './driver';
import { PASSAGES,corridorOpen } from '../src/domain/corridor';
import { TEMPLES,giftKey,templeMap,templeAction,leaders,allies,threadStanding,indexEndings } from '../src/domain/temples';
import { offeredScenes } from '../src/domain/factionScenes';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';

describe('the Quiet Hand, the travelling gifts and the Council',()=>{
  it.each(TEMPLES.map(t=>[t.chapter,t.temple] as const))('plays temple %i at %s through its physical stations', (n)=>{
    const d=new Driver(), t=TEMPLES[n-1], hub=MAPS[n===1?'aethelgard.undercroft':PASSAGES[n-1].hall];
    const door=hub.interactables.find(obj=>obj.id==='temple-door-'+n)!;
    expect(check(door.visibleIf,d.s)).toBe(false);
    d.s.objectivesDone.push(PASSAGES[n-1].finish);
    expect(check(door.visibleIf,d.s)).toBe(true);
    d.s.mapId=door.to!.map;
    const room=MAPS[d.s.mapId];
    expect(room.interactables.find(i=>i.id==='temple-exit')?.to?.map).toBe(hub.id);
    expect(room.npcs.map(a=>a.id)).toContain('temple.'+n+'.agent');
    d.run({type:'VisitPlace',name:t.temple});
    expect(()=>d.run({type:'TempleAction',action:'settle',choice:0})).toThrow();
    for(const action of ['second','first'] as const)d.run({type:'TempleAction',action});
    expect(()=>d.run({type:'TempleAction',action:'settle',choice:2})).toThrow();
    d.talk('temple.'+n+'.guardian',t.witnessOffer);
    for(const choice of [0,1,2])d.run({type:'TempleAction',action:'settle',choice});
    expect(d.s.flags[giftKey(n)]).toBe(true);
    d.s=migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.done('temple.'+n+'.kept')).toBe(true);
    if(leaders[n]) {
      d.run({type:'TempleAction',action:'ally'});
      expect(allies(d.s)).toContain(leaders[n].name);
    }
    d.s.mapId=n===14?'council.hall':templeMap(n+1);
    d.run({type:'TempleAction',action:'gift-view'});
    expect(d.s.flags['temple.away.'+n]).toBe(true);
  });
  it('gates the Council on every individual gift and gives five settlements',()=>{
    const d=new Driver();d.resumeAfter('island.finish');
    for(let n=1;n<=14;n++) {
      delete d.s.flags[giftKey(n)];expect(corridorOpen(d.s,15)).toBe(false);d.s.flags[giftKey(n)]=true;
    }
    expect(corridorOpen(d.s,15)).toBe(true);
    d.s.mapId='council.hall';
    expect(()=>d.run({type:'TempleAction',action:'index',choice:0})).toThrow();
    d.run({type:'TempleAction',action:'hear'});
    for(const [i,ending] of indexEndings.entries()){
      expect(templeAction(d.s,{type:'TempleAction',action:'index',choice:i}).text).toBe(ending.result);
      d.run({type:'TempleAction',action:'index',choice:i});
    }
    expect(d.s.flags['temple.index']).toBe(4);
  });
  it('uses actual saved decisions for trusted and wary readers and updates when revised',()=>{
    const d=new Driver();d.s.flags['market.response']='window';d.s.flags['coast.notice']='runner';
    expect(threadStanding(d.s)).toEqual([0,2,-2]);
    d.s.mapId='temple.4';expect(offeredScenes(d.s).map(e=>e.id)).toContain('circle-coast');
    d.s.mapId='nexus.archive';expect(offeredScenes(d.s).map(e=>e.id)).toContain('seal-challenge');
    d.s.flags['coast.notice']='signal';expect(threadStanding(d.s)).toEqual([0,0,0]);
    expect(offeredScenes(d.s)).toHaveLength(0);
  });
});
