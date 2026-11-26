/** Fictional Guardian archive. Its rooms contain documentary evidence and original schematic illustrations. */
import type { Condition } from '../domain/types';
import { GLASS_RACK_DOOR } from './glassRack';
import { COLD_LINTEL } from './lintelFold';
import { WORKROOM_SEAM } from './seamWitness';
import { COLD_PAPER_LANDING } from './paperLanding';
import { CLEARANCE_DOOR } from './clearanceGallery';
import { BEATER_COLD_STORE, BEATER_WORKROOM_PRESS } from './beaterProof';
import { POLAR_ARCHIVE_PROPS } from './polarStore';
import { PERKINS_COLD_REVISIT } from './perkinsReturn';
import { sceneProp } from './sceneProps';
import type { Interactable, MapDef } from './types';

type ArchiveRoom = Pick<MapDef, 'id' | 'name' | 'width' | 'height' | 'background' | 'spawn'
  | 'npcs' | 'interactables' | 'stamps' | 'lights'>;

function room(plan: ArchiveRoom): MapDef {
  return {
    ...plan,
    world: 'WORLD-04',
    music: 'music.archive',
    ambience: 'study',
    floor: (x, y) => {
      if (x < 1 || x >= plan.width - 1 || y < 0 || y >= plan.height) return null;
      if (y === 0) return 'wall-top';
      if (y === 1) return 'wall-mid';
      if (y === 2) return 'wall-base';
      return 'stone-c';
    },
    blocks: [[1, 0, plan.width - 2, 3]],
    zones: [],
  };
}

function door(id: string, x: number, y: number, label: string, to: NonNullable<Interactable['to']>): Interactable {
  return { id, kind: 'door', x, y, w: 1, h: 1, label, art: 'preserved.door', to };
}

function record(id: string, x: number, y: number, label: string, art: string): Interactable {
  return { id: `preserved-case-${id.toLowerCase()}`, kind: 'exhibit', exhibit: `OBJ-PRES-${id}`, x, y, w: 1, h: 1, label, art };
}

function slip(thread: string, node: string, x: number, y: number, label: string, visibleIf: Condition): Interactable {
  return { id: `${thread}-${node}`, kind: 'thread', thread, node, x, y, w: 1, h: 1,
    label, art: 'preserved.slip', walkThrough: true, visibleIf };
}

function notice(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf?: Condition): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, visibleIf };
}

const displays = [
  ['records', 'the two record folders', 'preserved.display-records',
    'One folder follows the royal record. Another describes distinct Chinchorro sites. The headings share a wall and keep their own names, dates and limits.'],
  ['paired', 'the paired evidence display', 'preserved.display-paired',
    'The bridge between the panels asks what each document can show. Each side keeps its own place, date and caption. The two records stay different as you read across.'],
  ['delayed', 'the open questions board', 'preserved.display-delayed',
    'The panel waits here with its unanswered question clipped to the top. A visitor can still open either record folder and see what the archive has checked.'],
] as const;

const handoffAtColdStore: Condition = { all: [{ flag: 'preserved.arrived', eq: true }, { flagSet: 'nile.handoff.mode' }] };
const gaugeAtColdStore: Condition = { all: [{ flag: 'preserved.arrived', eq: true }, { item: 'item.folding-gauge' }] };
const gaugeUsed: Condition = { flag: 'lost.gauge.used', eq: true };

