import { describe, expect, it } from 'vitest';
import { CROSSINGS, CROSSING_BEATS, crossingStyle, wayOpen, type ConflictType } from '../src/domain/crossings';
import { HEARTH } from '../src/domain/hearth';
import { VERSES, balladName, versesFor } from '../src/domain/ballad';
import { VIGNETTES, WHY, crossingEpithet, lingering, vignettesFor } from '../src/domain/epilogue';
import { FIELD_GAMES } from '../src/domain/fieldgames';
import { LOYALTY } from '../src/domain/loyalty';
import { MAPS } from '../src/maps';
import { buildPack } from '../src/content';
import type { Condition } from '../src/domain/types';
import { Driver } from './driver';

const pack = buildPack();
const objectiveIds = new Set(pack.missions.flatMap((m) => m.objectives.map((o) => o.id)));
const objectives = (c: Condition | undefined): string[] => !c ? [] : 'objective' in c ? [c.objective] : 'all' in c ? c.all.flatMap(objectives) : 'any' in c ? c.any.flatMap(objectives) : 'not' in c ? objectives(c.not) : [];
const flagValues = (flag: string): Set<string> => {
  const out = new Set<string>();
  for (const n of pack.dialogue) for (const e of [...(n.effects ?? []), ...(n.options ?? []).flatMap((o) => o.effects ?? [])]) if ('setFlag' in e && e.setFlag === flag) out.add(String(e.value));
  return out;
};

describe('crossings: a wide spread of conflicts', () => {
  it('covers all eight conflict types, all three scales, and funny and serious tones', () => {
    const types = new Set(CROSSINGS.flatMap((c) => c.types));
    for (const t of ['self', 'person', 'nature', 'society', 'god', 'fate', 'supernatural', 'technology'] as ConflictType[]) expect(types, t).toContain(t);
    expect(new Set(CROSSINGS.map((c) => c.scale))).toEqual(new Set(['minor', 'mid', 'major']));
    expect(new Set(CROSSINGS.map((c) => c.tone))).toEqual(new Set(['funny', 'serious', 'mixed']));
    expect(new Set(CROSSINGS.map((c) => c.serves))).toEqual(new Set(['plot', 'arc', 'theme']));
  });

  it('puts at least one crossing in chapters 1 to 14', () => {
    for (let ch = 1; ch <= 14; ch++) expect(CROSSINGS.some((c) => c.chapter === ch), `chapter ${ch}`).toBe(true);
  });

  it('gives every crossing a way to face it and a way to leave it, each with a method, a result and a cost', () => {
    const ids = new Set<string>();
    for (const c of CROSSINGS) {
      expect(ids.has(c.id)).toBe(false); ids.add(c.id);
      expect(c.ways.length).toBeGreaterThanOrEqual(3);
      expect(c.ways.some((w) => w.kind === 'overcome'), c.id).toBe(true);
      expect(c.ways.some((w) => w.kind === 'ignore'), c.id).toBe(true);
      expect(new Set(c.ways.map((w) => w.id)).size).toBe(c.ways.length);
      for (const w of c.ways) { expect(w.method.length).toBeGreaterThan(5); expect(w.result.length).toBeGreaterThan(20); expect(w.cost.length).toBeGreaterThan(10); }
      expect(c.stakes.lose.length && c.stakes.gain.length).toBeTruthy();
    }
  });

  it('links each crossing forward to a real crossing or beat, so conflicts build', () => {
    for (const c of CROSSINGS) if (c.leadsTo) expect([...CROSSINGS.map((x) => x.id), ...CROSSING_BEATS], c.id).toContain(c.leadsTo);
  });

  it('places every crossing on its own map, and every key needs a real objective or companion', () => {
    for (const c of CROSSINGS) {
      const it = MAPS[c.map]?.interactables.find((i) => i.kind === 'fieldgame' && i.game === `cross-${c.id}`);
      expect(it, c.id).toBeTruthy();
      for (const w of c.ways) {
        for (const o of objectives(w.needs?.if)) expect(objectiveIds, `${c.id}.${w.id}`).toContain(o);
        if (w.needs?.companion) expect(pack.characters.some((x) => x.id === w.needs!.companion)).toBe(true);
      }
    }
  });

  it('never makes a real religion or its sacred figures an opponent', () => {
    const text = JSON.stringify(CROSSINGS.map(({ types: _t, ...rest }) => rest));
    expect(text).not.toMatch(/\bGod\b|\bgods?\b|Allah|Jesus|Buddha|Krishna|Christian|Muslim|Hindu|Jewish|Buddhist|Sikh/);
  });

  it('opens a keyed way only when the player has the key, and counts how the player met conflicts', () => {
    const d = new Driver();
    const fan = CROSSINGS.find((c) => c.id === 'warm-room')!.ways.find((w) => w.id === 'fan')!;
    expect(wayOpen(fan, d.s)).toBe(false);
    expect(wayOpen(fan, { ...d.s, companion: 'smith-hesper' })).toBe(true);
    d.run({ type: 'SetFlag', flag: 'cross.lamb', value: 'post' });
    d.run({ type: 'SetFlag', flag: 'cross.geese', value: 'watch' });
    d.run({ type: 'SetFlag', flag: 'cross.goat', value: 'let' });
    expect(crossingStyle(d.s.flags)).toEqual({ overcome: 2, around: 0, ignore: 1 });
    expect(crossingEpithet(d.s.flags)).toBe('who Faces Things');
  });
});

