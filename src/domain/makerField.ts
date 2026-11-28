import { makerTrialForReading, makerTrialForTool, type MakerTrial } from '../content/makerTrials';
import { diaryEvent } from './adventureEvents';
import { cannotRead } from './readings';
import type { CampaignState, Effect } from './types';

type Side = 0 | 1;
export type MakerCommand = { type: 'WorkMakerInstrument'; tool: string } & (
  | { action: 'test'; mount: Side; standard: Side }
  | { action: 'fit'; mount: Side; method: Side }
);
export type FieldCommand = { type: 'WorkTownReading'; reading: string } & (
  | { action: 'observe'; surface: Side }
  | { action: 'shade'; source: Side; include: boolean }
  | { action: 'hand'; recipient: Side }
);
type State = Pick<CampaignState, 'mapId' | 'flags' | 'inventory'>;
const write = (setFlag: string, value: string | number | boolean): Effect => ({
  setFlag,
  value,
});
const side = (n: unknown) => n === 0 || n === 1;
const key = (t: MakerTrial, part: string) => 'maker.' + t.tool + '.' + part;
export function makerMarks(s: State, t: MakerTrial, mount: Side) {
  const marks = s.flags[key(t, 'marks' + mount)];
  return typeof marks === 'number' && Number.isInteger(marks) && marks >= 0 && marks <= 3 ? marks : 0;
}
export function installedMakerFit(s: State, t: MakerTrial) {
  if (s.flags['craft.' + t.tool + '.calibrated'] !== true) return;
  const raw = s.flags[key(t, 'fit')];
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 1 || raw > 4) return;
  return { mount: ((raw - 1) % 2) as Side, method: (raw >= 3 ? 1 : 0) as Side };
}
export function makerSample(t: MakerTrial, mount: Side, standard: Side) {
  if (t.tool === 'reed-pen') {
    const marks = [
      [
        'The three has a dark join. Its ends remain apart.',
        'The seven has a dark join. The long bar remains visible.',
      ],
      [
        'There is a hairline gap at the turn of the three. Both curves remain visible.',
        'A small gap splits the downstroke of the seven. Its bar still stands clear.',
      ],
    ];
    return {
      reference: standard ? '7' : '3',
      reading: mount
        ? standard
          ? '7 with a gap'
          : '3 with a gap'
        : standard
          ? '7 with a dark join'
          : '3 with a dark join',
      note: marks[mount][standard] + ' Oduya traces the mark back to its matching cut on the standard slip.',
    };
  }
  const water = t.tool === 'rain-gauge';
  const reference = water ? (standard ? 10 : 5) : standard ? 2 : 0;
  const difference = water ? (mount ? -1 : 2) : mount ? -1 : 1;
  const unit = water ? ' divisions' : ' finger-widths';
  return {
    reference: String(reference) + unit,
    reading: String(reference + difference) + unit,
    note:
      'At this reference the ' +
      (water ? 'strip' : 'plate') +
      ' reads ' +
      Math.abs(difference) +
      (Math.abs(difference) === 1 ? ' division' : ' divisions') +
      (difference < 0 ? ' below' : ' above') +
      ' the cut. The reference stays where the keeper marked it.',
  };
}
export function fittedMakerLine(t: MakerTrial, mount: Side, method: Side) {
  if (t.tool === 'reed-pen')
    return (
      (method ? 'The two samples hang beside the pen. ' : 'The depth stop repeats the tested cut. ') +
      (mount
        ? 'The reader can recognise the fine gap in the stroke.'
        : 'The reader can recognise the thick join in the stroke.')
    );
  const err = t.tool === 'rain-gauge' ? (mount ? -1 : 2) : mount ? -1 : 1;
  const difference = Math.abs(err) + (Math.abs(err) === 1 ? ' division' : ' divisions');
  if (method)
    return (
      'The tag reads “' +
      (err > 0 ? 'subtract ' : 'add ') +
      difference +
      '”. Both tested cuts agree after that correction.'
    );
  return (
    'The new zero sits ' +
    difference +
    (err > 0 ? ' above' : ' below') +
    ' the old zero. Both tested reference points now read directly.'
  );
}
function encodedFit(s: State, t: MakerTrial) {
  const fit = installedMakerFit(s, t);
  return fit ? 1 + fit.mount + 2 * fit.method : 0;
}
export function fieldObservation(s: State, t: MakerTrial, surface: Side) {
  const stored = s.flags[key(t, 'seen' + surface)];
  const code =
    typeof stored === 'number' && Number.isInteger(stored) && stored >= 0 && stored <= 4
      ? stored
      : encodedFit(s, t);
  const fit = code ? { mount: (code - 1) % 2, method: Math.floor((code - 1) / 2) } : undefined;
  if (t.tool === 'rain-gauge') {
    if (surface)
      return 'Noa’s dated tally has 41, 48 and 44 mm at this stake on the three flood nights she marked. It covers neither all floods nor today’s rain upstream.';
    const raw = 9 + (fit?.mount === 1 ? -1 : 2);
    return fit
      ? 'The raw strip reads ' +
          raw +
          ' mm. ' +
          (fit.method ? 'The correction tag brings it to 9 mm.' : 'The reset zero reads 9 mm.') +
          ' This catch is from one night at the tea table.'
      : 'The checked cup reads 9 mm from one night at the tea table.';
  }
  if (t.tool === 'plumb-line') {
    if (surface)
      return 'The old notch lies one finger-width from the same door edge. Maren’s button still lies in the plaster beside it. The dated rubbing is fifty years old.';
    return (
      (fit?.method === 1 ? 'The knotted tag corrects the bracket. ' : 'The checked line settles. ') +
      'The stone sits one finger-width from the line at the upper edge of this door. The joint above it is out of reach.'
    );
  }
  if (surface)
    return 'Venn’s father recorded a flood in 357. His tally does not name this post. Venn puts his own name beside the link he remembers.';
  return (
    (fit?.method === 1
      ? 'At the edge I compare my pen strokes with the sample strip. '
      : 'Under the side light I copy each surviving stroke. ') +
    'The post gives 3 · ? · 7. Nothing on the rubbing supplies the middle figure.'
  );
}
export function makerLimitMask(s: State, t: MakerTrial) {
  const v = s.flags[key(t, 'limits')];
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3 ? v : 0;
}
export function makerLimits(t: MakerTrial, mask: number) {
  const tower = t.tool === 'plumb-line';
  const value = tower ? 0 : 9;
  const radius = (mask & 1 ? 0.5 : 0) + (mask & 2 ? 0.5 : 0);
  const unit = tower ? ' finger-widths' : ' mm';
  const drawn = radius ? value - radius + ' to ' + (value + radius) + unit : value + unit;
  const sources = tower
    ? [
        'The new edge can be read within half a finger-width.',
        'The old notch is half a finger-width wide on either side of its centre.',
      ]
    : [
        'The catch can be read to within half a millimetre.',
        'The reference ring adds at most half a millimetre to the correction.',
      ];
  const meaning =
    mask === 3
      ? 'The two limits can pull in opposite directions. This band allows both extremes.'
      : mask
        ? 'One limit is drawn. The other is still on the table.'
        : 'Only the centre is drawn. Both margins are folded away.';
  return {
    drawn,
    sources,
    meaning,
    labels: tower
      ? ['Shade the new edge', 'Shade the old notch']
      : ['Shade the catch reading', 'Shade the reference ring'],
  };
}
export function fieldReceipt(s: State, t: MakerTrial) {
  const recipient = makerRecipient(s, t);
  if (recipient === undefined) return;
  const mask = s.flags[key(t, 'sent-limits')];
  const range =
    typeof mask === 'number' && Number.isInteger(mask) && mask >= 0 && mask <= 3
      ? makerLimits(t, mask)
      : undefined;
  return t.replies[recipient] + (range ? ' On the slip: ' + range.drawn + '. ' + range.meaning : '');
}
export function makerEffects(s: State, c: MakerCommand | FieldCommand): Effect[] {
  if (s.mapId !== 'aethelgard.emberford') throw Error('Return to Emberford to use this instrument.');
  if (c.type === 'WorkMakerInstrument') {
    const t = makerTrialForTool(c.tool);
    if (!t || !s.inventory['item.' + t.tool]) throw Error('Make the tool at Hesper’s bench first.');
    if (!side(c.mount)) throw Error('Choose a mounting face.');
    if (c.action === 'test') {
      if (!side(c.standard)) throw Error('Lay one of the two references on the bench.');
      return [write(key(t, 'marks' + c.mount), makerMarks(s, t, c.mount) | (1 << c.standard))];
    }
    if (!side(c.method) || makerMarks(s, t, c.mount) !== 3)
      throw Error('Try both references at this mounting before fitting the tool.');
    return [write(key(t, 'fit'), 1 + c.mount + 2 * c.method), write('craft.' + t.tool + '.calibrated', true)];
  }
  const t = makerTrialForReading(c.reading);
  if (!t) throw Error('Find a field instrument in Emberford.');
  const blocked = cannotRead(s, t.reading);
  if (blocked) throw Error(blocked);
  if (c.action === 'observe') {
    if (!side(c.surface)) throw Error('Choose a surface to inspect.');
    return [write(key(t, 'seen' + c.surface), encodedFit(s, t))];
  }
  if (c.action === 'shade') {
    if (
      t.tool === 'reed-pen' ||
      !side(c.source) ||
      typeof c.include !== 'boolean' ||
      !observedFieldSide(s, t, 0) ||
      !observedFieldSide(s, t, 1)
    ) {
      throw Error('Lay both numeric observations on the rail before shading their limits.');
    }
    const bit = 1 << c.source,
      old = makerLimitMask(s, t),
      mask = c.include ? old | bit : old & ~bit;
    const effects = [write(key(t, 'limits'), mask), write(key(t, 'band' + mask), true)];
    if (
      (mask === 1 && s.flags[key(t, 'band3')] === true) ||
      (mask === 3 && s.flags[key(t, 'band1')] === true)
    )
      effects.push(write(key(t, 'compared-bounds'), true));
    return effects;
  }
  if (!side(c.recipient) || [0, 1].some((i) => !observedFieldSide(s, t, i as Side)))
    throw Error('Bring the two observations together before passing them on.');
  const first = s.flags['reading.' + t.reading] !== true;
  return [
    write(key(t, 'recipient'), c.recipient),
    write(
      key(t, 'sent-limits'),
      t.tool === 'reed-pen' || s.flags[key(t, 'limits')] === undefined ? false : makerLimitMask(s, t),
    ),
    ...(first
      ? [write('reading.' + t.reading, true), { addNum: 'count.readings', by: 1 }, { addMarks: 4 }]
      : []),
  ];
}
export function observedFieldSide(s: State, t: MakerTrial, side: Side) {
  const v = s.flags[key(t, 'seen' + side)];
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4;
}
export function makerRecipient(s: State, t: MakerTrial) {
  const r = s.flags[key(t, 'recipient')];
  return r === 0 || r === 1 ? r : undefined;
}
export function makerDiary(s: State, c: MakerCommand | FieldCommand) {
  if (c.type === 'WorkMakerInstrument') {
    const t = makerTrialForTool(c.tool)!;
    const sample = c.action === 'test' && makerSample(t, c.mount, c.standard);
    const tail = c.action === 'test' ? c.standard : c.method;
    const line = sample
      ? 'I tried “' +
        t.mounts[c.mount] +
        '”. Reference ' +
        sample.reference +
        '. On my tool: ' +
        sample.reading +
        '. ' +
        sample.note
      : 'I chose “' + t.seals[tail] + '”. ' + fittedMakerLine(t, c.mount, tail);
    return diaryEvent(
      'maker-trial:' + t.tool + ':' + c.action + ':' + c.mount + tail,
      'tool',
      'maker.' + t.tool,
      'At Hesper’s bench',
      line,
      {},
      'after-break',
    );
  }
  const t = makerTrialForReading(c.reading)!;
  if (c.action === 'shade') {
    const mask = makerLimitMask(s, t),
      limits = makerLimits(t, mask);
    return diaryEvent(
      'maker-field:' + t.reading + ':limits:' + mask,
      'tool',
      'maker.' + t.tool,
      'The shaded edges',
      'I laid out the possible readings. ' + limits.drawn + '. ' + limits.meaning,
      {},
      'after-break',
    );
  }
  const observation = c.action === 'observe';
  const i = observation ? c.surface : c.recipient;
  return diaryEvent(
    'maker-field:' + t.reading + ':' + c.action + ':' + i + (observation ? ':' + encodedFit(s, t) : ''),
    observation ? 'tool' : 'choice',
    'maker.' + t.tool,
    observation ? t.surfaces[i] : t.gifts[i],
    observation
      ? 'I tried “' + t.surfaces[i] + '”. ' + fieldObservation(s, t, i)
      : 'I chose “' + t.gifts[i] + '”. ' + fieldReceipt(s, t),
    {},
    'after-break',
  );
}
