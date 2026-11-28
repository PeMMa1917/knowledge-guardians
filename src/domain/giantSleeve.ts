import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export const elbowPaper = 'HIS-ASA-PVALUES';
export const hemLoft = 'stage.giants-elbow';
export const proofRoom = 'market.square';
export const receivingRoom = 'stage.rehearsal';
export const elbowKey = (part: string) => 'elbow.' + part;
export const casts = ['winter', 'summer'] as const;
export type Cast = (typeof casts)[number];
export const puppets = ['Pip, the baker', 'Oda, the fish seller', 'Lo, the big sister', 'Vee, the giant'];
const reaches: Record<Cast, number[]> = { winter: [19, 20, 20, 21], summer: [14, 17, 23, 26] };
export const elbowWeave: Weave = {
  concepts: ['evidence', 'objectivity', 'interpretation', 'values', 'responsibility', 'explanation'],
  framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
  aoks: ['MAT', 'ART', 'HUM'],
  subjects: ['math-ai', 'theatre', 'design-tech', 'psychology'],
  atl: ['thinking', 'communication', 'social'],
  thinking: { dok: 3, bloom: 'analyse', fink: 'integration', solo: 'relational' },
};
export function patchCount(mask: number) {
  return puppets.filter((_, i) => !!(mask & (1 << i))).length;
}
export function trySleeves(cast: Cast, mask: number) {
  return reaches[cast].map((reach, i) => {
    const joint = !!(mask & (1 << i));
    return { name: puppets[i], reach, joint, fits: joint || Math.abs(reach - 20) <= 1 };
  });
}
export type Sheet = 'chalk' | 'chalk-dust';
export type Tail = 'rise' | 'either';
export const sheets: Record<Sheet, { name: string; tenthMillimetres: number[]; threshold: number }> = {
  chalk: {
    name: 'The old hinge, six practice strips',
    tenthMillimetres: [10, 20, 30, 40, 50, 60],
    threshold: 35,
  },
  'chalk-dust': {
    name: 'The new hinge, six fine strips',
    tenthMillimetres: [31, 32, 33, 34, 35, 36],
    threshold: 40,
  },
};
export const stamps: string[] = [];
for (let i = 0; i < 4; i++)
  for (let j = i + 1; j < 5; j++)
    for (let k = j + 1; k < 6; k++) stamps.push('ABCDEF'[i] + 'ABCDEF'[j] + 'ABCDEF'[k]);
const indexOf = (c: string) => 'ABCDEF'.indexOf(c);
export function lotReading(sheet: Sheet, face: string, tail: Tail) {
  if (!stamps.includes(face)) throw Error('Set three different letters in the window.');
  const values = sheets[sheet].tenthMillimetres;
  // Twice the three-strip total minus the six-strip total is three times the difference of means.
  const balance = (mark: string) =>
    2 * [...mark].reduce((n, c) => n + values[indexOf(c)], 0) - values.reduce((a, b) => a + b, 0);
  const observed = balance('DEF');
  return {
    delta: balance(face) / 30,
    observed: observed / 30,
    allowed: stamps.length,
    rare: stamps.filter((m) =>
      tail === 'either' ? Math.abs(balance(m)) >= observed : balance(m) >= observed,
    ).length,
    qualifies: tail === 'either' ? Math.abs(balance(face)) >= observed : balance(face) >= observed,
    clears: [...'DEF'].filter((c) => values[indexOf(c)] >= sheets[sheet].threshold).length,
  };
}
const mark = (key: string, value: string | number | boolean): Effect => ({ setFlag: elbowKey(key), value });
export const elbowFlag = (s: CampaignState, key: string) => s.flags[elbowKey(key)];
export const currentCast = (s: CampaignState): Cast =>
  elbowFlag(s, 'cast') === 'summer' ? 'summer' : 'winter';
