import { describe, expect, it } from 'vitest';
import people from '../src/content/observation-people.json';
import content from '../src/content/reference-station.json';
import { check } from '../src/domain/rules';
import { SPECIMEN_BASE, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const outside = 'observatory.station';
const inside = 'observatory.reference-station';

function entry(d: Driver, id: string) {
  const e = MAPS[d.s.mapId].interactables.find(({ id: key }) => key === `refstation-${id}`);
  if (!e) throw new Error(`No reference prop ${id} in ${d.s.mapId}`);
  return { e, visible: check(e.visibleIf, d.s) };
}

function use(d: Driver, id: string, choice?: string) {
  const { e, visible } = entry(d, id);
  if (!visible || !check(e.openIf, d.s)) throw new Error(`Reference prop ${id} is unavailable`);
  if (e.exhibit) d.run({ type: 'InspectExhibit', exhibit: e.exhibit });
  if (e.node) d.walk(e.node, choice ? [choice] : []);
  if (e.flag) d.run({ type: 'SetFlag', flag: e.flag, value: true });
  if (e.to) d.s.mapId = e.to.map;
  return e.text;
}

function start() {
  const d = new Driver();
  d.s.mapId = outside;
  expect(entry(d, 'door').visible).toBe(false);
  d.run({ type: 'SetFlag', flag: 'coast.arrived', value: true });
  use(d, 'door');
  expect(d.s.mapId).toBe(inside);
  return d;
}

function experiment(d: Driver, checkClaimGate = false) {
  expect(entry(d, 'globe').visible).toBe(false);
  use(d, 'case-globe');
  if (checkClaimGate) {
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: content.exhibits[0].id })).toThrow('Finish the object’s quest first');
  }
  use(d, 'globe', 'maker’s outside line');
  expect(use(d, 'globe-outside')).toContain('silver peg, crescent, star');
  use(d, 'globe', 'viewer’s inside copy');
  expect(use(d, 'globe-inside')).toContain('star, crescent, silver peg');
  expect(d.done('refstation.globe')).toBe(false);
  expect(use(d, 'globe-cites')).toContain('1890-331');
  expect(d.done('refstation.globe')).toBe(true);

  use(d, 'case-tube');
  use(d, 'tube', 'first reference');
  expect(use(d, 'tube-left')).toContain('left');
  expect(d.done('refstation.tube')).toBe(false);
  use(d, 'tube', 'opposite reference');
  expect(use(d, 'tube-right')).toContain('same mark');
  expect(d.done('refstation.tube')).toBe(true);

  use(d, 'case-horn');
  use(d, 'horn', 'blank reference strip');
  expect(use(d, 'horn-blank')).toContain('1 unit');
  use(d, 'horn', 'ridge-facing strip');
  expect(use(d, 'horn-ridge')).toContain('3 units');
  expect(entry(d, 'send').visible).toBe(false);
  use(d, 'horn', 'open-sky strip');
  expect(use(d, 'horn-sky')).toContain('remains 2 units');
  expect(d.done('refstation.horn')).toBe(true);
}

describe('The Line That Stayed', () => {
  it('keeps the exact science record and separately cited historical roles with each identity', () => {
    const d = start();
    const sources = new Set(d.e.pack.sources.map(({ id }) => id));
    const keys = new Set(d.e.pack.exhibits.flatMap(({ specimen }) => specimen ? [specimen.key] : []));
    for (const [key, roles] of Object.entries(people)) {
      expect(keys.has(key), key).toBe(true);
      for (const role of roles) expect(sources.has(role.source), role.name).toBe(true);
    }
    expect(content.exhibits.map(({ specimen }) => specimen.accession)).toEqual(['T.1890.330', '1901-51', '89002457']);
    expect(content.cards[0].limits).toContain('1890-331');
    expect(content.exhibits[1].summary).toContain('1901-51/1');
    expect(content.exhibits[2].dateKind).toContain('July 1965');
    for (const source of ['globe', 'tube', 'horn']) expect(d.e.node(`refstation.${source}`).historicalLabel).toBe('reconstruction');
  });

  it.each(['local', 'repeat'] as const)('moves from a known reference to %s use at a separately located notice', (route) => {
    const d = start();
    experiment(d);
    use(d, 'send', 'Keep the board open');
    expect(d.s.flags['refstation.plan']).toBeUndefined();
    use(d, 'send', route === 'local' ? 'Post the local reading' : 'independent reading');
    use(d, 'return');
    expect(d.s.mapId).toBe(outside);
    expect(d.done('refstation.proof')).toBe(false);
    if (route === 'local') {
      expect(entry(d, 'proof-repeat').visible).toBe(false);
      use(d, 'proof-local', 'Record the used notice');
      expect(use(d, 'done-local')).toContain('repeat slot empty');
    } else {
      expect(entry(d, 'proof-local').visible).toBe(false);
      expect(entry(d, 'read-repeat').visible).toBe(false);
      use(d, 'proof-repeat', 'Align the second reader');
      expect(entry(d, 'publish-repeat').visible).toBe(false);
      expect(use(d, 'read-repeat')).toContain('2 on its own blank and 4');
      use(d, 'publish-repeat', 'Post the separate repeat');
      expect(use(d, 'done-repeat')).toContain('Two readers, two baselines');
    }
    expect(d.done('refstation.proof')).toBe(true);
    expect(d.s.flags['coast.updated']).toBeUndefined();
    expect(d.p.credit).toEqual({});
  });

  it.each([false, true])('earns, equips and revisits all three objects with different methods (second mounts: %s)', (other) => {
    const d = start();
    experiment(d, true);
    const actions = [
      { id: 'globe', options: ['reading path', 'door approach'], views: ['west', 'east'], mount: other ? 'east approach' : 'west reading path', result: other ? 'east' : 'west', finding: other ? 'west approach' : 'small reverse tab' },
      { id: 'tube', options: ['loose copied sheet', 'separate practice load peg'], views: ['sheet', 'load'], mount: other ? 'different moving parts' : 'porter’s rail', result: other ? 'desk' : 'rail', finding: other ? 'separate strips' : 'wall nail' },
      { id: 'horn', options: ['copied notes', 'independent entry'], views: ['copy', 'watch'], mount: other ? 'keeping slot' : 'next to the harbour', result: other ? 'slot' : 'side', finding: other ? 'independent date' : 'own source line' },
    ];
    for (const [i, { id, options, views, mount, result, finding }] of actions.entries()) {
      const record = content.exhibits[i];
      const { key, revisit } = record.specimen;
      const base = `revisit-${id}`;
      d.s.mapId = inside;
      d.run({ type: 'ClaimSpecimen', exhibit: record.id });
      expect(d.s.inventory[specimenItemId(key)]).toBe(1);
      d.s.mapId = revisit.map;
      expect(entry(d, base).e.id).toBe(revisit.prop);
      expect(entry(d, base).visible).toBe(false);
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(key) });

      use(d, base, options[0]);
      use(d, `${base}-${views[0]}`);
      expect(entry(d, `${base}-post`).visible).toBe(false);
      use(d, base, options[1]);
      use(d, `${base}-${views[1]}`);
      use(d, `${base}-post`, mount);
      expect(d.done(`refstation.return.${id}`)).toBe(true);
      d.s.mapId = SPECIMEN_BASE;
      d.run({ type: 'CarrySpecimen', key, carry: false });
      d.s.mapId = revisit.map;
      expect(entry(d, base).visible).toBe(false);
      expect(use(d, `${base}-${result}-posted`)).toContain(finding);
    }
  });
});
