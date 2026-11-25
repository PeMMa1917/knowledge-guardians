import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { LETTER_IF } from '../src/maps/study';
import type { Condition } from '../src/domain/types';
import { Driver } from './driver';
import { READINGS } from '../src/domain/readings';
import { RECIPES } from '../src/domain/craft';
import { MIN_SOURCES, RUMOURS, currentRumour, rumourOrder } from '../src/domain/rumours';
import { DYES, FAIR_PRICE, TOWN_COSTS, ferryPrice, townPrice } from '../src/domain/trade';
import { DYE_KEYS, OUTFIT } from '../src/domain/appearance';
import { approvalOf, approvalRank, isInquiry } from '../src/domain/approval';
import { ROLES, fitsRole, roleOf } from '../src/domain/roles';
import { BOSS, SEALS, allSealsOpen, bossPhase } from '../src/domain/undercroft';

const pack = buildPack();
const done = (d: Driver, id: string) => d.run({ type: 'SetFlag', flag: `puzzle.${id}.done`, value: true });

describe('the storyline: the Lamp Wall and the old Guardian (Mika 2026-11-26)', () => {
  it('each knot the town unties lights one lamp, once', () => {
    const d = new Driver();
    expect(d.s.flags['lamps.lit'] ?? 0).toBe(0);
    done(d, 'weigh-house');
    expect(d.s.flags['lamps.lit']).toBe(1);
    expect(d.events.some((e) => e.kind === 'lamp')).toBe(true);
    done(d, 'weigh-house');
    expect(d.s.flags['lamps.lit']).toBe(1);
    expect(pack.knots).toHaveLength(16);
  });

  it('the cellar door opens at six lamps and leads to the study, and the study leads back', () => {
    const door = MAPS['aethelgard.emberford'].interactables.find((i) => i.id === 'cellar-door')!;
    const d = new Driver();
    for (const id of ['weigh-house', 'tipped-cart', 'map-table', 'brass-sorter', 'echo-bridge']) done(d, id);
    expect(check(door.openIf as Condition, d.s)).toBe(false);
    done(d, 'toll-survey');
    expect(check(door.openIf as Condition, d.s)).toBe(true);
    expect(MAPS[door.to!.map]).toBeDefined();
    const stairs = MAPS['aethelgard.study'].interactables.find((i) => i.id === 'study-stairs')!;
    expect(stairs.to!.map).toBe('aethelgard.emberford');
    // Every clue object in the study has a clue record, and every study clue is placed.
    const placed = MAPS['aethelgard.study'].interactables.filter((i) => i.kind === 'clue').map((i) => i.clue);
    for (const id of placed) expect(pack.clues!.some((c) => c.id === id)).toBe(true);
    for (const c of pack.clues!.filter((x) => x.study)) expect(placed).toContain(c.id);
  });

  it('every keepsake matters: it shows a new view of a clue or opens a new dialogue option', () => {
    for (const k of pack.keepsakes!) {
      const used = pack.clues!.some((c) => c.views.some((v) => v.keepsake === k.id)) || pack.keepsakeTalks!.some((t) => t.keepsake === k.id);
      expect(used, k.id).toBe(true);
      expect(k.use, k.id).toBeTruthy();
    }
  });

  it('a keepsake view needs the keepsake, and a pathway view opens the hidden letter', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'UseKeepsake', clue: 'desk', keepsake: 'door-key' })).toThrow();
    d.run({ type: 'SetFlag', flag: 'keepsake.door-key', value: true });
    expect(check(LETTER_IF as unknown as Condition, d.s)).toBe(false);
    d.run({ type: 'UseKeepsake', clue: 'desk', keepsake: 'door-key' });
    expect(d.s.flags['study.desk']).toBe(true);
    expect(d.s.flags['study.views']).toBe(1);
    expect(check(LETTER_IF as unknown as Condition, d.s)).toBe(true);
    // The wrong keepsake does nothing.
    expect(() => d.run({ type: 'UseKeepsake', clue: 'desk', keepsake: 'pen-tip' })).toThrow();
  });

  it('a player with few keepsakes can still find the letter by looking closely', () => {
    const d = new Driver();
    for (const c of pack.clues!.filter((x) => x.study && x.id !== 'letter').slice(0, 10)) d.run({ type: 'ReadClue', clue: c.id });
    expect(check(LETTER_IF as unknown as Condition, d.s)).toBe(true);
    d.run({ type: 'ReadClue', clue: 'letter' });
    expect(d.s.flags['study.letter']).toBe(true);
  });

  it('a keepsake adds a dialogue option once, and the old options stay', () => {
    const d = new Driver();
    const entry = d.e.talkEntry('smith-hesper', d.s)!;
    const before = d.e.visibleOptions(entry, d.s).length;
    d.run({ type: 'SetFlag', flag: 'keepsake.check-weight', value: true });
    const opts = d.e.visibleOptions(entry, d.s);
    const extra = opts.find((o) => o.index >= 1000);
    expect(extra?.option.text).toContain('check weights');
    expect(opts.filter((o) => o.index < 999)).toHaveLength(before);
  });
});

