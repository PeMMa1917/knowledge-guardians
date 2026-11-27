import {
  millAccounts,
  millClaims,
  millCorrections,
  millPages,
  millSites,
  millWorkers,
  type MillSite,
} from '../content/millShift';
import { diaryEvent } from './adventureEvents';
import { lanternCase, lanternRef } from './lamplight';
import type { CampaignState, Effect } from './types';

type State = Pick<CampaignState, 'flags' | 'mapId'>;
type Hand = 0 | 1 | 2;
type Side = 0 | 1;
type Stamp = 0 | 1 | 2;
export type MillCommand = { type: 'WorkMillShift' } & (
  | { action: 'arrive' }
  | { action: 'lay'; book: Side }
  | { action: 'coin'; from: Hand; to: Hand }
  | { action: 'purse' }
  | { action: 'rig'; tooth: Side; porter: Side }
  | { action: 'stroke'; move: 'feed' | 'turn' }
  | { action: 'undo' }
  | { action: 'stamp' }
  | { action: 'bind'; axis: 'tooth' | 'rota' }
  | { action: 'try-estimate' }
  | { action: 'typeset'; claim: Stamp }
  | { action: 'tense'; mode: 'docket' | 'rehearsal' | 'tomorrow' }
  | { action: 'send'; audience: Side }
  | { action: 'return' }
);
const flag = (name: string, value: string | boolean | number): Effect => ({
  setFlag: 'mill-shift.' + name,
  value,
});
const read = (s: State, k: string) => s.flags['mill-shift.' + k];
const at = (s: State, k: string) => read(s, k) === true;
const side = (n: unknown): n is Side => n === 0 || n === 1;
const hand = (n: unknown): n is Hand => side(n) || n === 2;
export const millSite = (s: State) => millSites.find((id) => s.mapId === 'night-register.' + id);
function requireSite(here: MillSite, needed: MillSite) {
  if (here !== needed)
    throw Error('Find this part of the mill shift in ' + millAccounts[needed].keeper + '’s register.');
}
export function millPurse(s: State, sent = false): number[] | undefined {
  return readCoins(read(s, sent ? 'nile.sent' : 'nile.coins'));
}
function readCoins(raw: unknown): number[] | undefined {
  if (typeof raw !== 'string' || !/^\d{3}$/.test(raw)) return;
  const amounts = [...raw].map(Number);
  return amounts.reduce((sum, x) => sum + x, 0) === 6 ? amounts : undefined;
}
export function purseLine(amounts: readonly number[]) {
  return amounts.map((count, i) => millWorkers[i] + ' ' + count).join(' · ');
}
export function purseReply(amounts: readonly number[]) {
  if (amounts[1] === 0)
    return 'Tessel sets the empty bowl on his head. The child by the door laughs. At the hatch he still has to borrow enough for breakfast.';
  if (amounts[1] === 6)
    return 'Tessel can pay for all three breakfasts. Liri puts her empty bowl upside down beside the wheel. She had hoped to buy a tooth of her own.';
  if (amounts[0] === 0)
    return 'Tessel drops a counter into his pocket. Liri keeps the rough blank she meant to sell for the ferry fare and walks home with it.';
  if (amounts[2] === 0)
    return 'Aven wraps her empty bowl in a scarf. Tessel walks beside her to the quay. Neither lets the other carry it.';
  return 'Each worker can make a purchase before the tide turns. Liri folds the slip into a purse. Tessel turns his bowl over to find his name on the foot.';
}
export function millRig(s: State) {
  const raw = read(s, 'yard.rig');
  return typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw <= 3 ? raw : 0;
}
export function millMoves(s: State) {
  const raw = read(s, 'yard.moves');
  return typeof raw === 'string' && /^[ft]{0,4}$/.test(raw) ? raw : '';
}
export function runMill(rig: number, moves: string) {
  const teeth = 1 + (rig & 1),
    porter = rig >= 2;
  let rack = 0,
    cut = 0;
  const bells = [...moves].map((m, i) => {
    let got = 0;
    if (m === 'f') rack += 3;
    else {
      if (porter) rack++;
      got = Math.min(rack, teeth);
      rack -= got;
      cut += got;
    }
    return { bell: i + 1, move: m, got, rack, cut };
  });
  return { bells, cut, rack };
}
export const millRigName = (n: number) =>
  (n & 1 ? 'two-tooth wheel' : 'one-tooth wheel') +
  ' · ' +
  (n >= 2 ? 'porter feeding on each turn' : 'one worker');
