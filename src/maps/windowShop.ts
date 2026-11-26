import windowPack from '../content/window-shop.json';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const harbour = 'observatory.harbour';
const shop = 'observatory.window-shop';
const arrived: Condition = { flag: 'coast.arrived', eq: true };
const f = (id: string, eq: true | string = true): Condition => ({ flag: `window.${id}`, eq });
const o = (id: string): Condition => ({ objective: `window.${id}` });
const expectCard = (id: string): Condition => ({ card: `card.window.${id}` });
const all = (...clauses: Condition[]): Condition => ({ all: clauses });
const until = (stop: Condition): Condition => ({ not: stop });
const post: Condition = { flagSet: 'window.post' };
const finish = o('proof');

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition, node = id): Interactable {
  return { id: `window-${id}`, kind: 'scene', x, y, w: 1, h: 1, label,
    art: `window.${art}`, node: `window.${node}`, visibleIf, walkThrough: true };
}

function note(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf?: Condition, flag?: string): Interactable {
  return { id: `window-${id}`, kind: 'sign', x, y, w: 1, h: 1, label,
    art: `window.${art}`, text, visibleIf, flag: flag && `window.${flag}`, walkThrough: true };
}

export const WINDOW_HARBOUR_PROPS: Interactable[] = [
  { id: 'window-shop-door', kind: 'door', x: 8, y: 14, w: 1, h: 1, art: 'preserved.door',
    label: 'Talden’s window shop', visibleIf: arrived, to: { map: shop, x: 14, y: 15 } },
  scene('watch-deck', 6, 14, 'the pilot reading the two turns', 'deck', all(f('post', 'deck'), until(finish)), 'watch.deck'),
  scene('watch-glass', 3, 12, 'Cado at the low viewing rail', 'glass', all(f('post', 'glass'), until(finish)), 'watch.glass'),
  note('done-deck', 6, 14, 'the checked departure trail', 'deck',
    'The pilot followed two marked turns from the public trace. The close picture is with Cado. Its caption gives the third bell and its own viewing edge.', f('used', 'deck')),
  note('done-glass', 3, 12, 'the checked view beside the low rail', 'glass',
    'The full-size close sketch and its edge are at hand for the clerk. The public copy directs a pilot who needs the second turn to the staffed desk.', f('used', 'glass')),
];

const caseCoords = [4, 8, 12, 17, 21, 25];
const caseProps = windowPack.exhibits.map((exhibit, i): Interactable => ({
  id: `window-case-${exhibit.grantsCard.split('.').at(-1)}`, kind: 'exhibit', exhibit: exhibit.id,
  x: caseCoords[i], y: 6, w: 1, h: 1, label: exhibit.name, art: exhibit.art,
}));
const checkedFar = o('far');
const checkedNear = o('near');
const compared = o('compare');
const readyFar = all(expectCard('telescope'), expectCard('other'), until(checkedFar));
const readyNear = all(expectCard('microscope'), until(checkedNear));
const readyTrack = all(checkedFar, checkedNear, expectCard('trieste'), expectCard('profile'), expectCard('columbia'), until(compared));

