/** Civic timekeeping takes place beside a separate historical reading gallery. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>, art = 'council.waypost'): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

function ground(width: number, height: number, tile: (x: number, y: number) => string) {
  return (x: number, y: number) => x < 1 || y < 0 || x >= width - 1 || y >= height ? null : tile(x, y);
}

const compared: Condition = { objective: 'council.compare' };
const published: Condition = { objective: 'council.publish' };

export const COUNCIL_HALL: MapDef = {
  id: 'council.hall', name: 'Council of Inquiry: Time Hall', world: 'WORLD-16',
  width: 29, height: 18, music: 'music.archive', ambience: 'study', background: 0x353d54,
  floor: ground(29, 18, (x, y) => {
    if (y < 3) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    return (x >= 11 && x <= 17) || y === 10 || y === 11 ? 'council-inlay' : 'council-blue';
  }),
  blocks: [[1, 0, 27, 3]], zones: [], spawn: { x: 12, y: 12 },
  npcs: [{ id: 'council-keeper', x: 12, y: 7, facing: 'down' },
    // The rival comes to the Council (docs/STORY_BIBLE.md sections 6 and 7).
    { id: 'vesper-quill', x: 17, y: 13, facing: 'left', visibleIf: { all: [{ objective: 'council.arrival' }, { flag: 'harrowmere.found', eq: true }] } }],
  stamps: [
    { stamp: 'council-timing-wall', x: 11, y: 2 }, { stamp: 'council-clock-shelf', x: 3, y: 4 },
    { stamp: 'council-clock-shelf', x: 23, y: 4 }, { stamp: 'council-lamp', x: 9, y: 5 },
    { stamp: 'council-lamp', x: 18, y: 5 }, { stamp: 'window', x: 6, y: 1 },
    { stamp: 'window', x: 21, y: 1 }, { stamp: 'council-bench', x: 5, y: 12 },
    { stamp: 'council-bench', x: 21, y: 13 }, { stamp: 'market-planter', x: 7, y: 14 },
  ],
  interactables: [
    door('council-gallery-path', 24, 9, 'the passage to the letters and bell rail', { map: 'council.gallery', x: 6, y: 14 }),
    door('council-nexus-return', 13, 15, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 37, y: 12 }, 'preserved.door'),
    { id: 'council-clock', kind: 'council-clock', x: 15, y: 9, w: 1, h: 1,
      label: 'the watch and the reference drum', art: 'council.clock' },
    { id: 'council-hall-waystone', kind: 'waystone', x: 9, y: 12, w: 1, h: 1,
      label: 'the Time Hall Waystone', place: 'Time Hall', art: 'waystone' },
    sign('council-draft', 18, 9, 'the draft watch instruction', 'preserved.slip',
      'A WATCH THAT MATCHES THE RAIL AT A GLANCE IS WORKING. The instruction leaves only one box for a time reading.',
      { visibleIf: { not: compared } }),
    sign('council-checked', 18, 9, 'the checked watch instruction', 'council.record',
      'A stopped watch can match the reference at one moment. Read both dials at the opening mark and return a minute later. Keep the two readings together.',
      { visibleIf: compared }),
    sign('council-shelf-tag', 6, 8, 'the shelf of waiting instruments', 'council.waypost',
      'Some cases are here for a spring, some for a new dial, and some for a timing check. This tag leaves a separate line for each reason.'),
    sign('council-repair-record', 11, 10, 'the dated repair seal', 'council.record',
      'Last signed test, day 8 noon shift. Rail drum 12:00, then 12:01. Workshop watch 12:00, then 12:01. The seal covers the signed shift. An undated or broken seal sends the crew back to the rail.',
      { flag: 'council.repair.read' }),
    sign('council-low-slot', 21, 10, 'the low slot for the practice dial', 'council.clock',
      'The low slot has room to park a handcart and turn a dial. A person arriving alone misses the shared handover at the rail.',
      { flag: 'council.bench.slot' }),
    sign('council-bench-slot', 21, 12, 'the loan dial at the low slot', 'council.record',
      'The spare dial is in the low slot where a dock helper parks a handcart. They can ask the keeper what set each mark when they arrive. They miss the crew check at handover.',
      { flag: 'council.bench.used', visibleIf: { flag: 'council.bench.layout', eq: 'slot' } }),
  ],
  lights: [
    { x: 15, y: 9, r: 80, color: 0xffdda8 }, { x: 18, y: 9, r: 62, color: 0xd6d1ed },
    { x: 6, y: 8, r: 55, color: 0xe8b6aa }, { x: 24, y: 9, r: 50, color: 0xc7cee9 },
    { x: 13, y: 14, r: 55, color: 0xc3c7e2 },
  ],
};

export const COUNCIL_GALLERY: MapDef = {
  id: 'council.gallery', name: 'Council of Inquiry: Letter Gallery and Bell Rail', world: 'WORLD-16',
  width: 32, height: 19, music: 'music.archive', ambience: 'study', background: 0x4d4256,
  floor: ground(32, 19, (x, y) => {
    if (y < 3) return y === 0 ? 'wall-top' : y === 1 ? 'wall-mid' : 'wall-base';
    if (x >= 19 && y >= 7) return y <= 10 ? 'council-riser' : 'council-court';
    return (x >= 10 && x <= 17) || (y >= 12 && y <= 14) ? 'council-gallery-runner' : 'council-purple';
  }),
  blocks: [[1, 0, 30, 3]], zones: [], spawn: { x: 6, y: 14 },
  npcs: [{ id: 'council-reader', x: 20, y: 11, facing: 'down' }],
  stamps: [
    { stamp: 'council-letter-niche', x: 4, y: 3 }, { stamp: 'council-letter-niche', x: 12, y: 3 },
    { stamp: 'council-bell-rail', x: 22, y: 5 }, { stamp: 'council-lamp', x: 10, y: 7 },
    { stamp: 'council-rail-fence', x: 22, y: 7 },
    { stamp: 'council-lamp', x: 21, y: 8 }, { stamp: 'council-bench', x: 4, y: 10 },
    { stamp: 'council-bench', x: 25, y: 14 }, { stamp: 'market-planter', x: 16, y: 11 },
    { stamp: 'window', x: 8, y: 1 }, { stamp: 'window', x: 18, y: 1 }, { stamp: 'window', x: 27, y: 1 },
  ],
  interactables: [
    door('council-gallery-return', 4, 14, 'the passage back to the Time Hall', { map: 'council.hall', x: 23, y: 9 }),
    sign('council-optics-letter', 6, 7, 'the dated optics record', 'council.optics',
      'Ibn al-Haytham, Book of Optics, early eleventh century. He tested explanations of light and sight with experiments. The archive uses that method card beside its own clock cases.',
      { flag: 'council.optics.read' }),
    sign('council-mill-letter', 14, 7, 'the dated comparison record', 'council.letter',
      'John Stuart Mill, On Liberty, 1859, chapter 2. Mill argued that a belief can be true and still need serious challenge so people understand its reasons.',
      { flag: 'council.mill.read' }),
    sign('council-rail-record', 24, 9, 'the independent rail timing record', 'council.record',
      'The reference drum has its own mechanism. At the shutter, record its reading at the start and at the next minute. The watch does not set the drum.',
      { flag: 'council.rail.read' }),
    sign('council-crew-slate', 19, 8, 'the rail crew’s handover slate', 'council.letter',
      'At the rail handover, the crew says who made the timing mark. The next checker can ask how they set it.',
      { flag: 'council.bench.crew' }),
    sign('council-bench-rail', 18, 11, 'the loan dial at the shared handover', 'council.relay',
      'At the shared rail a dock helper can stand with the crew and ask who set the practice marks. They have to reach the rail during the handover.',
      { flag: 'council.bench.used', visibleIf: { flag: 'council.bench.layout', eq: 'rail' } }),
    sign('council-result-rail', 23, 12, 'the rail demonstration notice', 'council.clock',
      'At each shift start, a checker compares the watch with the independent drum at the opening mark and the next minute.',
      { visibleIf: { flag: 'council.response', eq: 'rail' } }),
    sign('council-result-record', 23, 12, 'the two-reading notice', 'council.record',
      'The docket gives the signed test’s shift, the drum used, and its two readings. An old, broken or undated seal sends the crew back to the independent rail for both marks.',
      { visibleIf: { flag: 'council.response', eq: 'record' } }),
    sign('council-reader-note', 27, 11, 'the ramp reader’s question', 'council.letter',
      'I can reach the ramp just before the delivery shutter falls. Where should I stand, and how do I hear or see both time marks before the shutter closes?',
      { flag: 'council.reader.read', visibleIf: published }),
    sign('council-shutter-view', 29, 9, 'the view from the delivery shutter', 'council.clock',
      'The two marks beside the shutter can be seen from the approach. The door muffles calls from the rail. A carrier can arrive with both hands full.',
      { flag: 'council.shutter.read', visibleIf: published }),
    sign('council-revised-relay', 26, 13, 'the spoken relay provision', 'council.relay',
      'Before the shutter closes, one checker calls the opening and next minute from the reference rail. The person on the ramp repeats the pair back.',
      { visibleIf: { flag: 'council.revision', eq: 'relay' } }),
    sign('council-revised-mark', 26, 13, 'the entrance time-window board', 'council.record',
      'The entrance board has two large time marks for the check window. Match the start and next minute against the separate reference drum before deliveries begin.',
      { visibleIf: { flag: 'council.revision', eq: 'mark' } }),
    sign('council-check-copy', 28, 15, 'the larger timing card beside the low bench', 'council.record',
      'The wider card gives the named checker, shift date, reference and two time marks their own lines. A reader can follow each mark while setting a load on the low bench.',
      { visibleIf: { flag: 'council.receipt.ready', eq: true } }),
  ],
  lights: [
    { x: 6, y: 7, r: 66, color: 0xf8cfa3 }, { x: 14, y: 7, r: 65, color: 0xd7c6e3 },
    { x: 24, y: 9, r: 79, color: 0xf2d6a3 }, { x: 23, y: 12, r: 56, color: 0xd9d9be },
    { x: 27, y: 11, r: 51, color: 0xd6c4e1 },
  ],
};
