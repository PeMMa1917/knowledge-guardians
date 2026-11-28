import type { GameController } from '../app/controller';
import { corridorOpen, PASSAGES } from '../domain/corridor';
import { sagaChapter } from '../domain/corridorSagas';
import { TEMPLES } from '../domain/temples';
import { nextInvitation, type KeeperInvitation } from '../domain/workInvitations';
import {chosenRoute} from '../domain/keeperRoutes';
import scenes from '../content/workshop-stories.json';
import { workTool } from '../domain/workMethods';
import { revision, rivalVoice, canIssue, disposition, needsPrediction, requiredReadings, newLeads, workAction, groupNames,reading,readingKey,returnKey,ruleFor,issued,isIssued,ticketKey,type Ticket,type WorkOrder,type WorkCommand } from '../domain/worldWork';
import { hallShift, hallCost, shiftReading } from '../domain/hallStories';
import { workTitles } from '../domain/workTitles';
import articles from '../content/workshop-articles.json';
import { h } from './dom';

const schoolBooks=import.meta.glob<{default:Ticket[]}>('../content/world-work/w*-g*.json');
export function loadOrders(chapter:number,group:number) {
  const load=schoolBooks['../content/world-work/w'+chapter+'-g'+group+'.json'];
  if(!load)throw Error('No work shelf at that address.');
  return load().then(m=>m.default);
}

