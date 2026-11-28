import { describe, expect, it } from 'vitest';
import { PASSAGES, arrivalLine, corridorOpen, delegations, routeOrder } from '../src/domain/corridor';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

describe('the ribbon of doors', () => {
  it.each([[8,3,7,10,9,11,14,12,13,5,6,4], [4,5,6,9,10,11,13,14,12,3,7,8]])('remembers a branching route from %s', (...order: number[]) => {
    const d = new Driver();
    for (const n of [1,2,...order,15]) {
      const p = PASSAGES[n-1];
      if (n === 2) d.s.flags['study.letter'] = true;
      expect(corridorOpen(d.s,n),p.name).toBe(true);
      if (n>2) {
        const door = MAPS['nexus.archive'].interactables.find(it=>it.to?.map===p.hall && it.flag===p.arrived)!;
        expect(check(door.visibleIf,d.s),p.name).toBe(true);
      }
      d.s.mapId=p.hall;
      d.run({type:'VisitPlace',name:p.name});
      if (n>2 && n<=8) expect(arrivalLine(n,d.s)).toContain(PASSAGES[routeOrder(d.s).at(-2)!-1].name);
      if (n>2) expect(d.e.activeMissions(d.s).some(m=>m.id==='KG-CH'+n+'-M01') || n===3).toBe(true);
      d.s.objectivesDone.push(p.finish);
      d.s.mapId='nexus.archive';
      d.run({type:'VisitPlace',name:'Nexus'});
      if (routeOrder(d.s).length<14) expect(corridorOpen(d.s,15)).toBe(false);
    }
    expect(routeOrder(d.s)).toEqual([1,2,...order,15]);
    expect(delegations(d.s).map(p=>p.hall)).toEqual([order[0],order.at(-1)!].map(n=>PASSAGES[n-1].hall));
  });
  it('keeps Water shut after a single Act III finish and the Council shut for each missing finish',()=>{
    const d=new Driver();d.s.objectivesDone.push('market.finish');expect(corridorOpen(d.s,11)).toBe(false);
    for(const missing of PASSAGES.slice(0,14)){
      d.s.objectivesDone=PASSAGES.slice(0,14).filter(p=>p!==missing).map(p=>p.finish);
      expect(corridorOpen(d.s,15),missing.name).toBe(false);
    }
  });
  it('opens twelve distinct visits with the six keepsakes and records each shown proof once',()=>{
    const d=new Driver();
    const talks=d.e.pack.keepsakeTalks!.filter(t=>t.id.startsWith('corridor.'));
    expect(talks.length).toBe(12);
    for (const t of talks) {
      const k=d.e.pack.keepsakes!.find(k=>k.id===t.keepsake)!;
      expect('objective' in k.if).toBe(true);
      if ('objective' in k.if) d.s.objectivesDone.push(k.if.objective);
      d.run({type:'VisitPlace',name:'Archive'});
      const c=d.e.pack.characters.find(c=>c.id===t.character)!;
      const entry=c.talk.map(x=>x.node).find(n=>d.e.keepsakeOptions(n,d.s).some(o=>o.option.next===t.node));
      expect(entry,t.id).toBeTruthy();
      const choice=d.e.keepsakeOptions(entry!,d.s).find(o=>o.option.next===t.node)!;
      expect(d.run({type:'ChooseDialogueOption',node:entry!,index:choice.index}).nextNode).toBe(t.node);
      expect(d.e.keepsakeOptions(entry!,d.s).some(o=>o.option.next===t.node)).toBe(false);
    }
  });
});