describe('the story so far (Journal)', () => {
  it('beats appear in order as the player reaches them', () => {
    const d = new Driver();
    const shown = () => pack.chronicle!.filter((b) => check(b.if, d.s)).map((b) => b.id);
    expect(shown()).toEqual(['call']);
    d.run({ type: 'SetFlag', flag: 'study.entered', value: true });
    expect(shown()).toContain('study');
    expect(pack.chronicle!.length).toBeGreaterThanOrEqual(10);
  });
});

describe('a keepsake opens a new pathway: the old ferry road', () => {
  it('the road appears only after Kip\'s map is held up to Elsbet\'s map, and leads to Tova', () => {
    const road = MAPS['aethelgard.emberford'].interactables.find((i) => i.id === 'ferry-road')!;
    const d = new Driver();
    expect(check(road.visibleIf, d.s)).toBe(false);
    d.run({ type: 'SetFlag', flag: 'keepsake.folded-map', value: true });
    d.run({ type: 'UseKeepsake', clue: 'oldmap', keepsake: 'folded-map' });
    expect(check(road.visibleIf, d.s)).toBe(true);
    const ferry = MAPS[road.to!.map];
    expect(ferry.npcs.map((n) => n.id)).toContain('ferry-tova');
    d.talk('ferry-tova', 'What does the town get wrong', 'Goodbye');
    expect(d.s.flags['ferry.met']).toBe(true);
  });
});

describe('communities of Emberford (reputation)', () => {
  it('trust grows from helping a community, is stored, and never falls', () => {
    const d = new Driver();
    expect(d.s.flags['trust.river'] ?? 0).toBe(0);
    d.run({ type: 'SetFlag', flag: 'puzzle.ferry-message.done', value: true });
    expect(d.s.flags['trust.river']).toBe(2);
    expect(d.events.some((e) => e.kind === 'trust')).toBe(true); // Stranger -> Known
    d.run({ type: 'SetFlag', flag: 'puzzle.ferry-message.done', value: false });
    expect(d.s.flags['trust.river']).toBe(2);
    for (const cm of pack.communities!) expect(cm.gains.reduce((n, g) => n + g.pts, 0), cm.id).toBeGreaterThanOrEqual(6);
  });
});

describe("Corvan's stall (economy)", () => {
  it('marks come from deeds; a ware is bought once; trust gives a discount; labels turn honest after the Showdown', async () => {
    const { WARES, priceFor, honestLabels, lockedOption } = await import('../src/domain/shop');
    const d = new Driver();
    const m0 = d.s.marks;
    d.run({ type: 'SetFlag', flag: 'puzzle.ferry-message.done', value: true }); // a lamp: +5
    d.run({ type: 'FindSecret', secret: 'star-names' }); // a secret: +3
    expect(d.s.marks - m0).toBe(8);
    const rug = WARES.find((w) => w.id === 'rug-river')!;
    expect(lockedOption(d.s, 'rug', 'river')).toBeTruthy();
    expect(priceFor(rug, d.s, pack)).toBe(15);
    d.run({ type: 'SetFlag', flag: 'puzzle.forecast-board.done', value: true }); // river trust 2+1+2 = 5 -> Trusted
    expect(priceFor(rug, d.s, pack)).toBe(13);
    d.s.marks = 20;
    d.run({ type: 'BuyWare', ware: 'rug-river' });
    expect(d.s.marks).toBe(7);
    expect(lockedOption(d.s, 'rug', 'river')).toBeNull();
    expect(() => d.run({ type: 'BuyWare', ware: 'rug-river' })).toThrow();
    expect(honestLabels(d.s)).toBe(false);
  });
});

