import library from '../content/dispatch-folders.json';
import type { CampaignState } from './types';
import type { WorkOrder } from './worldWork';

export function dispatchFolder(o:WorkOrder) {
  // Story patterns keep their own plot. The four activity shelves use the
  // source workbook's independently assigned hook, mystery, reversal and clock.
  if (o.group===4) return;
  const t=o.ticket,opening=library.openings[t[13]-1],file=library.cases[t[14]-1],turn=library.turns[t[15]-1];
  if (!opening || !file || !turn) return;
  const clock=library.clocks[(t[19]??0)-1];
  const names:Record<string,string>={keeper:t[3],object:t[4],place:t[5]};
  return {opening:opening.replace(/\{(keeper|object|place)\}/g,(_,p:string)=>names[p]),file,turn,clock};
}

export function travelFinding(s:CampaignState,o:WorkOrder,key:string,posted:boolean):string|undefined {
  const choice=s.flags[key+(posted?'.posted-finding':'.finding')];
  if (choice!==0 && choice!==1) return;
  return dispatchFolder(o)?.file.paths[choice].finding;
}
