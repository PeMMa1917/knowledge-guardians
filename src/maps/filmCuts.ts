import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const stageStarted: Condition = { flag: 'film.stage.started', eq: true };
const coastStarted: Condition = { flag: 'film.coast.started', eq: true };
const coastUnposted: Condition = { not: { flagSet: 'film.coast.layout' } };

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition, flag?: string): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, flag, visibleIf, walkThrough: true };
}

export const STAGE_FILM_REHEARSAL: Interactable[] = [
  scene('stage-film-catalogue', 'film.stage.brief', 14, 12, 'the camera catalogue and practice plan', 'preserved.folder',
    { all: [{ objective: 'stage.arrival' }, { not: stageStarted }] }),
  { id: 'stage-film-front', kind: 'film-camera', node: 'front', x: 19, y: 6, w: 1, h: 1, walkThrough: true,
    label: 'the front camera facing the painted stripe', art: 'frames.samples', visibleIf: stageStarted },
  { id: 'stage-film-wing', kind: 'film-camera', node: 'wing', x: 6, y: 10, w: 1, h: 1, walkThrough: true,
    label: 'the wing camera facing the doorway', art: 'frames.still', visibleIf: stageStarted },
  { id: 'stage-film-editor', kind: 'film-editor', x: 15, y: 12, w: 1, h: 1, walkThrough: true,
    label: 'the editing stand with both takes', art: 'frames.sequence', visibleIf: { objective: 'film.stage.takes' } },
];

export const CUE_FRAME_READER: MapDef['npcs'][number] = {
  id: 'film-door-reader', x: 10, y: 10, facing: 'right', visibleIf: { flag: 'film.stage.cut', eq: 'cue' },
};
export const MOTION_FRAME_READER: MapDef['npcs'][number] = {
  id: 'film-door-reader', x: 21, y: 8, facing: 'left', visibleIf: { flag: 'film.stage.cut', eq: 'motion' },
};

export const STAGE_FILM_GALLERY = sign('stage-film-cue', 10, 9, 'the first-beat cue on the low rail', 'frames.sequence',
  'Beat one: look for the keeper’s raised palm at the stripe. Beat two: find the doorway. Delwen waited for the second picture before choosing a place to stand.',
  { flag: 'film.stage.cut', eq: 'cue' });
export const STAGE_FILM_FOYER = sign('stage-film-motion', 20, 8, 'the doorway-first strip and loose first-beat tab', 'frames.still',
  'This strip opens on beat two, at the doorway. A tab turns immediately to beat one and the waiting gesture. Delwen is at the route post asking where the first cue went.',
  { flag: 'film.stage.cut', eq: 'motion' });

export const COAST_FILM_STANDS: Interactable[] = [
  scene('coast-film-handoff', 'film.coast.notice', 7, 14, 'the signalkeeper’s editing clips', 'frames.proof',
    { all: [{ item: 'item.film.cut' }, { not: coastStarted }] }),
  sign('coast-film-still', 6, 13, 'the old picture of the lower ledge', 'frames.still',
    'Last fourth-day bell, second watch. This frame shows the blue post and the lower ledge open at that time. The painted post still stands by the lower path.',
    coastStarted, 'film.coast.still'),
  sign('coast-film-live', 11, 13, 'the current waiting mark at the stair', 'coast.signal',
    'Today, second watch. The lower ledge is shut. At this stair the crew use an open left palm to ask carriers to hold. The live marker directs them up the stone steps.',
    { all: [coastStarted, coastUnposted] }, 'film.coast.live'),
  scene('coast-film-place', 'film.coast.place', 7, 14, 'the two strips ready to place', 'frames.proof',
    { all: [{ objective: 'film.coast.checked' }, coastUnposted] }),
  sign('coast-film-cue', 8, 13, 'the live instruction and its old frame', 'coast.signal',
    'A carrier leaves the closed ledge and takes the stair. The current note was the first thing she could read. The earlier photograph stays on the reverse with its date.',
    { flag: 'film.coast.layout', eq: 'cue' }, 'film.coast.read'),
  sign('coast-film-view', 11, 13, 'the live stair instruction and its landmark reference', 'frames.sequence',
    'A carrier on the lower path finds the painted post from the dated picture, then follows the separate stair sign. He reaches the upper steps without treating the old open ledge as permission.',
    { flag: 'film.coast.layout', eq: 'view' }, 'film.coast.read'),
];
