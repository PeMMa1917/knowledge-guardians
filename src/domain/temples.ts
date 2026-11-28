import records from '../content/guardian-temples.json';
import { PASSAGES, passed, routeOrder } from './corridor';
import type { CampaignState, Effect } from './types';

export const TEMPLES = records;
export type Temple = typeof records[number];
export const TEMPLE_STATIONS = ['first','second','custody','return'] as const;
export type TempleStation = typeof TEMPLE_STATIONS[number];
export const templeMap = (chapter: number) => 'temple.' + chapter;
export const giftKey = (chapter: number) => 'temple.gift.' + chapter;
export const trialKey = (chapter: number, trial: number) => 'temple.trial.' + chapter + '.' + trial;
export const sealsReady = (s: CampaignState) => TEMPLES.every(t => s.flags[giftKey(t.chapter)] === true);
export const templeAt = (s: CampaignState) => TEMPLES.find(t => s.mapId === templeMap(t.chapter));

export const indexEndings = [
  {title:'Unseal the Still Index', result:'Every margin is visible now. A night porter finds the warning their parents never saw. A family asks Hale to build a screen before the next page goes up.'},
  {title:'Give Aurelian the Coldwater recording', result:'For a long time the room plays only water. Aurelian stops the reel at the sound of the second village. “Leave me both receivers.” The next decision belongs to the listener.'},
  {title:'Bind the Index to public checks', result:'The harbour gets a rule it can use tonight. A rota of strangers holds the second key. They must come back, even on winter mornings.'},
  {title:'Send the books home', result:'Each community takes custody of its names. Two ferrymen volunteer to carry disagreements between shores. The journey costs them a tide every week.'},
  {title:'Pilot a compact between two communities', result:'Two witnesses sign for a trial season. The terms can change when the witnesses meet again. Until then, three other districts must decide whether to wait.'},
];

export const leaders: Record<number,{name:string;offer:string;reply:string}> = {
  9:{name:'Vesper Quill',offer:'Trace the press payment through the first receipt',reply:'Vesper lays her gold stamp beside the receipt. “So someone bought the first answer before I sold it. Leave my name beside theirs.”'},
  10:{name:'Provost Garrick Lode',offer:'Repeat the local tare before filling out the standard form',reply:'“One. Their wicker measurement was right. Two.” Lode sets down the pen. “Would someone tell me what the weaver calls this basket?”'},
  12:{name:'Iver Bellcast',offer:'Keep each street’s tune and arrange a shared answering bell',reply:'“Both songs. Both songs.” For once Iver waits through the silence between them. The second street finishes in its own time.'},
  13:{name:'Tolly Fadden',offer:'Protect the family recording and leave its dated index visible',reply:'Tolly loosens the reel. “Best left with them.” This time the index stays. Tolly takes the key to the family in person.'},
  14:{name:'Sabine Orrell',offer:'Give the shade trial to its maker and test it in public',reply:'Sabine takes her name card off the tray. “Show me how you did it.” The gardener sets her to work on the troublesome row.'},
};

export const factions = ['Wardens','Elsbet’s circle','Gilded Seal'] as const;
// The first group benefits from the settlement, the second bears a cost.
// Re-read the saved decision so a revised decision replaces the old one without farming trust.
const dilemmas: [string,Record<string,string>][] = [
  ['sd.corvan.outcome',{exposed:'10',narrowed:'01','won-over':'21',split:'12','lost-ground':'20'}],
  ['nile.dispatch',{print:'01',read:'12',pair:'10'}],
  ['preserved.display',{records:'10',paired:'01',delayed:'02'}],['coast.notice',{signal:'21',runner:'12'}],
  ['forest.response',{quiet:'01',brief:'10'}],['metal.response',{window:'10',ledger:'01'}],
  ['copies.response',{reprint:'12',strip:'21'}],['sea.response',{shore:'10',water:'02'}],
  ['stage.response',{pause:'10',move:'21'}],['market.response',{window:'12',desk:'01'}],
  ['water.response',{fields:'20',split:'01',channel:'12'}],['civic.response',{rank:'20',reserve:'10',even:'01'}],
  ['voices.response',{paired:'12',guide:'01'}],['island.response',{ridge:'20',ferry:'01',marsh:'12'}],
  ['council.response',{rail:'12',record:'01'}],
];

