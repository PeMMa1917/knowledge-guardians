import cases from '../content/second-ink.json';
import { nightSites } from './nightRegister';
import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, FlagValue, Weave } from './types';

export const inkCases = cases.map((story) => {
  const home = nightSites.find((s) => s.site === story.site)!;
  return { ...story, room: home.room, world: home.world, keeper: home.keeper, actor: home.actor };
});
export type InkCase = (typeof inkCases)[number];
export const inkTools = ['slip', 'cord', 'bell'] as const;
export type InkTool = (typeof inkTools)[number];
export const pressNames: Record<InkTool, string> = {
  slip: 'The sliding proof',
  cord: 'The three knotted cords',
  bell: 'The bell shutters',
};
export const inkEditions = ['exhibit', 'serve', 'entrust'] as const;
export type InkEdition = (typeof inkEditions)[number];
export const inkActions: Record<InkEdition, string> = {
  exhibit: 'Pin up the trail of evidence',
  serve: 'Arrange help for this shift',
  entrust: 'Give the witness custody',
};
export type InkCommand = { type: 'WorkSecondInk'; site: string } & (
  | { work: 'set'; tool: InkTool; index: number }
  | { work: 'pull' }
  | { work: 'turn' | 'read' | 'challenge' | 'answer' | 'carry' | 'compare' | 'visit' }
  | { work: 'sign'; tool: InkTool; edition: InkEdition }
);
type State = Pick<CampaignState, 'flags' | 'mapId'>;
export const inkKey = (k: InkCase, suffix: string) => 'secondink.' + k.site + '.' + suffix;
const value = (s: State, k: InkCase, suffix: string) => s.flags[inkKey(k, suffix)];
const bit = (s: State, k: InkCase, suffix: string) => Number(value(s, k, suffix)) || 0;
const put = (k: InkCase, key: string, v: FlagValue): Effect => ({ setFlag: inkKey(k, key), value: v });
const methodOK = (t: unknown): t is InkTool => inkTools.some((m) => m === t);
const editionOK = (t: unknown): t is InkEdition => inkEditions.some((m) => m === t);
const seats = [0, 1, 2];
const has = (mask: number, i: number) => (mask & (1 << i)) !== 0;
const flagsSet = (mask: number) => seats.filter((i) => has(mask, i));
export function inkSetup(s: State, k: InkCase) {
  const tool = value(s, k, 'tool');
  return {
    tool: methodOK(tool) ? tool : 'slip',
    index: Math.max(0, Math.min(2, bit(s, k, 'index'))),
    back: value(s, k, 'back') === true,
    depth: Math.min(2, bit(s, k, 'depth')),
  };
}
export function triedInk(s: State, k: InkCase, t: InkTool, back = false) {
  return flagsSet(bit(s, k, 'tried.' + t + (back ? '.back' : '.front')));
}
export function inkProof(s: State, k: InkCase, t: InkTool) {
  return triedInk(s, k, t).length >= 2;
}
export function inkEdition(s: State, k: InkCase) {
  const edition = value(s, k, 'edition'),
    tool = value(s, k, 'signedTool');
  if (!editionOK(edition) || !methodOK(tool)) return;
  const mask = bit(s, k, 'signature');
  return { edition, tool, samples: flagsSet(mask), stamp: edition + '/' + tool + '/' + mask };
}
export function carriedInk(s: State) {
  const site = inkCases.find((k) => k.site === s.flags['secondink.pocket']);
  if (!site) return;
  const edition = s.flags['secondink.pocket.edition'],
    tool = s.flags['secondink.pocket.tool'];
  if (!editionOK(edition) || !methodOK(tool)) return;
  return { site, edition, tool, samples: flagsSet(Number(s.flags['secondink.pocket.samples']) || 0) };
}
/** Each other chapter contributes at most once per method, even if the player revised its notice many times. */
export function inkRival(s: State, k: InkCase) {
  const practice = inkTools
    .map((tool) => ({
      tool,
      sites: inkCases.filter((o) => o.site !== k.site && value(s, o, 'used.' + tool) === true),
    }))
    .sort((a, b) => b.sites.length - a.sites.length);
  const familiar = practice[0],
    level = familiar.sites.length >= 4 ? 2 : familiar.sites.length >= 2 ? 1 : 0;
  return { tool: familiar.tool, level, cases: familiar.sites };
}
/** An accepted challenge keeps the conditions its reader saw even as a later chapter changes. */
export function inkChallenge(s: State, k: InkCase) {
  const tool = value(s, k, 'rival.tool'),
    level = value(s, k, 'rival.level');
  return methodOK(tool) && (level === 1 || level === 2) ? { tool, level } : undefined;
}
export function inkAnswer(s: State, k: InkCase) {
  const rival = inkChallenge(s, k);
  if (!rival) return false;
  const front = triedInk(s, k, rival.tool);
  if (front.length < 2) return false;
  const counter =
    rival.tool === 'cord'
      ? front.length === 3
      : triedInk(s, k, rival.tool, true).some((i) => front.includes(i));
  return (
    counter &&
    (rival.level === 1 || inkTools.some((tool) => tool !== rival.tool && inkProof(s, k, tool)))
  );
}
export const challengeLines: Record<InkTool, string> = {
  slip: '“Move your sheet and a scratch moves with it. Turn the sheet over at that same peg. A mark made on the bed can outlast both impressions.”',
  cord: '“You traced two voices. Somebody tied a third cord on the other side of the hook. Follow it to the fingers at its far end.”',
  bell: '“I kept yesterday’s shutters. Open one at the same bell on each shift. Notice which hands were there to see it.”',
};
export const inkHours = ['first bell', 'middle bell', 'last bell'];
const nubs = ['left', 'middle', 'right'];
export function inkObservation(k: InkCase, tool: InkTool, index: number, back = false) {
  if (tool === 'cord') {
    const writer = k.writers[k.origin[index]];
    return (
      k.desks[index] +
      ' → ' +
      (k.origin[index] === 0 ? 'round bone hook' : 'square brass hook') +
      ' → ' +
      writer +
      '.'
    );
  }
  if (tool === 'slip') {
    const markMoves = k.fixed === 'paper',
      col = markMoves ? index + 1 : 2;
    if (back && markMoves)
      return (
        'At the ' + nubs[index] + ' peg the back of the sheet is blank. The pinhole stays at notch 4.'
      );
    return (
      'At the ' +
      nubs[index] +
      ' peg, ' +
      k.mark +
      ' sits at notch ' +
      col +
      '. The pinhole stays at notch 4.'
    );
  }
  const schedule = back ? k.older : k.tide;
  const names = k.writers.filter((_, i) => schedule[i] === index);
  return (
    (back ? 'Previous shift, ' : 'This shift, ') +
    inkHours[index] +
    '. ' +
    (names.length
      ? 'The shutter catches the ' + names.join(' and the ') + '.'
      : 'An open shutter. Both positions are empty.')
  );
}
export function inkReadout(s: State, k: InkCase) {
  const { tool, index, back, depth } = inkSetup(s, k);
  if (tool === 'cord' && depth < 2)
    return depth === 0
      ? 'A loose end at the ' + k.desks[index] + '.'
      : 'The cord from the ' +
          k.desks[index] +
          ' turns on a ' +
          (k.origin[index] === 0 ? 'round bone hook.' : 'square brass hook.');
  return inkObservation(k, tool, index, back);
}
export function inkPaper(s: State, k: InkCase) {
  const setup = inkSetup(s, k);
  // The bed stays in place when paper moves. Flipping the sheet hides a mark carried on its face.
  return {
    notch: setup.back && k.fixed === 'paper' ? undefined : k.fixed === 'bed' ? 2 : setup.index + 1,
    pin: 4,
  };
}
export function inkComparison(s: State, k: InkCase) {
  const carried = carriedInk(s),
    { tool, index, back } = inkSetup(s, k);
  if (
    !carried ||
    carried.site.site === k.site ||
    !carried.samples.length ||
    !triedInk(s, k, tool, back).includes(index)
  )
    return;
  return {
    carried,
    here: inkObservation(k, tool, index, back),
    there: inkObservation(carried.site, carried.tool, carried.samples[0]),
  };
}
export function inkEffects(s: State, c: InkCommand): Effect[] {
  const k = inkCases.find((x) => x.site === c.site);
  if (!k || s.mapId !== k.room) throw Error('Find the gold moth inside this chapter’s Night Register.');
  const setup = inkSetup(s, k);
  switch (c.work) {
    case 'set':
      if (!methodOK(c.tool) || !seats.includes(c.index))
        throw Error('Pick a marked position on the worktable.');
      return [
        put(k, 'tool', c.tool),
        put(k, 'index', c.index),
        put(k, 'depth', 0),
        ...(setup.tool !== c.tool ? [put(k, 'back', false)] : []),
      ];
    case 'turn':
      if (setup.tool === 'cord') throw Error('Unwind this cord to the person at the far end.');
      return [put(k, 'back', !setup.back)];
    case 'pull':
      if (setup.tool !== 'cord' || setup.depth >= 2)
        throw Error('Take a fresh end from the three cords.');
      return [put(k, 'depth', setup.depth + 1)];
    case 'read': {
      if (setup.tool === 'cord' && setup.depth !== 2)
        throw Error('Pull the cord past the hook to its source.');
      const tag = 'tried.' + setup.tool + (setup.back ? '.back' : '.front');
      const mask = bit(s, k, tag) | (1 << setup.index);
      return [
        put(k, tag, mask),
        ...(!setup.back && flagsSet(mask).length >= 2 ? [put(k, 'proof.' + setup.tool, true)] : []),
      ];
    }
    case 'challenge': {
      const r = inkRival(s, k);
      if (!r.level) throw Error('Agate needs two notices you checked the same way in different places.');
      return [
        put(k, 'rival.tool', r.tool),
        put(k, 'rival.level', r.level),
        put(
          k,
          'rival.from',
          r.cases
            .slice(0, 4)
            .map((x) => x.site)
            .join(','),
        ),
      ];
    }
    case 'answer': {
      const r = inkChallenge(s, k);
      if (!r || !inkAnswer(s, k))
        throw Error(
          'Try the comparison in Agate’s margin. Your ordinary notice can go out at any time.',
        );
      return [put(k, 'answered.' + r.tool, r.level), put(k, 'answered', true)];
    }
    case 'sign': {
      if (!editionOK(c.edition) || !methodOK(c.tool) || !inkProof(s, k, c.tool))
        throw Error('Keep readings from two different positions on the same tool before signing.');
      return [
        put(k, 'edition', c.edition),
        put(k, 'signedTool', c.tool),
        put(k, 'signature', bit(s, k, 'tried.' + c.tool + '.front')),
        put(k, 'used.' + c.tool, true),
      ];
    }
    case 'visit': {
      const e = inkEdition(s, k);
      if (!e) throw Error('A signed notice brings the people to this corner.');
      return [
        put(k, 'delivered', true),
        put(k, 'receivedStamp', e.stamp),
        put(k, 'received.' + e.edition, true),
      ];
    }
    case 'carry': {
      const e = inkEdition(s, k);
      if (!e || value(s, k, 'receivedStamp') !== e.stamp)
        throw Error('Visit the people using this notice before folding it for the road.');
      return [
        { setFlag: 'secondink.pocket', value: k.site },
        { setFlag: 'secondink.pocket.edition', value: e.edition },
        { setFlag: 'secondink.pocket.tool', value: e.tool },
        { setFlag: 'secondink.pocket.samples', value: bit(s, k, 'signature') },
      ];
    }
    case 'compare': {
      const both = inkComparison(s, k);
      if (!both)
        throw Error(
          'Bring a folded notice from another chapter and record the reading presently on the bench.',
        );
      return [put(k, 'compared', true), put(k, 'compared.from', both.carried.site.site)];
    }
  }
}
export const inkWeave: Record<InkTool | InkEdition | 'answer', Weave> = {
  slip: {
    concepts: ['objectivity', 'evidence', 'interpretation', 'explanation'],
    framework: ['methods-and-tools', 'scope'],
    aoks: ['NAT', 'ART', 'TEC'],
    subjects: ['physics', 'visual-arts', 'design-tech'],
    atl: ['thinking', 'research'],
  },
  cord: {
    concepts: ['justification', 'certainty', 'truth', 'perspective', 'evidence'],
    framework: ['methods-and-tools', 'perspectives'],
    aoks: ['HIS', 'HUM', 'LAN'],
    subjects: ['history', 'lang-langlit', 'digital-society'],
    atl: ['research', 'communication'],
  },
  bell: {
    concepts: ['objectivity', 'explanation', 'certainty', 'perspective'],
    framework: ['scope', 'methods-and-tools'],
    aoks: ['MAT', 'HUM', 'NAT'],
    subjects: ['math-ai', 'physics', 'psychology'],
    atl: ['thinking', 'research'],
  },
  exhibit: {
    concepts: ['truth', 'interpretation', 'power', 'justification'],
    framework: ['ethics', 'perspectives'],
    aoks: ['HIS', 'ART', 'POL'],
    subjects: ['history', 'global-politics', 'visual-arts'],
    atl: ['social', 'communication'],
  },
  serve: {
    concepts: ['responsibility', 'values', 'justification', 'certainty'],
    framework: ['ethics', 'scope'],
    aoks: ['HUM', 'POL'],
    subjects: ['economics', 'global-politics'],
    atl: ['social', 'thinking'],
  },
  entrust: {
    concepts: ['responsibility', 'perspective', 'power', 'culture'],
    framework: ['ethics', 'perspectives'],
    aoks: ['HIS', 'LAN', 'HUM'],
    subjects: ['anthropology', 'lang-langlit'],
    atl: ['social', 'communication'],
  },
  answer: {
    concepts: ['justification', 'evidence', 'explanation', 'certainty', 'truth'],
    framework: ['scope', 'methods-and-tools', 'perspectives'],
    aoks: ['HIS', 'NAT', 'HUM'],
    subjects: ['philosophy', 'history', 'physics'],
    atl: ['research', 'self-management'],
  },
};
export function inkDiary(s: State, c: InkCommand) {
  const k = inkCases.find((x) => x.site === c.site)!;
  const p = inkSetup(s, k),
    e = inkEdition(s, k),
    r = inkChallenge(s, k),
    x = inkComparison(s, k);
  let topic: keyof typeof inkWeave = p.tool,
    text: string,
    key: string = c.work;
  switch (c.work) {
    case 'set':
      text =
        'I moved to ' +
        pressNames[p.tool].toLowerCase() +
        ' at ' +
        (p.tool === 'bell'
          ? inkHours[p.index]
          : p.tool === 'cord'
            ? k.desks[p.index]
            : nubs[p.index] + ' peg') +
        '.';
      key += '.' + p.index;
      break;
    case 'turn':
      text =
        p.tool === 'slip'
          ? 'I turned the sheet over and kept the peg fixed.'
          : 'I exchanged the two shifts and kept the bell fixed.';
      key += '.' + p.index + '.' + Number(p.back);
      break;
    case 'pull':
      text = 'I followed the cord one stage. ' + inkReadout(s, k);
      key += '.' + p.index + '.' + p.depth;
      break;
    case 'read':
      text = 'I kept this impression. ' + inkReadout(s, k);
      key += '.' + p.index + '.' + Number(p.back);
      break;
    case 'challenge':
      topic = 'answer';
      text = 'I accepted Agate’s folded counterproof. ' + challengeLines[r!.tool];
      key += '.' + r!.tool + '.' + r!.level;
      break;
    case 'answer':
      topic = 'answer';
      text = 'I brought Agate the comparison she asked for. ' + counterResult(s, k);
      key += '.' + r!.tool + '.' + r!.level;
      break;
    case 'sign':
      topic = c.edition;
      text = 'I signed with ' + pressNames[c.tool].toLowerCase() + '. ' + inkActions[c.edition] + '.';
      key += '.' + c.tool;
      break;
    case 'visit':
      topic = e!.edition;
      text = 'I went round to the people using the notice. ' + k[e!.edition];
      break;
    case 'carry':
      topic = e!.edition;
      text =
        'I folded a slip from “' +
        k.title +
        '”. Inside it I kept the source of the reading and who received it.';
      break;
    case 'compare':
      topic = 'answer';
      text =
        'I unfolded “' +
        x!.carried.site.title +
        '” beside “' +
        k.title +
        '”. On the old slip I found ' +
        x!.there +
        ' On this one I found ' +
        x!.here;
      key += '.' + x!.carried.site.site + '.' + p.tool + '.' + p.index;
      break;
  }
  return diaryEvent(
    'secondink:' + topic + ':' + k.site + ':' + key,
    'tool',
    'secondink.' + k.site,
    k.title,
    text,
    {},
    'after-break',
  );
}
export function counterResult(s: State, k: InkCase) {
  const r = inkChallenge(s, k);
  if (!r) return '';
  if (r.tool === 'cord')
    return (
      'The three paths reach ' +
      new Set(k.origin).size +
      ' original witnesses. One witness supplied more than one desk.'
    );
  if (r.tool === 'slip')
    return k.fixed === 'paper'
      ? 'The mark disappeared on the back while the pinhole held still.'
      : 'The mark stayed under a turned sheet at the same notch on the bed.';
  const fixed = triedInk(s, k, 'bell').find((i) => triedInk(s, k, 'bell', true).includes(i));
  return fixed === undefined
    ? ''
    : inkObservation(k, 'bell', fixed) + ' ' + inkObservation(k, 'bell', fixed, true);
}
