import assert from 'node:assert/strict';

export async function playPlumOrchard({
  page,
  engine,
  use,
  button,
  waitMap,
  close,
}) {
  const room = 'stage.plum-loft',
    dialog = page.getByRole('dialog');
  const book = 'perkins:procede-1829';
  // Arrive with a single object earned elsewhere. All four performance endings begin unplayed.
  await page.evaluate((key) => {
    kg.settings.reducedMotion = true;
    const c = kg.controller;
    c.state.inventory['item.specimen.' + key] = 1;
    c.state.flags['specimen.carried.' + key] = true;
    c.state.flags['keepsake.specimen.' + key] = true;
    c.dispatch({ type: 'EquipPerspective', keepsake: 'specimen.' + key });
    kg.world.changeMap('stage.rehearsal', 18, 11);
  }, book);
  await waitMap('stage.rehearsal');
  if (await dialog.isVisible()) await close();
  await use('plum-stair');
  await waitMap(room);
  const flags = async (key) =>
    page.evaluate((k) => kg.controller.state.flags[k] ?? null, 'plum.' + key);
  async function choose(id, text) {
    await use(id);
    await button(text);
    await dialog
      .getByRole('button', { name: 'Close', exact: true })
      .last()
      .click();
  }
  await choose('plum-fen', 'biscuit corners');
  await choose('plum-tallowheel', 'chewed a wheel');
  await use('plum-chest');
  const panel = dialog.locator('.plum-work'),
    report = panel.getByRole('status');
  async function operate(label) {
    const control = panel.getByRole('button', { name: label, exact: true });
    await control.focus();
    await page.keyboard.press('Enter');
    assert.equal(
      await control.evaluate((el) => el === document.activeElement),
      true,
    );
  }
  await operate('Press the stud');
  await report.getByText(/surface is solid/).waitFor();
  await operate('Trace the carving');
  await report.getByText(/two grooves/).waitFor();
  const visible = await panel.evaluate((el) => ({
    views: el.querySelectorAll('.plum-face').length,
    h: el.querySelector('.plum-stage').getBoundingClientRect().height,
    overflow: el.scrollWidth > el.clientWidth + 1,
  }));
  assert.equal(visible.views, 3);
  assert.ok(visible.h >= 75 && !visible.overflow, JSON.stringify(visible));
  if (process.env.KG_ORCHARD_SHOT)
    await page.screenshot({ path: process.env.KG_ORCHARD_SHOT });
  for (const drawer of engine === 'firefox'
    ? ['quiet', 'brass']
    : ['brass', 'quiet']) {
    await operate('Set the boot down facing me');
    await operate('Bring the right face forward');
    if (drawer === 'quiet') {
      await operate('Tip the top towards me');
      await operate('Tip the top towards me');
    }
    await operate(
      drawer === 'quiet' ? 'Set the short notch' : 'Set the long notch',
    );
    await operate('Slide the tongue');
    await operate('Tip the top towards me');
    await operate('Press the stud');
    assert.equal(
      await flags('open.' + (drawer === 'quiet' ? 'moon' : 'plum')),
      true,
    );
  }
  await close();
  await use('plum-drum');
  await operate('Knock the floorboard');
  await operate('Knock the floorboard');
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await button('Continue');
  await waitMap(room);
  await button('Continue playing');
  assert.equal(await flags('bar'), 'BB');
  await use('plum-drum');
  await operate('Knock the floorboard');
  await operate('Leave a rest');
  await report.getByText(/third comes at its own pace/).waitFor();
  for (let n = 0; n < 3; n++) await operate('Strike the suspended rim');
  await operate('Leave a rest');
  await report.getByText(/felt under the drum/).waitFor();
  await close();
  await choose('plum-tallowheel', 'own rest');
  await choose('plum-score', 'fixed three taps');
  await choose('plum-score', 'stretch the rest');
  await choose('plum-score', 'under both readings');
  await choose('plum-verse', 'under the three knocks');
  await choose('plum-verse', 'drop, plum, drop');
  await choose('plum-verse', 'meaning slip');
  await use('plum-mould');
  const mould = dialog.locator('.orchard-mould');
  for (const [surface, pressure] of [
    ['fresh', 'working'],
    ['worn', 'working'],
    ['worn', 'light'],
    ['fresh', 'heavy'],
  ]) {
    await mould
      .getByRole('combobox', { name: 'Mould', exact: true })
      .selectOption(surface);
    await mould
      .getByRole('combobox', { name: 'Hand pressure' })
      .selectOption(pressure);
    await operate('Draw across both tabs');
    assert.equal(await mould.locator('.orchard-profiles ol li').count(), 14);
    assert.equal(await flags('mould.last'), surface + '.' + pressure);
  }
  await close();
  await choose('orchard-louis-braille', 'lighter draw');
  await choose('orchard-louis-braille', 'fresh practice mould');
  await choose('orchard-louis-braille', 'worn practice mould');
  await choose('orchard-louis-braille', 'two mould states');
  for (const [route, edition, action, stage, home] of [
    ['road', 'on wheels', 'under the cart', 'wheel', 'dent into the new wheel'],
    ['road', 'on wheels', 'on your shoulder', 'tree', 'leaf is printed'],
    [
      'roots',
      'into the clearing',
      'falling fruit',
      'fruit',
      'drawing pinned up',
    ],
    ['roots', 'into the clearing', 'sounding plank', 'plank', 'polished wood'],
  ]) {
    const road = route === 'road';
    await choose('plum-commission', edition);
    await use(road ? 'plum-road-door' : 'plum-root-trap');
    await waitMap(road ? 'stage.gallery' : 'forest.community');
    await choose(road ? 'plum-cart' : 'plum-grove', action);
    assert.equal(await flags(route + '.part'), stage);
    if (road) {
      await use('stage-gallery-to-rehearsal');
      await waitMap('stage.rehearsal');
      await use('plum-stair');
    } else {
      await use('plum-pia');
      if (stage === 'plank') await button('different version');
      await button(stage === 'plank' ? 'three-beat' : 'longer line');
      await dialog
        .getByRole('button', { name: 'Close', exact: true })
        .last()
        .click();
      assert.equal(
        await flags('pia.last'),
        stage === 'plank' ? 'short' : 'long',
      );
      await use('plum-orchard-return');
    }
    await waitMap(room);
    await use('plum-fen');
    await dialog.getByText(new RegExp(home)).waitFor();
    await close();
    await use('plum-tallowheel');
    await dialog
      .getByText(road ? /buy a ticket/ : /asked for an encore/)
      .waitFor();
    await close();
  }
  const state = await page.evaluate(() => {
    const s = kg.controller.state;
    return {
      jobs: s.objectivesDone.filter((x) => x.startsWith('plum.')).sort(),
      met: s.adventureDiary.entries.some((e) =>
        e.event?.sourceIds?.includes('HIS-READING-WORKS-PERKINS-PROCEDE'),
      ),
    };
  });
  assert.equal(state.jobs.length, 9, JSON.stringify(state));
  assert.equal(state.met, true);
  console.log(
    'ORCHARD-RECOVERED',
    engine,
    '24-pose instrument, two drawers, partial bar, two translations, source workshop, four performance returns',
  );
}
