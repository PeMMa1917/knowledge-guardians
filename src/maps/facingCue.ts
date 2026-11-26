import { FACING_CUE_PREFIX, FACING_HOUSE_READY, facingCueChecked, facingCuePlan } from '../content/facingCue';
import { CUE_PLANS, type FacingSite } from '../domain/facingCue';
import type { Interactable, MapDef } from './types';

export const NEXUS_FACING_ACTOR: MapDef['npcs'][number] = { id: 'facing-sella', x: 14, y: 17, facing: 'left' };

function board(site: FacingSite, x: number, y: number): Interactable {
  return {
    id: `facing-cue-${site}`, kind: 'fieldgame', game: FACING_CUE_PREFIX + site, x, y, w: 1, h: 1,
    label: site === 'nexus' ? 'Sella’s four-beat rehearsal floor' : 'Sella’s slip on the gallery entrance rail',
    art: 'stage.cues', walkThrough: true,
    visibleIf: site === 'nexus' ? { flagSet: 'facing.nexus.started' } : FACING_HOUSE_READY,
  };
}

export const NEXUS_FACING_CUE: Interactable[] = [
  board('nexus', 12, 16),
  ...CUE_PLANS.flatMap((plan): Interactable[] => {
    const shared = plan === 'shared';
    const placement = { x: shared ? 13 : 19, y: 14, w: 1, h: 1, walkThrough: true,
      art: shared ? 'fold.strip' : 'fold.paired' };
    const label = shared ? 'the lamp-side lead-in' : 'the independent entrance cards';
    return [
      { ...placement, id: `facing-nexus-arrival-${plan}`, kind: 'scene', node: `facing.nexus.read.${plan}`, label,
        visibleIf: { all: [facingCuePlan('nexus', plan), { not: facingCueChecked('nexus') }] } },
      { ...placement, id: `facing-nexus-kept-${plan}`, kind: 'sign', label,
        visibleIf: { flag: 'facing.nexus.checked', eq: plan },
        text: shared ? 'Sella works the four-beat lead-in. The waiting runners enter together. The spare coat hooks are clear.'
          : 'The runner at each entrance can start alone. The second facing card hangs on the last coat hook.' },
    ];
  }),
];

export const STAGE_FACING_CUE = board('house', 13, 11);