export const PRESERVED_ARCHIVE = room({
  id: 'preserved.archive', name: 'Preserved Lives: the Cold Store', width: 28, height: 17,
  background: 0x18242e, spawn: { x: 14, y: 14 },
  npcs: [
    { id: 'preserved-registrar', x: 14, y: 7, facing: 'down' },
    { id: 'handoff-nellis', x: 18, y: 10, facing: 'left', visibleIf: handoffAtColdStore },
    { id: 'nima-fenner', x: 7, y: 13, facing: 'right', visibleIf: { flag: 'preserved.arrived', eq: true } },
  ],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bookshelf', x: 23, y: 2 },
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'window', x: 16, y: 1 },
    { stamp: 'rug-green', x: 13, y: 9 },
    { stamp: 'bench', x: 5, y: 11 }, { stamp: 'bench', x: 21, y: 12 },
    { stamp: 'plant-tall', x: 2, y: 13 }, { stamp: 'plant-tall', x: 26, y: 13 },
  ],
  interactables: [
    CLEARANCE_DOOR,
    ...BEATER_COLD_STORE,
    GLASS_RACK_DOOR,
    ...POLAR_ARCHIVE_PROPS,
    ...PERKINS_COLD_REVISIT,
    ...COLD_PAPER_LANDING,
    { id: 'cross-warm-room', kind: 'fieldgame', game: 'cross-warm-room', x: 20, y: 5, w: 1, h: 1, label: 'the cooling fan in the record store (a crossing)', art: 'ledger' },
    door('preserved-door-royal', 5, 3, 'the Royal Records room', { map: 'preserved.royal', x: 12, y: 12 }),
    door('preserved-door-coast', 21, 3, 'the Chinchorro Records room', { map: 'preserved.coast', x: 12, y: 12 }),
    { ...door('preserved-door-inquiry', 24, 7, 'the review room', { map: 'preserved.inquiry', x: 8, y: 10 }),
      openIf: { flagSet: 'preserved.display' }, text: 'The review room opens after the first display goes up. The registrar has the two folders.' },
    { ...door('preserved-door-workroom', 24, 10, 'the reconstruction workroom', { map: 'preserved.workroom', x: 10, y: 11 }),
      openIf: { objective: 'preserved.publish' }, text: 'The printer will open the workroom when the first display is ready.' },
    { ...door('preserved-door-copper', 3, 8, 'the survey table room', { map: 'preserved.copper', x: 10, y: 11 }),
      openIf: { objective: 'preserved.publish' }, text: 'The keeper is waiting for the first display before opening the survey table.' },
    { ...door('preserved-door-gallery', 26, 10, 'the exhibition gallery', { map: 'preserved.gallery', x: 11, y: 12 }),
      openIf: { objective: 'preserved.publish' }, text: 'The gallery is closed until the Cold Store has shared its first display.' },
    door('preserved-door-nexus', 14, 16, 'the door back to the Nexus', { map: 'nexus.archive', x: 35, y: 15 }),
    { id: 'preserved-rest', kind: 'waystone', x: 9, y: 13, w: 1, h: 1, label: 'the Cold Store Waystone', place: 'the Cold Store', art: 'waystone' },
    notice('preserved-directory', 17, 13, 'the Cold Store directory', 'preserved.folder',
      'COLD STORE. The Royal Records room is on the left of the north wall. The Chinchorro Records room is on the right. The registrar works between the two rooms.'),
    { id: 'preserved-binak-case', kind: 'exhibit', exhibit: 'OBJ-PRES-BINAK-X104841', x: 10, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'Mikaela Rose Cottingham’s basket record', art: 'preserved.binak-diagram' },
    { ...notice('preserved-binak-dates', 11, 8, 'two date fields on the same record', 'preserved.catalogue',
      'The catalogue heading gives 2012. The Date Made association gives 2011. Both fields belong to Museums Victoria X 104841, the binak by Mikaela Rose Cottingham.'),
    flag: 'preserved.binak.dates' },
    { id: 'preserved-binak-mount', kind: 'scene', node: 'preserved.binak.mount', x: 7, y: 9, w: 1, h: 1, walkThrough: true,
      label: 'Aster’s cradle and side-view sheet', art: 'preserved.display-paired',
      visibleIf: { all: [{ objective: 'preserved.binak.compare' }, { not: { flagSet: 'preserved.binak.display' } }] } },
    { ...notice('preserved-binak-cradle', 7, 9, 'the practice basket on its level cradle', 'preserved.binak-diagram',
      'The model sits on its base. You can see down through its open rim. The reference names Mikaela Rose Cottingham, Wurundjeri. The Date Made field gives 2011 and the catalogue heading gives 2012.',
      { flag: 'preserved.binak.display', eq: 'cradle' }), flag: 'preserved.binak.checked' },
    { ...notice('preserved-binak-profile', 16, 11, 'the supported basket’s side view', 'preserved.display-paired',
      'The low drawing shows the shallow profile. The model stays on its support at the study bench. Beside Mikaela Rose Cottingham’s name, the Date Made field gives 2011 and the catalogue heading gives 2012.',
      { flag: 'preserved.binak.display', eq: 'profile' }), flag: 'preserved.binak.checked' },
    { ...notice('preserved-handoff-receipt', 17, 8, 'the receiving roster and permission slip', 'preserved.catalogue',
      'The roster records Nellis’s delivery and the trainee’s later delivery on separate lines. The trainee agreed to a check at the desk and asked to leave their name off the wall. Their shift credit can stay on the receiving roster.', handoffAtColdStore),
    flag: 'preserved.handoff.receipt' },
    { ...notice('preserved-handoff-public', 16, 10, 'the two lines on the public name rail', 'preserved.display-paired',
      'Excavation acknowledgments name four foremen. Many other workers remain unnamed in the accounts on display. The Cold Store’s own delivery has a separate receiving line. A clip asks for a verifiable source if an older name can be added.', { flag: 'preserved.handoff.arrangement', eq: 'public' }),
    flag: 'preserved.handoff.checked' },
    { ...notice('preserved-handoff-desk', 8, 11, 'the appointment docket for checking names', 'preserved.display-records',
      'The rail points to the excavation acknowledgments in the Review Room. Bring a dated source to the keeper when the desk is staffed. The receiving roster holds the current trainee’s shift credit there by agreement.', { flag: 'preserved.handoff.arrangement', eq: 'desk' }),
    flag: 'preserved.handoff.checked' },
    { ...notice('preserved-handoff-leave', 16, 10, 'the unclaimed display clip', 'preserved.display-delayed',
      'Nellis logged the delivery for the trainee’s shift. The display still has an open clip where someone can bring a new source for a name. No one has taken the review shift yet.', { flag: 'preserved.handoff.arrangement', eq: 'leave' }),
    flag: 'preserved.handoff.checked' },
    notice('preserved-display-pending', 14, 5, 'the display under preparation', 'preserved.display-delayed',
      'Two empty sleeves are clipped here. The registrar can tell you which records could fill them.', { not: { flagSet: 'preserved.display' } }),
    notice('preserved-begin-temple-display', 7, 5, 'the temple-first entry card', 'preserved.temple',
      'A reign and its place of remembrance. Egypt’s Ministry of Tourism and Antiquities dates Ramesses II’s reign to about 1279–1213 BCE and records his funerary temple at the Ramesseum. Take the custody trail for the later move.',
      { flag: 'preserved.begin.display', eq: 'temple' }),
    ...displays.map(([choice, label, art, text]) => notice(
      `preserved-display-${choice}`, 14, 5, label, art, text, { flag: 'preserved.display', eq: choice },
    )),
    { ...slip('lost-gauge', 'jig', 6, 9, 'the old tray jig with a peg',
      { all: [gaugeAtColdStore, { flag: 'thread.lost-gauge.entry', eq: true }] }), art: 'lost-gauge.jig' },
    { ...slip('lost-gauge', 'gift', 11, 9, 'the signed gift and borrowing book',
      { all: [gaugeAtColdStore, { flag: 'thread.lost-gauge.jig', eq: true }] }), art: 'ledger' },
    ...(['owner', 'loan'] as const).flatMap((mode) => {
      const atBench: Condition = { flag: 'lost.gauge.resolved', eq: mode };
      const position = { kind: 'scene' as const, x: 8, y: 12, w: 1, h: 1, walkThrough: true };
      const label = mode === 'owner' ? 'Nima’s gauge and the new tray divider' : 'the apprentice’s jig and signed loan';
      return [
        { ...position, id: `preserved-gauge-${mode}`, node: `lost.gauge.bench-${mode}`,
          label, art: `lost-gauge.bench-${mode}`, visibleIf: { all: [atBench, { not: gaugeUsed }] } },
        { ...position, id: `preserved-gauge-used-${mode}`, node: `lost.gauge.used-${mode}`,
          label, art: mode === 'owner' ? 'lost-gauge.divider' : 'lost-gauge.hook', visibleIf: { all: [atBench, gaugeUsed] } },
      ];
    }),
    notice('preserved-xin-methods-display', 19, 8, 'the four process sheets', 'preserved.display-paired',
      'The source, model, swatches and caption each have a named space. The board shows how a reconstruction is made. It includes no image of Xin Zhui.', { flag: 'xin.display', eq: 'process' }),
    notice('preserved-xin-review-display', 19, 8, 'the printer’s review request', 'preserved.display-delayed',
      'The archive kept the mock-up at the workroom. On the wall, the sources and dates sit beside a request to trace which parts of the model came from measurement and which from comparison.', { flag: 'xin.display', eq: 'review' }),
    notice('preserved-copper-marker-display', 9, 7, 'the two separate record markers', 'preserved.display-records',
      'The material source and the equipment findspot have separate tabs. The space between them has a clip for a dated intermediate record.', { flag: 'copper.display', eq: 'markers' }),
    notice('preserved-copper-chain-display', 9, 7, 'the two open exchange chains', 'preserved.display-paired',
      'Two schematic chains share the same endpoints. Their exchange hooks have no place names. A note asks for dated finds with comparable metal signatures.', { flag: 'copper.display', eq: 'chains' }),
  ],
  lights: [
    { x: 5, y: 5, r: 58, color: 0xb5dcff }, { x: 21, y: 5, r: 58, color: 0xffd598 },
    { x: 14, y: 7, r: 74, color: 0xd4ede6 }, { x: 9, y: 12, r: 42, color: 0x99c4e8 },
  ],
});

