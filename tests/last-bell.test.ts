import { describe, expect, it } from 'vitest';
import { bellGrooves, hearingChoices, lastBellScenes, lastBellObjective } from '../src/content/lastBell';
import { adventureJournalView, setDiaryReflection } from '../src/domain/adventureJournal';
import { benchOrder, cylinder, hearingRecord, relayRun, type LastBellCommand } from '../src/domain/lastBell';
import { LANTERN_SITES, lanternReturn } from '../src/domain/lamplight';
import { selectDiary } from '../src/domain/diarySelection';
import { migrateCampaign } from '../src/domain/saves';
import { check } from '../src/domain/rules';
import { HINGED_PLANK, PLANK_DOOR } from '../src/maps/hingedPlank';
import { Driver } from './driver';
import { buildPack } from '../src/content';

const pack = buildPack();
const cmd = (action: Omit<Extract<LastBellCommand, { action: 'leave' }>, 'type'>) => ({
  type: 'WorkLastBell' as const,
  ...action,
});
function spin(d: Driver, first: number, last: number) {
  d.run({ type: 'WorkLastBell', site: 'voices', action: 'spin', first, last });
}
function run(d: Driver, runner: number, fog: boolean) {
  d.run({ type: 'WorkLastBell', site: 'island', action: 'send', runner, fog });
}
function lay(d: Driver, leaf: number) {
  d.run({ type: 'WorkLastBell', site: 'council', action: 'lay', leaf });
}
function leave(d: Driver, site: keyof typeof lastBellScenes, choice: number) {
  d.run(cmd({ site, action: 'leave', choice }));
}
const walk = { type: 'WorkLastBell', site: 'island', action: 'walk' } as const;

