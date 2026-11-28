import { diaryEvent } from './adventureEvents';
import type { CampaignState, Effect, Weave } from './types';

export const petalMap = 'forest.petal-house';
export const petalPaper = 'HIS-SILVERWEED-UV';
export const petalSight = 'HIS-ASU-ANIMAL-COLOUR';
export const petalPlate = 'HIS-REFERENCE-LINE-SURINAME-ENGRAVING';
export const flowerWeave: Weave = {
  concepts: [
    'evidence',
    'perspective',
    'interpretation',
    'objectivity',
    'certainty',
    'explanation',
  ],
  framework: ['scope', 'perspectives', 'methods-and-tools'],
  aoks: ['NAT', 'ART', 'MAT'],
  subjects: ['biology', 'physics', 'visual-arts', 'math-ai', 'dance'],
  atl: ['research', 'thinking', 'communication'],
  thinking: {
    dok: 3,
    bloom: 'analyse',
    fink: 'integration',
    solo: 'relational',
  },
  minutes: 6,
};
export type Band = 'day' | 'uv';
export type Gain = 1 | 2 | 4;
export type Flower = 'apron' | 'sleeve';
export const flowers: Flower[] = ['apron', 'sleeve'];
export const flowerLabel: Record<Flower, string> = {
  apron: 'Hem',
  sleeve: 'Cuff',
};
export type PetalMove =
  | { action: 'set-band'; band: Band }
  | { action: 'set-gain'; gain: Gain }
  | { action: 'sample'; flower: Flower }
  | { action: 'shelf'; place: 'left' | 'right' }
  | { action: 'watch' }
  | { action: 'flip-ink' }
  | { action: 'show'; ending: 'silk' | 'garden' }
  | { action: 'reply'; choice: 'first' | 'second' };
export type PetalCommand = { type: 'WorkPetalWindow' } & PetalMove;
export const flowerFlag = (part: string) => 'petal-window.' + part;
const flag = (part: string, value: string | boolean | number): Effect => ({
  setFlag: flowerFlag(part),
  value,
});
export const seen = (s: CampaignState, part: string) =>
  s.flags[flowerFlag(part)] === true;
export function light(s: CampaignState): { band: Band; gain: Gain } {
  const g = s.flags[flowerFlag('gain')];
  return {
    band: s.flags[flowerFlag('band')] === 'uv' ? 'uv' : 'day',
    gain: g === 4 || g === 2 ? g : 1,
  };
}
// Sixteen equal tiles from a square crop on each fictional costume study. Unit scale is relative return at gain one.
const uvCrops: Record<Flower, number[]> = {
  apron: [62, 60, 60, 62, 59, 12, 11, 61, 61, 12, 12, 59, 60, 62, 62, 60],
  sleeve: [62, 13, 14, 62, 13, 11, 12, 13, 14, 12, 11, 12, 60, 12, 13, 61],
};
export const printLegend = (sample: number) =>
  sample < 20 ? 'low' : sample < 50 ? 'middle' : 'high';
export function measure(flower: Flower, band: Band, gain: Gain) {
  const reflected =
    band === 'day' ? Array.from({ length: 16 }, () => 71) : uvCrops[flower];
  const cells = reflected.map((n) => Math.min(100, n * gain));
  return {
    cells,
    low: cells.filter((x) => printLegend(x) === 'low').length,
    clipped: cells.filter((x) => x === 100).length,
  };
}
export const printKey = (b: Band, g: Gain, f: Flower) =>
  'reading.' + b + '.' + g + '.' + f;
export const cardsMatch = (s: CampaignState, b: Band, g: Gain) =>
  flowers.every((f) => seen(s, printKey(b, g, f)));
export const usableContact = (s: CampaignState) =>
  cardsMatch(s, 'day', 1) && cardsMatch(s, 'uv', 1);
export const leftFlower = (s: CampaignState): Flower =>
  s.flags[flowerFlag('place')] === 'right' ? 'sleeve' : 'apron';
export const watched = (s: CampaignState) =>
  seen(s, 'watch.left') && seen(s, 'watch.right');
