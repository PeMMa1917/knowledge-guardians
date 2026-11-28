import {expect,it} from 'vitest';
import {PASSAGES,corridorOpen} from '../src/domain/corridor';
import {apply,emptyOutputs} from '../src/domain/rules';
import {sagaChapter} from '../src/domain/corridorSagas';
import {canIssue,disposition,isIssued,issued,needsPrediction,newLeads,reading,returnKey,revision,rivalVoice,ruleFor,ticketKey,workAction,type Ticket,type WorkOrder,type WorkCommand} from '../src/domain/worldWork';
import {methodId,shapeOf,workTool} from '../src/domain/workMethods';
import {workDiaryTopics,workTopicStamp} from '../src/domain/workTopics';
import {commandDiaryEvent} from '../src/domain/adventureEvents';
import {Driver} from './driver';
import {migrateCampaign} from '../src/domain/saves';
import type {CampaignState} from '../src/domain/types';
import forms from '../src/content/world-work/forms.json';
const shelves=import.meta.glob<{default:Ticket[]}>('../src/content/world-work/w*-g*.json',{eager:true});
const base=new Driver();
const rows=(n:number,g:number)=>shelves['../src/content/world-work/w'+n+'-g'+g+'.json'].default;
const at=(o:WorkOrder):CampaignState=>({...base.s,flags:{},mapId:PASSAGES[o.chapter-1].hall});

function perform(s:CampaignState,o:WorkOrder,action:WorkCommand['action'],value=0):CampaignState {
  return apply(workAction(s,{type:'WorldWork',order:o,action,value}).effects,s,emptyOutputs());
}
// Search the controls visible at each step. An inaccessible ferry, stuck fitting or missed cue fails this walk.
function rehearse(o:WorkOrder):CampaignState {
  const queue=[at(o)],seen=new Set<number>([0]),k=ticketKey(o);
  for(let i=0;i<queue.length;i++){
    const state=queue[i],tool=workTool(o,state);
    for(const j of tool.controls.keys()){
      const next=perform(state,o,'work',j);
      if(next.flags[k+'.worked'])return next;
      const pos=Number(next.flags[k+'.position']);
      if(!seen.has(pos)){queue.push(next);seen.add(pos);}
    }
  }
  throw Error('No completion for '+k);
}

it('plays every workbook order and every non-saga pattern through its visible instrument to a decision',()=>{
  let count=0,transfers=0;
  for(let chapter=1;chapter<=15;chapter++){
    const shapes=new Map<string,number>();
    for(let group=0;group<5;group++){
      const tickets=rows(chapter,group);
      expect(new Set(tickets.map(t=>t[0])).size).toBe([300,300,200,400,816][group]);
      for(const ticket of tickets){
        const o={chapter,group,ticket},shape=shapeOf(o);
        if(!forms[group][ticket[1]]||!ruleFor(o)||!ticket[3]||!ticket[4]||!ticket[5])throw Error(ticketKey(o));
        const topics=workDiaryTopics(workTopicStamp(o));if(!topics.concepts?.length||!topics.framework?.length)throw Error('Missing course link '+ticketKey(o));
        let s=rehearse(o);
        if(needsPrediction(o))s=perform(s,o,'predict',2);
        s=perform(s,o,'test',0);s=perform(s,o,'test',1);
        if(!canIssue(s,o))throw Error('No solution for '+ticketKey(o));
        s=perform(s,o,'issue',ticket[0]%2);
        if(ticket[10]){
          if(!rivalVoice(o))throw Error('Missing rival '+ticket[10]);
          s=perform(s,o,'hear');s=perform(s,o,'issue',2);
        }
        for(const destination of ticket[7]){
          const away=perform({...s,mapId:PASSAGES[destination-1].hall},o,'receive');
          if(away.flags[returnKey(o,destination)]!==revision(s,o))throw Error('Lost a receipt');
        }
        if(ticket[7].length)transfers++;
        shapes.set(shape,(shapes.get(shape)??0)+1);count++;
      }
    }
    expect(shapes.size).toBe(8);expect(Math.max(...shapes.values())/2016).toBeLessThan(0.4);
  }
  expect(count).toBe(30240);expect(transfers).toBe(6060);
},120000);

