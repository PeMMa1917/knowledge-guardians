import assert from 'node:assert/strict';

export async function playFirstPerches({
  page,
  engine,
  use,
  button,
  waitMap,
  close,
}) {
  const panel = page.getByRole('dialog');
  const go = async (map, x, y) => {
    await page.evaluate(
      ([map, x, y]) => window.kg.world.changeMap(map, x, y),
      [map, x, y],
    );
    await waitMap(map);
  };
  const val = (key) =>
    page.evaluate((k) => kg.controller.state.flags[k] ?? null, key);
  const inside = (name) =>
    panel.getByRole('button', { name, exact: true }).last();
  const setup = async (home, first = false) => {
    await use('lor-' + home);
    if (!first)
      await panel
        .getByText('Try another resting place', { exact: true })
        .click();
    const tool = panel.locator('.moth-perch');
    await tool
      .getByRole('combobox', { name: 'Perch lining' })
      .selectOption('glass');
    await tool
      .getByRole('combobox', { name: 'Lamp shutter' })
      .selectOption('open');
    await inside('Set the perch and stand back').click();
    assert.match(await tool.getByRole('status').innerText(), /feet never meet/);
    await tool
      .getByRole('combobox', { name: 'Perch lining' })
      .selectOption('cuff');
    assert.equal(await inside('Leave a resting place here').isDisabled(), true);
    await inside('Set the perch and stand back').click();
    assert.match(await tool.getByRole('status').innerText(), /loose thread/);
    assert.ok(
      await tool
        .locator('img')
        .evaluate((el) => el.complete && el.naturalWidth > 0),
    );
    await inside('Leave a resting place here').click();
    assert.equal(await val('moth.perch.home'), home);
    await close();
  };
  await use('lor-lamp');
  await close();
  await setup('desk', true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await button('Continue');
  await waitMap('nexus.archive');
  await panel.getByRole('button', { name: 'Continue playing', exact: true }).press('Enter');
  assert.equal(await val('moth.perch.home'), 'desk');
  for (const [home, map, x, y, a, act, b, other] of [
    [
      'desk',
      'stage.foyer',
      12,
      12,
      'ribbon',
      'Run a cue ribbon',
      'pause',
      'Give the waiting player',
    ],
    [
      'case',
      'preserved.archive',
      13,
      12,
      'seal',
      'Record what the intact seal',
      'copy',
      'Send the keeper',
    ],
    [
      'lamp',
      'forest.station',
      12,
      12,
      'edge',
      'Leave a hooded gap',
      'touch',
      'Tie the direction',
    ],
  ]) {
    if (home !== 'desk') {
      await go('nexus.archive', 8, 9);
      await setup(home);
    }
    await go(map, x, y);
    await use('moth-work-' + home);
    await button(act);
    await inside('Close').click();
    await use('moth-receipt-' + home + '-' + a);
    await button('Try another arrangement');
    await button(other);
    await inside('Close').click();
    assert.equal(await val('moth.return.' + home), b);
    await use('moth-receipt-' + home + '-' + b);
    await button('Leave this arrangement');
  }
  await go('aethelgard.emberford', 18, 21);
  await use('emberford.tally');
  const tray = panel.locator('.bakery-panel');
  await tray.locator('summary').click();
  for (const [name, count] of [
    ['Six small loaves', 6],
    ['Three large loaves', 3],
  ]) {
    await inside(name).click();
    await inside('Weigh the remaining tray').click();
    assert.equal(await tray.locator('.tally-weight').count(), 6);
    await inside('Leave one loaf at the next door').click();
    await inside('Weigh the remaining tray').click();
    assert.equal(await tray.locator('.tally-weight').count(), 6 - 6 / count);
    for (let i = 1; i < count; i++)
      await inside('Leave one loaf at the next door').click();
    assert.equal(
      await inside('Leave one loaf at the next door').isDisabled(),
      true,
    );
    assert.equal(await tray.locator('.tally-door .tally-loaf').count(), count);
    await inside('Bring one loaf back').click();
  }
  await close();
  await use('villager-1');
  await button('Any news in the market');
  await button('Where did Idris');
  await inside('Close').click();
  await use('porter-idris');
  await inside('Close').click();
  await use('stallkeeper-hana');
  await button('Follow the four');
  await inside('Close').click();
  await use('rumour-chalk');
  await button('Unfold the wet');
  await inside('Close').click();
  await use('record-book');
  await close();
  await use('villager-1');
  await button('I found where');
  await button('Unfold the four');
  await button('Continue');
  await inside('Close').click();
  assert.equal(await val('rumour.edition'), 'margin');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await button('Continue');
  await waitMap('aethelgard.emberford');
  await button('Continue playing');
  const entries = await page.evaluate(() =>
    kg.controller.state.adventureDiary.entries.map((e) => e.event?.key),
  );
  assert.ok(entries.includes('conversation:rumour.after.margin'));
  assert.ok(entries.includes('moth-perch:home:lamp'));
  assert.ok(entries.some((k) => k?.startsWith('tally-tray:large:')));
  const done = await page.evaluate(() => kg.controller.state.objectivesDone);
  assert.ok(done.includes('emberford.tally.weigh'));
  assert.ok(done.includes('rum.o4.tell'));
  await go('aethelgard.ferry', 12, 9);
  await use('ferry-guest-book');
  await panel.getByText('How the model fills a boat', { exact: true }).click();
  assert.match(await panel.innerText(), /independently from 365/);
  await button('Open the book for the first boat');
  await button('Read the next twenty boats');
  await panel
    .getByText('Turn over Tova’s counting slip', { exact: true })
    .click();
  assert.match(await panel.innerText(), /253 distinct pairs/);
  await close();
  console.log(
    'CHAPTER-PERCHES',
    engine,
    'three homes, six receivers, two weighed trays, four dependent witnesses, two reloads',
  );
}
