/** WORLD-03: present-day fictional archive rooms. Only their objects are historical. */
import type { Interactable, MapDef } from './types';
import { sceneProp } from './sceneProps';

const W = 25, H = 13;
const room = (id: string, name: string, npcs: MapDef['npcs'], interactables: Interactable[], palette: number, stamps: MapDef['stamps']): MapDef => ({
  id, name, world: 'WORLD-03', width: W, height: H, music: 'music.archive', ambience: 'study',
  background: palette,
  floor: (x, y) => x < 1 || x > W - 2 || y < 0 || y >= H ? null
    : y < 3 ? ['wall-top', 'wall-mid', 'wall-base'][y] : 'stone-c',
  stamps,
  blocks: [[0, 0, 1, H], [W - 1, 0, 1, H], [1, 0, W - 2, 3], [1, H, W - 2, 1]],
  npcs, interactables,
  zones: [],
  lights: [{ x: 6, y: 5, r: 62, color: 0xffd69b }, { x: 18, y: 7, r: 58, color: 0x96d6df }, { x: 12, y: 10, r: 65, color: 0xffc37a }],
  spawn: { x: 12, y: 10 },
});
const door = (id: string, x: number, y: number, label: string, map: string, tx: number, ty: number): Interactable => ({
  id, kind: 'door', x, y, w: 1, h: 1, label, art: 'nile.door', to: { map, x: tx, y: ty },
});
const exhibit = (id: string, x: number, y: number, label: string, art: string): Interactable => ({
  id: 'nile-case-' + id.toLowerCase(), kind: 'exhibit', exhibit: 'OBJ-NILE-' + id, x, y, w: 1, h: 1, label, art: 'nile.' + art,
});

type Dispatch = 'print' | 'read' | 'pair';

const readerClue = (dispatch: Dispatch, part: 'reply' | 'proof', x: number, y: number, label: string): Interactable => {
  const id = `nile-${part}-${dispatch}`;
  return {
    id, kind: 'clue', clue: id, x, y, w: 1, h: 1, walkThrough: true, label,
    art: part === 'reply' ? 'nile.slip' : 'nile.scroll',
    visibleIf: { all: [
      { flag: 'nile.returned', eq: true },
      { flag: 'nile.dispatch', eq: dispatch },
      ...(part === 'proof' ? [{ flag: `clue.nile-reply-${dispatch}.read`, eq: true }] : []),
    ] },
  };
};

const placedCopy = (destination: string, x: number, y: number, label: string, art: string, text: string): Interactable => ({
  id: `nile-reply-outcome-${destination}`, kind: 'sign', x, y, w: 1, h: 1, walkThrough: true, label, art, text,
  visibleIf: { flag: 'nile.reply.destination', eq: destination },
});

