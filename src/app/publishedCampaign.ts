import { gunzipSync, strFromU8 } from 'fflate';
import type { ContentPack, DialogueNode } from '../domain/types';
import type { MapDef } from '../maps/types';

export type RoomHeading = Pick<
  MapDef,
  'id' | 'world' | 'name' | 'width' | 'height' | 'spawn'
> & {
  interactables: { exhibit?: string }[];
};

export function publishedCampaign(
  MAPS: Record<string, RoomHeading>,
  urls: Record<string, string>,
  assembleRules: () => Promise<ContentPack>,
) {
  let pack: ContentPack;
  let directory: Record<string, string>;
  let guideIndex: Record<string, string>;
  const hints = new Map<string, ContentPack['hints'][number]>();
  const rooms = new Map<string, MapDef>();
  const nodes = new Map<string, DialogueNode>();
  const jobs = new Map<string, Promise<void>>();
  const ready = new Set<string>();
  async function read<T>(key: string): Promise<T> {
    const response = await fetch(urls[key]);
    if (!response.ok) throw new Error('Download failed for ' + key);
    const data = new Uint8Array(await response.arrayBuffer());
    return JSON.parse(strFromU8(gunzipSync(data))) as T;
  }
  function once(key: string, load: () => Promise<void>): Promise<void> {
    let job = jobs.get(key);
    if (!job) {
      job = load()
        .then(() => {
          ready.add(key);
        })
        .catch((error) => {
          jobs.delete(key);
          throw error;
        });
      jobs.set(key, job);
    }
    return job;
  }
  function prepareCore() {
    return once('core', async () => {
      const [index, rules] = await Promise.all([
        read<{
          directory: Record<string, string>;
          guideIndex: Record<string, string>;
        }>('index'),
        assembleRules(),
      ]);
      pack = rules;
      ({ directory, guideIndex } = index);
      for (const hint of pack.hints) hints.set(hint.id, hint);
      for (const node of pack.dialogue) nodes.set(node.id, node);
    });
  }
  function story(group: string) {
    const key = 'story/' + group;
    return once(key, async () => {
      const records = await read<DialogueNode[]>(key);
      for (const node of records) Object.assign(nodes.get(node.id)!, node);
    });
  }
  function pendingNode(id: string) {
    const group = directory[id];
    return group && !ready.has('story/' + group) ? story(group) : undefined;
  }
  function guide(world: string) {
    const key = 'guide/' + world;
    if (!(key in urls)) return Promise.resolve();
    return once(key, async () => {
      const rows = await read<Record<string, string>>(key);
      for (const [id, value] of Object.entries(rows))
        hints.get(id)!.text = value;
    });
  }
  function pendingHint(objective: string) {
    const world = guideIndex[objective];
    return world && !ready.has('guide/' + world) ? guide(world) : undefined;
  }
  async function prepareMap(id: string) {
    if (!Object.hasOwn(MAPS, id)) id = 'nexus.archive';
    const key = 'room/' + id;
    await Promise.all([
      once(key, async () => {
        const { tiles, ...data } = await read<
          Omit<MapDef, 'floor'> & { tiles: (string | null)[][] }
        >(key);
        rooms.set(id, { ...data, floor: (x, y) => tiles[y]?.[x] ?? null });
      }),
      story(MAPS[id].world + '-0'),
      guide(MAPS[id].world),
    ]);
  }
  function room(id: string) {
    const result = rooms.get(Object.hasOwn(MAPS, id) ? id : 'nexus.archive');
    if (!result) throw new Error('Room has not finished loading: ' + id);
    return result;
  }
  return {
    MAPS,
    room,
    buildPack: () => pack,
    prepareCore,
    prepareMap,
    pendingNode,
    pendingHint,
  };
}
