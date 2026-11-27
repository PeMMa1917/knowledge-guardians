import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import data from '../src/content/sea-stick-charts.json';
import replies from '../src/content/two-replies.json';
import tupaia from '../src/content/sea-tupaia.json';
import { Driver } from './driver';

const MAP = 'sea.chartroom';
const scene = (d: Driver, id: string, ...picks: string[]) => {
  const prop = MAPS[MAP].interactables.find((p) => p.id === id);
  if (!prop?.node || !check(prop.visibleIf, d.s)) throw new Error(`Cannot use ${id}`);
  d.walk(prop.node, picks);
};

describe('Marshall Islands stick charts (X-006, chapter 8)', () => {
  it('cites every documented card, and every source is a real https page', () => {
    const ids = new Set(data.sources.map((s) => s.id));
    for (const s of data.sources) expect(s.url).toMatch(/^https:\/\//);
    for (const c of data.cards) { expect(c.sources.length).toBeGreaterThan(0); for (const s of c.sources) expect(ids.has(s), s).toBe(true); }
    expect(data.sources.some((s) => s.url.includes('canoesmarshallislands.com')), 'a source from a Marshallese organisation').toBe(true);
  });
  it('says the game does not teach the navigators\' knowledge', () => {
    expect(data.cards.find((c) => c.id === 'card.sea.stick.held')!.limits).toMatch(/does not teach/);
  });
  it.each(['two', 'ashore', 'gap'])('accepts the "%s" display card, with two replies after it', (choice) => {
    const d = new Driver();
    d.s.mapId = MAP;
    d.run({ type: 'SetFlag', flag: 'sea.response', value: 'shore' });
    scene(d, 'sea-stick-kinds', 'Keep'); scene(d, 'sea-stick-voyage', 'Keep'); scene(d, 'sea-stick-held', 'Keep');
    const text = data.dialogue.find((n) => n.id === 'sea.stick.desk')!.options!.find((o) => o.next === `sea.stick.desk.${choice}`)!.text;
    scene(d, 'sea-stick-desk', text.slice(0, 20));
    expect(d.s.flags['sea.stick.label']).toBe(choice);
    for (const o of data.missions[0].objectives) expect(d.done(o.id), o.id).toBe(true);
    expect(replies.twoReplies.some((r) => (r.after as any).flag === 'sea.stick.label' && (r.after as any).eq === choice)).toBe(true);
  });
});

describe("Tupaia's chart (X-006, chapter 8)", () => {
  it('marks the 2019 reading as a scholarly interpretation, and names the debate', () => {
    const reading = tupaia.cards.find((c) => c.id === 'card.sea.tupaia.reading')!;
    expect(reading.historicalLabel).toBe('scholarly-interpretation');
    expect(reading.text).toMatch(/disagree/);
  });
  it.each(['proposal', 'unread', 'voyagers'])('accepts the "%s" label after all three records', (choice) => {
    const d = new Driver();
    d.s.mapId = MAP;
    d.run({ type: 'SetFlag', flag: 'sea.response', value: 'water' });
    for (const k of ['navigator', 'chart', 'reading']) scene(d, `sea-tupaia-${k}`, 'Keep');
    const text = tupaia.dialogue.find((n) => n.id === 'sea.tupaia.desk')!.options!.find((o) => o.next === `sea.tupaia.desk.${choice}`)!.text;
    scene(d, 'sea-tupaia-desk', text.slice(0, 24));
    expect(d.s.flags['sea.tupaia.label']).toBe(choice);
    for (const o of tupaia.missions[0].objectives) expect(d.done(o.id), o.id).toBe(true);
  });
});
