import { setTimeout as delay } from 'node:timers/promises';

/** Navigation stress inside the built game. Debug positions are fixtures for the input tests. */
export async function smokeNavigation(browser, { until, press }, maps) {
  const examined = { tiles: 0, solid: 0, visible: 0, routes: 0, collisionEdges: 0, corners: 0, pointerProbes: 0, approaches: 0 };
  const defects = [];
  const representative = new Set(['nexus.archive', 'aethelgard.emberford', 'aethelgard.ferry', 'sea.shoal', 'water.gatehouse']);
  let held = 0;
  let inspected = 0;
  for (const map of maps) {
    await browser.evaluate(({ id, spawn }) => {
      const game = window.kg;
      game.controller.state.events.next = Number.MAX_SAFE_INTEGER;
      game.world.changeMap(id, spawn.x, spawn.y);
    }, map);
    await until(() => browser.evaluate((id) => window.kg.world?.map.id === id && !window.kg.world.transitioning, map.id), `enter ${map.id}`);
    const observed = await browser.evaluate(({ spawn, walls }) => {
      const { world, controller, ui } = window.kg;
      if (ui.isModalOpen()) ui.closeModal(false);
      const map = world.map;
      const directions = [[-1, 0, 'LEFT'], [0, -1, 'UP'], [1, 0, 'RIGHT'], [0, 1, 'DOWN']];
      const isSolid = (x, y) => world.blocked[y]?.[x] !== false;
      const inMap = (x, y) => x >= 0 && y >= 0 && x < map.width && y < map.height;
      const zoneAt = (x, y) => map.zones.some((zone) => zone.to && x >= zone.x && y >= zone.y && x < zone.x + zone.w && y < zone.y + zone.h);
      const edgeTrials = new Map();
      let corner;
      const problems = [];
      let solid = 0;
      let floorCount = 0;
      for (const [left, top, width, height] of walls) {
        for (let y = top; y < top + height; y++) for (let x = left; x < left + width; x++) {
          if (inMap(x, y) && !isSolid(x, y)) problems.push(`building or wall is walkable at ${x},${y}`);
        }
      }
      for (let y = 0; y < map.height; y++) for (let x = 0; x < map.width; x++) {
        const blocked = isSolid(x, y);
        const floor = map.floor(x, y);
        if (!floor && !blocked) problems.push(`walkable gap at ${x},${y}`);
        if (blocked !== world.collides(x * 16 + 8, y * 16 + 12)) problems.push(`foot collision differs at ${x},${y}`);
        if (blocked) { solid++; continue; }
        floorCount++;
        if (zoneAt(x, y)) continue;
        for (const [dx, dy, direction] of directions) {
          const tx = x + dx, ty = y + dy;
          if (!isSolid(tx, ty) || zoneAt(tx, ty)) continue;
          const type = !inMap(tx, ty) ? 'boundary' : !map.floor(tx, ty) ? 'gap' : 'solid';
          if (!edgeTrials.has(type)) edgeTrials.set(type, { x, y, tx, ty, direction, type });
        }
        if (!corner) for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
          if (!isSolid(x + dx, y + dy) && isSolid(x + dx, y) && isSolid(x, y + dy)) {
            corner = { x, y, dx, dy };
          }
        }
      }
      const visible = map.interactables.filter((prop) => prop.art && (!prop.visibleIf || controller.check(prop.visibleIf)));
      const actual = new Set(visible.map(({ id }) => id));
      for (const prop of map.interactables.filter(({ art }) => art)) {
        const drawing = world.objArt.get(prop.id);
        const openedSeal = prop.kind === 'seal' && controller.state.flags[`trap.${prop.seal}.open`] === true;
        const expected = actual.has(prop.id) && !openedSeal;
        if (!drawing || drawing.visible !== expected) problems.push(`visibility ${prop.id}: ${drawing ? drawing.visible : 'missing'} → ${expected}`);
      }
      for (const actor of map.npcs) {
        const expected = actor.id !== controller.state.companion && (!actor.visibleIf || controller.check(actor.visibleIf));
        const present = world.npcs.some(({ id, sprite }) => id === actor.id && sprite.visible);
        if (expected && !present) problems.push(`visible actor missing at ${actor.x},${actor.y}: ${actor.id}`);
      }
      const reachable = [{ ...spawn }];
      const surveyed = new Set([`${spawn.x},${spawn.y}`]);
      for (let i = 0; i < reachable.length; i++) {
        const { x, y } = reachable[i];
        for (const [dx, dy] of directions) {
          const nx = x + dx, ny = y + dy, mark = `${nx},${ny}`;
          if (isSolid(nx, ny) || surveyed.has(mark)) continue;
          surveyed.add(mark);
          reachable.push({ x: nx, y: ny });
        }
      }
      let routes = 0;
      for (const target of reachable.filter((_, index) => index > 0 && index % Math.max(1, Math.floor(reachable.length / 12)) === 0)) {
        const path = world.bfs(spawn.x, spawn.y, target.x, target.y);
        if (!path?.length || path.some(({ x, y }) => isSolid(x, y))) problems.push(`pathfinder missed or crossed a barrier to ${target.x},${target.y}`);
        else routes++;
      }
      let approaches = 0;
      for (const prop of visible) {
        const adjacent = [];
        for (let x = prop.x; x < prop.x + prop.w; x++) adjacent.push([x, prop.y + prop.h], [x, prop.y - 1]);
        for (let y = prop.y; y < prop.y + prop.h; y++) adjacent.push([prop.x - 1, y], [prop.x + prop.w, y]);
        if (!adjacent.some(([x, y]) => surveyed.has(`${x},${y}`))) continue;
        const [closest] = adjacent.filter(([x, y]) => !isSolid(x, y)).sort(([ax, ay], [bx, by]) =>
          Math.hypot(ax - spawn.x, ay - spawn.y) - Math.hypot(bx - spawn.x, by - spawn.y));
        if (surveyed.has(closest.join(','))) continue;
        approaches++;
        const aim = world.nearestFreeAround(prop);
        if (!aim || !surveyed.has(`${aim.x},${aim.y}`)) problems.push(`pointer selects an unreachable side of ${prop.id}`);
      }
      let pointerProbes = 0;
      for (const test of edgeTrials.values()) {
        const { x, y, tx, ty, direction } = test;
        if (world.bfs(x, y, tx, ty)?.length) problems.push(`path accepted solid target at ${tx},${ty}`);
        world.player.sprite.setPosition(x * 16 + 8, y * 16 + 12);
        world.path = [];
        world.keys[direction].isDown = true;
        try {
          for (const elapsed of [16, 100, 1000, 1000, 16, 1000]) world.update(0, elapsed);
          const pos = world.player.sprite;
          if (Math.floor(pos.x / 16) !== x || Math.floor(pos.y / 16) !== y || world.collides(pos.x, pos.y)) {
            problems.push(`${test.type} movement crossed from ${x},${y} toward ${tx},${ty}`);
          }
        } finally { world.keys[direction].isDown = false; }
        const targetHasProp = map.interactables.some((prop) => tx >= prop.x && tx < prop.x + prop.w && ty >= prop.y - 1 && ty < prop.y + prop.h)
          || world.npcs.some(({ sprite }) => sprite.getBounds().contains(tx * 16 + 8, ty * 16 + 8));
        if (!targetHasProp) {
          world.onPointer({ worldX: tx * 16 + 8, worldY: ty * 16 + 8 });
          pointerProbes++;
          if (world.path.length || world.pendingInteract) problems.push(`pointer accepted solid target at ${tx},${ty}`);
        }
      }
      if (corner) {
        const { x, y, dx, dy } = corner;
        const keys = [dx < 0 ? 'LEFT' : 'RIGHT', dy < 0 ? 'UP' : 'DOWN'].map((direction) => world.keys[direction]);
        world.player.sprite.setPosition(x * 16 + 8, y * 16 + 12);
        for (const key of keys) key.isDown = true;
        try {
          for (let i = 0; i < 60; i++) world.update(0, i % 2 === 0 ? 16 : 1000);
          const pos = world.player.sprite;
          if (Math.floor(pos.x / 16) !== x || Math.floor(pos.y / 16) !== y || world.collides(pos.x, pos.y)) {
            problems.push(`diagonal movement cut through a closed corner at ${x},${y}`);
          }
        } finally { for (const key of keys) key.isDown = false; }
      }
      return { tiles: floorCount + solid, solid, visible: visible.length, routes, corners: corner ? 1 : 0, pointerProbes, approaches, edgeTrials: [...edgeTrials.values()], problems };
    }, map);
    for (const key of ['tiles', 'solid', 'visible', 'routes', 'corners', 'pointerProbes', 'approaches']) examined[key] += observed[key];
    examined.collisionEdges += observed.edgeTrials.length;
    if (observed.problems.length) defects.push(...observed.problems.map((message) => `${map.id}: ${message}`));
    if (representative.has(map.id) && observed.edgeTrials.length) {
      const test = observed.edgeTrials.find(({ type }) => type === 'gap') ?? observed.edgeTrials[0];
      await holdAgainstEdge(browser, press, test, map.id);
      held++;
    }
    if (++inspected % 24 === 0) console.log(`Checked ${inspected}/${maps.length} maps through ${map.id}.`);
  }
  console.log(`Navigation registry: ${maps.length} maps, ${examined.tiles} tiles (${examined.solid} solid), ${examined.visible} shown prop frames, ${examined.routes} sampled routes, ${examined.collisionEdges} forced boundary probes, ${examined.corners} diagonal corner probes, ${examined.pointerProbes} rejected pointer targets, ${examined.approaches} alternative approaches, ${held} keyboard edge checks.`);
  await wallSoak(browser, until);
  await smokePortalReturn(browser, { until });
  await smokeFerryFocus(browser, { until });
  for (const defect of defects) console.log('FAIL', defect);
  if (defects.length) throw new Error(`${defects.length} navigation and visibility discrepancies`);
}

