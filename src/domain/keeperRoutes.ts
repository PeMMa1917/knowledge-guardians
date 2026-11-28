import favours from '../content/keeper-favours.json';
import approaches from '../content/keeper-main-routes.json';
import type {CampaignState} from './types';
import type {WorkOrder} from './worldWork';

export const routeCase=(o:WorkOrder)=>o.group===1?favours[o.ticket[1]]:o.group===2?approaches[o.ticket[1]]:undefined;
const root=(o:WorkOrder)=>'work.'+o.chapter+'.'+o.group+'.'+o.ticket[0];
export function chosenRoute(o:WorkOrder,s:CampaignState,posted=false) {
  const index=s.flags[root(o)+(posted?'.posted-route':'.route')];
  return typeof index==='number'?routeCase(o)?.routes[index]:undefined;
}

// Crew assignments choose an instrument by what the task asks the player to do.
export const crewTools=[39,30,29,25,27,21,0,30,23,6,11,7,34,18,37,15,11,13,12,18,16,8,2,19,35,14,29,6,12,25,26,16,34,8,35,39];
// Some story forms need a quiet negotiation or a choice of who carries the shift.
// Field-based forms borrow the actual appropriate instrument instead.
export const patternTools:Record<number,number>={
  7:8,9:11,10:18,11:19,12:8,14:25,15:29,16:23,17:12,18:39,
  19:0,20:4,21:7,22:2,23:9,24:11,25:12,26:24,27:39,28:17,29:18,
  30:20,31:16,32:22,34:36,35:35,37:14,38:30,39:1,
};
