import keepers from '../content/receiving-keepers.json';
import { PASSAGES } from './corridor';
import type { CampaignState, Effect } from './types';

export const receivingKeepers = keepers;

export function receivedTrail(s:CampaignState,key:string,revision:number,destinations:number[]): number[] {
  if (s.flags[key+'.trail-edition']!==revision) return [];
  const raw=s.flags[key+'.trail'];
  return typeof raw==='string' ? [...new Set(raw.split(',').map(Number).filter(n=>destinations.includes(n)))] : [];
}

export function receivingChoice(s:CampaignState,key:string,n:number,revision:number) {
  const value=s.flags[key+'.local.'+n];
  if (s.flags[key+'.local-edition.'+n]===revision && (value===0 || value===1)) return value;
}

export function receiptAccount(s:CampaignState,key:string,n:number,revision:number,trail:number[],choice:0|1) {
  const index=trail.indexOf(n);
  const previous=index===-1?trail.at(-1):trail[index-1];
  const former=previous===undefined?undefined:receivingChoice(s,key,previous,revision);
  const carry=previous!==undefined && former!==undefined ? 'From '+PASSAGES[previous-1].name+' came this reply. '+keepers[previous-1].routes[former].reply+' ' : '';
  return carry+keepers[n-1].routes[choice].reply;
}

export function leaveWithKeeper(s:CampaignState,key:string,n:number,revision:number,destinations:number[],choice:number): {effects:Effect[];title:string;text:string} {
  if (choice!==0 && choice!==1 || !destinations.includes(n) || s.flags[key+'.heard.'+n]!==revision) throw Error('Receive the current edition at this bench first.');
  const route=keepers[n-1].routes[choice],trail=receivedTrail(s,key,revision,destinations);
  const text=receiptAccount(s,key,n,revision,trail,choice);
  if(!trail.includes(n))trail.push(n);
  return {title:route.action,text,effects:[
    {setFlag:key+'.local.'+n,value:choice},{setFlag:key+'.local-edition.'+n,value:revision},
    {setFlag:key+'.trail',value:trail.join(',')},{setFlag:key+'.trail-edition',value:revision},
  ]};
}