describe('the Insight tree (skill tree)', () => {
  it('Insight comes from lamps; talents need their parent; unlearning frees all points', async () => {
    const { insight, spent, cannotLearn } = await import('../src/domain/talents');
    const d = new Driver();
    expect(cannotLearn(d.s, 'noticing')).toMatch(/Insight/);
    for (const id of ['ferry-message', 'forecast-board', 'weigh-house']) d.run({ type: 'SetFlag', flag: `puzzle.${id}.done`, value: true });
    expect(insight(d.s)).toBe(3);
    expect(cannotLearn(d.s, 'mapmaker')).toMatch(/Noticing first/);
    d.run({ type: 'LearnTalent', talent: 'noticing' });
    d.run({ type: 'LearnTalent', talent: 'mapmaker' });
    expect(spent(d.s)).toBe(3);
    expect(() => d.run({ type: 'LearnTalent', talent: 'pace' })).toThrow();
    d.run({ type: 'ForgetTalents' });
    expect(spent(d.s)).toBe(0);
  });
});

describe('gathering and crafting', () => {
  it('a place gives 2 once a day; a tool needs its materials; calibration is a method question', () => {
    const d = new Driver();
    d.run({ type: 'Gather', node: 'f.clay', resource: 'clay', day: '2026-11-25' });
    expect(() => d.run({ type: 'Gather', node: 'f.clay', resource: 'clay', day: '2026-11-25' })).toThrow();
    expect(() => d.run({ type: 'Craft', recipe: 'rain-gauge', choice: 2 })).toThrow(/reeds/);
    d.run({ type: 'Gather', node: 'f.reed', resource: 'reed', day: '2026-11-25' });
    d.run({ type: 'Craft', recipe: 'rain-gauge', choice: 0 }); // made, not calibrated
    expect(d.s.inventory['item.rain-gauge']).toBe(1);
    expect(d.s.flags['craft.rain-gauge.calibrated']).toBe(false);
    expect(d.s.flags['res.clay']).toBe(0);
    d.run({ type: 'Calibrate', recipe: 'rain-gauge', choice: 2 });
    expect(d.s.flags['craft.rain-gauge.calibrated']).toBe(true);
    d.run({ type: 'Calibrate', recipe: 'rain-gauge', choice: 0 }); // a calibrated tool stays calibrated
    expect(d.s.flags['craft.rain-gauge.calibrated']).toBe(true);
  });

  it('a made tool tests a claim in town, but only once it is calibrated', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'TakeReading', reading: 'rain', choice: 1 })).toThrow(/Maker's bench/);
    d.run({ type: 'Gather', node: 'f.clay', resource: 'clay', day: '2026-11-25' });
    d.run({ type: 'Gather', node: 'f.reed', resource: 'reed', day: '2026-11-25' });
    d.run({ type: 'Craft', recipe: 'rain-gauge', choice: 0 });
    expect(() => d.run({ type: 'TakeReading', reading: 'rain', choice: 1 })).toThrow(/not calibrated/);
    d.run({ type: 'Calibrate', recipe: 'rain-gauge', choice: 2 });
    const marks = d.s.marks;
    d.run({ type: 'TakeReading', reading: 'rain', choice: 0 });
    expect(d.events.find((e) => e.kind === 'reading')).toMatchObject({ ok: false, first: true });
    expect(d.s.marks).toBe(marks + 4);
    d.run({ type: 'TakeReading', reading: 'rain', choice: 1 }); // think again: no second reward
    expect(d.s.marks).toBe(marks + 4);
    expect(d.s.flags['count.readings']).toBe(1);
    // Every reading has one well-reasoned answer, explained; every tool has a placed reading.
    for (const r of READINGS) {
      expect(r.options.filter((o) => o.ok)).toHaveLength(1);
      for (const o of r.options) expect(o.why.length).toBeGreaterThan(20);
      const spot = Object.values(MAPS).flatMap((m) => m.interactables).find((i) => i.kind === 'reading' && i.reading === r.id);
      expect(spot).toBeDefined();
    }
    for (const t of RECIPES) expect(READINGS.some((r) => r.tool === t.id)).toBe(true);
  });
});

