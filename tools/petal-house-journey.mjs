import assert from 'node:assert/strict';

export async function playPetalHouse({ page, engine, use, waitMap, close }) {
  const dialog = page.getByRole('dialog'),
    house = 'forest.petal-house';
  async function choose(name) {
    const b = dialog
      .getByRole('button', { name, exact: typeof name === 'string' })
      .first();
    await b.focus();
    await b.press('Enter');
  }
  const flag = (name) =>
    page.evaluate(
      (key) => kg.controller.state.flags['petal-window.' + key],
      name,
    );
  const move = async (map, x, y) => {
    await page.evaluate(
      ([m, a, b]) => kg.world.changeMap(m, a, b),
      [map, x, y],
    );
    await waitMap(map);
  };
  const resume = async (map) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    const next = page.getByRole('button', { name: /^Continue\b/ }).first();
    await next.focus();
    await next.press('Enter');
    await waitMap(map);
    await choose('Continue playing');
    await dialog.waitFor({ state: 'hidden' });
  };
  await move('forest.station', 20, 9);
  await use('petal-house-door');
  await waitMap(house);
  await use('petal-dancer');
  await choose(/put a bee on your thumb/i);
  await close();
  await use('petal-window');
  for (const pane of ['Slide in daylight', 'Slide in ultraviolet']) {
    await choose(pane);
    await choose('Keep the Hem slip');
    await choose('Keep the Cuff slip');
  }
  await choose('Gain ×4');
  await choose('Keep the Hem slip');
  await choose('Keep the Cuff slip');
  await resume(house);
  await use('petal-window');
  assert.equal(
    await dialog
      .getByRole('button', { name: 'Gain ×4' })
      .getAttribute('aria-pressed'),
    'true',
  );
  await choose('Gain ×1');
  await choose('Keep the Hem slip');
  await choose('Keep the Cuff slip');
  assert.equal(await dialog.locator('.petal-crop span').count(), 32);
  await dialog
    .getByText('Read the four rows for Cuff', { exact: true })
    .click();
  assert.ok(
    (await dialog
      .getByText('Row 1 · 62, 13, 14, 62', { exact: true })
      .count()) > 0,
  );
  const fit = await dialog
    .locator('.petal-bench')
    .evaluate((el) => ({ w: el.clientWidth, scroll: el.scrollWidth }));
  assert.ok(fit.scroll <= fit.w + 1, JSON.stringify(fit));
  if (process.env.KG_PETAL_SHOT)
    await page.screenshot({ path: process.env.KG_PETAL_SHOT });
  await close();
  await use('petal-ledge');
  await choose('Unroll this morning watch');
  await choose('Set Hem by the door');
  await choose('Unroll this morning watch');
  assert.equal(await dialog.locator('ol li').count(), 3);
  await close();
  for (const [ending, audience] of [
    ['silk', 'stage.rehearsal'],
    ['garden', 'forest.community'],
  ]) {
    await use('petal-stage');
    await choose(
      ending === 'silk' ? 'Give Viri both silk wings' : 'Open the garden stage',
    );
    assert.equal(await flag('ending'), ending);
    await close();
    if (ending === 'silk') {
      await use('petal-gears');
      for (const r of [
        'Painted name tags',
        'Three shade marks',
        'Two clock faces',
        'Dark-square counters',
      ]) {
        await choose(r);
        await choose('Pull the little theatre handle');
        await choose('Turn the paper roller over');
        await choose('Pull the little theatre handle');
      }
      await choose('Send the ribbons into the wings');
      assert.equal(await flag('gear.sent'), 'wings');
      await close();
    }
    await use('petal-' + ending + '-door');
    await waitMap(audience);
    await use('petal-' + ending + '-seats');
    await choose(
      ending === 'silk'
        ? 'Give the understudy one wire'
        : 'Save the first bench for a child',
    );
    await close();
    await use('petal-' + ending + '-ribbons');
    if (ending === 'silk') {
      await choose('The first bee will land on Cuff.');
      await resume(audience);
      await use('petal-silk-ribbons');
      await choose('Unfold the dated watch');
      assert.equal(
        await dialog
          .getByRole('button', { name: 'The first bee will land on Cuff.' })
          .isDisabled(),
        true,
      );
      await choose('Hold the wing still for a count');
    } else {
      await choose('17:10 curtain');
      await choose('The first bee will land on Cuff.');
      await choose('Unfold the dated watch');
      assert.ok((await dialog.textContent()).includes('exception'));
      await choose('Let the silk bee cross to the other flower');
    }
    await close();
    await move('forest.station', 20, 9);
    await use('petal-house-door');
    await waitMap(house);
  }
  // The Metalworks commission is complete on arrival for this return journey.
  // Claim the actual accession and carry it through the same commands as the case.
  await page.evaluate(() => {
    const c = kg.controller,
      key = 'cma:1955.320';
    const ex = c.pack.exhibits.find((o) => o.specimen?.key === key);
    c.state.objectivesDone.push(ex.specimen.objective);
    for (const cmd of [
      { type: 'InspectExhibit', exhibit: ex.id },
      { type: 'ClaimSpecimen', exhibit: ex.id },
      { type: 'EquipPerspective', keepsake: 'specimen.' + key },
    ]) {
      const error = c.dispatch(cmd).find((e) => e.kind === 'error');
      if (error) throw Error(error.message);
    }
  });
  for (const prompt of [
    /Hinge the artist/,
    /Slide the 1771/,
    /Bring the two stops/,
  ]) {
    await use('petal-engraving');
    await choose(prompt);
    await close();
  }
  await use('petal-merian');
  await choose(/Frame all three/);
  await close();
  await use('petal-garden-door');
  await waitMap('forest.community');
  await use('petal-merian');
  await choose(/Bring the dancer out first/);
  await close();
  assert.equal(await flag('plate.return.hand'), true);
  const result = await page.evaluate(() => ({
    goals: kg.controller.state.objectivesDone.filter((id) =>
      id.startsWith('petal.'),
    ),
    events: kg.controller.state.adventureDiary.entries.filter((e) =>
      e.event?.key.startsWith('petal-ribbon:'),
    ).length,
  }));
  for (const id of [
    'windows',
    'ceiling',
    'ledge',
    'curtain',
    'encore',
    'gears',
    'ribbons',
    'plate',
    'second-page',
  ])
    assert.ok(result.goals.includes('petal.' + id), JSON.stringify(result));
  assert.ok(result.events >= 6);
  console.log('PETAL-HOUSE', engine, JSON.stringify(result));
}
