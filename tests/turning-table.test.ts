import { describe, expect, it } from 'vitest';
import { microSkillId } from '../src/content/microSkillEvidence';
import { TURNING_CARD, TURNING_EXHIBIT, TURNING_OBJECTIVE } from '../src/content/turningTable';
import people from '../src/content/navigation-people.json';
import { check } from '../src/domain/rules';
import { specimenToolId } from '../src/domain/specimenGear';
import { turningView } from '../src/domain/turningTable';
import { MAPS } from '../src/maps';
import { TURNING_DOOR, TURNING_READERS, TURNING_ROOM } from '../src/maps/turningTable';
import { BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

describe('A Shore You Can Turn', () => {
  it('identifies the particular late nineteenth-century coast piece and its sources', () => {
    const d = new Driver();
    const e = d.e.pack.exhibits.find(({ id }) => id === TURNING_EXHIBIT)!;
    expect(e.specimen).toMatchObject({ key: 'nka:holm-collection-fig390-a', accession: 'Holm collection, fig. 390 A', objective: TURNING_OBJECTIVE });
    expect(e.dateText).toContain('8 February 1885');
    expect(e.dateKind).toContain('received it from Kunit');
    expect(e.summary).toContain('separate islands piece 390 B');
    expect(e.specimen?.people).toContainEqual(expect.objectContaining({ name: 'Kunit of Umivik',
      role: 'Inuit map maker from Umivik named in the Walters label', source: 'HIS-KUNIT-WALTERS' }));
    expect(BIG_ART[e.art]).toBe('big.turning.kunit-case');
    const placements = Object.values(MAPS).flatMap((map) => map.interactables.filter((prop) => prop.exhibit === e.id).map(() => map.id));
    expect(placements).toEqual(['sea.turning-room']);
    expect(MAPS['sea.turning-room']).toMatchObject({
      ...TURNING_ROOM, interactables: expect.arrayContaining(TURNING_ROOM.interactables),
    });
    expect(MAPS['sea.chartroom'].interactables).toContain(TURNING_DOOR);
    expect(check(TURNING_DOOR.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('sea.arrival');
    expect(check(TURNING_DOOR.visibleIf, d.s)).toBe(true);
  });

  it('promotes the existing Tupaia exhibit in place and resolves every historical role source', () => {
    const d = new Driver();
    const specimen = d.e.pack.exhibits.find((e) => e.specimen?.key === 'bl:add-ms-21593-c')!;
    expect(specimen.id).toBe('OBJ-DEPART-TUPAIA');
    expect(specimen.sources).toEqual(['HIS-DEPART-01', 'HIS-DEPART-02', 'HIS-DEPART-03']);
    expect(specimen.specimen?.objective).toBe('departure.ferry.checked');
    const places = Object.values(MAPS).flatMap((map) => map.interactables.filter((prop) => prop.exhibit === specimen.id).map(() => map.id));
    expect(places).toEqual(['aethelgard.ferry']);
    for (const [key, roles] of Object.entries(people)) {
      const record = d.e.pack.exhibits.find((e) => e.specimen?.key === key);
      expect(record?.specimen?.people, key).toEqual(expect.arrayContaining(roles));
      for (const { name, source } of roles) expect(d.e.pack.sources.some(({ id }) => id === source), name).toBe(true);
    }
  });

  it('turns the shore first while the offshore peg stays fixed', () => {
    expect(turningView('near', 'left')).toMatchObject({ coastMark: 0, islandMark: 0 });
    expect(turningView('other', 'left')).toMatchObject({ coastMark: 2, islandMark: 0 });
    expect(turningView('other', 'right')).toMatchObject({ coastMark: 2, islandMark: 2 });
  });

  it.each([
    ['OBJ-DEPART-TUPAIA', 'departure.ferry.checked', 'aethelgard.ferry', 'ferry-tupaia-return', 'Set a marked start', 'ferry-tupaia-footpath'],
    [TURNING_EXHIBIT, TURNING_OBJECTIVE, 'sea.turning-room', 'turning-working-copy', 'Give the second reader', 'turning-return-pair'],
  ])('opens the equipped return for %s after claiming the working copy', (exhibit, goal, map, hookId, option, replyId) => {
    const d = new Driver();
    const record = d.e.pack.exhibits.find(({ id }) => id === exhibit)!;
    const hook = MAPS[map].interactables.find(({ id }) => id === hookId)!;
    expect(record.specimen?.revisit).toMatchObject({ map, prop: hookId });
    expect(check(hook.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push(goal);
    d.run({ type: 'InspectExhibit', exhibit });
    d.run({ type: 'ClaimSpecimen', exhibit });
    expect(check(hook.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.specimen!.key) });
    expect(check(hook.visibleIf, d.s)).toBe(true);
    d.walk(hook.node!, [option]);
    expect(check(hook.visibleIf, d.s)).toBe(false);
    const reply = MAPS[map].interactables.find(({ id }) => id === replyId)!;
    expect(check(reply.visibleIf, d.s)).toBe(true);
  });

  it.each(['rail', 'keeper'])('requires the actual %s reply alongside both checks before recording raised-mark practice', (route) => {
    const d = new Driver();
    const skill = microSkillId(744);
    d.s.objectivesDone.push('sea.arrival');
    d.run({ type: 'InspectExhibit', exhibit: TURNING_EXHIBIT });
    expect(check({ card: TURNING_CARD }, d.s)).toBe(true);
    for (const flag of ['note', 'fixed', 'shifted']) d.run({ type: 'SetFlag', flag: `turning.kunit.${flag}`, value: true });
    d.run({ type: 'SetFlag', flag: 'turning.kunit.route', value: route });
    const reader = TURNING_READERS.find(({ id }) => id === `turning-${route}`)!;
    expect(check(reader.visibleIf, d.s)).toBe(true);
    expect(check(reader.artOpen?.if, d.s)).toBe(false);
    expect(d.p.skills[skill]).toBeUndefined();
    d.run({ type: 'SetFlag', flag: 'turning.kunit.read', value: route === 'rail' ? 'keeper' : 'rail' });
    expect(d.p.skills[skill]).toBeUndefined();
    d.run({ type: 'SetFlag', flag: 'turning.kunit.read', value: route });
    expect(d.done(TURNING_OBJECTIVE)).toBe(true);
    expect(check(reader.artOpen?.if, d.s)).toBe(true);
    expect(d.s.journal).toContain('j.turning.kunit');
    expect(d.p.skills[skill]).toEqual([expect.stringContaining(`WORLD-09|game-189|${TURNING_OBJECTIVE}`)]);
  });
});
