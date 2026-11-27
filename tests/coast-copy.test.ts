import { describe, expect, it } from 'vitest';
import { COAST_COPY_DESK, COAST_COPY_OBJECTIVE, COAST_COPY_POCKET, COAST_COPY_READER, coastCopyFlag } from '../src/content/coastCopy';
import { KUNIT_KEY, TURNING_EXHIBIT, TURNING_OBJECTIVE } from '../src/content/turningTable';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const desk = MAPS['voices.listening'].interactables.find(({ id }) => id === COAST_COPY_DESK)!;
const walk = MAPS['voices.walk'].interactables;
const bench = walk.find(({ id }) => id === COAST_COPY_READER)!;
const pocket = walk.find(({ id }) => id === COAST_COPY_POCKET)!;

const set = (d: Driver, key: string, value: string | boolean = true) =>
  d.run({ type: 'SetFlag', flag: coastCopyFlag(key), value });

function earned(d: Driver) {
  d.s.objectivesDone.push(TURNING_OBJECTIVE, 'voices.arrival');
  d.run({ type: 'InspectExhibit', exhibit: TURNING_EXHIBIT });
  d.run({ type: 'ClaimSpecimen', exhibit: TURNING_EXHIBIT });
}

describe('The Other Half of the Copy', () => {
  it('uses the same exact exhibit and gives an in-world lead from the Turning Room', () => {
    const d = new Driver();
    const ref = MAPS['sea.turning-room'].interactables.find(({ id }) => id === 'turning-copy-referral')!;
    expect(check(ref.visibleIf, d.s)).toBe(false);
    expect(check(desk.visibleIf, d.s)).toBe(false);
    earned(d);
    expect(ref.text).toContain('the Archive of Voices');
    expect(check(ref.visibleIf, d.s)).toBe(true);
    expect(check(desk.visibleIf, d.s)).toBe(true);
    expect(check(bench.visibleIf, d.s)).toBe(false);
    expect(d.e.pack.exhibits.filter(({ specimen }) => specimen?.key === KUNIT_KEY).map(({ id }) => id)).toEqual([TURNING_EXHIBIT]);
    expect(d.e.pack.sources.find(({ id }) => id === 'HIS-KUNIT-HOLM')).toMatchObject({
      url: 'https://tidsskrift.dk/geografisktidsskrift/article/view/48890',
      supports: expect.stringContaining('Kunit carved the map and showed him'),
    });
    expect(d.e.pack.hints.filter(({ objective }) => objective === COAST_COPY_OBJECTIVE).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
  });

  it.each([['rubbing', 'sleeve'], ['account', 'pockets']])('resumes a %s trial and preserves only the checked %s result', (trial, layout) => {
    const d = new Driver();
    earned(d);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(KUNIT_KEY) });
    set(d, 'started');
    d.run({ type: 'EquipPerspective', keepsake: null });
    set(d, 'account');
    set(d, 'rubbing');
    set(d, 'trial', trial);
    expect(check(bench.visibleIf, d.s)).toBe(true);
    expect(check(pocket.visibleIf, d.s)).toBe(false);
    expect(d.s.objectivesDone).not.toContain(COAST_COPY_OBJECTIVE);
    set(d, 'gap', trial);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(check(bench.visibleIf, d.s)).toBe(true);
    expect(d.s.flags[coastCopyFlag('gap')]).toBe(trial);
    set(d, 'layout', layout);
    expect(d.done(COAST_COPY_OBJECTIVE)).toBe(false);
    expect(check(pocket.visibleIf, d.s)).toBe(false);
    if (layout === 'pockets') {
      set(d, 'bench-tab');
      expect(check(pocket.visibleIf, d.s)).toBe(true);
      expect(d.done(COAST_COPY_OBJECTIVE)).toBe(false);
    }
    set(d, 'received', layout);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.done(COAST_COPY_OBJECTIVE)).toBe(true);
    expect(d.s.journal.filter((entry) => entry === 'j.coast-copy.receipt')).toHaveLength(1);
    const visibleReceipts = walk.filter((prop) => prop.id.endsWith('-receipt') && prop.id.startsWith('coast-copy') && check(prop.visibleIf, d.s));
    expect(visibleReceipts.map(({ id }) => id)).toEqual([`coast-copy-${layout}-receipt`]);
  });

  it('keeps an incomplete or mismatched readback out of the Journal', () => {
    const d = new Driver();
    earned(d);
    set(d, 'started');
    set(d, 'trial', 'account');
    set(d, 'layout', 'sleeve');
    set(d, 'received', 'pockets');
    expect(d.done(COAST_COPY_OBJECTIVE)).toBe(false);
    set(d, 'gap', 'account');
    set(d, 'rubbing');
    set(d, 'account');
    expect(d.done(COAST_COPY_OBJECTIVE)).toBe(false);
    expect(d.s.journal).not.toContain('j.coast-copy.receipt');
  });
});