export const NILE_HALL = room('nile.hall', 'Nile Archive: The Door Without a Name',
  [{ id: 'nile-iman', x: 12, y: 6, facing: 'down' }],
  [
    { id: 'nile-mark-tag', kind: 'exhibit', exhibit: 'OBJ-ARCHIVE-RECEIVING-TAG', x: 4, y: 5, w: 1, h: 1,
      label: 'Mara’s receiving tag', art: 'nile.tablet' },
    { id: 'nile-mark-label', kind: 'label', kit: 'nile-borrowed-mark', x: 4, y: 8, w: 1, h: 1,
      label: 'the borrowed mark’s label stand', art: 'label-stand' },
    { id: 'nile-mark-tag-copy', kind: 'sign', x: 6, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'the tag’s separate name lines', art: 'nile.tablet',
      text: 'Mara recorded the handover. Room for the maker: still open.',
      visibleIf: { all: [
        { flag: 'label.nile-borrowed-mark.holds', eq: true },
        { flag: 'label.nile-borrowed-mark.subject', eq: 'tag' },
      ] } },
    { id: 'nile-mark-cloth-copy', kind: 'sign', x: 6, y: 8, w: 1, h: 1, walkThrough: true,
      label: 'the keepers’ cloth copy', art: 'nile.scroll',
      text: 'The example cloth is on loan from Leila. Two blank patches invite the next learners to practice leaving room for a maker’s name.',
      visibleIf: { all: [
        { flag: 'label.nile-borrowed-mark.holds', eq: true },
        { flag: 'label.nile-borrowed-mark.subject', eq: 'cloth' },
      ] } },
    ...sceneProp('nile.reading-bench', 17, 9, 'Imani’s reading bench', 'board-stand',
      { copy: 'nile.scroll', edge: 'nile.tablet' }),
    placedCopy('print-fold', 8, 8, 'a tray of folded copies', 'nile.slip',
      'Two dated headings sit above the fold. Take a strip home, or see the older caption in the Royal Records Room.'),
    placedCopy('read-voices', 19, 8, 'the two-reader bench copy', 'nile.scroll',
      'Read one slip each. Take turns. Leave both slips flat so the next pair can see whose record they hear.'),
    door('nile-royal', 12, 3, 'the Royal Records Room (north)', 'nile.royal', 12, 10),
    door('nile-workers', 2, 6, 'the Workmen’s Room (west)', 'nile.workyard', 12, 10),
    door('nile-maps', 22, 6, 'the Map Room (east)', 'nile.route', 12, 10),
    door('nile-nexus', 12, 12, 'the door back to the Nexus', 'nexus.archive', 37, 4),
    { id: 'nile-tag', kind: 'clue', clue: 'nile-blank-tag', x: 8, y: 5, w: 1, h: 1, label: 'Elsbet’s unnamed tag', art: 'nile.slip' },
    { id: 'nile-carrier-copy', kind: 'clue', clue: 'nile-packet-copy', x: 15, y: 5, w: 1, h: 1, label: 'the spare carrier tag', art: 'nile.slip', visibleIf: { flag: 'nile.returned', eq: true } },
    { id: 'nile-rest', kind: 'waystone', x: 7, y: 10, w: 1, h: 1, label: 'the archive Waystone', art: 'waystone', place: 'the Nile Archive' },
    { id: 'nile-entry-notice', kind: 'sign', x: 15, y: 9, w: 1, h: 1, label: 'Elsbet’s sign beside the threshold', art: 'nile.scroll',
      text: 'NILE ARCHIVE. These are Guardian rooms, not ancient places. Examine the real records in their cases. The people you meet here are our keepers.' },
  ], 0x132535,
  [{ stamp: 'bookshelf', x: 4, y: 2 }, { stamp: 'bookshelf', x: 18, y: 2 }, { stamp: 'rug-green', x: 11, y: 8 }, { stamp: 'plant-tall', x: 3, y: 10 }, { stamp: 'plant-tall', x: 21, y: 10 }]);

export const NILE_ROYAL = room('nile.royal', 'Nile Archive: Royal Records Room',
  [{ id: 'nile-nasir', x: 12, y: 7, facing: 'down' }],
  [
    ...sceneProp('nile.caption-clips', 15, 5, 'Nasir’s caption clips', 'board-stand',
      { dates: 'nile.slip', purposes: 'nile.scroll' }, { objective: 'nile.diplomacy' }),
    readerClue('print', 'reply', 8, 8, 'the reader’s folded copy'),
    readerClue('pair', 'proof', 20, 6, 'Nasir’s double clip'),
    placedCopy('print-hinge', 10, 7, 'the hinged caption', 'nile.tablet',
      'Lift here to see the old heading. Close the hinge to see the separate dates for the account and the agreement.'),
    placedCopy('pair-ledger', 21, 8, 'the facing pages', 'nile.scroll',
      'Left page: the ancient map. Right page: our trial and the load we used. The page numbers let a reader find either record again.'),
    door('royal-back', 12, 12, 'the passage back to Imani', 'nile.hall', 12, 4),
    exhibit('SALLIER', 6, 5, 'Papyrus Sallier III', 'scroll'),
    exhibit('TREATY', 18, 5, 'the peace treaty and its replica', 'tablet'),
    { id: 'nile-label', kind: 'label', kit: 'nile-qadesh', x: 12, y: 5, w: 1, h: 1, label: 'the Qadesh label stand', art: 'label-stand' },
  ], 0x312432,
  [{ stamp: 'banners', x: 5, y: 2 }, { stamp: 'banners', x: 17, y: 2 }, { stamp: 'rug-green', x: 11, y: 8 }, { stamp: 'bench', x: 2, y: 9 }, { stamp: 'bench', x: 19, y: 9 }]);

