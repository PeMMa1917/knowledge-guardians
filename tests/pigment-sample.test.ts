import { describe, expect, it } from 'vitest';
import { microSkillId } from '../src/content/microSkillEvidence';
import { check } from '../src/domain/rules';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { EMBERFORD } from '../src/maps/emberford';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const skill = microSkillId(911);
const prefix = 'pigment-sample.';
const swatch = 'item.pigment-sample.swatch';
const prop = (name: string) => EMBERFORD.interactables.find(({ id }) => id === name)!;
const visible = (d: Driver, name: string) => check(prop(name).visibleIf, d.s);
const flag = (d: Driver, name: string) => d.s.flags[prefix + name];

function use(d: Driver, name: string, pick?: string) {
  const target = prop(name);
  expect(visible(d, name), name).toBe(true);
  if (target.kind === 'scene') d.walk(target.node!, pick ? [pick] : []);
  if (target.kind === 'sign') d.run({ type: 'ReadWorldSign', id: target.id,
    title: target.label, text: target.text ?? '', readFlag: target.flag });
  return target.text ?? '';
}

function finishWindow(d: Driver) {
  for (const [mode, choice] of [
    ['warm', 'warm lamp'], ['cool', 'intact strip under the cool lamp'],
    ['start', 'both custody strips'], ['later', 'Advance the model'],
  ]) {
    use(d, 'pigment-window.stand', choice);
    use(d, 'pigment-window.' + mode);
  }
  expect(d.done('pigment-window.controlled')).toBe(true);
}

describe('The Last Loose Swatch', () => {
  it.each([
    ['analysis', 'Hand the signed R13 swatch', 'report', 'empty wrapper', 'two colourants, R13'],
    ['retain', 'Set the signed R13 swatch', 'viewing', 'margin is still here', 'repeats the edge check'],
  ])('keeps the %s outcome and allows a delayed correction from Continue', (route, choice, receiver, interim, final) => {
    const d = new Driver();
    d.s.mapId = EMBERFORD.id;
    d.run({ type: 'SetFlag', flag: 'reached.emberford', value: true });
    expect(visible(d, prefix + 'window')).toBe(false);
    finishWindow(d);
    expect(visible(d, prefix + 'packet')).toBe(false);
    use(d, prefix + 'window', 'Match W27 to the loan ticket');
    use(d, prefix + 'packet', 'Take the signed R13 wrapper');
    expect(d.s.inventory[swatch]).toBe(1);
    expect(d.done(prefix + 'compared')).toBe(true);
    expect(d.p.skills[skill]).toBeUndefined();

    use(d, prefix + 'bench', 'Keep the wrapper in my bag');
    expect(d.s.inventory[swatch]).toBe(1);
    expect(flag(d, 'disposition')).toBeUndefined();
    expect(visible(d, prefix + 'bench')).toBe(true);
    use(d, prefix + 'bench', choice);
    expect(flag(d, 'disposition')).toBe(route);
    expect(d.s.inventory[swatch]).toBeUndefined();
    expect(visible(d, prefix + 'packet')).toBe(false);
    expect(visible(d, prefix + 'window')).toBe(true);
    expect(visible(d, prefix + 'repair')).toBe(false);
    const other = receiver === 'report' ? 'viewing' : 'report';
    expect(visible(d, prefix + other)).toBe(false);
    expect(use(d, prefix + receiver)).toContain(interim);
    use(d, prefix + 'repair', 'Leave the two clips visible');
    expect(flag(d, 'posted')).toBeUndefined();

    const recovered = parsePair(serialisePair(writeSuspend(emptyPair(), {
      state: d.s, kind: 'suspend', label: 'Swatch bench', location: EMBERFORD.name, savedAt: new Date().toISOString(),
    })));
    expect(recovered.ok).toBe(true);
    if (!recovered.ok) throw Error(recovered.reason);
    d.s = recovered.pair.continue!.state;
    const credit = { ...d.p.credit };
    use(d, prefix + 'repair', 'Give W27 its own loan card');
    expect(use(d, prefix + 'labels')).toContain('Follow the number on each card');
    expect(visible(d, prefix + receiver)).toBe(false);
    expect(visible(d, prefix + other + '-filed')).toBe(false);
    expect(d.p.skills[skill]).toBeUndefined();
    expect(use(d, prefix + receiver + '-filed')).toContain(final);
    expect(d.done(prefix + 'reconciled')).toBe(true);
    expect(d.p.skills[skill]).toEqual([expect.stringContaining('WORLD-02|game-144|pigment-sample.reconciled')]);
    expect(d.p.credit).toEqual(credit);
    use(d, prefix + receiver + '-filed');
    expect(d.p.skills[skill]).toHaveLength(1);
  });

  it('keeps the protected loan and visibly different evidence on existing walkable tiles', () => {
    const pieces = EMBERFORD.interactables.filter(({ id }) => id.startsWith(prefix));
    const supplied = new Set(artKeys());
    for (const piece of pieces) {
      expect(supplied.has(piece.art!), piece.id).toBe(true);
      expect(EMBERFORD.floor(piece.x, piece.y)).not.toBeNull();
      expect(EMBERFORD.interactables.filter(({ id, x, y }) =>
        !id.startsWith(prefix) && x === piece.x && y === piece.y), piece.id).toEqual([]);
    }
    expect(prop(prefix + 'report-filed').art).not.toBe(prop(prefix + 'viewing-filed').art);
    const d = new Driver();
    expect(d.e.pack.sources.find(({ id }) => id === 'HIS-PIGMENT-01')?.locator).toContain('3.6');
  });
});