export const PRESERVED_ROYAL = room({
  id: 'preserved.royal', name: 'Preserved Lives: Royal Records', width: 26, height: 15,
  background: 0x1a2436, spawn: { x: 12, y: 12 },
  npcs: [{ id: 'preserved-royal-keeper', x: 12, y: 5, facing: 'down' }],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bookshelf', x: 20, y: 2 },
    { stamp: 'window', x: 11, y: 1 }, { stamp: 'bench', x: 2, y: 10 }, { stamp: 'bench', x: 21, y: 10 },
    { stamp: 'rug-green', x: 11, y: 10 },
  ],
  interactables: [
    door('preserved-royal-back', 12, 14, 'the passage back to the Cold Store', { map: 'preserved.archive', x: 5, y: 5 }),
    record('RAMESSEUM', 6, 5, 'the Ramesseum site record', 'preserved.temple'),
    record('RAM-CUSTODY', 18, 5, 'the royal custody file', 'preserved.catalogue'),
    { id: 'preserved-begin-clip', kind: 'scene', x: 10, y: 7, w: 1, h: 1, walkThrough: true,
      label: 'the movable start clip', node: 'preserved.begin.desk', art: 'preserved.display-paired',
      artBy: { flag: 'preserved.begin.clip', keys: { temple: 'preserved.temple', custody: 'preserved.catalogue' } },
      visibleIf: { all: [
        { card: 'card.preserved.reign' }, { flag: 'lens.OBJ-PRES-RAMESSEUM', eq: true },
        { card: 'card.preserved.custody' }, { flag: 'lens.OBJ-PRES-RAM-CUSTODY', eq: true },
      ] } },
    notice('preserved-begin-custody-display', 14, 10, 'the burial-first entry card', 'preserved.catalogue',
      'From burial to safekeeping. The National Museum of Egyptian Civilization names KV 7 as the burial and Deir el-Bahari as the later cache. The move date stays open on this trail. The temple record sits beside the earlier reign.',
      { flag: 'preserved.begin.display', eq: 'custody' }),
    slip('preserved-royal', 'burial', 7, 9, 'the burial note', { card: 'card.preserved.custody' }),
    slip('preserved-royal', 'cache', 12, 9, 'the cache note', { flag: 'thread.preserved-royal.burial', eq: true }),
    slip('preserved-royal', 'catalogue', 19, 9, 'the catalogue note', { flag: 'thread.preserved-royal.cache', eq: true }),
    { id: 'preserved-royal-label', kind: 'label', kit: 'preserved-name', x: 16, y: 7, w: 1, h: 1,
      label: 'the royal label stand', art: 'label-stand', walkThrough: true, visibleIf: { flag: 'thread.preserved-royal.catalogue', eq: true } },
    notice('preserved-royal-guide', 10, 12, 'the royal record guide', 'preserved.folder',
      'Read the custody file in the east case. The Provenance Thread can then follow its slips. Start with the burial note at the west end of the row.'),
    { id: 'preserved-binak-support', kind: 'scene', node: 'preserved.binak.test', x: 17, y: 10, w: 1, h: 1, walkThrough: true,
      label: 'the paper model and two supports', art: 'preserved.binak-diagram',
      artBy: { flag: 'preserved.binak.view', keys: { edge: 'preserved.slip', base: 'preserved.binak-diagram' } },
      visibleIf: { all: [{ objective: 'preserved.binak.sources' }, { not: { objective: 'preserved.binak.compare' } }] } },
    { ...notice('preserved-binak-edge-mark', 17, 11, 'the side mark under the lowered paper rim', 'preserved.slip',
      'The little paper rim has flexed on the narrow edge. The one tap was the same. This mark belongs to Odile’s model.',
      { all: [{ flag: 'preserved.binak.view', eq: 'edge' }, { not: { flagSet: 'preserved.binak.display' } }] }), flag: 'preserved.binak.edge' },
    { ...notice('preserved-binak-base-mark', 17, 11, 'the open space under the rim', 'preserved.binak-diagram',
      'The base cradle touches the bottom of the paper model. The rim is clear and still at the first mark after the tap.',
      { all: [{ flag: 'preserved.binak.view', eq: 'base' }, { not: { flagSet: 'preserved.binak.display' } }] }), flag: 'preserved.binak.base' },
    notice('preserved-binak-parked', 17, 10, 'the practice model held level on the study bench', 'preserved.binak-diagram',
      'The base supports the practice model here. The reading stand in the hall has its own side view and the maker’s record.',
      { flag: 'preserved.binak.display', eq: 'profile' }),
  ],
  lights: [
    { x: 6, y: 6, r: 61, color: 0xe9d7b0 }, { x: 18, y: 6, r: 61, color: 0xb8d7ef },
    { x: 12, y: 10, r: 56, color: 0xc5dee7 },
  ],
});

