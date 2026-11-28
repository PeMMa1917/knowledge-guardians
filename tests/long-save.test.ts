import { expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { apply, emptyOutputs, nextRandom } from '../src/domain/rules';
import { tickEvents } from '../src/domain/learning';
import { Driver } from './driver';

it('preserves the previous campaign, pending effects and event clock on both successful and rejected transactions', () => {
  const d = new Driver(),
    s = d.s;
  Object.freeze(s.flags);
  Object.freeze(s.inventory);
  Object.freeze(s.journal);
  Object.freeze(s.cards);
  Object.freeze(s.relations);
  Object.freeze(s.events);
  const out = emptyOutputs();
  out.items.push({ id: 'earlier marker', qty: 1 });
  const saved = structuredClone(out);
  expect(() =>
    apply(
      [
        { addMarks: 9 },
        { giveItem: 'tool' },
        { addCard: 'c' },
        { journal: 'j' },
        { signal: 's' },
        { takeItem: 'absent' },
      ],
      s,
      out,
    ),
  ).toThrow();
  expect(out).toEqual(saved);
  const n = apply(
    [
      { addNum: 'turn', by: 1 },
      { addMarks: 9 },
      { giveItem: 'tool' },
      { addCard: 'c' },
      { journal: 'j' },
      { relation: 'keeper', by: 2 },
    ],
    s,
    out,
  );
  expect(n.journal).toContain('j');
  expect(s.journal).not.toContain('j');
  expect(s.inventory.tool).toBeUndefined();
  expect(n.relations.keeper).toBe(2);
  expect(n.flags.turn).toBe(1);
  expect(s.flags.turn).toBeUndefined();
  expect(n.adventureDiary).toBe(s.adventureDiary);
  expect(out.items).toEqual([...saved.items, { id: 'tool', qty: 1 }]);
  const pack = buildPack(),
    first = tickEvents(pack, s, 3),
    second = tickEvents(pack, s, s.events.next + 1);
  expect(first.events.clock).toBe(s.events.clock + 3);
  expect(second.events.clock).toBe(0);
  expect(s.events.pending).toBe(null);
  const [v, fresh] = nextRandom(s);
  expect(nextRandom(s)[0]).toBe(v);
  expect(fresh.rng.state).not.toBe(s.rng.state);
});

it('keeps early diary entries and player writing intact through repeated world choices on a long adventure', () => {
  const d = new Driver();
  d.run({
    type: 'ReadWorldSign',
    id: 'postcard',
    title: 'Spring postcard',
    text: 'My sister left the lower gate open.',
  });
  const first = d.s.adventureDiary.entries.at(-1)!;
  d.s.adventureDiary.entries = Array.from({ length: 6000 }, (_, i) => ({ ...first, id: 'old-copy-' + i }));
  d.s.notes = ['The blue mark was mine.'];
  const before = d.s;
  for (let i = 0; i < 30; i++)
    d.run({
      type: 'ReadWorldSign',
      id: 'ferry-' + i,
      title: 'Wharf ' + i,
      text: 'Keeper ' + i + ' signed the arrival.',
    });
  expect(before.adventureDiary.entries).toHaveLength(6000);
  expect(d.s.adventureDiary.entries).toHaveLength(6030);
  expect(d.s.adventureDiary.entries[0]).toEqual(before.adventureDiary.entries[0]);
  expect(d.s.notes).toEqual(['The blue mark was mine.']);
});
