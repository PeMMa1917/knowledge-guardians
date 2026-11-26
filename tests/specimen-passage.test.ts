import { describe, expect, it } from 'vitest';
import { PASSAGE_CASES, PASSAGE_GATE, PASSAGE_GROUP } from '../src/content/passageCases';
import { RELAY_CASES } from '../src/content/relayCases';
import { check } from '../src/domain/rules';
import { heldPassage, passageDone, passageMove } from '../src/domain/specimenPassage';
import { MAPS } from '../src/maps';
import { SHOAL_PROOF_DOOR, SHOAL_PROOF_LOWER, SHOAL_PROOF_SHELTER, SHOAL_PROOF_UPPER } from '../src/maps/specimenPassage';
import { artKeys, BIG_ART } from '../src/ui/illustrations';
import { Driver } from './driver';

type PassageCase = (typeof PASSAGE_CASES)[number];
function move(d: Driver, record: PassageCase, action: Parameters<typeof passageMove>[2]) {
  expect(check(PASSAGE_GATE, d.s)).toBe(true);
  expect(check({ card: record.card }, d.s)).toBe(true);
  const effect = passageMove(record.slug, d.s.flags, action);
  expect(effect).toBeTruthy();
  if (effect) d.run({ type: 'SetFlag', flag: effect.setFlag, value: effect.value });
}
function openBoth(d: Driver, record: PassageCase) {
  d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
  move(d, record, { type: 'inspect', leaf: 'view' });
  move(d, record, { type: 'inspect', leaf: 'record' });
}

describe('Which Edge Reached the Landing', () => {
  it('opens after a relay readback or the normal chapter ending, with its own Shoal door', () => {
    const d = new Driver();
    expect(check(PASSAGE_GATE, d.s)).toBe(false);
    d.s.objectivesDone.push('sea.arrival');
    expect(check(PASSAGE_GATE, d.s)).toBe(false);
    d.s.objectivesDone.push(RELAY_CASES[0].objective);
    expect(check(PASSAGE_GATE, d.s)).toBe(true);
    d.s.objectivesDone.pop();
    d.s.objectivesDone.push('sea.finish');
    expect(check(PASSAGE_GATE, d.s)).toBe(true);
    expect(MAPS['sea.shoal'].interactables).toEqual(expect.arrayContaining([SHOAL_PROOF_DOOR, SHOAL_PROOF_LOWER, SHOAL_PROOF_UPPER]));
    expect(MAPS['sea.proof-shelter']).toBe(SHOAL_PROOF_SHELTER);
    expect(SHOAL_PROOF_SHELTER.interactables.find(({ to }) => !!to)?.to).toEqual({ map: 'sea.shoal', x: 20, y: 13 });
  });

  it('keeps 24 photo-backed records and 3 documentary forms at individually playable and unique locations', () => {
    const d = new Driver();
    expect(PASSAGE_CASES).toHaveLength(27);
    expect(PASSAGE_CASES.filter(({ asset }) => !!asset)).toHaveLength(24);
    const stableKeys = new Set<string>();
    for (const record of PASSAGE_CASES) {
      const e = d.e.pack.exhibits.find(({ id }) => id === record.exhibit);
      expect(e?.specimen).toMatchObject({ institution: record.institution, accession: record.accession, objective: record.objective });
      expect(e?.specimen?.pixelAsset).toBe(record.asset);
      const key = e?.specimen?.key;
      expect(key && !stableKeys.has(key)).toBe(true);
      if (key) stableKeys.add(key);
      expect(d.e.pack.sources.find(({ id }) => id === record.source)?.url).toBe(record.catalog);
      const visits = Object.values(MAPS).flatMap((map) => map.interactables.filter((item) => item.exhibit === record.exhibit));
      expect(visits).toHaveLength(1);
      expect(SHOAL_PROOF_SHELTER.interactables).toContain(visits[0]);
      expect(SHOAL_PROOF_SHELTER.interactables.some(({ game }) => game === `${PASSAGE_GROUP}:${record.slug}`)).toBe(true);
    }
  });

  it('keeps the chart’s collection date and the two petition records separate', () => {
    const d = new Driver();
    const lookup = (slug: string) => d.e.pack.exhibits.find(({ id }) => id === `OBJ-PASSAGE-${slug}`)!;
    const chart = lookup('marshallese-chart');
    const first = lookup('yirrkala-dhuwa');
    const second = lookup('yirrkala-yirritja');
    expect(chart.specimen?.accession).toBe('E432083-0');
    expect(chart.dateKind).toContain('making date remains open');
    expect(chart.summary).toContain('28 cowrie shells');
    expect(first.dateText).toContain('14 August 1963');
    expect(first.summary).toContain('Dhuwa moiety');
    expect(second.dateText).toContain('28 August 1963');
    expect(second.summary).toContain('Yirritja moiety');
    expect(first.specimen?.accession).toBe('Founding Docs item 104 (i)');
    expect(second.specimen?.accession).toBe('Founding Docs item 104 (ii)');
    for (const [petition, presenter] of [[first, 'Jock Nelson'], [second, 'Arthur Calwell']] as const) {
      expect(petition.dateKind).toContain(presenter);
      expect(petition.dateKind).toContain('a copy');
      expect(petition.summary).toContain('copies replaced the typed papers on both bark borders');
      expect(d.e.pack.cards.find(({ id }) => id === petition.grantsCard)?.limits).toContain('The online image digitally reunites');
      expect(petition.sources).toContain('HIS-YIRRKALA-BUKU-HISTORY');
      expect(petition.specimen?.pixelAsset).toBeUndefined();
    }
    const pictures = [chart, first, second].map((entry) => BIG_ART[entry.art]);
    expect(new Set(pictures).size).toBe(3);
    for (const entry of [chart, first, second]) {
      expect(artKeys()).toEqual(expect.arrayContaining([entry.art, BIG_ART[entry.art]]));
      expect(SHOAL_PROOF_SHELTER.interactables.find(({ exhibit }) => exhibit === entry.id)?.art).toBe(entry.art);
    }
  });

  it('lets a player carry only one guide, put it back, and use the appropriate physical bench', () => {
    const d = new Driver();
    d.s.objectivesDone.push('sea.arrival', 'sea.finish');
    const [record, other] = PASSAGE_CASES;
    d.run({ type: 'InspectExhibit', exhibit: record.exhibit });
    expect(passageMove(record.slug, d.s.flags, { type: 'carry', stop: 'lower' })).toBeNull();
    openBoth(d, record);
    openBoth(d, other);
    move(d, record, { type: 'carry', stop: 'upper' });
    expect(passageMove(other.slug, d.s.flags, { type: 'carry', stop: 'lower' })).toBeNull();
    expect(passageMove(record.slug, d.s.flags, { type: 'seat', stop: 'lower' })).toBeNull();
    move(d, record, { type: 'unpack' });
    expect(heldPassage(d.s.flags)).toBeNull();
    move(d, record, { type: 'carry', stop: 'lower' });
    expect(heldPassage(d.s.flags)).toEqual({ slug: record.slug, stop: 'lower', phase: 'carried' });
    expect(passageMove(record.slug, d.s.flags, { type: 'leave', stop: 'lower' })).toBeNull();
    move(d, record, { type: 'seat', stop: 'lower' });
    expect(d.done(record.objective)).toBe(false);
    move(d, record, { type: 'leave', stop: 'lower' });
    expect(check(SHOAL_PROOF_LOWER.artOpen?.if, d.s)).toBe(true);
    expect(check(SHOAL_PROOF_UPPER.artOpen?.if, d.s)).toBe(false);
    expect(d.s.flags[passageDone(record.slug)]).toBe('lower');
    expect(d.done(record.objective)).toBe(true);
    expect(d.done(other.objective)).toBe(false);
    expect(heldPassage(d.s.flags)).toBeNull();
    move(d, other, { type: 'carry', stop: 'upper' });
  });

  it.each(PASSAGE_CASES)('carries both leaves for $accession to the upper reader', (record) => {
    const d = new Driver();
    d.s.objectivesDone.push('sea.arrival', RELAY_CASES[0].objective);
    openBoth(d, record);
    move(d, record, { type: 'carry', stop: 'upper' });
    move(d, record, { type: 'seat', stop: 'upper' });
    move(d, record, { type: 'leave', stop: 'upper' });
    expect(d.s.flags[passageDone(record.slug)]).toBe('upper');
    expect(d.done(record.objective)).toBe(true);
    expect(d.s.journal).toContain(`j.passage.${record.slug}`);
  });
});

