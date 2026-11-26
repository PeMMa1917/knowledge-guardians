import { describe, expect, it } from 'vitest';
import {
  LEAVITT_EXHIBIT, LEAVITT_KEY, LEAVITT_OBJECTIVE, LEAVITT_REVISIT,
} from '../src/content/leavittPlate';
import { check } from '../src/domain/rules';
import { ownsSpecimen, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

describe('The Back of the Glass', () => {
  it('uses one Harvard accession and keeps the two documented dates separate', () => {
    const d = new Driver();
    const locations = Object.values(MAPS).flatMap((map) =>
      map.interactables.filter(({ exhibit }) => exhibit === LEAVITT_EXHIBIT).map(() => map.id));
    expect(locations).toEqual(['observatory.archive']);
    const record = d.e.pack.exhibits.find(({ id }) => id === LEAVITT_EXHIBIT);
    expect(record).toMatchObject({
      dateText: '15 April 1898 (catalogue UTC). Analysed by 2 November 1906.',
      specimen: { key: LEAVITT_KEY, accession: 'a02969 (a2969 in the exhibition article)', revisit: LEAVITT_REVISIT },
    });
  });

  it.each(['chart', 'watch'] as const)('uses the %s on the headland before earning the working plate', (route) => {
    const d = new Driver();
    const chart = route === 'chart';
    d.s.objectivesDone.push('coast.arrival');
    d.s.mapId = 'observatory.archive';
    const dispatch = MAPS[d.s.mapId].interactables.find(({ id }) => id === 'leavitt-send')!;
    expect(check(dispatch.visibleIf, d.s)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: LEAVITT_EXHIBIT });
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: LEAVITT_EXHIBIT })).toThrow('Finish the object’s quest first');
    d.walk('leavitt.plate.turn', ['match both corner stops']);
    expect(check(dispatch.visibleIf, d.s)).toBe(false);
    d.walk('leavitt.plate.compare', ['control circle separately']);
    expect(check(dispatch.visibleIf, d.s)).toBe(true);
    d.walk('leavitt.plate.dispatch', [chart ? 'Leave a registered chart' : 'Leave the control mark']);
    expect(d.done(LEAVITT_OBJECTIVE)).toBe(false);

    d.s.mapId = 'observatory.station';
    const shown = MAPS[d.s.mapId].interactables.filter((item) =>
      ['leavitt-headland-chart', 'leavitt-headland-watch'].includes(item.id) && check(item.visibleIf, d.s));
    expect(shown.map(({ id }) => id)).toEqual([`leavitt-headland-${route}`]);
    d.walk(`leavitt.plate.${route}`, [chart ? 'Set the two corner pegs' : 'Clip the control']);
    expect(d.done(LEAVITT_OBJECTIVE)).toBe(true);

    d.s.mapId = 'observatory.archive';
    d.run({ type: 'ClaimSpecimen', exhibit: LEAVITT_EXHIBIT });
    expect(ownsSpecimen(d.s, LEAVITT_KEY)).toBe(true);
    d.s.mapId = LEAVITT_REVISIT.map;
    const revisit = MAPS[d.s.mapId].interactables.find(({ id }) => id === LEAVITT_REVISIT.prop)!;
    expect(check(revisit.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(LEAVITT_KEY) });
    expect(check(revisit.visibleIf, d.s)).toBe(true);
    d.walk(revisit.node!, ['Set the two corner marks']);
    expect(d.s.journal).toContain('j.leavitt.nile');
    expect(d.s.flags['leavitt.revisit.nile.used']).toBe(true);
    expect(check(revisit.visibleIf, d.s)).toBe(false);
    expect(d.done('coast.revise')).toBe(false);
  });
});