export async function smokePortalReturn(browser, { until }) {
  // Supply the two portal prerequisites. The crossings themselves use Phaser input and fades.
  await browser.evaluate(() => {
    const { world, controller, settings } = window.kg;
    settings.reducedMotion = false;
    controller.state.events.next = Number.MAX_SAFE_INTEGER;
    controller.state.objectivesDone.push('m01.o6.label');
    controller.state.flags['seal.found'] = true;
    world.changeMap('aethelgard.emberford', 20, 26);
  });
  const state = () => browser.evaluate(() => {
    const { world } = window.kg;
    const { x, y } = world.player.sprite;
    return { id: world.map.id, transition: world.transitioning, tileY: Math.floor(y / 16), solid: world.collides(x, y) };
  });
  await until(async () => (await state()).id === 'aethelgard.emberford', 'south approach to Emberford portal');
  const arrow = (key, type, autoRepeat = false) => {
    const code = key === 'ArrowUp' ? 38 : 40;
    return browser.send('Input.dispatchKeyEvent', { key, code: key, type, autoRepeat, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code });
  };
  try {
    await arrow('ArrowUp', 'rawKeyDown');
    await until(async () => {
      await arrow('ArrowUp', 'rawKeyDown', true);
      const current = await state();
      return current.id === 'nexus.archive' && !current.transition;
    }, 'held Up crosses into the Nexus');
    await until(async () => {
      await arrow('ArrowUp', 'rawKeyDown', true);
      const current = await state();
      if (current.id !== 'nexus.archive' || current.transition) throw new Error('Held Up started a return crossing without a new press.');
      return current.tileY <= 4 && !current.solid;
    }, 'held Up reaches the old portal without a return crossing');
  } finally { await arrow('ArrowUp', 'keyUp'); }
  try {
    await arrow('ArrowDown', 'rawKeyDown');
    await until(async () => (await state()).tileY >= 6, 'step away from the portal');
  } finally { await arrow('ArrowDown', 'keyUp'); }
  try {
    await arrow('ArrowUp', 'rawKeyDown');
    await until(async () => (await state()).id === 'aethelgard.emberford', 'new approach deliberately crosses the portal');
  } finally { await arrow('ArrowUp', 'keyUp'); }
  console.log('PASS held Up across the Emberford fade does not bounce; a fresh approach deliberately crosses back. Both story prerequisites staged.');
}