describe('The Address for the Question', () => {
  function visibleProp(d: Driver, id: string) {
    return SHOAL_PROOF_SHELTER.interactables.find((prop) => prop.id === `yirrkala-referral-${id}` && check(prop.visibleIf, d.s));
  }

  it.each([
    ['yirrkala-dhuwa', 'lower', 'Pin both locators', 'rail'],
    ['yirrkala-yirritja', 'upper', 'Bring both slips', 'desk'],
  ] as const)('keeps a separate open reproduction referral after the %s guide', (slug, stop, choice, destination) => {
    const d = new Driver();
    const objective = 'passage.yirrkala.referral';
    const record = PASSAGE_CASES.find((item) => item.slug === slug)!;
    d.s.objectivesDone.push('sea.arrival', 'sea.finish');
    expect(visibleProp(d, 'request')).toBeUndefined();
    openBoth(d, record);
    expect(visibleProp(d, 'request')).toBeUndefined();
    move(d, record, { type: 'carry', stop });
    move(d, record, { type: 'seat', stop });
    move(d, record, { type: 'leave', stop });
    expect(d.done(record.objective)).toBe(true);

    const before = { ...d.p.credit };
    const request = visibleProp(d, 'request')!;
    d.walk(request.node!, ['Separate the lookup', 'Put the reproduction question', choice]);
    expect(visibleProp(d, 'request')).toBeUndefined();
    expect(visibleProp(d, destination === 'rail' ? 'desk' : 'rail')).toBeUndefined();
    expect(d.done(objective)).toBe(false);

    const reply = visibleProp(d, destination)!;
    expect(d.e.node(reply.node!).text).toMatch(/still asks who can give permission|left the copying question open/);
    expect(d.e.node(reply.node!).citationSource).toBe('HIS-YIRRKALA-BUKU-HISTORY');
    expect(d.e.node(`${objective}.lookups`).text).toMatch(/Dhuwa artists.*14 August 1963.*Yirritja artists.*28 August/);
    expect(d.e.node(`${objective}.lookups`).citationSource).toBe('HIS-APH-YIRRKALA-CAPTION');
    d.walk(reply.node!);
    expect(d.done(objective)).toBe(true);
    expect(d.s.journal).toContain(`j.${objective}`);
    expect(d.s.flags[passageDone(slug)]).toBe(stop);
    expect(d.p.credit).toEqual(before);
  });
});
