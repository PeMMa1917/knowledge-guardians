import {councilPost} from '../domain/rivalPost';
import type { GameController } from '../app/controller';
import { offeredScenes } from '../domain/factionScenes';
import { PASSAGES } from '../domain/corridor';
import { allies, councilOpening, councilWitnesses, factions, giftKey, indexEndings, leaders, pressure, quietHandReveal, TEMPLES, templeAction, templeAt, threadStanding, trialKey, type TempleCommand } from '../domain/temples';
import { h } from './dom';

export function templePanel(c:GameController,station:string) {
  const panel=h('section',{class:'temple-bench'});
  const log=h('p',{role:'status','aria-live':'polite'});
  const scene=h('div',{});
  panel.append(scene,log);
  const makeButton=(label:string,action:TempleCommand['action'],choice?:number)=> h('button',{type:'button',onclick:()=>{
    const cmd:TempleCommand={type:'TempleAction',action,choice};
    const before=c.state;
    const error=c.dispatch(cmd).find(e=>e.kind==='error');
    if (error) {log.textContent=error.message;return;}
    log.textContent=templeAction(before,cmd).text;
    draw();
  }},label);
  function draw(){
    const s=c.state,t=templeAt(s);
    scene.replaceChildren();
    if (!t) {
      if(s.mapId!=='council.hall')return;
      scene.append(h('h2',{},'The Still Index'),h('p',{},'Two receivers rest in the brass cover. One came from each side of Coldwater Fork.'));
      if (s.flags[giftKey(14)]) scene.append(makeButton(TEMPLES[13].away.action,'gift-view'));
      if (!s.flags['temple.hearing']) {scene.append(makeButton('Play the two receivers','hear'));return;}
      scene.append(h('p',{},councilOpening),h('p',{},'At the table: '+councilWitnesses(s)+'.'));
      const finding=councilPost(s);if(finding)scene.append(h('p',{},finding));
      const ending=s.flags['temple.index'];
      if(typeof ending==='number' && indexEndings[ending])scene.append(h('p',{},indexEndings[ending].result));
      for(const [i,e] of indexEndings.entries()) scene.append(makeButton(e.title,'index',i));
      return;
    }
    const n=t.chapter;
    scene.append(h('h2',{},t.temple),h('p',{},t.opening));
    if (station==='first' || station==='second') {
      const i=station==='first'?0:1;
      scene.append(makeButton(t.trials[i].action,station));
      if(s.flags[trialKey(n,i)])scene.append(h('p',{},t.trials[i].result));
      return;
    }
    if (station==='return') {
      const previous=TEMPLES[n-2];
      scene.append(h('h3',{},previous.gift));
      if(s.flags[giftKey(n-1)])scene.append(makeButton(previous.away.action,'gift-view'));
      else scene.append(h('p',{},'An empty setting bears the maker’s mark from '+previous.temple+'.'));
      return;
    }
    scene.append(threadPanel(c));
    scene.append(h('h3',{},t.agent+' · '+t.faction),h('p',{},'“'+t.admission+'”'),h('p',{},pressure(s)));
    if(!s.flags[trialKey(n,0)] || !s.flags[trialKey(n,1)]){
      scene.append(h('p',{},'There is an instrument on each side of the room. Bring both readings here.'));return;
    }
    for(const [i,e] of t.editions.entries()) if(i<2 || s.flags['temple.'+n+'.witness.guardian'])scene.append(makeButton(e.action,'settle',i));
    const current=s.flags['temple.edition.'+n];
    if(typeof current!=='number')return;
    scene.append(h('p',{},t.editions[current].result),h('p',{},t.guardian+' entrusts you with '+t.gift+'. Its setting is in '+PASSAGES[n].name+'.'));
    if(n===11)scene.append(h('p',{},quietHandReveal));
    const l=leaders[n];
    if(l)scene.append(allies(s).includes(l.name)?h('p',{},l.reply):makeButton(l.offer,'ally'));
  }
  draw();return panel;
}

export function templeJournal(c:GameController) {
  const s=c.state,known=TEMPLES.filter(t=>s.flags[giftKey(t.chapter)]);
  const result=h('section',{},h('h3',{},'Guardian gifts'),h('p',{},known.length+' of 14 gifts for the Council.'));
  for(const t of known) result.append(h('p',{},h('strong',{},t.gift+'. '),t.guardian+' entrusted it to you in '+t.temple+'. Try it in '+PASSAGES[t.chapter].name+'.'));
  if(known.length) {
    const scores=threadStanding(s);
    for(const [i,name] of factions.entries())if(Math.abs(scores[i])>=2)
      result.append(h('p',{},name+(scores[i]>0?' has left an invitation':' has left a challenge')+' at the Nexus ribbon.'));
  }
  return result;
}

export function threadPanel(c:GameController) {
  const box=h('section',{});
  for (const row of offeredScenes(c.state)) {
    const read=h('p',{role:'status'},c.state.flags['thread-scene.'+row.id]?row.text:'');
    box.append(h('button',{type:'button',onclick:()=>{
      c.dispatch({type:'ReadWorldSign',id:'thread-scene.'+row.id,title:row.title,text:row.text,readFlag:'thread-scene.'+row.id});
      read.textContent=row.text;
    }},row.title),read);
  }
  return box;
}
