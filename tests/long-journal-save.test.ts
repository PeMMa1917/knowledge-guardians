import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPack } from '../src/content';
import { newCampaign } from '../src/domain/engine';
import { browserStore, emptyPair, KEY_PERMANENT, KEY_SLOTS, SaveService, serialisePair, writeCheckpoint, writeSuspend } from '../src/domain/saves';

const pack = buildPack();
const now = '2026-11-26T08:15:00.000Z';

function limitedStorage() {
  const stored = new Map<string, string>();
  const settings = { quota: 100_000, error: 'QuotaExceededError' };
  vi.stubGlobal('window', { localStorage: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem(key: string, value: string) {
      if (value.length > settings.quota) throw new DOMException('Storage write failed', settings.error);
      stored.set(key, value);
    },
  } });
  return { stored, settings };
}

function longCampaign() {
  const state = newCampaign(pack, '河', 'diary-fixture', 91);
  state.adventureDiary.entries = Array.from({ length: 3000 }, (_, index) => ({
    id: 'reading:' + index, at: now, mapId: 'nexus.archive', kind: 'experience', title: 'The archive',
    text: 'I kept both readings. Ink on the folded edge gave the reader a different perspective. ' + index,
  }));
  return state;
}

afterEach(() => vi.unstubAllGlobals());

describe('long adventure journals in browser storage', () => {
  it('round-trips both slots, Unicode and manual writing through a fresh browser adapter after a plain write exceeds quota', () => {
    const { stored } = limitedStorage();
    const state = longCampaign();
    const first = writeCheckpoint(emptyPair(), { kind: 'checkpoint', label: 'First', location: 'Archive', savedAt: now, state });
    const service = new SaveService(browserStore());
    service.load();
    service.commit(0, first);
    const otherTab = new SaveService(browserStore());
    const opened = otherTab.load();
    expect(opened.ok && opened.pair.recovery?.state.adventureDiary.entries).toEqual(state.adventureDiary.entries);

    const note = '   信念 · perché?\n\nMy evidence  🔭\n';
    const revised = { ...state, notes: [note], adventureDiary: { ...state.adventureDiary,
      noteDetails: [{ kind: 'note' as const, at: now, mapId: 'nexus.archive', resolved: false }] } };
    const second = writeSuspend(first, { kind: 'suspend', label: 'Later', location: 'Archive', savedAt: now, state: revised });
    service.commit(1, second);
    expect(stored.get(KEY_SLOTS)!.length).toBeLessThan(100_000);
    const reloaded = new SaveService(browserStore()).load();
    expect(reloaded.ok && reloaded.pair.continue?.state.notes).toEqual([note]);
    expect(reloaded.ok && reloaded.pair.recovery?.state.notes).toEqual([]);
    expect(() => otherTab.commit(1, second)).toThrow(/another tab/);
    expect([...stored.keys()]).toEqual([KEY_SLOTS]);
  });

  it('keeps ordinary saves readable and retains the last good slots when a compact write also fails', () => {
    const { settings, stored } = limitedStorage();
    const store = browserStore();
    const original = serialisePair(emptyPair());
    store.set(KEY_SLOTS, original);
    expect(stored.get(KEY_SLOTS)).toBe(original);
    settings.quota = 8;
    expect(() => store.set(KEY_SLOTS, 'archive '.repeat(4000))).toThrow();
    expect(store.get(KEY_SLOTS)).toBe(original);
    expect(() => store.set(KEY_PERMANENT, 'award '.repeat(4000))).toThrow();
    settings.quota = 1000;
    settings.error = 'SecurityError';
    expect(() => store.set(KEY_SLOTS, 'x'.repeat(2000))).toThrow();
    expect(store.get(KEY_SLOTS)).toBe(original);
  });
});
