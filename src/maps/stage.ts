/** Fictional theatre with separate backstage and audience sightlines. */
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

type TheatreRoom = Pick<MapDef, 'id' | 'name' | 'width' | 'height' | 'background' | 'spawn'
  | 'npcs' | 'stamps' | 'interactables' | 'lights'>;

function room(plan: TheatreRoom): MapDef {
  return {
    ...plan,
    world: 'WORLD-10', music: 'music.archive', ambience: 'study',
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
  return { id, kind: 'door', x, y, w: 1, h: 1, label, to, art: 'stage.waypost' };
}

function notice(id: string, x: number, y: number, label: string, art: string, text: string,
  options: { flag?: string; visibleIf?: Condition } = {}): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, walkThrough: true, ...options };
}

export const STAGE_FOYER = room({
  id: 'stage.foyer', name: 'House of Performance: Front Foyer', width: 28, height: 17,
  background: 0x322942, spawn: { x: 12, y: 12 }, npcs: [],
  stamps: [
    { stamp: 'banners', x: 3, y: 1 }, { stamp: 'banners', x: 23, y: 1 },
    { stamp: 'window', x: 9, y: 1 }, { stamp: 'window', x: 17, y: 1 },
    { stamp: 'rug-green', x: 11, y: 9 }, { stamp: 'bench', x: 4, y: 9 },
    { stamp: 'bench', x: 20, y: 9 }, { stamp: 'plant-tall', x: 7, y: 13 },
    { stamp: 'plant-tall', x: 19, y: 13 }, { stamp: 'long-table', x: 12, y: 5 },
  ],
  interactables: [
    door('stage-rehearsal-path', 6, 3, 'the west passage to rehearsal', { map: 'stage.rehearsal', x: 12, y: 12 }),
    door('stage-gallery-path', 22, 3, 'the east passage to the audience gallery', { map: 'stage.gallery', x: 11, y: 12 }),
    { ...door('stage-nexus-return', 12, 16, 'the crossing back to the Nexus', { map: 'nexus.archive', x: 19, y: 13 }),
      art: 'preserved.door' },
    { id: 'stage-foyer-waystone', kind: 'waystone', x: 8, y: 12, w: 1, h: 1, label: 'the foyer Waystone',
      place: 'the Front Foyer', art: 'waystone' },
    notice('stage-foyer-programme', 13, 8, 'the foyer programme', 'stage.programme',
      'The west passage leads to rehearsal. The east passage leads to the gallery. Leave the middle aisle clear for the people arriving between scenes.'),
    { id: 'stage-light-proof', kind: 'scene', node: 'stage.light.dispatch', x: 18, y: 7, w: 1, h: 1,
      label: 'the foyer relief proof stand', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [{ objective: 'stage.light.o.compare' }, { not: { flagSet: 'stage.light.display' } }] } },
    notice('stage-light-shadow-display', 18, 7, 'the relief with the long doorway shadow', 'stage.relief-side',
      'A visitor felt the wait when the shadow stretched across the step. The maker’s slip dates this rehearsal, and the pictured arrival has no recorded date here.',
      { visibleIf: { flag: 'stage.light.display', eq: 'shadow' } }),
    notice('stage-light-craft-display', 18, 7, 'the relief with the visible basket grip', 'stage.relief-front',
      'A visitor read care in the hand holding the basket. The maker’s slip dates this rehearsal, and the pictured arrival has no recorded date here.',
      { visibleIf: { flag: 'stage.light.display', eq: 'craft' } }),
  ],
  lights: [
    { x: 6, y: 5, r: 59, color: 0xe6b8c7 }, { x: 22, y: 5, r: 59, color: 0xc2b7ea },
    { x: 13, y: 8, r: 75, color: 0xffd9a0 }, { x: 12, y: 14, r: 45, color: 0xc4b9e0 },
  ],
});

