import scenes from '../content/supper-talk.json';
import { PASSAGES } from './corridor';
import { threadStanding, threadThreshold } from './temples';
import type { CampaignState, ContentPack, DialogueNode, Effect } from './types';
import { callers } from './callingBook';

export const supperScenes = scenes;
export const supperThread: Record<string, number> = { 'kip-arden': 0, 'scholar-sefa': 1, 'rook-tamsin': 1, 'smith-hesper': 2 };
export type SupperCommand = { type:'CompanionSupper'; scene:number; action:'listen'|'pack'|'unpack'; choice?:number };
const key = (scene:number) => 'supper.pair.' + scene;
export const packedSupper = (s:CampaignState,i:number) => s.flags[key(i)+'.packed'];

export function supperLines(s:CampaignState,i:number): string[] {
  const scene=scenes[i], standing=threadStanding(s);
  const lines=[...scene.exchange];
  scene.people.forEach((who,j) => {
    if (s.flags['offshift.'+who]==='cover') lines.push(scene.memories[j]);
    if (standing[supperThread[who]]>=threadThreshold) lines.push(scene.trusted[j]);
  });
  return lines;
}

export function availableSuppers(pack:ContentPack, nodes:ContentPack['dialogue'] | ReadonlyMap<string,DialogueNode>, s:CampaignState):number[] {
  if (s.mapId !== 'nexus.archive') return [];
  const present=new Set(callers(pack,nodes,s).map(c=>c.id));
  if (s.companion) present.add(s.companion);
  return scenes.flatMap((s,i)=>s.people.every(p=>present.has(p))?[i]:[]);
}

export function supperMove(pack:ContentPack,nodes:ContentPack['dialogue'] | ReadonlyMap<string,DialogueNode>,s:CampaignState,cmd:SupperCommand): {effects:Effect[];title:string;text:string} {
  const i=cmd.scene,scene=scenes[i],prefix=key(i);
  if (!scene) throw Error('Choose a conversation at the supper fire.');
  if (cmd.action==='unpack') {
    const choice=packedSupper(s,i);
    if (s.mapId!==PASSAGES[scene.chapter-1].hall || (choice!==0 && choice!==1)) throw Error('Bring their parcel to the hall named on its tag.');
    return {effects:[{setFlag:prefix+'.delivered',value:choice}],title:scene.title,text:scene.editions[choice].reply};
  }
  if (!availableSuppers(pack,nodes,s).includes(i)) throw Error('Meet both companions before joining their supper in the Nexus.');
  if (cmd.action==='listen') return {effects:[{setFlag:prefix+'.heard',value:true}],title:scene.title,text:supperLines(s,i).join(' ')};
  const j=cmd.choice;
  if (!s.flags[prefix+'.heard'] || (j!==0 && j!==1)) throw Error('Hear both companions before packing their parcel.');
  return {effects:[{setFlag:prefix+'.packed',value:j}],title:scene.editions[j].action,text:'The parcel is ready for '+PASSAGES[scene.chapter-1].name+'.'};
}
