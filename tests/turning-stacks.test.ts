import { describe, expect, it } from 'vitest';
import { mlaCitation } from '../src/domain/mla';
import { Driver } from './driver';
import type { CampaignState } from '../src/domain/types';
import { stackHosts } from '../src/content/turningStacks';
import { stackWindow } from '../src/content/stackWindows';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { MAPS } from '../src/maps';
import {
  ballotView,
  easternCopy,
  leafKeys,
  seats,
  shelfSquares,
  stackEdition,
  stackEffects,
  stackLeaves,
  stackPath,
  stackPlan,
  stackSquare,
  stacksShop,
  stacksWalk,
  stepSquare,
  type Aisle,
  type Direction,
  type Shelf,
  type StackCommand,
} from '../src/domain/turningStacks';
import { specimenToolId } from '../src/domain/specimenGear';
import { migrateCampaign } from '../src/domain/saves';

type Act = StackCommand extends infer C ? (C extends StackCommand ? Omit<C, 'type'> : never) : never;
const go = (d: Driver, act: Act) => d.run({ type: 'WorkTurningStacks', ...act });
function home(d: Driver) {
  d.s.mapId = stacksShop;
}
describe('The house with six names', () => {
  it('brings all thirty ordered leaf pairs through every screen and both doors, preserving separate publishers and both readings', () => {
    const d = new Driver();
    const pairTexts = new Set<string>();
    for (const first of leafKeys)
      for (const second of leafKeys) {
        if (first === second) continue;
        const windows = stackWindow(first, second);
        expect(windows).toBeDefined();
        expect(windows.voices).not.toBe(windows.years);
        pairTexts.add(windows.voices);
        pairTexts.add(windows.years);
        for (const aisle of ['window', 'centre', 'stair'] as const)
          for (const visitor of ['wheel', 'lamp'] as const) {
            const s: CampaignState = { ...d.s, mapId: stacksShop, flags: { ...d.s.flags } };
            const act = (cmd: Act) => {
              for (const e of stackEffects(s, { type: 'WorkTurningStacks', ...cmd })) {
                if ('setFlag' in e) s.flags[e.setFlag] = e.value!;
              }
            };
            act({ act: 'shelve', shelf: 'window', leaf: first });
            act({ act: 'shelve', shelf: 'stair', leaf: second });
            act({ act: 'swing', aisle });
            act({ act: 'enter', visitor });
            for (const shelf of ['window', 'stair'] as Shelf[]) {
              const square = stackPlan(s).square!;
              const path = stackPath(square, shelfSquares[shelf], aisle);
              for (const way of path) act({ act: 'step', way });
              expect(stackPlan(s).square).toBe(shelfSquares[shelf]);
              act({ act: 'read' });
            }
            act({ act: 'bind' });
            expect(stackEdition(s)).toEqual({ first, second, aisle, visitor });
            const frozen = s.flags['stacks.edition'];
            s.mapId = stacksWalk;
            for (const edge of ['street', 'inside'] as const) {
              act({ act: 'open', edge });
              expect(s.flags['stacks.opened']).toBe(frozen);
              for (const lens of ['years', 'voices'] as const) {
                act({ act: 'glass', lens });
                expect(s.flags['stacks.glass.' + lens]).toBe(frozen);
              }
              for (const voice of ['carrier', 'maker'] as const) act({ act: 'reply', voice });
            }
          }
      }
    expect(pairTexts.size).toBe(30);
  });
  it('keeps every open tile connected to both shelves and stops steps through walls or off the floor', () => {
    const ways: Direction[] = ['north', 'south', 'east', 'west'];
    for (const aisle of ['window', 'centre', 'stair'] as Aisle[])
      for (let sq = 0; sq < 25; sq++) {
        if (stackSquare(sq, aisle) === 'partition') continue;
        for (const side of Object.keys(seats) as Shelf[]) {
          const dest = shelfSquares[side],
            route = stackPath(sq, dest, aisle);
          let x = sq;
          for (const way of route) {
            const next = stepSquare(x, way, aisle);
            expect(next).toBeDefined();
            x = next!;
          }
          expect(x).toBe(dest);
        }
        for (const way of ways) {
          const next = stepSquare(sq, way, aisle);
          if (next === undefined) continue;
          expect(next).toBeGreaterThanOrEqual(0);
          expect(next).toBeLessThan(25);
          expect(stackSquare(next, aisle)).not.toBe('partition');
        }
      }
    expect(stepSquare(0, 'north', 'centre')).toBeUndefined();
    expect(stepSquare(6, 'east', 'centre')).toBeUndefined();
  });
  it('joins an Eastern Shawnee certificate to the Absentee Shawnee account in walking order, then opens the older edition after a change at home', () => {
    const d = new Driver();
    home(d);
    go(d, { act: 'shelve', shelf: 'window', leaf: 'eastern' });
    go(d, { act: 'shelve', shelf: 'stair', leaf: 'absentee' });
    go(d, { act: 'enter', visitor: 'lamp' });
    expect(() => go(d, { act: 'bind' })).toThrow(/both leaves/);
    for (const shelf of ['stair', 'window'] as const) {
      go(d, { act: 'follow', shelf });
      go(d, { act: 'read' });
    }
    expect(() => go(d, { act: 'headline', side: 'against' })).toThrow(/ring/);
    for (const basis of ['valid', 'returned', 'eligible'] as const) {
      go(d, { act: 'count', basis });
      if (basis === 'valid') for (const side of ['against', 'for'] as const) go(d, { act: 'headline', side });
    }
    expect(d.done('stacks.headlines')).toBe(true);
    expect(d.done('stacks.counts')).toBe(true);
    expect([ballotView('valid').percent, ballotView('returned').percent, ballotView('eligible').percent]).toEqual([
      '70.6',
      '68.0',
      '42.6',
    ]);
    go(d, { act: 'bind' });
    const sent = stackEdition(d.s);
    expect(sent?.first).toBe('absentee');
    go(d, { act: 'shelve', shelf: 'window', leaf: 'fort' });
    expect(stackPlan(d.s).visitor).toBeUndefined();
    expect(stackEdition(d.s)).toEqual(sent);
    d.s.mapId = stacksWalk;
    expect(() => go(d, { act: 'reply', voice: 'maker' })).toThrow(/Open/);
    go(d, { act: 'open', edge: 'inside' });
    go(d, { act: 'glass', lens: 'voices' });
    expect(d.done('stacks.readPair.absentee.eastern')).toBe(false);
    go(d, { act: 'glass', lens: 'years' });
    expect(d.done('stacks.readPair.absentee.eastern')).toBe(true);
    expect(d.done('stacks.readPair.convention.peoria')).toBe(false);
    go(d, { act: 'reply', voice: 'maker' });
    expect(d.done('stacks.reply')).toBe(true);
    expect(d.e.talkEntry(stackHosts.opal, d.s)).toBe('stacks.opal.street');
    expect(stackEdition(migrateCampaign(JSON.parse(JSON.stringify(d.s))).state)).toEqual(sent);
    const entries = adventureJournalView(d.e.pack, d.s, []).entries;
    expect(entries.some((e) => e.text.includes('Absentee Shawnee Tribe describes its own emblem'))).toBe(true);
    expect(entries.some((e) => e.text.includes('68.0%'))).toBe(true);
    expect(entries.some((e) => e.text.includes(stackLeaves.fort.detail))).toBe(false);
  });
  it.each([
    ['convention', 'peoria', 'convention.peoria', 'wider history of twenty tribes'],
    ['absentee', 'marker', 'absentee.marker', 'Neither promises the exact words he spoke'],
    ['convention', 'fort', 'convention.fort', 'separate convention'],
  ] as const)(
    'keeps the two readings of %s and %s with their particular historical pair',
    (one, two, key, detail) => {
      const d = new Driver();
      home(d);
      go(d, { act: 'shelve', shelf: 'window', leaf: one });
      go(d, { act: 'shelve', shelf: 'stair', leaf: two });
      go(d, { act: 'enter', visitor: 'wheel' });
      for (const shelf of ['window', 'stair'] as const) {
        go(d, { act: 'follow', shelf });
        go(d, { act: 'read' });
      }
      go(d, { act: 'bind' });
      d.s.mapId = stacksWalk;
      go(d, { act: 'open', edge: 'street' });
      go(d, { act: 'glass', lens: 'years' });
      expect(d.done('stacks.readPair.' + key)).toBe(false);
      go(d, { act: 'glass', lens: 'voices' });
      expect(d.done('stacks.readPair.' + key)).toBe(true);
      expect(adventureJournalView(d.e.pack, d.s, []).entries.some((e) => e.text.includes(detail))).toBe(true);
      expect(d.done('stacks.readPair.absentee.eastern')).toBe(false);
    },
  );
  it('opens the signature lamp only when the separately identified constitutional copy is owned, carried and in use', () => {
    const d = new Driver();
    home(d);
    const prop = MAPS[stacksShop].interactables.find((it) => it.id === 'stacks-signature')!;
    expect(prop.visibleIf).toBeDefined();
    expect(() => go(d, { act: 'signature', line: 'date' })).toThrow(/Equip|equip/);
    expect(adventureJournalView(d.e.pack, d.s, []).references.some((ref) => ref.key === easternCopy)).toBe(false);
    d.s.objectivesDone.push('record.edge.civic.post');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-EDGE-EASTERN' });
    d.run({ type: 'ClaimSpecimen', exhibit: 'OBJ-EDGE-EASTERN' });
    expect(() => go(d, { act: 'signature', line: 'board' })).toThrow(/equip/);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(easternCopy) });
    for (const line of ['board', 'date'] as const) go(d, { act: 'signature', line });
    const entries = adventureJournalView(d.e.pack, d.s, []).entries;
    expect(d.done('stacks.signatures')).toBe(true);
    const earned = adventureJournalView(d.e.pack, d.s, []).references.find((ref) => ref.key === easternCopy);
    expect(earned?.url).toBe('https://www.estoo-nsn.gov/media/2551');
    expect(earned?.text).toContain('17 June 1999');
    expect(entries.some((e) => e.text.includes('Mary Moss, Lena Mae Elliott and Glen Brock'))).toBe(true);
    const certificate = d.e.pack.sources.find((source) => source.id === 'HIS-STACK-CERT')!;
    const citation = mlaCitation(certificate)
      .map((p) => p.text)
      .join('');
    expect(citation).toContain('Constitution of the Eastern Shawnee Tribe of Oklahoma, 17 June 1999,');
    expect(citation).toContain('Accessed 27 Nov. 2026.');
    expect(d.e.pack.exhibits.find((e) => e.id === 'OBJ-EDGE-EASTERN')?.specimen?.revisit?.prop).toBe(prop.id);
  });
});
