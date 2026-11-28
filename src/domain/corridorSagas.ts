import routes from '../content/corridor-sagas/routes.json';
import families from '../content/corridor-sagas/families.json';
import { PASSAGES } from './corridor';
import type { CampaignState, Effect } from './types';

export interface SagaStage { saga:number; person:string; object:string; place:string }
export interface SagaMove {type:'SagaMove';saga:number;move:'inspect'|'settle';choice:0|1}
export const sagaChapter=(s:CampaignState)=>PASSAGES.findIndex(p=>p.hall===s.mapId)+1;
export const sagaRoute=(id:number):readonly number[]=>routes[id-1] ?? [];
export const sagaFamily=(id:number)=>families[(id-1)%families.length];
export const sagaName=(id:number)=>{const f=sagaFamily(id);return f.title+' · '+f.tags[Math.floor((id-1)/families.length)];};
export const sagaDecision=(s:CampaignState,id:number,n:number)=>s.flags['saga.'+id+'.world.'+n];
export function sagaTrail(s:CampaignState,id:number):number[]{
  const trail=s.flags['saga.'+id+'.trail'];
  return typeof trail==='string'?trail.split(',').map(Number):[];
}
export const sagaRead=(s:CampaignState,id:number,n:number,i:number)=>s.flags['saga.'+id+'.read.'+n+'.'+i]===true;

export function sagaMove(s:CampaignState,cmd:SagaMove):{title:string;text:string;effects:Effect[]}{
  const n=sagaChapter(s),route=sagaRoute(cmd.saga);
  if (!Number.isInteger(cmd.saga) || !route.includes(n) || (cmd.choice!==0 && cmd.choice!==1)) throw Error('Visit a stop on this thread.');
  const f=sagaFamily(cmd.saga),key='saga.'+cmd.saga;
  if(cmd.move==='inspect')return {title:f.tools[cmd.choice],text:f.findings[cmd.choice],effects:[{setFlag:key+'.read.'+n+'.'+cmd.choice,value:true}]};
  if(cmd.move!=='settle' || !sagaRead(s,cmd.saga,n,0) || !sagaRead(s,cmd.saga,n,1))throw Error('Try both arrangements before leaving instructions for the next keeper.');
  const trail=sagaTrail(s,cmd.saga);
  const changes:Effect[]=[{setFlag:key+'.world.'+n,value:cmd.choice}];
  if(!trail.includes(n))changes.push({setFlag:key+'.trail',value:[...trail,n].join(',')});
  return {title:f.choices[cmd.choice],text:f.effects[cmd.choice],effects:changes};
}

export function sagaAfterword(s:CampaignState,id:number):string{
  const trail=sagaTrail(s,id);
  if(trail.length!==sagaRoute(id).length)return '';
  const alternate=trail.filter(n=>sagaDecision(s,id,n)===1);
  const first=PASSAGES[trail[0]-1],last=PASSAGES[trail[trail.length-1]-1],f=sagaFamily(id);
  return first.delegate+' opens the parcel returned by '+last.delegate+'. '+(alternate.length
    ? 'Inside is the instruction kept at '+alternate.map(n=>PASSAGES[n-1].name).join(', ')+'. '+f.effects[1] : f.effects[0]);
}
