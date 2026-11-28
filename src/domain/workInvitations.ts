import register from '../content/workshop-invitations.json';
import type {CampaignState} from './types';

export interface KeeperInvitation {chapter:number;keeper:string;orders:number[]}
const rooms=register.rooms as Record<string,number>;
const residents=register.residents as Record<string,string[]>;
const keepers=register.keepers as Record<string,Record<string,number[]>>;
export const invitationChapter=(room:string)=>rooms[room];
export function invitationFor(room:string,keeper:string):KeeperInvitation|undefined {
  const chapter=rooms[room],orders=keepers[chapter]?.[keeper];
  return orders && residents[room]?.includes(keeper)?{chapter,keeper,orders}:undefined;
}
export function availableOnSite(room:string,chapter:number,group:number,id:number) {
  return group===1 && rooms[room]===chapter && residents[room]?.some(keeper=>keepers[chapter]?.[keeper]?.includes(id));
}
export function nextInvitation(s:CampaignState,invitation:KeeperInvitation):number {
  const prefix='work.'+invitation.chapter+'.1.';
  // Resume an unfinished request first. A completed set can still be revisited.
  return invitation.orders.find(id=>s.flags[prefix+id+'.position']!==undefined && s.flags[prefix+id+'.edition']===undefined)
    ?? invitation.orders.find(id=>s.flags[prefix+id+'.edition']===undefined) ?? invitation.orders[0];
}
