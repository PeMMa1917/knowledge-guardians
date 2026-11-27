import assert from 'node:assert/strict';

// Chapter access is staged. Inside each room the player targets the peg and operates the visible tool.
export async function playPocketCoat({ page, engine, posts, sites, people, waitMap, use, close, button }) {
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
    const site = sites.find((s) => s.id === p.id);
    const guest = people.find((person) => person.id === site.pair.guests[0]);
    if (i === 0) {
      await page.evaluate((post) => kg.world.changeMap(post.map, post.at[0], post.at[1] + 1), p);
      await waitMap(p.map);
      await use('ink-post.' + site.id);
      await button('call a guest to the lantern');
      await page.getByRole('searchbox').fill(guest.name);
      await button(guest.name + ' ·');
      for (const piece of [0, 2]) await page.locator('[data-lantern-piece="' + piece + '"]').click();
      await button(guest.folds[0].action);
      await close();
      await use('lamplight.' + site.id + '.bench');
      await button(guest.name + ' ·');
      await button(site.uses[1].action);
      await close();
    }
    await open(p.id, true);
    if (i === 0) {
      await control('slip1').click();
      await panel
        .getByText('On the next pocket: ' + guest.name, { exact: false })
        .first()
        .waitFor();
    }
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
    if (i === 0) {
      await control('leaf-loose').click();
      assert.equal(await control('margin-limit').count(), 0);
      await control('leaf-other').click();
      await control('margin-alongside').click();
      await control('margin-limit').click();
      await close();
      await open(p.id);
      await panel.getByRole('heading', { name: /The keeper wrote back about/ }).waitFor();
      await close();
      await open(target);
    }
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
