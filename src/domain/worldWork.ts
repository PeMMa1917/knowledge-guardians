import { sagaChapter } from './corridorSagas';
import { benches,benchFor } from './workInstruments';
import { performWork, methodId } from './workMethods';
import rivals from '../content/workshop-rivals.json';
import { TEMPLES } from './temples';
import type { CampaignState, Effect } from './types';

export type Ticket = [id:number, form:number, twist:number, keeper:string, object:string, place:string, correspondents:string[],
  destinations:number[], level:number, concepts:string, rival:string, gift:number, temple:number,
  hook:number, mystery:number, reveal:number, frameworkMask:number, areas:string, skill:number];
export interface WorkOrder { chapter:number; group:number; ticket:Ticket }
export type WorkCommand = {type:'WorldWork'; order:WorkOrder; action:'work'|'test'|'predict'|'issue'|'receive'|'gift'|'hear'|'restart'; value:number};
export const groupNames = ['Field games','Personal requests','Main quest routes','Crew missions','Story patterns'];
export const ticketKey = (o:WorkOrder) => 'work.'+o.chapter+'.'+o.group+'.'+o.ticket[0];
export const orderName = (o:WorkOrder) => o.ticket[4]+' · '+o.ticket[3];
export const readingKey = (o:WorkOrder,i:number) => ticketKey(o)+'.test.'+i;
export const ruleFor = (o:WorkOrder) => benches[benchFor(o.group,o.ticket[1])!];
export const setting = (o:WorkOrder) => o.ticket[0]+o.ticket[2]*13+o.chapter*17;
export const reading = (o:WorkOrder,i:number) => ruleFor(o).measure(setting(o),i);
export const returnKey = (o:WorkOrder,n:number) => ticketKey(o)+'.heard.'+n;
export const issued = (s:CampaignState,o:WorkOrder) => s.flags[ticketKey(o)+'.edition'];
export const isIssued = (s:CampaignState,o:WorkOrder) => typeof issued(s,o)==='number';
export const needsPrediction = (o:WorkOrder) => o.ticket[8]>=3 && (o.group===2 || o.group===3 || o.group===4);
export const requiredReadings = (o:WorkOrder) => needsPrediction(o)?2:(o.group===2 || o.group===3?1:0);
export function canIssue(s:CampaignState,o:WorkOrder):boolean {
  return !!s.flags[ticketKey(o)+'.worked'] && (!needsPrediction(o) || (s.flags[readingKey(o,0)]!==undefined && s.flags[readingKey(o,1)]!==undefined)) && [0,1,2].filter(i=>s.flags[readingKey(o,i)]!==undefined).length>=requiredReadings(o);
}
export function disposition(o:WorkOrder,edition:number) {
  if(edition===2)return {label:'Send the rival’s reservation with the working order',cost:'The receiving keeper can hear both sides. Two witnesses must return to answer for the decision.'};
  const rule=ruleFor(o);
  return {label:rule.ends[edition],cost:rule.costs[edition]};
}
export function rivalVoice(o:WorkOrder,s?:CampaignState) {
  const name=o.ticket[10];
  const temple=TEMPLES.find(t=>t.agent===name);
  if(temple)return {name,opening:temple.opening,line:temple.admission};
  const script=(rivals as Record<string,string[]>)[name];
  const caller=name==='Aurelian Ashlock' && !s?.flags['temple.gift.11']?'the unsigned dispatcher':name;
  return script?{name:caller,opening:script[0],line:script[1]}:undefined;
}
export const revision = (s:CampaignState,o:WorkOrder) => Number(s.flags[ticketKey(o)+'.revision']??0);
export function newLeads(s:CampaignState, orders:WorkOrder[],limit=3):WorkOrder[] {
  const recent=String(s.flags['work.recent']??'').split(',');
  const options=orders.filter(o=>!isIssued(s,o));
  const chosen:WorkOrder[]=[];
  while(chosen.length<limit && options.length) {
    function score(o:WorkOrder){
      const shape=methodId(o);
      return (recent.includes(shape)?2:0)+(chosen.some(p=>methodId(p)===shape)?8:0)+(chosen.some(p=>p.ticket[3]===o.ticket[3])?4:0);
    }
    let best=0;
    for(let j=1;j<options.length;j++)if(score(options[j])<score(options[best]))best=j;
    chosen.push(options.splice(best,1)[0]);
  }
  return chosen;
}

