/** Fictional workshops for comparing sample panels and following their records. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

type Workshop = Pick<MapDef, 'id' | 'name' | 'width' | 'height' | 'background' | 'spawn'
  | 'npcs' | 'interactables' | 'stamps' | 'lights'>;

function workshop(plan: Workshop): MapDef {
  return {
    ...plan,
    world: 'WORLD-07', music: 'music.town', ambience: 'study',
    floor: (x, y) => {
      if (x < 1 || y < 0 || x >= plan.width - 1 || y >= plan.height) return null;
      if (y === 0) return 'wall-top';
      if (y === 1) return 'wall-mid';
      if (y === 2) return 'wall-base';
      return 'stone-c';
    },
    blocks: [[1, 0, plan.width - 2, 3]], zones: [],
  };
}

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art: 'metalworks.waypost' };
}

function paper(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

export const METALWORKS_YARD = workshop({
  id: 'metalworks.yard', name: 'Metalworks: Sample Yard', width: 26, height: 16,
  background: 0x342930, spawn: { x: 12, y: 12 },
  npcs: [{ id: 'metal-inspector', x: 12, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 7, y: 1 }, { stamp: 'window', x: 17, y: 1 },
    { stamp: 'cabinet', x: 2, y: 3 }, { stamp: 'cabinet', x: 21, y: 3 },
    { stamp: 'forge', x: 4, y: 5 }, { stamp: 'forge', x: 20, y: 6 },
    { stamp: 'long-table', x: 7, y: 9 }, { stamp: 'long-table', x: 16, y: 9 },
    { stamp: 'crates', x: 2, y: 12 }, { stamp: 'crates', x: 21, y: 12 },
    { stamp: 'barrel', x: 4, y: 9 }, { stamp: 'bench', x: 17, y: 12 },
  ],
  interactables: [
    { id: 'cross-furnace', kind: 'fieldgame', game: 'cross-furnace', x: 17, y: 5, w: 1, h: 1, label: 'the furnace dial by Brindle\'s shovel (a crossing)', art: 'signpost' },
    door('metal-records-path', 12, 3, 'the passage to the trade hall', { map: 'metalworks.records', x: 11, y: 12 }),
    { ...door('metal-nexus-return', 12, 15, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 22, y: 16 }),
      art: 'preserved.door' },
    { id: 'metal-yard-waystone', kind: 'waystone', x: 8, y: 13, w: 1, h: 1, label: 'the yard Waystone',
      place: 'the Sample Yard', art: 'waystone' },
    { id: 'metal-trial-panel-a', kind: 'metal-trial', node: 'panel-a', x: 8, y: 8, w: 1, h: 1,
      label: 'the Panel A test stand', art: 'metalworks.panel-a' },
    { id: 'metal-trial-panel-b', kind: 'metal-trial', node: 'panel-b', x: 17, y: 8, w: 1, h: 1,
      label: 'the Panel B test stand', art: 'metalworks.panel-b' },
    paper('metal-yard-directory', 13, 11, 'the Sample Yard directory', 'metalworks.waypost',
      'Sample Yard. Panel A is west, Panel B east. The inspector works between them. The passage north leads to the trade hall.'),
    paper('metal-weight-tag', 14, 8, 'the seller’s matched-weight tag', 'metalworks.receipt',
      'MATCHED WEIGHT. The two blue panels fit the same frame. A buyer asks whether the scale agrees.',
      { visibleIf: { not: { objective: 'metal.compare' } } }),
    paper('metal-weight-correction', 14, 8, 'the corrected weight tag', 'preserved.slip',
      'SAME FRAME. Different weights: A reads two units and B reads four. The seller clips the measured readings over the old heading.',
      { visibleIf: { objective: 'metal.compare' } }),
    paper('metal-custody-intake', 5, 11, 'the Box A intake receipt', 'metalworks.receipt',
      'Box A. The intake clerk recorded a glazed mineral panel from the mineral shop. The maker field stays blank.',
      { flag: 'metal.custody.intake' }),
    { id: 'metal-tag-bench', kind: 'scene', node: 'metal.tag.bench', x: 9, y: 11, w: 1, h: 1, walkThrough: true,
      label: 'the practice tag stand', art: 'metalworks.receipt',
      artBy: { flag: 'metal.tag.last', keys: { turn: 'preserved.slip', replace: 'preserved.folder' } },
      visibleIf: { objective: 'metal.finish' } },
    paper('metal-tag-fit-key', 6, 11, 'the fitting shop’s key', 'metalworks.receipt',
      'The fitting shop puts a triangle on a tag once a piece fits the frame. An apprentice still brings the surface to the coating shop for its own check.',
      { flag: 'metal.tag.fit-key', visibleIf: { objective: 'metal.finish' } }),
    paper('metal-tag-handoff-yard', 10, 13, 'the paired notes at the handover', 'metalworks.window',
      'Try either tag on the same cord. Compare the hole before and after. Our fitting shop’s triangle means “fit checked”. At the coating shop it means “surface to check”. The old trip note gives only direction and colour.',
      { visibleIf: { flag: 'metal.tag.mount', eq: 'yard' } }),
    { id: 'metal-witness-bind', kind: 'scene', node: 'metal.witness.bind', x: 14, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the sleeve tray and its unused tally strip', art: 'metalworks.receipt',
      visibleIf: { not: { flagSet: 'metal.witness.use' } } },
    paper('metal-witness-yard-count', 6, 12, 'the clean practice sleeves at the yard', 'metalworks.panel-a',
      'Four clean packing sleeves stand beside the empty sleeves rack. The marked strip keeps these four slots apart from the two that go to the hall. Each sleeve can take a practice piece again here.',
      { flag: 'metal.witness.yard', visibleIf: { all: [{ flagSet: 'metal.witness.use' }, { not: { flagSet: 'metal.witness.layout' } }] } }),
    paper('metal-witness-local-yard', 6, 12, 'the next packing run’s local stock', 'metalworks.panel-a',
      'All four clean sleeves are back on the yard stand for the next run. A second line counts the two torn sleeves now held at the hall for repair. The yard crew keeps both entries.',
      { flag: 'metal.witness.local-yard', visibleIf: { flag: 'metal.witness.layout', eq: 'local' } }),
    { id: 'metal-exhibition-model', kind: 'scene', node: 'metal.exhibit.turn', x: 11, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the practice ring on a fixed base', art: 'board-stand',
      visibleIf: { all: [{ card: 'card.metal.astrolabe' }, { not: { flagSet: 'metal.exhibit.view' } }] } },
    paper('metal-exhibition-index', 11, 10, 'the turned ring at the fixed mark', 'preserved.context',
      'The pointer moved from the upper peg to the side peg. The base stayed on the same chalk line. These are positions you set on the practice stand, without a reading from the sky.',
      { flag: 'metal.exhibit.index', visibleIf: { all: [{ flag: 'metal.exhibit.view', eq: 'turned' }, { not: { flagSet: 'metal.exhibit.layout' } }] } }),
    { id: 'metal-exhibition-bench', kind: 'scene', node: 'metal.exhibit.bench', x: 11, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the learner’s low practice bench', art: 'board-stand',
      visibleIf: { all: [{ flag: 'metal.exhibit.layout', eq: 'bench' }, { not: { flagSet: 'metal.exhibit.learner' } }] } },
    paper('metal-exhibition-bench-used', 11, 10, 'the learner’s repeat mark', 'preserved.display-paired',
      'A learner turned the practice ring back to the upper peg and repeated the move to the side peg. The base line gives the next person a place to start over.',
      { visibleIf: { all: [{ flag: 'metal.exhibit.layout', eq: 'bench' }, { flagSet: 'metal.exhibit.learner' }] } }),
  ],
  lights: [
    { x: 5, y: 8, r: 62, color: 0xf8ba78, flicker: true }, { x: 20, y: 8, r: 62, color: 0xefaa86, flicker: true },
    { x: 8, y: 8, r: 53, color: 0xd9d9b9 }, { x: 17, y: 8, r: 53, color: 0xd9d9b9 },
    { x: 12, y: 13, r: 53, color: 0xc3d5dc },
  ],
});

export const METALWORKS_RECORDS = workshop({
  id: 'metalworks.records', name: 'Metalworks: Trade Hall', width: 23, height: 15,
  background: 0x27343b, spawn: { x: 11, y: 12 },
  npcs: [{ id: 'metal-steward', x: 11, y: 5, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 16, y: 2 }, { stamp: 'window', x: 19, y: 2 },
    { stamp: 'bookshelf', x: 3, y: 3 }, { stamp: 'bookshelf', x: 7, y: 3 },
    { stamp: 'cabinet', x: 2, y: 8 }, { stamp: 'crates', x: 19, y: 11 },
    { stamp: 'bench', x: 4, y: 11 }, { stamp: 'long-table', x: 16, y: 7 },
    { stamp: 'rug-green', x: 10, y: 9 },
  ],
  interactables: [
    door('metal-yard-return', 11, 14, 'the passage back to the Sample Yard', { map: 'metalworks.yard', x: 12, y: 5 }),
    { id: 'metal-exhibition-case', kind: 'exhibit', exhibit: 'OBJ-MET-ASTROLABE', x: 5, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'the museum entry for Musa’s spherical astrolabe', art: 'preserved.catalogue' },
    paper('metal-custody-repair', 18, 10, 'the Box B repair slip', 'metalworks.receipt',
      'Box B. The repair crew put the coated metal panel back into the box it arrived in. The label stays with the box. This slip begins here at the yard.',
      { flag: 'metal.custody.repair' }),
    paper('metal-custody-return', 15, 11, 'the transfer docket', 'preserved.folder',
      'Boxes A and B went from the yard to the trade hall on the same cart. The docket names the carrier and both box letters. It begins at the yard.',
      { flag: 'metal.custody.return', visibleIf: { flagSet: 'metal.response' } }),
    paper('metal-response-window', 17, 7, 'the comparison in the window', 'metalworks.window',
      'Blue panels, two different weights. The shop records distinguish Panel A from Panel B. An empty clip waits for a source that names a maker.',
      { visibleIf: { flag: 'metal.response', eq: 'window' } }),
    paper('metal-response-ledger', 6, 7, 'the separate register pages', 'ledger',
      'Two records, two labelled boxes. Each panel keeps its shop or repair description beside the weight taken at the yard.',
      { visibleIf: { flag: 'metal.response', eq: 'ledger' } }),
    paper('metal-followup-notice', 11, 8, 'the dated transfer addition', 'preserved.slip',
      'The transfer docket confirms that both panels travelled together from the yard to the hall. The maker field stays open.',
      { visibleIf: { flag: 'metal.followup', eq: true } }),
    paper('metal-large-copy', 8, 11, 'the reader’s large copy', 'preserved.display-records',
      'The large copy puts the shop descriptions, box letters and weights on separate lines. The open maker field stays in view.',
      { visibleIf: { flag: 'metal.large-copy', eq: true } }),
    paper('metal-tag-coat-key', 20, 7, 'the coating shop’s key', 'preserved.slip',
      'At the coating bench we tag a piece with a triangle when the surface needs another look. When a finish passes, the tag comes off.',
      { flag: 'metal.tag.coat-key', visibleIf: { objective: 'metal.finish' } }),
    paper('metal-tag-transfer-note', 12, 11, 'the older trip note', 'preserved.folder',
      'Same blue at both ends of the trip. Triangle pointed right in the yard and left at the hall. Space to sketch the tag hole is blank.',
      { flag: 'metal.tag.transfer', visibleIf: { objective: 'metal.finish' } }),
    { id: 'metal-tag-explanation-clips', kind: 'scene', node: 'metal.tag.place', x: 12, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'Bea’s explanation clips', art: 'metalworks.receipt', visibleIf: { objective: 'metal.tag.compared' } },
    paper('metal-tag-handoff-hall', 7, 8, 'the two explanations beside the index', 'ledger',
      'First run: the old hole stays with a turned tag. Second run: the fresh tag leaves a clean hole. Keep the fitting rule and the coating rule with the slips. The trip note leaves the hole unrecorded.',
      { visibleIf: { flag: 'metal.tag.mount', eq: 'hall' } }),
    paper('metal-witness-hall-count', 14, 9, 'the two torn sleeves by the hall ledger', 'metalworks.receipt',
      'The hall tray holds the two torn sleeves. Its “two returned” entry is part of the original six. The workmark leaves four other slots beside the yard label.',
      { flag: 'metal.witness.hall', visibleIf: { all: [{ flagSet: 'metal.witness.use' }, { not: { flagSet: 'metal.witness.layout' } }] } }),
    { id: 'metal-witness-choose', kind: 'scene', node: 'metal.witness.choose', x: 13, y: 9, w: 1, h: 1, walkThrough: true,
      label: 'the window for moving the return trays', art: 'board-stand',
      visibleIf: { all: [{ objective: 'metal.witness.compare' }, { not: { flagSet: 'metal.witness.layout' } }] } },
    paper('metal-witness-local-hall', 14, 9, 'the small repair tray in the hall', 'metalworks.receipt',
      'Two torn sleeves need repair. The clean sleeves stayed in the yard for the next run. The hall keeps a separate line for this tray so these two get entered once.',
      { flag: 'metal.witness.local-hall', visibleIf: { flag: 'metal.witness.layout', eq: 'local' } }),
    paper('metal-witness-shared', 14, 9, 'the shared sorting stand in the hall', 'metalworks.window',
      'One cart load brought six sleeves. Four wait here clean for the next scheduled yard return. Two wait for repair. The two open trays make all six visible without counting the cart load as a seventh entry.',
      { flag: 'metal.witness.shared-hall', visibleIf: { flag: 'metal.witness.layout', eq: 'shared' } }),
    { id: 'metal-exhibition-mount', kind: 'scene', node: 'metal.exhibit.mount', x: 17, y: 5, w: 1, h: 1, walkThrough: true,
      label: 'the two display stands for the ring study', art: 'metalworks.window',
      visibleIf: { all: [{ objective: 'metal.exhibit.scope' }, { not: { flagSet: 'metal.exhibit.layout' } }] } },
    paper('metal-exhibition-bench-pointer', 17, 5, 'the pointer to the practice bench', 'metalworks.receipt',
      'Run the practice ring in the Sample Yard. Musa’s museum entry stays open here. The hall does not take a current sky reading from the model.',
      { visibleIf: { flag: 'metal.exhibit.layout', eq: 'bench' } }),
    { id: 'metal-exhibition-window', kind: 'scene', node: 'metal.exhibit.window', x: 17, y: 5, w: 1, h: 1, walkThrough: true,
      label: 'two demonstration views beside the window', art: 'metalworks.window',
      visibleIf: { all: [{ flag: 'metal.exhibit.layout', eq: 'window' }, { not: { flagSet: 'metal.exhibit.learner' } }] } },
    paper('metal-exhibition-window-used', 17, 5, 'the checked base line at the window', 'preserved.display-paired',
      'Two views share a base line. A reader can compare the movement here and go to the yard to repeat it. The views remain a record of chosen placements.',
      { visibleIf: { all: [{ flag: 'metal.exhibit.layout', eq: 'window' }, { flagSet: 'metal.exhibit.learner' }] } }),
    { id: 'metal-exhibition-packet', kind: 'scene', node: 'metal.exhibit.pack', x: 18, y: 13, w: 1, h: 1, walkThrough: true,
      label: 'the carrier’s two pocket docket', art: 'metalworks.receipt',
      visibleIf: { all: [{ flagSet: 'metal.exhibit.layout' }, { not: { flagSet: 'metal.exhibit.carrier' } }] } },
    paper('metal-exhibition-packet-ready', 18, 13, 'the packet checked for the next learner', 'preserved.slip',
      'The outside pocket names the practice ring, base and clip. The inside pocket holds the source reference for Musa’s instrument and its date. The carrier has a packing count and the next reader can find the museum entry.',
      { visibleIf: { flagSet: 'metal.exhibit.carrier' } }),
  ],
  lights: [
    { x: 6, y: 7, r: 62, color: 0xead1a8 }, { x: 17, y: 7, r: 68, color: 0xb7dbe1 },
    { x: 11, y: 12, r: 54, color: 0xd3d5a7 },
  ],
});
