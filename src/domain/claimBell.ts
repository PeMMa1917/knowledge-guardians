import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect } from './types';

export const bellSites = { well: 'aethelgard.emberford', weir: 'water.council' } as const;
export const channels = ['voice', 'token', 'runner'] as const;
export const shifts = ['dawn', 'late'] as const;
export const visitors = ['first', 'second'] as const;
export type Channel = typeof channels[number];
export type Shift = typeof shifts[number];
export type Visitor = typeof visitors[number];
export type Site = keyof typeof bellSites;
export type Rule = { channel: Channel; shift: Shift };
export type BellCommand = { type: 'WorkClaimBell' } & (
  | { act: 'turn' | 'receive' | 'issue' | 'sign' | 'home' }
  | { act: 'set'; channel: Channel; shift: Shift }
  | { act: 'try'; who: Visitor }
);
type State = Pick<CampaignState, 'flags' | 'mapId'>;
const flag = (key: string, value: string | boolean): Effect => ({ setFlag: 'claimbell.' + key, value });
const get = (s: State, key: string) => s.flags['claimbell.' + key];
export const bellSite = (s: State): Site | undefined => s.mapId === bellSites.well ? 'well' : s.mapId === bellSites.weir ? 'weir' : undefined;
export const ruleKey = (r: Rule) => r.channel + '.' + r.shift;
export function readRule(value: unknown): Rule | undefined {
  if (typeof value !== 'string') return;
  const [channel, shift, extra] = value.split('.');
  if (extra === undefined && channels.includes(channel as Channel) && shifts.includes(shift as Shift))
    return { channel: channel as Channel, shift: shift as Shift };
}
export function workingRule(s: State, site: Site): Rule {
  return readRule(get(s, site + '.working')) ?? { channel: 'voice', shift: 'dawn' };
}
export const callerNames = {
  well: { first: 'Efua’s sister', second: 'the late porter' },
  weir: { first: 'the wheel listener', second: 'the chalk maker' },
} as const;
export const channelNames = { voice: 'Speak at the window', token: 'Leave a wooden tally', runner: 'Send a neighbour' };
export const shiftNames = { dawn: 'First bell', late: 'Closing bell' };
export function describeRule(r: Rule) { return channelNames[r.channel] + ' · ' + shiftNames[r.shift]; }

