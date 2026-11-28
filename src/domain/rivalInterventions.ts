import assignments from '../content/rival-assignments.json';
import actions from '../content/rival-interventions.json';
import type { CampaignState } from './types';
import type { WorkOrder } from './worldWork';

// Each of the four activity shelves keeps its workbook order. A dot is an unopposed case.
export function rivalIntervention(o: WorkOrder) {
  if (!o.ticket[10]) return;
  const code = assignments[o.chapter - 1]?.[o.group]?.[o.ticket[0] - 1];
  if (code && code !== '.') return actions[code.charCodeAt(0) - 65];
}

export function rivalReply(s: CampaignState, o: WorkOrder, key: string, posted: boolean): string | undefined {
  const choice = s.flags[key + (posted ? '.posted-objection' : '.objection')];
  if (choice !== 0 && choice !== 1) return;
  return rivalIntervention(o)?.paths[choice].result;
}
