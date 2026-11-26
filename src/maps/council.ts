/** Civic timekeeping takes place beside a separate historical reading gallery. */
import type { Condition } from '../domain/types';
import { COUNCIL_ACCESSIONS } from './pairedAccessions';
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
const teamReady: Condition = { objective: 'council.arrival' };
const teamStarted: Condition = { flagSet: 'council.team.workflow' };
const teamUnposted: Condition = { not: { flagSet: 'council.team.edition' } };
const teamActive: Condition = { all: [teamStarted, teamUnposted] };
const teamRelay: Condition = { flag: 'council.team.edition', eq: 'relay' };
const useLightScreen: Condition = { all: [teamReady, { flag: 'perspective.active', eq: 'folding-light-screen' }] };

function teamScene(id: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id: `council-team-${id}`, node: `council.team.${id}`, kind: 'scene', x, y, w: 1, h: 1,
    label, art, visibleIf, walkThrough: true };
}

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
    teamScene('brief', 7, 9, 'Hale’s practice packet bench', 'preserved.folder', { all: [teamReady, { not: teamStarted }] }),
    { ...teamScene('clip', 8, 10, 'Hesper’s clip and practice packet', 'preserved.folder', teamActive),
      artOpen: { key: 'preserved.display-paired', if: { flag: 'council.team.clipped', eq: true } } },
    sign('council-team-original', 25, 11, 'Hale’s independently signed practice docket', 'council.record',
      'Hale signed before the trial call. For this practice run, bring the copy to the low bench at the next bell. This docket gives no time for the open hearing.',
      { flag: 'council.team.original', visibleIf: teamStarted }),
    teamScene('receive', 20, 8, 'Kip’s far-side bench', 'copies.strip',
      { all: [teamActive, { flag: 'council.team.called', eq: true }] }),
    sign('council-team-relay-bench', 20, 8, 'the runner and copy at the far bench', 'preserved.display-paired',
      'Kip waits while the reader says back the bell and the place. Hale’s signed practice docket sits beside the slip. The rota leaves a hand short at the copying desk during this turn.',
      { flag: 'council.team.seen', visibleIf: teamRelay }),
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
    ...COUNCIL_ACCESSIONS,
    sign('council-optics-letter', 6, 7, 'the dated optics record', 'council.optics',
      'Ibn al-Haytham, Book of Optics, early eleventh century. He tested explanations of light and sight with experiments. The archive uses that method card beside its own clock cases.',
      { flag: 'council.optics.read' }),
    sign('council-mill-letter', 14, 7, 'the dated comparison record', 'council.letter',
      'John Stuart Mill, On Liberty, 1859, chapter 2. Mill argued that a belief can be true and still need serious challenge so people understand its reasons.',
      { flag: 'council.mill.read' }),
    sign('council-folded-ramp-proof', 8, 12, 'Lark’s unfolded sample on the Council rack', 'copies.reprint',
      'Lark’s whole order helped the queue. His note says the outer stalls had to wait. The Council put a question on the rack: who sees a correction before they set out?',
      { flag: 'council.team.read.copies', visibleIf: { flag: 'copies.margin.sent', eq: 'fold' } }),
    sign('council-paired-ramp-proof', 8, 12, 'Lark’s clipped sample on the Council rack', 'preserved.display-paired',
      'Lark’s linked strips reached the outer stalls. His note marks one where the clip failed. The Council put a question on the rack: when a correction travels, who checks that its limit travels too?',
      { flag: 'council.team.read.copies', visibleIf: { flag: 'copies.margin.sent', eq: 'pair' } }),
    sign('council-held-ramp-proof', 8, 12, 'Lark’s note about the held print run', 'preserved.folder',
      'The landing crew called the turns until a checked sheet arrived. They were one hand short at the hoist. The Council put a question on the rack: who does the work while a notice waits?',
      { flag: 'council.team.read.copies', visibleIf: { flag: 'copies.margin.sent', eq: 'wait' } }),
    sign('council-repair-tokens', 12, 13, 'Emberford’s matched pickup stubs', 'preserved.display-paired',
      'The paired stubs let the repair yard check a collection while keeping fee waivers inside. The Council asked its own desk to try the same pair before making the fee slate public.',
      { flag: 'council.team.read.repair', visibleIf: { flag: 'repair.queue.receipt', eq: 'paired' } }),
    sign('council-repair-relay', 12, 13, 'the Emberford relay ticket', 'copies.strip',
      'Hana’s relay carried the pickup request around the market and kept the fee inside. A Council clerk pinned up a roster for the people who would have to make that extra trip.',
      { flag: 'council.team.read.repair', visibleIf: { flag: 'repair.queue.receipt', eq: 'relay' } }),
    sign('council-repair-rota', 12, 13, 'the Emberford appointment rota', 'ledger',
      'Emberford kept private appointments for repairs. A Council runner added the next hours to the gallery copy for anyone who missed the first slot.',
      { flag: 'council.team.read.repair', visibleIf: { flag: 'repair.queue.receipt', eq: 'leave' } }),
    sign('council-creek-rail', 13, 10, 'the Living Forest rail-case note', 'council.record',
      'An observer crossed the creek by the rail after checking the high-water mark. A clerk filed the note with the date and a reminder to check the path after the next storm.',
      { visibleIf: { all: [{ objective: 'forest.spate.crossed' }, { flag: 'forest.spate.route', eq: 'rail' }] } }),
    sign('council-creek-bend', 13, 10, 'the Living Forest cart-case note', 'council.record',
      'An observer used the sheltered cart bend. The Council kept the higher crossing on the diagram for comparison. Each arrow gives the conditions when that path was checked.',
      { visibleIf: { all: [{ objective: 'forest.spate.crossed' }, { flag: 'forest.spate.route', eq: 'bend' }] } }),
    sign('council-quay-lamp', 17, 15, 'the Quay’s staffed lamp rota', 'voices.lamp',
      'The quay bench had a host during an extra turn. The Council filed the host rota beside the closing rule. It shows who made the welcome possible on that shift.',
      { visibleIf: { flag: 'cross.last-lamp', eq: 'quay' } }),
    sign('council-room-lamp', 17, 15, 'the Quay’s note for indoor visitors', 'voices.guide',
      'The welcome moved indoors and the old lamp signal stayed with the quay rules. The Council hung the route slip at eye level so late guests could plan where they would wait.',
      { visibleIf: { flag: 'cross.last-lamp', eq: 'room' } }),
    sign('council-deferred-lamp', 17, 15, 'the Quay’s morning keeper card', 'voices.permission',
      'The quay keeper held the original closing time. The Council filed the morning card beside it. A later check can ask who was able to return for the promised welcome.',
      { visibleIf: { flag: 'cross.last-lamp', eq: 'defer' } }),
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
    { id: 'council-shadow-board', kind: 'fieldgame', game: 'council-shadow-board', x: 28, y: 7, w: 1, h: 1,
      label: 'the bell shadow board with two lamp sockets', art: 'coast.clear-frame', walkThrough: true, visibleIf: useLightScreen },
    { id: 'council-optics-handover', kind: 'scene', node: 'council.optics.post', x: 29, y: 7, w: 1, h: 1,
      label: 'Essi’s practice notice rack', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [{ objective: 'council.optics.compare' }, { not: { flagSet: 'council.optics.plan' } }] } },
    sign('council-optics-ramp', 28, 12, 'the double check at the ramp rest', 'preserved.display-paired',
      'An off-notch pointer is a change you can check directly. A shadow by itself can move when just the lamp moves. The carrier sets down a load and looks at the notch before joining the line.',
      { flag: 'council.optics.received', visibleIf: { flag: 'council.optics.plan', eq: 'ramp' } }),
    sign('council-optics-rail', 21, 13, 'the two-part call at the rail', 'council.relay',
      'At the opening bell, the rail pair calls where the pointer sits, then where the shadow falls. The carrier repeats both. The next shift is marked beside the call.',
      { flag: 'council.optics.received', visibleIf: { flag: 'council.optics.plan', eq: 'rail' } }),
    { ...teamScene('call', 10, 9, 'Sefa’s place at the speaking rail', 'council.relay',
      { all: [teamActive, { flag: 'council.team.clipped', eq: true }] }),
      artOpen: { key: 'stage.cues', if: { flag: 'council.team.called', eq: true } } },
    { ...teamScene('check', 18, 13, 'Rook’s space for two separate records', 'preserved.slip',
      { all: [teamActive, { flag: 'council.team.received', eq: true }] }),
      artOpen: { key: 'council.record', if: { flag: 'council.team.checked', eq: true } } },
    teamScene('set', 14, 15, 'Essi’s place for the checked practice pair', 'preserved.display-paired',
      { all: [{ objective: 'council.team.trial' }, teamUnposted] }),
    sign('council-team-table', 14, 15, 'the checked pair on the low board', 'preserved.display-records',
      'The signed practice heading, next bell and low bench sit on one sheet. A visitor can put their bundle down and check each line. A keeper can read it aloud when they are free.',
      { flag: 'council.team.seen', visibleIf: { flag: 'council.team.edition', eq: 'table' } }),
    sign('council-team-relay-call', 10, 9, 'the relay call beside the speaking rail', 'council.relay',
      'At the next bell, bring the signed practice copy to the low bench. Sefa calls the line and points to Kip’s bench in the Time Hall. The runner asks you to follow the slip.',
      { visibleIf: teamRelay }),
    ...[
      ['copies', 'Lark’s print note sits in a corner of the practice proof. The team learned where a short slip might lose its limit. Hale’s separate docket gives this trial’s bell.'],
      ['repair', 'An Emberford pickup mark sits beside the practice proof. Hesper uses it to join the reply to its source. The fee slate stays with the workshop. Hale’s separate docket gives this trial’s bell.'],
      ['fresh', 'Hesper clipped a blank strip at this bench. The strip puts the place and bell together. Hale’s separate docket gives this trial’s bell.'],
    ].map(([workflow, text]) => sign(`council-team-workflow-${workflow}`, 12, 15, 'the practice proof’s source slip', 'preserved.slip', text,
      { visibleIf: { all: [{ flagSet: 'council.team.edition' }, { flag: 'council.team.workflow', eq: workflow }] } })),
  ],
  lights: [
    { x: 6, y: 7, r: 66, color: 0xf8cfa3 }, { x: 14, y: 7, r: 65, color: 0xd7c6e3 },
    { x: 24, y: 9, r: 79, color: 0xf2d6a3 }, { x: 23, y: 12, r: 56, color: 0xd9d9be },
    { x: 27, y: 11, r: 51, color: 0xd6c4e1 },
  ],
};