export async function smokeFerryFocus(browser, { until }) {
  const movement = (key, type, sessionId) => {
    const code = key === 'ArrowDown' ? 40 : 39;
    return browser.send('Input.dispatchKeyEvent', { key, code: key, type, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }, sessionId);
  };
  const previousMotion = await browser.evaluate(() => {
    const { world, settings } = window.kg;
    const saved = settings.reducedMotion;
    settings.reducedMotion = true;
    world.changeMap('aethelgard.ferry', 6, 6);
    return saved;
  });
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'aethelgard.ferry' && !window.kg.world.transitioning), 'ferry focus fixture');
  const start = await browser.evaluate(() => {
    const { world } = window.kg;
    const x = [6, 7, 15, 20].find((x) => !world.map.floor(x, 9) && [6, 7, 8].every((y) => world.blocked[y]?.[x] === false)
      && [6, 7].every((y) => world.blocked[y]?.[x + 1] === false));
    if (x === undefined) throw new Error('Ferry focus fixture needs a clear approach to the water.');
    const point = { x: x * 16 + 8, y: 6 * 16 + 12 };
    world.player.sprite.setPosition(point.x, point.y);
    return point;
  });
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', background: true });
  try {
    const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
    await browser.send('Page.bringToFront');
    await until(() => browser.evaluate(() => document.hasFocus() && document.visibilityState === 'visible'), 'foreground ferry tab');
    await browser.evaluate(() => {
      const controller = new AbortController();
      const probe = { controller, blur: false, focus: false, downReleases: 0 };
      window.ferryFocusProbe = probe;
      const options = { signal: controller.signal };
      window.addEventListener('blur', (event) => { probe.blur ||= event.isTrusted; }, options);
      window.addEventListener('focus', (event) => { probe.focus ||= event.isTrusted; }, options);
      window.addEventListener('keyup', (event) => {
        if (event.isTrusted && event.key === 'ArrowDown') probe.downReleases++;
      }, options);
    });
    const state = () => browser.evaluate(() => {
      const { world, ui } = window.kg;
      const { x, y } = world.player.sprite;
      const { blur, focus, downReleases } = window.ferryFocusProbe;
      return { x, y, blur, focus, downReleases, frame: world.game.loop.frame, map: world.map.id,
        focused: document.hasFocus(), visibility: document.visibilityState, modal: ui.isModalOpen(),
        down: world.keys.DOWN.isDown, right: world.keys.RIGHT.isDown, solid: world.collides(x, y) };
    });
    await movement('ArrowDown', 'rawKeyDown');
    await until(async () => {
      const current = await state();
      if (current.y >= 8 * 16 || current.solid) throw new Error('Reached the bank before the focus change could expose stale movement.');
      return current.down && current.y > start.y + 1;
    }, 'Down walking toward the ferry bank');
    await browser.send('Page.bringToFront', {}, sessionId);
    const hidden = await until(async () => {
      const current = await state();
      return current.blur && !current.focused && current.visibility === 'hidden' && current;
    }, 'native blur with Down held');
    if (hidden.down) throw new Error('Down stayed held while the ferry tab was hidden.');
    await browser.evaluate(() => {
      window.addEventListener('keyup', (event) => {
        window.receivedAwayRelease = event.key === 'ArrowDown' && event.isTrusted;
      }, { once: true });
    }, undefined, sessionId);
    await movement('ArrowDown', 'keyUp', sessionId);
    await until(() => browser.evaluate(() => window.receivedAwayRelease === true, undefined, sessionId), 'trusted release in the other tab');
    await browser.send('Page.bringToFront');
    const returned = await until(async () => {
      const current = await state();
      return current.focus && current.focused && current.visibility === 'visible' && current.frame >= hidden.frame + 8 && current;
    }, 'ferry focus restored and game ticking again');
    if (returned.map !== 'aethelgard.ferry' || returned.modal || returned.solid || returned.down || returned.downReleases
      || returned.x !== hidden.x || returned.y !== hidden.y) {
      throw new Error('Focus return moved the player or delivered the release to the wrong tab: ' + JSON.stringify({ hidden, returned }));
    }
    await movement('ArrowRight', 'rawKeyDown');
    try {
      await until(async () => {
        const current = await state();
        if (current.map !== returned.map || current.solid || current.down || current.y !== returned.y) {
          throw new Error('Old Down input leaked into fresh Right input.');
        }
        return current.right && current.x > returned.x + 4;
      }, 'fresh Right walks along the bank');
    } finally { await movement('ArrowRight', 'keyUp'); }
    const stopped = await until(async () => {
      const current = await state();
      return !current.right && current;
    }, 'fresh Right releases');
    await until(async () => {
      const current = await state();
      if (current.x !== stopped.x || current.y !== stopped.y || current.solid) throw new Error('The player moved after Right released.');
      return current.frame >= stopped.frame + 6;
    }, 'six stationary frames after release');
    console.log('PASS trusted Ferry tab blur clears held Down without its key-up; fresh Right walks safely and releases.');
  } finally {
    await browser.send('Page.bringToFront');
    await browser.send('Target.closeTarget', { targetId });
    await browser.evaluate((reducedMotion) => {
      window.ferryFocusProbe?.controller.abort();
      delete window.ferryFocusProbe;
      window.kg.settings.reducedMotion = reducedMotion;
    }, previousMotion);
  }
}

