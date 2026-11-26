/** Fictional Guardian archive. Its rooms contain documentary evidence and original schematic illustrations. */
import type { Condition } from '../domain/types';
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

export const PRESERVED_ARCHIVE = room({
  id: 'preserved.archive', name: 'Preserved Lives: the Cold Store', width: 28, height: 17,
  background: 0x18242e, spawn: { x: 14, y: 14 },
  npcs: [{ id: 'preserved-registrar', x: 14, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'bookshelf', x: 2, y: 2 }, { stamp: 'bookshelf', x: 23, y: 2 },
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'window', x: 16, y: 1 },
    { stamp: 'rug-green', x: 13, y: 9 },
    { stamp: 'bench', x: 5, y: 11 }, { stamp: 'bench', x: 21, y: 12 },
    { stamp: 'plant-tall', x: 2, y: 13 }, { stamp: 'plant-tall', x: 26, y: 13 },
  ],
  interactables: [
    door('preserved-door-royal', 5, 3, 'the Royal Records room', { map: 'preserved.royal', x: 12, y: 12 }),
    door('preserved-door-coast', 21, 3, 'the Chinchorro Records room', { map: 'preserved.coast', x: 12, y: 12 }),
    { ...door('preserved-door-inquiry', 24, 7, 'the review room', { map: 'preserved.inquiry', x: 8, y: 10 }),
      openIf: { flagSet: 'preserved.display' }, text: 'The review room opens after the first display goes up. The registrar has the two folders.' },
    { ...door('preserved-door-workroom', 24, 10, 'the reconstruction workroom', { map: 'preserved.workroom', x: 10, y: 11 }),
      openIf: { objective: 'preserved.publish' }, text: 'The printer will open the workroom when the first display is ready.' },
    { ...door('preserved-door-copper', 3, 8, 'the survey table room', { map: 'preserved.copper', x: 10, y: 11 }),
      openIf: { objective: 'preserved.publish' }, text: 'The keeper is waiting for the first display before opening the survey table.' },
    door('preserved-door-nexus', 14, 16, 'the door back to the Nexus', { map: 'nexus.archive', x: 35, y: 15 }),
    { id: 'preserved-rest', kind: 'waystone', x: 9, y: 13, w: 1, h: 1, label: 'the Cold Store Waystone', place: 'the Cold Store', art: 'waystone' },
    notice('preserved-directory', 17, 13, 'the Cold Store directory', 'preserved.folder',
      'COLD STORE. The Royal Records room is on the left of the north wall. The Chinchorro Records room is on the right. The registrar works between the two rooms.'),
    notice('preserved-display-pending', 14, 5, 'the display under preparation', 'preserved.display-delayed',
      'Two empty sleeves are clipped here. The registrar can tell you which records could fill them.', { not: { flagSet: 'preserved.display' } }),
    ...displays.map(([choice, label, art, text]) => notice(
      `preserved-display-${choice}`, 14, 5, label, art, text, { flag: 'preserved.display', eq: choice },
    )),
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
    slip('preserved-royal', 'burial', 7, 9, 'the burial note', { card: 'card.preserved.custody' }),
    slip('preserved-royal', 'cache', 12, 9, 'the cache note', { flag: 'thread.preserved-royal.burial', eq: true }),
    slip('preserved-royal', 'catalogue', 19, 9, 'the catalogue note', { flag: 'thread.preserved-royal.cache', eq: true }),
    { id: 'preserved-royal-label', kind: 'label', kit: 'preserved-name', x: 16, y: 7, w: 1, h: 1,
      label: 'the royal label stand', art: 'label-stand', walkThrough: true, visibleIf: { flag: 'thread.preserved-royal.catalogue', eq: true } },
    notice('preserved-royal-guide', 10, 12, 'the royal record guide', 'preserved.folder',
      'Read the custody file in the east case. The Provenance Thread can then follow its slips. Start with the burial note at the west end of the row.'),
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
    record('TUT-JOURNAL', 3, 5, 'Carter’s excavation journal', 'preserved.catalogue'),
    record('TUT-NOTE', 7, 5, 'Lucas’s later report', 'preserved.folder'),
    record('TUT-WORKFORCE', 15, 5, 'the excavation workforce account', 'preserved.context'),
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