export function gardenTape(left: Flower) {
  // Each strip is a dated, fictional 90-second watch of the same ledge in a different hour.
  return left === 'apron'
    ? { time: '08:10', stops: ['left', 'left', 'right'], onHem: 2, onCuff: 1 }
    : { time: '09:10', stops: ['left', 'right', 'left'], onHem: 1, onCuff: 2 };
}
export const flowerEnding = (s: CampaignState) => {
  const e = s.flags[flowerFlag('ending')];
  return e === 'silk' || e === 'garden' ? e : undefined;
};
export const finaleLine = {
  silk: 'Viri dances both bees herself. The copper wings click when her left wrist bends. From the cheapest seat a child can see who is making both decisions.',
  garden:
    'Viri takes the roof off her little stage. Flowers occupy the best seats. Half the crowd follows a real visitor out of the theatre and half stays for the long empty minute.',
};
export const replyLines = {
  silk: {
    first:
      'Edda puts Viri’s bare hand in the spotlight before the silver bees rise. A child in the last row wiggles two fingers in reply.',
    second:
      'The understudy takes one wire. For a breath the two bees want different flowers. Viri takes a bow beside her.',
  },
  garden: {
    first:
      'Ayla gives the first bench to a child who has never seen a bee land. It stays empty this round. They paste the quiet round into the book together.',
    second:
      'Elian walks the people at the back to the garden wall. They mark a second watch beside the first. Nobody rings the bell to hurry the bees.',
  },
};
export function petalEffects(s: CampaignState, c: PetalCommand): Effect[] {
  if (c.action === 'reply') {
    const e = flowerEnding(s);
    if (!e || s.mapId !== flowerAfterMap(e))
      throw Error('Find the people preparing the next performance.');
    if (c.choice !== 'first' && c.choice !== 'second')
      throw Error('Choose who holds the next watch.');
    return [flag('reply.' + e, c.choice), flag('answered', e)];
  }
  if (s.mapId !== petalMap)
    throw Error(
      'The two flower crops and their viewing window are in the glasshouse.',
    );
  switch (c.action) {
    case 'set-band':
      if (c.band !== 'uv' && c.band !== 'day')
        throw Error('Choose a pane in the window.');
      return [flag('band', c.band)];
    case 'set-gain':
      if (![1, 2, 4].includes(c.gain))
        throw Error('Rest the handle in one of its three catches.');
      return [flag('gain', c.gain)];
    case 'sample': {
      if (!flowers.includes(c.flower))
        throw Error('Slide a named crop under the window.');
      const { band, gain } = light(s);
      const effects = [
        flag(printKey(band, gain, c.flower), true),
        flag('last', c.flower),
      ];
      if (band === 'uv' && gain === 1 && cardsMatch(s, 'uv', 4)) {
        effects.push(flag('recovered.' + c.flower, true));
      }
      return effects;
    }
    case 'shelf':
      if (c.place !== 'left' && c.place !== 'right')
        throw Error('Rest Hem on one of the ledge marks.');
      return [flag('place', c.place)];
    case 'flip-ink':
      if (!(s.inventory['item.nexus.shutter-pin'] > 0))
        throw Error(
          'The little hinge takes the brass pin from the two shutters.',
        );
      return [flag('reverse-ink', !seen(s, 'reverse-ink'))];
    case 'watch':
      return [
        flag('watch.' + (leftFlower(s) === 'apron' ? 'left' : 'right'), true),
      ];
    case 'show':
      if (c.ending !== 'garden' && c.ending !== 'silk')
        throw Error('Choose the field stage or the silk stage.');
      if (!usableContact(s) || !watched(s))
        throw Error(
          'Keep both crops at one turn of the handle in each light, then open both morning watches.',
        );
      return [flag('ending', c.ending), flag('performed.' + c.ending, true)];
  }
}
export const flowerAfterMap = (e: 'silk' | 'garden') =>
  e === 'silk' ? 'stage.rehearsal' : 'forest.community';
export function petalDiary(
  s: CampaignState,
  n: CampaignState,
  c: PetalCommand,
) {
  const base = 'petal-window:',
    { band, gain } = light(n);
  if (c.action === 'flip-ink')
    return diaryEvent(
      base + 'ink.' + seen(n, 'reverse-ink'),
      'tool',
      'petal.window',
      'The printer’s two faces',
      'I turned the ink roller with the shutter pin. The dark and light display inks changed places. The readings on the strip stayed the same.',
      {},
      'after-break',
    );
  if (c.action === 'sample') {
    const reading = measure(c.flower, band, gain),
      title =
        flowerLabel[c.flower] +
        ' in the ' +
        (band === 'uv' ? 'UV window' : 'daylight window');
    return diaryEvent(
      base + printKey(band, gain, c.flower),
      'tool',
      'petal.window',
      title,
      'I kept ' +
        title +
        '. At gain ' +
        gain +
        ' the detector printed ' +
        reading.low +
        ' low tiles of 16. ' +
        reading.clipped +
        ' tiles reached the upper stop.',
      { sourceIds: [petalSight, petalPaper] },
      'after-break',
    );
  }
  if (c.action === 'watch') {
    const left = leftFlower(n),
      t = gardenTape(left);
    return diaryEvent(
      base + 'tape.' + left,
      'tool',
      'petal.ledge',
      'The ' + t.time + ' garden watch',
      'I opened the ' +
        t.time +
        ' watch with ' +
        flowerLabel[left] +
        ' on the left. The three landings went ' +
        t.stops.join(', ') +
        '. The two watches also took place at different hours.',
      {},
      'after-break',
    );
  }
  if (c.action === 'show')
    return diaryEvent(
      base + c.ending,
      'choice',
      'petal.stage',
      'What Viri put on the bill',
      'I saw the company open the ' +
        (c.ending === 'silk' ? 'silk stage. ' : 'garden stage. ') +
        finaleLine[c.ending],
      {},
      'after-break',
    );
  if (c.action === 'reply') {
    const e = flowerEnding(s);
    if (e)
      return diaryEvent(
        base + e + '.' + c.choice,
        'conversation',
        'petal.stage',
        'The next performance',
        'I stayed to see who would take the next turn. ' +
          replyLines[e][c.choice],
        {},
        'after-break',
      );
  }
  if (c.action === 'set-gain' || c.action === 'set-band')
    return diaryEvent(
      base + 'window.' + band + '.' + gain,
      'tool',
      'petal.window',
      'Setting the little window',
      'I slid in the ' +
        (band === 'uv' ? 'UV' : 'daylight') +
        ' pane and set the detector gain to ' +
        gain +
        '.',
      {},
      { fixedToolPrefix: base + 'window.' },
    );
  if (c.action === 'shelf')
    return diaryEvent(
      base + 'ledge.' + c.place,
      'tool',
      'petal.ledge',
      'The sliding ledge',
      'I moved Hem to the ' +
        c.place +
        ' mark to find the corresponding morning watch.',
      {},
      { fixedToolPrefix: base + 'ledge.' },
    );
}