async function holdAgainstEdge(browser, press, { x, y, direction }, mapId) {
  const labels = { LEFT: ['ArrowLeft', 37], UP: ['ArrowUp', 38], RIGHT: ['ArrowRight', 39], DOWN: ['ArrowDown', 40] };
  const [key, code] = labels[direction];
  await browser.evaluate(({ x, y }) => {
    const world = window.kg.world;
    world.player.sprite.setPosition(x * 16 + 8, y * 16 + 12);
    world.path = [];
  }, { x, y });
  const event = { key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code };
  try {
    await browser.send('Input.dispatchKeyEvent', { ...event, type: 'rawKeyDown' });
    await new Promise((resolve) => setTimeout(resolve, 340));
  } finally { await browser.send('Input.dispatchKeyEvent', { ...event, type: 'keyUp' }); }
  if (!await browser.evaluate(({ x, y, mapId }) => {
    const w = window.kg.world;
    const { x: px, y: py } = w.player.sprite;
    return w.map.id === mapId && Math.floor(px / 16) === x && Math.floor(py / 16) === y && !w.collides(px, py);
  }, { x, y, mapId })) throw new Error(`Actual held key crossed ${mapId} at ${x},${y}`);
  const old = await browser.evaluate(() => ({ x: window.kg.world.player.sprite.x, y: window.kg.world.player.sprite.y }));
  for (let i = 0; i < 8; i++) {
    await press(browser, ' ');
    await browser.evaluate(() => { if (window.kg.ui.isModalOpen()) window.kg.ui.closeModal(false); });
  }
  if (!await browser.evaluate(({ x, y, mapId }) => {
    const w = window.kg.world;
    return w.map.id === mapId && w.player.sprite.x === x && w.player.sprite.y === y;
  }, { ...old, mapId })) throw new Error(`Repeated jump attempts moved the player at ${mapId} ${x},${y}`);
}

