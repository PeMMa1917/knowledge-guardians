import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';

export async function playRiverNames({ page, engine, use, waitMap, close }) {
  const edition = engine === 'webkit' ? 'walk' : engine === 'firefox' ? 'district' : 'window';
  const choice = { walk: 'guide', district: 'post', window: 'bread' }[edition];
  const d = page.getByRole('dialog'),
    panel = d.locator('.river-post');
  const get = (id) => panel.locator('[data-river="' + id + '"]');
  const press = async (id) => {
    const b = get(id);
    await b.focus();
    await b.press('Enter');
  };
  async function put(cell, direction) {
    if (engine === 'webkit') {
      const summary = panel.locator('summary').filter({ hasText: 'Walk by street directions' });
      if (!(await summary.evaluate((s) => s.parentElement.open))) await summary.click();
      await press('dir-' + direction);
    } else if (engine === 'firefox') {
      const end = panel.locator('.river-thread-end');
      await end.focus();
      await end.press(
        { north: 'ArrowUp', east: 'ArrowRight', south: 'ArrowDown', west: 'ArrowLeft' }[direction],
      );
      await page.keyboard.press('Enter');
    } else await get('cell-' + cell).click();
  }
  const mark = async (id) => {
    const b = d.locator('[data-mark="' + id + '"]');
    await b.focus();
    await b.press('Enter');
  };
  if (engine === 'webkit') await page.setViewportSize({ width: 320, height: 640 });
  await page.evaluate(() => kg.world.changeMap('sea.turning-room', 11, 12));
  await waitMap('sea.turning-room');
  await use('river-names-arch');
  await waitMap('sea.the-last-oven');
  await use('river-emlet');
  await d
    .getByText(/bite of fresh bread/i)
    .first()
    .waitFor();
  await close();
  await use('river-names-spool');
  await put(10, 'north');
  await put(11, 'east');
  await put(12, 'east');
  await press('walk');
  await press('hear');
  await press('offer-paired');
  await press('water-flood');
  await put(10, 'north');
  await press('walk');
  await panel.getByRole('status').filter({ hasText: 'Water covers' }).waitFor();
  await press('skate');
  await panel.getByRole('status').filter({ hasText: 'Reed Stair' }).waitFor();
  await press('clear');
  await put(16, 'east');
  await put(17, 'east');
  await put(18, 'east');
  await press('walk');
  await press('hear');
  await press('offer-pin');
  await panel.getByRole('status').filter({ hasText: 'lifts the pin' }).waitFor();
  await press('offer-paired');
  assert.ok(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'street spool width');
  await close();
  await use('river-names-leaves');
  await press('leaf-names');
  await press('leaf-plan');
  await close();
  await use('river-names-stamp');
  await press('scale-block');
  await press('simulate');
  await panel.getByRole('status').filter({ hasText: '1 possible receiving door' }).waitFor();
  await press('water-ebb');
  await press('simulate');
  await panel.getByRole('status').filter({ hasText: '2 possible receiving doors' }).waitFor();
  if (edition === 'district') {
    await press('scale-district');
    await press('simulate');
  }
  await close();
  await use('river-names-press');
  await press('issue-' + edition);
  await press('carry');
  await close();
  await use('river-names-fold-out');
  await mark('send');
  await close();
  await page.evaluate(() => kg.world.changeMap('water.gatehouse', 15, 16));
  await waitMap('water.gatehouse');
  await use('river-names-forwarding');
  await waitMap('water.letter-quay');
  await use('river-names-receive-' + edition);
  await press('receive');
  await press('share-' + choice);
  await close();
  await use('river-names-fold-in');
  await mark('read-ebb-stranger');
  await mark('read-flood-stranger');
  await d.getByRole('status').filter({ hasText: 'either landing' }).waitFor();
  await close();
  await page.evaluate(() => kg.world.changeMap('sea.the-last-oven', 12, 13));
  await waitMap('sea.the-last-oven');
  await use('river-names-fold-out');
  await mark('learn-ebb');
  await mark('learn-flood');
  await mark('press-gesture');
  await mark('send');
  await close();
  await page.evaluate(() => kg.world.changeMap('water.letter-quay', 12, 13));
  await waitMap('water.letter-quay');
  await use('river-names-fold-in');
  for (const tide of ['ebb', 'flood']) {
    await mark('read-' + tide + '-stranger');
    await d.getByRole('status').filter({ hasText: 'either landing' }).waitFor();
    await mark('read-' + tide + '-apprentice');
    await d.getByRole('status').filter({ hasText: 'This reader has learned' }).waitFor();
  }
  await close();
  await use('river-names-council');
  await press('leaf-partners');
  await press(engine === 'webkit' ? 'invite-one' : 'invite-two');
  await close();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: /^Continue\b/ })
    .first()
    .click();
  await waitMap('water.letter-quay');
  await d.getByRole('button', { name: 'Continue playing' }).click();
  await use('river-names-receive-' + edition);
  await panel
    .getByText(/Low water · West Rope → Reed Stair/)
    .first()
    .waitFor();
  await close();
  await page.keyboard.press('j');
  await d.getByRole('tab', { name: 'Diary', exact: true }).click();
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    d.getByRole('button', { name: 'Download journal (.docx)' }).click(),
  ]);
  const zip = unzipSync(new Uint8Array(await readFile(await file.path())));
  const text = strFromU8(zip['word/document.xml']),
    rel = strFromU8(zip['word/_rels/document.xml.rels']);
  assert.ok(text.includes('Rialla lifts the pin'));
  assert.ok(text.includes('Water covers Reed Stair'));
  assert.ok(text.includes('Water Commons'));
  assert.ok(text.includes('This reader has learned'));
  for (const expected of ['ihti.ca', 'kitikmeotheritage.ca', '10.1007/s13412-012-0086-8'])
    assert.ok(rel.includes(expected), expected);
  await close();
  console.log(
    'RIVER NAMES',
    engine,
    edition,
    'walked, repaired, returned, reopened and exported three credited sources.',
  );
}
