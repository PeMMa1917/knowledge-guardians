import assert from 'node:assert/strict';

// Chapter access is staged. Inside each room the player targets the peg and operates the visible tool.
export async function playPocketCoat({ page, engine, posts, waitMap, use, close }) {
  const destinations = {
    archive: 'press',
    nile: 'market',
    cold: 'yard',
    coast: 'chart',
    fern: 'cold',
    yard: 'stage',
    press: 'voices',
    chart: 'gate',
    stage: 'archive',
    market: 'nile',
    gate: 'dispatch',
    dispatch: 'council',
    voices: 'fern',
    island: 'coast',
    council: 'island',
  };
  const group = ['chromium', 'firefox', 'webkit'].indexOf(engine);
  const selected = posts.filter((_, i) => i % 3 === group);
  const panel = page.locator('.coat-panel');
  const control = (id) => panel.locator('[data-coat-focus="' + id + '"]');
  async function open(id, throughDoor = false) {
    const room = 'night-register.' + id;
    if (throughDoor) {
      const site = posts.find((p) => p.id === id);
      await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), site);
      await waitMap(site.map);
      await use(room + '.entrance');
    } else await page.evaluate((id) => kg.world.changeMap(id, 16, 24), room);
    await waitMap(room);
    await use(room + '.coat');
    await panel.waitFor();
  }
  for (const [i, p] of selected.entries()) {
    await open(p.id, true);
    await control('pull').click();
    assert.equal(await control('sew0').count(), 0);
    await control('fit0').selectOption('1');
    await control('pull').click();
    await control('fit1').selectOption('1');
    await control('pull').click();
    if (p.id === 'yard' || p.id === 'stage')
      await panel.getByRole('button', { name: 'Hear this impression' }).click();
    await control('sew' + (i % 2)).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await close();
    const target = destinations[p.id];
    await open(target);
    await control('read').click();
    await control('counter0').click();
    await control('counter1').click();
    assert.equal(await panel.locator('details[open] .coat-paper').count(), 2);
    if (i === 2) {
      await control('ending0').click();
      await control('ending1').click();
      await panel.getByText('The impressions inside this ending', { exact: true }).click();
      assert.equal(
        await panel
          .getByText('The impressions inside this ending', { exact: true })
          .locator('..')
          .locator('p')
          .count(),
        3,
      );
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (i === 0 && process.env.KG_CAPTURES)
      await page.screenshot({ path: process.env.KG_CAPTURES + '/' + engine + '-pocket.png' });
    await close();
    console.log(engine, p.id, 'to', target, 'returned both contrasts');
  }
}
