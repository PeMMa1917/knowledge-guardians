import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { Driver } from './driver';

const scenes = Object.values(MAPS).flatMap((map) => map.interactables
  .filter((prop) => prop.kind === 'scene' && !map.interactables.some((other) => prop.id.startsWith(other.id + '.')))
  .map((prop) => ({ map, prop })));

describe('scenes attached to map props', () => {
  it.each(scenes)('$prop.id shows either outcome at the same spot', ({ map, prop }) => {
    const setup = () => {
      const d = new Driver();
      d.s.mapId = map.id;
      d.s.objectivesDone.push(
        ...({ 'nile.royal': ['nile.diplomacy'], 'nile.workyard': ['nile.workers'], 'nile.route': ['nile.routes'] }[map.id] ?? []),
      );
      return d;
    };
    const variants = map.interactables.filter((o) => o.id === prop.id || o.id.startsWith(prop.id + '.'));
    const visible = (d: Driver) => variants.filter((o) => check(o.visibleIf, d.s));
    const d = setup();

    expect(map.floor(prop.x, prop.y)).toBeTruthy();
    expect(variants).toHaveLength(3);
    expect(variants.every((o) => o.walkThrough && o.x === prop.x && o.y === prop.y)).toBe(true);
    expect(new Set(variants.map((o) => o.art)).size).toBe(3);
    expect(visible(d).map((o) => o.id)).toEqual([prop.id]);
    const options = d.e.visibleOptions(prop.id, d.s);
    expect(options).toHaveLength(3);

    for (const { index, option } of options.slice(0, 2)) {
      const branch = setup();
      const credits = { ...branch.p.credit };
      branch.run({ type: 'EnterNode', node: prop.id });
      const result = branch.run({ type: 'ChooseDialogueOption', node: prop.id, index });
      expect(result.nextNode).toBe(option.next);
      const outcome = visible(branch);
      expect(outcome.map((o) => o.node)).toEqual([result.nextNode]);
      branch.run({ type: 'EnterNode', node: outcome[0].node! });
      expect(branch.e.node(outcome[0].node!).text).toBeTruthy();
      expect(branch.e.visibleOptions(prop.id, branch.s).map((o) => o.index)).toEqual([2]);
      expect(branch.p.credit).toEqual(credits);
    }

    d.run({ type: 'ChooseDialogueOption', node: prop.id, index: 2 });
    expect(visible(d).map((o) => o.id)).toEqual([prop.id]);
  });

  it('keeps follow-up props out of view until the matching Nile investigation is complete', () => {
    const d = new Driver();
    for (const room of ['nile.royal', 'nile.workyard', 'nile.route']) {
      const props = MAPS[room].interactables.filter((o) => o.kind === 'scene');
      expect(props).toHaveLength(3);
      expect(props.every((o) => !check(o.visibleIf, d.s))).toBe(true);
    }
  });
});
