import assert from 'node:assert/strict';
export async function playSupperShadow({
  page,
  engine,
  use,
  button,
  waitMap,
  close,
}) {
  const room = 'copies.supper-room';
  const popup = page.getByRole('dialog');
  const root = popup.locator('.supper-theatre');
  // These possessions come from independently tested quests. The supper decisions start untouched.
  await page.evaluate(() => {
    const c = kg.controller;
    kg.settings.reducedMotion = true;
    for (const key of [
      'item.journal',
      'item.tea',
      'tool.annotation-pen',
      'item.gold-seal',
      'item.town-map',
      'item.sill.claim-slip',
      'item.island.proof-rack.paired-views.receipt',
      'item.island.proof-rack.scale-bar.receipt',
    ])
      c.state.inventory[key] = 1;
    c.state.flags['thinker.haytham.test.tube'] = true;
    kg.world.changeMap('copies.landing', 12, 12);
  });
  await waitMap('copies.landing');
  await use('supper-hatch');
  await waitMap(room);
  const at = async (selector, phrase) => {
    await use(selector);
    await button(phrase);
    await popup
      .getByRole('button', { name: 'Close', exact: true })
      .last()
      .click();
  };
  await use('otla-rusk');
  await button('what Otla actually saw');
  await popup.getByText(/bottom of the soup pot/).waitFor();
  await close();
  await use('supper-lamps');
  const cast = async (name) => {
    const control = root.getByRole('button', { name, exact: true });
    await control.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      (n) =>
        Array.from(document.querySelectorAll('.supper-theatre button'))
          .find((e) => e.textContent === n)
          ?.getAttribute('aria-pressed') === 'true',
      name,
    );
  };
  await cast('Both side lamps');
  await cast('Trace the edges in chalk');
  const original = await root.locator('[role=status]').innerText();
  assert.equal(await root.locator('.supper-spoon').count(), 2);
  await cast('Hang the pair');
  await cast('Middle lamp');
  assert.equal(await root.locator('[role=status]').innerText(), original);
  await cast('Show the lamplight');
  await root.getByText(/cuts off all the light/).waitFor();
  await cast('Hang one spoon');
  await cast('Both side lamps');
  await root.getByText(/catches light from the other lamp/).waitFor();
  const scr = root.locator('.supper-screen');
  await scr.scrollIntoViewIfNeeded();
  if (process.env.KG_SUPPER_SHOT)
    await scr.screenshot({ path: process.env.KG_SUPPER_SHOT });
  const bounds = await root.evaluate((el) => ({
    w: el.getBoundingClientRect().width,
    overflow: el.scrollWidth > el.clientWidth + 1,
    screen: el.querySelector('.supper-screen').getBoundingClientRect().height,
  }));
  assert.ok(
    bounds.w > 150 && !bounds.overflow && bounds.screen > 60,
    JSON.stringify(bounds),
  );
  await root.getByText('Look behind the curtain', { exact: true }).click();
  await cast('Near the cloth');
  await cast('Trace the edges in chalk');
  await root.getByText(/2 left, 2 right/).waitFor();
  await cast('Hang the pair');
  await cast('Middle lamp');
  await root.getByText(/3 left, 3 right/).waitFor();
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await button('Continue');
  await waitMap(room);
  await button('Continue playing');
  await use('supper-lamps');
  await root.getByText(/3 left, 3 right/).waitFor();
  await root.getByText('Look behind the curtain', { exact: true }).click();
  await cast('Middle stop');
  await cast('Hang one spoon');
  await cast('Show the lamplight');
  await cast('Shutters closed');
  await root.getByText(/no lit edge/).waitFor();
  await close();
  for (const [station, fragments] of Object.entries({
    book: ['where Kip stood', 'who added the noun'],
    pen: ['two outlines', 'dot where'],
    seal: ['toward the wick', 'quarter turn'],
    map: ['market corner', 'on foot'],
    deputy: ['tonight’s carrier'],
    pair: ['Nest the two'],
    scale: ['four little', 'two large'],
  })) {
    for (const fragment of fragments) await at('supper-' + station, fragment);
  }
  await at(
    'supper-tea',
    engine === 'webkit' ? 'waiting porter' : 'share it with Kip',
  );
  await at('supper-curtain', 'Thursday’s rail position');
  await at('supper-curtain', 'always need');
  for (const [light, phrase] of [
    ['Left lamp', 'left shutter'],
    ['Right lamp', 'right shutter'],
    ['Both side lamps', 'Overlay both'],
  ]) {
    await use('supper-lamps');
    await cast(light);
    await close();
    await at('supper-optics', phrase);
  }
  // Each branch is taken through its physical exit. Revisit the theatre to change the staging.
  for (const [route, phrase, receive, place] of [
    ['hall', 'Untie the bell', 'Hold the cloth', 'copies.landing'],
    ['kitchen', 'Draw the kitchen', 'Keep the type', 'copies.press'],
    [
      'booth',
      'Rig both shutters',
      'Leave both shutter pulls',
      'copies.archive',
    ],
  ]) {
    await at('supper-curtain', phrase);
    await use('supper-stair-' + route);
    await waitMap(place);
    await at('supper-' + route + '-reader', receive);
    assert.equal(
      await page.evaluate(
        (name) => kg.controller.state.flags['supper.read.' + name],
        route,
      ),
      true,
    );
    if (route !== 'booth') {
      if (place !== 'copies.landing') {
        await use('copies-press-to-landing');
        await waitMap('copies.landing');
      }
      await use('supper-hatch');
      await waitMap(room);
    }
  }
  await page.evaluate(() => kg.world.changeMap('aethelgard.emberford', 17, 21));
  await waitMap('aethelgard.emberford');
  await use('supper-market-later');
  for (const fragment of [
    'counterexample',
    'folded',
    'brightness',
    'wax impressions',
  ])
    await popup.getByRole('button', { name: new RegExp(fragment) }).waitFor();
  await button('wax impressions');
  await popup.getByText(/where to start asking/).waitFor();
  await close();
  console.log(
    engine,
    'all three supper endings, eight earlier possessions, reload at the near stop and both optics pegs',
  );
}
