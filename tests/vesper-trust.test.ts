import { describe, expect, it } from 'vitest';
import { vignettesFor } from '../src/domain/epilogue';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const strip = 'item.vesper-narrow-line';
const door = 'vesper-line-proof-door';

function visible(d: Driver, id: string) {
  const item = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id);
  return item && check(item.visibleIf, d.s) ? item : undefined;
}

function scene(d: Driver, id: string, choice?: string) {
  const item = visible(d, `vesper-line-${id}`);
  if (!item?.node) throw new Error(`Cannot use ${id} in ${d.s.mapId}`);
  d.walk(item.node, choice ? [choice] : []);
}

function cross(d: Driver, id: string) {
  const item = visible(d, id);
  if (item?.kind !== 'door' || !item.to || !check(item.openIf, d.s)) throw new Error(`Cannot use ${id}`);
  d.s.mapId = item.to.map;
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function atCoast(d: Driver, mode: 'signed' | 'walked') {
  d.s.objectivesDone.push('preserved.publish');
  cross(d, 'observatory-door');
  cross(d, 'coast-headland-path');
  expect(visible(d, 'vesper-line-coast-open')).toBeUndefined();
  d.s.objectivesDone.push('coast.revise');
  scene(d, 'coast-open', 'Lift the OPEN sleeve');
  scene(d, 'coast-order', 'Slide the clip off');
  expect(visible(d, 'vesper-line-coast-choice')).toBeUndefined();
  scene(d, 'coast-witness', 'Read the strip from Tavia');
  expect(d.done('vesper.line.coast.checked')).toBe(true);
  scene(d, 'coast-choice', mode === 'signed' ? 'Bring Vesper’s signed replacement' : 'Ask Vesper to cover');
  expect(d.s.inventory[strip]).toBeUndefined();
  scene(d, `coast-mount-${mode}`, mode === 'signed' ? 'Clip the signed replacement' : 'Turn the new arrow');
  expect(d.s.inventory[strip]).toBe(1);
  expect(d.done('vesper.line.coast.done')).toBe(true);
  expect(visible(d, `vesper-line-coast-kept-${mode}`)).toBeDefined();
  cross(d, 'coast-headland-return');
  cross(d, 'coast-nexus-return');
}

function atQuay(d: Driver) {
  d.s.objectivesDone.push('civic.finish');
  cross(d, 'voices-door');
  cross(d, 'voices-quay-path');
  expect(visible(d, door)).toBeUndefined();
  d.s.objectivesDone.push('voices.finish');
  expect(() => cross(d, door)).toThrow(/Cannot use/);
  scene(d, 'quay-open', 'Lift the copy just far enough');
}

function finish(d: Driver, basis: 'signed' | 'walked' | 'local', mode: 'print' | 'cover') {
  cross(d, door);
  expect(d.s.mapId).toBe('voices.proof-room');
  expect(d.e.visibleOptions('vesper.line.proof.vesper', d.s).filter(({ option }) => option.next?.includes('agreed'))).toEqual([]);
  scene(d, 'proof-plain', 'Lift the trimming guide');
  expect(d.e.visibleOptions('vesper.line.proof.vesper', d.s).filter(({ option }) => option.next?.includes('agreed'))).toEqual([]);
  scene(d, 'proof-worker', 'Mark where the caller turned back');
  const echo = { signed: 'Show Vesper the signed Headland', walked: 'Lay the two shift slips', local: 'Set the local slips' };
  d.walk('vesper.line.proof.vesper', [echo[basis], mode === 'print' ? 'Have Vesper sign' : 'Put Vesper on the former dead end']);
  expect(d.s.flags['vesper.line.echo']).toBe(basis);
  scene(d, `proof-mount-${mode}`, mode === 'print' ? 'Bind the time line' : 'Clip the full direction');
  expect(d.done('vesper.line.quay.done')).toBe(false);
  cross(d, 'vesper-line-proof-return');
  const prop = visible(d, `vesper-line-quay-use-${mode}`);
  expect([prop?.x, prop?.y]).toEqual(mode === 'print' ? [9, 12] : [24, 13]);
  scene(d, `quay-use-${mode}`, mode === 'print' ? 'Line up the two edges' : 'Keep the rail closed');
  expect(d.done('vesper.line.quay.done')).toBe(true);
  expect(d.s.flags['ending.council']).toBeUndefined();
  expect(d.s.journal).toContain('j.vesper.line.quay');
  cross(d, 'voices-quay-return');
  cross(d, 'voices-quay-path');
  expect(visible(d, `vesper-line-quay-kept-${mode}`)).toBeDefined();
  d.s.flags['ending.council'] = 'expose';
  expect(vignettesFor(d.s).filter((vignette) => vignette.who === 'Lamp Quay recall')).toEqual([
    expect.objectContaining({ text: expect.stringContaining(mode === 'print' ? 'signed replacement' : 'second shift') }),
  ]);
}

describe('The Narrow Line and The Other End of OPEN', () => {
  it.each([['signed', 'cover'], ['walked', 'print']] as const)('retains the Headland %s promise, and can choose a new %s repair', (basis, mode) => {
    const d = new Driver();
    const permanentCredit = { ...d.p.credit };
    atCoast(d, basis);
    atQuay(d);
    if (basis === 'signed') scene(d, 'quay-copy', 'Align the counterfoil');
    else scene(d, 'quay-latch', 'Stand at the catch');
    expect(d.e.visibleOptions('vesper.line.quay.keeper', d.s).map(({ option }) => option.next)).toEqual([
      `vesper.line.quay.admitted.${basis}`, undefined,
    ]);
    scene(d, 'quay-keeper', basis === 'signed' ? 'Set the Headland signature' : 'Show the Headland handover');
    expect(d.s.flags['vesper.line.basis']).toBe(basis);
    finish(d, basis, mode);
    expect(d.s.inventory[strip]).toBe(1);
    expect(d.p.credit).toEqual(permanentCredit);
  });

  it('can open the same room through two local checks without the early quest', () => {
    const d = new Driver();
    atQuay(d);
    scene(d, 'quay-latch', 'Stand at the catch');
    expect(d.e.visibleOptions('vesper.line.quay.keeper', d.s)).toHaveLength(1);
    expect(() => cross(d, door)).toThrow(/Cannot use/);
    scene(d, 'quay-copy', 'Align the counterfoil');
    scene(d, 'quay-keeper', 'Bring the local print number');
    expect(d.s.inventory[strip]).toBeUndefined();
    finish(d, 'local', 'cover');
  });
});