export const PRESERVED_COAST = room({
  id: 'preserved.coast', name: 'Preserved Lives: Chinchorro Records', width: 24, height: 15,
  background: 0x2b2b2c, spawn: { x: 12, y: 12 },
  npcs: [{ id: 'preserved-coast-keeper', x: 12, y: 5, facing: 'down' }],
  stamps: [
    { stamp: 'window', x: 4, y: 1 }, { stamp: 'window', x: 17, y: 1 },
    { stamp: 'cabinet', x: 2, y: 3 }, { stamp: 'crates', x: 19, y: 10 },
    { stamp: 'bench', x: 5, y: 10 }, { stamp: 'rug-green', x: 11, y: 10 },
    { stamp: 'plant-tall', x: 21, y: 4 },
  ],
  interactables: [
    door('preserved-coast-back', 12, 14, 'the passage back to the Cold Store', { map: 'preserved.archive', x: 21, y: 5 }),
    record('CHIN-SITES', 6, 5, 'the Chinchorro sites record', 'preserved.coast'),
    record('CHIN-CONTEXT', 18, 5, 'the Chinchorro context record', 'preserved.context'),
    slip('preserved-coast', 'site', 7, 8, 'the site note', { card: 'card.preserved.coast' }),
    slip('preserved-coast', 'conditions', 12, 8, 'the conditions note', { flag: 'thread.preserved-coast.site', eq: true }),
    slip('preserved-coast', 'context', 17, 8, 'the context note', { flag: 'thread.preserved-coast.conditions', eq: true }),
    notice('preserved-coast-guide', 10, 12, 'the room’s reading guide', 'preserved.folder',
      'Read the sites case on the west side. Then start with the site note below it. The next slip asks what the surroundings can do. The last slip asks what people did.'),
  ],
  lights: [
    { x: 6, y: 6, r: 61, color: 0xaad1cf }, { x: 18, y: 6, r: 61, color: 0xffdb97 },
    { x: 12, y: 9, r: 59, color: 0xf3c889 },
  ],
});