it('preserves a revised order in a second world and protects unfinished work, forecasts, rivals and gifts',()=>{
  const ticket=rows(1,3).find(t=>t[7].length && t[8]>=3)!,o={chapter:1,group:3,ticket},k=ticketKey(o);
  let s=at(o);
  expect(()=>perform(s,o,'issue',1)).toThrow();expect(()=>perform(s,o,'receive')).toThrow();expect(()=>perform(s,o,'test',1)).toThrow();
  expect(()=>perform(s,o,'gift')).toThrow();expect(()=>perform(s,o,'work',50)).toThrow();
  s=rehearse(o);s=perform(s,o,'predict',0);s=perform(s,o,'test',0);s=perform(s,o,'test',1);expect(()=>perform(s,o,'predict',1)).toThrow();
  expect(()=>perform(s,o,'issue',2)).toThrow();
  s=perform(s,o,'issue',0);s=perform(s,o,'test',2);expect(s.flags[k+'.late']).toBe(true);
  const n=ticket[7][0];s={...s,mapId:PASSAGES[n-1].hall};expect(()=>perform(s,o,'test',0)).toThrow();
  s=perform(s,o,'receive');expect(s.flags[returnKey(o,n)]).toBe(revision(s,o));
  s={...s,mapId:PASSAGES[0].hall};s=perform(s,o,'issue',1);
  expect(s.flags[returnKey(o,n)]).not.toBe(revision(s,o));
  const restored=migrateCampaign(JSON.parse(JSON.stringify(s))).state;
  expect(issued(restored,o)).toBe(1);expect(isIssued(perform(restored,o,'restart'),o)).toBe(true);
  expect(disposition(o,0).cost).not.toBe(disposition(o,1).cost);expect(reading(o,2)).toBeGreaterThanOrEqual(0);
  const cmd:WorkCommand={type:'WorldWork',order:o,action:'issue',value:1};const journal=commandDiaryEvent(base.e.pack,s,restored,cmd);
  expect(journal?.title).toContain(ticket[4]);expect(journal?.event?.key).toContain(workTopicStamp(o));
});

it('offers fresh mechanisms, restores free choices inside an act and opens local missions on direct arrival',()=>{
  const orders=rows(1,0).map(ticket=>({chapter:1,group:0,ticket}));const s=at(orders[0]);
  expect(new Set(newLeads(s,orders).map(methodId)).size).toBe(3);
  const fresh=newLeads(s,orders)[0];s.flags['work.recent']=methodId(fresh);s.flags[ticketKey(fresh)+'.edition']=0;
  expect(newLeads(s,orders).every(o=>methodId(o)!==methodId(fresh))).toBe(true);
  const d=new Driver();expect(corridorOpen(d.s,15)).toBe(false);d.s.flags['nile.returned']=true;
  for(const n of [6,3,8,4,7,5]){expect(corridorOpen(d.s,n)).toBe(true);d.s.mapId=PASSAGES[n-1].hall;d.run({type:'VisitPlace',name:PASSAGES[n-1].name});
    expect(sagaChapter(d.s)).toBe(n);expect(d.s.flags[PASSAGES[n-1].arrived]).toBe(true);}
  expect(corridorOpen(d.s,15)).toBe(false);
});

it('finishes an older in-progress field rehearsal before starting the new instrument',()=>{
  const o={chapter:1,group:0,ticket:rows(1,0).find(t=>t[1]===22)!},k=ticketKey(o);
  let s=at(o);s.flags[k+'.position']=1;
  expect(workTool(o,s).title).toBe('Keep a watch');
  s=perform(s,o,'work',1);expect(s.flags[k+'.worked']).toBe(true);
  s=perform(s,o,'restart');expect(workTool(o,s).title).toBe('Earn the small creature’s company');
});
