import { describe, expect, it } from 'vitest';
import { inkGuests, inkRunner } from '../src/content/secondInk';
import {
  carriedInk,
  counterResult,
  inkAnswer,
  inkCases,
  inkChallenge,
  inkComparison,
  inkDiary,
  inkEditions,
  inkEdition,
  inkEffects,
  inkKey,
  inkObservation,
  inkPaper,
  inkProof,
  inkReadout,
  inkRival,
  inkTools,
  type InkCase,
  type InkCommand,
  type InkTool,
} from '../src/domain/secondInk';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { MAPS } from '../src/maps';
import { Driver } from './driver';
type Work = InkCommand extends infer C
  ? C extends InkCommand
    ? Omit<C, 'site' | 'type'>
    : never
  : never;
type S = ReturnType<typeof state>;
const state = (k: InkCase) => ({
  flags: {} as Record<string, string | number | boolean>,
  mapId: k.room,
});
function go(s: S, k: InkCase, cmd: Work) {
  for (const effect of inkEffects(s, { type: 'WorkSecondInk', site: k.site, ...cmd })) {
    if ('setFlag' in effect) s.flags[effect.setFlag] = effect.value;
    else throw Error('Unexpected write');
  }
}
function keep(s: S, k: InkCase, t: InkTool, n: number, back = false) {
  go(s, k, { work: 'set', tool: t, index: n });
  if (t === 'cord') {
    go(s, k, { work: 'pull' });
    go(s, k, { work: 'pull' });
  } else if (!!s.flags[inkKey(k, 'back')] !== back) go(s, k, { work: 'turn' });
  go(s, k, { work: 'read' });
}
function sign(s: S, k: InkCase, t: InkTool) {
  s.mapId = k.room;
  keep(s, k, t, 0);
  keep(s, k, t, 1);
  go(s, k, { work: 'sign', tool: t, edition: 'serve' });
}
describe('Tritta, Agate and the travelling proofs', () => {
  it.each(inkCases)(
    'plays all three tools and all nine ways to issue and receive the notice at $site',
    (k) => {
      const s = state(k);
      expect(() => go(s, k, { work: 'sign', tool: 'slip', edition: 'serve' })).toThrow();
      expect(() => go(s, k, { work: 'set', tool: 'cord', index: 10 })).toThrow();
      for (const t of inkTools) {
        keep(s, k, t, 0);
        keep(s, k, t, 0);
        expect(inkProof(s, k, t)).toBe(false);
        keep(s, k, t, 2);
        expect(inkProof(s, k, t)).toBe(true);
        for (const edition of inkEditions) {
          go(s, k, { work: 'sign', tool: t, edition });
          expect(inkEdition(s, k)).toMatchObject({ tool: t, edition, samples: [0, 2] });
          expect(() => go(s, k, { work: 'carry' })).toThrow(/Visit/);
          go(s, k, { work: 'visit' });
          const arrival = inkDiary(s, { type: 'WorkSecondInk', site: k.site, work: 'visit' });
          expect(arrival.text).toContain(k[edition]);
          go(s, k, { work: 'carry' });
          expect(carriedInk(s)).toMatchObject({
            site: { site: k.site },
            tool: t,
            edition,
            samples: [0, 2],
          });
        }
      }
      // An actual receiver at one of three different addresses, exactly one in use with a live edition.
      const props = MAPS[k.room].interactables.filter((p) => p.game === 'second-ink-corner');
      expect(new Set(props.map((p) => p.x + ',' + p.y)).size).toBe(3);
      expect(props.map((p) => p.visibleIf)).toEqual(
        inkEditions.map((eq) => ({ flag: inkKey(k, 'edition'), eq })),
      );
      s.mapId = 'nexus.archive';
      expect(() => go(s, k, { work: 'visit' })).toThrow(/Find/);
    },
  );
  it('the cause of a scar can move, stay on the bed, or disappear from the reverse while the pin stays fixed', () => {
    for (const k of inkCases) {
      const s = state(k);
      const cols = [0, 1, 2].map((index) => {
        go(s, k, { work: 'set', tool: 'slip', index });
        return inkPaper(s, k);
      });
      expect(cols.map((o) => o.pin)).toEqual([4, 4, 4]);
      expect(cols.map((o) => o.notch)).toEqual(k.fixed === 'paper' ? [1, 2, 3] : [2, 2, 2]);
      go(s, k, { work: 'turn' });
      expect(inkPaper(s, k).notch).toBe(k.fixed === 'paper' ? undefined : 2);
      keep(s, k, 'slip', 0, true);
      keep(s, k, 'slip', 2, true);
      expect(inkProof(s, k, 'slip')).toBe(false);
    }
  });
  it('traces intermediate cords to witnesses and keeps prior shifts distinct when the same bell is tried', () => {
    for (const k of inkCases) {
      const s = state(k);
      for (const index of [0, 1, 2]) {
        go(s, k, { work: 'set', tool: 'cord', index });
        expect(() => go(s, k, { work: 'read' })).toThrow(/hook/);
        go(s, k, { work: 'pull' });
        expect(inkReadout(s, k)).toContain('hook');
        expect(() => go(s, k, { work: 'read' })).toThrow();
        go(s, k, { work: 'pull' });
        expect(inkReadout(s, k)).toContain(k.writers[k.origin[index]]);
        expect(() => go(s, k, { work: 'pull' })).toThrow();
        go(s, k, { work: 'read' });
        for (const [back, timing] of [
          [false, k.tide],
          [true, k.older],
        ] as const) {
          const o = inkObservation(k, 'bell', index, back);
          k.writers.forEach((w, i) => expect(o.includes(w)).toBe(timing[i] === index));
        }
      }
      expect(new Set(k.origin).size).toBe(2);
    }
  });
  it.each(inkTools)(
    'responds to the actual %s method, ignores repeated editions in a single town and honours the accepted terms across later work',
    (t) => {
      const k = inkCases[14],
        s = state(k);
      // The local notice is always available without an agreement with the rival.
      sign(s, k, t);
      go(s, k, { work: 'visit' });
      expect(inkRival(s, k).level).toBe(0);
      for (let i = 0; i < 4; i++) sign(s, inkCases[0], t);
      expect(inkRival(s, k).level).toBe(0);
      sign(s, inkCases[1], t);
      s.mapId = k.room;
      go(s, k, { work: 'challenge' });
      expect(inkChallenge(s, k)).toEqual({ tool: t, level: 1 });
      expect(() => go(s, k, { work: 'answer' })).toThrow();
      if (t === 'cord') keep(s, k, t, 2);
      else {
        keep(s, k, t, 2, true);
        expect(inkAnswer(s, k)).toBe(false);
        keep(s, k, t, 0, true);
      }
      go(s, k, { work: 'answer' });
      expect(counterResult(s, k)).toMatch(/\S/);
      sign(s, inkCases[2], t);
      sign(s, inkCases[3], t);
      s.mapId = k.room;
      expect(inkRival(s, k).level).toBe(2);
      expect(inkChallenge(s, k)!.level).toBe(1);
      go(s, k, { work: 'challenge' });
      expect(inkAnswer(s, k)).toBe(false);
      const other = inkTools.find((v) => v !== t)!;
      keep(s, k, other, 0);
      keep(s, k, other, 1);
      go(s, k, { work: 'answer' });
      expect(s.flags[inkKey(k, 'answered.' + t)]).toBe(2);
      expect(s.flags[inkKey(k, 'answered.' + other)]).toBeUndefined();
    },
  );
  it('carries the reading and the rights of a particular edition through a new reading and a return', () => {
    const [a, b] = inkCases,
      s = state(a);
    sign(s, a, 'cord');
    go(s, a, { work: 'visit' });
    go(s, a, { work: 'carry' });
    keep(s, a, 'cord', 2);
    go(s, a, { work: 'sign', tool: 'cord', edition: 'serve' });
    expect(() => go(s, a, { work: 'carry' })).toThrow();
    expect(carriedInk(s)!.samples).toEqual([0, 1]);
    go(s, a, { work: 'sign', tool: 'cord', edition: 'exhibit' });
    expect(carriedInk(s)!.edition).toBe('serve');
    s.mapId = b.room;
    expect(inkComparison(s, b)).toBeUndefined();
    keep(s, b, 'slip', 1);
    expect(inkComparison(s, b)).toMatchObject({
      there: inkObservation(a, 'cord', 0),
      here: inkObservation(b, 'slip', 1),
    });
    go(s, b, { work: 'compare' });
    expect(s.flags[inkKey(b, 'compared.from')]).toBe(a.site);
    s.mapId = a.room;
    expect(inkComparison(s, a)).toBeUndefined();
  });
  it('exposes the missions only on a first real visit and gives each earned entry a specific, optional reflection', () => {
    const d = new Driver(),
      k = inkCases[0];
    const goals = () => d.e.visibleObjectives(d.s).filter((g) => g.id.startsWith('secondink.archive.'));
    expect(goals()).toHaveLength(0);
    d.s.mapId = k.room;
    d.run({ type: 'VisitPlace', name: k.title });
    expect(goals().length).toBeGreaterThan(0);
    for (const index of [0, 2]) {
      d.run({ type: 'WorkSecondInk', site: k.site, work: 'set', tool: 'slip', index });
      d.run({ type: 'WorkSecondInk', site: k.site, work: 'read' });
    }
    d.run({ type: 'WorkSecondInk', site: k.site, work: 'sign', tool: 'slip', edition: 'exhibit' });
    d.run({ type: 'WorkSecondInk', site: k.site, work: 'visit' });
    expect(d.done('secondink.archive.slip')).toBe(true);
    expect(d.done('secondink.archive.delivery')).toBe(true);
    const entries = d.s.adventureDiary.entries.filter((e) => e.event?.key.startsWith('secondink:'));
    expect(entries.length).toBeGreaterThan(3);
    for (const e of entries) expect(Object.values(diaryQuestions(e))).toContain(k.question);
    expect(entries.find((e) => e.event?.key.endsWith(':visit'))?.text).toContain(k.exhibit);
  });
  it('puts local conversations, physical work, earned guest references and real return addresses in all fifteen chapters', () => {
    const d = new Driver();
    expect(new Set(inkCases.map((k) => k.site)).size).toBe(15);
    for (const [i, k] of inkCases.entries()) {
      const room = MAPS[k.room];
      d.s.mapId = k.room;
      const guest = inkGuests[k.site];
      for (const id of ['agate-vale', inkRunner, ...(guest ? [guest.person] : [])]) {
        expect(room.npcs.filter((p) => p.id === id)).toHaveLength(1);
        const line = d.e.dialogueById.get(d.e.talkEntry(id, d.s)!)!;
        expect(line.id).toContain('secondink.' + k.site + '.');
        if (guest?.person === id) {
          expect(line.citationSource).toBe(guest.source);
          expect(d.e.pack.sources.some((s) => s.id === guest.source)).toBe(true);
        }
      }
      expect(d.e.pack.missions.find((m) => m.id === 'second-ink-' + k.site)?.objectives).toHaveLength(9);
      for (const obj of ['slip', 'cord', 'bell', 'delivery', 'answer', 'transfer'])
        expect(d.e.pack.hints.filter((h) => h.objective === inkKey(k, obj))).toHaveLength(4);
      expect(room.interactables.some((p) => p.id === 'secondink.' + k.site + '.bench')).toBe(true);
      expect(
        d.e.dialogueById.get(k.room + '.keeper')!.options?.some((o) => o.next === inkKey(k, 'case')),
      ).toBe(true);
      expect(k.entrust).not.toBe(inkCases[(i + 1) % inkCases.length].entrust);
    }
  });
});
