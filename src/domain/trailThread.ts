import type { CampaignState, ContentPack, Mission, Objective } from './types';

export type ThreadFace = 'thing' | 'voice';
export const threadKey = 'diary.thread.step';
export const threadFaceKey = 'diary.thread.face';
export interface TrailMarker {
  paper: string;
  thing: string;
  voice: string;
}

// These are illustrations on a journal ribbon. A student can turn it over without
// claiming to have collected the object or already met the person it evokes.
export const trailMarkers: Readonly<Record<string, TrailMarker>> = {
  'WORLD-01': {
    paper: 'A little paper drawer',
    thing: 'A thin strip of light falls across an empty label.',
    voice: 'A hand holds the drawer so the next visitor can look.',
  },
  'WORLD-02': {
    paper: 'A market awning',
    thing: 'Two price tags hang from the same brass hook.',
    voice: 'A listener leans past a louder customer to hear the person at the stall.',
  },
  'WORLD-03': {
    paper: 'A folded river reed',
    thing: 'A name breaks off where the last fibres fray.',
    voice: 'A scribe has left room beneath a royal line for a second account.',
  },
  'WORLD-04': {
    paper: 'An envelope with two windows',
    thing: 'A receipt shows through one window. The other is empty.',
    voice: 'Somebody has pencilled a family name across the flap.',
  },
  'WORLD-05': {
    paper: 'A red harbour pennant',
    thing: 'A bell swings over a tide mark half lost under the water.',
    voice: 'The signal keeper has turned to see who can hear the bell.',
  },
  'WORLD-06': {
    paper: 'A wing cut from tracing paper',
    thing: 'The fold crosses a trail of small prints under the canopy.',
    voice: 'Two watchers stand on opposite sides of the same tree.',
  },
  'WORLD-07': {
    paper: 'A blue metal rubbing',
    thing: 'Two panels shine the same blue. A file has nicked one edge.',
    voice: 'A ferry worker is waiting to take the winch into both hands.',
  },
  'WORLD-08': {
    paper: 'A small printer’s fist',
    thing: 'The pointing finger lands on a blank between Monday and Wednesday.',
    voice: 'A reader with wet shoes has come all the way to the locked hall.',
  },
  'WORLD-09': {
    paper: 'A pleated patch of sea',
    thing: 'A sounding line stops at the edge of the ink.',
    voice: 'A boatkeeper draws the shoal from the height of a seated child.',
  },
  'WORLD-10': {
    paper: 'A ticket shaped like a sleeve',
    thing: 'A single stitch marks the instant before the curtain rises.',
    voice: 'The understudy can see the caller from a seat at the side.',
  },
  'WORLD-11': {
    paper: 'A basket cut from a receipt',
    thing: 'The same coin lies beside two differently filled baskets.',
    voice: 'A buyer puts the handle down to count what is left in her pocket.',
  },
  'WORLD-12': {
    paper: 'A blue sheet folded into a gate',
    thing: 'The waterline continues around the back of the page.',
    voice: 'A downstream neighbour cups a hand to catch the upstream voice.',
  },
  'WORLD-13': {
    paper: 'A corner of a route notice',
    thing: 'A dotted line nearly reaches the last stop.',
    voice: 'Someone in a doorway holds the timetable low enough for a child to read.',
  },
  'WORLD-14': {
    paper: 'A paper lantern with two shutters',
    thing: 'One shutter casts a longer shadow than the other.',
    voice: 'A listener keeps a second chair empty beside the light.',
  },
  'WORLD-15': {
    paper: 'A crate lid in miniature',
    thing: 'A chalk mark continues on the other side of the hinge.',
    voice: 'Someone on the landing has put a hand up before the count begins.',
  },
  'WORLD-16': {
    paper: 'A ribbon folded over a hinge',
    thing: 'A pencil rests in the groove where the last checker laid it.',
    voice: 'A second hand is waiting to take the pencil.',
  },
};
export type TrailObjective = Objective & { mission: Mission; complete: boolean };
export type ThreadCommand =
  | { type: 'TieJournalThread'; step: string; face: ThreadFace }
  | { type: 'UntieJournalThread' };

export function tiedThread(pack: ContentPack, state: CampaignState) {
  const step = state.flags[threadKey];
  if (typeof step !== 'string') return;
  const face: ThreadFace = state.flags[threadFaceKey] === 'voice' ? 'voice' : 'thing';
  for (const mission of pack.missions) {
    const objective = mission.objectives.find((o) => o.id === step);
    if (objective && trailMarkers[mission.world])
      return { objective, mission, face, marker: trailMarkers[mission.world] };
  }
}

export function threadRecap(
  pack: ContentPack,
  state: CampaignState,
  visible: readonly TrailObjective[],
): string[] {
  const tied = tiedThread(pack, state);
  if (!tied) return [];
  const { objective, mission, face, marker } = tied;
  const intro = 'Your ribbon in “' + mission.title + '”. ' + marker[face];
  if (state.objectivesDone.includes(objective.id)) {
    const next = visible.find((o) => o.mission.id === mission.id && !o.complete);
    return [
      intro,
      'You finished the step you marked. ' +
        (next
          ? 'Another lead in this story is “' + next.title + '”'
          : 'The ribbon can stay here or move to a different story.'),
    ];
  }
  if (visible.some((o) => o.id === objective.id && !o.complete))
    return [intro, 'You marked this for your return. ' + objective.title];
  return [intro, 'That lead is quiet for now. The ribbon stays on the page while you follow another story.'];
}
