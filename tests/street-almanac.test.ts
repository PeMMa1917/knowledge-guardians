import { describe, expect, it } from 'vitest';
import { almanacPrinters } from '../src/content/almanacPrinters';
import { encyclopediaForCharacter } from '../src/domain/encyclopedia';
import { Driver } from './driver';
import {
  almanacEffects,
  calendarCases,
  composingRoom,
  cueFlag,
  cuePositions,
  equippedCalendar,
  lastEdition,
  paradeRoom,
  workingBar,
  type AlmanacCommand,
  type CalendarCase,
} from '../src/domain/streetAlmanac';
import { carryFlag, specimenItemId, specimenToolId, PERSPECTIVE_FLAG } from '../src/domain/specimenGear';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { BIG_ART } from '../src/ui/illustrations';
import { mlaCitation } from '../src/domain/mla';
type Move = AlmanacCommand extends infer C ? (C extends AlmanacCommand ? Omit<C, 'type'> : never) : never;
const go = (d: Driver, m: Move) => d.run({ type: 'ArrangeStreetAlmanac', ...m });
function equip(d: Driver, r: CalendarCase) {
  d.s.inventory[specimenItemId(r.key)] = 1;
  d.s.flags[carryFlag(r.key)] = true;
  d.s.flags[PERSPECTIVE_FLAG] = specimenToolId(r.key);
  d.s.mapId = composingRoom;
}
function fold(d: Driver) {
  for (const face of ['first', 'second', 'silence'] as const) go(d, { act: 'turn', face });
  for (const lane of ['stair', 'window'] as const) go(d, { act: 'listen', lane });
  go(d, { act: 'send' });
}
describe('A birthday with four dates', () => {
  it('renders the same two accessible channels on all 4096 possible six-beat scores', () => {
    for (let n = 0; n < 4096; n++) {
      const bar = n.toString(4).padStart(6, '0');
      const stairs = cuePositions(bar, 'stair'),
        windows = cuePositions(bar, 'window');
      const reconstructed = Array.from(
        { length: 6 },
        (_, i) => Number(stairs.includes(i + 1)) + 2 * Number(windows.includes(i + 1)),
      ).join('');
      expect(reconstructed).toBe(bar);
    }
  });
  it.each(calendarCases)(
    'carries the $id caption and music together through either entrance and a revised edition',
    (r) => {
      const d = new Driver();
      equip(d, r);
      const target = MAPS[paradeRoom].interactables.find((p) => p.id === 'street-parade-window')!;
      expect(check(target.visibleIf, d.s)).toBe(false);
      expect(() => go(d, { act: 'send' })).toThrow('both dated leaves');
      fold(d);
      expect(check(target.visibleIf, d.s)).toBe(true);
      expect(lastEdition(d.s, r)).toEqual({ bar: '000000', face: 'silence' });
      d.s.mapId = paradeRoom;
      expect(() => go(d, { act: 'perform', entrance: 'window' })).toThrow('both people');
      go(d, { act: 'rehearse', lane: 'stair' });
      go(d, { act: 'rehearse', lane: 'window' });
      go(d, { act: 'perform', entrance: 'window' });
      expect(d.done('almanac.' + r.id + '.evening')).toBe(true);
      d.s.mapId = composingRoom;
      go(d, { act: 'place', beat: 1, cue: 1 });
      go(d, { act: 'place', beat: 2, cue: 2 });
      go(d, { act: 'place', beat: 5, cue: 3 });
      expect(workingBar(d.s, r)).toBe('012003');
      expect(lastEdition(d.s, r)?.bar).toBe('000000');
      go(d, { act: 'turn', face: 'second' });
      go(d, { act: 'listen', lane: 'stair' });
      expect(() => go(d, { act: 'send' })).toThrow('stair and the window');
      go(d, { act: 'listen', lane: 'window' });
      go(d, { act: 'send' });
      d.s.mapId = paradeRoom;
      expect(cueFlag(d.s, r, 'heard.window')).toBe(false);
      expect(cueFlag(d.s, r, 'playedBar')).toBe('000000');
      go(d, { act: 'rehearse', lane: 'stair' });
      go(d, { act: 'rehearse', lane: 'window' });
      go(d, { act: 'perform', entrance: 'procession' });
      expect(cueFlag(d.s, r, 'playedFace')).toBe('second');
      expect(cueFlag(d.s, r, 'playedBar')).toBe('012003');
      const entries = d.s.adventureDiary.entries.filter((e) => e.event?.key.startsWith('street-almanac:'));
      const show = entries.at(-1)!;
      expect(show.text).toContain(r.second.line);
      expect(show.event?.sourceIds).toContain(r.source);
      for (const entry of entries) expect([1, 2, 3]).toContain(Object.keys(diaryQuestions(entry)).length);
      expect(check(target.visibleIf, { ...d.s, flags: { ...d.s.flags, [PERSPECTIVE_FLAG]: false } })).toBe(false);
    },
  );
  it.each(calendarCases)(
    'lets the historical visitor carry both printing choices into the later room for $id',
    (r) => {
      const d = new Driver();
      equip(d, r);
      const person = almanacPrinters[r.id as keyof typeof almanacPrinters];
      const character = d.e.pack.characters.find((c) => c.id === person.character)!;
      expect(encyclopediaForCharacter(character)?.url).toContain('https://en.wikipedia.org/wiki/');
      for (const side of [0, 1]) {
        d.s.mapId = composingRoom;
        d.talk(person.character, person.tools[side]);
        fold(d);
        d.talk(person.character, person.tools[1 - side]);
        d.s.mapId = paradeRoom;
        const at = d.e.talkEntry(person.character, d.s)!;
        const options = d.e.visibleOptions(at, d.s);
        expect(options.map((o) => o.option.text)).toEqual([
          'Unfold the invitation with ' + person.marks[side] + '.',
        ]);
        expect(d.e.node(options[0].option.next!).text).toBe(person.callbacks[side]);
        d.talk(person.character, person.marks[side]);
        expect(d.done('almanac.' + r.id + '.proof')).toBe(true);
        expect(cueFlag(d.s, r, 'sentBlock')).toBe(side);
        expect(cueFlag(d.s, r, 'block')).toBe(1 - side);
      }
    },
  );
  it('preserves the holding, object-specific uncertainties and a different response to the same event date', () => {
    const d = new Driver();
    for (const r of calendarCases) {
      const e = d.e.pack.exhibits.find((e) => e.id === r.exhibit)!;
      expect(e.specimen).toMatchObject({ key: r.key, accession: r.accession, objective: r.objective });
      expect(e.dateKind).toContain(r.date);
      expect(BIG_ART[e.art]).toBeTruthy();
      expect(d.e.pack.exhibits.filter((other) => other.specimen?.key === r.key)).toHaveLength(1);
      const source = d.e.pack.sources.find((s) => s.id === r.source)!;
      expect(mlaCitation(source).find((p) => p.href)?.href).toBe(source.url);
    }
    const shell = calendarCases.find((c) => c.id === 'shell')!;
    expect(shell.second.line).toContain('18 November 1876');
    expect(shell.silence).toContain('maker’s name');
    expect(calendarCases.find((c) => c.id === 'volume')?.silence).toContain('date the facsimile was made open');
  });
  it('earns the Singapore fragment after completing its historical label, carries it, and recovers its invitation separately from the unfinished score', () => {
    const d = new Driver(),
      stone = calendarCases[0];
    d.s.mapId = 'nexus.archive';
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    d.run({ type: 'InspectExhibit', exhibit: stone.exhibit });
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: stone.exhibit })).toThrow('quest');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-BADANG' });
    d.run({ type: 'BuildLabel', kit: 'nile-stone', subject: 'story', criterion: 'tradition', limit: 'bound' });
    d.run({ type: 'ClaimSpecimen', exhibit: stone.exhibit });
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(stone.key) });
    expect(equippedCalendar(d.s)).toBe(stone);
    expect(() => go(d, { act: 'turn', face: 'first' })).toThrow('musicians');
    d.s.mapId = composingRoom;
    expect(() => almanacEffects(d.s, { type: 'ArrangeStreetAlmanac', act: 'place', beat: 6, cue: 1 })).toThrow(
      'six places',
    );
    fold(d);
    go(d, { act: 'place', beat: 3, cue: 2 });
    const restored = structuredClone(d.s);
    expect(workingBar(restored, stone)).toBe('000200');
    expect(lastEdition(restored, stone)?.bar).toBe('000000');
    expect(d.s.inventory[specimenItemId(stone.key)]).toBe(1);
  });
});