export function workAction(s:CampaignState,cmd:WorkCommand):{effects:Effect[];title:string;text:string}{
  const o=cmd.order,t=o.ticket,site=sagaChapter(s);
  if(!Array.isArray(t) || !Number.isInteger(o.chapter) || o.chapter<1 || o.chapter>15 || !Number.isInteger(t[0]) || t[0]<1 ||
    t[0]>[300,300,200,400,864][o.group] || !benchFor(o.group,t[1]) || !site)throw Error('Use a work order from this shelf.');
  const rule=ruleFor(o),key=ticketKey(o),i=cmd.value;
  const flag=(id:string,value:number|boolean|string):Effect=>({setFlag:id,value});
  if(cmd.action==='receive'){
    if(site===o.chapter || !t[7].includes(site) || !isIssued(s,o))throw Error('Carry an issued order to one of its other worlds.');
    const edition=Number(issued(s,o));
    return {effects:[flag(returnKey(o,site),revision(s,o))],title:'Received at the other bench',text:disposition(o,edition).cost};
  }
  if(site!==o.chapter)throw Error('Return to the keeper who began this case.');
  if(cmd.action==='work')return performWork(o,s,i,key);
  if(cmd.action==='restart')return {effects:[flag(key+'.instrument',1),flag(key+'.position',0),flag(key+'.worked',false),flag(key+'.result', '')],title:'A fresh rehearsal',text:'The keeper has reset the apparatus. Any issued instructions still stand until you replace them.'};
  if(cmd.action==='hear'){
    const agent=rivalVoice(o,s);
    if(!agent || !s.flags[key+'.worked'])throw Error('Finish the rehearsal and find the agent named on the ticket.');
    return {effects:[flag(key+'.heard-agent',true)],title:agent.name,text:agent.line};
  }
  if(cmd.action==='gift'){
    if(!t[11] || !s.flags['temple.gift.'+t[11]])throw Error('The fitting needs its guardian gift.');
    return {effects:[flag(key+'.gift',true)],title:'The extra setting',text:'The holder exposes the control behind the third reading. The next crew can repeat it.'};
  }
  if(cmd.action==='predict') {
    if(!needsPrediction(o)||!Number.isInteger(i)||i<0||i>2||s.flags[readingKey(o,1)]!==undefined)throw Error('Leave the forecast before making the second reading.');
    return {effects:[flag(key+'.prediction',i)],title:'Sealed forecast',text:'The keeper expects the second reading to be '+['lower','the same','higher'][i]+'.'};
  }
  if(!Number.isInteger(i)||i<0||i>2)throw Error('Choose a setting on the bench.');
  if(cmd.action==='test'){
    if(i===1 && needsPrediction(o) && s.flags[key+'.prediction']===undefined)throw Error('Seal a forecast before making this reading.');
    const seen=[0,1,2].filter(j=>s.flags[readingKey(o,j)]!==undefined);
    const late=seen.length>=2 && !seen.includes(i), value=reading(o,i);
    return {effects:[flag(readingKey(o,i),value),...(late?[flag(key+'.late',true)]:[])],title:rule.controls[i],
      text:value+' '+rule.unit+'.'+(late?' The first runner has left. The evening crew will carry the result.':'')};
  }
  if(cmd.action!=='issue' || !canIssue(s,o) || (needsPrediction(o)&&s.flags[readingKey(o,1)]===undefined) ||
    (i===2 && !s.flags[key+'.heard-agent']))throw Error('Complete the rehearsal and its evidence before issuing that order.');
  const {label,cost}=disposition(o,i),shape=methodId(o);
  const recent=[shape,...String(s.flags['work.recent']??'').split(',').filter(value=>value&&value!==shape)].slice(0,3);
  return {effects:[flag(key+'.edition',i),flag(key+'.revision',revision(s,o)+(issued(s,o)===i?0:1)),flag('work.recent',recent.join(','))],title:label,text:cost};
}
