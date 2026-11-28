import { describe, expect, it } from 'vitest';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { adventureExportSnapshot } from '../src/ui/adventureExport';
import { artKeys } from '../src/ui/illustrations';
import { Driver } from './driver';

const STUDY = MAPS['aethelgard.study'];
const VOICES = MAPS['voices.listening'];
const privateLine = 'My private reminder for locating the mending tool.';

function flag(d: Driver, key: string, value: boolean | string = true) {
  d.run({ type: 'SetFlag', flag: `linked.${key}`, value });
}

function prepare(d: Driver, carried: boolean) {
  if (carried) {
    d.s.mapId = STUDY.id;
    d.run({ type: 'Reach', zone: 'study' });
    d.walk('linked.study.issue');
    flag(d, 'study.clip.issue');
    flag(d, 'study.bound');
    expect(d.done('linked.study.bound')).toBe(false);
    d.walk('linked.study.trace');
    flag(d, 'study.clip.trace');
    expect(d.done('linked.study.bound')).toBe(true);
  }
  d.s.mapId = VOICES.id;
  d.resumeAfter('civic.finish');
  d.run({ type: 'SetFlag', flag: 'voices.arrived', value: true });
  expect(d.done('voices.arrival')).toBe(true);
  expect(d.done('linked.voices.indexed')).toBe(false);
  if (!carried) d.walk('linked.voices.local', ['Take the two local reference tabs']);
  flag(d, 'voices.entry', carried ? 'carried' : 'local');
}

function visible(d: Driver, prop: string) {
  const found = VOICES.interactables.find(({ id }) => prop === id);
  if (!found) throw new Error('Missing prop ' + prop);
  return check(found.visibleIf, d.s);
}

describe('The Borrowed Straightedge', () => {
  it.each([
    [true,'open'], [false,'keeper'],
  ] as const)('finds separate records and reaches the selected location (%s, %s)', (carried, layout) => {
    const d = new Driver();
    prepare(d, carried);
    expect(visible(d, 'linked-voices-date')).toBe(false);
    flag(d, 'voices.search.subject');
    expect(visible(d, 'linked-voices-subject')).toBe(true);
    d.walk('linked.voices.subject');
    flag(d, 'voices.indexed');
    expect(d.done('linked.voices.indexed')).toBe(false);
    flag(d, 'voices.search.date');
    expect(visible(d, 'linked-voices-date')).toBe(true);
    d.walk('linked.voices.date');
    expect(d.done('linked.voices.indexed')).toBe(true);
    flag(d, 'voices.layout', layout);
    expect(visible(d, 'linked-voices-open')).toBe(layout === 'open');
    expect(visible(d, 'linked-voices-keeper')).toBe(layout === 'keeper');
    d.walk(`linked.voices.${layout}`);
    expect(d.done('linked.voices.consulted')).toBe(true);
    expect(d.done('voices.finish')).toBe(false);
    expect(d.s.notes).toEqual([]);
  });

  it('stores an optional line in the ordinary private diary and omits it from default exports', () => {
    const d = new Driver();
    prepare(d, true);
    const old = { marks: d.s.marks, credit: d.p.credit, objectives: [...d.s.objectivesDone] };
    d.run({ type: 'AddNote', text: privateLine, kind: 'note' });
    const view = adventureJournalView(d.e.pack, d.s, d.e.visibleObjectives(d.s));
    const options = { placeName: () => undefined };
    expect(view.notes[0]?.text).toBe(privateLine);
    expect(JSON.stringify(adventureExportSnapshot(view, { ...options, includeNotes: false }))).not.toContain(privateLine);
    expect(JSON.stringify(adventureExportSnapshot(view, options))).toContain(privateLine);
    expect(d.s.marks).toBe(old.marks);
    expect(d.p.credit).toEqual(old.credit);
    expect(d.s.objectivesDone).toEqual(old.objectives);
  });

  it('keeps the early folio and the loan annex separate, with registered prop art', () => {
    const art = new Set(artKeys());
    for (const map of [STUDY, VOICES]) {
      const ours = map.interactables.filter(({ id }) => id.startsWith('linked-'));
      for (const prop of ours) {
        expect(map.floor(prop.x, prop.y), prop.id).not.toBeNull();
        expect(map.interactables.find((other) => prop !== other &&
          prop.x >= other.x && prop.x < other.x + other.w && prop.y >= other.y && prop.y < other.y + other.h), prop.id).toBeUndefined();
        expect(art.has(prop.art!), prop.id).toBe(true);
      }
    }
  });
});
