/** Inspect the actual option, its speaker, gates, outcome and later map readers. See docs/audit/CHOICE_REVIEW.md. */
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import { WORLD_CHAPTER, readingLoad } from './audit-personas.mjs';
import { loadEntrances } from './choice-entrances.mjs';
import { reviewChoice, reviewStation } from './review-choice-perspectives.mjs';
import { coexist, rehearseChoice } from './choice-rehearsal.mjs';

const root = new URL('../', import.meta.url);
const unique = (values) => [...new Set(values)];
function append(index, key, value) {
  const rows = index.get(key) ?? [];
  rows.push(value);
  index.set(key, rows);
}
function refKeys(c) {
  if (!c) return [];
  if (c.all || c.any) return (c.all ?? c.any).flatMap(refKeys);
  if (c.not) return refKeys(c.not);
  if (c.flag || c.flagSet || c.num) return ['flag:' + (c.flag ?? c.flagSet ?? c.num)];
  if (c.card) return ['card:' + c.card];
  if (c.item) return ['item:' + c.item];
  if (c.objective) return ['objective:' + c.objective];
  if (c.trust) return ['trust:' + c.trust];
  return [];
}
function changed(e) {
  if ('setFlag' in e) return 'flag:' + e.setFlag;
  if ('addNum' in e) return 'flag:' + e.addNum;
  if ('addCard' in e) return 'card:' + e.addCard;
  if ('giveItem' in e || 'takeItem' in e) return 'item:' + (e.giveItem ?? e.takeItem);
  if ('trust' in e) return 'trust:' + e.trust;
  return null;
}
function addReaders(map, change, where) {
  for (const key of unique(refKeys(change))) append(map, key, where);
}
// Authored count flags are integer visit tallies. Two adjacent closed ranges cover every ordinary tally.
function alwaysHasBaseOption(options) {
  if (options.some((option) => !option.if)) return true;
  for (const { if: high } of options) {
    if (!high?.num?.startsWith('count.') || high.gte !== undefined || !Number.isInteger(high.lte)) continue;
    if (
      options.some(
        ({ if: low }) =>
          low?.num === high.num &&
          low.lte === undefined &&
          Number.isInteger(low.gte) &&
          low.gte <= high.lte + 1,
      )
    )
      return true;
  }
  return false;
}
export function choiceIndex(pack, maps, entrances) {
  const people = new Map(pack.characters.map((p) => [p.id, p])),
    nodes = new Map(pack.dialogue.map((n) => [n.id, n]));
  const placements = new Map(),
    readers = new Map(),
    rooms = Object.values(maps);
  for (const room of rooms) {
    const seeds = pack.events.filter((event) => event.maps.includes(room.id)).map((event) => event.node);
    if (room.id === 'nexus.archive') seeds.push('cold.open');
    for (const p of room.interactables) {
      if (p.kind === 'scene' && p.node) seeds.push(p.node);
      if (p.kind === 'fieldgame' && p.game) seeds.push(...(entrances?.field(p.game) ?? []));
      const where = { map: room.id, id: p.id, label: p.label, detail: 'visibility' };
      addReaders(readers, p.visibleIf, where);
      addReaders(readers, p.openIf, { ...where, detail: 'door opens' });
      addReaders(readers, p.artOpen?.if, { ...where, detail: 'art' });
      if (p.artBy?.flag)
        append(readers, 'flag:' + p.artBy.flag, { ...where, detail: 'art', variants: p.artBy.keys });
    }
    for (const actor of room.npcs) {
      const person = people.get(actor.id);
      if (!person) continue;
      addReaders(readers, actor.visibleIf, {
        map: room.id,
        id: actor.id,
        label: person.name,
        detail: 'arrival',
      });
      seeds.push(...(entrances?.character(actor.id, room.id) ?? []));
      const local = person.localGreeting?.[room.id];
      if (local) seeds.push(local);
      else seeds.push(...person.talk.map((t) => t.node));
    }
    const seen = new Set(),
      stack = unique(seeds);
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id);
      const node = nodes.get(id);
      if (!node) continue;
      append(placements, id, room.id);
      if (node.next) stack.push(node.next);
      for (const opt of node.options ?? []) if (opt.next) stack.push(opt.next);
      // A player's acquired keepsake can add a one-time conversation at a character's regular greeting.
      const person = people.get(node.speaker);
      if (person?.talk.some((t) => t.node === id) && !(node.next && !node.options?.length))
        for (const k of pack.keepsakeTalks ?? []) if (k.character === person.id) stack.push(k.node);
    }
  }
  const options = [],
    objects = [];
  for (const node of pack.dialogue) {
    const roomIds = placements.get(node.id) ?? [],
      chapters = unique(roomIds.map((room) => WORLD_CHAPTER[maps[room].world])).sort((a, b) => a - b);
    const make = (option, index, kind) => {
      const target = nodes.get(option.next),
        effectList = option.effects ?? [],
        callbacks = [];
      for (const e of effectList) {
        const key = changed(e);
        if (key)
          for (const loc of readers.get(key) ?? [])
            callbacks.push({
              conditionKey: key,
              ...loc,
              ...(loc.variants && 'setFlag' in e ? { selectedArt: loc.variants[String(e.value)] ?? null } : {}),
              ...('setFlag' in e ? { writtenValue: e.value } : {}),
            });
      }
      const row = {
        id: node.id + '#' + index,
        kind,
        node: node.id,
        index,
        speaker: people.get(node.speaker)?.name ?? node.speaker,
        character: node.speaker,
        text: node.text,
        label: option.text,
        chapters,
        rooms: roomIds,
        guard: option.if ?? null,
        entryEffects: node.effects ?? [],
        effects: effectList,
        opens: option.open ?? null,
        tag: option.tag ?? null,
        next: option.next ?? null,
        reply: target?.text ?? null,
        replySpeaker: target ? (people.get(target.speaker)?.name ?? target.speaker) : null,
        historicalLabel: node.historicalLabel ?? null,
        citationSource: node.citationSource ?? null,
        callbacks,
        reading: readingLoad(option.text),
        offered: (node.options ?? []).length,
        option,
      };
      options.push(row);
    };
    (node.options ?? []).forEach((option, index) => make(option, index, 'dialogue'));
    if (node.next && !node.options?.length) continue;
    const person = people.get(node.speaker);
    if (!person?.talk.some((t) => t.node === node.id)) continue;
    const gifts = [];
    (pack.keepsakeTalks ?? []).forEach((gift, i) => {
      if (gift.character !== person.id) return;
      const guard = {
        all: [
          { flag: 'keepsake.' + gift.keepsake, eq: true },
          { not: { flag: 'ktalk.' + gift.id, eq: true } },
          ...(gift.if ? [gift.if] : []),
        ],
      };
      gifts.push(guard);
      make(
        {
          text: gift.text,
          next: gift.node,
          if: guard,
          effects: [{ setFlag: 'ktalk.' + gift.id, value: true }],
        },
        1000 + i,
        'keepsake',
      );
    });
    const base = node.options ?? [];
    if (gifts.length && !alwaysHasBaseOption(base)) {
      const guard = { all: [{ any: gifts }, ...base.map((o) => ({ not: o.if }))] };
      make(
        { text: node.next ? 'Go on.' : 'Goodbye.', next: node.next ?? null, if: guard },
        999,
        'keepsake-exit',
      );
    }
  }
  for (const room of rooms)
    for (const prop of room.interactables)
      objects.push({
        id: room.id + '/' + prop.id,
        kind: prop.kind,
        label: prop.label,
        map: room.id,
        chapter: WORLD_CHAPTER[room.world],
        coordinates: [prop.x, prop.y],
        guard: prop.visibleIf ?? null,
        openIf: prop.openIf ?? null,
        sound: prop.sfx ?? null,
        sets: prop.flag ?? null,
        tool: prop.game ?? prop.kit ?? prop.puzzle ?? null,
        destination: prop.to ?? null,
        art: prop.art ?? null,
        node: prop.node ?? null,
        exhibit: prop.exhibit ?? null,
        text: prop.text ?? null,
      });
  return { options, objects, nodes };
}
export function readPersonas(md) {
  const profiles = new Map();
  for (const block of md.split(/^### /m).slice(1)) {
    const first = block.split('\n')[0],
      match = first.match(/^([A-Z]\d+)(?:\s*\([^)]*\))?\.\s*(.*)$/);
    if (!match || match[1] === 'J4') continue;
    const fields = {};
    for (const line of block.split('\n').slice(1)) {
      if (line.startsWith('#')) break;
      const field = line.match(/^- \*\*([^:]+):\*\*\s*(.+)$/);
      if (field) fields[field[1]] = field[2];
    }
    profiles.set(match[1], { id: match[1], name: match[2], fields });
  }
  return profiles;
}
const kinds = {
  collisions: 'identical selectable labels in the same scene',
  readers: 'all downstream map readers of a selected option',
  matrix: 'evaluate all selected persona inspections',
  summary: 'counts and branch coverage',
  dialogue: 'authored and conditional keepsake choices',
  station: 'room objects and working stations',
  exercise: 'execute fictional branch fixtures',
  personas: 'all simulated review profiles',
};
async function writeLine(value) {
  if (!process.stdout.write(value + '\n')) await once(process.stdout, 'drain');
}
export async function main(argv) {
  const { values: v } = parseArgs({
    args: argv,
    options: {
      mode: { type: 'string', default: 'summary' },
      chapter: { type: 'string' },
      room: { type: 'string' },
      persona: { type: 'string' },
      action: { type: 'string' },
      speaker: { type: 'string' },
      offset: { type: 'string' },
      limit: { type: 'string' },
      format: { type: 'string', default: 'jsonl' },
      'errors-only': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  });
  if (v.help) {
    console.log(
      Object.entries(kinds)
        .map(([mode, desc]) => '--mode ' + mode + '    ' + desc)
        .join('\n'),
    );
    console.log('Filter with --chapter 1–15, --room ID, --speaker ID, --action ID or --persona ID.');
    console.log('Use --offset and --limit to page, --format md to read, or --errors-only with exercise.');
    return;
  }
  if (!Object.hasOwn(kinds, v.mode)) throw Error('Unknown review mode.');
  if (!['jsonl', 'md'].includes(v.format)) throw Error('Choose jsonl or md.');
  const chapter = v.chapter === undefined ? null : Number(v.chapter);
  if (chapter !== null && (!Number.isInteger(chapter) || chapter < 1 || chapter > 15))
    throw Error('Choose chapter 1 to 15.');
  const offset = Number(v.offset ?? 0),
    limit = v.limit === undefined ? Infinity : Number(v.limit);
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    (limit !== Infinity && (!Number.isSafeInteger(limit) || limit < 0))
  )
    throw Error('Use a nonnegative limit and offset.');
  const personas = readPersonas(await readFile(new URL('docs/audit/PERSONAS.md', root), 'utf8'));
  const who = personas.get(v.persona);
  if (v.persona && !who) throw Error('Unknown persona. Use --mode personas.');
  if (v.mode === 'personas') {
    for (const p of personas.values()) await writeLine(JSON.stringify(p));
    return;
  }
  const server = await createServer({
    root: new URL('../', import.meta.url).pathname,
    configFile: false,
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { buildPack } = await server.ssrLoadModule('/src/content/index.ts'),
      { MAPS } = await server.ssrLoadModule('/src/maps/index.ts'),
      pack = buildPack(),
      index = choiceIndex(pack, MAPS, await loadEntrances(server));
    if (v.room && !MAPS[v.room]) throw Error('Unknown room.');
    let choices = index.options.filter(
      (row) =>
        (!chapter || row.chapters.includes(chapter)) &&
        (!v.room || row.rooms.includes(v.room)) &&
        (!v.speaker || row.character === v.speaker) &&
        (!v.action || row.id === v.action),
    );
    const stations = index.objects.filter(
      (p) =>
        (!chapter || p.chapter === chapter) &&
        (!v.room || p.map === v.room) &&
        (!v.action || p.id === v.action),
    );
    if (v.mode === 'summary') {
      const chapters = Array.from({ length: 15 }, (_, i) => ({
        chapter: i + 1,
        options: choices.filter((c) => c.chapters.includes(i + 1)).length,
        placements: stations.filter((p) => p.chapter === i + 1).length,
      }));
      console.log(
        JSON.stringify(
          {
            chapters,
            options: choices.length,
            gated: choices.filter((c) => c.guard).length,
            withRoomRoots: choices.filter((c) => c.rooms.length).length,
            withoutRoomRoots: choices.filter((c) => !c.rooms.length).length,
            roomPlacements: stations.length,
            personas: personas.size,
          },
          null,
          2,
        ),
      );
      return;
    }
    if (v.action && !choices.length && !stations.length)
      throw Error('No such action within the current filters.');
    if (v.mode === 'collisions') {
      const { Engine, newCampaign } = await server.ssrLoadModule('/src/domain/engine.ts');
      const { check } = await server.ssrLoadModule('/src/domain/rules.ts');
      const game = new Engine(pack),
        base = newCampaign(pack, 'Rowan Tester', 'fiction-guardian', 31),
        identical = new Map();
      for (const row of choices)
        append(
          identical,
          row.node + '\n' + (row.tag ?? '') + '\n' + row.label.toLocaleLowerCase('en').trim(),
          row,
        );
      for (const rows of identical.values())
        for (const [i, left] of rows.entries())
          for (const right of rows.slice(i + 1)) {
            const fixture = coexist(
              { ...base, mapId: left.rooms[0] ?? base.mapId },
              left.guard,
              right.guard,
              check,
            );
            if (!fixture) continue;
            const visible = game.visibleOptions(left.node, fixture).map((x) => x.index);
            if (visible.includes(left.index) && visible.includes(right.index))
              await writeLine(
                JSON.stringify({
                  left: left.id,
                  right: right.id,
                  label: left.label,
                  leftGuard: left.guard,
                  rightGuard: right.guard,
                  leftNext: left.next,
                  rightNext: right.next,
                  chapters: left.chapters,
                  rooms: left.rooms,
                }),
              );
          }
      return;
    }
    if (v.mode === 'readers') {
      if (!v.action) throw Error('Select one option with --action to inspect its downstream readers.');
      for (const row of choices)
        for (const entry of row.callbacks.slice(offset, offset + limit))
          await writeLine(JSON.stringify({ action: row.id, ...entry }));
      return;
    }
    if (v.mode === 'matrix') {
      const selected = who ? [who] : [...personas.values()];
      const outcomes = [];
      for (const profile of selected) {
        let inspected = 0;
        for (const row of choices) {
          const review = reviewChoice(profile, row);
          if (
            !(
              review.strength &&
              review.concern &&
              review.check &&
              review.ifConcernObserved &&
              review.action === row.id
            )
          )
            throw Error('Incomplete dialogue review at ' + row.id + ' for ' + profile.id);
          inspected++;
        }
        for (const row of stations) {
          const review = reviewStation(profile, row);
          if (
            !(
              review.strength &&
              review.concern &&
              review.check &&
              review.ifConcernObserved &&
              review.action === row.id
            )
          )
            throw Error('Incomplete station review at ' + row.id + ' for ' + profile.id);
          inspected++;
        }
        outcomes.push({
          persona: profile.id,
          name: profile.name,
          choices: choices.length,
          stations: stations.length,
          inspected,
        });
      }
      for (const outcome of outcomes) await writeLine(JSON.stringify(outcome));
      return;
    }
    if (v.mode === 'station') {
      for (const p of stations.slice(offset, offset + limit)) {
        const review = who ? reviewStation(who, p) : null;
        if (v.format === 'md')
          await writeLine(
            '### ' +
              p.label +
              '\n\n' +
              p.id +
              ' · chapter ' +
              p.chapter +
              ' · tile ' +
              p.coordinates.join(', ') +
              '\n\n' +
              (p.destination
                ? 'Travel to ' + p.destination.map
                : p.tool
                  ? 'Open ' + p.tool
                  : (p.text ?? p.kind)) +
              (p.openIf ? '\n\nDoor condition ' + JSON.stringify(p.openIf) : '') +
              (review
                ? '\n\n' +
                  [review.strength, review.concern, review.check, review.ifConcernObserved].join('\n\n')
                : '') +
              '\n',
          );
        else await writeLine(JSON.stringify({ ...p, ...(review ? { review } : {}) }));
      }
      return;
    }
    choices = choices.slice(offset, offset + limit);
    if (v.mode === 'exercise') {
      const { Engine, newCampaign } = await server.ssrLoadModule('/src/domain/engine.ts'),
        { newPermanent } = await server.ssrLoadModule('/src/domain/permanent.ts'),
        { check } = await server.ssrLoadModule('/src/domain/rules.ts');
      const engine = new Engine(pack),
        base = newCampaign(pack, 'Rowan Tester', 'fiction-guardian', 31),
        permanent = newPermanent();
      const results = {};
      let failures = 0;
      for (const row of choices) {
        const map =
          v.room ??
          (chapter ? row.rooms.find((id) => WORLD_CHAPTER[MAPS[id].world] === chapter) : row.rooms[0]);
        let outcome;
        try {
          outcome = rehearseChoice({
            engine,
            base,
            permanent,
            check,
            node: index.nodes.get(row.node),
            option: row.option,
            index: row.index,
            map,
          });
        } catch (e) {
          outcome = { result: 'assertion-failed', reason: e.message };
        }
        results[outcome.result] = (results[outcome.result] ?? 0) + 1;
        if (outcome.result !== 'passed') failures++;
        if (!v['errors-only'] || outcome.result !== 'passed')
          await writeLine(JSON.stringify({ id: row.id, map: map ?? null, ...outcome }));
      }
      await writeLine(JSON.stringify({ summary: results, exercised: choices.length, failures }));
      if (failures) process.exitCode = 1;
      return;
    }

    for (const row of choices) {
      const { option, callbacks, ...fields } = row;
      const review = who ? reviewChoice(who, row) : null;
      if (v.format === 'md') {
        await writeLine(
          '### ' +
            row.label +
            '\n\n' +
            row.speaker +
            ' — ' +
            row.id +
            '\n\n' +
            row.text +
            '\n\n' +
            (row.reply ? '**' + row.replySpeaker + '** ' + row.reply : 'This choice closes the conversation.') +
            (row.opens ? '\n\nOpen ' + row.opens + '.' : '') +
            (row.guard ? '\n\nAvailable when ' + JSON.stringify(row.guard) : '') +
            (row.effects.length ? '\n\nChoice effects ' + JSON.stringify(row.effects) : '') +
            (row.callbacks.length
              ? '\n\nLater readers ' +
                row.callbacks
                  .slice(0, 6)
                  .map((c) => c.label + ' (' + c.map + ', ' + c.detail + ')')
                  .join(', ') +
                ' · ' +
                row.callbacks.length +
                ' total'
              : '') +
            (review
              ? '\n\n**' +
                who.name +
                '**\n\n' +
                [review.strength, review.concern, review.check, review.ifConcernObserved].join('\n\n')
              : '') +
            '\n',
        );
      } else
        await writeLine(
          JSON.stringify({
            ...fields,
            callbackCount: callbacks.length,
            callbacks: callbacks.slice(0, 6),
            ...(review ? { review } : {}),
          }),
        );
    }
  } finally {
    await server.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main(process.argv.slice(2));
