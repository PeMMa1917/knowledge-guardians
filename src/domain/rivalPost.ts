import paper from '../content/double-posts.json';
import { PASSAGES } from './corridor';
import { sagaChapter } from './corridorSagas';
import { templeAt } from './temples';
import type { CampaignState, Effect } from './types';

export const letters=paper.slips;
export const connections=paper.pairs.map(row=>({from:Number(row[0]),to:Number(row[1]),title:String(row[2]),reveal:String(row[3])}));
export const postChapter=(s:CampaignState)=>sagaChapter(s)||templeAt(s)?.chapter||0;
const key=(n:number)=>'post.rival.'+n;
export const postChoice=(s:CampaignState,n:number)=>s.flags[key(n)+'.custody'];
export const traced=(s:CampaignState,n:number)=>s.flags[key(n)+'.trace']===true;
export const joint=(n:number)=>connections.find(c=>c.from===n||c.to===n);
export const joined=(s:CampaignState,n:number)=>s.flags['post.join.'+joint(n)?.from]===true;
export const ready=(s:CampaignState,n:number)=>typeof postChoice(s,n)==='number';
export function terms(s:CampaignState,n:number) {
  const pair=joint(n);
  if(!pair)return '';
  const privateCustody=[pair.from,pair.to].filter(stop=>postChoice(s,stop)===1).map(stop=>letters[stop-1].address);
  if(!privateCustody.length)return 'Both pieces are at the public rail. Any returning visitor can examine the join.';
  if(privateCustody.length===2)return privateCustody.join(' and ')+' carry their pieces in person. At the Council they can give the combined finding while the slips stay in their hands.';
  return privateCustody[0]+' holds one original. The public rail has directions for arranging a visit to see the join.';
}
export function invitation(s:CampaignState,n:number) {
  if(n<1||n>14)return false;
  return traced(s,n)||s.flags['temple.gift.'+n]===true||ready(s,letters[n-1].other)||
    Object.keys(s.flags).some(k=>k.startsWith('work.'+n+'.') && k.endsWith('.edition'));
}
export type RivalCommand={type:'RivalPost';act:'trace'|'send'|'compare'|'call';value:number};
export function rivalMove(s:CampaignState,cmd:RivalCommand):{effects:Effect[];title:string;text:string} {
  const n=postChapter(s),i=cmd.value;
  if(cmd.act==='call'){
    const pair=connections.find(p=>p.from===i);
    if(n!==15||!pair||!joined(s,i))throw Error('Bring both parts together before calling their keepers to the Council.');
    return {effects:[{setFlag:'post.council-witness',value:i}],title:pair.title,text:pair.reveal+' '+terms(s,i)};
  }
  const slip=letters[n-1];
  if(!slip||!invitation(s,n))throw Error('The post opens after local work, a guardian gift or a letter from its other world.');
  if(cmd.act==='trace')return {effects:[{setFlag:key(n)+'.trace',value:true}],title:slip.first,text:slip.discovery};
  if(cmd.act==='send'){
    if(!traced(s,n) || (i!==0 && i!==1))throw Error('Examine the trace before deciding who will carry it.');
    const route=slip.routes[i];
    return {effects:[{setFlag:key(n)+'.custody',value:i}],title:route.action,text:route.consequence};
  }
  const connection=joint(n)!;
  if(cmd.act!=='compare'||!ready(s,n)||!ready(s,slip.other))throw Error('Both keepers must have a trace to bring to the meeting.');
  return {effects:[{setFlag:'post.join.'+connection.from,value:true}],title:connection.title,text:connection.reveal+' '+terms(s,n)};
}
export function councilPost(s:CampaignState):string {
  const n=s.flags['post.council-witness'];
  const pair=typeof n==='number'?connections.find(p=>p.from===n):undefined;
  return pair&&joined(s,pair.from)?pair.reveal+' '+terms(s,pair.from):'';
}
export function otherAddress(n:number) {return PASSAGES[letters[n-1].other-1];}
