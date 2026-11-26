import { afterEach, expect, it, vi } from 'vitest';
import { GameController } from '../src/app/controller';
import { buildPack } from '../src/content';
import { newCampaign } from '../src/domain/engine';
import { newPermanent } from '../src/domain/permanent';
import { KEY_PERMANENT, KEY_SLOTS, emptyPair, memoryStore, serialisePair, writeCheckpoint } from '../src/domain/saves';
import { CAMPAIGN_SCHEMA, PERMANENT_SCHEMA } from '../src/domain/types';

const pack = buildPack();
const seed = () => {
  const state = newCampaign(pack, 'Restore QA', 'player-a', 351);
  state.flags['count.inspected'] = 3;
  state.flags['count.lens'] = 2;
  return writeCheckpoint(emptyPair(), { kind: 'checkpoint', label: 'Readings', location: 'Nexus',
    savedAt: '2026-11-26T14:00:00Z', state });
};
const otherProgress = () => ({ ...newPermanent(), credit: { 'crit.responsibility.well': 10 }, awards: { 'badge.kind-hand': '2026-11-01' } });

function setup(permanent: string, failedReads = new Set<string>()) {
  const pair = seed();
  const store = memoryStore({ [KEY_PERMANENT]: permanent, [KEY_SLOTS]: serialisePair(pair) });
  vi.stubGlobal('window', { localStorage: { getItem: (key: string) => {
    if (failedReads.has(key)) throw new DOMException('Synthetic read denial', 'SecurityError');
    return store.get(key);
  }, setItem: store.set } });
  return { pair, store };
}

afterEach(() => vi.unstubAllGlobals());

it('Continue preserves unread higher-schema permanent bytes rather than rebuilding the record', () => {
  const bytes = JSON.stringify({ ...otherProgress(), schema: PERMANENT_SCHEMA + 1, futureProgress: ['future-protected-record'] });
  const { store } = setup(bytes);
  const app = new GameController();
  app.loadContinue();
  expect(app.state.flags['count.inspected']).toBe(3);
  expect(app.saves.permanentLoadProblem).toMatch(/newer game version/);
  expect(store.get(KEY_PERMANENT)).toBe(bytes);
});

it('Continue keeps existing permanent progress even when its storage read temporarily fails', () => {
  const bytes = JSON.stringify(otherProgress());
  const blocked = new Set([KEY_PERMANENT]);
  const { store } = setup(bytes, blocked);
  const app = new GameController();
  app.loadContinue();
  expect(app.saves.permanentLoadProblem).toMatch(/when storage is available/);
  blocked.clear();
  expect(store.get(KEY_PERMANENT)).toBe(bytes);
});

it('protects a saved adventure that becomes a newer schema while this tab is still open', () => {
  const { pair, store } = setup(JSON.stringify(newPermanent()));
  const app = new GameController();
  app.loadContinue();
  const future = serialisePair({ ...pair, revision: pair.revision + 1,
    continue: { ...pair.continue!, state: { ...pair.continue!.state, schema: CAMPAIGN_SCHEMA + 1 } } });
  store.set(KEY_SLOTS, future);
  expect(app.suspend()).toBe(false);
  expect(store.get(KEY_SLOTS)).toBe(future);
});

it.each([1, 2, 3])('keeps schema-%i learning credit when Continue earns a reconstructed award', (schema) => {
  const { credit, awards, stones, skills, ...rest } = otherProgress();
  const legacy = schema === 1 ? { schema, credit, awards }
    : { ...rest, schema, credit, awards, ...(schema === 3 ? { stones } : {}) };
  const { store } = setup(JSON.stringify(legacy));
  const app = new GameController();
  app.loadContinue();
  const saved = JSON.parse(store.get(KEY_PERMANENT)!);
  expect(saved.credit).toEqual({ 'crit.responsibility.well': 10, 'crit.evidence.date-kinds': 20 });
  expect(saved.awards).toEqual(expect.objectContaining(otherProgress().awards));
  expect(app.saves.permanentLoadProblem).toBeUndefined();
});

it('preserves existing campaign bytes if its read fails at the point of saving', () => {
  const blocked = new Set<string>();
  const { store } = setup(JSON.stringify(newPermanent()), blocked);
  const app = new GameController();
  app.loadContinue();
  const before = store.get(KEY_SLOTS);
  blocked.add(KEY_SLOTS);
  expect(app.suspend()).toBe(false);
  expect(store.get(KEY_SLOTS)).toBe(before);
});

it('lets a player explicitly start a new adventure over the corrupt bytes reported at title', () => {
  const { store } = setup(JSON.stringify(newPermanent()));
  store.set(KEY_SLOTS, 'interrupted old save');
  const app = new GameController();
  expect(app.loadProblem).toBeTruthy();
  expect(store.get(KEY_SLOTS)).toBe('interrupted old save');
  app.newGame('Fresh', 'player-a');
  expect(app.canContinue()).toBe(true);
  expect(app.pair.continue?.state.player.name).toBe('Fresh');
  expect(store.get(KEY_SLOTS)).toBe(serialisePair(app.pair));
});

it('can Continue without rewriting current-schema learning data missing required dictionaries', () => {
  const incomplete = JSON.stringify({ ...otherProgress(), awards: undefined, met: { atl: {} } });
  const { store } = setup(incomplete);
  const app = new GameController();
  expect(() => app.loadContinue()).not.toThrow();
  expect(app.state.flags['count.inspected']).toBe(3);
  expect(app.saves.permanentLoadProblem).toMatch(/unreadable/);
  expect(store.get(KEY_PERMANENT)).toBe(incomplete);
});
