import type { CampaignState } from './types';
import { threadStanding, threadThreshold } from './temples';

interface ThreadScene { id:string;map:string;thread:number;trusted:boolean;title:string;text:string }
const scenes:ThreadScene[]=[
  {id:'stacks',map:'nexus.archive',thread:0,trusted:true,title:'Turn Ise’s second key',text:'In the private stacks Ise lifts a water-stained trial sheet. The surveyor wrote “dry year” twice. “Keep that scrap with you,” Ise says. Her signature is on the loan slip.'},
  {id:'warden-witness',map:'nexus.archive',thread:0,trusted:false,title:'Meet Ise at the public desk',text:'Ise has brought a witness to the desk. “I would rather somebody heard what I say this time.” She gives the witness the first copy and lets you keep the carbon.'},
  {id:'circle-coast',map:'temple.4',thread:1,trusted:true,title:'Lift Elsbet’s oilskin tab',text:'Inside the oilskin Elsbet drew the very same boat at two waterlines. One crew had unloaded before the gauge was read. The blank below asks for the time of unloading.'},
  {id:'circle-copies',map:'temple.7',thread:1,trusted:true,title:'Unfold the narrow margin',text:'A typesetter saved Elsbet’s payment slip. She paid for the space around a missing line, even though white space did not count toward her publisher’s fee.'},
  {id:'circle-river',map:'temple.11',thread:1,trusted:true,title:'Look beneath the spring cup',text:'Elsbet scratched the two crew meeting dates under the cup. Her first invitation went to the right people on the wrong day. The second date is in a different hand.'},
  {id:'circle-caution',map:'nexus.archive',thread:1,trusted:false,title:'Answer the correspondent at the rail',text:'A correspondent keeps the address folded. “Show me where I can put a correction after you leave.” You mark the public return shelf. She writes the shelf number on her own copy.'},
  {id:'stamp-ledger',map:'nexus.archive',thread:2,trusted:true,title:'Read the stamp ledger from inside',text:'The agent turns the stamp book round. Presses were paid for before a single notice sold. The account carries a little waterwheel beside the deposit. The agent lends you the carbon.'},
  {id:'seal-challenge',map:'nexus.archive',thread:2,trusted:false,title:'Take the agent’s one-breath challenge',text:'A Seal runner has one crossing left before night. You fit the warning and its limit in the same breath. The runner tries it back, gets a word wrong, and stays for a second try.'},
  {id:'island-terms',map:'temple.14',thread:2,trusted:true,title:'Borrow Vesper’s loading slot',text:'Vesper tears her reserved loading token in half. You can run the shade comparison while the harbour queue still has time to use it. She waits beside the unsold model.'},
];
export function offeredScenes(s:CampaignState) {
  const standing=threadStanding(s);
  return scenes.filter(row=>row.map===s.mapId && (row.trusted?standing[row.thread]>=threadThreshold:standing[row.thread]<=-threadThreshold));
}
