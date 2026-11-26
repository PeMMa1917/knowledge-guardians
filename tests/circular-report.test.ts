import { describe, expect, it } from 'vitest';
import { MICRO_SKILLS, microSkillId } from '../src/content/microSkillEvidence';
import { guideObjectives } from '../src/domain/guidance';
import { check } from '../src/domain/rules';
import { restoreMicroSkillUses } from '../src/domain/skills';
import { CIRCULAR_REPORT_EMBERFORD } from '../src/maps/circularReport';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const scope = 'ember.circle.';
const skill = microSkillId(317);
const evidence = 'WORLD-02|game-258|ember.circle.trace|HUM,LAN';
const packet = 'item.ember.circle-packet';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === 'circlereport-' + id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function use(d: Driver, id: string, action: string) {
  const prop = visible(d, id);
  expect(prop?.node, id).toBeDefined();
  d.walk(prop!.node!, [action]);
}

function enter(d: Driver) {
  d.s.objectivesDone.push('m01.o6.label');
  d.run({ type: 'Reach', zone: 'portal' });
  d.s.mapId = 'aethelgard.emberford';
  expect(visible(d, 'stall')).toBeUndefined();
  d.run({ type: 'Reach', zone: 'emberford' });
  expect(d.done('m02.o1.arrive')).toBe(true);
}

function trace(d: Driver) {
  enter(d);
  use(d, 'stall', 'Lift the corner');
  use(d, 'tea', 'Keep the tea slip');
  use(d, 'ledger', 'Lay both slips');
  use(d, 'witness', 'Set the signed sightline');
}

describe('The Copy That Came Back', () => {
  it('awards row 317 once after physically tracing the return citation and keeping the limited independent view', () => {
    const d = new Driver();
    enter(d);
    expect(MICRO_SKILLS.filter(({ number }) => number === 317)).toEqual([expect.objectContaining({
      uses: [expect.objectContaining({ objective: scope + 'trace', game: 258, story: 77 })],
    })]);
    expect(visible(d, 'ledger')).toBeUndefined();
    use(d, 'stall', 'Leave the poster');
    expect(visible(d, 'tea')).toBeUndefined();
    use(d, 'stall', 'Lift the corner');
    use(d, 'tea', 'Keep the tea slip');
    expect(d.p.skills[skill]).toBeUndefined();
    use(d, 'witness', 'Set the signed sightline');
    expect(d.e.node(scope + 'witness').text).toContain('retaining wall hides the lower landing');
    expect(d.p.skills[skill]).toBeUndefined();
    expect(visible(d, 'prepare')).toBeUndefined();
    expect(restoreMicroSkillUses(d.p, d.e.pack, d.s.objectivesDone).skills[skill]).toBeUndefined();
    use(d, 'ledger', 'Lay both slips');
    expect(d.e.node(scope + 'ledger.kept').text).toContain('The replacement stall notice cited that tea slip');
    expect(d.p.skills[skill]).toEqual([evidence]);
    expect(restoreMicroSkillUses(d.p, d.e.pack, d.s.objectivesDone).skills[skill]).toEqual([evidence]);
  });

  it('serves each reader differently using one checked packet and equal skill records', () => {
    const results = (['runner', 'record'] as const).map((choice) => {
      const d = new Driver();
      trace(d);
      use(d, 'prepare', 'Keep the pieces');
      expect(d.s.inventory[packet]).toBeUndefined();
      use(d, 'prepare', choice === 'runner' ? 'Clip Havra’s bounded sighting' : 'Bind the original');
      expect(d.s.inventory[packet]).toBe(1);
      expect(visible(d, 'receive.' + (choice === 'runner' ? 'record' : 'runner'))).toBeUndefined();
      use(d, 'receive.' + choice, choice === 'runner' ? 'Hang the upper-landing note' : 'Set the source trail');
      expect(d.done(scope + 'deliver')).toBe(true);
      expect(visible(d, 'result.' + choice)?.text).toContain(choice === 'runner' ? 'fresh check' : 'One original report');
      expect(d.s.journal.filter((id) => id === 'j.ember.circle')).toHaveLength(1);
      return { credit: d.p.credit, skill: d.p.skills[skill] };
    });
    expect(results[0]).toEqual(results[1]);
  });

  it('offers the local trace ahead of the main hint and gives it four levels', () => {
    const d = new Driver();
    enter(d);
    use(d, 'stall', 'Lift the corner');
    expect(d.e.currentObjective(d.s)?.id).not.toBe(scope + 'trace');
    expect(guideObjectives(d.e.visibleObjectives(d.s), 'WORLD-02', scope + 'trace')[0]?.id).toBe(scope + 'trace');
    for (let depth = 1; depth <= 4; depth++) {
      const reply = d.run({ type: 'RequestHint', objective: scope + 'trace' }).events.find((event) => event.kind === 'hint');
      expect(reply?.hint.depth).toBe(depth);
      expect(d.p.skills[skill]).toBeUndefined();
    }
  });

  it('gives the props clear market tiles outside earlier fixtures and actors', () => {
    const map = MAPS['aethelgard.emberford'];
    for (const { id, x, y } of CIRCULAR_REPORT_EMBERFORD) {
      expect(map.floor(x, y), id).not.toBeNull();
      const overlap = [...map.npcs, ...map.interactables].filter((entry) => !entry.id.startsWith('circlereport-')
        && x >= entry.x && x < entry.x + ('w' in entry ? entry.w : 1)
        && y >= entry.y && y < entry.y + ('h' in entry ? entry.h : 1));
      expect(overlap.map((entry) => entry.id), id).toEqual([]);
    }
  });
});