export const STAGE_REHEARSAL = room({
  id: 'stage.rehearsal', name: 'House of Performance: Rehearsal Room', width: 28, height: 17,
  background: 0x352a3f, spawn: { x: 12, y: 12 },
  npcs: [{ id: 'stage-director', x: 12, y: 6, facing: 'down' }],
  stamps: [
    { stamp: 'banners', x: 6, y: 1 }, { stamp: 'banners', x: 19, y: 1 },
    { stamp: 'cabinet', x: 3, y: 4 }, { stamp: 'crates', x: 22, y: 4 },
    { stamp: 'long-table', x: 5, y: 7 }, { stamp: 'bench', x: 20, y: 10 },
    { stamp: 'rug-green', x: 12, y: 9 }, { stamp: 'plant-tall', x: 5, y: 13 },
  ],
  interactables: [
    door('stage-rehearsal-return', 12, 16, 'the passage back to the foyer', { map: 'stage.foyer', x: 6, y: 5 }),
    door('stage-rehearsal-to-gallery', 25, 8, 'the wing door to the audience gallery', { map: 'stage.gallery', x: 3, y: 8 }),
    { id: 'stage-rehearsal-table', kind: 'stage-rehearsal', x: 13, y: 8, w: 1, h: 1,
      label: 'the rehearsal stand', art: 'stage.rehearsal' },
    notice('stage-blocking', 8, 7, 'the blocking plan', 'stage.cues',
      'The keeper moves the crate to a mark beside the doorway. The worker stays at the threshold. Both rehearsals follow that movement and use the same lines.',
      { flag: 'stage.blocking' }),
    notice('stage-script-draft', 17, 8, 'the pencilled programme claim', 'preserved.slip',
      'THE WORKER HAS A NEW LINE. The printer wrote this before seeing the two rehearsals.',
      { visibleIf: { not: { objective: 'stage.compare' } } }),
    notice('stage-script-checked', 17, 8, 'the checked script note', 'stage.cues',
      'SAME LINES. The worker says “I can wait” in both. Compare the place of the silence beside the crate move.',
      { visibleIf: { objective: 'stage.compare' } }),
    { id: 'stage-light-stand', kind: 'scene', node: 'stage.light.stand', x: 17, y: 12, w: 1, h: 1,
      label: 'the lantern bracket beside the paper scene', art: 'stage.waypost', walkThrough: true,
      visibleIf: { objective: 'stage.arrival' } },
    notice('stage-light-view-side', 19, 12, 'the same doorway with a side lamp', 'stage.relief-side',
      'The basket and figure are on their original marks. A long shadow crosses the open step. A visitor points to that dark strip and describes the moment as hesitation.',
      { flag: 'stage.light.view.side', visibleIf: { flag: 'stage.light.mode', eq: 'side' } }),
    notice('stage-light-view-front', 19, 12, 'the same doorway with a front lamp', 'stage.relief-front',
      'The figure is where it was. Its shadow now sits close to its feet. A reader follows the visible hand to the handle and sees care in the grip.',
      { flag: 'stage.light.view.front', visibleIf: { flag: 'stage.light.mode', eq: 'front' } }),
    notice('stage-light-maker', 23, 12, 'the dated relief maker’s slip', 'preserved.slip',
      'Paper cut-out, second rehearsal in this room. The maker has dated the work on the relief. The scene is from an untimed company story about a person arriving at a doorway.',
      { flag: 'stage.light.maker', visibleIf: { objective: 'stage.arrival' } }),
  ],
  lights: [
    { x: 12, y: 6, r: 70, color: 0xffd7a8 }, { x: 13, y: 8, r: 58, color: 0xf9caa4 },
    { x: 8, y: 7, r: 48, color: 0xebc4cd }, { x: 25, y: 8, r: 54, color: 0xb9c8e8 },
  ],
});

