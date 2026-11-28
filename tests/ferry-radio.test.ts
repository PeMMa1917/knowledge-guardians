import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { migrateCampaign } from '../src/domain/saves';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import {
  aerials,
  bands,
  crowds,
  editions,
  radioDock,
  radioLoft,
  sealedProgramme,
  stations,
  tuned,
  weekMix,
  wireTopics,
  type Caller,
  type Crowd,
  type Edition,
  type WireCommand,
} from '../src/domain/ferryRadio';

type Move = WireCommand extends infer T ? (T extends WireCommand ? Omit<T, 'type'> : never) : never;
const act = (d: Driver, cmd: Move) => d.run({ type: 'WorkFerryRadio', ...cmd });
function onFerry() {
  const d = new Driver();
  d.s.objectivesDone.push('sea.arrival');
  return d;
}
function pick(d: Driver, id: Caller, word: 'open' | 'prompt' = 'open') {
  const station = stations.find((s) => s.id === id)!;
  act(d, { act: 'tune', band: station.band });
  act(d, { act: 'point', aerial: station.aerial });
  act(d, { act: 'ask', wording: word });
  act(d, { act: 'listen' });
}
function make(d: Driver, edition: Edition, frame: Crowd = 'pooled') {
  d.s.mapId = radioLoft;
  pick(d, 'child');
  pick(d, 'mara');
  act(d, { act: 'align', take: 'first' });
  act(d, { act: 'align', take: 'second' });
  act(d, { act: 'pin', crowd: frame });
  act(d, { act: 'quote', caller: 'child', credit: 'anonymous' });
  act(d, { act: 'issue', edition, crowd: frame });
}
describe('The last word on the water', () => {
  it('tunes eight physical settings with six different callers and two quiet receivers', () => {
    const d = onFerry();
    d.s.mapId = radioLoft;
    const voices = new Set(),
      silent = [];
    for (const aerial of aerials)
      for (const band of bands) {
        act(d, { act: 'tune', band });
        act(d, { act: 'point', aerial });
        act(d, { act: 'listen' });
        const st = tuned(d.s);
        if (st) voices.add(st.id);
        else silent.push([band, aerial]);
      }
    expect(voices.size).toBe(6);
    expect(silent).toEqual([
      ['wood', 'roof'],
      ['glass', 'water'],
    ]);
    expect(d.s.flags['wire.issued']).toBeUndefined();
    expect(new Set(stations.map((st) => st.first)).size).toBe(6);
    expect(new Set(stations.map((st) => st.prompted)).size).toBe(6);
  });
  it('separates a leading question from the first take and respects all three recording permissions', () => {
    const d = onFerry();
    d.s.mapId = radioLoft;
    expect(() => act(d, { act: 'quote', caller: 'mara', credit: 'credit' })).toThrow(/open line/);
    pick(d, 'joist', 'prompt');
    expect(d.done('wire.leading')).toBe(false);
    pick(d, 'joist');
    expect(d.done('wire.leading')).toBe(true);
    expect(() => act(d, { act: 'quote', caller: 'joist', credit: 'credit' })).toThrow(/unnamed/);
    act(d, { act: 'quote', caller: 'joist', credit: 'anonymous' });
    pick(d, 'mara');
    act(d, { act: 'quote', caller: 'mara', credit: 'credit' });
    pick(d, 'siv');
    expect(() => act(d, { act: 'quote', caller: 'siv', credit: 'anonymous' })).toThrow(/private/);
    const view = adventureJournalView(d.e.pack, d.s, []);
    const log = view.entries.find((e) => e.event?.key === 'ferry-wire:listen.reed.water.open')!;
    expect(log.text).toMatch(/private voice off my page/);
    expect(log.text).not.toContain(stations.find((s) => s.id === 'siv')!.first);
    expect(wireTopics('quote').framework).toContain('ethics');
  });
  it('exposes a genuine reversal and distinguishes a weighted comparison from observed passenger counts', () => {
    const a = weekMix('pooled'),
      b = weekMix('covered'),
      c = weekMix('open'),
      same = weekMix('balanced');
    expect(a.map((x) => x.percent)).toEqual([78, 82]);
    expect(b.map((x) => x.percent)).toEqual([90, 85]);
    expect(c.map((x) => x.percent)).toEqual([75, 70]);
    expect(same.map((x) => x.percent)).toEqual([82.5, 77.5]);
    expect(same.every((x) => x.people === null)).toBe(true);
    const d = onFerry();
    d.s.mapId = radioLoft;
    act(d, { act: 'pin', crowd: 'pooled' });
    expect(() => act(d, { act: 'balance' })).toThrow(/four|both nights/i);
    for (const crowd of Object.keys(crowds) as Crowd[]) act(d, { act: 'pin', crowd });
    act(d, { act: 'balance' });
    expect(d.done('wire.crowd')).toBe(true);
  });
  it('identifies the reused recording only after tracing both independent sounds, then preserves the issued edition through save serialization and recovery', () => {
    const d = onFerry();
    d.s.mapId = radioLoft;
    pick(d, 'child');
    expect(() => act(d, { act: 'align', take: 'first' })).toThrow(/two|kettle/);
    make(d, 'pause');
    expect(d.done('wire.voice')).toBe(true);
    const expected = sealedProgramme(d.s);
    act(d, { act: 'quote', caller: 'mara', credit: 'credit' });
    act(d, { act: 'pin', crowd: 'open' });
    expect(sealedProgramme(d.s)).toEqual(expected);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(sealedProgramme(d.s)).toEqual(expected);
    expect(sealedProgramme(d.s)?.credit).toBe('An unnamed listener');
    const publicDoor = MAPS[radioLoft].interactables.find((p) => p.id === 'wire-line')!;
    expect(check(publicDoor.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('island.arrival');
    expect(check(publicDoor.visibleIf, d.s)).toBe(true);
  });
  it('lets all twelve edition and audience combinations reach the island with one distinct visible aftermath per edition', () => {
    const d = onFerry();
    for (const edition of Object.keys(editions) as Edition[])
      for (const frame of Object.keys(crowds) as Crowd[]) {
        make(d, edition, frame);
        d.s.mapId = radioDock;
    if (!d.s.objectivesDone.includes('island.arrival')) d.s.objectivesDone.push('island.arrival');
        expect(() => act(d, { act: 'hear', listener: 'singer' })).toThrow(/programme/);
        act(d, { act: 'receive' });
        act(d, { act: 'hear', listener: 'runner' });
        act(d, { act: 'hear', listener: 'singer' });
        const selected = sealedProgramme(d.s)!;
        expect([selected.edition, selected.crowd]).toEqual([edition, frame]);
        const available = MAPS[radioDock].interactables.filter(
          (p) => ['wire-sheet', 'wire-rest', 'wire-second'].includes(p.id) && check(p.visibleIf, d.s),
        );
        expect(available).toHaveLength(1);
        expect(available[0].id).toBe(
          { chorus: 'wire-sheet', pause: 'wire-rest', relay: 'wire-second' }[edition],
        );
        d.s.mapId = radioLoft;
        act(d, { act: 'issue', edition, crowd: frame });
        expect(d.s.flags['wire.received']).toBe(true);
      }
  });
  it('offers both shifts, preserves the first hearing and allows a later correction of the on-air edition', () => {
    const d = onFerry();
    make(d, 'relay');
    pick(d, 'siv');
    for (const crowd of Object.keys(crowds) as Crowd[]) act(d, { act: 'pin', crowd });
    act(d, { act: 'balance' });
    d.s.mapId = radioDock;
    if (!d.s.objectivesDone.includes('island.arrival')) d.s.objectivesDone.push('island.arrival');
    act(d, { act: 'receive' });
    act(d, { act: 'hear', listener: 'singer' });
    act(d, { act: 'invite', shift: 'late' });
    expect(() => act(d, { act: 'file' })).toThrow(/both listeners/);
    act(d, { act: 'hear', listener: 'runner' });
    act(d, { act: 'file' });
    act(d, { act: 'invite', shift: 'break' });
    act(d, { act: 'file' });
    expect(d.done('wire.shift')).toBe(true);
    expect(d.s.flags['wire.invited.late']).toBe(true);
    expect(d.s.flags['wire.filedShift']).toBe('break');
    d.s.mapId = radioLoft;
    act(d, { act: 'issue', edition: 'pause', crowd: 'balanced' });
    expect(d.s.flags['wire.received']).toBe(false);
    expect(d.s.flags['wire.filedShift']).toBe('break');
    expect(
      adventureJournalView(d.e.pack, d.s, []).entries.filter((e) =>
        e.event?.key.startsWith('ferry-wire:invite.'),
      ),
    ).toHaveLength(2);
  });
});
