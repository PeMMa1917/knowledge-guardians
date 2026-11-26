import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function prop(map: string, id: string) {
  const found = MAPS[map]?.interactables.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown prop ${map} ${id}`);
  return found;
}

function openWorkroom() {
  const d = new Driver();
  d.s.objectivesDone.push('preserved.publish');
  d.s.inventory['tool.date-lens'] = 1;
  d.s.mapId = 'preserved.workroom';
  return d;
}

function inspect(d: Driver) {
  for (const exhibit of ['OBJ-PRES-XIN-CONTEXT', 'OBJ-PRES-XIN-METHOD']) {
    d.run({ type: 'InspectExhibit', exhibit });
    d.run({ type: 'UseLens', exhibit });
  }
}

function pinLayers(d: Driver) {
  d.walk('xin.layer.observation', ['Pin the observations', 'Leave the sheet on']);
  d.walk('xin.layer.model', ['Lay the outline', 'Leave the sheet on']);
  d.walk('xin.layer.style', ['Pin the swatches', 'Leave the sheet on']);
  d.walk('xin.layer.caption', ['Clip the caption', 'Leave the sheet on']);
}

describe('The Printer’s Empty Sleeve', () => {
  it('opens after the first public display independently of the other workroom cases', () => {
    const d = new Driver();
    const door = prop('preserved.archive', 'preserved-door-workroom');
    expect(door.to?.map).toBe('preserved.workroom');
    expect(check(door.openIf, d.s)).toBe(false);
    d.s.objectivesDone.push('preserved.publish');
    expect(check(door.openIf, d.s)).toBe(true);
    expect(d.e.activeMissions(d.s).some((mission) => mission.id === 'KG-CH3-R05')).toBe(true);

    const room = openWorkroom();
    const observationSheet = prop('preserved.workroom', 'preserved-workroom-observation');
    expect(check(observationSheet.visibleIf, room.s)).toBe(false);
    room.run({ type: 'InspectExhibit', exhibit: 'OBJ-PRES-XIN-CONTEXT' });
    room.run({ type: 'InspectExhibit', exhibit: 'OBJ-PRES-XIN-METHOD' });
    expect(check(observationSheet.visibleIf, room.s)).toBe(false);
    inspect(room);
    expect(check(observationSheet.visibleIf, room.s)).toBe(true);
  });

  it('allows lifting a layer after assembly and requires replacing it before dispatch', () => {
    const d = openWorkroom();
    inspect(d);
    pinLayers(d);
    expect(d.done('xin.o.layers')).toBe(true);
    const selected = prop('preserved.workroom', 'preserved-workroom-model-pinned');
    expect(check(selected.visibleIf, d.s)).toBe(true);
    d.walk('xin.layer.model.pinned', ['Lift the sheet']);
    expect(check(selected.visibleIf, d.s)).toBe(false);
    expect(d.e.visibleOptions('xin.commission', d.s).map(({ option }) => option.text))
      .toEqual(['Leave the printer’s tray empty for now.']);
    d.walk('xin.layer.model', ['Lay the outline', 'Leave the sheet on']);
    expect(d.e.visibleOptions('xin.commission', d.s)).toHaveLength(3);
  });

  it.each([
    ['process', 'Print the process board', 'preserved-xin-methods-display', 'preserved-xin-review-display'],
    ['review', 'Keep the mock-up here', 'preserved-xin-review-display', 'preserved-xin-methods-display'],
  ])('puts only the %s outcome in the main hall with neutral permanent credit', (choice, action, display, other) => {
    const d = openWorkroom();
    const before = { ...d.p.credit };
    inspect(d);
    pinLayers(d);
    d.walk('xin.commission', [action]);
    expect(d.s.flags['xin.display']).toBe(choice);
    expect(d.done('xin.o.display')).toBe(true);
    expect(d.s.journal).toContain('j.xin.display');
    expect(d.p.moments['moment.xin.process']).toBeTruthy();
    expect(d.p.credit).toEqual(before);
    expect(check(prop('preserved.archive', display).visibleIf, d.s)).toBe(true);
    expect(check(prop('preserved.archive', other).visibleIf, d.s)).toBe(false);
  });
});
