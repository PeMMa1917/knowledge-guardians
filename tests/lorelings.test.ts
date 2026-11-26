import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { checkOffer, cleanPetName, lorelingForm } from '../src/domain/lorelings';
import { Driver } from './driver';

const pack = buildPack();
const moth = pack.lorelings.find((l) => l.id === 'glimmermoth')!;
const L = 'glimmermoth';

describe('Lorelings (spec 36.1)', () => {
  it('cannot write a note before watching in enough places', () => {
    const d = new Driver();
    d.run({ type: 'LorelingWatch', loreling: L, sighting: 'lamp' });
    expect(() => d.run({ type: 'LorelingNote', loreling: L, question: 'draws', option: 'light' })).toThrow(/more places/);
  });
  it('a wrong note: the Loreling does not come, and the result names the sighting that contradicts it', () => {
    const d = new Driver();
    for (const sg of ['lamp', 'desk']) d.run({ type: 'LorelingWatch', loreling: L, sighting: sg });
    expect(d.done('lor.o1.watch')).toBe(true);
    d.run({ type: 'LorelingNote', loreling: L, question: 'draws', option: 'light' });
    d.run({ type: 'LorelingNote', loreling: L, question: 'glow', option: 'worn' });
    const ev = d.run({ type: 'LorelingOffer', loreling: L, place: 'handle' }).events.find((e) => e.kind === 'loreling') as any;
    expect(ev.ok).toBe(false);
    expect(ev.recheck).toBe('case');
    expect(ev.text).toMatch(/have not watched it at the new glass cabinet/);
    expect(d.s.flags['lor.glimmermoth.friend']).toBeUndefined();
  });
  it('revise the note and wait in the right place: befriended, 10 XP and a badge, and nothing lost for earlier tries', () => {
    const d = new Driver();
    for (const sg of ['lamp', 'desk', 'case']) d.run({ type: 'LorelingWatch', loreling: L, sighting: sg });
    d.run({ type: 'LorelingNote', loreling: L, question: 'draws', option: 'metal' });
    d.run({ type: 'LorelingNote', loreling: L, question: 'glow', option: 'worn' });
    d.run({ type: 'LorelingOffer', loreling: L, place: 'handle' });
    d.run({ type: 'LorelingNote', loreling: L, question: 'draws', option: 'touch' });
    const wrongPlace = d.run({ type: 'LorelingOffer', loreling: L, place: 'brightest' }).events.find((e) => e.kind === 'loreling') as any;
    expect(wrongPlace.ok).toBe(false);
    d.run({ type: 'LorelingOffer', loreling: L, place: 'handle' });
    expect(d.s.flags['lor.glimmermoth.friend']).toBe(true);
    expect(d.s.flags['lor.out']).toBe(L);
    expect(d.done('lor.o2.friend')).toBe(true);
    expect(d.p.credit['crit.evidence.loreling']).toBe(10);
    expect(d.p.awards['badge.patient-watcher']).toBeTruthy();
  });
  it('the player names it and can leave it at camp', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'LorelingName', loreling: L, name: 'Glim' })).toThrow(/Not a friend/);
    d.s = { ...d.s, flags: { ...d.s.flags, 'lor.glimmermoth.friend': true } };
    d.run({ type: 'LorelingName', loreling: L, name: '  Señor  Wick ' });
    expect(d.s.flags['lor.glimmermoth.name']).toBe('Señor Wick');
    expect(() => d.run({ type: 'LorelingName', loreling: L, name: '<b>x</b>' })).toThrow();
    d.run({ type: 'LorelingField', loreling: L, out: false });
    expect(d.s.flags['lor.out']).toBe('');
  });
  it('pet names are short and plain', () => {
    expect(cleanPetName('Mote')).toBe('Mote');
    expect(cleanPetName('')).toBeNull();
    expect(cleanPetName('x'.repeat(17))).toBeNull();
    expect(cleanPetName("Ana's moth")).toBe("Ana's moth");
  });
  it('every wrong answer is contradicted by a sighting, so careful watching always finds the pattern', () => {
    for (const q of moth.questions) for (const o of q.options) if (o.id !== q.answer) expect(moth.sightings.some((s) => s.id === o.contradicts)).toBe(true);
    expect(checkOffer(moth, { draws: 'touch', glow: 'worn' }, 'handle', ['lamp', 'desk']).ok).toBe(true);
  });
  it('grows when evidence is used in two worlds', () => {
    expect(lorelingForm(moth, pack, []).form).toBe(1);
    const ev = (w: string) => pack.missions.filter((m) => m.world === w).flatMap((m) => m.objectives).filter((o) => o.weave?.concepts.includes('evidence')).map((o) => o.id);
    expect(lorelingForm(moth, pack, [...ev('WORLD-01'), ...ev('WORLD-02')]).form).toBe(2);
  });
  it('the Loreling Atlas lists 24 Lorelings, two for each concept', () => {
    expect(pack.lorelingAtlas).toHaveLength(24);
    expect(new Set(pack.lorelingAtlas.map((x) => x.concept)).size).toBe(12);
  });
});
