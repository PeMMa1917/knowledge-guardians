import { expect, it } from 'vitest';
import { guideObjectives } from '../src/domain/guidance';
import { playPath } from '../src/domain/learningPaths';
import { newPermanent } from '../src/domain/permanent';
import { KEY_PERMANENT, KEY_SLOTS, SaveService, emptyPair, memoryStore, restoreRecovery, serialisePair, writeCheckpoint, writeSuspend } from '../src/domain/saves';
import { restoreMicroSkillUses } from '../src/domain/skills';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const boundaryCase = 'boundary.water.deliver';
const deliveryCase = 'parcel.o.finish';
const boundarySource = 'WORLD-13|game-13|boundary.civic.compare|HUM,MAT';
const oldBoundary = 'WORLD-13|game-263|boundary.water.deliver|HUM';
const waterBoundary = 'WORLD-12|game-263|boundary.water.deliver|HUM';
const oldParcel = 'WORLD-13|game-284|parcel.o.finish|HUM,POL';
const waterParcel = 'WORLD-12|game-284|parcel.o.finish|HUM,POL';

it('corrects permanent uses independently of an older incomplete campaign and merges old and corrected aliases', () => {
  const d = new Driver();
  d.s.mapId = 'water.council';
  d.s.objectivesDone.push('civic.finish', 'boundary.civic.post', 'parcel.o.plan');
  d.s.flags['boundary.civic.started'] = true;
  d.s.flags['parcel.open'] = true;
  d.s.flags[`hint.${boundaryCase}`] = 2;
  d.s.inventory['item.boundary.plan'] = 1;
  d.s.inventory['item.parcel.docket'] = 1;
  const earlier = writeCheckpoint(emptyPair(), {
    kind: 'checkpoint', label: 'Before the cart', location: 'Council Yard', savedAt: '2026-11-26T00:00:00Z', state: d.s,
  });
  const latest = writeSuspend(earlier, {
    ...earlier.continue!, label: 'After the cart', state: { ...d.s, objectivesDone: [...d.s.objectivesDone, boundaryCase, deliveryCase] },
  });
  const slots = serialisePair(latest);
  const untouched = 'WORLD-13|game-179|unrelated.event|HUM';
  const ledger = { ...newPermanent(), awards: { 'award.test': '2026-11-26T00:00:00Z' }, credit: { 'credit.test': 11 }, skills: {
    'SK-MICRO-0630': [boundarySource, oldBoundary, untouched, waterBoundary],
    'SK-MICRO-0237': [oldParcel],
    'SK-MICRO-0549': ['WORLD-13|game-279|parcel.o.gather|HUM,POL'],
  } };
  const store = memoryStore({ [KEY_SLOTS]: slots, [KEY_PERMANENT]: JSON.stringify(ledger) });
  const service = new SaveService(store);
  const loaded = service.load();
  if (!loaded.ok || !loaded.pair.recovery) throw new Error('Could not read the older campaign');
  const fixed = service.loadPermanent();
  expect(fixed.skills).toEqual({
    'SK-MICRO-0630': [boundarySource, waterBoundary, untouched],
    'SK-MICRO-0237': [waterParcel],
    'SK-MICRO-0549': ['WORLD-13|game-279|parcel.o.gather|HUM,POL'],
  });
  expect(fixed.awards).toEqual(ledger.awards);
  expect(fixed.credit).toEqual(ledger.credit);
  expect(store.get(KEY_SLOTS)).toBe(slots);
  const recovered = service.commit(loaded.pair.revision, restoreRecovery(loaded.pair));
  d.s = recovered.continue!.state;
  expect(d.s.objectivesDone).not.toContain(boundaryCase);
  expect(d.s.objectivesDone).not.toContain(deliveryCase);
  expect(d.s.flags[`hint.${boundaryCase}`]).toBe(2);
  expect(d.run({ type: 'RequestHint', objective: boundaryCase }).events).toContainEqual(expect.objectContaining({
    kind: 'hint', hint: expect.objectContaining({ objective: boundaryCase, depth: 3 }),
  }));
  expect(service.loadPermanent()).toEqual(fixed);
  service.savePermanent(fixed);
  expect(service.loadPermanent()).toEqual(fixed);
});

it('backfills a completed delivery accurately on old records that predate micro-skill tracking', () => {
  const d = new Driver();
  const completed = [boundaryCase, 'parcel.o.appeal', deliveryCase];
  const oldLedger = new SaveService(memoryStore({ [KEY_PERMANENT]: JSON.stringify({ ...newPermanent(), schema: 3 }) })).loadPermanent();
  const fixed = restoreMicroSkillUses(oldLedger, d.e.pack, completed);
  expect(fixed.skills).toEqual({
    'SK-MICRO-0630': [waterBoundary],
    'SK-MICRO-0233': ['WORLD-12|game-22|parcel.o.appeal|HUM,POL'],
    'SK-MICRO-0237': [waterParcel],
    'SK-MICRO-0840': ['WORLD-12|game-231|parcel.o.finish|HUM,POL'],
  });
  expect(restoreMicroSkillUses(fixed, d.e.pack, completed)).toBe(fixed);
});

it('keeps both returns after the Civic revision and distinguishes chapter order from physical world', () => {
  const d = new Driver();
  d.s.flags['boundary.civic.started'] = true;
  d.s.flags['parcel.open'] = true;
  expect(d.e.visibleObjectives(d.s).some(({ id }) => id === 'boundary.civic.compare' || id === 'parcel.o.gather')).toBe(false);
  const available = guideObjectives(d.e.visibleObjectives(d.s), 'WORLD-12', boundaryCase);
  expect(available.map(({ id }) => id)).not.toContain(boundaryCase);

  const path = playPath(d.e.pack, 'explorer');
  const order = path.map(({ id }) => id);
  for (const [sender, delivery] of [['boundary.civic.post', boundaryCase], ['parcel.o.plan', deliveryCase]]) {
    const revision = order.indexOf('civic.finish');
    expect(revision).toBeGreaterThanOrEqual(0);
    expect(revision).toBeLessThan(order.indexOf(sender));
    expect(order.indexOf(sender)).toBeLessThan(order.indexOf(delivery));
    expect(path.find(({ id }) => id === delivery)?.chapter).toBe(12);
  }
  expect(MAPS['water.council'].world).toBe(MAPS['water.lower-channel'].world);
  expect(MAPS['aethelgard.emberford'].world).toBe(MAPS['aethelgard.study'].world);
  expect(MAPS['civic.steps'].world).not.toBe(MAPS['water.council'].world);
});
