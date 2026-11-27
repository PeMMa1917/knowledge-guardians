import assert from 'node:assert/strict';

/** Enter each chapter at its lamp, then use its ordinary controls and exits. */
export async function playLastBell({ page, engine, waitMap, use, close, button, sites, posts }) {
  const siteById = (id) => sites.find((s) => s.id === id);
  async function visit(id, heading) {
    const post = posts.find((s) => s.id === id);
    if ((await page.evaluate(() => kg.world.map.id)) !== post.map) {
      await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), post);
      await waitMap(post.map);
    }
    await use('lamplight.' + id + '.bench');
    await page.locator('.last-bell summary').filter({ hasText: heading }).click();
    return page.locator('.last-bell[open]');
  }
  for (const [id, title, labels] of [
    ['gate', 'A bell for the empty cradle', ['Clip at 2 marks', 'Clip at 5 marks', 'Leave the high clip']],
    [
      'dispatch',
      'The four windows that answered',
      [
        'Stretch the cord over replies',
        'Stretch the cord over the whole rota',
        'Send the runner to the dark windows now',
      ],
    ],
  ]) {
    const post = posts.find((p) => p.id === id);
    await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), post);
    await waitMap(post.map);
    await use('lamplight.' + id + '.bench');
    await page.locator('summary').filter({ hasText: title }).click();
    for (const label of labels) await button(label);
    await close();
  }
  let panel = await visit('voices', 'The bell in the kitchen');
  await button('Follow W–17');
  await panel.getByText(/Wren recorded the loan/).waitFor();
  const spin = () => panel.getByRole('button', { name: 'Wind the cylinder' }).click();
  await panel.getByLabel('Start stop').selectOption('2');
  await spin();
  await panel.getByText('Keep the end stop at or beyond the start.').waitFor();
  await panel.getByLabel('Start stop').selectOption('0');
  await spin();
  await panel.getByLabel('End stop').selectOption('2');
  await spin();
  await panel.getByText('From our room I couldn’t hear the tower.', { exact: false }).first().waitFor();
  for (const publication of ['Send the whole groove', 'Pin the wording']) await button(publication);
  await close();

  panel = await visit('island', 'The runner with one pair of boots');
  const fog = panel.getByLabel('Tower shutter'),
    runner = panel.getByLabel('First knock');
  const send = () => panel.getByRole('button', { name: 'Send the signal and runner' }).click();
  await send();
  await fog.selectOption('1');
  await send();
  await runner.selectOption('1');
  await send();
  await panel.getByRole('button', { name: 'Next beat' }).click();
  await panel.getByRole('slider').focus();
  await page.keyboard.press('End');
  await panel
    .getByText('Beat 5. Tower hidden. Kiln yard warned. Sail loft warned. Crossing closed.', { exact: true })
    .waitFor();
  await button('Send Joss to the sail loft first');
  await close();
  await use('last-bell-footpath');
  await waitMap('island.hinged-plank');
  async function walkToBridgeProp(id) {
    await page.evaluate((id) => {
      const world = kg.world;
      const prop = world.map.interactables.find((item) => item.id === id);
      if (!prop || (prop.visibleIf && !kg.controller.check(prop.visibleIf))) {
        throw Error('Unavailable bridge stop ' + id);
      }
      // Enter through the same world-coordinate handler as a tap. Let the character
      // walk there and let the arrival callback open the sign or use the door.
      world.onPointer({ worldX: (prop.x + 0.5) * 16, worldY: (prop.y + 0.3) * 16 });
    }, id);
  }
  for (const mark of ['start', 'out', 'back']) {
    await walkToBridgeProp('last-bell-bridge-' + mark);
    await page.getByRole('dialog').waitFor({ timeout: 45000 });
    assert.equal(await page.evaluate((m) => kg.controller.state.flags['last-bell.bridge.' + m], mark), true);
    await close();
  }
  await walkToBridgeProp('last-bell-back-to-model');
  await waitMap('island.workshop');
  panel = await visit('island', 'The runner with one pair of boots');
  await button('Tie the walked times');
  await runner.selectOption('0');
  await send();
  await panel
    .getByText(/Sail loft at beat 4, as the crossing shut/)
    .first()
    .waitFor();
  await button('Send Joss to the kiln yard first');
  await close();

  panel = await visit('council', 'A chair on the other side');
  await button('Lay Kitchen testimony');
  await button('Lay Runner’s chart');
  await panel
    .getByText(/let me find a way to you with that light gone/)
    .first()
    .waitFor();
  await button('Leave the chair with the families');
  await button('Lay Kitchen testimony');
  await panel
    .getByText(/line getting to our door/)
    .first()
    .waitFor();
  await button('Give the dawn shift a public trial');
  const minute = await page.evaluate(() => kg.controller.state.flags['last-bell.council.minute']);
  assert.ok(
    minute.includes('unsigned slip') &&
      minute.includes('as the crossing shut') &&
      minute.includes('first light'),
  );
  await panel.locator('summary').filter({ hasText: 'Two empty lines at dawn' }).click();
  await button('Let the households design the next trial');
  await button('Repeat the crossing with both houses watching');
  assert.ok(
    await page.evaluate(() =>
      kg.controller.state.flags['last-bell.council.addendum'].includes('2 missed floods'),
    ),
  );
  const scrollOK = await panel.evaluate((p) => p.scrollWidth <= p.clientWidth + 1);
  assert.ok(scrollOK, engine + ' clipped the tool');
  await close();
  panel = await visit('voices', 'The bell in the kitchen');
  await panel.getByText(/dawn ticket hangs/).waitFor();
  await close();
  // Work interrupted at a historical guest's instrument can be picked up at either station.
  const first = siteById('archive'),
    post = posts.find((s) => s.id === 'archive');
  await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), post);
  await waitMap(post.map);
  await use('ink-post.archive');
  await button('call a guest to the lantern');
  const name = 'Mary Wollstonecraft';
  await page.getByRole('searchbox').fill(name);
  await button(name + ' ·');
  await page.locator('[data-lantern-piece="0"]').click();
  await close();
  await use('ink-post.archive');
  await button('call a guest to the lantern');
  await button('Resume my work with ' + name);
  await page.locator('[data-lantern-piece="1"]').click();
  const guestFolds = page.locator('.lamplight .options > button');
  await guestFolds.first().click();
  await close();
  await use('lamplight.archive.bench');
  await button('Deliver my tracing to ' + name);
  await button(first.uses[0].action);
  await close();
  await page.evaluate(() => kg.world.changeMap('nile.hall', 11, 13));
  await waitMap('nile.hall');
  await use('ink-post.nile');
  await button('call a guest to the lantern');
  await page.getByRole('searchbox').fill(name);
  await button(name + ' ·');
  await page.locator('summary').filter({ hasText: 'Unpack a tracing from another chapter' }).click();
  await button('Set the pieces from Archive Hall');
  await page.locator('[data-lantern-piece="2"]').click();
  await page.getByText(/we have tried the missing piece/i).waitFor();
  await page.locator('.lamplight .options > button').last().click();
  await close();
  await use('lamplight.nile.bench');
  await button('Deliver my tracing to ' + name);
  await button(siteById('nile').uses[1].action);
  assert.ok(
    await page.evaluate(() =>
      Object.values(kg.controller.permanent.skills)
        .flat()
        .some((use) => use.includes('lamplight.nile.q101638.rechecked')),
    ),
  );
  await close();
  console.log(
    'PASS',
    engine,
    'ordered hearing, two public decisions, field measurements, returning guest and narrow-screen layout',
  );
}
