import assert from 'node:assert/strict';

export async function playMakerField({ page, engine, waitMap, use, close }) {
  const move = async (map, x, y) => {
    await page.evaluate(([map, x, y]) => kg.world.changeMap(map, x, y), [map, x, y]);
    await waitMap(map);
  };
  await move('aethelgard.ferry', 1, 4);
  await use('clay-bank');
  await use('reeds-ferry');
  await move('aethelgard.emberford', 19, 18);
  await use('ore-vein');
  await use('reeds-bridge');
  const checks = [
    ['rain-gauge', 'reading-rain'],
    ['plumb-line', 'reading-tower'],
    ['reed-pen', 'reading-flood'],
  ];
  const ctl = (key) => page.locator('[data-maker="' + key + '"]');
  const checked = async (key) => {
    await ctl(key).focus();
    await page.keyboard.press('Space');
    await ctl(key).waitFor();
    assert.equal(await ctl(key).evaluate((el) => el === document.activeElement), true, key);
  };
  for (const [i, [tool, prop]] of checks.entries()) {
    const m = (i + ['chromium', 'webkit', 'firefox'].indexOf(engine)) % 2;
    await use('makers-bench');
    const card = page.locator('[data-maker-tool="' + tool + '"]');
    await card.click();
    await ctl('mount' + m).click();
    await checked('sample' + m);
    assert.equal(await ctl('fit0').count(), 0);
    await checked('sample' + (1 - m));
    assert.equal(await page.locator('.maker-imprint').count(), 2);
    await checked('fit' + m);
    if (process.env.KG_MAKER_SHOT && i === 0)
      await page.getByRole('dialog').screenshot({ path: process.env.KG_MAKER_SHOT });
    await ctl('back').focus();
    await page.keyboard.press('Space');
    assert.equal(await card.evaluate((el) => el === document.activeElement), true);
    await close();
    for (const recipient of [0, 1]) {
      await use(prop);
      if (!recipient) {
        await checked('observe1');
        assert.equal(await ctl('hand0').count(), 0);
        await checked('observe0');
        if (tool !== 'reed-pen') {
          await checked('shade0');
          await checked('shade1');
          await page
            .getByRole('dialog')
            .getByText(tool === 'rain-gauge' ? /8 to 10 mm/ : /-1 to 1 finger-widths/)
            .first()
            .waitFor();
        }
      }
      const label = await ctl('hand' + recipient).innerText();
      await checked('hand' + recipient);
      await close();
      await use('lamp-wall');
      const result = page.locator('details').filter({ has: page.locator('summary', { hasText: label }) });
      await result.locator('summary').click();
      assert.ok((await result.locator('p').innerText()).length > 60);
      await close();
    }
    console.log(engine, tool, 'both handovers visible at the Lamp Wall');
  }
  const total = await page.evaluate(() => kg.controller.state.flags['count.readings']);
  assert.equal(total, 3);
}