export function threadStanding(s: CampaignState): number[] {
  const result = [0,0,0];
  for (const [key,choices] of dilemmas) {
    const value=choices[String(s.flags[key])];
    if (value) { result[Number(value[0])]++; result[Number(value[1])]--; }
  }
  return result;
}

export const threadThreshold = 2;
export function allies(s: CampaignState): string[] {
  return Object.values(leaders).filter(l=>s.flags['temple.ally.'+l.name]===true).map(l=>l.name);
}

export function pressure(s: CampaignState): string {
  const n=PASSAGES.filter((_,i)=>passed(s,i+1)).length;
  if (n>=10) return 'Three offices have already copied the heading. A correction must reach each of them.';
  if (n>=5) return 'A second desk has copied the first heading. Keep a copy for its reader.';
  return 'The ink is wet. The keeper can still change which sheet leaves the room.';
}

export const quietHandReveal = 'The note is in Aurelian Ashlock’s hand. “A caveat on a weir will frighten the waiting families.” Below it Ise signed her own name. Vesper turns the first press receipt over. The same hand paid the deposit. Nobody forced either signature.';
export const councilOpening = 'Aurelian has warmed the brass chair for the person who will speak last. “You cannot ask the water to wait,” the old Archivist says. “I kept one warning where a child could reach it. There. Settled.” From the second receiver comes the empty hiss of the other village.';

export interface TempleCommand {
  type:'TempleAction';
  action:'first'|'second'|'settle'|'ally'|'gift-view'|'hear'|'index';
  choice?:number;
}

export function templeAction(s: CampaignState,cmd:TempleCommand): {effects:Effect[];title:string;text:string} {
  const t=templeAt(s);
  const chapter=t?.chapter ?? 15;
  if (!t && s.mapId!=='council.hall') throw Error('Visit the temple or the Council hearing.');
  const set=(key:string,value:string|number|boolean):Effect=>({setFlag:key,value});
  if (cmd.action==='gift-view') {
    const gift=TEMPLES[chapter-2];
    if (!gift || s.flags[giftKey(gift.chapter)]!==true) throw Error('Bring the gift named by the empty setting.');
    return {effects:[set('temple.away.'+gift.chapter,true)],title:gift.gift,text:gift.away.result};
  }
  if (cmd.action==='hear' || cmd.action==='index') {
    if (t || !sealsReady(s) || !PASSAGES.slice(0,14).every((_,i)=>passed(s,i+1))) throw Error('The hearing waits for fourteen gifts and fourteen completed cases.');
    if (cmd.action==='hear') return {effects:[set('temple.hearing',true)],title:'The Coldwater receivers',text:councilOpening};
    const edition=indexEndings[cmd.choice ?? -1];
    if (!edition || !s.flags['temple.hearing']) throw Error('Hear the two receivers first.');
    return {effects:[set('temple.index',cmd.choice!)],title:edition.title,text:edition.result};
  }
  if (!t) throw Error('Use the instruments at a guardian’s temple.');
  if (cmd.action==='first' || cmd.action==='second') {
    const i=cmd.action==='first'?0:1;
    return {effects:[set(trialKey(chapter,i),true)],title:t.trials[i].action,text:t.trials[i].result};
  }
  if (!s.flags[trialKey(chapter,0)] || !s.flags[trialKey(chapter,1)]) throw Error('Try both instruments so each witness has something to answer.');
  if (cmd.action==='ally') {
    const leader=leaders[chapter];
    if (!leader || !s.flags[giftKey(chapter)]) throw Error('Settle the local case before asking for a witness.');
    return {effects:[set('temple.ally.'+leader.name,true)],title:leader.name,text:leader.reply};
  }
  if (cmd.choice===2 && s.flags['temple.'+chapter+'.witness.guardian']!==true) throw Error('Ask the guardian to stand beside the trial first.');
  const edition=t.editions[cmd.choice ?? -1];
  if (cmd.action!=='settle' || !edition) throw Error('Choose how to leave the case.');
  return {effects:[set(giftKey(chapter),true),set('temple.edition.'+chapter,cmd.choice!)],title:edition.action,text:edition.result+(chapter===11?' '+quietHandReveal:'')};
}

export function councilWitnesses(s:CampaignState): string {
  const names=allies(s);
  const visits=routeOrder(s).filter(n=>n>2 && n<15);
  const order=[...new Set([visits[0],visits.at(-1)])].filter((n):n is number=>!!n);
  return [...order.map(n=>PASSAGES[n-1].delegate),...names].join(', ');
}
