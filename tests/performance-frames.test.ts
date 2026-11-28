import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const proof = 'item.stage.frames.proof';

function visible(d: Driver, key: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === `frames-${key}`);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function use(d: Driver, key: string, pick?: string) {
  const prop = visible(d, key);
  if (!prop?.node) throw new Error(`Cannot reach ${key} in ${d.s.mapId}`);
  d.walk(prop.node, pick ? [pick] : []);
}

function cross(d: Driver, key: string) {
  const door = MAPS[d.s.mapId].interactables.find((item) => item.id === key && item.kind === 'door');
  if (!door?.to || !check(door.visibleIf, d.s) || !check(door.openIf, d.s)) throw new Error(`Cannot use ${key}`);
  d.s.mapId = door.to.map;
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
}

function stage(d: Driver, layout: 'rail' | 'folio') {
  d.resumeAfter('sea.finish');
  cross(d, 'stage-door');
  cross(d, 'stage-rehearsal-path');
  use(d, 'stage-brief', 'Clip a smaller task');
  if (layout === 'rail') {
    use(d, 'stage-hinge', 'Open and close');
    cross(d, 'stage-rehearsal-to-gallery');
    expect(visible(d, 'stage-plan')).toBeUndefined();
    use(d, 'stage-reader', 'Ask Nera');
  } else {
    cross(d, 'stage-rehearsal-to-gallery');
    use(d, 'stage-reader', 'Ask Nera');
    expect(visible(d, 'stage-plan')).toBeUndefined();
    cross(d, 'stage-gallery-to-rehearsal');
    use(d, 'stage-hinge', 'Open and close');
    cross(d, 'stage-rehearsal-to-gallery');
  }
  expect(d.done('stage.frames.checked')).toBe(true);
  expect(d.s.inventory[proof]).toBeUndefined();
  use(d, 'stage-plan', layout === 'rail' ? 'Set the full sequence' : 'Agree a first turn');
  expect(visible(d, `stage-install-${layout === 'rail' ? 'folio' : 'rail'}`)).toBeUndefined();
  use(d, `stage-install-${layout}`, layout === 'rail' ? 'Clip all three frames' : 'Set the folio');
  expect(d.s.inventory[proof]).toBeUndefined();
  cross(d, 'stage-gallery-return');
  use(d, `stage-feedback-${layout}`, layout === 'rail' ? 'Leave the side opening' : 'Leave a rest');
  expect(d.s.inventory[proof]).toBe(1);
  expect(d.done('stage.frames.served')).toBe(true);
  expect(d.done('stage.finish')).toBe(false);
  use(d, `stage-receipt-${layout}`);
  expect(d.s.inventory[proof]).toBe(1);
  expect(d.e.node(`stage.frames.served.${layout}`).text).not.toContain('Nera');
}

function island(d: Driver) {
  d.resumeAfter('voices.finish');
  cross(d, 'island-door');
  expect(d.done('island.arrival')).toBe(true);
  expect(visible(d, 'island-plan')).toBeUndefined();
}

function runDock(d: Driver, method: 'fixed' | 'host') {
  use(d, 'island-draft', 'Clip the bottom edge');
  expect(visible(d, 'island-plan')).toBeUndefined();
  use(d, 'island-reader', 'Let Joss try');
  expect(d.done('island.frames.checked')).toBe(true);
  use(d, 'island-plan', method === 'fixed' ? 'Send the rail' : 'Send the folio');
  expect(visible(d, `island-return-${method}`)).toBeUndefined();
  cross(d, 'island-dock-path');
  use(d, `island-install-${method}`, method === 'fixed' ? 'Close the clip' : 'Hold the first edge');
  expect(visible(d, `island-installed-${method}`)).toBeDefined();
  expect(d.done('island.frames.finished')).toBe(false);
  cross(d, 'island-dock-return');
  use(d, `island-return-${method}`, method === 'fixed' ? 'Fit a waiting cue' : 'Set aside the low basket hook');
  expect(d.done('island.frames.finished')).toBe(true);
  expect(d.done('island.finish')).toBe(false);
  expect(visible(d, `island-checked-${method}`)).toBeDefined();
  cross(d, 'island-dock-path');
  expect(visible(d, `island-served-${method}`)?.art).toBe(method === 'fixed' ? 'frames.dock-rail-mark' : 'frames.dock-hook');
}

describe('The Third Fold and A Frame at the Dock', () => {
  it.each([
    ['rail', 'host', 'Those readers could stand clear of an aisle'],
    ['folio', 'fixed', 'where to wait when I step away'],
  ] as const)('takes the Stage %s proof into a newly chosen Island %s arrangement', (stageMode, dockMode, feedback) => {
    const d = new Driver();
    stage(d, stageMode);
    cross(d, 'stage-nexus-return');
    island(d);
    use(d, 'island-brief', `Clip my Stage ${stageMode}`);
    expect(d.s.flags['island.frames.reference']).toBe(stageMode);
    expect(visible(d, `island-reference-${stageMode}`)?.art).toBe('frames.proof');
    expect(d.e.node(`island.frames.reference.${stageMode}`).text).toContain(feedback);
    expect(d.s.inventory[proof]).toBe(1);
    expect(d.done('island.frames.checked')).toBe(false);
    const credit = { ...d.p.credit };
    runDock(d, dockMode);
    expect(d.p.credit).toEqual(credit);
    expect(d.s.journal).toContain('j.island.frames');
  });

  it('can set up the dock independently, with both choices requiring a local evidence check', () => {
    const d = new Driver();
    island(d);
    expect(d.e.visibleOptions('island.frames.brief', d.s).map(({ option }) => option.text)).toEqual([
      'Set fresh draft and reader marks on the island worktable.', "Leave the handover strip beside Ivo's model.",
    ]);
    use(d, 'island-brief', 'Set fresh draft');
    expect(d.s.flags['island.frames.reference']).toBe('local');
    runDock(d, 'fixed');
  });
});