export const currentMask = (s: CampaignState) =>
  typeof elbowFlag(s, 'patches') === 'number' ? Number(elbowFlag(s, 'patches')) : 0;
export const currentSheet = (s: CampaignState): Sheet =>
  elbowFlag(s, 'sheet') === 'chalk-dust' ? 'chalk-dust' : 'chalk';
export const currentTail = (s: CampaignState): Tail =>
  elbowFlag(s, 'tail') === 'either' ? 'either' : 'rise';
export const currentStamp = (s: CampaignState) =>
  typeof elbowFlag(s, 'stamp') === 'string' && stamps.includes(String(elbowFlag(s, 'stamp')))
    ? String(elbowFlag(s, 'stamp'))
    : 'ABC';
export type ElbowCommand = { type: 'WorkGiantSleeve' } & (
  | { act: 'patch'; who: number }
  | { act: 'cast'; cast: Cast }
  | { act: 'fit' | 'hang' }
  | { act: 'pledge'; tail: Tail }
  | { act: 'sheet'; sheet: Sheet }
  | { act: 'stamp'; face: string }
  | { act: 'print' }
  | { act: 'hinge'; sheet: Sheet }
  | { act: 'scratch' }
  | { act: 'face'; face: 'writing' | 'seam' }
  | { act: 'cue'; when: 'first' | 'last' }
);
export function elbowEffects(s: CampaignState, c: ElbowCommand): Effect[] {
  const workshop = ['patch', 'cast', 'fit', 'hang'].includes(c.act);
  const finale = c.act === 'hinge' || c.act === 'face' || c.act === 'cue' || c.act === 'scratch';
  if (s.mapId !== (workshop ? hemLoft : finale ? receivingRoom : proofRoom))
    throw Error('Bring this work to the fitting loft, lottery counter or rehearsal floor where it belongs.');
  const cast = currentCast(s),
    mask = currentMask(s),
    sheet = currentSheet(s);
  const issue = String(elbowFlag(s, 'printedPattern')) + '.' + String(elbowFlag(s, 'printed'));
  if (!workshop && typeof elbowFlag(s, 'hung') !== 'number')
    throw Error('Hang a fitting tried with both casts before taking it down the hill.');
  if (finale && !elbowFlag(s, 'printed')) throw Error('Bring the two issued hinge readings to rehearsal.');
  switch (c.act) {
    case 'patch': {
      if (!Number.isInteger(c.who) || !puppets[c.who]) throw Error('Choose one of the four elbows.');
      const next = mask ^ (1 << c.who);
      if (patchCount(next) > 2) throw Error('There are two brass joints. Unpin one before moving it.');
      return [mark('patches', next)];
    }
    case 'cast':
      if (!casts.includes(c.cast)) throw Error('Roll out one of the two painted casts.');
      return [mark('cast', c.cast)];
    case 'fit':
      return [mark('fitted.' + cast + '.' + mask, true), mark('lastFit', cast + '.' + mask)];
    case 'hang':
      if (!casts.every((name) => elbowFlag(s, 'fitted.' + name + '.' + mask)))
        throw Error('Lower this very pattern over the winter and summer casts first.');
      return [mark('hung', mask)];
    case 'pledge':
      if (c.tail !== 'rise' && c.tail !== 'either') throw Error('Choose the direction you want to look for.');
      return [mark('tail', c.tail), ...(!elbowFlag(s, 'unsealed') ? [mark('promise', c.tail)] : [])];
    case 'sheet':
      if (!Object.hasOwn(sheets, c.sheet)) throw Error('Take one of the two six-strip packets.');
      if (!elbowFlag(s, 'promise'))
        throw Error('Peg a direction while the six measurements are still sealed.');
      return [mark('sheet', c.sheet), mark('unsealed', true)];
    case 'stamp': {
      if (!elbowFlag(s, 'promise')) throw Error('Peg a prediction before you turn the first stamp.');
      if (!stamps.includes(c.face)) throw Error('Choose one of the twenty possible assignments.');
      const tail = currentTail(s),
        prefix = 'tried.' + sheet + '.' + tail + '.';
      return [
        mark('stamp', c.face),
        mark('unsealed', true),
        mark(prefix + (lotReading(sheet, c.face, tail).qualifies ? 'extreme' : 'middle'), true),
      ];
    }
    case 'print': {
      const tail = currentTail(s);
      if (
        !(['chalk', 'chalk-dust'] as const).every((type) =>
          ['extreme', 'middle'].every((face) => elbowFlag(s, 'tried.' + type + '.' + tail + '.' + face)),
        )
      )
        throw Error(
          'On each packet turn one stamp that reaches the observed difference and another that falls inside it, using the same direction.',
        );
      return [mark('printed', tail), mark('printedPattern', elbowFlag(s, 'hung') as number)];
    }
    case 'hinge':
      if (!Object.hasOwn(sheets, c.sheet)) throw Error('Fit one of the two measured hinges to the hand.');
      return [mark('stageHinge', c.sheet)];
    case 'scratch':
      if (!elbowFlag(s, 'curve'))
        throw Error('Trace the Stoppages at the loft before trying the new gesture.');
      return [mark('scratch', true)];
    case 'face':
      if (c.face !== 'writing' && c.face !== 'seam')
        throw Error('Turn the sleeve to a face you can show the room.');
      return [mark('facing', c.face), mark('read.' + issue + '.' + c.face, true)];
    case 'cue':
      if (c.when !== 'first' && c.when !== 'last') throw Error('Choose an entrance for the giant.');
      if (!elbowFlag(s, 'read.' + issue + '.writing') || !elbowFlag(s, 'read.' + issue + '.seam'))
        throw Error('Turn the sleeve inside out before you give away the entrance.');
      return [
        mark('cue', c.when),
        mark('performedHinge', String(elbowFlag(s, 'stageHinge') ?? 'hand')),
        mark('performedFace', String(elbowFlag(s, 'facing'))),
        mark('performedTail', String(elbowFlag(s, 'printed'))),
        mark('performedPattern', Number(elbowFlag(s, 'printedPattern'))),
      ];
  }
}
export function elbowDiary(s: CampaignState, c: ElbowCommand) {
  const mask = currentMask(s),
    cast = currentCast(s),
    sheet = currentSheet(s),
    tail = currentTail(s);
  let title = '',
    line = '',
    edition = '';
  switch (c.act) {
    case 'patch':
      title = 'Two brass elbows';
      edition = String(mask);
      line = 'I unbuttoned the spare joints and left ' + patchCount(mask) + ' on the pattern.';
      break;
    case 'cast':
      title = 'A different set of arms';
      edition = cast;
      line = 'I unrolled the ' + cast + ' cast beside the twenty-centimetre sleeve.';
      break;
    case 'fit':
      title = 'The giant’s fitting';
      edition = cast + '.' + mask;
      line =
        'I lowered the paper sleeves. ' +
        trySleeves(cast, mask).filter((r) => r.fits).length +
        ' of the four ' +
        cast +
        ' puppets could join hands.';
      break;
    case 'hang':
      title = 'A paper giant over the road';
      edition = String(mask);
      line =
        'I sent the same hem we had tried on both casts down to the market. The two companies had the same mean reach.';
      break;
    case 'pledge': {
      const after = elbowFlag(s, 'unsealed') === true;
      title = after ? 'A second look at the draw' : 'What the hinge might do';
      edition = tail + '.' + (after ? 'open' : 'sealed');
      line =
        (after
          ? 'I looked again after seeing the slips. My first prediction remained stitched to the packet. '
          : 'I pinned a prediction before opening the packet. ') +
        (tail === 'rise' ? 'I counted rises in lift.' : 'I counted a difference in either direction.');
      break;
    }
    case 'sheet':
      title = 'Six slips in a packet';
      edition = sheet;
      line = 'I opened ' + sheets[sheet].name.toLowerCase() + ' at the lottery counter.';
      break;
    case 'stamp': {
      const report = lotReading(sheet, c.face, tail);
      title = 'A different draw of the three treated strips';
      edition = sheet + '.' + tail + '.' + c.face;
      line =
        'I set the treated labels on ' +
        c.face +
        '. The signed difference was ' +
        report.delta.toFixed(2) +
        ' mm. ' +
        report.rare +
        ' of the twenty possible draws reached the observed cutoff.';
      break;
    }
    case 'print':
      title = 'Two hinges for one entrance';
      edition = tail + '.' + String(elbowFlag(s, 'printedPattern'));
      line =
        'I sent the two lottery sheets to the stage. Their tail counts agreed, though only one set of treated strips cleared its own hinge.' +
        (elbowFlag(s, 'promise') === tail
          ? ' I kept the direction pinned before the draw.'
          : ' I attached my later reading beside the prediction already on the packet.');
      break;
    case 'hinge':
      title = 'A chain or a ribbon';
      edition = c.sheet;
      line =
        c.sheet === 'chalk'
          ? 'I fitted the old hinge. Its arm reached the catch and the paper moon rose.'
          : 'I fitted the fine hinge. The arm brushed the ribbon under the catch and a trail of tiny moons shook loose.';
      break;
    case 'scratch':
      title = 'A giant with an itch';
      edition = String(elbowFlag(s, 'printedPattern'));
      line =
        'I tucked the traced bend into the cuff. Vee scratched the shadow’s nose. A child threw a paper hat onto the stage for her to knock off next time.';
      break;
    case 'face':
      title = 'The inside of the costume';
      edition = c.face;
      line =
        c.face === 'writing'
          ? 'I turned the cuff to the words VEE ENTERS LAST. They were printed before Pip fell ill.'
          : 'I looked inside the cuff. Three left-hand knots showed where Vee had taken her sister’s place at the curtain.';
      break;
    case 'cue':
      title = 'The hand inside the shadow';
      edition =
        c.when +
        '.' +
        elbowFlag(s, 'performedFace') +
        '.' +
        elbowFlag(s, 'performedPattern') +
        '.' +
        elbowFlag(s, 'performedHinge');
      line =
        (c.when === 'first'
          ? 'I gave Vee the opening. She waited for Pip’s hand.'
          : 'I let Pip give the first cue from a chair. Vee took the final bow.') +
        (elbowFlag(s, 'performedFace') === 'seam'
          ? ' The children up front could see three old repair knots.'
          : ' The front row could read the old entrance cue on the cuff.') +
        (elbowFlag(s, 'performedHinge') === 'chalk'
          ? ' We raised the one paper moon.'
          : elbowFlag(s, 'performedHinge') === 'chalk-dust'
            ? ' A dozen little moons fell into open hands.'
            : ' We lifted the scenery by hand.');
      break;
  }
  return diaryEvent(
    'giant-elbow:' + c.act + '.' + edition,
    'tool',
    c.act === 'hinge' || c.act === 'face' || c.act === 'cue' || c.act === 'scratch'
      ? 'elbow.curtain'
      : c.act === 'print' || c.act === 'stamp' || c.act === 'sheet' || c.act === 'pledge'
        ? 'elbow.lottery'
        : 'elbow.fitting',
    title,
    line,
    {
      sourceIds:
        c.act === 'hinge' || c.act === 'print' || c.act === 'stamp'
          ? [elbowPaper]
          : c.act === 'scratch'
            ? ['HIS-MODEL-RECORD-stoppages']
            : [],
    },
    c.act === 'hang' || c.act === 'print' || c.act === 'cue'
      ? 'after-break'
      : { fixedToolPrefix: 'giant-elbow:' + c.act + '.' },
  );
}
