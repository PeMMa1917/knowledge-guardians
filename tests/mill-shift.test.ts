import { describe, expect, it } from 'vitest';
import { adventureJournalView } from '../src/domain/adventureJournal';
import {
  millEffects,
  millEdition,
  millEstimateLine,
  millMoves,
  millPurse,
  millReturn,
  millRunMask,
  millStrip,
  runMill,
  type MillCommand,
} from '../src/domain/millShift';
import { buildPack } from '../src/content';
import { millAccounts, millSites, type MillSite } from '../src/content/millShift';
import { apply, emptyOutputs } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { microSkillId } from '../src/domain/skills';
import { Driver } from './driver';

type Action = MillCommand extends infer C ? (C extends MillCommand ? Omit<C, 'type'> : never) : never;
const full = (options: Action): MillCommand => ({ type: 'WorkMillShift', ...options });
const room = (site: MillSite) => 'night-register.' + site;
const sides = [0, 1] as const;
const hands = [0, 1, 2] as const;

describe('The four bells of the mill shift', () => {
  it('reaches every conserved division of six counters, permits an empty bowl, and needs both books for a settlement', () => {
    const initial = new Driver().s;
    let s = { ...initial, mapId: room('nile') };
    const doIt = (options: Action) => {
      s = apply(millEffects(s, full(options)), s, emptyOutputs());
    };
    expect(() => doIt({ action: 'lay', book: 0 })).toThrow(/keeper/);
    doIt({ action: 'arrive' });
    doIt({ action: 'lay', book: 1 });
    expect(millPurse(s)).toEqual([3, 0, 3]);
    expect(() => doIt({ action: 'coin', from: 1, to: 0 })).toThrow(/holds one/);
    expect(() => doIt({ action: 'purse' })).toThrow(/both/i);
    doIt({ action: 'lay', book: 0 });
    const start = s;
    const divisions = new Set<string>();
    for (let l = 0; l <= 6; l++)
      for (let t = 0; t <= 6 - l; t++) {
        s = start;
        const target = [l, t, 6 - l - t];
        let v = millPurse(s)!;
        while (v.some((x, i) => x !== target[i])) {
          const from = hands.find((i) => v[i] > target[i])!,
            to = hands.find((i) => v[i] < target[i])!;
          doIt({ action: 'coin', from, to });
          v = millPurse(s)!;
        }
        doIt({ action: 'purse' });
        expect(millPurse(s, true)).toEqual(target);
        divisions.add(v.join(''));
      }
    expect(divisions.size).toBe(28);
    expect(millPurse(start)).toEqual([2, 3, 1]);
    expect(() => doIt({ action: 'stamp' })).toThrow(/Hesper/);
    expect(() => millEffects({ ...s, mapId: 'nexus.archive' }, full({ action: 'arrive' }))).toThrow(
      /register/,
    );
  });

  it('keeps all sixteen punch strips independent under all four rigs, including empty turns and undo', () => {
    const initial = new Driver().s;
    let s = { ...initial, mapId: room('yard') };
    const doIt = (c: Action) => {
      s = apply(millEffects(s, full(c)), s, emptyOutputs());
    };
    doIt({ action: 'arrive' });
    expect(() => doIt({ action: 'stamp' })).toThrow(/four/);
    for (let bits = 0; bits < 16; bits++) {
      const moves = bits.toString(2).padStart(4, '0').replaceAll('0', 'f').replaceAll('1', 't');
      while (millMoves(s)) doIt({ action: 'undo' });
      for (const m of moves) doIt({ action: 'stroke', move: m === 'f' ? 'feed' : 'turn' });
      let mask = 0;
      for (const porter of sides)
        for (const tooth of sides) {
          const rig = tooth + 2 * porter;
          doIt({ action: 'rig', tooth, porter });
          expect(millMoves(s)).toBe(moves);
          expect(millRunMask(s, moves)).toBe(mask);
          doIt({ action: 'stamp' });
          mask |= 1 << rig;
          const run = millStrip(s)!;
          expect(run.rig).toBe(rig);
          expect(run.moves).toBe(moves);
          const blanks =
            3 * [...moves].filter((m) => m === 'f').length +
            porter * [...moves].filter((m) => m === 't').length;
          expect(run.rack + run.cut).toBe(blanks);
          expect(run.bells.every((b) => b.got >= 0 && b.got <= 1 + tooth && b.rack >= 0)).toBe(true);
        }
      expect(() => doIt({ action: 'stroke', move: 'feed' })).toThrow(/four/);
      doIt({ action: 'undo' });
      expect(millStrip(s)?.moves).toBe(moves);
    }
    expect([0, 1, 2, 3].map((r) => runMill(r, 'fttt').cut)).toEqual([3, 3, 3, 6]);
  });

  it('publishes any of three headlines, verb forms and audiences from either source or both, in either encounter order', () => {
    const base = new Driver().s;
    for (const order of [['nile'], ['yard'], ['nile', 'yard'], ['yard', 'nile']] as const) {
      let s = base;
      const go = (site: MillSite) => {
        s = { ...s, mapId: room(site) };
        doIt({ action: 'arrive' });
      };
      const doIt = (c: Action) => {
        s = apply(millEffects(s, full(c)), s, emptyOutputs());
      };
      go('press');
      doIt({ action: 'typeset', claim: 0 });
      doIt({ action: 'tense', mode: 'docket' });
      expect(() => doIt({ action: 'send', audience: 0 })).toThrow(/purse/);
      for (const site of order) {
        go(site);
        if (site === 'nile') {
          for (const book of sides) doIt({ action: 'lay', book });
          doIt({ action: 'purse' });
        } else {
          for (let b = 0; b < 4; b++) doIt({ action: 'stroke', move: 'turn' });
          doIt({ action: 'stamp' });
        }
      }
      go('press');
      for (const claim of hands)
        for (const mode of ['docket', 'rehearsal', 'tomorrow'] as const)
          for (const audience of sides) {
            doIt({ action: 'typeset', claim });
            doIt({ action: 'tense', mode });
            doIt({ action: 'send', audience });
            const e = millEdition(s)!;
            expect([e.audience, e.claim]).toEqual([audience, claim]);
            const paid = (order as readonly string[]).includes('nile'),
              ran = (order as readonly string[]).includes('yard');
            expect(e.text).toContain(paid ? 'Tessel Fen 0' : 'yet to send a settlement');
            expect(e.text).toContain(ran ? '0 notches' : 'yet to send a tried strip');
            expect(millReturn(s, 'nile')).toContain(paid ? 'breakfast chit' : 'space for wages');
            expect(millReturn(s, 'yard')).toContain(ran ? 'no cuts' : 'empty envelope');
          }
    }
  });

  it('puts two equally fitting estimates beside a held-out reconstruction and delivers two different editions and passages', () => {
    const d = new Driver();
    const doIt = (c: Action) => d.run(full(c));
    const go = (site: MillSite) => {
      d.s.mapId = room(site);
      doIt({ action: 'arrive' });
    };
    go('press');
    doIt({ action: 'bind', axis: 'tooth' });
    doIt({ action: 'typeset', claim: 1 });
    expect(() => doIt({ action: 'try-estimate' })).toThrow(/both ways/);
    go('nile');
    for (const book of sides) doIt({ action: 'lay', book });
    doIt({ action: 'purse' });
    go('yard');
    for (const move of ['feed', 'turn', 'turn', 'turn'] as const) doIt({ action: 'stroke', move });
    for (const porter of sides)
      for (const tooth of sides) {
        doIt({ action: 'rig', tooth, porter });
        expect(d.done('mill-shift.yard.joint')).toBe(false);
        doIt({ action: 'stamp' });
      }
    expect(d.done('mill-shift.yard.joint')).toBe(true);
    go('press');
    doIt({ action: 'bind', axis: 'rota' });
    expect(() => doIt({ action: 'try-estimate' })).toThrow(/missing/);
    go('yard');
    doIt({ action: 'rig', tooth: 1, porter: 0 });
    doIt({ action: 'stamp' });
    go('press');
    doIt({ action: 'try-estimate' });
    expect(millEstimateLine(d.s)).toMatch(/wheel predicts 6.*rota predicts 3.*made 3/);
    doIt({ action: 'typeset', claim: 0 });
    doIt({ action: 'tense', mode: 'rehearsal' });
    expect(d.done('mill-shift.press.compared')).toBe(false);
    doIt({ action: 'send', audience: 0 });
    const first = millEdition(d.s)!.text;
    expect(d.done('mill-shift.press.compared')).toBe(true);
    go('yard');
    doIt({ action: 'return' });
    expect(d.s.flags['mill-shift.press.stair']).toBe(true);
    expect(d.s.flags['mill-shift.press.wharf']).toBeUndefined();
    go('nile');
    doIt({ action: 'lay', book: 0 });
    doIt({ action: 'purse' });
    expect(millReturn(d.s, 'nile')).toContain('printed zero');
    go('press');
    doIt({ action: 'tense', mode: 'tomorrow' });
    expect(d.done('mill-shift.press.edited-moods')).toBe(false);
    doIt({ action: 'send', audience: 1 });
    const second = millEdition(d.s)!.text;
    expect(second).not.toBe(first);
    go('nile');
    doIt({ action: 'return' });
    expect(d.s.flags['mill-shift.press.wharf']).toBe(true);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.s.flags['mill-shift.yard.opened-leaf']).toBe(first);
    expect(d.s.flags['mill-shift.nile.opened-leaf']).toBe(second);
    for (const id of [93, 293, 689, 1127]) expect(d.p.skills[microSkillId(id)]).toHaveLength(1);
    const journal = adventureJournalView(buildPack(), d.s, []).entries.filter((e) =>
      e.event?.key.startsWith('mill:'),
    );
    for (const site of millSites) {
      const ours = journal.filter((e) => e.event?.ref.includes(millAccounts[site].guest));
      expect(ours.length).toBeGreaterThan(1);
      expect(
        ours.every(
          (e) =>
            e.reflections?.length &&
            e.reflections.length <= 3 &&
            e.topics?.concepts?.length &&
            e.event?.sourceIds?.length === 1,
        ),
      ).toBe(true);
    }
    expect(journal.some((e) => e.text.includes(first))).toBe(true);
    expect(journal.some((e) => e.text.includes(second))).toBe(true);
  });
});