export function millStrip(s: State) {
  return readStrip(read(s, 'yard.sent'));
}
function readStrip(strip: unknown) {
  if (typeof strip !== 'string' || !/^[0-3][ft]{4}$/.test(strip)) return;
  const rig = Number(strip[0]),
    moves = strip.slice(1);
  return { rig, moves, ...runMill(rig, moves) };
}
export function millStripText(strip: NonNullable<ReturnType<typeof millStrip>>) {
  return (
    millRigName(strip.rig) +
    '. ' +
    [...strip.moves].map((x) => (x === 'f' ? 'feed' : 'turn')).join(' / ') +
    '. ' +
    strip.cut +
    ' notches, ' +
    strip.rack +
    ' blanks still waiting.'
  );
}
export function millRunMask(s: State, moves: string) {
  const v = read(s, 'yard.tried.' + moves);
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 15 ? v : 0;
}
export function millClaim(s: State): Stamp | undefined {
  const n = read(s, 'press.claim');
  return hand(n) ? n : undefined;
}
export function millTense(s: State) {
  const mode = read(s, 'press.tense');
  return mode === 'docket' || mode === 'rehearsal' || mode === 'tomorrow' ? mode : undefined;
}
export function millProof(s: State) {
  const original = millPurse(s, true),
    trial = millStrip(s),
    claim = millClaim(s),
    tense = millTense(s);
  if (claim === undefined || !tense) return;
  const record = original
    ? 'The Guardian settled six counters. ' + purseLine(original) + '.'
    : 'The pay bowls have yet to send a settlement.';
  const test = trial
    ? 'On the four-bell bench the Guardian tried ' + millStripText(trial)
    : 'The mill has yet to send a tried strip.';
  const lead =
    tense === 'docket'
      ? 'The gate book records three carrying bells for Tessel. His stamp appears on no board in the piece book.'
      : tense === 'rehearsal'
        ? 'If Tessel had stayed on the quay and the rack had held only three blanks, even the new wheel could have cut no more than three notches from them.'
        : 'If Tessel comes up tomorrow, he can feed the rack while Liri turns the wheel. Tomorrow’s shift has yet to sign its page.';
  return [millClaims[claim].line, lead, record, test].join(' ');
}
export const oldMillShifts = [
  { day: 11, rig: 0, cut: 2 },
  { day: 12, rig: 0, cut: 4 },
  { day: 13, rig: 3, cut: 5 },
  { day: 14, rig: 3, cut: 7 },
] as const;
type Axis = 'tooth' | 'rota';
export function millEstimate(axis: Axis, rig: number) {
  const group = (value: number) => (axis === 'tooth' ? value & 1 : (value >> 1) & 1);
  const shifts = oldMillShifts.filter((r) => group(r.rig) === group(rig));
  return shifts.reduce((sum, s) => sum + s.cut, 0) / shifts.length;
}
export function millEstimateLine(s: State) {
  const strip = millStrip(s);
  if (!strip) return;
  return (
    'Grouping the signed shifts by wheel predicts ' +
    millEstimate('tooth', strip.rig) +
    ' notches. Grouping them by rota predicts ' +
    millEstimate('rota', strip.rig) +
    '. The working strip made ' +
    strip.cut +
    '. Both rules fit the old shift averages. Neither ledger contained an old wheel with a porter or a new wheel with one hand. The bench supplies a trial, not another historical shift.'
  );
}
export function millEdition(s: State) {
  const text = read(s, 'press.print'),
    claim = read(s, 'press.print-claim'),
    audience = read(s, 'press.audience');
  if (typeof text !== 'string' || !hand(claim) || !side(audience)) return;
  return { text, claim, audience };
}
export function millReturn(s: State, site: MillSite) {
  const e = millEdition(s);
  if (!e) return;
  if (site === 'nile') {
    const coins = readCoins(read(s, 'press.print-coins'));
    const room =
      e.audience === 0
        ? 'Imani fixes the printed amounts over the three bowls. The printers on the early shift get to see them.'
        : 'Imani closes the pay-room door. Each worker can read a leaf before anybody on the street sees it.';
    if (!coins)
      return room + ' There is space for wages, still white. Tessel writes to Bayette for a second edition.';
    if (coins[1] === 0)
      return (
        room +
        ' Tessel’s sister puts a breakfast chit on the printed zero. “I lent him that. Where do I put my mark?”'
      );
    if (coins[0] === 0)
      return (
        room +
        ' Liri rubs the zero with her thumb. Tessel offers to walk home with her so neither needs the ferry fare.'
      );
    if (coins[2] === 0)
      return (
        room +
        ' Aven turns her empty purse out on the desk. Her apprentice slips her a breakfast chit before the door opens.'
      );
    return (
      room +
      ' Tessel counts out his ' +
      coins[1] +
      ' and passes the proof back. “The last one paid for breakfast. Tell her what the others bought.”'
    );
  }
  if (site === 'yard') {
    const strip = readStrip(read(s, 'press.print-strip'));
    const room =
      e.claim === 0
        ? 'Liri sets the old tooth on the latch. A visitor tries the slow wheel and asks to meet the person who kept the rack full.'
        : e.claim === 1
          ? 'Tessel works the handle while Liri feeds the rack. He gets a blister in a place that never hurt on the carrying shift.'
          : 'Aven sets the pay desk within reach of the feed rack. The person counting the next run can look up and see both workers.';
    if (!strip)
      return (
        room +
        ' Nobody brought the four-bell strip. Liri pins the empty envelope up so the next shift can send one.'
      );
    return (
      room +
      (strip.cut === 0
        ? ' A strip with no cuts makes a curious trophy. Hesper keeps it. “We can still hear the four bells everybody worked.”'
        : ' Hesper gives the visitor a blank with ' +
          strip.cut +
          (strip.cut === 1 ? ' nick' : ' nicks') +
          ' matching the published trial. The next shift can try to make it again.')
    );
  }
  return millCorrections[e.audience].reply;
}
export function millEffects(s: State, c: MillCommand): Effect[] {
  const site = millSite(s);
  if (!site) throw Error('Find the pay chest, the model mill or the type case in the night registers.');
  if (c.action === 'arrive') {
    const met = lanternCase(lanternRef(site, millAccounts[site].guest))!.person;
    return [flag(site + '.open', true), { setFlag: 'lamplight.met.' + met.character, value: true }];
  }
  if (!at(s, site + '.open')) throw Error('Sit down with the keeper first.');
  switch (c.action) {
    case 'lay': {
      requireSite(site, 'nile');
      if (!side(c.book)) throw Error('Take one of the two books.');
      const result = [flag('nile.book' + c.book, true), flag('nile.coins', c.book ? '303' : '231')];
      if (at(s, 'nile.book' + (1 - c.book))) result.push(flag('nile.compared', true));
      return result;
    }
    case 'coin': {
      requireSite(site, 'nile');
      const bowls = millPurse(s);
      if (!bowls || !hand(c.from) || !hand(c.to) || c.from === c.to || !bowls[c.from])
        throw Error('Move one counter from a bowl that holds one to a different worker.');
      bowls[c.from]--;
      bowls[c.to]++;
      return [flag('nile.coins', bowls.join(''))];
    }
    case 'purse': {
      requireSite(site, 'nile');
      const bowls = millPurse(s);
      if (!bowls || !at(s, 'nile.compared'))
        throw Error('Try the six counters against both books before settling the bowls.');
      return [flag('nile.sent', bowls.join(''))];
    }
    case 'rig':
      requireSite(site, 'yard');
      if (!side(c.tooth) || !side(c.porter)) throw Error('Choose a wheel and a shift.');
      return [flag('yard.rig', c.tooth + 2 * c.porter)];
    case 'stroke': {
      requireSite(site, 'yard');
      const moves = millMoves(s);
      if (moves.length === 4)
        throw Error('All four bells are punched. Lift a punch to try a different shift.');
      if (c.move !== 'feed' && c.move !== 'turn') throw Error('Use the feed rack or turn the wheel.');
      return [flag('yard.moves', moves + (c.move === 'feed' ? 'f' : 't'))];
    }
    case 'undo':
      requireSite(site, 'yard');
      return [flag('yard.moves', millMoves(s).slice(0, -1))];
    case 'stamp': {
      requireSite(site, 'yard');
      const moves = millMoves(s),
        rig = millRig(s);
      if (moves.length !== 4) throw Error('Put a move at each of the four bells before stamping the run.');
      const mask = millRunMask(s, moves) | (1 << rig);
      const result = [flag('yard.tried.' + moves, mask), flag('yard.sent', rig + moves)];
      if (mask === 15) {
        const counts = [0, 1, 2, 3].map((r) => runMill(r, moves).cut);
        if (counts[3] > Math.max(counts[1], counts[2]) && counts[1] === counts[0] && counts[2] === counts[0])
          result.push(flag('yard.joint', true));
      }
      return result;
    }
    case 'bind': {
      requireSite(site, 'press');
      if (c.axis !== 'tooth' && c.axis !== 'rota') throw Error('Take one of the two binding cords.');
      return [flag('press.axis', c.axis), flag('press.bound-' + c.axis, true)];
    }
    case 'try-estimate': {
      requireSite(site, 'press');
      const strip = millStrip(s);
      if (
        !at(s, 'press.bound-tooth') ||
        !at(s, 'press.bound-rota') ||
        !strip ||
        strip.rig === 0 ||
        strip.rig === 3
      )
        throw Error(
          'Tie the dated slips both ways. Bring a stamped strip with a wheel and crew combination missing from those dates.',
        );
      return [flag('press.estimate', millEstimateLine(s)!)];
    }
    case 'typeset':
      requireSite(site, 'press');
      if (!hand(c.claim)) throw Error('Choose the lead for this edition.');
      return [flag('press.claim', c.claim), flag('press.frame' + c.claim, true)];
    case 'tense':
      requireSite(site, 'press');
      if (c.mode !== 'docket' && c.mode !== 'rehearsal' && c.mode !== 'tomorrow')
        throw Error('Choose a line for the proof.');
      return [flag('press.tense', c.mode)];
    case 'send': {
      requireSite(site, 'press');
      const text = millProof(s),
        claim = millClaim(s);
      if (!text || claim === undefined || !side(c.audience))
        throw Error('Set a headline and a line from the docket or rehearsal first.');
      if (!millPurse(s, true) && !millStrip(s))
        throw Error('Bring a settled purse from Imani or a stamped run from Hesper for this edition.');
      const mode = millTense(s)!;
      const result = [
        flag('press.audience', c.audience),
        flag('press.print-claim', claim),
        flag('press.print-coins', millPurse(s, true)?.join('') ?? ''),
        flag('press.print-strip', read(s, 'yard.sent') ?? ''),
        flag('press.print', text),
        flag('press.edition-' + mode, true),
      ];
      if (
        (mode === 'rehearsal' && at(s, 'press.edition-tomorrow')) ||
        (mode === 'tomorrow' && at(s, 'press.edition-rehearsal'))
      )
        result.push(flag('press.edited-moods', true));
      if (['frame0', 'frame1', 'bound-tooth', 'bound-rota'].every((f) => at(s, 'press.' + f)))
        result.push(flag('press.compared', true));
      return result;
    }
    case 'return':
      if (site === 'press' || !millEdition(s))
        throw Error('Send a proof from the Copies press before opening it at home.');
      return [
        flag(site + '.read', true),
        flag(site + '.opened-leaf', millEdition(s)!.text),
        flag(site + '.opened-reply', millReturn(s, site)!),
        ...(site === 'yard' && millEdition(s)!.audience === 0 ? [flag('press.stair', true)] : []),
        ...(site === 'nile' && millEdition(s)!.audience === 1 ? [flag('press.wharf', true)] : []),
      ];
  }
}
export function millDiary(s: State, c: MillCommand) {
  const site = millSite(s)!;
  const job = millAccounts[site],
    ref = lanternRef(site, job.guest),
    person = lanternCase(ref)!.person;
  const source = ('station' in person ? 'HIS-INK-' : 'HIS-LAMPLIGHT-') + person.id;
  let text: string;
  switch (c.action) {
    case 'arrive':
      text = job.opening + ' ' + job.work;
      break;
    case 'lay':
      text = millPages[c.book] + ' My bowls held ' + purseLine(millPurse(s)!) + '.';
      break;
    case 'coin':
      text =
        'I moved one counter from ' +
        millWorkers[c.from] +
        ' to ' +
        millWorkers[c.to] +
        '. ' +
        purseLine(millPurse(s)!) +
        '.';
      break;
    case 'purse':
      text = 'I settled the pay. ' + purseLine(millPurse(s, true)!) + '. ' + purseReply(millPurse(s, true)!);
      break;
    case 'rig':
      text = 'I kept my punch strip and fitted the ' + millRigName(millRig(s)) + '.';
      break;
    case 'stroke':
    case 'undo': {
      const moves = millMoves(s),
        r = runMill(millRig(s), moves);
      text =
        'My strip now reads ' +
        ([...moves].map((m) => (m === 'f' ? 'feed' : 'turn')).join(' / ') || 'empty') +
        '. The run left ' +
        r.cut +
        ' notches and ' +
        r.rack +
        ' waiting blanks.';
      break;
    }
    case 'stamp':
      text = 'I sent a tried strip to Bayette. ' + millStripText(millStrip(s)!);
      break;
    case 'bind':
      text =
        c.axis === 'tooth'
          ? 'I bound the four dated shifts by wheel. The single tooth averaged three and the double tooth six.'
          : 'I bound the same shifts by rota. One worker averaged three and two workers six. The rota change fell on the same date as the new wheel.';
      break;
    case 'try-estimate':
      text = 'I put the two estimates beside our tried strip. ' + millEstimateLine(s);
      break;
    case 'typeset':
      text = 'I set the opening in type. ' + millClaims[c.claim].line;
      break;
    case 'tense':
      text =
        c.mode === 'docket'
          ? 'I set what the dated book actually records about Tessel’s shift.'
          : c.mode === 'rehearsal'
            ? 'I set “had stayed” with “could have cut” for a shift that did not happen.'
            : 'I set “comes tomorrow” with “can feed” for a shift whose outcome is still open.';
      break;
    case 'send':
      text =
        'I chose to ' +
        millCorrections[c.audience].title.toLowerCase() +
        '. ' +
        millEdition(s)!.text +
        ' ' +
        millReturn(s, 'press');
      break;
    case 'return':
      text =
        'I unfolded the edition sent back by the Copies press. ' +
        millEdition(s)!.text +
        ' ' +
        millReturn(s, site) +
        (site === 'yard' && millEdition(s)!.audience === 0
          ? ' Liri showed me the workers’ stair from the Copies press.'
          : site === 'nile' && millEdition(s)!.audience === 1
            ? ' Imani unlatched the folded-letter chute from the Copies press.'
            : '');
      break;
  }
  return diaryEvent(
    'mill:' + ref + ':' + c.action,
    c.action === 'arrive' ? 'conversation' : c.action === 'send' || c.action === 'purse' ? 'choice' : 'tool',
    ref,
    job.title,
    text,
    { sourceIds: [source] },
    'after-break',
  );
}