describe('hearth talks, the ballad and the epilogue', () => {
  it('gives each hearth talk all four tones and real speakers, with a spread of moods', () => {
    expect(MAPS['nexus.archive'].interactables.some((i) => i.game === 'hearth')).toBe(true);
    expect(new Set(HEARTH.map((t) => t.kind))).toEqual(new Set(['humour', 'friction', 'doubt', 'misunderstanding', 'farewell']));
    for (const t of HEARTH) {
      expect(t.join.map((j) => j.tone).sort()).toEqual(['care', 'doubt', 'joke', 'plain']);
      for (const l of t.lines) expect(l.who === 'lumen' || pack.characters.some((x) => x.id === l.who), `${t.id}: ${l.who}`).toBe(true);
      for (const o of objectives(t.after)) expect(objectiveIds).toContain(o);
      // Kip has no set pronoun.
      for (const l of [...t.lines.map((x) => x.text), ...t.join.map((j) => j.reply)]) if (/Kip/.test(l)) expect(l).not.toMatch(/Kip[^.]*\b(he|him|his|she|her)\b/);
    }
  });

  it('sings tall verses only for deeds the player did, and names the player by how they set them', () => {
    expect(FIELD_GAMES.some((g) => g.id === 'ballad')).toBe(true);
    expect(MAPS['aethelgard.emberford'].interactables.some((i) => i.game === 'ballad')).toBe(true);
    const d = new Driver();
    expect(versesFor(d.s)).toEqual([]);
    d.run({ type: 'SetFlag', flag: 'lamps.lit', value: 4 });
    d.run({ type: 'SetFlag', flag: 'cross.lamb', value: 'punt' });
    const vs = versesFor(d.s);
    expect(vs.map((v) => v.id)).toEqual(['lamps', 'lamb']);
    expect(vs[0].true(d.s)).toContain('4 lamps');
    expect(vs[1].true(d.s)).toContain('two marks');
    for (const v of VERSES) expect(v.tall).not.toEqual(v.true(d.s));
    d.run({ type: 'SetFlag', flag: 'ballad.lamps', value: 'true' });
    d.run({ type: 'SetFlag', flag: 'ballad.lamb', value: 'tall' });
    expect(balladName(d.s.flags)).toBe('the Half-Sung');
  });

  it('writes the epilogue only from real flag values, and ends with why the player came', () => {
    const real: Record<string, Set<string>> = {
      'ending.council': flagValues('ending.council'), 'ise.harrowmere': flagValues('ise.harrowmere'),
      ...Object.fromEntries(LOYALTY.map((l) => [`loyalty.${l.id}`, new Set(l.choices.map((c) => c.id))])),
      ...Object.fromEntries(CROSSINGS.map((c) => [`cross.${c.id}`, new Set(c.ways.map((w) => w.id))])),
    };
    for (const v of VIGNETTES) {
      const c = v.if;
      if ('flag' in c && 'eq' in c && typeof c.eq === 'string') {
        expect(real[c.flag] ?? flagValues(c.flag), `${v.who}: ${c.flag}`).toContain(c.eq);
      }
    }
    const whys = pack.dialogue.find((n) => n.id === 'cold.open3')!.options!.flatMap((o) => o.effects ?? []).filter((e) => 'setFlag' in e && e.setFlag === 'why.came').map((e) => String((e as { value: unknown }).value));
    expect(whys.sort()).toEqual(Object.keys(WHY).sort());
    const d = new Driver();
    d.walk('cold.open');
    expect(typeof d.s.flags['why.came']).toBe('string');
    d.run({ type: 'SetFlag', flag: 'ending.council', value: 'both' });
    d.run({ type: 'SetFlag', flag: 'cross.lamb', value: 'post' });
    expect(vignettesFor(d.s).map((v) => v.who)).toEqual(['The Nexus', 'Hollis']);
    expect(lingering(d.s)[0]).toBe(WHY[String(d.s.flags['why.came'])].said);
  });
});