export const NILE_WORKYARD = room('nile.workyard', 'Nile Archive: Workmen’s Room',
  [{ id: 'nile-leila', x: 20, y: 9, facing: 'left' }],
  [
    { id: 'nile-mark-swatch', kind: 'exhibit', exhibit: 'OBJ-ARCHIVE-PRACTICE-SWATCH', x: 7, y: 5, w: 1, h: 1,
      label: 'the keepers’ practice swatch', art: 'nile.scroll' },
    ...sceneProp('nile.reader-seat', 17, 9, 'Leila’s reader seat', 'board-stand',
      { chair: 'nile.slip', slip: 'nile.scroll' }, { objective: 'nile.workers' }),
    readerClue('read', 'reply', 18, 6, 'the reader’s ribbon'),
    readerClue('print', 'proof', 10, 5, 'a strip with two headings'),
    { id: 'nile-window-pair', kind: 'sign', x: 15, y: 4, w: 1, h: 1, walkThrough: true, art: 'nile.scroll',
      label: 'Leila’s two reading strips',
      text: 'Lending table: request, then reply. Desk order: delivery, then check what came before. Both strips carry Amunnakht’s name and leave the next stoppage in view.',
      visibleIf: { flag: 'nile.workers.window', eq: 'pair' } },
    { id: 'nile-window-fold', kind: 'sign', x: 15, y: 4, w: 1, h: 1, walkThrough: true, art: 'nile.slip',
      label: 'Leila’s window and full sequence',
      text: 'Try one opening line. Then lift the flap to read the stoppage, the payment and the later stoppage. The dated record is the same through either opening.',
      visibleIf: { flag: 'nile.workers.window', eq: 'fold' } },
    placedCopy('read-table', 14, 8, 'the open reading slips', 'nile.scroll',
      'Take a seat at either end. Look for the point where the stoppage resumes before you put either slip away.'),
    door('workyard-back', 12, 12, 'the passage back to Imani', 'nile.hall', 3, 6),
    exhibit('STRIKE', 5, 4, 'the Turin Strike Papyrus', 'scroll'),
    ...([[3, 'delay', 'the first stoppage'], [12, 'payment', 'a payment of grain'], [19, 'return', 'the second stoppage']] as const)
      .map(([x, node, label]) => ({ id: 'nile-thread-' + node, kind: 'thread' as const, thread: 'nile-strike', node, x, y: 7, w: 1, h: 1, label, art: 'nile.slip' })),
    { id: 'nile-workymemory', kind: 'sign', x: 20, y: 5, w: 1, h: 1, label: 'Leila’s archive slip', art: 'nile.slip',
      text: 'Amunnakht’s account names demands and replies. I can give the page a heading. I can’t give it all the voices it never recorded. —Leila' },
  ], 0x323124,
  [{ stamp: 'crates', x: 2, y: 4 }, { stamp: 'barrel', x: 7, y: 5 }, { stamp: 'long-table', x: 10, y: 3 }, { stamp: 'bookshelf', x: 18, y: 2 }]);

export const NILE_ROUTE = room('nile.route', 'Nile Archive: Map Room',
  [{ id: 'nile-marek', x: 16, y: 7, facing: 'left' }],
  [
    ...sceneProp('nile.model-handover', 14, 8, 'Marek’s note for the next keeper', 'board-stand',
      { repeat: 'nile.slip', limit: 'nile.scroll' }, { objective: 'nile.routes' }),
    readerClue('pair', 'reply', 9, 5, 'the apprentice’s loose tag'),
    readerClue('read', 'proof', 15, 6, 'Marek’s paired reading clip'),
    placedCopy('pair-bench', 12, 8, 'the run card beside the cart', 'nile.slip',
      'Set the same crate before testing either road again. This cord keeps the load settings and the result on the same hook.'),
    door('route-back', 12, 12, 'the passage back to Imani', 'nile.hall', 21, 6),
    exhibit('MINE', 6, 5, 'the Turin Mine Map', 'map'),
    { id: 'nile-route-model', kind: 'model', x: 12, y: 6, w: 1, h: 1, label: 'the shelf-top route model', art: 'nile.map' },
    { id: 'nile-route-margins', kind: 'clue', clue: 'nile-route-margins', x: 5, y: 7, w: 1, h: 1, label: 'the empty margin of the map case', art: 'nile.slip' },
    { id: 'nile-route-legend', kind: 'sign', x: 5, y: 9, w: 1, h: 1, label: 'a note pinned to the map case', art: 'nile.slip',
      text: 'A road line can show that the maker marked a route. It cannot say how our cart will fare. Leave a space between the two claims.' },
  ], 0x2b3039,
  [{ stamp: 'bookshelf', x: 4, y: 2 }, { stamp: 'crates', x: 19, y: 6 }, { stamp: 'bench', x: 12, y: 4 }, { stamp: 'plant-tall', x: 19, y: 9 }]);
