// Trace positive requirements to player actions. An item's own shop listing or reward never counts.
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});
try {
  const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
  const { MAPS } = await server.ssrLoadModule('/src/maps/index.ts');
  const { readingOf, toolOf, cannotRead } = await server.ssrLoadModule(
    '/src/domain/readings.ts',
  );
  const { LOOP_MAP, LOOP_STRIP } = await server.ssrLoadModule(
    '/src/domain/waterLoop.ts',
  );
  const { DATE_PEG_CASES, DATE_PEG_GROUP, DATE_PEG_DOCK, DATE_PEG_MARKET } =
    await server.ssrLoadModule('/src/content/datePegCases.ts');
  const { CALLBOARD_CASES } = await server.ssrLoadModule(
    '/src/content/callboardCases.ts',
  );
  const { waterLoopStation } = await server.ssrLoadModule(
    '/src/maps/waterLoop.ts',
  );
  const { Engine, newCampaign } = await server.ssrLoadModule(
    '/src/domain/engine.ts',
  );
  const { newPermanent } = await server.ssrLoadModule(
    '/src/domain/permanent.ts',
  );
  const pack = buildPack();
  const engine = new Engine(pack);
  const items = new Map(
    pack.items
      .filter((i) => !i.id.startsWith('item.specimen.'))
      .map((i) => [i.id, i.name]),
  );
  const keepsakes = new Map(
    pack.keepsakes
      .filter((i) => !i.id.startsWith('specimen.'))
      .map((i) => [i.id, i.name]),
  );
  const evidence = new Map(
    [...items, ...keepsakes].map(([id]) => [id, new Map()]),
  );
  const add = (id, map, action) => {
    if (evidence.has(id))
      evidence.get(id).set(map + '|' + action, { map, action });
  };
  // A negative prerequisite describes the state before collection. It cannot use the object.
  function requirements(condition, map, action) {
    if (!condition || 'not' in condition) return;
    if ('item' in condition && (condition.min ?? 1) > 0)
      add(condition.item, map, action);
    if (condition.flag === 'perspective.active') {
      for (const id of condition.in ?? [condition.eq])
        if (typeof id === 'string') add(id, map, action);
    }
    for (const child of condition.all ?? condition.any ?? [])
      requirements(child, map, action);
  }
  const characters = new Map(pack.characters.map((c) => [c.id, c]));
  const dialogue = new Map(pack.dialogue.map((n) => [n.id, n]));
  const clues = new Map(pack.clues.map((c) => [c.id, c]));
  const talks = new Map();
  for (const t of pack.keepsakeTalks) {
    if (!talks.has(t.character)) talks.set(t.character, []);
    talks.get(t.character).push(t);
  }
  for (const room of Object.values(MAPS)) {
    const nodes = [];
    for (const person of room.npcs) {
      const c = characters.get(person.id);
      requirements(person.visibleIf, room.id, 'Meet ' + (c?.name ?? person.id));
      for (const greet of c?.talk ?? []) {
        requirements(greet.if, room.id, 'Speak to ' + c.name);
        nodes.push(greet.node);
      }
      if (c?.localGreeting?.[room.id]) nodes.push(c.localGreeting[room.id]);
      for (const t of talks.get(person.id) ?? []) {
        add(t.keepsake, room.id, t.text);
        nodes.push(t.node);
      }
    }
    for (const p of room.interactables) {
      requirements(p.visibleIf, room.id, p.label);
      requirements(p.openIf, room.id, p.label);
      if (p.node && dialogue.has(p.node)) nodes.push(p.node);
      if (p.kind === 'clue')
        for (const v of clues.get(p.clue)?.views ?? [])
          add(v.keepsake, room.id, p.label);
      if (p.kind === 'reading') {
        const reading = readingOf(p.reading);
        if (!reading) continue;
        const tool = toolOf(reading);
        const calibrated = { ['craft.' + tool.id + '.calibrated']: true };
        // Exercise the same guard as the actual field-reading command.
        if (
          cannotRead({ inventory: {}, flags: calibrated }, p.reading) &&
          !cannotRead(
            { inventory: { [tool.item]: 1 }, flags: calibrated },
            p.reading,
          )
        )
          add(tool.item, room.id, p.label);
      }
      // These custom desks issue ChooseDialogueOption directly for their individual records.
      if (p.game?.startsWith(DATE_PEG_GROUP + ':')) {
        const route = p.game.slice(DATE_PEG_GROUP.length + 1);
        if (route === DATE_PEG_DOCK || route === DATE_PEG_MARKET)
          for (const record of DATE_PEG_CASES) nodes.push(record.nodes[route]);
      }
      if (p.game === 'callboard:first' || p.game === 'callboard:second') {
        const stop = p.game.split(':')[1];
        for (const record of CALLBOARD_CASES) nodes.push(record.nodes[stop]);
      }
      if (
        room.id === LOOP_MAP.island &&
        waterLoopStation(p.game)?.station === 'model'
      )
        add(LOOP_STRIP, room.id, p.label);
      if (
        p.kind === 'exhibit' &&
        ['OBJ-001-A', 'OBJ-NILE-SALLIER'].includes(p.exhibit)
      ) {
        const s = newCampaign(pack, 'Fictional Keeper', 'player-a', 3);
        s.mapId = room.id;
        delete s.inventory['tool.date-lens'];
        const act = { type: 'UseLens', exhibit: p.exhibit };
        const missing = engine
          .dispatch(act, s, newPermanent())
          .events.some((e) => e.kind === 'error');
        s.inventory['tool.date-lens'] = 1;
        const used =
          engine.dispatch(act, s, newPermanent()).state.flags[
            'lens.' + p.exhibit
          ] === true;
        if (missing && used)
          add('tool.date-lens', room.id, 'Read the date kind at ' + p.label);
      }
    }
    const visited = new Set();
    for (let i = 0; i < nodes.length; i++) {
      const id = nodes[i];
      if (visited.has(id)) continue;
      visited.add(id);
      const d = dialogue.get(id);
      if (!d) continue;
      if (d.next) nodes.push(d.next);
      for (const opt of d.options ?? []) {
        requirements(opt.if, room.id, opt.text);
        if (opt.next) nodes.push(opt.next);
      }
    }
  }
  const rows = [...evidence].map(([id, uses]) => ({
    id,
    kind: items.has(id) ? 'item' : 'keepsake',
    name: items.get(id) ?? keepsakes.get(id),
    uses: [...uses.values()],
  }));
  const gaps = rows.filter((row) => !row.uses.length);
  if (process.argv.includes('--json'))
    console.log(JSON.stringify({ rows, gaps: gaps.map((g) => g.id) }, null, 2));
  else {
    for (const kind of ['item', 'keepsake']) {
      const batch = rows.filter((row) => row.kind === kind);
      console.log(
        kind +
          ': ' +
          batch.filter((row) => row.uses.length).length +
          '/' +
          batch.length +
          ' with a named map action',
      );
    }
    if (gaps.length)
      console.log(
        'No mapped use in this scan: ' + gaps.map((row) => row.id).join(', '),
      );
  }
  if (process.argv.includes('--require-all') && gaps.length)
    process.exitCode = 1;
} finally {
  await server.close();
}