async function wallSoak(browser, until) {
  await browser.evaluate(() => window.kg.world.changeMap('nexus.archive', 2, 8));
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'nexus.archive' && !window.kg.world.transitioning), 'Nexus wall soak');
  const result = await browser.evaluate(() => {
    const { world, controller, settings, ui } = window.kg;
    controller.state.events.next = Number.MAX_SAFE_INTEGER;
    controller.state.flags['talent.pace'] = true;
    settings.sfxVolume = 1;
    if (ui.isModalOpen()) ui.closeModal(false);
    world.player.sprite.setPosition(24, 140);
    world.keys.LEFT.isDown = true;
    world.path = [];
    const sound = world.sound.play;
    let footsteps = 0;
    world.sound.play = function (key, config) {
      if (key === 'sfx.step') { footsteps++; return false; }
      return sound.call(this, key, config);
    };
    try {
      for (let frame = 0; frame < 20; frame++) world.update(0, 100);
      const { x, y } = world.player.sprite;
      footsteps = 0;
      const trailBefore = world.trail.length;
      for (let frame = 0; frame < 36_000; frame++) world.update(frame * 100, 100);
      return { stayed: world.player.sprite.x === x && world.player.sprite.y === y, footsteps, trailBefore, trailAfter: world.trail.length,
        movingArt: world.player.sprite.anims.isPlaying, trapped: world.collides(x, y) };
    } finally { world.keys.LEFT.isDown = false; world.sound.play = sound; }
  });
  if (!result.stayed || result.footsteps || result.movingArt || result.trapped || result.trailBefore !== result.trailAfter) {
    throw new Error(`Simulated hour against the archive wall failed: ${JSON.stringify(result)}`);
  }
  console.log('PASS simulated hour of held movement against the solid archive wall with no repeated footstep sounds or walking animation.');
}

