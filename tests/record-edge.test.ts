import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const kit = 'record-edge-folio';

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!entry || !check(entry.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return entry;
}

function enter(d: Driver, id: string) {
  const entry = prop(d, id);
  if (!entry.to) throw new Error(`${id} is not a passage`);
  d.s.mapId = entry.to.map;
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
}

function inspect(d: Driver, id: string) {
  const entry = prop(d, id);
  if (!entry.exhibit) throw new Error(`${id} is not an exhibit`);
  d.run({ type: 'InspectExhibit', exhibit: entry.exhibit });
}

function scene(d: Driver, id: string, choice: string) {
  const entry = prop(d, id);
  if (!entry.node) throw new Error(`${id} does not open a scene`);
  d.walk(entry.node, [choice]);
}

function read(d: Driver, id: string) {
  const entry = prop(d, id);
  if (entry.flag) d.run({ type: 'SetFlag', flag: entry.flag, value: true });
  return entry.text;
}

function start() {
  const d = new Driver();
  d.s.objectivesDone.push('water.finish', 'civic.finish');
  d.s.flags['civic.response'] = 'reserve';
  d.s.flags['civic.revision'] = 'walk';
  enter(d, 'voices-door');
  return d;
}

describe('The Edge of the Record', () => {
  it('keeps the archival and nation-authored record attributions distinct', () => {
    const pack = buildPack();
    const cards = pack.cards.filter(({ id }) => id.startsWith('card.record-edge.'));
    expect(Object.fromEntries(cards.map(({ id, sources }) => [id, sources]))).toEqual({
      'card.record-edge.wea': ['HIS-EDGE-05'],
      'card.record-edge.eastern': ['HIS-EDGE-06', 'HIS-EDGE-04'],
      'card.record-edge.fort': ['HIS-EDGE-01'],
      'card.record-edge.tecumseh': ['HIS-EDGE-02', 'HIS-EDGE-03'],
    });
    expect(cards.every(({ historicalLabel }) => historicalLabel === 'documented')).toBe(true);
    expect(cards.find(({ id }) => id === 'card.record-edge.tecumseh')?.limits).toContain('verbatim speech');
    const separate = cards.find(({ id }) => id === 'card.record-edge.wea')!;
    expect(separate.text).toContain('listed Wea representatives');
    expect(separate.limits).toContain('how free the negotiations were');
    const present = cards.find(({ id }) => id === 'card.record-edge.eastern')!;
    expect(present.limits).toContain('The Absentee Shawnee Tribe and the Shawnee Tribe govern separately');
  });

  const routes = [
    ['treaty', 'Open at Article 5', 'article', 'dates', 'Hold the two dated', 'civic-steps-path', 'listed Wea representatives'],
    ['voice', 'Open with the Vincennes', 'voice', 'scope', 'Clip the full constitutional', 'civic-canal-path', 'who may decide it'],
    ['treaty', 'Open at Article 5', 'article', 'scope', 'Clip the full constitutional', 'civic-canal-path', 'who may decide it'],
    ['voice', 'Open with the Vincennes', 'voice', 'dates', 'Hold the two dated', 'civic-steps-path', 'listed Wea representatives'],
  ] as const;

  it.each(routes)('carries the %s first page across worlds and posts an independently chosen %s edition',
    (firstPage, mount, voiceSign, civicEdition, post, path, recipient) => {
      const d = start();
      const xp = { ...d.p.credit };
      const equip = (keepsake: string | null) => d.run({ type: 'EquipPerspective', keepsake });
      inspect(d, 'voices-edge-account-case');
      expect(() => equip(kit)).toThrow(/earned/);
      expect(() => prop(d, 'voices-edge-account-stand')).toThrow();
      enter(d, 'voices-walk-path');
      inspect(d, 'voices-edge-treaty-case');
      expect(d.s.flags[`keepsake.${kit}`]).toBe(true);
      expect(() => prop(d, 'voices-edge-treaty-stand')).toThrow();
      equip(kit);
      scene(d, 'voices-edge-treaty-stand', 'Slide from the land line');
      expect(d.done('record.edge.voices.compare')).toBe(false);
      expect(check(prop(d, 'voices-edge-treaty-stand').artOpen?.if, d.s)).toBe(true);
      enter(d, 'voices-walk-return');
      expect(() => prop(d, 'voices-edge-mount')).toThrow();
      scene(d, 'voices-edge-account-stand', 'Set the marker’s date');
      expect(d.done('record.edge.voices.compare')).toBe(true);
      scene(d, 'voices-edge-mount', mount);
      expect(d.s.flags['record.edge.voices.mount']).toBe(firstPage);
      expect(d.done('record.edge.voices.send')).toBe(true);

      equip(null);
      expect(read(d, `voices-edge-open-${voiceSign}`)).toContain('Civic Library Dispatch');
      expect(() => prop(d, 'voices-edge-account-stand')).toThrow();
      enter(d, 'voices-nexus-return');
      enter(d, 'civic-door');
      inspect(d, 'civic-edge-wea-case');
      expect(() => prop(d, 'civic-edge-wea-stand')).toThrow();
      equip(kit);
      scene(d, 'civic-edge-wea-stand', 'Line up 30 September');
      expect(d.done('record.edge.civic.compare')).toBe(false);
      expect(() => prop(d, 'civic-edge-place')).toThrow();
      enter(d, 'civic-steps-path');
      inspect(d, 'civic-edge-eastern-case');
      scene(d, 'civic-edge-eastern-stand', 'Expose the full name');
      expect(d.done('record.edge.civic.compare')).toBe(true);
      enter(d, 'civic-steps-return');
      scene(d, 'civic-edge-place', post);
      expect(d.s.flags['record.edge.civic.mount']).toBe(civicEdition);
      expect(d.done('record.edge.civic.post')).toBe(false);
      equip(null);
      enter(d, path);
      expect(read(d, `civic-edge-${civicEdition}`)).toContain(recipient);
      expect(d.done('record.edge.civic.post')).toBe(true);
      expect(d.s.journal).toContain('j.record.edge');
      expect(d.s.flags['civic.response']).toBe('reserve');
      expect(d.s.flags['civic.revision']).toBe('walk');
      expect(d.s.flags['voices.revision']).toBeUndefined();
      expect(d.p.credit).toEqual(xp);
    });
});