describe('the bell in the kitchen and the return hearing', () => {
  it.each([
    ['gate', 'water.gatehouse', 'TEC'],
    ['dispatch', 'civic.dispatch', 'POL'],
  ] as const)(
    'includes earlier %s watch entries and their original answers in combined topic exports',
    (site, room, theme) => {
      const d = new Driver();
      d.s.mapId = room;
      d.run({ type: 'WorkNightWatch', site, stage: 'try', setting: 0 });
      const key = 'night-watch.' + site + ':try:0';
      const entry = adventureJournalView(pack, d.s, []).entries.find((e) => e.event?.key === key)!;
      expect(entry.reflections?.map((q) => q.id)).toEqual(['tool', 'watch']);
      d.s = setDiaryReflection(pack, d.s, entry.id, 'tool', 'I kept the first night on the rota.');
      d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
      const result = selectDiary(adventureJournalView(pack, d.s, []), {
        time: { kind: 'all' },
        now: new Date(),
        topics: { areas: ['MAT'], themes: [theme], concepts: ['evidence'], framework: ['ethics'] },
      });
      expect(result.view?.entries.find((row) => row.id === entry.id)?.reflections?.[0].response).toBe(
        'I kept the first night on the rota.',
      );
    },
  );
  it('can hear six different cuts, restore a stopped cylinder and give the witness either publication', () => {
    const d = new Driver();
    expect(() => spin(d, 0, 0)).toThrow();
    d.s.mapId = lastBellScenes.voices.map;
    for (const [a, b] of [
      [2, 1],
      [-1, 0],
      [1, 3],
      [0.5, 1],
    ])
      expect(() => spin(d, a, b)).toThrow();
    expect(() => leave(d, 'voices', 1)).toThrow();
    for (const [a, b] of [
      [1, 2],
      [2, 2],
      [1, 1],
      [0, 1],
      [0, 0],
    ])
      spin(d, a, b);
    expect(() => leave(d, 'voices', 1)).toThrow();
    const journalCount = d.s.adventureDiary.entries.length;
    spin(d, 0, 0);
    expect(d.s.adventureDiary.entries).toHaveLength(journalCount);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    spin(d, 0, 2);
    expect(cylinder(0, 2)).toBe(bellGrooves.join(' '));
    for (const i of [0, 1]) {
      leave(d, 'voices', i);
      expect(hearingRecord(d.s, 0)).toContain(i ? 'unsigned' : 'complete recording');
    }
    expect(d.s.objectivesDone.filter((id) => id === lastBellObjective('voices'))).toHaveLength(1);
    const entry = adventureJournalView(pack, d.s, []).entries.find(
      (e) => e.event?.key === 'last-bell.voices:spin:02',
    )!;
    expect(entry.reflections).toHaveLength(2);
    d.s = setDiaryReflection(pack, d.s, entry.id, entry.reflections![0].id, 'A few words changed what rang.');
    const selected = selectDiary(adventureJournalView(pack, d.s, []), {
      time: { kind: 'all' },
      now: new Date(),
      topics: { areas: ['ART'], themes: ['LAN'], concepts: ['interpretation'] },
    });
    expect(selected.view?.entries.find((e) => e.id === entry.id)?.reflections?.[0].response).toBe(
      'A few words changed what rang.',
    );
  });
  it.each([0, 1])('tests a relay failure and replots the measured crossing with runner %i', (choice) => {
    const d = new Driver();
    d.s.mapId = lastBellScenes.island.map;
    expect(() => d.run(walk)).toThrow();
    expect(() => run(d, 2, true)).toThrow();
    for (const i of [0, 1]) {
      run(d, i, true);
      expect(relayRun(i, true).beats).toEqual(i === 0 ? [3, 5] : [5, 3]);
    }
    expect(() => leave(d, 'island', choice)).toThrow();
    run(d, choice, false);
    expect(relayRun(choice, false).beats).toEqual([2, 2]);
    leave(d, 'island', choice);
    const old = hearingRecord(d.s, 1);
    expect(check(PLANK_DOOR.visibleIf!, d.s)).toBe(true);
    expect(() => d.run(walk)).toThrow('footpath');
    d.s.mapId = HINGED_PLANK.id;
    for (const prop of HINGED_PLANK.interactables.filter((p) => p.kind === 'sign')) {
      if (prop.visibleIf) expect(check(prop.visibleIf, d.s)).toBe(true);
      d.run({ type: 'ReadWorldSign', id: prop.id, title: prop.label, text: prop.text!, readFlag: prop.flag });
    }
    d.s.mapId = lastBellScenes.island.map;
    d.run(walk);
    expect(() => leave(d, 'island', choice)).toThrow();
    run(d, choice, false);
    expect(() => leave(d, 'island', choice)).toThrow();
    run(d, choice, true);
    expect(hearingRecord(d.s, 1)).toBe(old);
    leave(d, 'island', choice);
    expect(relayRun(choice, true, true).beats).toEqual(choice === 0 ? [3, 4] : [7, 3]);
    expect(hearingRecord(d.s, 1)).toContain(choice === 0 ? 'as the crossing shut' : 'beat 7');
    expect(d.s.objectivesDone).toContain('last-bell.island.field-check');
  });
  it.each([
    [0, 1],
    [1, 0],
    [2, 0],
    [0, 2],
    [1, 2],
    [2, 1],
  ])('gives both chairs a hearing with records %i then %i on a first visit', (first, last) => {
    const d = new Driver();
    d.s.mapId = lastBellScenes.council.map;
    lay(d, first);
    lay(d, first);
    expect(() => leave(d, 'council', 0)).toThrow();
    expect(() => lay(d, 3)).toThrow();
    lay(d, last);
    expect(benchOrder(d.s)).toEqual([first, last]);
    for (const choice of [0, 1]) {
      leave(d, 'council', choice);
      const signed = String(d.s.flags['last-bell.council.minute']);
      const a = hearingRecord(d.s, first),
        b = hearingRecord(d.s, last);
      expect(signed).toContain(a);
      expect(signed).toContain(b);
      expect(signed.indexOf(a)).toBeLessThan(signed.indexOf(b));
      expect(signed).toContain(hearingChoices[choice].outcome);
    }
    const copy = d.s.flags['last-bell.council.minute'];
    lay(d, first);
    expect(benchOrder(d.s)).toEqual([last, first]);
    expect(d.s.flags['last-bell.council.minute']).toBe(copy);
  });
  it('keeps the signed minute when its upstream author changes the edition and updates the record on resealing', () => {
    const d = new Driver();
    d.s.mapId = lastBellScenes.voices.map;
    spin(d, 0, 0);
    spin(d, 0, 2);
    leave(d, 'voices', 0);
    d.s.mapId = lastBellScenes.council.map;
    lay(d, 0);
    lay(d, 2);
    leave(d, 'council', 0);
    const first = d.s.flags['last-bell.council.minute'];
    expect(first).toContain('complete recording');
    d.s.mapId = lastBellScenes.voices.map;
    leave(d, 'voices', 1);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.s.flags['last-bell.council.minute']).toBe(first);
    d.s.mapId = lastBellScenes.council.map;
    leave(d, 'council', 0);
    expect(d.s.flags['last-bell.council.minute']).toContain('unsigned slip');
    const tails = d.s.adventureDiary.entries.filter((e) =>
      e.event?.key.startsWith('last-bell.council:leave'),
    );
    expect(tails.map((x) => x.text).join(' ')).toContain('complete recording');
    expect(tails.at(-1)?.text).toContain('unsigned slip');
  });
  it('requires the four field records for either second hearing and keeps the original minute', () => {
    const d = new Driver();
    d.s.mapId = lastBellScenes.council.map;
    lay(d, 2);
    lay(d, 0);
    leave(d, 'council', 0);
    const minute = d.s.flags['last-bell.council.minute'];
    const submit = (petition: number) =>
      d.run({ type: 'WorkLastBell', site: 'council', action: 'reopen', petition });
    for (const [key, value] of Object.entries({
      'night-watch.gate.left': 2,
      'night-watch.dispatch.left': 0,
      'last-bell.voices.left': 1,
      'last-bell.island.left': 0,
      'last-bell.island.field-check': true,
    })) {
      expect(() => submit(0)).toThrow();
      d.s.flags[key] = value;
    }
    expect(() => submit(9)).toThrow();
    for (const choice of [1, 0]) {
      submit(choice);
      expect(d.s.flags['last-bell.council.reopened']).toBe(choice);
      expect(d.s.flags['last-bell.council.addendum']).toContain('2 missed floods');
      expect(d.s.flags['last-bell.council.addendum']).toContain('unsigned slip');
      expect(d.s.flags['last-bell.council.minute']).toBe(minute);
    }
  });
  it('shows actionable unfinished guest work at each station, including after a reload', () => {
    const d = new Driver(),
      site = LANTERN_SITES[0],
      [a, b] = site.pair.guests;
    d.s.mapId = site.map;
    const job = { type: 'WorkWithLantern' as const, site: site.id };
    d.run({ ...job, person: a, stage: 'meet' });
    d.run({ ...job, person: a, stage: 'pin', piece: 0 });
    d.run({ ...job, person: a, stage: 'pin', piece: 1 });
    d.run({ ...job, person: a, stage: 'trace', option: 0 });
    d.run({ ...job, person: b, stage: 'meet' });
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(lanternReturn(d.s, site, false)?.id).toBe(b);
    expect(lanternReturn(d.s, site, true)?.id).toBe(a);
    d.run({ ...job, person: a, stage: 'use', option: 1 });
    expect(lanternReturn(d.s, site, true)?.id).toBe(b);
    expect(new Set(LANTERN_SITES.map((s) => s.arrival)).size).toBe(15);
  });
});
