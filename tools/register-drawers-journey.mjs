import assert from 'node:assert/strict';

// Seed only the arrival in a chapter. Every case, instrument, edition and collection action uses player controls.
export async function playRegisterDrawers({
  page,
  engine,
  start,
  count,
  posts,
  works,
  waitMap,
  use,
  button,
  close,
}) {
  assert.ok(Number.isInteger(start) && start >= 0 && start < works.length);
  assert.ok(
    Number.isInteger(count) && count > 0 && start + count <= works.length,
  );
  const receipt = [];
  let room = '';
  const panel = page.locator('.night-register');
  const dialog = page.getByRole('dialog');
  // An explicit low-motion setting is part of this batch. No specimen can begin inspected or earned.
  await page.evaluate(() => {
    kg.settings.reducedMotion = true;
    kg.settings.reducedEffects = true;
    kg.settings.zenMode = true;
  });
  for (let n = start; n < start + count; n++) {
    const record = works[n],
      site = posts[Math.floor(n / 68)],
      next = 'night-register.' + site.id;
    if (next !== room) {
      await page.evaluate(
        (site) => kg.world.changeMap(site.map, site.at[0], site.at[1] + 1),
        site,
      );
      await waitMap(site.map);
      // Main-chapter arrivals may carry an introduction or reading invitation. Acknowledge the room through its own controls.
      if (await dialog.isVisible()) {
        const enter = dialog.getByRole('button', {
          name: 'Go in',
          exact: true,
        });
        if (await enter.isVisible()) await enter.click();
        if (await dialog.isVisible()) await close();
      }
      await use(next + '.entrance');
      await waitMap(next);
      room = next;
    }
    await use('night-case-' + record.id);
    if (record.id === 163365)
      await dialog
        .getByRole('button', { name: 'Read the text', exact: true })
        .click();
    const take = dialog.getByRole('button', {
      name: 'Take this object',
      exact: true,
    });
    assert.equal(await take.count(), 0, 'before the trial ' + record.accession);
    const tools = panel.getByRole('combobox', { name: 'Choose a field tool' });
    const options = await tools
      .locator('option')
      .evaluateAll((options) => options.map((o) => o.value));
    const method =
      options[
        (n + ['chromium', 'firefox', 'webkit'].indexOf(engine)) % options.length
      ];
    await tools.selectOption(method);
    await button('Try the selected tool');
    await button('Set the whole record beside the trial');
    const whole = panel.locator('.night-views figcaption').last();
    assert.ok(
      (await whole.innerText()).includes(record.accession),
      'whole record ' + record.accession,
    );
    if (record.id !== 163365)
      await panel
        .locator('.night-views img')
        .last()
        .evaluate((image) => image.decode());
    else
      assert.equal(
        await panel.locator('.night-views img').count(),
        0,
        'text reading keeps the image closed',
      );
    const choice = (n + ['chromium', 'firefox', 'webkit'].indexOf(engine)) % 2;
    await panel.locator('.options button').nth(choice).click();
    await take.click();
    const result = await page.evaluate(({ id, accession }) => {
      const s = kg.controller.state,
        ex = kg.controller.pack.exhibits.find(
          (o) => o.id === 'OBJ-NIGHT-' + id,
        );
      return {
        owned: s.inventory['item.specimen.' + ex.specimen.key],
        finished: s.objectivesDone.includes('night.work.' + id),
        method: s.flags['night.job.' + id + '.method'],
        first: s.flags['night.job.' + id + '.sent'],
        record: ex.specimen.accession === accession,
      };
    }, record);
    assert.deepEqual(
      result,
      { owned: 1, finished: true, method, first: choice, record: true },
      'collection receipt ' + record.accession,
    );
    assert.equal(
      await take.count(),
      0,
      'cannot take a second copy ' + record.accession,
    );
    await panel
      .locator('.options button')
      .nth(1 - choice)
      .click();
    receipt.push([
      'item.specimen.nga:' + record.accession.toLowerCase(),
      record.id,
      method,
      1 - choice,
      room,
    ]);
    await close();
    console.log(
      'DRAWER',
      engine,
      n,
      record.id,
      record.accession,
      method,
      choice,
    );
  }
  // Reload the real local Continue slot, then establish that all earned objects and their readings coexist.
  await page.reload({ waitUntil: 'domcontentloaded' });
  const resume = page.getByRole('button', { name: /^Continue\b/ }).first();
  await resume.focus({ timeout: 90000 });
  await resume.press('Enter', { timeout: 90000 });
  await waitMap(room);
  const recovered = await page.evaluate((rows) => {
    const s = kg.controller.state;
    const entries = new Set(
      s.adventureDiary.entries.map((entry) => entry.event?.key),
    );
    return rows.every(
      ([key, id, method, choice, room]) =>
        [0, 1].every((branch) =>
          entries.has(room + ':send:' + id + '.' + branch),
        ) &&
        s.inventory[key] === 1 &&
        s.objectivesDone.includes('night.work.' + id) &&
        s.flags['night.job.' + id + '.method'] === method &&
        s.flags['night.job.' + id + '.sent'] === choice,
    );
  }, receipt);
  assert.equal(recovered, true);
  console.log('DRAWERS-RECOVERED', engine, start, count, room);
}
