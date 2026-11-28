import assert from 'node:assert/strict';

// Navigate to the chapter as a fixture. Both doors, the perches, the cases and all handovers use the player's controls.
export async function playNightRegister({ page, engine, posts, works, waitMap, use, button, close, trails }) {
  const register = (p) => 'night-register.' + p.id;
  const panel = page.locator('.night-register');
  async function enter(p) {
    if ((await page.evaluate(() => kg.world.map.id)) !== p.map) {
      await page.evaluate((p) => kg.world.changeMap(p.map, p.at[0], p.at[1] + 1), p);
      await waitMap(p.map);
    }
    await use(register(p) + '.entrance');
    await waitMap(register(p));
  }
  async function exit(p) {
    await use(register(p) + '.back');
    await waitMap(p.map);
  }
  const home = posts[0],
    work = works[0];
  await enter(home);
  await use('warden-ise');
  await page
    .getByText(/fifteen hooks and fourteen keys/)
    .first()
    .waitFor();
  await close();
  await use(register(home) + '.desk');
  await panel.getByText('A picture loose from its sleeve', { exact: true }).click();
  await button('Follow a loose plate');
  await panel.getByText(/Row 1 from the north wall/).waitFor();
  await close();
  await use(register(home) + '.perch');
  await button('Button · Margin hare');
  await button('Wait by Button');
  await button('Lower a shade at the left');
  await close();
  await page.waitForFunction(() => kg.world.pet?.id === 'archive-left');
  await use('night-case-' + work.id);
  assert.equal(await page.getByRole('button', { name: 'Take this object' }).count(), 0);
  await button('Stitch the caption to the sleeve');
  await button('Button · Bring the left edge close');
  await page.waitForFunction(() => document.querySelector('.night-left img')?.naturalWidth > 0);
  await button('Set the whole record beside the trial');
  await panel
    .getByText(new RegExp(work.accession.replaceAll('.', '\\.')))
    .first()
    .waitFor();
  await button('Lower the reading frame');
  await button('Take this object');
  await button('Pack this reading for another chapter');
  await panel.getByRole('combobox').selectOption('date');
  await button('Try the selected tool');
  await button('Set the whole record beside the trial');
  await button('Send a pocket copy upstairs');
  await close();
  await exit(home);
  const shift = ['chromium', 'firefox', 'webkit'].indexOf(engine);
  const destinations = posts.filter((p, i) => i > 0 && (i - 1) % 3 === shift);
  for (const [i, p] of destinations.entries()) {
    await enter(p);
    await use(register(p) + '.desk');
    if (i > 0) await button('Ask Button for ' + work.title);
    const hand = panel
      .getByText('Holding ' + work.title, { exact: false })
      .locator('..')
      .getByRole('button');
    await hand.nth(i % 2).click();
    await panel.getByText('The travelling copy preserves', { exact: false }).waitFor();
    assert.match(await panel.innerText(), /A small reader turns the frame/);
    for (const label of [
      'Listen to the receiving keeper',
      'Unseal the travelling record',
      'Read the latest word from home',
    ])
      await button(label);
    await panel.getByText('Stay after closing with ', { exact: false }).click();
    await panel
      .locator('details[open]')
      .getByRole('button')
      .nth(i % 2)
      .click();
    assert.ok(
      await page.evaluate(
        (id) => [0, 1].includes(kg.controller.state.flags['night-register.' + id + '.favour']),
        p.id,
      ),
    );
    if (i === 0 && process.env.KG_CAPTURES)
      await page.screenshot({ path: process.env.KG_CAPTURES + '/' + engine + '-reading.png' });
    if (i === 2) {
      await button('Pass the pencil to the first helper');
      await panel.getByText('The signed register', { exact: true }).click();
      assert.equal(await panel.getByText(/signed for/).count(), 3);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await close();
    await exit(p);
  }
  const trail = trails.find((t) => t.friend === 'archive-left');
  const away = works.find((w) => w.id === trail.away);
  const destination = posts[Math.floor(works.indexOf(away) / 68)];
  await enter(destination);
  await use('night-case-' + away.id);
  await button('Button · Bring the left edge close');
  await button('Set the whole record beside the trial');
  await panel.locator('.options button').first().click();
  await close();
  await exit(destination);
  await enter(home);
  await use(register(home) + '.perch');
  await button('Button · Margin hare');
  await panel.getByText('Button’s two-frame trail', { exact: true }).click();
  await panel.getByText('Both frames open together here.', { exact: false }).waitFor();
  const pictures = panel.locator('details[open] img');
  assert.equal(await pictures.count(), 2);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('.night-register details[open] img')).every(
      (img) => img.naturalWidth > 0,
    ),
  );
  assert.match(await panel.innerText(), new RegExp(away.maker));
  if (process.env.KG_CAPTURES)
    await page.screenshot({ path: process.env.KG_CAPTURES + '/' + engine + '-trail.png' });
  await close();
}