describe('the rumour mill', () => {
  it('needs two sources before a verdict, explains every verdict, and moves on only when the evidence fits', () => {
    const d = new Driver();
    const r = currentRumour(d.s.flags, 20000)!;
    expect(() => d.run({ type: 'JudgeRumour', rumour: r.id, verdict: r.best })).toThrow(/at least 2/);
    d.run({ type: 'CheckRumourSource', rumour: r.id, source: 0 });
    d.run({ type: 'CheckRumourSource', rumour: r.id, source: 1 });
    const wrong = (r.best + 1) % 4;
    d.run({ type: 'JudgeRumour', rumour: r.id, verdict: wrong });
    expect(d.events.find((e) => e.kind === 'rumour')).toMatchObject({ ok: false });
    expect(currentRumour(d.s.flags, 20000)!.id).toBe(r.id);
    const marks = d.s.marks;
    d.run({ type: 'JudgeRumour', rumour: r.id, verdict: r.best });
    expect(d.s.marks).toBe(marks + 5);
    expect(currentRumour(d.s.flags, 20000)!.id).not.toBe(r.id);
    // The same seed gives the same order (fair randomness); every rumour is placed in the town.
    expect(rumourOrder(5).map((x) => x.id)).toEqual(rumourOrder(5).map((x) => x.id));
    for (const x of RUMOURS) { expect(x.sources.length).toBeGreaterThanOrEqual(MIN_SOURCES); for (const w of x.whys) expect(w.length).toBeGreaterThan(20); }
    expect(MAPS['aethelgard.emberford'].interactables.some((i) => i.kind === 'rumours')).toBe(true);
    for (const x of RUMOURS) if (x.fray) expect(pack.fray.some((f: { id: string }) => f.id === x.fray)).toBe(true);
  });
});

describe("Wenna's barter boat", () => {
  it('prices show their parts; dyes are cosmetic; materials trade between places', () => {
    const d = new Driver();
    for (const x of DYES) expect(townPrice(x) - ferryPrice(x)).toBe(TOWN_COSTS.carrying + TOWN_COSTS.toll + TOWN_COSTS.stall);
    for (const x of DYES) expect(OUTFIT[x.id]).toBeDefined();
    expect(FAIR_PRICE.options.filter((o) => o.ok)).toHaveLength(1);
    d.run({ type: 'FairPrice', choice: 1 });
    expect(d.s.flags['trade.fair.ok']).toBe(true);
    expect(() => d.run({ type: 'BuyDye', dye: 'woad' })).toThrow(/marks/);
    d.s = { ...d.s, marks: 20 };
    const before = d.events.length;
    d.run({ type: 'BuyDye', dye: 'woad' });
    expect(d.s.marks).toBe(20 - ferryPrice(DYES[1]));
    expect(d.events.slice(before).some((e) => e.kind === 'xp')).toBe(false);
    expect(() => d.run({ type: 'BuyDye', dye: 'woad' })).toThrow(/already/);
    d.run({ type: 'Barter', resource: 'reed', dir: 'buy' });
    expect(d.s.flags['res.reed']).toBe(1);
    expect(() => d.run({ type: 'Barter', resource: 'ore', dir: 'sell' })).toThrow(/none/);
    expect(() => d.run({ type: 'Barter', resource: 'reed', dir: 'sell' })).toThrow(/plenty/);
    // The base outfit colours stay free: a dye is extra, never a lock on identity.
    expect(Object.keys(OUTFIT).filter((k) => !DYE_KEYS.includes(k)).length).toBeGreaterThanOrEqual(10);
    expect(MAPS['aethelgard.ferry'].interactables.some((i) => i.kind === 'trader')).toBe(true);
  });
});

