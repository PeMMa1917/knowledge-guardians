import { describe, it, expect } from 'vitest';
import {mlaCitation} from '../src/domain/mla';
import { Driver } from './driver';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import { diaryQuestions } from '../src/domain/diaryReflection';
import { specimenItemId, specimenToolId, carryFlag, PERSPECTIVE_FLAG } from '../src/domain/specimenGear';
import {
  elbowEffects,
  elbowFlag as flag,
  hemLoft,
  proofRoom,
  receivingRoom,
  trySleeves,
  lotReading,
  patchCount,
  stamps,
  type ElbowCommand,
} from '../src/domain/giantSleeve';
import { duchamp, stoppagesSource } from '../src/content/giantSleeve';

type Act = ElbowCommand extends infer C ? (C extends ElbowCommand ? Omit<C, 'type'> : never) : never;
const work = (d: Driver, act: Act) => d.run({ type: 'WorkGiantSleeve', ...act });
function fit(d: Driver, mask = 0) {
  d.s.mapId = hemLoft;
  const old = Number(flag(d.s, 'patches') ?? 0);
  // Remove old clips before adding new ones so no intermediate pattern needs a third joint.
  for (const bit of [1, 0])
    for (let i = 0; i < 4; i++)
      if (!!(old & (1 << i)) === !!bit && !!(mask & (1 << i)) !== !!(old & (1 << i)))
        work(d, { act: 'patch', who: i });
  for (const cast of ['winter', 'summer'] as const) {
    work(d, { act: 'cast', cast });
    work(d, { act: 'fit' });
  }
  work(d, { act: 'hang' });
}
function print(d: Driver, tail: 'rise' | 'either' = 'rise') {
  d.s.mapId = proofRoom;
  work(d, { act: 'pledge', tail });
  for (const sheet of ['chalk', 'chalk-dust'] as const) {
    work(d, { act: 'sheet', sheet });
    for (const face of ['BCD', 'DEF']) work(d, { act: 'stamp', face });
  }
  work(d, { act: 'print' });
}
describe('The giant who borrowed my elbow', () => {
  it('keeps the journal title in italics and the volume, issue, year, pages and DOI in the reference',()=>{
    const d=new Driver();
    const paper=d.e.pack.sources.find(s=>s.id==='HIS-ASA-PVALUES')!;
    const parts=mlaCitation(paper);
    expect(parts.filter(p=>p.cite).map(p=>p.text)).toEqual(['The American Statistician']);
    expect(parts.map(p=>p.text).join('')).toContain('vol. 70, no. 2, 2016, pp. 129–33, doi.org/10.1080/00031305.2016.1154108');
    expect(d.e.pack.dialogue.find(n=>n.id==='elbow.artist')?.historicalLabel).toBe('imagined-alternate');
  });
  it('lets every two-joint budget work its own way through both casts and keeps a changed pattern unissued until it is tried', () => {
    const d = new Driver();
    for (let mask = 0; mask < 16; mask++) {
      if (patchCount(mask) > 2) continue;
      fit(d, mask);
      const winter = trySleeves('winter', mask),
        summer = trySleeves('summer', mask);
      expect(winter.reduce((n, p) => n + p.reach, 0)).toBe(80);
      expect(summer.reduce((n, p) => n + p.reach, 0)).toBe(80);
      expect(winter.filter((p) => p.fits)).toHaveLength(4);
      expect(summer.filter((p) => p.fits)).toHaveLength(patchCount(mask));
      expect(flag(d.s, 'hung')).toBe(mask);
    }
    const fresh = new Driver();
    fresh.s.mapId = hemLoft;
    work(fresh, { act: 'fit' });
    work(fresh, { act: 'patch', who: 1 });
    expect(() => work(fresh, { act: 'hang' })).toThrow(/both|winter and summer/i);
    work(fresh, { act: 'patch', who: 2 });
    expect(() => work(fresh, { act: 'patch', who: 3 })).toThrow(/two brass/i);
  });
  it('exposes all twenty equiprobable draws in both tails and preserves the real hinge scale', () => {
    expect(new Set(stamps).size).toBe(20);
    for (const sheet of ['chalk', 'chalk-dust'] as const)
      for (const tail of ['rise', 'either'] as const) {
        const readings = stamps.map((s) => lotReading(sheet, s, tail));
        expect(readings.filter((r) => r.qualifies)).toHaveLength(tail === 'rise' ? 1 : 2);
        expect(new Set(readings.map((r) => r.rare))).toEqual(new Set([tail === 'rise' ? 1 : 2]));
        expect(readings.at(-1)?.observed).toBeCloseTo(sheet === 'chalk' ? 3 : 0.3, 8);
        expect(readings.at(-1)?.clears).toBe(sheet === 'chalk' ? 3 : 0);
      }
  });
  it('keeps the sealed prediction and the issued stage pattern through a reload and a later exploration', () => {
    const d = new Driver();
    fit(d, 5);
    d.s.mapId = proofRoom;
    expect(() => work(d, { act: 'sheet', sheet: 'chalk-dust' })).toThrow(/direction/);
    work(d, { act: 'pledge', tail: 'either' });
    work(d, { act: 'pledge', tail: 'rise' });
    work(d, { act: 'sheet', sheet: 'chalk' });
    work(d, { act: 'pledge', tail: 'either' });
    expect(flag(d.s, 'promise')).toBe('rise');
    work(d, { act: 'stamp', face: 'ABC' });
    expect(() => work(d, { act: 'print' })).toThrow(/packet/);
    print(d, 'either');
    fit(d, 2);
    d.s = JSON.parse(JSON.stringify(d.s));
    d.s.mapId = receivingRoom;
    expect(flag(d.s, 'printedPattern')).toBe(5);
    expect(flag(d.s, 'hung')).toBe(2);
    for (const face of ['writing', 'seam'] as const) work(d, { act: 'face', face });
    work(d, { act: 'hinge', sheet: 'chalk-dust' });
    work(d, { act: 'cue', when: 'first' });
    expect(flag(d.s, 'performedHinge')).toBe('chalk-dust');
    expect(flag(d.s, 'performedPattern')).toBe(5);
    expect(flag(d.s, 'performedFace')).toBe('seam');
    print(d, 'rise');
    d.s.mapId = receivingRoom;
    expect(() => work(d, { act: 'cue', when: 'last' })).toThrow(/inside out/);
    work(d, { act: 'face', face: 'seam' });
    work(d, { act: 'face', face: 'writing' });
    work(d, { act: 'cue', when: 'last' });
    expect(flag(d.s, 'performedPattern')).toBe(2);
    expect(flag(d.s, 'performedFace')).toBe('writing');
    const entries = d.s.adventureDiary.entries.filter((e) => e.event?.key.startsWith('giant-elbow:'));
    expect(entries.some((e) => e.event?.key.startsWith('giant-elbow:print.either'))).toBe(true);
    expect(entries.some((e) => e.event?.key.startsWith('giant-elbow:cue.first.seam.5'))).toBe(true);
    expect(entries.at(-1)?.text).toContain('old entrance cue');
    expect(Object.keys(diaryQuestions(entries.at(-1)!))).toHaveLength(2);
  });
  it('gives the visiting artist his own local voice and lets the earned Stoppages move a shadow in another room', () => {
    const d = new Driver(),
      key = 'moma:149.1953.a-i';
    fit(d);
    print(d);
    d.s.mapId = hemLoft;
    const artist = d.e.pack.characters.find((c) => c.id === duchamp)!;
    expect(artist.name).toBe('Marcel Duchamp');
    expect(artist.localGreeting?.[hemLoft]).toBe('elbow.artist');
    const opt = d.e.pack.dialogue
      .find((n) => n.id === 'elbow.artist')!
      .options!.find((o) => o.next === 'elbow.scratch')!;
    expect(check(opt.if, d.s)).toBe(false);
    d.s.inventory[specimenItemId(key)] = 1;
    d.s.flags[carryFlag(key)] = true;
    d.s.flags[PERSPECTIVE_FLAG] = specimenToolId(key);
    expect(check(opt.if, d.s)).toBe(true);
    d.talk(duchamp, 'Fit the template');
    expect(flag(d.s, 'curve')).toBe(true);
    d.s.mapId = receivingRoom;
    work(d, { act: 'scratch' });
    expect(flag(d.s, 'scratch')).toBe(true);
    expect(d.s.inventory[specimenItemId(key)]).toBe(1);
    expect(d.e.pack.dialogue.find((n) => n.id === 'elbow.scratch')?.citationSource).toBe(stoppagesSource);
  });
  it('keeps the loft, market press and rehearsal rack at three real field targets with passages back', () => {
    const d = new Driver();
    const cases = [
      ['stage.foyer', 'elbow-stairs'],
      [hemLoft, 'elbow-patterns'],
      [proofRoom, 'elbow-lottery'],
      [receivingRoom, 'elbow-curtain'],
    ];
    for (const [map, id] of cases) expect(MAPS[map].interactables.find((p) => p.id === id)).toBeDefined();
    expect(MAPS[hemLoft].interactables.find((p) => p.id === 'elbow-stairs-back')?.to?.map).toBe(
      'stage.foyer',
    );
    expect(() => elbowEffects(d.s, { type: 'WorkGiantSleeve', act: 'fit' })).toThrow(/loft/);
  });
});