export const PRESERVED_INQUIRY = room({
  id: 'preserved.inquiry', name: 'Preserved Lives: Review Room', width: 18, height: 13,
  background: 0x292433, spawn: { x: 8, y: 10 },
  npcs: [{ id: 'preserved-inquiry-keeper', x: 9, y: 5, facing: 'down' }],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'cabinet', x: 13, y: 2 },
    { stamp: 'long-table', x: 2, y: 6 }, { stamp: 'rug-green', x: 7, y: 8 },
    { stamp: 'plant-tall', x: 14, y: 9 },
  ],
  interactables: [
    door('preserved-inquiry-back', 8, 12, 'the passage back to the Cold Store', { map: 'preserved.archive', x: 23, y: 8 }),
    ...COLD_LINTEL,
    record('TUT-JOURNAL', 3, 5, 'Carter’s excavation journal', 'preserved.catalogue'),
    record('TUT-NOTE', 7, 5, 'Lucas’s later report', 'preserved.folder'),
    record('TUT-WORKFORCE', 15, 5, 'the excavation workforce account', 'preserved.context'),
    { id: 'preserved-handoff-file', kind: 'scene', node: 'preserved.handoff.file', x: 15, y: 7, w: 1, h: 1,
      label: 'the two trays beneath the workforce record', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [handoffAtColdStore, { card: 'card.preserved.tut.workforce' }] } },
    ...sceneProp('preserved.tut.request', 12, 10, 'the excavation caption request', 'preserved.folder',
      { names: 'preserved.display-records', timeline: 'preserved.display-paired' }, { objective: 'preserved.proof.checked' }),
    notice('preserved-reply-desk', 4, 8, 'the review desk', 'preserved.display-records',
      'The two folders sit with the visitor’s question. The keeper leaves room for a source to be checked before the display changes.', { flag: 'preserved.reply', eq: 'desk' }),
    notice('preserved-reply-margin', 12, 8, 'the margin slip', 'preserved.display-delayed',
      'The visitor’s question travels back with the display. The workroom keeps a copy, filed where the next reviewer can find it.', { flag: 'preserved.reply', eq: 'margin' }),
  ],
  lights: [
    { x: 5, y: 6, r: 58, color: 0xead4af }, { x: 10, y: 7, r: 63, color: 0xc7d1ef },
  ],
});