export const WINDOW_SHOP: MapDef = {
  id: shop, name: 'Observatory Coast: The Window Shop', world: 'WORLD-05',
  width: 29, height: 18, background: 0x203445, music: 'music.archive', ambience: 'study', spawn: { x: 14, y: 15 },
  floor: (x, y) => {
    if (x < 1 || x > 27 || y < 0 || y > 17) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return x === 14 || y === 14 ? 'stone-b' : 'stone-c';
  },
  blocks: [[1, 0, 27, 3]], zones: [],
  stamps: [{ stamp: 'window', x: 5, y: 1 }, { stamp: 'window', x: 13, y: 1 }, { stamp: 'window', x: 21, y: 1 },
    { stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 25, y: 2 },
    { stamp: 'bench', x: 2, y: 14 }, { stamp: 'bench', x: 24, y: 14 }, { stamp: 'rug-green', x: 13, y: 13 }],
  npcs: [{ id: 'window-guide-talden', x: 5, y: 9, facing: 'right' },
    { id: 'window-recorder-cado', x: 21, y: 9, facing: 'left' }],
  lights: [{ x: 7, y: 9, r: 82, color: 0xb7e3f3 }, { x: 14, y: 9, r: 75, color: 0xebd4a7 },
    { x: 21, y: 10, r: 82, color: 0xaaddf2 }, { x: 14, y: 14, r: 71, color: 0xf0d2a7 }],
  interactables: [
    ...caseProps,
    { id: 'window-shop-return', kind: 'door', x: 14, y: 17, w: 1, h: 1, art: 'preserved.door',
      label: 'the passage to Slate Harbour', to: { map: harbour, x: 9, y: 14 } },
    note('shop-map', 14, 14, 'the shop’s two test rails', 'draft',
      'Left of the centre aisle: the fixed distant board and the lamp plate. To the right: the window sketch and independent position strip. The object cases keep their own date cards.'),
    { ...scene('scope', 4, 11, 'the wide and close faces at the fixed distant board', 'wide', readyFar),
      artBy: { flag: 'window.scope', keys: { wide: 'window.wide', close: 'window.close' } } },
    note('scope-wide', 7, 11, 'the same distant board in the wide frame', 'wide',
      'Left and right outer pins are visible. The two middle marks look like one pale bar from the check rail.',
      all(f('scope', 'wide'), until(checkedFar)), 'scope.wide'),
    note('scope-close', 7, 11, 'the same distant board in the close frame', 'close',
      'Two middle marks have a gap. The right outer pin is outside the opening. The board and viewing rail have stayed fixed.',
      all(f('scope', 'close'), until(checkedFar)), 'scope.close'),
    note('scope-pair', 7, 11, 'the two checked distant views', 'deck',
      'The wide frame keeps both outside pins. The close view shows the gap. The two historic telescope cases each list their own separate magnification and the same field of view.', checkedFar),

    { ...scene('plate', 10, 11, 'the fixed plate and the lamp’s two slots', 'front', readyNear),
      artBy: { flag: 'window.plate', keys: { front: 'window.front', edge: 'window.edge' } } },
    note('plate-front', 12, 11, 'the etched plate in front light', 'front',
      'The broad etched mark stands out. The second mark reaches into a bright patch. The plate is steady in the clip.',
      all(f('plate', 'front'), until(checkedNear)), 'plate.front'),
    note('plate-edge', 12, 11, 'the same etched plate in edge light', 'edge',
      'Both etched marks are distinct. Moving the light removed the bright patch from their edge. The etchings themselves stayed put.',
      all(f('plate', 'edge'), until(checkedNear)), 'plate.edge'),
    note('plate-pair', 12, 11, 'the two checked light positions', 'edge',
      'At the same plate, one bright patch moved with the lamp. The etchings stayed with the plate. The setup tests this drawing.', checkedNear),

    { ...scene('trial', 19, 11, 'the turning rack for the harbour run', 'draft', readyTrack),
      artBy: { flag: 'window.view', keys: { image: 'window.picture', track: 'window.track' } } },
    note('trial-draft', 20, 14, 'the first title with its missing scope', 'draft',
      'THE WHOLE TRACK SEEN. The picture edge and source line go missing under this title.', until(post)),
    note('trial-image', 16, 11, 'the witness rail for the third-bell sketch', 'picture',
      'Two visible marks between the window edges at the third bell. The first turn lies to the left of the frame and the second turn lies outside the sketch too.',
      all(f('view', 'image'), until(compared)), 'trial.image'),
    note('trial-track', 23, 11, 'the independent witness rail for the two turns', 'track',
      'The west lookout saw the first turn before the third bell. The outer post saw the second after the third bell. The paired sightings locate the sketch between them.',
      all(f('view', 'track'), until(compared)), 'trial.track'),
    scene('publish', 20, 14, 'the checked picture and trace for mounting', 'draft', all(compared, until(post))),
    note('desk-detail', 16, 13, 'Cado’s full-size sketch at the side desk', 'picture',
      'Both marks sit between the window edges at the third bell. The track is at the pilot’s rail outside.', f('post', 'deck')),
    note('desk-track', 23, 13, 'Cado’s dated route trace at the side desk', 'track',
      'The two turns keep their separate lookouts and bells. The low glass outside has the original size and edge of the one sketch.', f('post', 'glass')),
  ],
};