export function workPanel(c:GameController,onTemple:(n:number)=>void, travel:(n:number)=>void, invitation?:KeeperInvitation) {
  const home=invitation?.chapter??sagaChapter(c.state),room=c.state.mapId;
  const box=h('div',{}),body=h('div',{}),notice=h('p',{role:'status','aria-live':'polite'});
  box.append(body,notice);
  let titles = new Map<number, string>();
  let page=0,group=0,rows:Ticket[]=[],query='',epoch=0;
  const current=()=>c.state.mapId===room;
  function action(o:WorkOrder,act:WorkCommand['action'],value=0){
    const before=c.state;
    const error=c.dispatch({type:'WorldWork',order:o,action:act,value}).find(e=>e.kind==='error');
    if(error){notice.textContent=error.message;return false;}
    notice.textContent=workAction(before,{type:'WorldWork',order:o,action:act,value}).text;
    return true;
  }
  function launch(o:WorkOrder){
    const t=o.ticket,s=c.state,rule=ruleFor(o),shift=hallShift(o.chapter),key=ticketKey(o);
    const wasMeasuring=body.querySelector<HTMLDetailsElement>('[data-measure]')?.open??false;
    const tool=workTool(o,s),done=!!s.flags[key+'.worked'];
    const lead=scenes.leads[(t[14]-1)%scenes.leads.length];
    function take(act:WorkCommand['action'],value:number,focus:string) {
      if(!action(o,act,value))return;
      launch(o);
      const next=Array.from(body.querySelectorAll<HTMLButtonElement>('button')).find(b=>b.textContent===focus && !b.disabled);
      (next??body.querySelector<HTMLElement>('[data-work-step]'))?.focus();
    }
    const control=(act:WorkCommand['action'],value:number,label:string)=>h('button',{type:'button',onclick:()=>take(act,value,label)},label);
    body.replaceChildren(invitation?h('button',{type:'button',onclick:()=>void open(1)},'See this keeper’s requests'):h('button',{type:'button',onclick:list},'Back to work orders'),h('h2',{},titles.get(t[0])!),
      h('p',{},t[3]+' · '+t[5]),h('p',{},shiftReading(s,key,o.chapter)),h('p',{},scenes.beginnings[(t[13]-1)%scenes.beginnings.length]),h('p',{},lead[0]),
      h('h3',{tabindex:'-1','data-work-step':true},tool.title));
    const route=chosenRoute(o,s);
    if(route)body.append(h('p',{},route.action+'.'));
    if(!done){
      body.append(h('p',{},tool.prompt));
      if(tool.chart){
        const {cell:here,post}=tool.chart;
        const chart=h('table',{'aria-label':'Ferry chart'});
        for(let row=0;row<3;row++){
          const tr=h('tr',{});
          for(let col=0;col<3;col++){
            const i=row*3+col;
            tr.append(h('td',{},String.fromCharCode(65+col)+(row+1)+' '+(i===here?'Ferry':i===post?'Post':i===8?'Landing':'·')));
          }
          chart.append(tr);
        }
        body.append(chart);
      }
      body.append(h('div',{class:'row wrap'},...tool.controls.map((label,i)=>control('work',i,label))),
        h('details',{},h('summary',{},'Ask Lumen for a hand'),h('p',{},tool.help)));
    }
    if(s.flags[key+'.result'])body.append(h('p',{},String(s.flags[key+'.result'])));
    if(done){
      body.append(h('p',{},lead[1]),h('button',{type:'button',onclick:()=>take('restart',0,'')},'Rehearse another way'));
      const agent=rivalVoice(o,s);
      if(agent){
        body.append(h('p',{},agent.opening),control('hear',0,'Hear '+agent.name+' out'));
        if(s.flags[key+'.heard-agent'])body.append(h('blockquote',{},agent.line));
      }
    }
    const measurements=h('details',{'data-measure':true,open:wasMeasuring || requiredReadings(o)>0 && done},h('summary',{},rule.name+(requiredReadings(o)>0?' · evidence for this order':'')),h('p',{},rule.prompt));
    if(needsPrediction(o)){
      const forecast=s.flags[key+'.prediction'];
      if(s.flags[readingKey(o,1)]===undefined)measurements.append(h('p',{},'Predict how the second setting will read against the first. You can issue an order after any prediction.'),
        ...['Lower','The same','Higher'].map((label,i)=>control('predict',i,label)));
      if(typeof forecast==='number')measurements.append(h('p',{},'Your sealed forecast: '+['lower','the same','higher'][forecast]+'.'));
      if(typeof forecast==='number' && s.flags[readingKey(o,1)]!==undefined && s.flags[readingKey(o,0)]!==undefined)
        measurements.append(h('p',{},'Across the two settings the reading was '+['lower','the same','higher'][Math.sign(reading(o,1)-reading(o,0))+1]+'.'));
    }
    for(const i of [0,1,2] as const){
      const val=s.flags[readingKey(o,i)];
      measurements.append(control('test',i,rule.controls[i]),...(val!==undefined?[h('p',{},val+' '+rule.unit)]:[]));
    }
    if(t[11] && s.flags['temple.gift.'+t[11]])measurements.append(control('gift',0,'Fit '+TEMPLES[t[11]-1].gift),
      ...(s.flags[key+'.gift']?[h('p',{},'The holder exposes the third setting: '+reading(o,2)+' '+rule.unit+'.')]:[]));
    body.append(measurements);
    if(canIssue(s,o)){
      body.append(h('p',{},shift.discovery+' '+shift.turn));
      for(const i of (s.flags[key+'.heard-agent']?[0,1,2]:[0,1])){
        const btn=control('issue',i,disposition(o,i).label);
        btn.setAttribute('aria-pressed',String(issued(s,o)===i));body.append(btn);
      }
    }
    if(isIssued(s,o)){
      const i=Number(issued(s,o));
      body.append(h('p',{},disposition(o,i).cost), h('blockquote',{},hallCost(o.chapter,i)), h('p',{},'Received by '+(s.flags[key+'.late']?shift.lateKeeper:shift.earlyKeeper)+'. '+scenes.keeps[(t[15]+i)%scenes.keeps.length]),
        h('details',{},h('summary',{},'At the end of the shift'),h('p',{},shift.quiet)));
      const settled=chosenRoute(o,s,true);if(settled)body.append(h('blockquote',{},settled.returnLine));
      if(t[7].length)body.append(h('p',{},'The order is addressed to '+t[7].map(n=>PASSAGES[n-1].name).join(' · ')+'. Its keeper will take it under Incoming work.'));
      for(const dest of t[7])if(corridorOpen(s,dest))body.append(h('button',{onclick:()=>travel(dest)},'Carry the order to '+PASSAGES[dest-1].name));
      if(t[12] && o.chapter<=14 && c.state.objectivesDone.includes(PASSAGES[o.chapter-1].finish))
        body.append(h('button',{onclick:()=>onTemple(o.chapter)},'Follow the temple route to '+TEMPLES[o.chapter-1].temple));
    }
    const reference=articles as Record<string,string[]>;
    for(const person of t[6]){
      const pages=reference[person];
      if(!pages){
        body.append(h('p',{},person+' · ',h('a',{href:'https://en.wikipedia.org/w/index.php?'+new URLSearchParams({search:person}),target:'_blank',rel:'noopener noreferrer'},'Search Wikipedia')));
        continue;
      }
      body.append(h('p',{},person+' · ',...pages.flatMap((title,i)=>[i?' · ':'',h('a',{href:'https://en.wikipedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_')),target:'_blank',rel:'noopener noreferrer'},title)])));
    }
  }
  function list(){
    const visible=rows.filter(t=>!query||[t[3],t[4],t[5],titles.get(t[0])!].some(x=>x.toLowerCase().includes(query)));
    const top=h('div',{}),results=h('div',{});body.replaceChildren(...(invitation?[]:[h('button',{onclick:menu},'All work shelves')]),h('h2',{},groupNames[group]),top,results);
    const filter=h('input',{type:'search','aria-label':'Find a keeper, object or activity',value:query});
    top.append(h('label',{},'Find a keeper, object or activity ',filter),h('button',{onclick:()=>{query=filter.value.trim().toLowerCase();page=0;list()}},'Find'));
    filter.onkeydown=(ev)=>{if(ev.key==='Enter'){query=filter.value.trim().toLowerCase();page=0;list();}};
    if(!query && page===0){
      const leads=newLeads(c.state,rows.map(ticket=>({chapter:home,group,ticket})));
      if(leads.length)top.append(h('details',{},h('summary',{},'Try a different kind of work'),...leads.map(o=>h('button',{onclick:()=>{notice.textContent='';launch(o);}},titles.get(o.ticket[0])!))));
    }
    for(const t of visible.slice(page*8,page*8+8))results.append(h('div',{class:'lore-entry'},h('button',{type:'button',onclick:()=>{notice.textContent='';launch({chapter:home,group,ticket:t});}},titles.get(t[0])!),h('p',{class:'fine'},t[3]+' · '+t[5])));
    const max=Math.ceil(visible.length/8);if(!max)results.append(h('p',{},'No orders match this search.'));
    if(max>1)results.append(h('div',{class:'row'},h('button',{disabled:page===0,onclick:()=>{page--;list()}},'Previous'),h('span',{},'Page '+(page+1)+' of '+max),h('button',{disabled:page+1>=max,onclick:()=>{page++;list()}},'Next')));
  }
  async function open(g:number){
    const seq=++epoch;body.replaceChildren(h('p',{role:'status'},'Opening the work shelf…'));
    try{
      const result=await loadOrders(home,g);if(epoch!==seq||!current())return;
      group=g;titles=workTitles(g,result);rows=invitation?result.filter(t=>invitation.orders.includes(t[0])):result;page=0;query='';notice.textContent='';list();
    }catch{if(epoch===seq)body.replaceChildren(h('p',{role:'alert'},'The shelf could not open.'),h('button',{onclick:()=>open(g)},'Try again'),h('button',{onclick:menu},'Back'));}
  }
  async function inbox(){
    const seq=++epoch;
    body.replaceChildren(h('button',{onclick:menu},'All work shelves'),h('h2',{},'Incoming work'));
    const addressed=Object.keys(c.state.flags).filter(k=>/^work\.\d+\.\d+\.\d+\.edition$/.test(k));
    const keys=[...new Set(addressed.map(k=>k.split('.').slice(1,3).join('.')))];
    let count=0;
    try {
      for(const k of keys){
        const [chapter,g]=k.split('.').map(Number);
        if(chapter===home)continue;
        const book=await loadOrders(chapter,g);
        if(seq!==epoch||!current())return;
        const incomingTitles=workTitles(g,book);
        for(const t of book){
          const o={chapter,group:g,ticket:t};if(!t[7].includes(home)||!isIssued(c.state,o))continue;
          const edition=Number(issued(c.state,o));count++;
          const reply=h('p',{},c.state.flags[returnKey(o,home)]===revision(c.state,o)?[disposition(o,edition).cost,chosenRoute(o,c.state,true)?.returnLine].filter(Boolean).join(' '):'');
          body.append(h('div',{class:'lore-entry'},h('h3',{},incomingTitles.get(t[0])!),h('p',{},'From '+t[3]+' in '+PASSAGES[chapter-1].name+'. '+disposition(o,edition).label+'.'),
            h('button',{onclick:()=>{if(action(o,'receive'))reply.textContent=notice.textContent;}},'Receive this edition'),reply));
        }
      }
      if(!count && seq===epoch)body.append(h('p',{},'The shelf is empty. Orders addressed to this world will be here when you arrive.'));
    }catch{if(seq===epoch)body.append(h('p',{role:'alert'},'A receiving book could not open.'),h('button',{onclick:inbox},'Try again'));}
  }
  function menu(){
    epoch++;notice.textContent='';
    const shift=hallShift(home);
    const local=h('details',{},h('summary',{},'Overheard in the hall'),h('p',{},shift.humour));
    local.addEventListener('toggle',()=>{if(local.open)c.dispatch({type:'ReadWorldSign',id:'hall-aside-'+home,title:'Overheard in '+PASSAGES[home-1].name,text:shift.humour});});
    body.replaceChildren(h('h2',{},'Work orders'),h('p',{},shift.opening),local, ...groupNames.map((g,i)=>h('button',{onclick:()=>open(i)},g)),h('button',{onclick:inbox},'Incoming work'));}
  if(invitation){
    const seq=++epoch;
    body.append(h('p',{role:'status'},'The keeper is finding the request…'));
    const fetchVisit=()=>loadOrders(home,1).then(book=>{
      if(epoch!==seq||!current())return;
      group=1;titles=workTitles(1,book);rows=book.filter(t=>invitation.orders.includes(t[0]));
      const ticket=rows.find(t=>t[0]===nextInvitation(c.state,invitation));
      if(!ticket)throw Error('Missing keeper request');
      launch({chapter:home,group,ticket});
    }).catch(()=>{
      if(epoch===seq&&current())body.replaceChildren(h('p',{role:'alert'},'The request could not open.'),h('button',{onclick:fetchVisit},'Try again'));
    });
    void fetchVisit();
  }else menu();
  return box;
}
