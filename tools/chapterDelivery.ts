import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import type { Plugin } from 'vite';
import type { MapDef } from '../src/maps/types';
import type { ContentPack } from '../src/domain/types';

// The build evaluates the normal authoring graph. Only its published projection crosses the wire.
export function chapterDelivery(
  assemble: () => Promise<{ pack: ContentPack; maps: Record<string, MapDef> }>,
): Plugin {
  const id = 'virtual:kg-chapters';
  let root = '';
  let production = false;
  return {
    name: 'kg-chapter-delivery',
    enforce: 'pre',
    transform(code, file) {
      // Preserve rule shapes used by the authoring installers. The published story
      // sections supply final dialogue after all cross-chapter edits have been applied.
      if (
        !production ||
        !file.endsWith('.json') ||
        !file.includes('/src/content/')
      )
        return;
      const part = JSON.parse(code);
      // On a playing device the story sections supply the conversations. The
      // authoring profile and text are needed only when building those sections.
      if (file.endsWith('/keeper-lives.json'))
        return { code: JSON.stringify(Object.fromEntries(Object.keys(part).map(id => [id, {}]))), map: null };
      if (!Array.isArray(part.dialogue) && !Array.isArray(part.hints)) return;
      for (const hint of part.hints ?? []) hint.text = '';
      for (const node of part.dialogue ?? []) {
        node.text = '';
        for (const opt of node.options ?? []) opt.text = '';
      }
      return { code: JSON.stringify(part), map: null };
    },
    configResolved(config) {
      root = config.root;
      production = config.command === 'build';
    },
    resolveId(source) {
      if (source === id) return '\0' + id;
    },
    async load(source) {
      if (source !== '\0' + id) return;
      if (!production)
        return `import { MAPS } from '/src/maps/index.ts'; import {buildPack} from '/src/content/index.ts';
        import originData from '/src/content/origins.json'; export const origins = originData.origins;
        export { MAPS, buildPack }; export const prepareCore = async () => {}, prepareMap = async () => {};
        export const pendingHint = () => undefined; export const pendingNode = () => undefined; export const room = id => Object.hasOwn(MAPS,id) ? MAPS[id] : MAPS['nexus.archive'];`;
      const { pack, maps } = await assemble();
      const asset = (name: string, data: unknown) => {
        const ref = this.emitFile({
          type: 'asset',
          name: name + '.kgz',
          source: gzipSync(JSON.stringify(data), { level: 9 }),
        });
        return 'import.meta.ROLLUP_FILE_URL_' + ref;
      };
      const files: Record<string, string> = {};
      const headers = Object.fromEntries(
        Object.entries(maps).map(([id, map]) => {
          const { floor, ...body } = map;
          const tiles = Array.from({ length: map.height }, (_, y) =>
            Array.from({ length: map.width }, (_, x) => floor(x, y)),
          );
          files['room/' + id] = asset('room-' + id, { ...body, tiles });
          return [
            id,
            {
              id,
              world: map.world,
              name: map.name,
              width: map.width,
              height: map.height,
              spawn: map.spawn,
              interactables: map.interactables
                .filter((it) => it.exhibit)
                .map((it) => ({ exhibit: it.exhibit })),
            },
          ];
        }),
      );
      const owners = new Map<string, string>();
      const queue: string[] = [];
      function own(id: string | undefined, world: string) {
        if (id && !owners.has(id)) {
          owners.set(id, world);
          queue.push(id);
        }
      }
      const content = join(root, 'src/content');
      for (const file of readdirSync(content).filter((s) =>
        /^m\d\d-.*\.json$/.test(s),
      )) {
        const part = JSON.parse(readFileSync(join(content, file), 'utf8'));
        for (const node of part.dialogue ?? [])
          own(node.id, 'WORLD-' + file.slice(1, 3));
      }
      const actors = new Map(pack.characters.map((p) => [p.id, p]));
      for (const map of Object.values(maps)) {
        for (const prop of map.interactables)
          if (prop.kind === 'scene') own(prop.node, map.world);
        for (const npc of map.npcs) {
          const actor = actors.get(npc.id);
          if (actor?.mode === 'fictional') own('offshift.' + actor.id + '.offer', map.world);
          own(actor?.localGreeting?.[map.id], map.world);
          for (const entry of actor?.talk ?? []) own(entry.node, map.world);
        }
      }
      const nodes = new Map(pack.dialogue.map((n) => [n.id, n]));
      for (let i = 0; i < queue.length; i++) {
        const id = queue[i],
          node = nodes.get(id);
        if (!node) continue;
        const world = owners.get(id)!;
        own(node.next ?? undefined, world);
        for (const option of node.options ?? [])
          own(option.next ?? undefined, world);
      }
      // Bound both unplaced conversations and large cross-chapter correspondence desks.
      // The numbered sections stay independently addressable even from a remote speaker.
      const sections = new Map<string, typeof pack.dialogue>();
      const bytes = new Map<string, number>();
      const serial = new Map<string, number>();
      const directory: Record<string, string> = {};
      for (const node of pack.dialogue) {
        const world = owners.get(node.id) ?? 'archive';
        const used = bytes.get(world) ?? 0;
        let index = serial.get(world) ?? 0;
        if (used > 150000) {
          serial.set(world, ++index);
          bytes.set(world, 0);
        }
        const group = world + '-' + index;
        if (!sections.has(group)) sections.set(group, []);
        sections.get(group)!.push(node);
        bytes.set(world, (bytes.get(world) ?? 0) + JSON.stringify(node).length);
        directory[node.id] = group;
      }
      for (const [group, records] of sections)
        files['story/' + group] = asset('story-' + group, records);

      const chapters = new Map(
        pack.missions.flatMap((m) =>
          m.objectives.map((o) => [o.id, m.world] as const),
        ),
      );
      const rawHints = new Set<string>();
      for (const file of readdirSync(content).filter((f) =>
        f.endsWith('.json'),
      )) {
        const part = JSON.parse(readFileSync(join(content, file), 'utf8'));
        if (Array.isArray(part.hints))
          for (const hint of part.hints) rawHints.add(hint.id);
      }
      const guideIndex: Record<string, string> = {};
      const guides = new Map<string, Record<string, string>>();
      for (const hint of pack.hints) {
        if (!rawHints.has(hint.id)) continue;
        const world = chapters.get(hint.objective) ?? 'shared';
        guideIndex[hint.objective] = world;
        if (!guides.has(world)) guides.set(world, {});
        guides.get(world)![hint.id] = hint.text;
      }
      for (const [world, rows] of guides)
        files['guide/' + world] = asset('guide-' + world, rows);
      files.index = asset('story-index', { directory, guideIndex });
      const manifest =
        '{' +
        Object.entries(files)
          .map(([key, url]) => JSON.stringify(key) + ':' + url)
          .join(',') +
        '}';
      return `import { publishedCampaign } from '/src/app/publishedCampaign.ts';
        export const origins = ${JSON.stringify(pack.origins)};
        export const {MAPS,room,buildPack,prepareCore,prepareMap,pendingNode,pendingHint} =
        publishedCampaign(${JSON.stringify(headers)},${manifest},()=>import('/src/content/index.ts').then(m=>m.buildPack()));`;
    },
  };
}
