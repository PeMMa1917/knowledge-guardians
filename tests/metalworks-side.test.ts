import { describe, expect, it } from 'vitest';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const yard = 'metalworks.yard';
const hall = 'metalworks.records';

function read(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id && item.kind === 'sign');
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function visit(d: Driver, id: string, ...choices: string[]) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id && item.kind === 'scene');
  if (!prop?.node || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  d.walk(prop.node, choices);
}

function begin(d: Driver) {
  d.s.objectivesDone.push('metal.finish');
  d.s.flags['metal.response'] = 'window';
  d.s.flags['metal.followup'] = true;
  d.s.mapId = yard;
}

describe('The Turned Tag', () => {
  it('opens for existing completed campaigns and needs distinct trials and all three records', () => {
    const d = new Driver();
    d.s.mapId = yard;
    const bench = MAPS[yard].interactables.find((item) => item.id === 'metal-tag-bench')!;
    expect(check(bench.visibleIf, d.s)).toBe(false);

    begin(d);
    expect(check(bench.visibleIf, d.s)).toBe(true);
    visit(d, bench.id, 'Turn the practice tag', 'Reset the stand', 'Turn the practice tag', 'Leave the stand');
    read(d, 'metal-tag-fit-key');
    d.s.mapId = hall;
    read(d, 'metal-tag-coat-key');
    read(d, 'metal-tag-transfer-note');
    expect(d.done('metal.tag.compared')).toBe(false);
    expect(d.e.visibleOptions('metal.tag.place', d.s).map(({ option }) => option.text))
      .toEqual(['Leave the two records ready.']);

    d.s.mapId = yard;
    visit(d, bench.id, 'Keep the stand still', 'Leave the stand');
    expect(d.done('metal.tag.compared')).toBe(true);
    expect(d.done('metal.tag.explained')).toBe(false);
  });

  it.each([
    ['yard', 'Hang the explanation', yard],
    ['hall', 'File the explanation', hall],
  ])('shows the explanation in the %s without altering the original display', (choice, placement, room) => {
    const d = new Driver();
    begin(d);
    const xp = totalXP(d.p);
    visit(d, 'metal-tag-bench', 'Keep the stand still', 'Reset the stand', 'Turn the practice tag', 'Leave the stand');
    read(d, 'metal-tag-fit-key');
    d.s.mapId = hall;
    read(d, 'metal-tag-coat-key');
    expect(d.done('metal.tag.compared')).toBe(false);
    read(d, 'metal-tag-transfer-note');
    visit(d, 'metal-tag-explanation-clips', placement);

    const displays = Object.values(MAPS).flatMap((map) => map.interactables
      .filter((prop) => prop.id.startsWith('metal-tag-handoff-') && check(prop.visibleIf, d.s))
      .map((prop) => [map.id, prop.id]));
    expect(displays).toEqual([[room, `metal-tag-handoff-${choice}`]]);
    expect(d.done('metal.tag.explained')).toBe(true);
    expect(d.p.moments['mom.metal-tag-explained']).toBeTruthy();
    expect(d.s.flags['metal.response']).toBe('window');
    expect(d.s.flags['metal.followup']).toBe(true);
    expect(totalXP(d.p)).toBe(xp);
  });
});
