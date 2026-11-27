import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { THREAD_BEND_CHARTROOM, THREAD_BEND_HARBOUR } from '../src/maps/threadBend';
import { Driver } from './driver';

const scope = 'sea.threadbend.';
const guide = 'item.sea.threadbend-guide';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function use(d: Driver, id: string, action: string) {
  const prop = visible(d, 'threadbend-' + id);
  expect(prop?.node, id).toBeDefined();
  d.walk(prop!.node!, [action]);
}

function cross(d: Driver, id: string) {
  const prop = visible(d, id);
  expect(prop?.to, id).toBeDefined();
  expect(check(prop?.openIf, d.s)).toBe(true);
  d.s.mapId = prop!.to!.map;
}

function begin(d: Driver) {
  d.s.mapId = 'sea.chartroom';
  expect(visible(d, 'threadbend-story')).toBeUndefined();
  d.s.objectivesDone.push('sea.finish');
  use(d, 'story', 'Leave the story');
  expect(visible(d, 'threadbend-pin')).toBeUndefined();
  use(d, 'story', 'Keep Ariadne’s starting point');
}

function runModel(d: Driver) {
  begin(d);
  use(d, 'pin', 'Move the cord to the inner turn');
  expect(visible(d, 'threadbend-outer')).toBeUndefined();
  use(d, 'inner', 'Leave the markers');
  expect(d.s.flags[scope + 'inner.envelope']).toBeUndefined();
  use(d, 'inner', 'Slide the envelope marker');
  expect(visible(d, 'threadbend-bind')).toBeUndefined();
  use(d, 'inner', 'Slide the tray marker');
  expect(d.e.node(scope + 'inner.tray').text).toContain('stops against');
  expect(visible(d, 'threadbend-bind')).toBeUndefined();
  use(d, 'pin', 'Move the cord to the outer turn');
  expect(visible(d, 'threadbend-inner')).toBeUndefined();
  use(d, 'outer', 'Slide the tray marker');
  expect(d.e.node(scope + 'outer.tray').text).toContain('same tray clears');
  expect(d.s.flags[scope + 'inner.tray']).toBe(true);
  expect(d.done(scope + 'compare')).toBe(true);
}

describe('The Thread at the Bend', () => {
  it('attributes the myth to the public written account and separates the practice runs', () => {
    const d = new Driver();
    runModel(d);
    const myth = d.e.node(scope + 'story');
    expect(myth.historicalLabel).toBe('documented');
    const source = d.e.pack.sources.find(({ id }) => id === myth.citationSource);
    expect(source?.url).toBe('https://www.theoi.com/Text/ApollodorusE.html#1');
    expect(source?.locator).toContain('Epitome 1.8 and 1.9');
    expect(d.e.node(scope + 'inner.tray').historicalLabel).toBe('fictional-world');
  });

  it('recovers a partly tried model through a saved slot and an ordinary map return', () => {
    const d = new Driver();
    begin(d);
    use(d, 'pin', 'Move the cord to the inner turn');
    use(d, 'inner', 'Slide the envelope marker');
    cross(d, 'sea-chartroom-return');
    const keys = writeSuspend(emptyPair(), { label: 'Partial model', kind: 'suspend', location: 'Seagrass Steps',
      savedAt: '2026-11-26T15:30:00Z', state: d.s });
    const reloaded = parsePair(serialisePair(keys));
    expect(reloaded.ok).toBe(true);
    if (!reloaded.ok) return;
    d.s = reloaded.pair.continue!.state;
    cross(d, 'sea-chartroom-path');
    expect(d.s.flags[scope + 'inner.envelope']).toBe(true);
    use(d, 'inner', 'Slide the tray marker');
    use(d, 'pin', 'Move the cord to the outer turn');
    use(d, 'outer', 'Slide the tray marker');
    expect(d.done(scope + 'compare')).toBe(true);
  });

  it('serves either receiver with equal credit and leaves the model available as a separate replay', () => {
    const outcomes = (['letter', 'tray'] as const).map((branch) => {
      const d = new Driver();
      runModel(d);
      use(d, 'bind', 'Leave both routes');
      expect(d.s.inventory[guide]).toBeUndefined();
      use(d, 'bind', branch === 'letter' ? 'Roll the inner guide' : 'Roll the outer guide');
      expect(d.s.inventory[guide]).toBe(1);
      cross(d, 'sea-chartroom-return');
      expect(visible(d, branch === 'letter' ? 'threadbend-receive.tray' : 'threadbend-receive.letter')).toBeUndefined();
      use(d, `receive.${branch}`, 'Give the');
      expect(d.done(scope + 'finish')).toBe(false);
      use(d, `receive.${branch}`, branch === 'letter' ? 'Hang the envelope-only guide' : 'Lay the guide');
      expect(d.done(scope + 'finish')).toBe(true);
      expect(visible(d, 'threadbend-result.' + branch)?.text).toContain(branch === 'letter' ? 'one envelope' : 'two bends');
      cross(d, 'sea-chartroom-path');
      use(d, 'pin', 'Move the cord to the inner turn');
      use(d, 'inner', 'Slide the tray marker');
      expect(d.s.inventory[guide]).toBe(1);
      expect(d.s.journal.filter((id) => id === 'j.sea.threadbend')).toHaveLength(1);
      return d.p.credit;
    });
    expect(outcomes[0]).toEqual(outcomes[1]);
  });

  it.each([
    ['sea.chartroom', THREAD_BEND_CHARTROOM], ['sea.harbour', THREAD_BEND_HARBOUR],
  ] as const)('leaves earlier map props and characters their space in %s', (mapId, added) => {
    const map = MAPS[mapId];
    for (const { id, x, y } of added) {
      const overlap = [...map.interactables, ...map.npcs].filter((entry) => !entry.id.startsWith('threadbend-')
        && x >= entry.x && x < entry.x + ('w' in entry ? entry.w : 1)
        && y >= entry.y && y < entry.y + ('h' in entry ? entry.h : 1));
      expect(overlap.map((entry) => entry.id), id).toEqual([]);
    }
  });
});