/** Each workroom sheet changes appearance and can be lifted for another comparison. */
function workroomSheet(key: string, x: number, title: string, pinnedArt: string): Interactable[] {
  const ready = { objective: 'xin.o.records' };
  const pinned = { flag: `xin.layer.${key}`, eq: true };
  const common = { kind: 'scene', x, y: 8, w: 1, h: 1, walkThrough: true } as const;
  return [
    {
      ...common, id: `preserved-workroom-${key}`, node: `xin.layer.${key}`, label: title,
      art: 'preserved.folder', visibleIf: { all: [ready, { not: pinned }] },
    },
    {
      ...common, id: `preserved-workroom-${key}-pinned`, node: `xin.layer.${key}.pinned`, label: `the pinned ${title}`,
      art: pinnedArt, visibleIf: { all: [ready, pinned] },
    },
  ];
}

export const PRESERVED_WORKROOM = room({
  id: 'preserved.workroom', name: 'Preserved Lives: Reconstruction Workroom', width: 21, height: 14,
  background: 0x282d39, spawn: { x: 10, y: 11 },
  npcs: [],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bookshelf', x: 16, y: 2 },
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'rug-green', x: 9, y: 10 },
    { stamp: 'bench', x: 2, y: 10 }, { stamp: 'plant-tall', x: 18, y: 10 },
  ],
  interactables: [
    door('preserved-workroom-back', 10, 13, 'the passage back to the Cold Store', { map: 'preserved.archive', x: 23, y: 11 }),
    BEATER_WORKROOM_PRESS,
    ...WORKROOM_SEAM,
    record('XIN-CONTEXT', 5, 5, 'the Mawangdui context file', 'preserved.context'),
    record('XIN-METHOD', 15, 5, 'the Hunan methods report', 'preserved.catalogue'),
    notice('preserved-workroom-guide', 8, 11, 'the workroom instructions', 'preserved.slip',
      'The two cases have different kinds of dates. Use the Lens on both. Then look along the line of sleeves. A printer can attach a sheet or lift it again as you compare them.'),
    ...workroomSheet('observation', 4, 'observation sheet', 'preserved.catalogue'),
    ...workroomSheet('model', 8, 'model sheet', 'preserved.context'),
    ...workroomSheet('style', 12, 'artist’s swatches', 'preserved.display-paired'),
    ...workroomSheet('caption', 16, 'caption slip', 'preserved.slip'),
    { id: 'preserved-workroom-printer', kind: 'scene', node: 'xin.commission', x: 10, y: 5, w: 1, h: 1,
      label: 'the printer’s tray', art: 'preserved.display-delayed', walkThrough: true,
      visibleIf: { all: [{ objective: 'xin.o.layers' }, { not: { flagSet: 'xin.display' } }] } },
    notice('preserved-workroom-printed', 10, 5, 'the printer’s copy', 'preserved.display-paired',
      'A copy of the four named sheets went to the main hall. The comparison remains here for the next keeper.', { flag: 'xin.display', eq: 'process' }),
    notice('preserved-workroom-held', 10, 5, 'the held mock-up', 'preserved.display-records',
      'The mock-up stays in the workroom so a keeper can inspect the process. The hall has received the two sources and the request for further review.', { flag: 'xin.display', eq: 'review' }),
  ],
  lights: [
    { x: 5, y: 6, r: 58, color: 0xd4e0ff }, { x: 15, y: 6, r: 58, color: 0xf7dfb1 },
    { x: 10, y: 8, r: 72, color: 0xdce1ec },
  ],
});