export async function smokeWallRealtime(browser, { until }) {
  const minutes = Number(process.env.KG_SOAK_MINUTES ?? 60);
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('KG_SOAK_MINUTES must be positive.');
  await browser.evaluate(() => window.kg.world.changeMap('nexus.archive', 2, 8));
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'nexus.archive' && !window.kg.world.transitioning), 'real-time wall soak');
  await browser.evaluate(() => {
    const { world, controller, settings, ui } = window.kg;
    controller.state.events.next = Number.MAX_SAFE_INTEGER;
    controller.state.flags['talent.pace'] = true;
    settings.sfxVolume = 1;
    if (ui.isModalOpen()) ui.closeModal(false);
    world.player.sprite.setPosition(24, 140);
    world.path = [];
    const play = world.sound.play;
    window.soakStepCount = 0;
    world.sound.play = function (key, config) {
      if (key === 'sfx.step') window.soakStepCount++;
      return play.call(this, key, config);
    };
  });
  const sample = () => browser.evaluate(() => {
    const { world } = window.kg;
    const { x, y, anims } = world.player.sprite;
    return { x, y, map: world.map.id, frame: world.game.loop.frame, held: world.keys.LEFT.isDown,
      solid: world.collides(x, y), walking: anims.isPlaying, steps: window.soakStepCount,
      trail: world.trail.length };
  });
  const key = { key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37, nativeVirtualKeyCode: 37 };
  await browser.send('Input.dispatchKeyEvent', { ...key, type: 'rawKeyDown' });
  let before;
  try {
    before = await until(async () => {
      const current = await sample();
      return current.map === 'nexus.archive' && current.x < 23 && !current.solid && !current.walking && current.held && current;
    }, 'held left key settled against the archive wall');
    const started = performance.now();
    const deadline = started + minutes * 60_000;
    let progress = started;
    let frame = before.frame;
    console.log(`Started actual held-key wall soak for ${minutes} minutes.`);
    while (performance.now() < deadline) {
      await delay(Math.max(0, Math.min(10_000, deadline - performance.now())));
      const current = await sample();
      if (!current.held || current.map !== before.map || current.x !== before.x || current.y !== before.y || current.walking ||
          current.solid || current.steps !== before.steps || current.trail !== before.trail || current.frame <= frame) {
        throw new Error(`Held-key soak diverged from ${JSON.stringify(before)} to ${JSON.stringify(current)}`);
      }
      frame = current.frame;
      if (performance.now() - progress >= 300_000) {
        console.log(`Still solid after ${Math.floor((performance.now() - started) / 60_000)} real minutes, ${frame - before.frame} frames observed.`);
        progress = performance.now();
      }
    }
  } finally { await browser.send('Input.dispatchKeyEvent', { ...key, type: 'keyUp' }); }
  const right = { key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 };
  try {
    await browser.send('Input.dispatchKeyEvent', { ...right, type: 'rawKeyDown' });
    await until(async () => (await sample()).x > before.x + 10, 'move away from wall after soak');
  } finally { await browser.send('Input.dispatchKeyEvent', { ...right, type: 'keyUp' }); }
  console.log(`PASS ${minutes} actual minutes of one continuous movement key against the archive wall, followed by normal movement away.`);
}

