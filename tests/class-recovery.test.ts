import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassSave, teacherWriting } from '../src/classroom/client';
import { KEY_PERMANENT, KEY_SLOTS, serialisePair, emptyPair } from '../src/domain/saves';
import { newPermanent } from '../src/domain/permanent';

const who = {
  id: 'fiction-rill',
  display: 'Rill',
  classId: 'c',
  className: 'Lanterns',
  teacherId: 't',
  teacherName: 'Keeper',
};
const key = 'kg.class.v1.fiction-rill/c/t';
describe('class recovery on a returning device', () => {
  let storage: Map<string, string>;
  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
    });
    vi.stubGlobal('window', { setTimeout: () => 1, clearTimeout: () => {}, dispatchEvent: () => true });
  });
  afterEach(() => vi.unstubAllGlobals());
  const online = (revision: number, data: string | null) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ revision, package: data, updated: null })),
    );
  it('preserves a clean local copy when an online backup rolls back until the student chooses', async () => {
    const account = new ClassSave(who);
    account.set(KEY_SLOTS, serialisePair(emptyPair()));
    const copy = JSON.parse(storage.get(key)!);
    storage.set(key, JSON.stringify({ ...copy, revision: 8, dirty: false }));
    online(0, null);
    const decide = vi.fn(async () => 'cancel' as const);
    expect(await account.open(decide)).toBe(false);
    expect(decide).toHaveBeenCalledOnce();
    expect(JSON.parse(storage.get(key)!).revision).toBe(8);
    expect(await account.open(async () => 'local')).toBe(true);
    expect(JSON.parse(storage.get(key)!)).toMatchObject({ revision: 0, dirty: true, data: copy.data });
  });
  it('restores verified online data after explicit choice when the local envelope is unreadable', async () => {
    const account = new ClassSave(who);
    account.set(KEY_PERMANENT, JSON.stringify(newPermanent()));
    const data = JSON.parse(storage.get(key)!).data;
    storage.set(key, 'unreadable');
    online(4, data);
    expect(await account.open(async () => 'cancel')).toBe(false);
    expect(storage.get(key)).toBe('unreadable');
    expect(await account.open(async () => 'online')).toBe(true);
    expect(JSON.parse(storage.get(key)!)).toEqual({ revision: 4, dirty: false, data });
  });
  it('shows a scene draft as unfinished and removes it when the student clears it', () => {
    const account = new ClassSave(who);
    account.storeScene('fixture', 'A fictional letter', 'Half a sentence', 'nexus.archive');
    expect(account.drafts().fixture.mapId).toBe('nexus.archive');
    const rows = teacherWriting({ slots: null, permanent: null, scenes: account.drafts() });
    expect(rows).toEqual([{ kind: 'draft-note', title: 'A fictional letter', text: 'Half a sentence' }]);
    account.storeScene('fixture', 'A fictional letter', '');
    expect(account.sceneDraft('fixture')).toBe('');
  });
});