function copperTrial(id: string, x: number, label: string, art: string, visibleIf?: Condition): Interactable {
  return {
    id: `preserved-copper-trial-${id}`, kind: 'scene', node: `copper.trial.${id}`, x, y: 8, w: 1, h: 1,
    label, art: 'preserved.folder', walkThrough: true, visibleIf,
    artOpen: { key: art, if: { flag: `copper.tested.${id}`, eq: true } },
  };
}

export const PRESERVED_COPPER = room({
  id: 'preserved.copper', name: 'Preserved Lives: Survey Table', width: 21, height: 14,
  background: 0x242f38, spawn: { x: 10, y: 11 },
  npcs: [],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bookshelf', x: 16, y: 2 },
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'rug-green', x: 9, y: 9 },
    { stamp: 'bench', x: 16, y: 10 }, { stamp: 'plant-tall', x: 2, y: 10 },
  ],
  interactables: [
    door('preserved-copper-back', 10, 13, 'the passage back to the Cold Store', { map: 'preserved.archive', x: 4, y: 9 }),
    record('COPPER-FIND', 5, 5, 'the discovery register', 'preserved.catalogue'),
    record('COPPER-ORE', 15, 5, 'the copper source report', 'preserved.context'),
    notice('preserved-copper-guide', 7, 11, 'the surveyor’s note', 'preserved.slip',
      'These tracks are models. Place a material token to try the three tracks. When you have both records, move the source peg to the place marked in the report.'),
    { id: 'preserved-copper-source-peg', kind: 'scene', node: 'copper.overlay', x: 10, y: 5, w: 1, h: 1,
      label: 'the movable origin peg', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [{ objective: 'copper.o.records' }, { not: { flag: 'copper.overlay', eq: true } }] } },
    notice('preserved-copper-source-fixed', 10, 5, 'the two fixed pegs', 'preserved.display-records',
      'The ore comparison points to southern Tuscany. The equipment findspot is in the Alps. A peg for each gives the model its endpoints.', { flag: 'copper.overlay', eq: true }),
    copperTrial('near', 5, 'the nearby-source trial', 'nile.map', { not: { flag: 'copper.overlay', eq: true } }),
    notice('preserved-copper-near-closed', 5, 8, 'the closed trial', 'preserved.display-delayed',
      'The report puts the source elsewhere. The nearby-source trial is shelved. A short line with an unsupported start cannot trace this copper.', { flag: 'copper.overlay', eq: true }),
    copperTrial('one', 10, 'the track with one exchange', 'preserved.context'),
    copperTrial('several', 15, 'the track with several exchanges', 'preserved.display-paired'),
    { id: 'preserved-copper-dispatch', kind: 'scene', node: 'copper.dispatch', x: 13, y: 11, w: 1, h: 1,
      label: 'the survey table dispatch', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [{ objective: 'copper.o.compare' }, { not: { flagSet: 'copper.display' } }] } },
    notice('preserved-copper-dispatched', 13, 11, 'the dispatch receipt', 'preserved.slip',
      'The keeper took your copy to the Cold Store hall. The trial boards remain here to test another example.', { flagSet: 'copper.display' }),
  ],
  lights: [
    { x: 5, y: 6, r: 56, color: 0xbbdef5 }, { x: 15, y: 6, r: 58, color: 0xf5d5a3 },
    { x: 10, y: 9, r: 75, color: 0xcfe4d9 },
  ],
});

/** A display rail keeps its own controls even after the gallery is open. */
function galleryPanel(id: string, x: number, y: number, label: string, choices: Record<string, string>, visibleIf?: Condition): Interactable {
  return {
    id: `preserved-gallery-panel-${id}`, kind: 'scene', node: `gallery.panel.${id}`, x, y, w: 1, h: 1,
    label, art: 'preserved.folder', walkThrough: true, visibleIf,
    artBy: { flag: `gallery.panel.${id}`, keys: choices },
  };
}

function galleryLayout(layout: string): Condition {
  return { flag: 'gallery.layout', eq: layout };
}

function galleryRevision(layout: string, revision: string): Condition {
  return { all: [galleryLayout(layout), { flag: `gallery.${layout}`, eq: revision }] };
}

const galleryXin: Condition = { objective: 'xin.o.display' };
const galleryCopper: Condition = { objective: 'copper.o.display' };

