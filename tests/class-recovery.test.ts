import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassSave, teacherWriting } from '../src/classroom/client';
import {
  KEY_PERMANENT,
  KEY_SLOTS,
  serialisePair,
  emptyPair,
} from '../src/domain/saves';
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
    vi.stubGlobal('window', {
      setTimeout: () => 1,
      clearTimeout: () => {},
      dispatchEvent: () => true,
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  const online = (revision: number, data: string | null) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_path: string, options?: RequestInit) =>
        options?.method === 'PUT'
          ? Response.json({ revision: revision + 1 })
          : Response.json({ revision, package: data, updated: null }),
      ),
    );
  it('retries the latest local draft when reconnect arrives before an offline write settles', async () => {
    const store = new ClassSave(who);
    store.storeScene('folio', 'A page for the lantern', 'First words', 'nexus.archive');
    let rejectOffline!: (error: Error) => void;
    const received: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(options.body as string);
      const text = body.writing.find((entry: {text: string}) => entry.text.includes('words'))?.text;
      received.push(text);
      if (received.length === 1) return new Promise<Response>((_, reject) => { rejectOffline = reject; });
      return Response.json({revision: 1});
    }));
    const offline = store.sync();
    store.storeScene('folio', 'A page for the lantern', 'Latest words', 'nexus.archive');
    const reconnect = store.sync();
    rejectOffline(new TypeError('The fictional device was offline.'));
    await Promise.all([offline, reconnect]);
    expect(received).toEqual(['First words','Latest words']);
    expect(JSON.parse(storage.get(key)!)).toMatchObject({revision:1,dirty:false});
  });
  it('preserves the page-exit request when a focus event arrives behind the same pending write', async () => {
    const store = new ClassSave(who);
    store.storeScene('folio', 'South door', 'A little space at the end');
    const modes: boolean[] = [];
    let fail!: () => void;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, request: RequestInit) => {
      modes.push(request.keepalive === true);
      if (modes.length === 1) await new Promise<void>((_, reject) => { fail = () => reject(new TypeError('Offline')); });
      return Response.json({revision: 1});
    }));
    const first = store.sync(), exit = store.sync(true), focus = store.sync();
    fail();
    await Promise.all([first, exit, focus]);
    expect(modes).toEqual([false, true]);
    expect(JSON.parse(storage.get(key)!)).toMatchObject({revision: 1, dirty: false});
  });
  it('stops repeated reconnects at one conflicting write and keeps both editions for review', async () => {
    const store = new ClassSave(who);
    store.storeScene('folio', 'A page for the lantern', 'Local words', 'nexus.archive');
    let respond!: (response: Response) => void;
    const put = vi.fn(() => new Promise<Response>(resolve => {respond=resolve;}));
    vi.stubGlobal('fetch', put);
    const first = store.sync(), concurrent = store.sync();
    respond(Response.json({error:'A second device wrote first.'},{status:409}));
    await Promise.all([first, concurrent]);
    await store.sync();
    expect(put).toHaveBeenCalledTimes(1);
    expect(store.needsComparison).toBe(true);
    expect(JSON.parse(storage.get(key)!)).toMatchObject({revision:0,dirty:true});
    expect(store.sceneDraft('folio')).toBe('Local words');
  });
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
    expect(JSON.parse(storage.get(key)!)).toMatchObject({
      revision: 1,
      dirty: false,
      data: copy.data,
    });
  });
  it('asks again when the other device writes during review and publishes exactly the edition the student chose', async () => {
    const store = new ClassSave(who);
    store.storeScene(
      'letter',
      'Fictional letter',
      'One evening on the terrace',
    );
    const deviceData = JSON.parse(storage.get(key)!).data;
    store.storeScene('letter', 'Fictional letter', 'Meet me on the bridge');
    const firstCloud = JSON.parse(storage.get(key)!).data;
    store.storeScene('letter', 'Fictional letter', 'The river went quiet');
    const secondCloud = JSON.parse(storage.get(key)!).data;
    storage.set(
      key,
      JSON.stringify({ revision: 1, dirty: true, data: deviceData }),
    );
    let version = 2,
      cloud = firstCloud;
    const sent: number[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options: RequestInit) => {
        if (options.method !== 'PUT')
          return Response.json({
            revision: version,
            package: cloud,
            updated: null,
          });
        const request = JSON.parse(options.body as string);
        sent.push(request.revision);
        if (request.revision !== version)
          return Response.json(
            { error: 'Another device just saved.' },
            { status: 409 },
          );
        expect(request.writing).toEqual([
          {
            kind: 'draft-note',
            title: 'Fictional letter',
            text: 'One evening on the terrace',
          },
        ]);
        cloud = request.package;
        return Response.json({ revision: ++version });
      }),
    );
    const reviews: string[] = [];
    await store.open(async (device, remote) => {
      expect(device).toContain('One evening on the terrace');
      reviews.push(remote);
      if (reviews.length === 1) {
        version = 3;
        cloud = secondCloud;
      }
      return 'local';
    });
    expect(reviews).toHaveLength(2);
    expect(reviews[0]).toContain('Meet me on the bridge');
    expect(reviews[1]).toContain('The river went quiet');
    expect(sent).toEqual([2, 3]);
    expect(cloud).toBe(deviceData);
    expect(JSON.parse(storage.get(key)!)).toEqual({
      revision: 4,
      dirty: false,
      data: deviceData,
    });
  });
  it('allows the student to leave a new online edition undecided while preserving their own writing', async () => {
    const store = new ClassSave(who);
    store.storeScene('letter', 'Dusk', 'The local ink');
    const device = JSON.parse(storage.get(key)!).data;
    store.storeScene('letter', 'Dusk', 'Outside the north cave');
    const earlier = JSON.parse(storage.get(key)!).data;
    store.storeScene('letter', 'Dusk', 'The newer lantern');
    const later = JSON.parse(storage.get(key)!).data;
    const initial = JSON.stringify({ revision: 2, dirty: true, data: device });
    storage.set(key, initial);
    let gets = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          ++gets === 1
            ? { revision: 3, package: earlier }
            : { revision: 4, package: later },
        ),
      ),
    );
    let calls = 0;
    expect(
      await store.open(async (_local, cloud) => {
        if (++calls === 1) {
          expect(cloud).toContain('Outside the north cave');
          return 'online';
        }
        expect(cloud).toContain('The newer lantern');
        return 'cancel';
      }),
    ).toBe(false);
    expect(calls).toBe(2);
    expect(storage.get(key)).toBe(initial);
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
    expect(JSON.parse(storage.get(key)!)).toEqual({
      revision: 4,
      dirty: false,
      data,
    });
  });
  it('shows a scene draft as unfinished and removes it when the student clears it', () => {
    const account = new ClassSave(who);
    account.storeScene(
      'fixture',
      'A fictional letter',
      'Half a sentence',
      'nexus.archive',
    );
    expect(account.drafts().fixture.mapId).toBe('nexus.archive');
    const rows = teacherWriting({
      slots: null,
      permanent: null,
      scenes: account.drafts(),
    });
    expect(rows).toEqual([
      {
        kind: 'draft-note',
        title: 'A fictional letter',
        text: 'Half a sentence',
      },
    ]);
    account.storeScene('fixture', 'A fictional letter', '');
    expect(account.sceneDraft('fixture')).toBe('');
  });
});