export const STAGE_GALLERY = room({
  id: 'stage.gallery', name: 'House of Performance: Audience Gallery', width: 27, height: 17,
  background: 0x332a46, spawn: { x: 11, y: 12 },
  npcs: [{ id: 'stage-host', x: 14, y: 7, facing: 'down' }],
  stamps: [
    { stamp: 'banners', x: 8, y: 1 }, { stamp: 'banners', x: 17, y: 1 },
    { stamp: 'window', x: 12, y: 1 }, { stamp: 'barrel', x: 19, y: 5 },
    { stamp: 'bench', x: 5, y: 8 }, { stamp: 'bench', x: 20, y: 8 },
    { stamp: 'bench', x: 4, y: 11 }, { stamp: 'bench', x: 21, y: 11 },
    { stamp: 'rug-green', x: 11, y: 8 },
    { stamp: 'plant-tall', x: 3, y: 14 }, { stamp: 'plant-tall', x: 23, y: 14 },
  ],
  interactables: [
    door('stage-gallery-return', 11, 16, 'the passage back to the foyer', { map: 'stage.foyer', x: 22, y: 5 }),
    door('stage-gallery-to-rehearsal', 2, 8, 'the wing door to rehearsal', { map: 'stage.rehearsal', x: 24, y: 8 }),
    notice('stage-vantage', 18, 7, 'the audience sightlines note', 'stage.cues',
      'From the front bench the crate move is easy to see. A post hides part of it from the side seats. Both seats can hear the lines and the silence between them.',
      { flag: 'stage.vantage' }),
    { id: 'stage-seat-request', kind: 'scene', node: 'stage.seats.request', x: 10, y: 13, w: 1, h: 1,
      label: 'the folded seat request', art: 'preserved.slip', walkThrough: true,
      visibleIf: { all: [{ objective: 'stage.arrival' }, { not: { flagSet: 'stage.seats.plan' } }] } },
    { id: 'stage-seat-post', kind: 'scene', node: 'stage.seats.post', x: 15, y: 12, w: 1, h: 1,
      label: 'the movable queue post', art: 'stage.waypost', walkThrough: true,
      visibleIf: { all: [{ objective: 'stage.arrival' }, { not: { flagSet: 'stage.seats.plan' } }] } },
    { id: 'stage-seat-desk', kind: 'scene', node: 'stage.seats.desk', x: 13, y: 13, w: 1, h: 1,
      label: 'the usher’s seating desk', art: 'preserved.folder', walkThrough: true,
      visibleIf: { all: [{ objective: 'stage.seats.o.inspect' }, { not: { flagSet: 'stage.seats.plan' } }] } },
    notice('stage-seat-reserve', 12, 13, 'the aisle seat with a ribbon', 'preserved.display-records',
      'Aisle seat held until the opening bell. If still free at the bell, it returns to the open seats. The queue starts beside the wall. The folded request stays at the desk.',
      { visibleIf: { flag: 'stage.seats.plan', eq: 'reserve' } }),
    notice('stage-seat-queue', 25, 11, 'the queue post at the wall', 'stage.waypost',
      'Seats are open in order. Before the line moves, the person at the front can use the low seat map and choose an unclaimed place. The aisle stays clear.',
      { visibleIf: { flag: 'stage.seats.plan', eq: 'queue' } }),
    notice('stage-response-pause', 8, 6, 'the programme for the pause first', 'stage.pause',
      'Tonight’s stage cue leaves the silence before the keeper moves the crate. The front bench sees the movement after the wait.',
      { visibleIf: { flag: 'stage.response', eq: 'pause' } }),
    notice('stage-response-move', 21, 6, 'the programme for the move first', 'stage.move',
      'Tonight’s stage cue moves the crate before the silence. The front bench sees the keeper make room before the wait.',
      { visibleIf: { flag: 'stage.response', eq: 'move' } }),
    notice('stage-reader-note', 17, 10, 'the audience note', 'preserved.slip',
      'From my seat, I heard the worker say they could wait. Had the keeper refused to let them through, or did they want to wait?',
      { flag: 'stage.feedback', visibleIf: { flagSet: 'stage.response' } }),
    notice('stage-followup-notice', 12, 10, 'the revised scene note', 'stage.programme',
      'The programme notes what moves on stage and which part the post hides. The keeper’s reason stays open.',
      { visibleIf: { flag: 'stage.followup', eq: true } }),
    notice('stage-cue-copy', 7, 12, 'the cue copy by the low bench', 'preserved.display-records',
      'The large cue sheet keeps the two lines, visible move, and silent beat apart. The understudy can rehearse with either order.',
      { visibleIf: { flag: 'stage.cue-copy', eq: true } }),
  ],
  lights: [
    { x: 8, y: 6, r: 64, color: 0xf6c3b8 }, { x: 14, y: 6, r: 71, color: 0xffd9a3 },
    { x: 18, y: 6, r: 64, color: 0xc8b8e9 }, { x: 12, y: 12, r: 56, color: 0xc2aaca },
  ],
});