/** File the approved folio while the reader and both desks are on screen in one room. */
export async function smokeCallboardReader(browser, { press, until }) {
  await browser.evaluate(() => {
    const { controller, world } = window.kg;
    controller.state.objectivesDone.push('date-register.maize-bundle.civic');
    controller.state.inventory['item.date-register.maize-bundle.folio'] = 1;
    world.changeMap('civic.callboard', 19, 34);
  });
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'civic.callboard' && !window.kg.world.transitioning), 'enter the reading room');
  const position = () => browser.evaluate(() => {
    const { world } = window.kg;
    return {
      readers: world.npcs.filter((a) => a.id === 'callboard-reader').map((a) => [Math.floor(a.sprite.x / 16), Math.floor(a.sprite.y / 16)]),
      first: world.collides(7 * 16 + 8, 33 * 16 + 12), second: world.collides(33 * 16 + 8, 32 * 16 + 12),
    };
  });
  const expectPlace = async (x, y, first, second) => {
    const seen = await position();
    const expected = x === null ? [] : [[x, y]];
    if (JSON.stringify(seen.readers) !== JSON.stringify(expected) || seen.first !== first || seen.second !== second) {
      throw new Error('Reading room actor and solid footprint disagree: ' + JSON.stringify(seen));
    }
  };
  await expectPlace(7, 33, true, false);
  await browser.evaluate(() => {
    const { world } = window.kg;
    const reader = world.npcs.find((actor) => actor.id === 'callboard-reader');
    world.onPointer({ worldX: reader.sprite.x, worldY: reader.sprite.y - 6 });
    if (!world.pendingInteract || !world.path.length) throw new Error('Reader click did not queue a walk across the room');
    world.tryInteract({ kind: 'obj', obj: world.map.interactables.find((p) => p.id === 'callboard-seal-folio') });
  });
  await until(() => browser.evaluate(() => document.activeElement?.textContent.includes('File the signed folio')), 'signed folio choice is focused');
  await press(browser, 'Enter');
  await until(() => browser.evaluate(() => window.kg.controller.state.flags['callboard.shortcut'] === true), 'signed passage opens');
  await expectPlace(33, 32, false, true);
  const stillWalking = await browser.evaluate(() => Boolean(window.kg.world.pendingInteract || window.kg.world.path.length));
  if (stillWalking) throw new Error('Queued approach still points to the bench the reader left');

  // A staged boundary case puts the player's feet in the reader's future position.
  await browser.evaluate(() => {
    const { world, ui, controller } = window.kg;
    ui.closeModal();
    controller.state.flags['callboard.shortcut'] = false;
    world.refreshWorld();
    world.player.sprite.setPosition(33 * 16 + 8, 32 * 16 + 12);
    controller.state.flags['callboard.shortcut'] = true;
    world.refreshWorld();
  });
  await expectPlace(null, null, false, false);
  await browser.evaluate(() => { window.kg.world.player.sprite.setPosition(32 * 16 + 8, 32 * 16 + 12); });
  await until(async () => (await position()).second, 'reader takes the cleared space on a later animation frame');
  await expectPlace(33, 32, false, true);
  await browser.evaluate(() => {
    const { world, controller } = window.kg;
    controller.state.flags['memory-cart.first'] = 'wheel';
    world.changeMap('aethelgard.emberford', 19, 16);
  });
  await until(() => browser.evaluate(() => window.kg.world.map.id === 'aethelgard.emberford' && !window.kg.world.transitioning), 'Emberford with Edrin present');
  const priority = await browser.evaluate(() => {
    const ids = window.kg.world.npcs.map((actor) => actor.id);
    return ids.includes('memory-cart-edrin') && ids.indexOf('memory-cart-edrin') < ids.indexOf('scholar-sefa');
  });
  if (!priority) throw new Error('Edrin lost his authored priority where targets meet');
  console.log('PASS signed-folio move, both footprints, abandoned pointer target, occupied destination and authored target order.');
}
