/** Integrated browser checks for physical cases, reading routes and the saved collection. */
export async function smokeCollections(browser, { button, press, until }) {
  async function see(text) {
    await until(() => browser.evaluate((words) => document.querySelector('[role="dialog"]')?.textContent.includes(words), text), text);
  }
  async function map(id) {
    await until(() => browser.evaluate((target) => window.kg.world.map.id === target && !window.kg.world.transitioning, id), 'world ' + id);
  }
  async function close() {
    await press(browser, 'Escape');
    await until(() => browser.evaluate(() => !document.querySelector('[role="dialog"]')), 'dialog closes');
  }
  async function at(id) {
    const path = await browser.evaluate((target) => {
      const world = window.kg.world;
      const prop = world.map.interactables.find((entry) => entry.id === target);
      if (!prop || !window.kg.controller.check(prop.visibleIf)) throw new Error('Unreachable or hidden fixture ' + target);
      const start = [Math.floor(world.player.sprite.x / 16), Math.floor(world.player.sprite.y / 16)];
      const stands = [];
      for (let x = prop.x; x < prop.x + prop.w; x++) {
        stands.push({ x, y: prop.y - 1, facing: 'down' }, { x, y: prop.y + prop.h, facing: 'up' });
      }
      for (let y = prop.y; y < prop.y + prop.h; y++) {
        stands.push({ x: prop.x - 1, y, facing: 'right' }, { x: prop.x + prop.w, y, facing: 'left' });
      }
      return stands.filter(({ x, y }) => world.blocked[y]?.[x] === false)
        .map((place) => ({ ...place, length: world.bfs(...start, place.x, place.y)?.length }))
        .filter(({ length }) => length !== undefined).sort((a, b) => a.length - b.length);
    }, id);
    for (const place of path) {
      await browser.evaluate(({ x, y }) => window.kg.world.walkTo(x, y, null), place);
      try {
        await until(() => browser.evaluate(({ x, y }) => {
          const world = window.kg.world;
          return !world.path.length && Math.floor(world.player.sprite.x / 16) === x && Math.floor(world.player.sprite.y / 16) === y;
        }, place), 'walk to ' + id, 28_000);
      } catch (error) {
        const position = await browser.evaluate(() => {
          const world = window.kg.world;
          return { map: world.map.id, x: Math.floor(world.player.sprite.x / 16), y: Math.floor(world.player.sprite.y / 16),
            remaining: world.path.length, modal: document.querySelector('[role="dialog"]')?.getAttribute('aria-label') };
        });
        throw new Error(error.message + ' · ' + JSON.stringify({ position, destination: place }));
      }
      const found = await browser.evaluate(({ id, facing }) => {
        const world = window.kg.world;
        world.player.facing = facing;
        world.updateTarget();
        return world.target?.obj?.id === id;
      }, { id, facing: place.facing });
      if (!found) continue;
      await press(browser, 'e');
      return;
    }
    throw new Error('Could not select ' + id + ' from its approaches');
  }
  async function door(prop, destination) {
    await at(prop);
    await map(destination);
  }
  async function absence(label) {
    const absent = await browser.evaluate((text) =>
      ![...document.querySelectorAll('[role="dialog"] button')].some((control) => !control.disabled && control.textContent.trim().startsWith(text)), label);
    if (!absent) throw new Error('Unexpected early control ' + label);
  }

  // Stage just the already-logged prior chapters for this short representative smoke.
  // No collection action, receiver, equipped state or visit in this suite is pre-filled.
  await browser.evaluate(() => {
    const { controller, world, settings } = window.kg;
    controller.state.objectivesDone.push('m02.o8.ise', 'preserved.publish');
    controller.state.flags['study.letter'] = true;
    controller.state.flags['nile.returned'] = true;
    settings.calmMode = true;
    world.changeMap('nexus.archive', 38, 14);
  });
  await map('nexus.archive');
  console.log('Collection fixture stages prior chapter deeds and starts by the Cold Store door. Collection actions and doors use the game controls.');

  await door('preserved-door', 'preserved.archive');
  await door('cold-glass-rack-door', 'preserved.glass-rack');

  const records = [
    { slug: '1988-75', accession: '1988.75', title: 'Brush Holder with Figures in Landscape and Poetic Inscription by Wang Meilin from Jiading', layout: 'rail', path: 'turn' },
    { slug: '1991-120', accession: '1991.120', title: 'Poem Card Box with Lid', layout: 'pocket', path: 'open' },
  ];
  for (const record of records) {
    await at('glass-case-' + record.slug);
    await see(record.accession);
    await absence('Take this object');
    await close();

    await at('glass-frame-' + record.slug);
    await button(browser, 'Set the whole view');
    await absence('Send both to the broad rail');
    await button(browser, record.path === 'turn' ? 'Turn to the other side' : 'Open the view of the parts');
    await until(() => browser.evaluate((slug) => document.querySelector(`img[src$="glass-${slug}-other.jpg"]`)?.naturalWidth > 0,
      record.slug), 'second licensed photo ' + record.accession);
    await button(browser, 'Return to the whole view');
    await button(browser, record.layout === 'rail' ? 'Send both to the broad rail' : 'Fit a hinged pocket');
    await close();

    await at('glass-rack-' + record.layout);
    if (record.layout === 'rail') await button(browser, 'Set both photos side by side and leave the source tab');
    else {
      await absence('Close the flap');
      await button(browser, 'Lift the pocket flap for the other view');
      await button(browser, 'Close the flap and keep the case number');
    }
    await close();

    await at('glass-case-' + record.slug);
    await button(browser, 'Take this object');
    await see('In your satchel.');
    await absence('Take this object');
    await close();
  }

  await door('glass-rack-return', 'preserved.archive');
  await door('preserved-door-nexus', 'nexus.archive');
  await press(browser, 'j');
  await button(browser, 'Sources');
  await until(() => browser.evaluate((accessions) => {
    const links = [...document.querySelectorAll('[role="dialog"] a[href]')];
    return accessions.every((id) => links.some(({ href }) => { const url = new URL(href); return /^(www\.)?clevelandart\.org$/.test(url.hostname) && url.pathname === '/art/' + id; })) && links.length === accessions.length;
  }, records.map(({ accession }) => accession)), 'two exact earned source links');
  await close();
  await until(() => browser.evaluate(() => {
    const bag = document.querySelector('.hud button[title^="Bag"]');
    if (!bag) return false;
    bag.click();
    return true;
  }), 'open the Bag from the game menu');
  await until(() => browser.evaluate((name) => {
    const use = [...document.querySelectorAll('[role="dialog"] button')].find((control) =>
      !control.disabled && control.textContent.trim().startsWith('Use ' + name));
    if (!use) return false;
    use.click();
    return true;
  }, records[0].title), 'equip named collected object');
  await close();
  await door('specimen-vault-door', 'nexus.specimen-vault');
  await at('specimen-vault-arch');
  await see(records[0].title);
  await absence('Return to Nile Archive');
  await close();

  await press(browser, 'Escape');
  await button(browser, 'Save and leave');
  await button(browser, 'Continue');
  await button(browser, 'Continue playing');
  await map('nexus.specimen-vault');
  await at('specimen-vault-arch');
  await see(records[0].title);
  await button(browser, 'Return where I found it');
  await map('preserved.glass-rack');

  await door('glass-rack-return', 'preserved.archive');
  await door('preserved-door-nexus', 'nexus.archive');
  await door('door-without-a-name', 'nile.hall');
  await door('nile-maps', 'nile.route');
  await at('nile-glass-double');
  await button(browser, 'Set the whole frame against the old board');
  await button(browser, 'Turn the other face toward the return path');
  await button(browser, 'Leave both views on the board');
  await close();
  await at('nile-glass-reader-board');
  await see(records[0].title);
  await close();
  await door('route-back', 'nile.hall');
  await door('nile-nexus', 'nexus.archive');
  await door('specimen-vault-door', 'nexus.specimen-vault');
  await at('specimen-vault-arch');
  await button(browser, 'Return to Nile Archive: Map Room');
  await map('nile.route');
  console.log('PASS production collection controls, distinct glass branches, earned source links, save/reopen and visited return routes');
}