describe('companion approval', () => {
  it('rises once for each good question, never for agreeing, and only with a companion', () => {
    expect(isInquiry('Ask for the source')).toBe(true);
    expect(isInquiry('Trace the source')).toBe(true);
    expect(isInquiry('Accept the expert view')).toBe(false);
    expect(isInquiry('Dismiss the old record')).toBe(false);
    expect(isInquiry(undefined)).toBe(false);
    const node = pack.dialogue.find((n) => (n.options ?? []).some((o) => isInquiry(o.tag)) && !(n.options ?? []).some((o) => o.if))!;
    const idx = node.options!.findIndex((o) => isInquiry(o.tag));
    const d = new Driver();
    d.run({ type: 'ChooseDialogueOption', node: node.id, index: idx });
    expect(approvalOf(d.s.flags, 'kip-arden')).toBe(0); // no companion yet
    d.s = { ...d.s, companion: 'kip-arden' };
    d.run({ type: 'ChooseDialogueOption', node: node.id, index: idx });
    d.run({ type: 'ChooseDialogueOption', node: node.id, index: idx });
    expect(approvalOf(d.s.flags, 'kip-arden')).toBe(1);
    expect(approvalRank(3)).toBe('Likes how you ask');
  });
});

describe('knower roles', () => {
  it('each role has a strength and a blind spot, fits some real dialogue tags, and gives no XP', () => {
    const tags = new Set(pack.dialogue.flatMap((n) => (n.options ?? []).map((o) => o.tag).filter(Boolean)) as string[]);
    for (const r of ROLES) {
      expect(r.strength.length).toBeGreaterThan(20);
      expect(r.blind.length).toBeGreaterThan(20);
      expect([...tags].some((t) => fitsRole(r, t))).toBe(true);
    }
    const d = new Driver();
    const n = d.events.length;
    d.run({ type: 'ChooseRole', role: 'maker' });
    expect(roleOf(d.s.flags)?.name).toBe('Maker');
    expect(d.events.slice(n).some((e) => e.kind === 'xp')).toBe(false);
    expect(() => d.run({ type: 'ChooseRole', role: 'king' })).toThrow();
  });
});

describe('the Undercroft (dungeon)', () => {
  it('three fallacy seals, then a boss in three phases; wrong moves are explained and never end the fight', () => {
    const d = new Driver();
    expect(() => d.run({ type: 'BossMove', choice: 0 })).toThrow(/seals/);
    for (const x of SEALS) {
      expect(x.options.filter((o) => o.ok)).toHaveLength(1);
      expect(pack.fray.some((f: { id: string }) => f.id === x.fray)).toBe(true);
      const bad = x.options.findIndex((o) => !o.ok);
      d.run({ type: 'DisarmSeal', seal: x.id, choice: bad });
      expect(d.s.flags[`trap.${x.id}.open`]).toBeUndefined();
      d.run({ type: 'DisarmSeal', seal: x.id, choice: x.options.findIndex((o) => o.ok) });
    }
    expect(allSealsOpen(d.s.flags)).toBe(true);
    const marks = d.s.marks;
    BOSS.phases.forEach((p, i) => {
      expect(p.options.filter((o) => o.ok)).toHaveLength(1);
      expect(pack.fray.some((f: { id: string }) => f.id === p.fray)).toBe(true);
      d.run({ type: 'BossMove', choice: p.options.findIndex((o) => !o.ok) });
      expect(bossPhase(d.s.flags)).toBe(i);
      d.run({ type: 'BossMove', choice: p.options.findIndex((o) => o.ok) });
    });
    expect(d.s.flags['undercroft.done']).toBe(true);
    expect(d.s.marks).toBe(marks + 10);
    expect(d.s.flags['boss.hollow-archivist.hollow']).toBe(3);
    // The hatch in the study needs Elsbet's letter, and the Undercroft leads back to the study.
    const hatch = MAPS['aethelgard.study'].interactables.find((i) => i.id === 'undercroft-hatch')!;
    expect(hatch.to!.map).toBe('aethelgard.undercroft');
    expect(MAPS['aethelgard.undercroft'].interactables.find((i) => i.id === 'undercroft-stairs')!.to!.map).toBe('aethelgard.study');
  });
});