export const PRESERVED_GALLERY = room({
  id: 'preserved.gallery', name: 'Preserved Lives: Exhibition Gallery', width: 23, height: 15,
  background: 0x252f36, spawn: { x: 11, y: 12 },
  npcs: [],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bookshelf', x: 18, y: 2 },
    { stamp: 'window', x: 10, y: 1 }, { stamp: 'rug-green', x: 10, y: 9 },
    { stamp: 'bench', x: 2, y: 11 }, { stamp: 'plant-tall', x: 20, y: 11 },
  ],
  interactables: [
    door('preserved-gallery-back', 11, 14, 'the passage back to the Cold Store', { map: 'preserved.archive', x: 25, y: 11 }),
    galleryPanel('royal', 5, 5, 'the royal display rail', { custody: 'preserved.catalogue', temple: 'preserved.temple' }),
    galleryPanel('coast', 17, 5, 'the Chinchorro display rail', { sites: 'preserved.coast', conditions: 'preserved.context' }),
    galleryPanel('xin', 5, 9, 'the Mawangdui display rail', { method: 'preserved.display-paired', source: 'preserved.display-records' }, galleryXin),
    galleryPanel('copper', 17, 9, 'the copper display rail', { points: 'preserved.display-records', relay: 'preserved.display-paired' }, galleryCopper),
    notice('preserved-gallery-xin-space', 5, 9, 'the spare sleeve for Mawangdui', 'preserved.display-delayed',
      'The reconstruction workroom can send a case file here when its printer has prepared a public copy or review request.', { not: galleryXin }),
    notice('preserved-gallery-copper-space', 17, 9, 'the spare sleeve for the copper record', 'preserved.display-delayed',
      'The survey table has two equipment records and several ways to show what they leave undecided. It can send a copy to this sleeve.', { not: galleryCopper }),
    { id: 'preserved-gallery-layout', kind: 'scene', node: 'gallery.layout', x: 11, y: 5, w: 1, h: 1,
      label: 'the small layout table', art: 'preserved.folder', walkThrough: true, visibleIf: { objective: 'gallery.o.panels' },
      artBy: { flag: 'gallery.layout', keys: { rooms: 'preserved.display-records', links: 'preserved.display-paired' } } },
    notice('preserved-gallery-west-desk', 7, 7, 'the royal reading desk', 'preserved.catalogue',
      'Ramesses II has his own file. The temple record and the custody record have separate sleeves.', galleryLayout('rooms')),
    notice('preserved-gallery-east-desk', 15, 7, 'the Chinchorro reading desk', 'preserved.context',
      'This desk keeps the site locations with the record that names the different kinds of preservation.', galleryLayout('rooms')),
    notice('preserved-gallery-first-link', 11, 7, 'the first connecting strip', 'preserved.slip',
      'Follow the traces of care from one case to the next.', { all: [galleryLayout('links'), { not: { flagSet: 'gallery.links' } }] }),
    notice('preserved-gallery-survival-link', 11, 7, 'the replacement connecting strip', 'preserved.display-paired',
      'What evidence survives in each place? The royal record names a person. The records of the coast identify sites and types of evidence.', galleryRevision('links', 'survival')),
    notice('preserved-gallery-gap-link', 11, 7, 'the replacement gap strip', 'preserved.display-delayed',
      'Where does each record leave a gap? The custody record leaves a date open. The site file cannot tell the life of one person there.', galleryRevision('links', 'gaps')),
    { id: 'preserved-gallery-visitor-rooms', kind: 'scene', node: 'gallery.visitor.rooms', x: 11, y: 10, w: 1, h: 1,
      label: 'the reader between the desks', art: 'preserved.slip', walkThrough: true, visibleIf: galleryLayout('rooms') },
    { id: 'preserved-gallery-visitor-links', kind: 'scene', node: 'gallery.visitor.links', x: 11, y: 10, w: 1, h: 1,
      label: 'the reader’s note on the trail', art: 'preserved.slip', walkThrough: true, visibleIf: galleryLayout('links') },
    notice('preserved-gallery-copies', 9, 12, 'the entrance reading copies', 'preserved.display-records',
      'Two large-print folders are accessible from the entrance. The royal and Chinchorro records each keep their own heading and source.', galleryRevision('rooms', 'copies')),
    notice('preserved-gallery-seat', 11, 8, 'the attendant’s reading stand', 'preserved.display-paired',
      'The attendant set a chair beside this stand. A visitor can ask for either file and compare it without walking to the other desk.', galleryRevision('rooms', 'seat')),
  ],
  lights: [
    { x: 5, y: 6, r: 68, color: 0xdcc6a0 }, { x: 17, y: 6, r: 65, color: 0xafc8df },
    { x: 11, y: 10, r: 74, color: 0xd2e4d1 },
  ],
});
