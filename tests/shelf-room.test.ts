import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const study = 'aethelgard.study';
const room = 'aethelgard.shelf-room';
const model = 'aethelgard.shelf-model';
const nile = 'nile.route';

function visible(d: Driver, map: string, id: string) {
  return MAPS[map].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

function use(d: Driver, map: string, id: string, choice?: string) {
  const prop = visible(d, map, id);
  if (!prop?.node) throw new Error(`Cannot use ${id}`);
  d.walk(prop.node, choice ? [choice] : []);
}

describe('The Shelf That Became a Wall', () => {
  it.each([
    ['west', 'Move the drying', 'open', 'Try the marked', 'open'],
    ['desk', 'Keep the repair', 'copy', 'Match the desk', 'desk'],
  ])('preserves source limits, fits the %s layout and carries the peg forward', (edition, arrange, receiving, plan, result) => {
    const d = new Driver();
    expect(visible(d, study, 'study-side-annex')).toBeUndefined();
    d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
    expect(visible(d, study, 'study-side-annex')?.to?.map).toBe(room);
    expect(MAPS[room].blocks).not.toEqual(MAPS[model].blocks);
    expect(visible(d, room, 'shelf-room-projection')).toBeUndefined();
    use(d, room, 'shelf-room-prop');
    expect(visible(d, room, 'shelf-room-projection')?.to?.map).toBe(model);
    use(d, model, 'shelf-model-sill');
    expect(visible(d, room, 'shelf-room-choose')).toBeUndefined();
    use(d, model, 'shelf-model-turn');
    expect(visible(d, model, 'shelf-projection-return')?.to?.map).toBe(room);
    const westGap = MAPS[room].conditionalBlocks?.[0];
    expect(check(westGap?.when, d.s)).toBe(true);
    use(d, room, 'shelf-room-choose', arrange);
    expect(Boolean(visible(d, room, 'shelf-blocked-west'))).toBe(edition === 'desk');
    expect(check(westGap?.when, d.s)).toBe(edition === 'desk');
    expect(d.s.inventory['item.annex-register']).toBeUndefined();
    use(d, room, `shelf-room-${edition}`);
    expect(d.s.inventory['item.annex-register']).toBe(1);
    expect(visible(d, nile, 'nile-shelf-stops')).toBeUndefined();
    d.s.objectivesDone.push('nile.routes');
    use(d, nile, 'nile-shelf-stops', plan);
    use(d, nile, `nile-shelf-${receiving}`);
    expect(d.s.flags['shelf.nile.checked']).toBe(result);
    expect(d.s.journal).toContain('j.shelf.nile');
    expect(d.p.credit).toEqual({});
  });
});