// Each job has its own availability, means of leaving a trace and reason to use a proxy.
const shiftsAtWindow: Record<Site, Record<Visitor, Shift>> = {
  well: { first: 'dawn', second: 'late' }, weir: { first: 'late', second: 'dawn' },
};
export function hearCaller(site: Site, who: Visitor, rule: Rule) {
  const earlyJob = who === 'first', home = site === 'well', present = shiftsAtWindow[site][who] === rule.shift;
  if (rule.channel === 'voice') {
    if (!present) return { entered: false, words: home
      ? earlyJob ? 'At closing the soup is already on the tables. The empty kettle has no one here to speak for it.' : 'The porter is on the ridge at first bell. His cup is still hanging on his belt.'
      : earlyJob ? 'The wheel listener finishes below the gate after the dawn window shuts. Her wet sleeve leaves a mark on the closed hatch.' : 'The chalk maker has gone home. The drawing is pinned here, but the hearing only takes a spoken account.' };
    return { entered: true, words: home
      ? earlyJob ? 'Efua’s sister asks for a spare pot before the soup goes on. The keeper enters her request in her words.' : 'The porter gets his own turn at the closing bell. He asks for a pot he can lift with one hand.'
      : earlyJob ? 'The wheel listener knocks three times to copy the sound she heard beneath the boards. The clerk records a sound. Nobody has seen a crack yet.' : 'The chalk maker shows how far yesterday’s line has moved. The clerk asks who set the first mark.' };
  }
  if (rule.channel === 'token') {
    if (!home && earlyJob) return { entered: false, words: 'The slot takes flat slips. The listener has a rhythm tapped on timber. Her three knocks leave the slot as empty as silence would.' };
    const reading = home
      ? earlyJob ? 'A flat tally from the soup kitchen waits in the slot. Efua can count the request while her sister stirs the pot.' : 'The porter drops his wooden cup mark on the way past. His turn survives the climb. The mark says nothing about his sore wrist.'
      : 'The chalk maker can pass a rubbing under the hatch. It preserves the shape but loses the place unless someone visits the wheel.';
    const turn = rule.shift === 'dawn'
      ? ' The first clerk counts it before the day crew sets out.' : ' The mark has to wait until the lamps are lit.';
    return { entered: true, words: reading + turn };
  }
  if (home && !earlyJob) return { entered: false, words: 'The porter has no one on this shift he wants to tell about his wrist. His neighbour will carry a message, but the porter keeps the cup.' };
  const report = home
    ? 'The kitchen helper takes Efua’s sister’s request. She reaches the hook with the right name, and misses the first ladle of soup herself.'
    : earlyJob ? 'The runner taps the listener’s rhythm on the desk. The clerk marks it as a relayed sound and keeps the listener’s name.'
    : 'The runner brings the chalk maker’s account. Asked which bank the mark came from, he points in two different directions.';
  const turn = rule.shift === 'dawn' ? ' The first crew can ask a follow-up at once.' : ' The departing crew leaves its answer for the morning.';
  return { entered: true, words: report + turn };
}
export function tested(s: State, site: Site, who: Visitor, rule: Rule) {
  return get(s, site + '.test.' + who + '.' + ruleKey(rule)) === true;
}
const methodsTried = (s: State, site: Site) => channels.filter(channel => shifts.some(shift => visitors.some(who => tested(s, site, who, { channel, shift })))).length;
export function bellEffects(s: State, c: BellCommand): Effect[] {
  const site = bellSite(s), issued = readRule(get(s, 'issued'));
  if (!site || (site === 'well' ? s.flags['well.shared'] !== true : !issued)) throw Error('Find the covered jug in Emberford first.');
  if (c.act === 'turn') return [flag(site + '.turned', true)];
  if (c.act === 'receive') {
    if (site !== 'weir' || !issued) throw Error('Open the well rule at the council hatch.');
    return get(s, 'received') ? [] : [flag('received', true), flag('weir.working', ruleKey(issued))];
  }
  if (!get(s, site + '.turned')) throw Error('Turn the brass word plate. The other face is worn smooth at one edge.');
  if (site === 'weir' && !get(s, 'received')) throw Error('Open the rule Efua sent before changing the hatch.');
  const rule = workingRule(s, site);
  switch (c.act) {
    case 'set':
      if (!channels.includes(c.channel) || !shifts.includes(c.shift)) throw Error('Choose a working entrance and a bell.');
      return [flag(site + '.working', ruleKey(c))];
    case 'try':
      if (!visitors.includes(c.who)) throw Error('Bring one of the waiting neighbours to the hatch.');
      return [
        flag(site + '.test.' + c.who + '.' + ruleKey(rule), true),
        flag(site + '.heard.' + c.who, true),
        ...(site === 'weir' && issued && ruleKey(issued) === ruleKey(rule) ? [flag('weir.original.' + c.who, true)] : []),
      ];
    case 'issue':
    case 'sign': {
      if ((c.act === 'issue') !== (site === 'well')) throw Error('Use the desk that owns this rule.');
      if (c.act === 'issue' && issued) throw Error('The signed first rule is on its way. Its trial board is still yours to use.');
      if (methodsTried(s, site) < 2 || !visitors.every(who => tested(s, site, who, rule))) throw Error('Try another entrance too. Then walk both neighbours through the rule you want to sign.');
      if (site === 'well' && !shifts.some(shift => tested(s, site, 'second', { channel: 'voice', shift })))
        throw Error('Let the porter try the speaking window before you send a rule in his name.');
      if (site === 'weir' && (!tested(s, site, 'first', { channel: 'voice', shift: 'late' }) || !shifts.some(shift => tested(s, site, 'first', { channel: 'token', shift }))))
        throw Error('Walk the wheel listener past the flat slot, then let her tap her rhythm at the closing bell.');
      if (site === 'weir' && issued && !visitors.every(who => tested(s, site, who, issued))) throw Error('Run both council accounts through the original well rule before signing its successor.');
      return [flag(c.act === 'issue' ? 'issued' : 'signed', ruleKey(rule))];
    }
    case 'home': {
      const returned = readRule(get(s, 'signed'));
      if (site !== 'well' || !returned) throw Error('Bring a signed council rule back to the hook.');
      return [flag('home', ruleKey(returned))];
    }
  }
}
export function bellDiary(s: CampaignState, c: BellCommand) {
  const site = bellSite(s);
  if (!site) return;
  const rule = workingRule(s, site), who = c.act === 'try' ? c.who : undefined;
  const ref = c.act === 'set' || c.act === 'try' ? site + '.test' : c.act === 'turn' ? site + '.word' : c.act;
  let text: string;
  switch (c.act) {
    case 'turn': text = site === 'well' ? 'I turned the CLAIM plate. One face called aloud. The other asked for a right. Our window could recognise the same request in more than one way.' : 'I turned EVIDENCE toward the wheel. The old word points to seeing. The ear at the lower gate also had something worth checking.'; break;
    case 'receive': text = 'I brought Efua’s original rule to the weir. I wanted to see whose account could get through it here.'; break;
    case 'set': text = 'I reset the hatch for a different shift. ' + describeRule(rule) + '.'; break;
    case 'try': text = 'I walked ' + callerNames[site][c.who] + ' through the hatch. ' + hearCaller(site, c.who, rule).words; break;
    case 'issue': text = 'I sent Efua’s rule to the council. ' + describeRule(rule) + '.'; break;
    case 'sign': text = 'I signed the council rule after hearing both workers under the old rule and testing my own. ' + describeRule(rule) + '.'; break;
    case 'home': text = 'I brought the council rule home. ' + homeReading(s); break;
  }
  const relevant = c.act === 'home' ? get(s, 'home') : c.act === 'receive' ? get(s, 'issued') : ruleKey(rule);
  return diaryEvent(['claim-bell', site, c.act, who, relevant].filter(Boolean).join(':'), 'tool', 'claimbell.' + ref,
    'The bell for a quiet claim', text, c.act === 'turn' ? { sourceIds: [site === 'well' ? 'LEX-BELL-CLAIM' : 'LEX-BELL-EVIDENCE'] } : {}, 'after-break');
}
export function homeReading(s: State) {
  const r = readRule(get(s, 'signed'));
  if (!r) return '';
  return 'At ' + (r.shift === 'dawn' ? 'dawn' : 'closing') + ' Efua lets the porter try the council’s hatch on his own request. ' + hearCaller('well', 'second', r).words;
}
