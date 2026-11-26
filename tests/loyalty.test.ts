import { describe, expect, it } from 'vitest';
import { LOYALTY } from '../src/domain/loyalty';
import { buildPack } from '../src/content';
import { MAPS } from '../src/maps';

describe('companion loyalty missions (spec 15.9, COMP-002, COMP-003)', () => {
  const pack = buildPack();
  it('each core companion has one, with three sources, a blind-spot slip and three costly choices', () => {
    expect(LOYALTY.map((l) => l.id).sort()).toEqual(['hesper', 'kip', 'rook', 'sefa']);
    for (const l of LOYALTY) {
      expect(pack.characters.some((c) => c.id === l.companion), l.id).toBe(true);
      expect(l.sources).toHaveLength(3);
      expect(l.choices).toHaveLength(3);
      for (const ch of l.choices) { expect(ch.cost.length).toBeGreaterThan(30); expect(ch.reply.length).toBeGreaterThan(10); }
      expect(l.slip.notice && l.slip.fixed && l.slip.miss).toBeTruthy();
    }
  });
  it('each one has a spot on a map that appears when the mission is available, and a remembered line for each choice', () => {
    for (const l of LOYALTY) {
      const spot = Object.values(MAPS).flatMap((m) => m.interactables).find((i) => i.game === `loyalty-${l.id}`);
      expect(spot, l.id).toBeTruthy();
      expect(spot!.visibleIf).toEqual(l.available);
      for (const ch of l.choices) expect((pack.memories ?? []).some((m) => m.id === `loyal.${l.id}.${ch.id}` && m.character === l.companion), `${l.id}.${ch.id}`).toBe(true);
    }
  });
});
