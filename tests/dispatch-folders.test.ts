import { it, expect } from 'vitest';
import { dispatchFolder, travelFinding } from '../src/domain/dispatchFolders';
import { workAction, ticketKey, revision, type WorkOrder, type Ticket } from '../src/domain/worldWork';
import { apply, emptyOutputs } from '../src/domain/rules';
import { PASSAGES } from '../src/domain/corridor';
import { Driver } from './driver';
const shelves=import.meta.glob<{default:Ticket[]}>('../src/content/world-work/w*-g*.json',{eager:true});
const d=new Driver();

it('gives all 18,000 activity briefs two different ways of investigating and preserves their four story assignments',()=>{
  const cases=new Set<string>(),actions=new Set<string>(),turns=new Set<string>(),clocks=new Set<string>(),openings=new Set<number>();
  let count=0;
  for(let ch=1;ch<=15;ch++)for(let g=0;g<4;g++){
    const rows=shelves['../src/content/world-work/w'+ch+'-g'+g+'.json'].default;
    for(const ticket of rows){
      const o={chapter:ch,group:g,ticket},folder=dispatchFolder(o)!;
      if(!folder?.opening || !folder.clock || !folder.turn || /\{(?:object|place|keeper)\}/.test(folder.opening))throw Error(ticketKey(o));
      const [a,b]=folder.file.paths;
      if(a.action===b.action || a.finding===b.finding)throw Error(ticketKey(o));
      cases.add(folder.file.problem);actions.add(a.action);actions.add(b.action);
      clocks.add(folder.clock[0]);turns.add(folder.turn);openings.add(ticket[13]);count++;
    }
  }
  expect([count,openings.size,cases.size,actions.size,turns.size,clocks.size]).toEqual([18000,78,72,144,72,48]);
});

it('lets the Guardian investigate both paths and carry the selected finding through revised editions',()=>{
  const rows=shelves['../src/content/world-work/w1-g1.json'].default;
  const seen=new Set<number>();
  for(const ticket of rows.filter(t=>t[7].length)){
    if(seen.has(ticket[14]))continue;
    seen.add(ticket[14]);
    const o:WorkOrder={chapter:1,group:1,ticket},k=ticketKey(o),folder=dispatchFolder(o)!;
    let s={...d.s,mapId:PASSAGES[0].hall,flags:{...d.s.flags,[k+'.worked']:true}};
    const run=(action:Parameters<typeof workAction>[1]['action'],value:number)=>{
      const change=workAction(s,{type:'WorldWork',order:o,action,value});
      s=apply(change.effects,s,emptyOutputs());
      return change.text;
    };
    expect(()=>run('carry-trace',0)).toThrow();
    for(const i of [0,1]){
      s={...s,mapId:PASSAGES[0].hall};
      const old=revision(s,o),path=folder.file.paths[i];
      expect(run('inspect-trace',i)).toBe(path.finding);run('carry-trace',i);
      expect(travelFinding(s,o,k,true)).not.toBe(path.finding);
      run('issue',0);expect(revision(s,o)).toBe(old+1);
      run('issue',0);expect(revision(s,o)).toBe(old+1);
      s={...s,mapId:PASSAGES[ticket[7][0]-1].hall};expect(run('receive',0)).toContain(path.finding);
    }
  }
  expect(seen.size).toBeGreaterThan(40);
});
