import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { IMPRINT_CASES } from '../src/content/copyImprintCases';
import { imprintPacket, installFlag, pressFlag, pressedCharges, pullFlag, pullInk, readPacket } from '../src/domain/imprint';
import { relativeAngle } from '../src/domain/referenceProofs';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { COPIES_PROOF_ROOM } from '../src/maps/copyImprint';
import { BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

const pack = buildPack();

describe('The Second Imprint', () => {
  it('keeps all 22 official accession, photo and mount identities distinct', () => {
    expect(IMPRINT_CASES).toHaveLength(22);
    const keys = new Set();
    for (const record of IMPRINT_CASES) {
      const exhibit = pack.exhibits.find((item) => item.id === record.exhibit);
      expect(exhibit?.specimen?.accession).toBe(record.accession);
      expect(exhibit?.specimen?.pixelAsset).toBe(record.asset);
      expect(keys.has(exhibit?.specimen?.key)).toBe(false);
      keys.add(exhibit?.specimen?.key);
      const source = pack.sources.find((entry) => entry.id === exhibit?.specimen?.source);
      expect(source?.url).toBe(record.source);
      expect(pack.cards.find(({ id }) => id === record.card)?.limits).toBe(record.limit);
      expect(Object.values(MAPS).flatMap((map) => map.interactables).filter((stand) => stand.exhibit === record.exhibit)).toHaveLength(1);
      const press = COPIES_PROOF_ROOM.interactables.find((stand) => stand.id === `imprint-pull-${record.slug}`);
      expect(press?.visibleIf).toEqual({ card: record.card });
    }
  });

  it('varies coverage by charge deterministically and leaves transparent pixels unprinted', () => {
    const input = new Uint8ClampedArray([
      0, 0, 0, 0, 53, 53, 53, 255, 115, 115, 115, 255,
      154, 154, 154, 255, 189, 189, 189, 255, 255, 255, 255, 255,
    ]);
    expect([...pullInk(input, 3, 'light')]).toEqual([0, 1, 0, 0, 0, 0]);
    expect([...pullInk(input, 3, 'even')]).toEqual([0, 1, 1, 0, 0, 0]);
    expect([...pullInk(input, 3, 'deep')]).toEqual([0, 1, 1, 1, 1, 0]);
    expect(pullInk(input, 3, 'even')).toEqual(pullInk(input, 3, 'even'));
  });

  it.each(['counter', 'drawer'] as const)('uses two distinct pulls and the current %s receiver without altering permanent credit', (route) => {
    const d = new Driver();
    const stand = MAPS['copies.press'].interactables.find(({ id }) => id === 'copies-proof-path');
    expect(check(stand?.visibleIf, d.s)).toBe(false);
    d.s.objectivesDone.push('copies.revise');
    expect(check(stand?.visibleIf, d.s)).toBe(true);
    expect(stand?.to?.map).toBe(COPIES_PROOF_ROOM.id);
    const record = IMPRINT_CASES[0];
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    const set = (flag: string, value: string | boolean) => d.run({ type: 'SetFlag', flag, value });
    const before = { ...d.p.credit };
    set(pullFlag(record.stem, 'light'), true);
    set(pullFlag(record.stem, 'light'), true);
    expect(pressedCharges(d.s, record.stem)).toEqual(['light']);
    const version = imprintPacket(route, 'deep');
    set(pressFlag(record.stem), version);
    const tray = MAPS[route === 'counter' ? 'copies.landing' : 'copies.proof-room'].interactables.find(({ id }) => id === `copies-imprint-${route}`);
    expect(check(tray?.visibleIf, d.s)).toBe(true);
    set(installFlag(record.stem), version);
    expect(d.done(record.objective)).toBe(false);
    set(pullFlag(record.stem, 'deep'), true);
    expect(d.done(record.objective)).toBe(true);
    expect(readPacket(version)).toEqual({ route, charge: 'deep' });
    expect(readPacket('other.ink.extra')).toBeNull();
    expect(d.p.credit).toEqual(before);
  });
});

describe('Three checked reference instruments', () => {
  it.each([
    ['bone', '67.43.16', 'https://www.metmuseum.org/art/collection/search/60696', 'copies.proof-room', 'copies.landing'],
    ['jikji', 'Coréen 109', 'https://www.bnf.fr/fr/le-jikji-un-tresor-de-limprimerie', 'copies.proof-room', 'copies.landing'],
    ['astrolabe', '91.1.535a–h', 'https://www.metmuseum.org/art/collection/search/444408', 'observatory.archive', 'observatory.harbour'],
  ])('keeps %s lookup unique and sends its short and full reports to reachable map props', (slug, accession, source, room, exterior) => {
    const record = pack.exhibits.find((e) => e.specimen?.accession === accession);
    expect(record?.specimen?.pixelAsset).toBeUndefined();
    expect(pack.sources.find((entry) => entry.id === record?.specimen?.source)?.url).toBe(source);
    expect(BIG_ART[record!.art]).toBe(record?.art);
    expect(MAPS[room].interactables.find(({ id }) => id === `reference-${slug}-record`)?.exhibit).toBe(record?.id);
    expect(MAPS[room].interactables.find(({ id }) => id === `reference-${slug}-bench`)?.visibleIf).toEqual({ card: record?.grantsCard });
    const d = new Driver();
    const short = MAPS[exterior].interactables.find(({ id }) => id === `reference-${slug}-short`);
    const full = MAPS[room].interactables.find(({ id }) => id === `reference-${slug}-full`);
    d.run({ type: 'SetFlag', flag: `scope.${slug}.sent`, value: 'short' });
    expect(check(short?.visibleIf, d.s)).toBe(true);
    expect(check(full?.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: `scope.${slug}.sent`, value: 'full' });
    expect(check(short?.visibleIf, d.s)).toBe(false);
    expect(check(full?.visibleIf, d.s)).toBe(true);
  });

  it('keeps the arm constant and calibrates its reference to a selected fictional place', () => {
    expect(relativeAngle(45, 'quay')).toBe(30);
    expect(relativeAngle(45, 'ledge')).toBe(0);
    expect(relativeAngle(30, 'ledge')).toBe(345);
  });
});
