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
  const { datePegEntries } = await server.ssrLoadModule(
    '/src/content/datePegCases.ts',
  );
  const { callboardEntries } = await server.ssrLoadModule(
    '/src/content/callboardCases.ts',
  );
  const { dateRegisterEntries } = await server.ssrLoadModule(
    '/src/content/dateRegisterCases.ts',
  );
  const { curtainCallEntries } = await server.ssrLoadModule(
    '/src/content/curtainCall.ts',
  );
  const { glassRackEntries } = await server.ssrLoadModule(
    '/src/content/glassRack.ts',
  );
  const { clearBayEntries } = await server.ssrLoadModule(
    '/src/domain/clearBay.ts',
  );
  const { RECIPES } = await server.ssrLoadModule('/src/domain/craft.ts');
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
  const origins = new Map();
  const marks = new Map();
  function remember(table, key, map, action) {
    if (!table.has(key)) table.set(key, new Map());
    table.get(key).set(map + '|' + action, { map, action });
  }
  function acquire(id, map, action) {
    if (evidence.has(id)) remember(origins, id, map, action);
  }
  function writes(effects, map, action) {
    for (const effect of effects ?? []) {
      if (effect.giveItem) acquire(effect.giveItem, map, action);
      if (effect.setFlag) {
        remember(marks, 'flag:' + effect.setFlag, map, action);
        remember(
          marks,
          'flag:' + effect.setFlag + '=' + JSON.stringify(effect.value),
          map,
          action,
        );
      }
      if (effect.addCard)
        remember(marks, 'card:' + effect.addCard, map, action);
    }
  }
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
    const nodes = pack.events
      .filter((event) => event.maps.includes(room.id))
      .map((event) => event.node);
    for (const zone of room.zones ?? []) {
      remember(
        marks,
        'flag:reached.' + zone.id + '=true',
        room.id,
        'Walk to ' + zone.id,
      );
    }
    for (const person of room.npcs) {
      const c = characters.get(person.id);
      requirements(person.visibleIf, room.id, 'Meet ' + (c?.name ?? person.id));
      const local = c?.localGreeting?.[room.id];
      if (local) nodes.push(local);
      else
        for (const greet of c?.talk ?? []) {
          requirements(greet.if, room.id, 'Speak to ' + c.name);
          nodes.push(greet.node);
        }
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
      if (
        p.kind === 'thread' &&
        pack.threads.some(
          (t) =>
            t.id === p.thread && t.nodes.some((node) => node.id === p.node),
        )
      )
        add('tool.provenance-thread', room.id, p.label);
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
      if (p.game) {
        for (const entries of [
          datePegEntries,
          callboardEntries,
          dateRegisterEntries,
          curtainCallEntries,
          glassRackEntries,
          clearBayEntries,
        ])
          nodes.push(...entries(p.game));
      }
      if (p.flag) {
        remember(marks, 'flag:' + p.flag, room.id, p.label);
        remember(marks, 'flag:' + p.flag + '=true', room.id, p.label);
      }
      // These stations issue their own rewards through engine commands instead of dialogue effects.
      if (p.game === 'market-basket-bench') {
        for (const form of ['voucher', 'credit'])
          acquire('item.market.basket.' + form, room.id, p.label);
      }
      if (p.game === 'incentive-board')
        acquire('item.incentive.manifest', room.id, p.label);
      if (p.game === 'strip-bend:nile')
        acquire('item.bend-card', room.id, p.label);
      if (p.game === 'whistle-watch')
        acquire('item.notched-whistle', room.id, p.label);
      if (p.game === 'drawer-cases')
        remember(marks, 'flag:drawers.checked=63', room.id, p.label);
      if (p.kind === 'boss' && p.id === 'archivist')
        acquire('item.brass-lamp', room.id, p.label);
      if (
        room.id === LOOP_MAP.archive &&
        waterLoopStation(p.game)?.station === 'model'
      )
        acquire(LOOP_STRIP, room.id, p.label);
      if (p.kind === 'label')
        remember(
          marks,
          'flag:label.' + p.kit + '.everHeld=true',
          room.id,
          p.label,
        );
      if (p.kind === 'puzzle')
        remember(
          marks,
          'flag:puzzle.' + p.puzzle + '.method',
          room.id,
          p.label,
        );
      if (p.kind === 'puzzle')
        remember(
          marks,
          'flag:puzzle.' + p.puzzle + '.done=true',
          room.id,
          p.label,
        );
      if (p.kind === 'loreling')
        remember(
          marks,
          'flag:lor.' + p.loreling + '.friend=true',
          room.id,
          p.label,
        );
      if (p.kind === 'board')
        remember(
          marks,
          'flag:board.' + p.board + '.done=true',
          room.id,
          p.label,
        );
      if (p.kind === 'alcove')
        remember(
          marks,
          'flag:alcove.' + p.alcove + '.ever=true',
          room.id,
          p.label,
        );
      if (p.kind === 'workbench')
        for (const recipe of RECIPES) acquire(recipe.item, room.id, p.label);
      if (p.kind === 'exhibit') {
        const rec = pack.exhibits.find((e) => e.id === p.exhibit);
        if (rec?.grantsCard)
          remember(marks, 'card:' + rec.grantsCard, room.id, p.label);
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
      writes(d.effects, room.id, 'Hear ' + id);
      if (d.next) nodes.push(d.next);
      for (const opt of d.options ?? []) {
        writes(opt.effects, room.id, opt.text);
        if (opt.open?.startsWith('showdown:')) {
          remember(
            marks,
            'flag:sd.' + opt.open.slice('showdown:'.length) + '.outcome',
            room.id,
            opt.text,
          );
        }
        requirements(opt.if, room.id, opt.text);
        if (opt.next) nodes.push(opt.next);
      }
    }
  }
  // Label the observed source action. A condition with several prerequisites may have
  // several possible final actions. Keep those locations when comparing later uses.
  const objectives = new Map(
    pack.missions.flatMap((m) => m.objectives.map((o) => [o.id, o])),
  );
  function originReceipts(condition, trail = new Set()) {
    if (!condition || 'not' in condition) return [];
    if (condition.objective) {
      const id = condition.objective;
      if (trail.has(id)) return [];
      return originReceipts(objectives.get(id)?.done, new Set([...trail, id]));
    }
    if (condition.item)
      return [...(origins.get(condition.item)?.values() ?? [])];
    const key = condition.flagSet
      ? 'flag:' + condition.flagSet
      : condition.flag
        ? 'flag:' +
          condition.flag +
          (condition.eq === undefined ? '' : '=' + JSON.stringify(condition.eq))
        : condition.card
          ? 'card:' + condition.card
          : null;
    if (key) return [...(marks.get(key)?.values() ?? [])];
    return (condition.all ?? condition.any ?? []).flatMap((c) =>
      originReceipts(c, trail),
    );
  }
  for (const { id, done, onComplete } of objectives.values()) {
    if (!onComplete?.some((e) => e.giveItem && items.has(e.giveItem))) continue;
    for (const receipt of originReceipts(done))
      for (const fx of onComplete)
        if (fx.giveItem)
          acquire(fx.giveItem, receipt.map, id + ' · ' + receipt.action);
  }
  for (const k of pack.keepsakes)
    if (keepsakes.has(k.id)) {
      for (const receipt of originReceipts(k.if))
        acquire(k.id, receipt.map, k.name + ' · ' + receipt.action);
    }
  const rows = [...evidence].map(([id, uses]) => ({
    id,
    kind: items.has(id) ? 'item' : 'keepsake',
    name: items.get(id) ?? keepsakes.get(id),
    acquisitions: [...(origins.get(id)?.values() ?? [])],
    uses: [...uses.values()],
  }));
  for (const row of rows) {
    const rooms = new Set(row.acquisitions.map((a) => a.map));
    row.otherRoomUses = row.uses.filter((u) => rooms.size && !rooms.has(u.map));
  }
  const gaps = rows.filter((row) => !row.uses.length);
  const unknown = rows.filter((r) => !r.acquisitions.length);
  const sameRoom = rows.filter(
    (r) => r.acquisitions.length && !r.otherRoomUses.length,
  );
  if (process.argv.includes('--json'))
    console.log(
      JSON.stringify(
        {
          rows,
          gaps: gaps.map((g) => g.id),
          unknown: unknown.map((r) => r.id),
          sameRoom: sameRoom.map((r) => r.id),
        },
        null,
        2,
      ),
    );
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
    console.log(
      rows.length -
        unknown.length -
        sameRoom.length +
        '/' +
        rows.length +
        ' have an action outside their observed acquisition rooms.',
    );
    if (unknown.length)
      console.log(
        'Acquisition awaiting a map action: ' +
          unknown.map((r) => r.id).join(', '),
      );
    if (sameRoom.length)
      console.log(
        'Use beyond acquisition rooms awaiting evidence: ' +
          sameRoom.map((r) => r.id).join(', '),
      );
    if (gaps.length)
      console.log(
        'No mapped use in this scan: ' + gaps.map((row) => row.id).join(', '),
      );
  }
  if (process.argv.includes('--require-all') && (gaps.length || unknown.length || sameRoom.length))
    process.exitCode = 1;
} finally {
  await server.close();
}
